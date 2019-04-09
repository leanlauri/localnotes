/**
 * @flow
 */
import type { Node } from 'react';

import React, { useContext, useState } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import LoginModal from './LoginModal';
import LoginUpSellBanner from './LoginUpSellBanner';
import { StateContext } from './App';
import LoginStatusBanner from './LoginStatusBanner';
import connector from './firebaseConnector';

function LoginBarWithBanners(): Node {
    const [state, dispatch] = useContext(StateContext);
    const [loginDialogVisible, setLoginDialogVisible] = useState(false);

    const onSelect = (key, event) => {
        switch (key) {
            case '#login':
                setLoginDialogVisible(true);
                break;
            case '#logout':
                // TODO: handle login errors
                connector.logout();
                dispatch({
                    type: 'logout'
                });
                break;
            default: break;
        }
    };

    const onLogin = async (email) => {
        setLoginDialogVisible(false);
        console.log('login with:', email);
        try {
            await connector.startLogin(email);
            dispatch({
                type: 'startLogin',
                loginEmail: email,
            });        
        } catch (error) {
            console.log('Error sending login email:', error, error && error.code);
            dispatch({
                type: 'logout',
            });
        }

            // .then(function() {
            //     // The link was successfully sent. Inform the user.
            //     // Save the email locally so you don't need to ask the user for it again
            //     // if they open the link on the same device.
            //     dispatch({
            //         type: 'startLogin',
            //         loginEmail: email,
            //     });        
            // })
            // .catch(function(error) {
            //     // Some error occurred, you can inspect the code: error.code
            //     console.log('Error sending login email:', error, error && error.code);
            //     dispatch({
            //         type: 'logout',
            //     });
        
            // });
        
    };

    return (
        <>
            <LoginModal
                show={loginDialogVisible}
                onCancel={() => setLoginDialogVisible(false)}
                onConfirm={onLogin}
            />
            <Navbar
                bg="light"
                fixed="top"
                expand
                onSelect={onSelect}>
                <Navbar.Brand href="#home">Local Notes</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto"></Nav>
                    <Nav>
                        {state.loginEmail
                            ? <Nav.Link href="#logout">Logout</Nav.Link>
                            : <Nav.Link href="#login">Login</Nav.Link>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            {(!state.loginEmail && !state.upSellDisabled)
                ? <LoginUpSellBanner
                    onDismiss={() => dispatch({
                        type: 'disableUpSell'
                    })}
                    onAction={() => setLoginDialogVisible(true)}/>
                : null
            }
            <LoginStatusBanner
                status={connector.getStatus()}
                onLogin={() => setLoginDialogVisible(true)}/>
        </>
    );
}

export default LoginBarWithBanners;
