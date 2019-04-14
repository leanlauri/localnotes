/**
 * @flow
 */
import type { Node } from 'react';
import type { State } from './notesReducer';

import React, { createContext, useEffect } from 'react';
import { BrowserRouter as Router, Route } from "react-router-dom";
import './App.css';
import localStorageReducer from './localStorageReducer';
import LoginBarWithBanners from './LoginBarWithBanners';
import NotesContainer from './NotesContainer';
import connector from './firebaseConnector';
import createRemoteDispatch from './remoteDispatch';

export const StateContext = createContext<any, any>([null, null]);

function isLoggedIn(state: State): boolean {
  return state.data.loginFlowStage === 'completed' && state.connectState === 'loggedIn';
}

function App(): Node {
  const [state, localDispatch] = localStorageReducer();
  const dispatch = isLoggedIn(state) ? createRemoteDispatch(state, localDispatch) : localDispatch;
  useEffect(() => {
    if (state.data.loginFlowStage === 'completed') {
      (async () => {
        try {
          connector.init(state, dispatch);
          const user = await connector.waitForUserAuth(state, dispatch);
          if (user) {
            await connector.sync(state, dispatch);
            connector.listenToChanges(state, dispatch);
          }
        } catch (error) {
          console.error('Error synchronising data:', error);
        }
      })();
   }
  }, [state.data.loginEmail, state.data.loginFlowStage]);

  return (
    <div className="App">
      <Router>
        <Route
          path="/finishLogin/"
          render={({match, history}) => {
            handleLogin(state, dispatch, match, history);
            return null;
          }}/>
          
        <Route  
          path="/:section?"
          render={({ match, history }) => {
            console.log('Section', match.params.section); // not currently used
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

async function handleLogin(state, dispatch, match, history) {
  console.log('Handling finishLogin request');
  connector.init(state, dispatch);
  const address = window.location.href;
  history.push('/');
  if (state.data.loginEmail == null) {
    console.error('No login email in stored state');
    dispatch({
      type: 'loginFailed',
    });
  } else {
    await connector.finishLogin(address, state.data.loginEmail, state, dispatch);
  }
}

export default App;
