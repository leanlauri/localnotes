/**
 * @flow
 */
import type {Node} from 'react';

import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import React from 'react';

type Props = {|
    show: boolean,
    title: string,
    message: string,
    onCancel: () => void,
    onConfirm: () => void,
    type: 'confirm' | 'remove',
|};

function ConfirmModal({show, title, message, onCancel, onConfirm, type}: Props): Node {
    return (
        <Modal show={show} onHide={onCancel}>
          <Modal.Header closeButton>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{message}</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant={type === 'remove' ? 'danger' : 'primary'} onClick={onConfirm}>
              {type === 'remove' ? 'Remove' : 'Confirm'}
            </Button>
          </Modal.Footer>
        </Modal>
    );
}

export default ConfirmModal;