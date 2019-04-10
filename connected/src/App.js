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
import { Spinner } from 'react-bootstrap';

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
          const user = await connector.init(state, dispatch);
          if (user) {
            await connector.sync(state, dispatch);
            connector.listenToChanges(state, dispatch);
          }
          // if (!connector.connect()) return;
          // connector.sync(state, dispatch)
          //   .then(() => {
          //     connector.listenToChanges(state, dispatch);
          //   });
        } catch (error) {
          console.log('Error synchronising data:', error);
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
            return <Spinner />
            // <HandleLogin state={state} dispatch={dispatch} match={match} history={history}/>
          }}/>
          
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

async function handleLogin(state, dispatch, match, history) {
  try {
    await connector.init(state, dispatch);
    if (state.data.loginEmail == null) {
      console.log('No login email in state');
      history.push('/');
      dispatch({
        type: 'loginFailed',
      });
      return;
    }
    await connector.finishLogin(window.location.href, state.data.loginEmail, state, dispatch);
    history.push('/');
    // dispatch({
    //   type: 'completeLogin',
    // });

  } catch (error) {
    console.log('Error completing login:', error, error && error.code);
    // dispatch({
    //   type: 'loginFailed',
    // });
  }
}

export default App;
