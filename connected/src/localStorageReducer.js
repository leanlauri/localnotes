/**
 * Decorator for notesReducer that loads/saves state from local storage
 * 
 * @flow
 */
import type { DataState } from './notesReducer';

import { useEffect } from 'react';
import notesReducer from './notesReducer';

const LOCAL_STORAGE_KEY = 'appState';

function initState() {
    console.log('loading');
    const storedItem = localStorage.getItem(LOCAL_STORAGE_KEY) || '';
    let loadedDataState;
    try {
        loadedDataState = JSON.parse(storedItem);
    } catch (e) {
        loadedDataState = null;
    }
    return {
        data: loadedDataState || {
            hash: 0,
            notes: [],
        },
    };
}

function saveState(dataState: DataState) {
    console.log('saving: ', dataState.hash);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataState));
}

function localStorageReducer() {
    const [state, dispatch] = notesReducer(initState);

    useEffect(() => {
        saveState(state.data);
    }, [state.data]);

    return [state, dispatch];
}

export default localStorageReducer;