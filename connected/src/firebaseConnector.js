/**
 * @flow
 */
import type {Note} from './notesReducer';
import type {State, ConnectState} from './notesReducer';

import config from './firebaseConfig.json';
const firebase = require('firebase/app');
require('firebase/auth');
require('firebase/firestore');

let db;
let user;
const actionCodeSettings = {
    url: 'http://localhost:3000/finishLogin/',
    handleCodeInApp: true,
};

function setConnectState(connectState: ConnectState, dispatch: Function) {
    dispatch({
        type: 'setConnectState',
        connectState,
    });
}

function init(state: State, dispatch: Function) {
    try {
        if (!firebase.apps.length) {
            console.log('Initialising Firebase');
            firebase.initializeApp(config);
            initDb();
        }
    } catch (err) {
        console.error('Firestore: Error initialising:', err && err.code);
        setConnectState('loginFailed', dispatch);
    }
}

function initDb() {
    db = firebase.firestore();
    db.enablePersistence()
        .catch(function(err) {
            console.error('Firestore: Failed to enable offline persistence:', err && err.code);
        });
}

async function waitForUserAuth(state: State, dispatch: Function): Promise<?firebase.User> {
    if (user) return user;
    try {
        return await addUserStateListener(state, dispatch);
    } catch (err) {
        console.error('Firestore: Error initialising:', err && err.code);
        setConnectState('loginFailed', dispatch);
        return null;
    }
}

async function addUserStateListener(state: State, dispatch: Function): Promise<?firebase.User> {
    return new Promise((resolve, reject) => {
        firebase.auth().onAuthStateChanged((userObject) => {
            console.log('authStateChanged, user:', userObject);
            if (userObject) {
                user = userObject;
                dispatch({type: 'completeLogin'});
                resolve(user);
            } else {
                user = null;
                setConnectState('loginFailed', dispatch);
                resolve(null);
            }
        });
    });
}

async function startLogin(email: string, state: State, dispatch: Function): Promise<void> {
    try {
        console.log('starting login');
        init(state, dispatch);
        await firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
        dispatch({
            type: 'startLogin',
            loginEmail: email,
        });
    } catch (err) {
        console.error('Firestore: Login failed:', err && err.code);
        setConnectState('loginFailed', dispatch);
    }
}

async function finishLogin(address: string, email: string, state: State, dispatch: Function): Promise<void> {
    try {
        if (!firebase.auth().isSignInWithEmailLink(address)) {
            console.error('Address is not a valid login address:', address);
            dispatch({type: 'loginFailed'});
            return;
        }
        await firebase.auth().signInWithEmailLink(email, address);
        dispatch({type: 'completeLogin'});
    } catch (error) {
        console.error('Error completing login:', error, error && error.code);
        dispatch({type: 'loginFailed'});
      }  
}

async function logout(state: State, dispatch: Function): Promise<any> {
    await firebase.auth().signOut();
    dispatch({
        type: 'logout'
    });
}

async function sync(state: State, dispatch: Function): Promise<any> {
    if (!db || !user) {
        console.error('DB or user not initialised');
        throw new Error('DB or user not initialised');
    }
    
    await retrieveNotes(state.data.notes, dispatch);
    return sendNotes(state.data.notes, dispatch);            
}

function listenToChanges(state: State, dispatch: Function) {
    if (!db || !user) {
        console.error('DB or user not initialised. Cancelling listen to changes.');
        return;
    }
    
    db.collection('notes').where("owner", "==", user.uid)
        .onSnapshot({includeMetadataChanges: true}, (snapshot) => {
            // console.log('snapshot', snapshot);
            if (!snapshot.metadata.fromCache && !snapshot.metadata.hasPendingWrites) {
                snapshot.docChanges().forEach(function(change) {
                    // console.log('change.type', change.type);
                    if (change.type === 'added') {
                        // console.log('New remote note received: ', change.doc.id, change.doc.data());
                        storeNoteLocally(change.doc.id, change.doc.data(), dispatch);
                    } else if (change.type === 'modified') {
                        // console.log('Updated note received: ', change.doc.data());
                        updateNoteLocally(change.doc.id, change.doc.data(), dispatch);
                    } else if (change.type === 'removed') {
                        // console.log('Delete notification received: ', change.doc.id);
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
                // console.log('sending note:', note.id);
                return storeNoteRemotely(note, dispatch);
            } else return new Promise((resolve, reject) => resolve());
        })
    );
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
    console.log('storing note to server');
    if (!user) throw new Error('Not logged in');

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
    console.log('updating note on server');
    if (!user) throw new Error('Not logged in');

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
    console.log('removing note from server');
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
    waitForUserAuth,
    startLogin,
    finishLogin,
    logout,
    sync,
    listenToChanges,
    storeNoteRemotely,
    updateNoteRemotely,
    removeNoteRemotely,
};
