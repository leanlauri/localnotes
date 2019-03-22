/**
 * @flow
 */
import type { Node } from 'react';

import React, { useState } from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import LoginModal from './LoginModal';
import LoginUpSellBanner from './LoginUpSellBanner';

function LoginBar(): Node {
    const [loginDialogVisible, setLoginDialogVisible] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);
    const [upSellDisabled, setUpSellDisabled] = useState(false);

    const onSelect = (key, event) => {
        switch (key) {
            case '#login':
                setLoginDialogVisible(true);
                break;
            case '#logout':
                setLoggedIn(false);
                break;
            default: break;
        }
    };

    const onLogin = (email) => {
        setLoginDialogVisible(false);
        console.log('login with:', email);
        setLoggedIn(true);
    }

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
                        {!loggedIn
                            ? <Nav.Link href="#login">Login</Nav.Link>
                            : <Nav.Link href="#logout">Logout</Nav.Link>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
            {(!loggedIn && !upSellDisabled)
                ? <LoginUpSellBanner
                    onDismiss={() => setUpSellDisabled(true)}
                    onAction={() => setLoginDialogVisible(true)}/>
                : null
            }
        </>
    );
}

export default LoginBar;
