export class Tetrimino {
    private _shapeIndex: number;
    private _rotationIndex: number;

    constructor() {
        this._shapeIndex = this._randomShapeIndex();
        this._rotationIndex = 0;
    }

    rotateCW() {
        this._rotationIndex = (this._rotationIndex + 1) % tetriminoShapesWithRotations[this._shapeIndex].length;
    }

    rotateCCW() {
        this._rotationIndex = this._rotationIndex - 1 >= 0
            ? this._rotationIndex - 1
            : tetriminoShapesWithRotations[this._shapeIndex].length - 1;
    }

    get shape() {
        // return color coded shape (unique cell values based on shape index offsetted by 1)
        return tetriminoShapesWithRotations[this._shapeIndex][this._rotationIndex]
            .map(row => row.map(col =>
                col > 0
                    ? this._shapeIndex + 1
                    : 0));
    }

    private _randomShapeIndex = () => Math.floor(Math.random() * tetriminoShapesWithRotations.length);
}

const tetriminoShapesWithRotations = [
    // O
    [
        [
            [1, 1, 0],
            [1, 1, 0],
            [0, 0, 0]
        ],
    ],
    // I
    [
        [
            [0, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
        ],
    ],
    // T
    [
        [
            [0, 1, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        [
            [0, 1, 0],
            [0, 1, 1],
            [0, 1, 0],
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [0, 1, 0],
        ],
        [
            [0, 1, 0],
            [1, 1, 0],
            [0, 1, 0],
        ],
    ],
    // L
    [
        [
            [1, 0, 0],
            [1, 1, 1],
            [0, 0, 0],
        ],
        [
            [0, 1, 1],
            [0, 1, 0],
            [0, 1, 0],
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [0, 0, 1],
        ],
        [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 0],
        ],
    ],
    // J
    [
        [
            [0, 0, 1],
            [1, 1, 1],
            [0, 0, 0],
        ],
        [
            [0, 1, 0],
            [0, 1, 0],
            [0, 1, 1],
        ],
        [
            [0, 0, 0],
            [1, 1, 1],
            [1, 0, 0],
        ],
        [
            [1, 1, 0],
            [0, 1, 0],
            [0, 1, 0],
        ],
    ],
    // Z
    [
        [
            [1, 1, 0],
            [0, 1, 1],
            [0, 0, 0],
        ],
        [
            [0, 0, 1],
            [0, 1, 1],
            [0, 1, 0],
        ],
        [
            [0, 0, 0],
            [1, 1, 0],
            [0, 1, 1],
        ],
        [
            [0, 1, 0],
            [1, 1, 0],
            [1, 0, 0],
        ],
    ],
    // S
    [
        [
            [0, 1, 1],
            [1, 1, 0],
            [0, 0, 0],
        ],
        [
            [0, 1, 0],
            [0, 1, 1],
            [0, 0, 1],
        ],
        [
            [0, 0, 0],
            [0, 1, 1],
            [1, 1, 0],
        ],
        [
            [1, 0, 0],
            [1, 1, 0],
            [0, 1, 0],
        ],
    ]
]
