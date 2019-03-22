/**
 * @flow
 */
import type { Node } from 'react';

import React, { useContext, useState } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import LoginModal from './LoginModal';
import LoginUpSellBanner from './LoginUpSellBanner';
import { StateContext } from './App';

function LoginBar(): Node {
    const [state, dispatch] = useContext(StateContext);
    const [loginDialogVisible, setLoginDialogVisible] = useState(false);

    const onSelect = (key, event) => {
        switch (key) {
            case '#login':
                setLoginDialogVisible(true);
                break;
            case '#logout':
                dispatch({
                    type: 'logout'
                });
                break;
            default: break;
        }
    };

    const onLogin = (email) => {
        setLoginDialogVisible(false);
        console.log('login with:', email);
        dispatch({
            type: 'login',
            loginEmail: email,
        });
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
        </>
    );
}

export default LoginBar;
