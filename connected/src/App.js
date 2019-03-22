/**
 * @flow
 */
import type { Node } from 'react';

import React, { createContext } from 'react';
import './App.css';
import localStorageReducer from './localStorageReducer';
import LoginBar from './LoginBar';
import NotesContainer from './NotesContainer';

export const StateContext = createContext<any, any>([null, null]);

function App(): Node {
  const [state, dispatch] = localStorageReducer();

  return (
    <div className="App">
      <StateContext.Provider value={[state, dispatch]}>
        <div className="topbar-container">
          <LoginBar />
        </div>
        <div className="App-contents">
          <NotesContainer />
        </div>
      </StateContext.Provider>
    </div>
  );
}

export default App;
