/**
 * @flow
 */
import type {Node} from 'react';

import React from 'react';
import './App.css';
import LoginBar from './LoginBar';
import NotesContainer from './NotesContainer';

function App(): Node {
  return (
    <div className="App">
      <div className="topbar-container">
        <LoginBar />
      </div>
      <div className="App-contents">
        <NotesContainer />
      </div>
    </div>
  );
}

export default App;
