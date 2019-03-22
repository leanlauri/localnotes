
/**
 * @flow
 */
import type {Node} from 'react';

import Alert from 'react-bootstrap/Alert';
import React from 'react';

type Props = {|
  onDismiss: () => void,
  onAction: () => void,
|};

function LoginUpsellBanner({onDismiss, onAction}: Props): Node {
    const onClick = (event) => {
        event.preventDefault();
        onAction();
    }

    return (
        <Alert
            dismissible
            variant="primary"
            onClose={onDismiss}>
            <Alert.Heading>Have multiple devices?</Alert.Heading>
            <p>
                You can get your notes on every device by&nbsp;
                <a href="#login" onClick={onClick}>logging in</a>.
            </p>
        </Alert>
    );
}

export default LoginUpsellBanner;