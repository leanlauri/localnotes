/**
 * @flow
 */
import type {Node} from 'react';
import type {Note} from './notesState';

import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import React, { useState } from 'react';
import Form from 'react-bootstrap/Form';
import ConfirmModal from './ConfirmModal';

type Props = {|
    content: Note,
    update: Note => void,
    remove: () => void,
|};

function NoteCard({content, update, remove}: Props): Node {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(content.title);
    const [body, setBody] = useState(content.body);
    const [dialogVisible, setDialogVisible] = useState(false);

    const onSubmit = (event) => {
        event.preventDefault();
        update({
            ...content,
            title,
            body,
        });
        setEditing(false);
    }
    
    const createForm = () => (
        <>
            <ConfirmModal
                show={dialogVisible}
                title="Confirm remove"
                message="Are you sure you want to remove the note?"
                onCancel={() => setDialogVisible(false)}
                onConfirm={remove}
                type="remove"/>
            <Form
                noValidate
                onSubmit={onSubmit}>
                <Card style={{ 
                    width: '100%',
                    height: '20rem',
                    margin: '4px',
                    marginBottom: '8px',
                }}>
                    <Card.Body>
                        <Card.Title>
                            <Form.Control 
                                as="input"
                                onChange={(e) => setTitle(e.target.value)}
                                defaultValue={content.title}
                            />
                        </Card.Title>
                        <Card.Text>
                            <Form.Control
                                as="textarea"
                                onChange={(e) => setBody(e.target.value)}
                                defaultValue={content.body}
                                style={{height: '11rem', marginBottom: '1rem'}}
                            />
                        </Card.Text>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Button key="remove" variant="outline-danger" onClick={() => setDialogVisible(true)}>
                                Remove
                            </Button>
                            <Button key="save" type="submit">
                                Save
                            </Button>
                        </div>
                    </Card.Body>
                </Card>
            </Form>
        </>
    );

    const createView = () => (
        <Card style={{ 
            width: '100%',
            height: '20rem',
            margin: '4px',
            marginBottom: '8px',
        }}>
            <Card.Body>
                <Card.Title>
                    {content.title}
                </Card.Title>
                <div style={{overflow: 'auto', height: '12rem', marginBottom: '1rem', whiteSpace: 'pre-line'}}>
                    <Card.Text>
                            {content.body}
                    </Card.Text>
                </div>
                <Button variant="primary" onClick={() => {setEditing(true)}}>
                    Edit
                </Button>
            </Card.Body>
        </Card>
    );
    
    return (
        editing
            ? createForm()
            : createView()
    );
}

export default NoteCard;