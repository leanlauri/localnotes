import { reducer } from '../notesReducer';

describe('reducer', () => {
    const createInitialState = () => ({
        hash: 10, 
        lastId: 5,
        notes: [
            {
                id: 1,
                title: 'My Title',
                body: 'Body text',
            },
            {
                id: 2,
                title: 'Second Title',
                body: 'Another text',
            },
        ],
    });

    it('addNote normal usage', () => {
        const startState = createInitialState();

        const endState = reducer(startState, {
            type: 'addNote',
            content: {
                title: 'Additional Note',
                body: 'Some body',
            },
        })

        expect(startState).not.toBe(endState);
        expect(endState.notes.length).toBe(3);
        expect(endState.notes[2]).toEqual({
            id: 6,
            title: 'Additional Note',
            body: 'Some body',
        });
    });

    it('modifyNote normal usage', () => {
        const startState = createInitialState();

        const endState = reducer(startState, {
            type: 'modifyNote',
            id: 1,
            content: {
                title: 'New First Title',
                body: 'New body',
            },
        })

        expect(startState).not.toBe(endState);
        expect(endState.notes.length).toBe(2);
        expect(endState.notes[0]).toEqual({
            id: 1,
            title: 'New First Title',
            body: 'New body',
        });
    });

    it('modifyNote non-existent', () => {
        const startState = createInitialState();

        const endState = reducer(startState, {
            type: 'modifyNote',
            id: 99,
            content: {
                title: 'New Title',
                body: 'New body',
            },
        })

        expect(startState).not.toBe(endState);
        expect(endState.notes.length).toBe(2);
        expect(endState.notes[0].title).toEqual('My Title');
        expect(endState.notes[1].title).toEqual('Second Title');
    });

    it('removeNote normal usage', () => {
        const startState = createInitialState();

        const endState = reducer(startState, {
            type: 'removeNote',
            id: 1,
        })

        expect(startState).not.toBe(endState);
        expect(endState.notes.length).toBe(1);
        expect(endState.notes[0]).toEqual({
            id: 2,
            title: 'Second Title',
            body: 'Another text',
        });
    });

    it('removeNote non-existent', () => {
        const startState = createInitialState();

        const endState = reducer(startState, {
            type: 'removeNote',
            id: 99,
        })

        expect(startState).not.toBe(endState);
        expect(endState.notes.length).toBe(2);
    });

});