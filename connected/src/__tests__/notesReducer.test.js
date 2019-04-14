import { reducer } from '../notesReducer';

describe('reducer', () => {
    const createInitialState = () => ({
        data: {
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
        },
    });

    it('addNote normal usage', () => {
        const startState = createInitialState();

        const endState = reducer(startState, {
            type: 'addNote',
            content: {
                id: 6,
                title: 'Additional Note',
                body: 'Some body',
            },
        });

        expect(startState).not.toBe(endState);
        expect(endState.data.notes.length).toBe(3);
        expect(endState.data.notes[2]).toEqual({
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
        });

        expect(startState).not.toBe(endState);
        expect(endState.data.notes.length).toBe(2);
        expect(endState.data.notes[0]).toEqual({
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
        });

        expect(startState).not.toBe(endState);
        expect(endState.data.notes.length).toBe(2);
        expect(endState.data.notes[0].title).toEqual('My Title');
        expect(endState.data.notes[1].title).toEqual('Second Title');
    });

    it('removeNote normal usage', () => {
        const startState = createInitialState();

        const endState = reducer(startState, {
            type: 'removeNote',
            id: 1,
        });

        expect(startState).not.toBe(endState);
        expect(endState.data.notes.length).toBe(1);
        expect(endState.data.notes[0]).toEqual({
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
        });

        expect(startState).not.toBe(endState);
        expect(endState.data.notes.length).toBe(2);
    });

    it('startLogin normal usage', () => {
        const startState = createInitialState();
        const endState = reducer(startState, {
            type: 'startLogin',
            loginEmail: 'test@test.com',
        });

        expect(startState).not.toBe(endState);
        expect(endState.data.loginEmail).toEqual('test@test.com');
        expect(endState.data.loginFlowStage).toEqual('started');
        expect(endState.data.upSellDisabled).toEqual(true);
    });

    it('completeLogin normal usage', () => {
        const startState = createInitialState();
        const midState = reducer(startState, {
            type: 'startLogin',
            loginEmail: 'test@test.com',
        });
        const endState = reducer(midState, {
            type: 'completeLogin',
        });

        expect(startState).not.toBe(endState);
        expect(endState.data.loginEmail).toEqual('test@test.com');
        expect(endState.data.loginFlowStage).toEqual('completed');
        expect(endState.data.upSellDisabled).toEqual(true);
    });

    it('logout normal usage', () => {
        const startState = createInitialState();
        const midState = reducer(startState, {
            type: 'startLogin',
            loginEmail: 'test@test.com',
        });
        const endState = reducer(midState, {
            type: 'logout',
        });

        expect(startState).not.toBe(endState);
        expect(endState.data.loginEmail).toBeUndefined();
        expect(endState.data.loginFlowStage).toBeUndefined();
        expect(endState.data.upSellDisabled).toEqual(true);
    });

    it('disableUpSell normal usage', () => {
        const startState = createInitialState();
        const endState = reducer(startState, {
            type: 'disableUpSell',
        });

        expect(startState).not.toBe(endState);
        expect(endState.data.upSellDisabled).toEqual(true);
    });

});