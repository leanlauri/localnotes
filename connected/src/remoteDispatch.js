/**
 * Decorator for notesReducer that saves state to remote storage
 * 
 * @flow
 */
import type { State } from './notesReducer';

import { useEffect } from 'react';
import firebase from 'firebase/app';
import connector from './firebaseConnector';

const db = firebase.firestore();

function createRemoteDispatch(dispatch: Function): Function {
    return (action) => {
        dispatch(action);
        handleAction(action, dispatch);
    }
}

function handleAction(action, dispatch) {
    switch (action.type) {
        case 'addNote':
            connector.storeNoteRemotely(action.content, dispatch);
            break;
        case 'modifyNote':
            connector.updateNoteRemotely(action.content);
            break;
        case 'removeNote':
            connector.removeNoteRemotely(action.id);
            break;
        default: break;
    }
}

export default createRemoteDispatch;