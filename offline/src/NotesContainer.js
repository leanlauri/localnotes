/**
 * @flow
 */
import type {Node} from 'react';
import type {Note, State} from './notesState';

import { Container, Row, Col } from 'react-bootstrap';
import React, { useReducer, useEffect } from 'react';
import AddCard from './AddCard';
import NoteCard from './NoteCard';
import { useNotesReducer } from './notesState';

const LOCAL_STORAGE_KEY = 'appState';

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

function NotesContainer(): Node {
    const [state, dispatch] = useNotesReducer(initState);

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