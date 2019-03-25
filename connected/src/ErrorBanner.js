
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
        case 'network_error':
            return (
                <Alert
                    dismissible
                    variant="warning"
                    show={showingWarning}
                    onClose={() => setShowingWarning(false)}
                >
                    <Alert.Heading>Connection lost</Alert.Heading>
                    <p>
                        Working in offline mode until network is available.
                    </p>
                </Alert>
            );
        case 'token_rejected':
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