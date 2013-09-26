var Board = (function() { "use strict";

  /* Extend a target object by copying all properties from a source object
   * to it.
   */
  function extend(target, source) {
    for (var prop in source) {
      target[prop] = source[prop];
    }
    return target;
  }

  /* Return the last element of an array. */
  function last(arr) {
    return arr[arr.length - 1];
  }

  /* Parse a move in one of the following formats:
   * Quantum:   '6-3'
   * Collapse:  '->3'
   * Classical: '8'
   */
  function parseMove(s) {
    if (s.match(/\d-\d/)) {
      var a = +s.charAt(0), b = +s.charAt(2);
      if (a && b) {
        return { type: Board.QUANTUM, cells: [a, b] };
      }      
    } else if (s.match(/->\d/)) {
      var a = +s.charAt(2);
      if (a) {
        return { type: Board.COLLAPSE, cells: a };
      }
    } else if (s.match(/\d/)) {
      var a = +s;
      if (a) {
        return { type: Board.CLASSICAL, cells: a };
      }
    }
    return null;
  }

  /* Take either a string or a move object, and return a move object. */
  function convertMove(move) {
    if (typeof move === 'string') {
      return parseMove(move);
    } else if (typeof move === 'object') {
      return move;
    }
    return null;
  }

  var Board = function() {
    this.clear();
  };

  // Public class constants
  extend(Board, {
    QUANTUM: 'quantum',
    COLLAPSE: 'collapse',
    CLASSICAL: 'classical',

    PLAYERX: 'X',
    PLAYERO: 'O',

    WIN_POSITIONS: [
      // Rows
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      // Columns
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
      // Diagonals
      [1, 5, 9],
      [3, 5, 7]
    ]
  });

  // Prototype methods
  extend(Board.prototype, {
    _isQuantum: function(i) {
      return Array.isArray(this._board[i - 1]);
    },

    _countClassicalPieces: function() {
      var classical = 0;
      for (var i = 1; i <= 9; ++i) {
        if (!this._isQuantum(i)) {
          ++classical;
        }
      }
      return classical;
    },

    clear: function() {
      this._board = [];
      this._edges = [];
      for (var i = 0; i < 9; ++i) {
        this._board[i] = [];
        this._edges[i] = [];
      }

      this._placed = 0;
      this._nextType = Board.QUANTUM;

      this._tictactoes = [];
    },

    get: function(i) {
      var cell = this._board[i - 1];
      return cell ?
        { type: Array.isArray(cell) ? Board.QUANTUM : Board.CLASSICAL,
          pieces: cell
        } : null;
    },

    turn: function() {
      return this._placed % 2 ? Board.PLAYERO : Board.PLAYERX;
    },

    gameOver: function() {
      return !this._nextType;
    },

    tictactoes: function() {
      return this._tictactoes;
    },

    _canMove: function (move) {
      if (!move || move.type !== this._nextType) {
        return false;
      }

      if (move.type === Board.QUANTUM) {
        var a = move.cells[0], b = move.cells[1];
        return a && b && this._isQuantum(a) && this._isQuantum(b) && a !== b;
      } else if (move.type === Board.COLLAPSE) {
        var a = move.cells;
        return a && this._isQuantum(a) &&
               last(this._board[a - 1]) === this._placed;
      } else {
        var a = move.cells;
        return a && this._isQuantum(a);
      }
    },

    _makeMove: function(move) {
      if (move.type === Board.QUANTUM) {
        var a = move.cells[0], b = move.cells[1];
        this._placed++;
        this._nextType = this._reachable(a, b) ? Board.COLLAPSE
                                               : Board.QUANTUM;
        this._board[a - 1].push(this._placed);
        this._board[b - 1].push(this._placed);
        this._edges[a - 1].push(b);
        this._edges[b - 1].push(a);
      } else if (move.type === Board.COLLAPSE) {
        var a = move.cells;
        this._collapseCell(this._placed, a);
        this._nextType = this._countClassicalPieces() == 8 ? Board.CLASSICAL
                                                           : Board.QUANTUM;
        this._updateGameStatus();
      } else {
        var a = move.cells;
        this._placed++;
        this._board[a - 1] = this._placed;
        this._updateGameStatus();
      }
    },

    canMove: function(move) {
      return this._canMove(convertMove(move));
    },

    move: function(move) {
      var moveObj = convertMove(move);

      if (!this._canMove(moveObj)) {
        return null;
      }

      this._makeMove(moveObj);
      return moveObj;
    },

    _reachable: function(src, dest) {
      var visited = [];
      var edges = this._edges;
      function visit(i) {
        if (visited.indexOf(i) !== -1) {
          return;
        }
        visited.push(i);
        var neighbors = edges[i - 1];
        for (var j = 0; j < neighbors.length; ++j) {
          visit(neighbors[j]);
        }
      }

      visit(src);
      return visited.indexOf(dest) !== -1;
    },

    _collapseCell: function(piece, i) {
      /* It seems like the last move will be collapsed into two cells here, but
       * since the moves are ordered, some other move will be collapsed into the
       * other cell before the last move is processed.
       */
      if (!this._isQuantum(i)) {
        return;
      }
      var cell = this._board[i - 1];
      var neighbors = this._edges[i - 1];
      this._board[i - 1] = piece;
      this._edges[i - 1] = [];
      for (var j = 0; j < cell.length; ++j) {
        this._collapseCell(cell[j], neighbors[j]);
      }
    },

    _updateGameStatus: function() {
      var tictactoes = [];
      var board = this._board;

      function isX(c) {
        var cell = board[c - 1];
        return typeof cell === 'number' && cell % 2 == 1;
      }

      function isO(c) {
        var cell = board[c - 1];
        return typeof cell === 'number' && cell % 2 == 0;
      }

      for (var i = 0; i < Board.WIN_POSITIONS.length; ++i) {
        var position = Board.WIN_POSITIONS[i];
        if (position.every(isX)) {
          tictactoes.push({ player: Board.PLAYERX, cells: position });
        } else if (position.every(isO)) {
          tictactoes.push({ player: Board.PLAYERO, cells: position });
        }  
      }

      if (tictactoes.length || this._countClassicalPieces() === 9) {
        this._nextType = null;
      }
      this._tictactoes = tictactoes;
    }
  });

  return Board;
})();
