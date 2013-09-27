var assert = chai.assert;

suite("Positions", function() {
  function makeScore(arr) {
    var scores = {}
    scores[Board.PLAYERX] = arr[0];
    scores[Board.PLAYERO] = arr[1];
    return scores;
  }

  var positions = [
    {moves: "",
      board: [[], [], [], [], [], [], [], [], []],
      turn: Board.PLAYERX,
      gameOver: false},
    {moves: "1-9 1-3 3-4",
      board: [[1, 2], [], [2, 3], [3], [], [], [], [], [1]],
      turn: Board.PLAYERO,
      gameOver: false},
    {moves: "1-4 6-7 5-8 5-9 2-5 2-4 1-2 ->1",
      board: [7, 6, [], 1, 5, [2], [2], 3, 4],
      turn: Board.PLAYERO,
      gameOver: false},
    {moves: "1-4 6-7 5-8 5-9 2-5 2-4 1-2 ->1 6-7 ->6 3",
      board: [7, 6, 9, 1, 5, 8, 2, 3, 4],
      turn: Board.PLAYERO,
      gameOver: true,
      tictactoes: [],
      scores: makeScore([0, 0])},
    {moves: "1-5 5-6 2-5 3-6 3-5 ->3",
      board: [1, 3, 5, [], 2, 4, [], [], []],
      turn: Board.PLAYERO,
      gameOver: true,
      tictactoes: [{player: Board.PLAYERX,
                     cells: [1, 2, 3],
                     pieces: [1, 3, 5],
                     score: 2}],
      scores: makeScore([2, 0])},
    {moves: "1-7 1-4 1-2 1-5 1-3 1-6 1-7 ->1",
      board: [7, 3, 5, 2, 4, 6, 1, [], []],
      turn: Board.PLAYERO,
      gameOver: true,
      tictactoes: [{player: Board.PLAYERX,
                     cells: [1, 2, 3],
                     pieces: [7, 3, 5],
                     score: 1},
                   {player: Board.PLAYERO,
                     cells: [4, 5, 6],
                     pieces: [2, 4, 6],
                     score: 2}],
      scores: makeScore([1, 2])},
    {moves: "1-3 2-4 3-5 4-6 5-7 6-8 7-9 2-8 ->8 1-5 ->1",
      board: [9, 2, 1, 4, 3, 6, 5, 8, 7],
      turn: Board.PLAYERO,
      gameOver: true,
      tictactoes: [{player: Board.PLAYERX,
                     cells: [1, 5, 9],
                     pieces: [9, 3, 7],
                     score: 1},
                   {player: Board.PLAYERX,
                     cells: [3, 5, 7],
                     pieces: [1, 3, 5],
                     score: 2}],
      scores: makeScore([3, 0])},
    {moves: "1-3 2-4 3-7 4-6 7-9 6-8 9-1 ->9 2-8 ->8 5",
      board: [1, 2, 3, 4, 9, 6, 5, 8, 7],
      turn: Board.PLAYERO,
      gameOver: true,
      tictactoes: [{player: Board.PLAYERX,
                     cells: [1, 5, 9],
                     pieces: [1, 9, 7],
                     score: 2},
                   {player: Board.PLAYERX,
                     cells: [3, 5, 7],
                     pieces: [3, 9, 5],
                     score: 2}],
      scores: makeScore([4, 0])}
  ];

  positions.forEach(function(position) {
    test(position.moves, function() {
      var b = new Board(), i, expected, actual;
      position.moves.split(' ').forEach(function(move) {
        var result;
        if (move) {
          result = b.move(move);
          assert.isNotNull(result, "unsuccessful move " + move);
        }
      });

      for (i = 1; i <= 9; ++i) {
        expected = position.board[i - 1];
        actual = b.get(i).pieces;
        if (Array.isArray(expected)) {
          assert.deepEqual(expected, actual);
        } else {
          assert.strictEqual(expected, actual);
        }
      }

      assert.equal(b.turn(), position.turn);
      assert.strictEqual(b.gameOver(), position.gameOver);

      if (position.gameOver) {
        assert.deepEqual(b.tictactoes(), position.tictactoes);
        assert.deepEqual(b.scores(), position.scores);
      } else {
        assert.deepEqual(b.tictactoes(), []);
        assert.isNull(b.scores());
      }
    });
  });
});

suite("Moves", function() {
  var positions = [
    {start: "",
      move: "1-2",
      legal: true,
      result: { type: Board.QUANTUM, cells: [1, 2] }},
    {start: "1-2 2-3 1-3",
      move: "->1",
      legal: true,
      result: { type: Board.COLLAPSE, cells: 1 }},
    {start: "1-4 6-7 5-8 5-9 2-5 2-4 1-2 ->1 6-7 ->6",
      move: "3",
      legal: true,
      result: { type: Board.CLASSICAL, cells: 3 }},
    {start: "",
      move: "1-1",
      legal: false},
    {start: "",
      move: "->1",
      legal: false},
    {start: "",
      move: "1",
      legal: false},
    {start: "1-2 2-3 1-3",
      move: "4-5",
      legal: false},
    {start: "1-2 2-3 1-3 ->1",
      move: "3-4",
      legal: false},
    {start: "1-2 2-3 1-3 ->1",
      move: "->3",
      legal: false}
  ];
  positions.forEach(function(position) {
    test(position.start + ' (' + position.move + ')', function() {
      var b = new Board(), result;
      position.start.split(' ').forEach(function(move) {
        if (move) {
          b.move(move);
        }
      });

      assert.strictEqual(b.canMove(position.move), position.legal);

      result = b.move(position.move);
      if (position.legal) {
        assert.deepEqual(result, position.result);
      } else {
        assert.isNull(result);
      }
    });
  });
});

suite('History/Undo', function() {
  var positions = [];
  positions.forEach(function(position) {
    test(position.start + ' (' + position.move + ')', function() {
      var b1 = new Board(), b2 = new Board(),
          moveResult, undoResult, i;
      position.start.split(' ').forEach(function(move) {
        if (move) {
          b1.move(move);
          b2.move(move);
        }
      });
      moveResult = b1.move(position.move);
      undoResult = b1.undo();
      assert.deepEqual(undoResult, moveResult);

      assert.equal(b1.history(false).join(' '), position.start);

      for (i = 1; i <= 9; ++i) {
        assert.deepEqual(b1.get(i), b2.get(i));
      }
      assert.deepEqual(b1.turn(), b2.turn());
      assert.deepEqual(b1.gameOver(), b2.gameOver());
      assert.deepEqual(b1.tictactoes(), b2.tictactoes());
      assert.deepEqual(b2.scores(), b2.scores());
    });
  });
});
