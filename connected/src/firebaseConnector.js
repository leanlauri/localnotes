/**
 * TODO: limit access to owner only
 * 
 * @flow
 */
import type {Note} from './notesReducer';
import type {State, ConnectState} from './notesReducer';

import config from './firebaseConfig.json';
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');

// let status: Status = 'none';
let db;
let user;
const actionCodeSettings = {
    // URL you want to redirect back to. The domain (www.example.com) for this
    // URL must be whitelisted in the Firebase Console.
    url: 'http://localhost:3000/finishLogin/',
    handleCodeInApp: true,
};

// function getStatus(): Status {
//     return status;
// }

function setConnectState(connectState: ConnectState, dispatch: Function) {
    dispatch({
        type: 'setConnectState',
        connectState,
    });
}

async function init(state: State, dispatch: Function): Promise<any> {
    if (state.connectState === 'inProgress' || state.connectState === 'loggedIn') return;
    if (firebase.apps.length) return;
    // if (state.connectState === 'initialised') return addUserStateListener(state, dispatch);
    setConnectState('inProgress', dispatch);
    // if (firebase) {
    console.log('Initialising Firebase');
    firebase.initializeApp(config);
    // user = firebase.auth.currentUser;
    // console.log('user', user);
    // if (!user) {
    //     status = 'initFailed';
    //     return;
    // }
    initDb();
    setConnectState('initialised', dispatch);
    // status = 'initialised';
    return await addUserStateListener(state, dispatch);
}

async function addUserStateListener(state: State, dispatch: Function): Promise<any> {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged((userObject) => {
            console.log('authStateChanged, user:', userObject);
            if (userObject) {
                user = userObject;
                dispatch({type: 'completeLogin'});
                resolve(user);
                // setConnectState('loggedIn', dispatch);
            } else {
                user = null;
                setConnectState('loginFailed', dispatch);
                resolve(null);
            }
        })
    });
}

function initDb() {
    db = firebase.firestore();
    db.enablePersistence()
        .catch(function(err) {
            console.error('Firestore: Failed to enable offline persistence:', err && err.code);
        });
}

// // TODO: refactor this. Roughly: init() -> sync init library and db -> async event fired saying logged in -> sync docs from that
// function connect(): boolean {
//     if (status === 'none') init();
//     if (status === 'initFailed') {
//         console.error('Connect failed.');
//         return false;
//     }

//     return true;
// }

async function startLogin(email: string, state: State, dispatch: Function): Promise<void> {
    await init(state, dispatch);
    console.log('starting login');
     // TODO: handle init errors somehow?
    // if (state.connectState !== 'initialised') return;
    // if (!connect()) return new Promise((resolve, reject) => reject(new Error('Cannot connect')));

    await firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
    // setConnectState('loginStarted', dispatch);
    dispatch({
        type: 'startLogin',
        loginEmail: email,
    });
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
async function finishLogin(address: string, email: string, state: State, dispatch: Function): Promise<void> {
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
        try {
            await firebase.auth().signInWithEmailLink(email, window.location.href);
            dispatch({type: 'completeLogin'});
            // setConnectState('loggedIn', dispatch);
        } catch(error) {
            dispatch({type: 'loginFailed'});
            // setConnectState('loginFailed', dispatch);
            throw error;
        }
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
        setConnectState('loginFailed', dispatch);
        throw new Error('Address is not a valid login link');
        // return new Promise((resolve, reject) => {
        //     reject(new Error('Address is not a valid login link'));
        // });
    }
}

async function logout(state: State, dispatch: Function): Promise<any> {
    await firebase.auth().signOut();
    dispatch({
        type: 'logout'
    });
}

async function sync(state: State, dispatch: Function): Promise<any> {
    if (!db) {
        console.error('DB not initialised');
        throw new Error('DB not initialised');
        // return new Promise((resolve, reject) => reject(new Error('DB not initialised')));
    }
    if (!user) throw new Error('Not logged in');
    // return new Promise((resolve, reject) => reject(new Error('Not logged in')));
    
    await retrieveNotes(state.data.notes, dispatch);
    return sendNotes(state.data.notes, dispatch);            
}

