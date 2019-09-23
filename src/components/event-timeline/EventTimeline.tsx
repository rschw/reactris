import './EventTimeline.css';

import React from 'react';
import {interval, Observable, Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';

import {
    DownEvent,
    FallEvent,
    GameEvent,
    LeftEvent,
    PauseEvent,
    RestartEvent,
    RightEvent,
    RotateEvent
} from '../../game/events';


enum ColorPalette {
    Unknown = '#654C4F',
    Interval = '#C0CAAD',
    Movement = '#CEC075',
    Rotation = '#B26E63',
    General = '#9DA9A0',
}

class Marble {
    private static _id: number = 0;
    readonly id: number;
    readonly timestamp: Date;
    readonly text: string;
    readonly color: string;

    constructor(event: GameEvent) {
        this.id = Marble._id++;
        this.timestamp = new Date();
        // this.text = event.constructor.name.replace('Event', '');
        this.text = event.name;
        this.color = this._colorFromEvent(event);
    }

    private _colorFromEvent(event: GameEvent) {
        if (event instanceof LeftEvent || event instanceof RightEvent || event instanceof DownEvent) {
            return ColorPalette.Movement;
        }

        if (event instanceof RotateEvent) {
            return ColorPalette.Rotation;
        }

        if (event instanceof FallEvent) {
            return ColorPalette.Interval;
        }

        if (event instanceof RestartEvent || event instanceof PauseEvent) {
            return ColorPalette.General;
        }

        return ColorPalette.Unknown;
    }
}

class Timeline {
    readonly rangeMilliseconds: number = 3000;
    readonly marbles: Marble[] = [];
}

export class EventTimeline extends React.Component<{ stream$: Observable<GameEvent> }, Timeline> {
    private _streamSub!: Subscription;
    private _renderSub: Subscription;

    private readonly _mainAxisOffset: number = 10;
    private readonly _crossAxisOffset: number = 10;
    private readonly _bubbleRadius: number = 20;

    private readonly _viewBoxWidth = 150;
    private readonly _viewBoxHeight = 478;
    private readonly _arrowHeadLength = 18;
    private readonly _timelineStart: number;
    private readonly _timelineEnd: number;
    private readonly _MilliseondToPixel: number;

    constructor(props: any) {
        super(props);
        this.state = new Timeline();

        // calculate svg properties
        this._timelineStart = this._mainAxisOffset;
        this._timelineEnd = this._viewBoxHeight - this._arrowHeadLength - this._mainAxisOffset;
        const usableTimelineLength = this._timelineEnd - this._timelineStart - 4 * this._bubbleRadius;
        this._MilliseondToPixel = usableTimelineLength / this.state.rangeMilliseconds;

        // render timeline at 30 fps
        this._renderSub = interval(1000 / 30).pipe(
            tap(_ => this.setState(this.state)),
        ).subscribe();
    }

    componentDidMount() {
        this._streamSub = this.props.stream$.pipe(
            tap(x => x instanceof RestartEvent ? this.setState({marbles: []}) : {}),
            tap(x => this.setState({marbles: [...this.state.marbles, new Marble(x)]})),
        ).subscribe();
    }

    componentWillUnmount() {
        this._streamSub.unsubscribe();
        this._renderSub.unsubscribe();
    }

    render() {
        const timeNow = Date.now();
        const timeRangeStart = new Date(timeNow - this.state.rangeMilliseconds);
        const marblesInWindow = this.state.marbles.filter(x => x.timestamp.getTime() >= timeRangeStart.getTime());

        return (
            <svg id="marbleDiagram" width="100%" height="100%"
                 viewBox={`0 0 ${this._viewBoxWidth} ${this._viewBoxHeight}`}>
                <defs>
                    <marker id="arrow" markerWidth="10" markerHeight="10" refX="0" refY="3" orient="auto"
                            markerUnits="strokeWidth">
                        <path d="M0,0 L0,6 L9,3 z" fill="#000"/>
                    </marker>
                </defs>
                <g name="marbles">
                    <line
                        id="timeline"
                        strokeWidth="2"
                        stroke="black"
                        x1="50%" x2="50%"
                        y1={this._timelineStart} y2={this._timelineEnd}
                        markerEnd="url(#arrow)">
                    </line>
                    {marblesInWindow.map((event: Marble) => {
                        const delta = timeNow - event.timestamp.getTime();
                        const y = 2 * this._bubbleRadius + delta * this._MilliseondToPixel;
                        return (
                            <svg key={event.id} width="100%" y={y}>
                                <circle
                                    stroke="black"
                                    strokeWidth=".5"
                                    fill={event.color}
                                    cx="50%"
                                    r={this._bubbleRadius}>
                                </circle>
                                <text className="fadeout" textAnchor="start" fontSize="10pt"
                                      x={this._crossAxisOffset} y={this._bubbleRadius / 2 - 5}>
                                    {event.text}
                                </text>
                                <text className="fadeout" textAnchor="end" fontSize="10pt"
                                      x="100%" y={this._bubbleRadius / 2 - 5}
                                      style={{transform: `translateX(-${this._crossAxisOffset}px)`}}>
                                    {Math.round(delta / 1000) + 's'}
                                </text>
                            </svg>
                        )
                    })}
                </g>
            </svg>
        );
    }
}
