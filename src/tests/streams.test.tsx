import {from} from 'rxjs';
import {bufferCount, mergeMap, sequenceEqual, tap} from 'rxjs/operators';

import {
    ColorEvent,
    DownEvent,
    FallEvent,
    LeftEvent,
    PauseEvent,
    RestartEvent,
    RightEvent,
    RotateEvent
} from '../game/events';
import {fromKeyboardEvent, GameState, tetris} from '../game/streams';
import {createField, isEmptyCell} from '../game/util';


describe('event handler should update state', () => {
    it('pause event should toggle pause and stop interval', done => {
        const sut = tetris.game$(from([new PauseEvent]));
        sut.subscribe(state => {
            expect(state.isPaused).toBe(!new GameState().isPaused);
        }, null, done);
    });

    it('restart event should reset game state', done => {
        const initial = {
            ...new GameState(),
            level: 10,
            lines: 100,
            isPaused: true,
            isGameOver: true,
            stack: createField(5, 5, 1)
        }
        const sut = tetris.game$(from([new RestartEvent]), initial);
        sut.subscribe(state => {
            expect(state.level).toBe(1);
            expect(state.lines).toBe(0);
            expect(state.isPaused).toBe(false);
            expect(state.isGameOver).toBe(false);
            expect(state.stack.every(row => row.every(col => isEmptyCell(col)))).toBe(true);
        }, null, done);
    });

    it('color event should toggle color', done => {
        const sut = tetris.game$(from([new ColorEvent]));
        sut.subscribe(state => {
            expect(state.toggleColor).toBe(!new GameState().toggleColor);
        }, null, done);
    });

    it('left event should update x position', done => {
        const initial = {...new GameState(), x: 5, isPaused: false};
        const sut = tetris.game$(from([new LeftEvent]), initial);
        sut.subscribe(state => {
            expect(state.x).toBe(initial.x - 1);
        }, null, done);
    });

    it('left event should not update x position on wall collision', done => {
        const initial = {...new GameState(), x: 0, isPaused: false};
        const sut = tetris.game$(from([new LeftEvent]), initial);
        sut.subscribe(state => {
            expect(state.x).toBe(initial.x);
        }, null, done);
    });

    it('right event should update x position', done => {
        const initial = {...new GameState(), x: 0, isPaused: false};
        const sut = tetris.game$(from([new RightEvent]), initial);
        sut.subscribe(state => {
            expect(state.x).toBe(initial.x + 1);
        }, null, done);
    });

    it('right event should not update x position on wall collision', done => {
        let initial = {...new GameState(), isPaused: false};
        initial = {...initial, x: initial.field[0].length - 1};

        const sut = tetris.game$(from([new RightEvent]), initial);
        sut.subscribe(state => {
            expect(state.x).toBe(initial.x);
        }, null, done);
    });

    it('down and fall events should update y position', done => {
        const initial = {...new GameState(), isPaused: false};
        const expected = from([{...initial, y: initial.y + 1}, {...initial, y: initial.y + 2}]);

        const sut = tetris.game$(from([new DownEvent, new FallEvent]), initial);
        sut.pipe(
            bufferCount(2),
            mergeMap(last2 => from(last2).pipe(sequenceEqual(expected, (a, b) => a.y === b.y))),
            tap(sequenceEqual => expect(sequenceEqual).toBe(true)),
        ).subscribe(null, null, done);
    });

    it('rotate event should update shape rotation', done => {
        const initial = {...new GameState(), isPaused: false};

        const tetrimino = initial.active;
        const spyRotateCW = jest.spyOn(tetrimino, 'rotateCW');

        const sut = tetris.game$(from([new RotateEvent]), initial);
        sut.subscribe(() => {
            expect(spyRotateCW).toHaveBeenCalled();
        }, null, done);
    });

    it('events have no effect when paused', done => {
        const initial = {...new GameState(), isPaused: true};
        const sut = tetris.game$(from([new FallEvent, new DownEvent, new LeftEvent, new RightEvent, new RotateEvent]), initial);
        sut.subscribe(state => {
            expect(state).toStrictEqual(initial);
        }, null, done);
    });
});

it('keyboard event should map to game event', () => {
    const restart = fromKeyboardEvent(new KeyboardEvent('keydown', {key: 'Backspace'}));
    expect(restart).toBeInstanceOf(RestartEvent);

    const pause = fromKeyboardEvent(new KeyboardEvent('keydown', {key: 'Space'}));
    expect(pause).toBeInstanceOf(PauseEvent);

    const color = fromKeyboardEvent(new KeyboardEvent('keydown', {key: 'c'}));
    expect(color).toBeInstanceOf(ColorEvent);

    const left = fromKeyboardEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}));
    expect(left).toBeInstanceOf(LeftEvent);

    const right = fromKeyboardEvent(new KeyboardEvent('keydown', {key: 'ArrowRight'}));
    expect(right).toBeInstanceOf(RightEvent);

    const down = fromKeyboardEvent(new KeyboardEvent('keydown', {key: 'ArrowDown'}));
    expect(down).toBeInstanceOf(DownEvent);

    const rotate = fromKeyboardEvent(new KeyboardEvent('keydown', {key: 'ArrowUp'}));
    expect(rotate).toBeInstanceOf(RotateEvent);
});