function listenToChanges(state: State, dispatch: Function) {
    if (!db) {
        console.error('DB not initialised');
        return;
    }
    // if (!user) return new Promise((resolve, reject) => reject(new Error('Not logged in')));
    
    db.collection('notes')
        .onSnapshot({includeMetadataChanges: true}, (snapshot) => {
            console.log('snapshot', snapshot);
            if (!snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites) {
                snapshot.docChanges().forEach(function(change) {
                    console.log('change.type', change.type);
                    if (change.type === 'added') {
                        console.log('New remote note received: ', change.doc.id, change.doc.data());
                        storeNoteLocally(change.doc.id, change.doc.data(), dispatch);
                    } else if (change.type === 'modified') {
                        console.log('Updated note received: ', change.doc.data());
                        updateNoteLocally(change.doc.id, change.doc.data(), dispatch);
                    } else if (change.type === 'removed') {
                        console.log('Delete notification received: ', change.doc.id);
                        removeNoteLocally(change.doc.id, dispatch);
                    } 
                });
            }
        });

}

async function retrieveNotes(localNotes: Array<Note>, dispatch: Function): Promise<any> {
    if (!user) throw new Error('Not logged in');
    const querySnapshot = await db.collection('notes').where("owner", "==", user.uid).get();
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
}

async function sendNotes(notes: Array<Note>, dispatch: Function): Promise<any> {
    console.log('sending local notes to server');
    await Promise.all(
        notes.map((note) => {
            if (note.id.startsWith('local:')) {
                console.log('sending note:', note.id);
                return storeNoteRemotely(note, dispatch);
            } else return new Promise((resolve, reject) => resolve());
        })
    );
    console.log('ALL resolved');
}

function updateNoteLocally(id, data, dispatch) {
    dispatch({
        type: 'modifyNote',
        source: 'remote',
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
        source: 'remote',
        content: {
            id: id,
            title: data.title,
            body: data.body,
        }
    });
}

function removeNoteLocally(id, dispatch) {
    dispatch({
        type: 'removeNote',
        source: 'remote',
        id: id,
    });
}

async function storeNoteRemotely(note: Note, dispatch: Function): Promise<void> {
    console.log('storeNoteRemotely');
    if (!user) throw new Error('Not logged in');
    // return new Promise((resolve, reject) => reject(new Error('Not logged in')));

    try {
        const docRef = await db.collection('notes').add({
            title: note.title,
            body: note.body,
            owner: user.uid,
        });
        console.log('Document written with ID: ', docRef.id);
        // modify local id to match cloud id
        dispatch({
            type: 'modifyNote',
            source: 'remote',
            id: note.id,
            content: {
                id: docRef.id,
                title: note.title,
                body: note.body, 
            }
        })
    } catch (error) {
        console.error('Error adding document: ', error);
    }
}

async function updateNoteRemotely(note: Note, dispatch: Function): Promise<void> {
    // if (state.connectState !== 'initialised') return;// new Promise((resolve, reject) => resolve());
    if (!user) throw new Error('Not logged in');
    // return new Promise((resolve, reject) => reject(new Error('Not logged in')));

    try {
        await db.collection('notes').doc(note.id).set({
            title: note.title,
            body: note.body,
            owner: user.uid,
        })
        console.log(`Document ${note.id} updated`);
    } catch(error) {
        console.error(`Error updating document ${note.id}: `, error);
    }
}

async function removeNoteRemotely(id: string, dispatch: Function): Promise<void> {
    // if (state.connectState !== 'initialised') return;// new Promise((resolve, reject) => resolve());
    if (!user) throw new Error('Not logged in');

    try {
        await db.collection('notes').doc(id).delete();
        console.log(`Remote document ${id} removed`);
    } catch(error) {
        console.error(`Error removing document ${id}: `, error);
    }
}

export default {
    init,
    startLogin,
    finishLogin,
    logout,
    sync,
    listenToChanges,
    storeNoteRemotely,
    updateNoteRemotely,
    removeNoteRemotely,
};
