export abstract class GameEvent {
    readonly abstract name: string;
}

// MOVEMENT
export class LeftEvent extends GameEvent {
    name: string = 'Left';
}

export class RightEvent extends GameEvent {
    name: string = 'Right';
}

export class DownEvent extends GameEvent {
    name: string = 'Down';
}

export class RotateEvent extends GameEvent {
    name: string = 'Rotate';
}

// GENERAL
export class FallEvent extends GameEvent {
    name: string = 'Fall';
}

export class PauseEvent extends GameEvent {
    name: string = 'Pause';
}

export class RestartEvent extends GameEvent {
    name: string = 'Restart';
}

// VISUAL
export class ColorEvent extends GameEvent {
    name: string = 'Color';
}