import {GameState} from '../game/streams';
import {Tetrimino} from '../game/tetrimino';
import {
    calculateBounds,
    clearField,
    clearLines,
    CollisionType,
    createField,
    detectCollision,
    drawShape,
    isEmptyCell
} from '../game/util';


describe('utility functions', () => {
    it('should create empty field', () => {
        const sut = clearField();
        expect(sut.every(row => row.every(col => isEmptyCell(col)))).toBe(true);
    });

    it('should create field with value', () => {
        const sut = createField(3, 5, 7);
        expect(sut.length).toBe(5);
        expect(sut[0].length).toBe(3);
        expect(sut.every(row => row.every(col => col === 7))).toBe(true);
    })
})

describe('bounds calculation', () => {
    it('returns correct bounds for O', () => {
        const input = [
            [1, 1, 0],
            [1, 1, 0],
            [0, 0, 0],
        ];

        const result = calculateBounds(input);
        expect(result.rowStart).toBe(0);
        expect(result.rowEnd).toBe(1);
        expect(result.columnStart).toBe(0);
        expect(result.columnEnd).toBe(1);
        expect(result.width).toBe(2);
        expect(result.height).toBe(2);
    });

    it('returns correct bounds for I', () => {
        const input = [
            [0, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];

        const result = calculateBounds(input);
        expect(result.rowStart).toBe(1);
        expect(result.rowEnd).toBe(1);
        expect(result.columnStart).toBe(0);
        expect(result.columnEnd).toBe(2);
        expect(result.width).toBe(3);
        expect(result.height).toBe(1);
    });

    it('returns correct bounds for T', () => {
        const input1 = [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];

        const result1 = calculateBounds(input1);
        expect(result1.rowStart).toBe(0);
        expect(result1.rowEnd).toBe(1);
        expect(result1.columnStart).toBe(0);
        expect(result1.columnEnd).toBe(2);
        expect(result1.width).toBe(3);
        expect(result1.height).toBe(2);

        const input2 = [
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, 0],
        ];

        const result2 = calculateBounds(input2);
        expect(result2.rowStart).toBe(0);
        expect(result2.rowEnd).toBe(2);
        expect(result2.columnStart).toBe(0);
        expect(result2.columnEnd).toBe(1);
        expect(result2.width).toBe(2);
        expect(result2.height).toBe(3);
    });
});

describe('collision detection', () => {
    it('should detect wall collisions', () => {
        const shape = [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];

        const tetrimino = new Tetrimino();
        jest.spyOn(tetrimino, 'shape', 'get').mockReturnValue(shape);

        const state = {
            ...new GameState(),
            stack: createField(3, 3, 0),
            active: tetrimino
        };

        const result1 = detectCollision({...state, x: 0, y: 2});
        expect(result1).toBe(CollisionType.WallBottom);

        const result2 = detectCollision({...state, x: -1, y: 0});
        expect(result2).toBe(CollisionType.WallLeft);

        const result3 = detectCollision({...state, x: 1, y: 0});
        expect(result3).toBe(CollisionType.WallRight);

        const result4 = detectCollision({...state, x: 0, y: 1});
        expect(result4).toBe(CollisionType.NoCollision);
    });

    it('should detect brick collisions', () => {
        const field = [
            [0, 0, 0],
            [0, 0, 0],
            [1, 1, 1],
        ];
        const shape = [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];

        const tetrimino = new Tetrimino();
        jest.spyOn(tetrimino, 'shape', 'get').mockReturnValue(shape);

        const state = {
            ...new GameState(),
            stack: field,
            active: tetrimino
        };

        const result1 = detectCollision({...state, x: 0, y: 1});
        expect(result1).toBe(CollisionType.BrickOther);

        const result2 = detectCollision({...state, x: 0, y: 0});
        expect(result2).toBe(CollisionType.NoCollision);
    });

    it('should detect no collision around hole', () => {
        const field = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0, 0],
            [1, 1, 1, 0, 1, 1, 1],
        ];
        const shape = [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];

        const tetrimino = new Tetrimino();
        jest.spyOn(tetrimino, 'shape', 'get').mockReturnValue(shape);

        const state = {
            ...new GameState(),
            stack: field,
            active: tetrimino
        };

        const result1 = detectCollision({...state, x: 2, y: 1});
        expect(result1).toBe(CollisionType.NoCollision);
    });

    it('should detect game over when spawn does not fit', () => {
        const shape = [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];

        const tetrimino = new Tetrimino();
        jest.spyOn(tetrimino, 'shape', 'get').mockReturnValue(shape);

        const state = {
            ...new GameState(),
            stack: createField(3, 3, 1),
            active: tetrimino,
            spawnX: 0,
            spawnY: 0
        };

        const result1 = detectCollision({...state, x: 0, y: 0});
        expect(result1).toBe(CollisionType.GameOver);
    });
});

describe('shape drawing', () => {
    it('should draw T shape on location', () => {
        const field = [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0],
        ];
        const shape = [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ];
        const expected = [
            [1, 1, 1],
            [0, 1, 0],
            [0, 0, 0],
        ];

        const result = drawShape(field, shape, 0, 0);
        expect(result.toString()).toBe(expected.toString());
    });

    it('should draw I shape on location', () => {
        const field = [
            [0, 0, 0],
            [0, 0, 0],
            [1, 1, 1],
        ];
        const shape = [
            [0, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ];
        const expected = [
            [1, 1, 1],
            [0, 0, 0],
            [1, 1, 1],
        ];

        const result = drawShape(field, shape, 0, 0);
        expect(result.toString()).toBe(expected.toString());
    });
});

describe('clearing lines', () => {
    it('should clear simple line', () => {
        const field = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0, 0],
            [1, 1, 1, 1, 1, 1, 1],
        ];
        const expected = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0, 0],
        ];

        const result = clearLines(field);
        expect(result.amount).toBe(1);
        expect(result.field.toString()).toBe(expected.toString());
    });

    it('should clear complex lines', () => {
        const field = [
            [1, 1, 1, 1, 1, 1, 1],
            [0, 1, 0, 1, 0, 1, 0],
            [1, 1, 1, 1, 1, 1, 1],
        ];
        const expected = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 1, 0, 1, 0],
        ];

        const result = clearLines(field);
        expect(result.amount).toBe(2);
        expect(result.field.toString()).toBe(expected.toString());
    });

    it('should clear complex lines between others', () => {
        const field = [
            [0, 0, 1, 1, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1],
            [1, 0, 1, 1, 1, 0, 1],
        ];
        const expected = [
            [0, 0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 1, 0, 0],
            [1, 0, 1, 1, 1, 0, 1],
        ];

        const result = clearLines(field);
        expect(result.amount).toBe(1);
        expect(result.field.toString()).toBe(expected.toString());
    });
})
