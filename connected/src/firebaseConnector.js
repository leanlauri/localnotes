/**
 * TODO: limit access to owner only
 * TODO: enable offline mode and listening to snapsnots
 * 
 * @flow
 */
import type {Note} from './notesReducer';
import type {State} from './notesReducer';

import config from './firebaseConfig.json';
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');
// declare var firebase: any;

type Status = 'none' | 'initialised' | 'init_failed';

let status: Status = 'none';
let db;
const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: 'http://localhost:3000/finishLogin/',
    //url: 'https://www.example.com/finishSignUp?cartId=1234',
    // This must be true.
    handleCodeInApp: true,
    // iOS: {
    //   bundleId: 'com.example.ios'
    // },
    // android: {
    //   packageName: 'com.example.android',
    //   installApp: true,
    //   minimumVersion: '12'
    // },
    // dynamicLinkDomain: 'example.page.link'
};

function init() {
    // if (firebase) {
    console.log('Initialising Firebase');
    firebase.initializeApp(config);
    initDb();
    status = 'initialised';
    // } else {
    //     console.log('Firebase script not loaded. Cannot initialise.');
    //     status = 'init_failed';
    // }
}

function initDb() {
    // var db = firebase.firestore();
    db = firebase.firestore();
    db.enablePersistence()
        .catch(function(err) {
            console.error('Firestore: Failed to enable offline persistence:', err && err.code);
            // if (err.code == 'failed-precondition') {
            //     // Multiple tabs open, persistence can only be enabled
            //     // in one tab at a a time.
            //     // ...
            // } else if (err.code == 'unimplemented') {
            //     // The current browser does not support all of the
            //     // features required to enable persistence
            //     // ...
            // }
        });
}

function connect(): boolean {
    if (status === 'none') init();
    if (status === 'init_failed') {
        console.error('Connect failed.');
        return false;
    }

    return true;
}

// const createActionCodeSettings = (sessionId: string) => ({
//     ...actionCodeSettingsBase,
//     url:  actionCodeSettingsBase.url + sessionId,
// });

function startLogin(email: string): Promise<any> {
    if (!connect()) return new Promise((resolve, reject) => reject(new Error('Cannot connect')));

    return firebase
        .auth()
        .sendSignInLinkToEmail(email, actionCodeSettings);
        // .then(function() {
        //     // The link was successfully sent. Inform the user.
        //     // Save the email locally so you don't need to ask the user for it again
        //     // if they open the link on the same device.
        //     window.localStorage.setItem('emailForSignIn', email);
        // })
        // .catch(function(error) {
        //     // Some error occurred, you can inspect the code: error.code
        // });
}

// const address = window.location.href;
function finishLogin(address: string, email: string): Promise<any> {
    // Confirm the link is a sign-in with email link.
    if (firebase.auth().isSignInWithEmailLink(address)) {
        // Additional state parameters can also be passed via URL.
        // This can be used to continue the user's intended action before triggering
        // the sign-in operation.
        // Get the email if available. This should be available if the user completes
        // the flow on the same device where they started it.
        // var email = window.localStorage.getItem('emailForSignIn');
        // if (!email) {
        // // User opened the link on a different device. To prevent session fixation
        // // attacks, ask the user to provide the associated email again. For example:
        // email = window.prompt('Please provide your email for confirmation');
        // }
        // The client SDK will parse the code from the link for you.
        return firebase
            .auth()
            .signInWithEmailLink(email, window.location.href);
            // .then(function(result) {
            //     // Clear email from storage.
            //     window.localStorage.removeItem('emailForSignIn');
            //     // You can access the new user via result.user
            //     // Additional user info profile not available via:
            //     // result.additionalUserInfo.profile == null
            //     // You can check if the user is new or existing:
            //     // result.additionalUserInfo.isNewUser
            // })
            // .catch(function(error) {
            //     // Some error occurred, you can inspect the code: error.code
            //     // Common errors could be invalid email and invalid or expired OTPs.
            // });
    } else {
        return new Promise((resolve, reject) => {
            reject(new Error('Address is not a valid login link'));
        });
    }
}

function logout(): Promise<any> {
    return firebase.auth().signOut();
}

// TODO: should be promise
function sync(state: State, dispatch): Promise<any> {
    if (!db) {
        console.error('DB not initialised');
        return new Promise((resolve, reject) => reject(new Error('DB not initialised')));
    }

    return retrieveNotes(state.notes, dispatch)
        .then(() => {
            return sendNotes(state.notes, dispatch);            
        });
}

function listenToChanges(state: State, dispatch) {
    if (!db) {
        console.error('DB not initialised');
        return;
    }

    db.collection('notes')
        .onSnapshot({}, (snapshot) => {
            snapshot.docChanges().forEach(function(change) {
                console.log('change.type', change.type);
                if (change.type === 'added') {
                    console.log("New note: ", change.doc.data());
                    storeNoteLocally(change.doc.id, change.doc.data(), dispatch);
                } else if (change.type === 'updated') { // TODO: check if correct
                    console.log("Updated note: ", change.doc.data());
                    updateNoteLocally(change.doc.id, change.doc.data(), dispatch);
                } 
                // TODO: remove doc event

                // var source = snapshot.metadata.fromCache ? "local cache" : "server";
                // console.log("Data came from " + source);
            });
        });

}

function retrieveNotes(localNotes: Array<Note>, dispatch): Promise<any> {
    return db.collection('notes').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const remoteData = doc.data();
            console.log(`${doc.id} =>`, remoteData);
            const localNote = localNotes.find((note) => note.id === doc.id);
            if (localNote) {
                // TODO: rather than overwrite local data, add more complex logic to consolidate changes
                updateNoteLocally(doc.id, remoteData, dispatch);
            } else {
                storeNoteLocally(doc.id, remoteData, dispatch);
            }
        });
    });
}

function sendNotes(notes: Array<Note>, dispatch): Promise<any> {
    return Promise.all(
        notes.map((note) => {
            if (note.id.startsWith('local:')) {
                return storeNoteRemotely(note, dispatch);
            } else return new Promise((resolve, reject) => resolve());
        })
    );
}

function updateNoteLocally(id, data, dispatch) {
    dispatch({
        type: 'modifyNote',
        id: id,
        content: {
            title: data.title,
            body: data.body,
        }
    });
}

function storeNoteLocally(id, data, dispatch) {
    dispatch({
        type: 'addNote',
        content: {
            id: id,
            title: data.title,
            body: data.body,
        }
    });
}

function storeNoteRemotely(note, dispatch): Promise<any> {
    return db.collection('notes').add({
        title: note.title,
        body: note.body,
    })
    .then(function(docRef) {
        console.log("Document written with ID: ", docRef.id);
        // modify local id to match cloud id
        dispatch({
            type: 'modifyNote',
            id: note.id,
            content: {
                id: docRef.id,
                title: note.title,
                body: note.body, 
            }
        })
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });

}

export default {
    connect,
    startLogin,
    finishLogin,
    logout,
    sync,
    listenToChanges,
};
