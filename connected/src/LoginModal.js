/**
 * @flow
 */
import type {Node} from 'react';

import { Button, Form, Modal } from 'react-bootstrap';
import React, { useState } from 'react';

type Props = {|
  show: boolean,
  initialEmail: ?string,
  onCancel: () => void,
  onConfirm: (string) => Promise<any>,
|};

function LoginModal({show, initialEmail, onCancel, onConfirm}: Props): Node {
    const [email, setEmail] = useState(initialEmail);

    const onSubmit = (event) => {
      event.preventDefault();
      if (email) onConfirm(email);
    }

    return (
      <Modal show={show} onHide={onCancel}>
        <Form onSubmit={onSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Sign up or Login</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div style={{paddingBottom: 20}}>Want to share your notes between the devices you use? Enter your email below to sign up or login.</div>
              <Form.Group controlId="formBasicEmail">
                <Form.Label>Email address</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Form.Text className="text-muted">
                  We'll never share your email with anyone else.
                </Form.Text>
              </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" >
              Login
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    );
}

export default LoginModal;