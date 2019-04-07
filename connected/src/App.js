/**
 * @flow
 */
import type { Node } from 'react';

import React, { createContext, useEffect } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './App.css';
import localStorageReducer from './localStorageReducer';
import LoginBarWithBanners from './LoginBarWithBanners';
import NotesContainer from './NotesContainer';
import connector from './firebaseConnector';

export const StateContext = createContext<any, any>([null, null]);

function App(): Node {
  const [state, dispatch] = localStorageReducer();
  useEffect(() => {
    if (state.loginEmail != null && state.connectState === 'connected') {
      connector.connect();
      connector.sync(state, dispatch)
        .then(() => {
          connector.listenToChanges(state, dispatch);
        });
   }
  }, [state.loginEmail, state.connectState]);

  return (
    <div className="App">
      <Router>
        <Route
          path="/finishLogin/"
          render={({match, history}) => (
            <HandleLogin state={state} dispatch={dispatch} match={match} history={history}/>
          )}/>
          
        <Route  
          path="/:section?"
          render={({ match, history }) => {
            console.log('match', match);
            console.log('section', match.params.section);
            return (
              <StateContext.Provider value={[state, dispatch]}>
                <div className="topbar-container">
                  <LoginBarWithBanners />
                </div>
                <div className="App-contents">
                  <NotesContainer />
                </div>  
              </StateContext.Provider>
            );
          }}/>
      </Router>
    </div>
  );
}

function HandleLogin({ state, dispatch, match, history }): Node {
  connector.connect();
  // if (!match.params.sessionId) throw new Error('No session id');
  // TODO: check if loginEmail is null -- if login started from a different device -- and prompt for email
  if (state.loginEmail == null) {
    console.log('No login email in state');
    history.push('/');
    dispatch({
      type: 'loginFailed',
    });
    return null;
  }
  connector.finishLogin(window.location.href, state.loginEmail)
    .then(function(result) {
      // Clear email from storage.
      history.push('/');
      dispatch({
        type: 'completeLogin',
      });
      // window.localStorage.removeItem('emailForSignIn');
      // You can access the new user via result.user
      // Additional user info profile not available via:
      // result.additionalUserInfo.profile == null
      // You can check if the user is new or existing:
      // result.additionalUserInfo.isNewUser
    })
    .catch(function(error) {
        console.log('error', error, error && error.code);
        dispatch({
          type: 'loginFailed',
        });
        // Some error occurred, you can inspect the code: error.code
        // Common errors could be invalid email and invalid or expired OTPs.
    });

  return null;
}

export default App;
