/**
 * Decorator for notesReducer that saves state to remote storage
 * 
 * @flow
 */
import type { State } from './notesReducer';

import connector from './firebaseConnector';
  
function createRemoteDispatch(state: State, dispatch: Function): Function {
    return (action) => {
        dispatch(action);
        if (action.source !== 'remote') handleAction(action, state, dispatch);
    }
}

function handleAction(action, state, dispatch) {
    console.log('state.connectState is', state.connectState);
    if (state.connectState !== 'loggedIn') return;// new Promise((resolve, reject) => resolve());

    switch (action.type) {
        case 'addNote':
            connector.storeNoteRemotely(action.content, dispatch);
            break;
        case 'modifyNote':
            connector.updateNoteRemotely(action.content, dispatch);
            break;
        case 'removeNote':
            connector.removeNoteRemotely(action.id, dispatch);
            break;
        default: break;
    }
}

export default createRemoteDispatch;