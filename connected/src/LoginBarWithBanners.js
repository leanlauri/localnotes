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
                connector.logout(state, dispatch);
                break;
            default: break;
        }
    };

    const onLogin = async (email) => {
        setLoginDialogVisible(false);
        console.log('Login requested with:', email);
        try {
            await connector.startLogin(email, state, dispatch);
        } catch (error) {
            console.error('Error sending login email:', error, error && error.code);
            dispatch({
                type: 'logout',
            });
        }
    };

    return (
        <>
            <LoginModal
                show={loginDialogVisible}
                initialEmail={state.email}
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
                        {state.data.loginFlowStage === 'completed'
                            ? <Nav.Link href="#logout">Logout</Nav.Link>
                            : <Nav.Link href="#login">Login</Nav.Link>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            {(!state.data.loginFlowStage && !state.data.upSellDisabled)
                ? <LoginUpSellBanner
                    onDismiss={() => dispatch({
                        type: 'disableUpSell'
                    })}
                    onAction={() => setLoginDialogVisible(true)}/>
                : null
            }
            <LoginStatusBanner
                status={state.connectState}
                onLogin={() => setLoginDialogVisible(true)}/>
        </>
    );
}

export default LoginBarWithBanners;
