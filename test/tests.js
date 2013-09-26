var assert = chai.assert;

suite("Positions", function() {
  var positions = [
    {moves: "",
      board: [[], [], [], [], [], [], [], [], []],
      turn: Board.PLAYERX,
      gameOver: false,
      tictactoes: []},
    {moves: "1-9 1-3 3-4",
      board: [[1, 2], [], [2, 3], [3], [], [], [], [], [1]],
      turn: Board.PLAYERO,
      gameOver: false,
      tictactoes: []},
    {moves: "1-4 6-7 5-8 5-9 2-5 2-4 1-2 ->1",
      board: [7, 6, [], 1, 5, [2], [2], 3, 4],
      turn: Board.PLAYERO,
      gameOver: false,
      tictactoes: []},
    {moves: "1-4 6-7 5-8 5-9 2-5 2-4 1-2 ->1 6-7 ->6 3",
      board: [7, 6, 9, 1, 5, 8, 2, 3, 4],
      turn: Board.PLAYERO,
      gameOver: true,
      tictactoes: []},
    {moves: "1-5 5-6 2-5 3-6 3-5 ->3",
      board: [1, 3, 5, [], 2, 4, [], [], []],
      turn: Board.PLAYERO,
      gameOver: true,
      tictactoes: [{ player: Board.PLAYERX, cells: [1, 2, 3] }]},
    {moves: "1-7 1-4 1-2 1-5 1-3 1-6 1-7 ->1",
      board: [7, 3, 5, 2, 4, 6, 1, [], []],
      turn: Board.PLAYERO,
      gameOver: true,
      tictactoes: [{ player: Board.PLAYERX, cells: [1, 2, 3] },
                   { player: Board.PLAYERO, cells: [4, 5, 6] }]},
    {moves: "1-3 2-4 3-5 4-6 5-7 6-8 7-9 2-8 ->8 1-5 ->1",
      board: [9, 2, 1, 4, 3, 6, 5, 8, 7],
      turn: Board.PLAYERO,
      gameOver: true,
      tictactoes: [{ player: Board.PLAYERX, cells: [1, 5, 9] },
                   { player: Board.PLAYERX, cells: [3, 5, 7] }]},
    {moves: "1-3 2-4 3-7 4-6 7-9 6-8 9-1 ->9 2-8 ->8 5",
      board: [1, 2, 3, 4, 9, 6, 5, 8, 7],
      turn: Board.PLAYERO,
      gameOver: true,
      tictactoes: [{ player: Board.PLAYERX, cells: [1, 5, 9] },
                   { player: Board.PLAYERX, cells: [3, 5, 7] }]}
  ];

  positions.forEach(function(position) {
    var b = new Board();
    test(position.moves, function() {
      position.moves.split(' ').forEach(function(move) {
        if (move) {
          var result = b.move(move);
          assert.isNotNull(result, "unsuccessful move " + move);
        }
      });

      for (var i = 1; i <= 9; ++i) {
        var expected = position.board[i - 1];
        var actual = b.get(i).pieces;
        if (Array.isArray(expected)) {
          assert.deepEqual(expected, actual);
        } else {
          assert.strictEqual(expected, actual);
        }
      }
      assert.equal(b.turn(), position.turn);
      assert.strictEqual(b.gameOver(), position.gameOver);
      assert.deepEqual(b.tictactoes(), position.tictactoes);
    });
  });
});
