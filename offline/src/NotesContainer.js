/**
 * @flow
 */
import type {Node} from 'react';

import { Container, Row, Col } from 'react-bootstrap';
import React, { useReducer, useEffect } from 'react';
import AddCard from './AddCard';
import NoteCard from './NoteCard';

const LOCAL_STORAGE_KEY = 'appState';

export type Note = {|
    id?: number,
    title: ?string,
    body: ?string,
|};

type State = {|
    hash: number,
    notes: Array<Note>,
    lastId: number,
|};

function initState() {
    console.log('loading');
    let loadedState = localStorage.getItem(LOCAL_STORAGE_KEY) || '';
    try {
        loadedState = JSON.parse(loadedState);
    } catch (e) {
        loadedState = null;
    }
    return loadedState || {hash: 0, lastId: 0, notes: []};
}

function saveState(state: State) {
    console.log('saving: ', state.hash);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

function addNote(notes: Array<Note>, id: number, content: Note) {
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

function reducer(state: State, action) {
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

function NotesContainer(): Node {
    const [state, dispatch] = useReducer(reducer, null, initState);

    useEffect(() => {
        saveState(state);
    }, [state]);
    
    return (
        <>
            <Container >
                <Row className="justify-content-md-center" >
                {state.notes.map(item => 
                    <Col xs="12" sm="12" md="6" lg="4" xl="4" key={item.id}>
                        <NoteCard
                            
                            content={item}
                            update={(note) => dispatch({
                                type: 'modifyNote',
                                id: item.id,
                                content: note,
                            })}
                            remove={() => dispatch({
                                type: 'removeNote',
                                id: item.id,
                            })}
                            />
                    </Col>
                )}
                <Col xs="12" sm="12" md="6" lg="4" xl="4" key="add-button">
                    <AddCard onClick={() => dispatch({
                        type: 'addNote',
                        content: {
                            title: 'New Note',
                            body: '',
                        }
                    })}/>
                </Col>
                </Row>
            </Container>
        </>

    );
}

export default NotesContainer;