/**
 * Decorator for notesReducer that loads/saves state from local storage
 * 
 * @flow
 */
import type { State } from './notesReducer';

import { useEffect } from 'react';
import notesReducer from './notesReducer';

const LOCAL_STORAGE_KEY = 'appState';

function initState() {
    console.log('loading');
    let loadedState = localStorage.getItem(LOCAL_STORAGE_KEY) || '';
    try {
        loadedState = JSON.parse(loadedState);
    } catch (e) {
        loadedState = null;
    }
    return loadedState || {hash: 0, lastId: 0, notes: []};
}

function saveState(state: State) {
    console.log('saving: ', state.hash);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

function localStorageReducer() {
    const [state, dispatch] = notesReducer(initState);

    useEffect(() => {
        saveState(state);
    }, [state]);

    return [state, dispatch];
}

export default localStorageReducer;