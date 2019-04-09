/**
 * @flow
 */
import { useReducer } from 'react';

export type Note = {|
    id: string,
    title: ?string,
    body: ?string,
|};

export type ConnectState = 'loginStarted' | 'loggedIn' | 'loginFailed' | 'tokenRejected';

export type State = {|
    hash: number,
    notes: Array<Note>,
    lastId: number,
    loginEmail?: string,
    upSellDisabled?: boolean,
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

export function reducer(state: State, action: any): State {
    switch (action.type) {
        case 'addNote':
            return {
                ...state,
                hash: state.hash + 1,
                notes: addNote(state.notes, action.content),
                lastId: Math.max(state.lastId, action.content.id),
            };
        case 'modifyNote':
            if (action.id == null) return state;
            return {
                ...state,
                hash: state.hash + 1,
                notes: replaceNote(state.notes, action.id, action.content),
            };
        case 'removeNote':
            if (action.id == null) return state;
            return {
                ...state,
                hash: state.hash + 1,
                notes: removeNote(state.notes, action.id),
            };
        case 'startLogin':
            if (action.loginEmail == null) return state;
            return {
                ...state,
                loginEmail: action.loginEmail,
                upSellDisabled: true,
                connectState: 'loginStarted',
            };
        case 'completeLogin':
            return {
                ...state,
                connectState: 'loggedIn',
            };
        case 'loginFailed':
            return {
                ...state,
                loginEmail: undefined,
                connectState: 'loginFailed',
            };
        case 'logout':
            return {
                ...state,
                loginEmail: undefined,
                connectState: undefined,
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