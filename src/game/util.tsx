import {GameState} from './streams';


const gridSizeX: number = 10;
const gridSizeY: number = 15;
const baseSpeed: number = 1;
const speedUp: number = 0.25;
const emptyCell: number = 0;

export const isEmptyCell = (val: number) => val === emptyCell;

// types and constants
export const spawnPosition = {x: 4, y: 0};

export enum CollisionType {
    NoCollision,
    WallLeft,
    WallRight,
    WallBottom,
    BrickOther,
    GameOver,
}


// helper and utility functions
export function clone<T>(
    type: { new(...args: any[]): T },
    original: T): T {
    const copy = Object.assign(new type(), original);
    return copy;
}

export const clearField = (): number[][] => Array(gridSizeY).fill(emptyCell).map(() => Array(gridSizeX).fill(emptyCell));
export const createField = (width: number, height: number, fill: number) => Array(height).fill(fill).map(() => Array(width).fill(fill));

export const copyArrayOfArray = (input: number[][]): number[][] => {
    let output: number[][] = [];
    for (var i = 0; i < input.length; i++) {
        output[i] = [];
        for (var j = 0; j < input[i].length; j++) {
            output[i].push(input[i][j]);
        }
    }
    return output;
}

export const intervalFromLevel = (level: number) => {
    const factor = baseSpeed + (level - 1) * speedUp;
    const interval = 1000 / factor;
    return interval;
}


// core game functions
export const calculateBounds = (array2d: number[][]) => {
    let nonEmptyRowIndices: number[] = [];
    let nonEmptyColIndices: number[] = [];

    array2d.forEach((row, rowIndex) => {
        if (row.some(x => !isEmptyCell(x))) {
            nonEmptyRowIndices.push(rowIndex);
        }
        row.forEach((col, colIndex) => {
            if (!isEmptyCell(col)) {
                nonEmptyColIndices.push(colIndex);
            }
        })
    });

    const r1 = Math.min(...nonEmptyRowIndices);
    const r2 = Math.max(...nonEmptyRowIndices);
    const c1 = Math.min(...nonEmptyColIndices);
    const c2 = Math.max(...nonEmptyColIndices);

    return {
        rowStart: r1,
        rowEnd: r2,
        columnStart: c1,
        columnEnd: c2,
        width: c2 - c1 + 1,
        height: r2 - r1 + 1
    };
};

export const detectCollision = (state: GameState) => {
    const {stack, active, x, y, spawnX, spawnY} = state;
    const shape = active.shape;

    const fieldHeight = stack.length;
    const fieldWidth = stack[0].length;
    const brickBounds = calculateBounds(shape);

    const overlapsBottom = () => y + brickBounds.height > fieldHeight;
    const overlapsRight = () => x + brickBounds.width > fieldWidth;
    const overlapsLeft = () => x < 0;

    if (overlapsLeft()) {
        return CollisionType.WallLeft;
    }

    if (overlapsRight()) {
        return CollisionType.WallRight;
    }

    if (overlapsBottom()) {
        return CollisionType.WallBottom;
    }

    for (let row = y, rs = brickBounds.rowStart; row < y + brickBounds.height; row++ , rs++) {
        for (let col = x, cs = brickBounds.columnStart; col < x + brickBounds.width; col++ , cs++) {
            if (!isEmptyCell(stack[row][col]) && !isEmptyCell(shape[rs][cs])) {
                if (y === spawnY && x === spawnX) {
                    // new piece cannot be spawned so game is over
                    return CollisionType.GameOver;
                }
                return CollisionType.BrickOther;
            }
        }
    }

    return CollisionType.NoCollision;
}

export const drawShape = (field: number[][], shape: number[][], x: number, y: number, color?: number): number[][] => {
    const bounds = calculateBounds(shape);
    const result: number[][] = copyArrayOfArray(field);

    for (let row = y, rs = bounds.rowStart; row < y + bounds.height; row++ , rs++) {
        for (let col = x, cs = bounds.columnStart; col < x + bounds.width; col++ , cs++) {
            if (shape[rs][cs] !== 0) {
                if (color) {
                    result[row][col] = color;
                } else {
                    result[row][col] = shape[rs][cs];
                }
            }
        }
    }

    return result;
}

export const clearLines = (field: number[][]): { field: number[][], amount: number } => {
    let tmp = copyArrayOfArray(field);
    let sizeY = tmp[0].length;
    let cleared = 0;

    let r = tmp.length - 1;
    while (r >= 0) {
        if (tmp[r].every(x => x > 0)) {
            cleared = cleared + 1;
            // to clear a line
            // 1) remove it
            // 2) move all rows above it one row down
            // 3) insert new row on top
            tmp.splice(r, 1);
            tmp.unshift(Array(sizeY).fill(0))
            continue;
        }
        r = r - 1;
    }

    return {field: tmp, amount: cleared};
}
