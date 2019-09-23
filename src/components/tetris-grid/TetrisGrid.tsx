import './TetrisGrid.css';

import React from 'react';


export class TetrisGrid extends React.Component<{ grid: number[][], color?: boolean }> {
    render() {
        const grid = this.props.grid;
        const color = this.props.color ? this.props.color : false;
        return (
            <div className="tetris_grid"
                 style={{
                     gridTemplateColumns: `repeat(${grid[0].length}, var(--brick-size))`
                 }}>
                {
                    grid.map((row, i) => row.map((col, j) =>
                        <div key={`brick-r${i}-c${j}`}
                             className='tetris_brick'
                             style={{
                                 backgroundColor:
                                     color
                                         ? tetriminoColors[grid[i][j]]
                                         : grid[i][j] === 0
                                         ? colorInactive
                                         : colorActive
                             }}/>
                    ))
                }
            </div>
        );
    }
}

const colorInactive = 'lightgray';
const colorActive = '#E6746A';

const tetriminoColors = [
    colorInactive, // inactive
    '#EF3E36', // 1
    '#17BEBB',
    '#2E282A',
    '#86BA90',
    '#BDCC72',
    '#F18805',
    '#058ED9', // 7
]
