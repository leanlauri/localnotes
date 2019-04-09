
/**
 * @flow
 */
import type { Node } from 'react';
import type { ConnectState } from './notesReducer';

import Alert from 'react-bootstrap/Alert';
import React, { useState } from 'react';

type Props = {|
    status: ConnectState,
    onLogin: () => void,
|};

function ErrorBanner({status, onLogin}: Props): Node {
    const [showingWarning, setShowingWarning] = useState(true);
    const [showingError, setShowingError] = useState(true);
    const onClick = (event) => {
        event.preventDefault();
        onLogin();
    }

    switch (status) {
        case 'loginStarted':
            return (
                <Alert
                    dismissible
                    variant="primary"
                    show={showingWarning}
                    onClose={() => setShowingWarning(false)}
                >
                    <Alert.Heading>Waiting to Login</Alert.Heading>
                    <p>
                        Find and click on your login link in your email client.
                    </p>
                </Alert>
            );
        case 'loggedIn':
            return (
                <Alert
                    dismissible
                    variant="success"
                    show={showingWarning}
                    onClose={() => setShowingWarning(false)}
                >
                    <Alert.Heading>Logged in</Alert.Heading>
                </Alert>
            );
        case 'loginFailed':
        case 'tokenRejected':
            return (
                <Alert
                    dismissible
                    variant="danger"
                    show={showingError}
                    onClose={() => setShowingError(false)}
                >
                    <Alert.Heading>Login failed</Alert.Heading>
                    <p>
                        Please&nbsp;
                        <a href="#login" onClick={onClick}>login</a>&nbsp;again.
                    </p>
                </Alert>
            );
        default:
            return null;
    }
}

export default ErrorBanner;