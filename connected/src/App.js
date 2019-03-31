/**
 * @flow
 */
import type { Node } from 'react';

import React, { createContext } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './App.css';
import localStorageReducer from './localStorageReducer';
import LoginBar from './LoginBar';
import NotesContainer from './NotesContainer';
import connector from './firebaseConnector';
import { Exception } from 'handlebars';


export const StateContext = createContext<any, any>([null, null]);
connector.connect(); // TODO: make this async

function App(): Node {
  const [state, dispatch] = localStorageReducer();

  return (
    <div className="App">
      <Router>
        <Route
          path="/finishLogin/"
          render={(match, history) => (
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
                  <LoginBar />
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
  // if (!match.params.sessionId) throw new Exception('No session id');
  // TODO: check if loginEmail is null -- if login started from a different device -- and prompt for email
  if (state.loginEmail == null) throw Exception('no login email');

  connector.finishLogin(window.location.href, state.loginEmail)
    .then(function(result) {
      // Clear email from storage.
      dispatch({
        type: 'completeLogin',
      });
      history.push('/');
      // window.localStorage.removeItem('emailForSignIn');
      // You can access the new user via result.user
      // Additional user info profile not available via:
      // result.additionalUserInfo.profile == null
      // You can check if the user is new or existing:
      // result.additionalUserInfo.isNewUser
    })
    .catch(function(error) {
        console.log('error', error, error && error.code);
        // Some error occurred, you can inspect the code: error.code
        // Common errors could be invalid email and invalid or expired OTPs.
    });

  return null;
}

export default App;
