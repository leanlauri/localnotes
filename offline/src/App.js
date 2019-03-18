/**
 * @flow
 */
import type {Node} from 'react';

import React from 'react';
import './App.css';
import NotesContainer from './NotesContainer';

function App(): Node {
  return (
    <div className="App">
      <header className="App-header">
        <NotesContainer />
      </header>
    </div>
  );
}

export default App;
