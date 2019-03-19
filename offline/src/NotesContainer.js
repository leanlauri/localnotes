/**
 * @flow
 */
import type {Node} from 'react';

import { Container, Row, Col } from 'react-bootstrap';
import React from 'react';
import AddCard from './AddCard';
import NoteCard from './NoteCard';
import localStorageReducer from './localStorageReducer';

function NotesContainer(): Node {
    const [state, dispatch] = localStorageReducer();
    
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