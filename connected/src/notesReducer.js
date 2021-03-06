/**
 * @flow
 */
import { useReducer } from 'react';

export type Note = {|
    id: string,
    title: ?string,
    body: ?string,
|};

export type ConnectState = 'loginStarted' | 'loggedIn' | 'loginFailed';

export type DataState = {|
    notes: Array<Note>,
    loginEmail?: string,
    loginFlowStage?: 'started' | 'completed',
    upSellDisabled?: boolean,
|};

export type State = {|
    data: DataState,
    connectState?: ConnectState,
|};

function addNote(notes: Array<Note>, content: Note): Array<Note> {
    const index = notes.findIndex(note => note.id === content.id);
    if (index !== -1) return notes; // cannot add with same id

    console.log('adding note with id: ', content.id);
    return notes
        .concat({
            ...content,
        });
}

function replaceNote(notes: Array<Note>, id: string, content: Note): Array<Note> {
    const index = notes.findIndex(note => note.id === id);
    if (index === -1) return notes;
    return notes
        .slice(0, index)
        .concat({
            ...content,
            id: content.id || id,
        })
        .concat(
            notes.slice(index + 1)
        );
}

function removeNote(notes: Array<Note>, id: string): Array<Note> {
    const index = notes.findIndex(note => note.id === id);
    if (index === -1) return notes;
    return notes
        .slice(0, index)
        .concat(
            notes.slice(index + 1)
        );
}

/**
 * Reducer for actions that can modify both persistent (state.data) and non-persistent (state) data
 */
export function reducer(state: State, action: any): State {
    console.log('reducer action:', action.type, action);
    switch (action.type) {
        case 'startLogin':
            if (action.loginEmail == null) return state;
            return {
                ...state,
                data: {
                    ...state.data,
                    loginEmail: action.loginEmail,
                    loginFlowStage: 'started',
                    upSellDisabled: true,
                },
                connectState: 'loginStarted',
            };
        case 'completeLogin':
            return {
                ...state,
                data: {
                    ...state.data,
                    loginFlowStage: 'completed',
                },
                connectState: 'loggedIn',
            };
        case 'loginFailed':
            return {
                ...state,
                data: {
                    ...state.data,
                },
                connectState: 'loginFailed',
            };
        case 'logout':
            return {
                ...state,
                data: {
                    ...state.data,
                    loginEmail: undefined,
                    loginFlowStage: undefined,
                },
                connectState: undefined,
            };
        case 'setConnectState':
            return {
                ...state,
                connectState: action.connectState,
            };            
        default: return {
            ...state,
            data: dataReducer(state.data, action),
        };
    }
}

/**
 * Reducer for actions that only modify persistent data
 */
function dataReducer(state: DataState, action: any): DataState {
    switch (action.type) {
        case 'addNote':
            return {
                ...state,
                notes: addNote(state.notes, action.content),
            };
        case 'modifyNote':
            if (action.id == null) return state;
            return {
                ...state,
                notes: replaceNote(state.notes, action.id, action.content),
            };
        case 'removeNote':
            if (action.id == null) return state;
            return {
                ...state,
                notes: removeNote(state.notes, action.id),
            };
        case 'disableUpSell':
            return {
                ...state,
                upSellDisabled: true,
            };

        default: throw new Error('unknown action: ' + action.type);
    }
}

export default function notesReducer(initState: () => State) {
    return useReducer<State, any, null>(reducer, null, initState);
}