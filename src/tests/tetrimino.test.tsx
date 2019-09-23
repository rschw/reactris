import {Tetrimino} from '../game/tetrimino';


it('should have expected fixed size', () => {
    const sut = new Tetrimino();
    expect(sut.shape.length).toBe(3);
    expect(sut.shape[0].length).toBe(3);
});
