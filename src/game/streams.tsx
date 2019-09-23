import {empty, fromEvent, interval, merge, Observable, Subject} from 'rxjs';
import {distinctUntilChanged, filter, map, scan, share, switchMap} from 'rxjs/operators';

import {
    ColorEvent,
    DownEvent,
    FallEvent,
    GameEvent,
    LeftEvent,
    PauseEvent,
    RestartEvent,
    RightEvent,
    RotateEvent
} from './events';
import {Tetrimino} from './tetrimino';
import {
    clearField,
    clearLines,
    CollisionType,
    copyArrayOfArray,
    detectCollision,
    drawShape,
    intervalFromLevel,
    spawnPosition
} from './util';


export class GameState {
    isPaused: boolean;
    isGameOver: boolean;
    toggleColor: boolean;
    level: number;
    lines: number;

    x: number;
    y: number;
    active: Tetrimino;
    next: Tetrimino;

    stack: number[][];
    field: number[][];

    spawnX: number;
    spawnY: number;

    constructor() {
        this.isPaused = true;
        this.isGameOver = false;
        this.toggleColor = false;

        this.level = 1;
        this.lines = 0;

        this.spawnX = spawnPosition.x;
        this.spawnY = spawnPosition.y;

        this.x = spawnPosition.x;
        this.y = spawnPosition.y;

        this.active = new Tetrimino();
        this.next = new Tetrimino();

        this.stack = clearField();
        this.field = clearField();
    }
}

export const fromKeyboardEvent = (event: KeyboardEvent) => {
    event.preventDefault();
    switch (event.key) {
        case "c":
            return new ColorEvent();
        case "Backspace":
            return new RestartEvent();
        case "Space":
        case " ":
            return new PauseEvent();
        case "ArrowLeft":
            return new LeftEvent();
        case "ArrowRight":
            return new RightEvent();
        case "ArrowDown":
            return new DownEvent();
        case "ArrowUp":
            return new RotateEvent();
    }
}

const gameEventTypeGuard = (x: GameEvent | any): x is GameEvent => x instanceof GameEvent;

const input$ = merge(
    fromEvent<KeyboardEvent>(document, 'keydown').pipe(map(e => fromKeyboardEvent(e))),
    fromEvent<KeyboardEvent>(document, 'keyup').pipe(map(() => undefined)),
).pipe(
    // prevent repeated key down events when holding button except for down event
    distinctUntilChanged((prev, curr) => curr instanceof DownEvent
        ? false
        : typeof (prev) == typeof (curr)),
);

const intervalSubject: Subject<number> = new Subject();
const interval$ = intervalSubject.asObservable().pipe(
    switchMap(period => period > 0
        ? interval(period).pipe(map(() => new FallEvent()))
        : empty()
    ),
);

const event$: Observable<GameEvent> =
    merge(input$, interval$).pipe(
        // custom type guard with a type predicate to narrow stream output to IGameEvent
        filter(gameEventTypeGuard),
    );

const game$ = (source$: Observable<GameEvent>, initialState?: GameState) =>
    source$.pipe(
        scan((state, event) => handleEvent(state, event), initialState ? initialState : new GameState()),
        share(),
    );

const handleEvent = (state: Readonly<GameState>, event: GameEvent) => {
    let next = {...state};

    if (event instanceof PauseEvent && !next.isGameOver) {
        next.isPaused = !next.isPaused;

        next.isPaused
            ? intervalSubject.next(0)
            : intervalSubject.next(intervalFromLevel(next.level));
    }

    if (event instanceof RestartEvent) {
        next = new GameState();
        next.isPaused = false;
        next.toggleColor = state.toggleColor;
        intervalSubject.next(intervalFromLevel(next.level));
    }

    if (event instanceof ColorEvent) {
        next.toggleColor = !next.toggleColor;
    }

    if (next.isPaused) {
        return next;
    }

    // events up to here are also handled during paused game

    if (event instanceof FallEvent || event instanceof DownEvent) {
        next.y += 1;

        const collision = detectCollision(next);

        if (collision === CollisionType.WallBottom || collision === CollisionType.BrickOther) {
            const cleared = clearLines(next.field);
            if (cleared.amount > 0) {
                next.lines += cleared.amount;
                next.level = Math.floor(next.lines / 10 + 1);
                next.field = copyArrayOfArray(cleared.field);
                intervalSubject.next(intervalFromLevel(next.level));
            }

            next.active = next.next;
            next.next = new Tetrimino();
            next.x = next.spawnX;
            next.y = next.spawnY;
            next.stack = copyArrayOfArray(next.field);

            // check if new tetrimino is spawnable
            if (detectCollision(next) === CollisionType.GameOver) {
                next.isGameOver = true;
                next.isPaused = true;
                intervalSubject.next(0);
                return next;
            }
        }
    }

    if (event instanceof LeftEvent) {
        next.x -= 1;
        const collision = detectCollision(next);
        if (collision === CollisionType.WallLeft || collision === CollisionType.BrickOther) {
            next.x = state.x;
        }
    }

    if (event instanceof RightEvent) {
        next.x += 1;
        const collision = detectCollision(next);
        if (collision === CollisionType.WallRight || collision === CollisionType.BrickOther) {
            next.x = state.x;
        }
    }

    if (event instanceof RotateEvent) {
        next.active.rotateCW();
        if (detectCollision(next) !== CollisionType.NoCollision) {
            next.active.rotateCCW();
        }
    }

    next.field = copyArrayOfArray(next.stack);
    next.field = drawShape(next.field, next.active.shape, next.x, next.y);

    return next;
}

export const tetris = {
    game$: (source$ = event$, initialState?: GameState) => game$(source$, initialState),
    event$: event$
};
