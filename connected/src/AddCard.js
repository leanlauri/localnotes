/**
 * @flow
 */
import type {Node} from 'react';

import Card from 'react-bootstrap/Card';
import React from 'react';

type Props = {|
    onClick: () => void,
|};

function AddCard({onClick}: Props): Node {
    return (
        <Card style={{ 
            width: '100%',
            height: '20rem',
            margin: '4px',
            marginBottom: '8px',
            borderStyle: 'dashed',
            background: 'transparent',
            borderColor: 'white',
            borderWidth: 'medium',
            color: 'white',
        }}
        onClick={onClick}
        >
            <Card.Body>
                <Card.Title style={{verticalAlign: 'center'}}>
                    Add new note
                </Card.Title>
            </Card.Body>
        </Card>
    );
}

export default AddCard;