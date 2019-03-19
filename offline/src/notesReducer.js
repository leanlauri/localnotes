/**
 * @flow
 */
import { useReducer } from 'react';

export type Note = {|
    id?: number,
    title: ?string,
    body: ?string,
|};

export type State = {|
    hash: number,
    notes: Array<Note>,
    lastId: number,
|};

function addNote(notes: Array<Note>, id: number, content: Note): Array<Note> {
    return notes
        .concat({
            ...content,
            id,
        });
}

function replaceNote(notes: Array<Note>, id: number, content: Note): Array<Note> {
    const index = notes.findIndex(note => note.id === id);
    if (index === -1) return notes;
    return notes
        .slice(0, index)
        .concat({
            ...content,
            id,
        })
        .concat(
            notes.slice(index + 1)
        );
}

function removeNote(notes: Array<Note>, id: number): Array<Note> {
    const index = notes.findIndex(note => note.id === id);
    if (index === -1) return notes;
    return notes
        .slice(0, index)
        .concat(
            notes.slice(index + 1)
        );
}

function reducer(state: State, action: any): State {
    switch (action.type) {
        case 'addNote':
            return {
                ...state,
                hash: state.hash + 1,
                notes: addNote(state.notes, state.lastId + 1, action.content),
                lastId: state.lastId + 1,
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
            }
        default: throw new Error('unknown action: ' + action.type);
    }
}

export default function notesReducer(initState: () => State) {
    return useReducer<State, any, null>(reducer, null, initState);
}