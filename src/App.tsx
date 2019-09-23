import './App.css';

import React from 'react';
import {Subscription} from 'rxjs';
import {tap} from 'rxjs/operators';

import {EventTimeline, TetrisGrid} from './components';
import {GameState, tetris} from './game/streams';


class App extends React.Component<{}, GameState> {
    private gameSub!: Subscription;

    constructor(props: any) {
        super(props);
        this.state = new GameState();
    }

    componentDidMount() {
        this.gameSub = tetris.game$().pipe(
            tap(gameState => this.setState(gameState)),
        ).subscribe();
    }

    componentWillUnmount() {
        this.gameSub.unsubscribe();
    }

    render() {
        return (
            <div className="app">
                <div className="app_header">
                    <span>Tetris + React + RxJS = &#10084;</span>
                </div>
                <div className="app_content">
                    <div className="tetris-wrapper">
                        <div className="tetris">
                            <TetrisGrid grid={this.state.field} color={this.state.toggleColor}/>
                            {
                                this.state.isPaused &&
                                (<div className="tetris_overlay">
                                    {this.state.isGameOver
                                        ? <strong>GAME OVER<br/><br/><br/>Press BACKSPACE to restart game.</strong>
                                        : <strong>Press SPACE to resume game.</strong>}
                                </div>)
                            }
                        </div>
                        <div className="infobar">
                            <div className="infobar_next">
                                <TetrisGrid grid={this.state.next.shape} color={this.state.toggleColor}/>
                                <div/>
                                <span>Next</span>
                            </div>
                            <div className="infobar_stats">
                                <div className="stat">
                                    <strong>{this.state.level}</strong>
                                    <span>Level</span>
                                </div>
                                <div className="stat">
                                    <strong>{this.state.lines}</strong>
                                    <span>Lines</span>
                                </div>
                            </div>
                            <div className="control">
                                <strong className="control_header">CONTROLS</strong>

                                <span className="control_keys">⬆</span>
                                <span className="control_action">Rotate</span>

                                <span className="control_keys">⬅,⬇,➡</span>
                                <span className="control_action">Move</span>

                                <span className="control_keys">SPACEBAR</span>
                                <span className="control_action">Pause</span>

                                <span className="control_keys">BACKSPACE</span>
                                <span className="control_action">Restart</span>

                                <span className="control_keys">C</span>
                                <span className="control_action">Color</span>
                            </div>
                        </div>
                    </div>
                    <div className="tetris_events">
                        <EventTimeline stream$={tetris.event$}/>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
