/**
 * Decorator for notesReducer that saves state to remote storage
 * 
 * @flow
 */
import connector from './firebaseConnector';
  
function createRemoteDispatch(dispatch: Function): Function {
    return (action) => {
        dispatch(action);
        if (action.source !== 'remote') handleAction(action, dispatch);
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