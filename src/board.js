var Board = (function() { "use strict";

  /* Make a shallow copy of an array. */
  function arrayCopy(source) {
    var i,
        len = source.length, target = new Array(len);
    for (i = 0; i < len; ++i) {
      target[i] = source[i];
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
    var a, b;
    if (s.match(/\d-\d/)) {
      a = +s.charAt(0);
      b = +s.charAt(2);
      if (a && b) {
        return { type: Board.QUANTUM, cells: [a, b] };
      }      
    } else if (s.match(/->\d/)) {
      a = +s.charAt(2);
      if (a) {
        return { type: Board.COLLAPSE, cells: a };
      }
    } else if (s.match(/\d/)) {
      a = +s;
      if (a) {
        return { type: Board.CLASSICAL, cells: a };
      }
    }
    return null;
  }

  /* Render a move as a string. The inverse of parseMove(s). */
  function stringifyMove(move) {
    if (!move) {
      return '';
    }
    if (move.type === Board.QUANTUM) {
      return move.cells[0] + '-' + move.cells[1];
    }
    if (move.type === Board.COLLAPSE) {
      return '->' + move.cells;
    }
    if (move.type === Board.CLASSICAL) {
      return move.cells.toString();
    }
    return '';
  }

  /* Take either a string or a move object, and return a move object. */
  function convertMove(move) {
    if (typeof move === 'string') {
      return parseMove(move);
    }
    if (typeof move === 'object') {
      return move;
    }
    return null;
  }

  var Board = function() {
    this.clear();
  };

  // Public class constants
  Board.QUANTUM = 'quantum';
  Board.COLLAPSE = 'collapse';
  Board.CLASSICAL = 'classical';

  Board.PLAYERX = 'X';
  Board.PLAYERO = 'O';

  Board.WIN_POSITIONS = [
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
  ];

  // Prototype methods
  Board.prototype = {
    clear: function() {
      var i;
      this._board = [];
      this._edges = [];
      for (i = 0; i < 9; ++i) {
        this._board[i] = [];
        this._edges[i] = [];
      }

      this._placed = 0;
      this._nextType = Board.QUANTUM;
      this._tictactoes = [];

      this._history = [];
      this._collapseStates = [];
    },

    board: function() {
      return this._board;
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

    scores: function () {
      var i, tictactoe,
          scores = {}, tictactoes = this._tictactoes;
      if (!this.gameOver()) {
        return null;
      }
      scores[Board.PLAYERX] = scores[Board.PLAYERO] = 0;
      for (i = 0; i < tictactoes.length; ++i) {
        tictactoe = tictactoes[i];
        scores[tictactoe.player] += tictactoe.score;
      }
      return scores;
    },

    canMove: function(move) {
      return this._canMove(convertMove(move));
    },

    move: function(move) {
      var moveObj = convertMove(move);

      if (!this._canMove(moveObj)) {
        return null;
      }

      this._history.push(moveObj);
      this._applyMove(moveObj);
      return moveObj;
    },

    history: function(verbose) {
      var i,
          history = this._history, terseHistory = [];
      if (verbose) {
        return history;
      }
      for (i = 0; i < history.length; ++i) {
        terseHistory[i] = stringifyMove(history[i]);
      }
      return terseHistory;
    },

    undo: function() {
      var moveObj = this._history.pop();
      if (moveObj) {
        this._unapplyMove(moveObj);
      }
      return moveObj;
    },

    _isQuantum: function(i) {
      return Array.isArray(this._board[i - 1]);
    },

    _countClassicalPieces: function() {
      var i,
          classical = 0;
      for (i = 1; i <= 9; ++i) {
        if (!this._isQuantum(i)) {
          ++classical;
        }
      }
      return classical;
    },

    _canMove: function (move) {
      if (!move || move.type !== this._nextType) {
        return false;
      }

      var a, b;
      if (move.type === Board.QUANTUM) {
        a = move.cells[0];
        b = move.cells[1];
        return a && b && this._isQuantum(a) && this._isQuantum(b) && a !== b;
      }
      if (move.type === Board.COLLAPSE) {
        a = move.cells;
        return a && this._isQuantum(a) &&
               last(this._board[a - 1]) === this._placed;
      }
      if (move.type === Board.CLASSICAL) {
        a = move.cells;
        return a && this._isQuantum(a);
      }
      return false;
    },

    _applyMove: function(move) {
      var a, b;
      if (move.type === Board.QUANTUM) {
        a = move.cells[0];
        b = move.cells[1];
        this._placed++;
        if (this._reachable(a, b)) {
            this._nextType = Board.COLLAPSE;
        }
        this._board[a - 1].push(this._placed);
        this._board[b - 1].push(this._placed);
        this._edges[a - 1].push(b);
        this._edges[b - 1].push(a);
      } else if (move.type === Board.COLLAPSE) {
        a = move.cells;
        this._collapseStates.push(arrayCopy(this._board));
        this._collapseCell(this._placed, a);
        this._nextType = this._countClassicalPieces() === 8 ? Board.CLASSICAL
                                                            : Board.QUANTUM;
        this._updateGameStatus();
      } else if (move.type === Board.CLASSICAL) {
        a = move.cells;
        this._placed++;
        this._board[a - 1] = this._placed;
        this._updateGameStatus();
      }
    },

    _unapplyMove: function(move) {
      var a, b;
      this._nextType = move.type;
      this._tictactoes = [];
      if (move.type === Board.QUANTUM) {
        a = move.cells[0];
        b = move.cells[1];
        this._placed--;
        this._board[a - 1].pop();
        this._board[b - 1].pop();
        this._edges[a - 1].pop();
        this._edges[b - 1].pop();
      } else if (move.type === Board.COLLAPSE) {
        this._board = this._collapseStates.pop();
      } else if (move.type === Board.CLASSICAL) {
        a = move.cells;
        this._placed--;
        this._board[a - 1] = [];
      }
    },

    _reachable: function(src, dest) {
      var visited = [], edges = this._edges;
      function visit(c) {
        var i, neighbors;
        if (visited.indexOf(c) !== -1) {
          return;
        }
        visited.push(c);
        neighbors = edges[c - 1];
        for (i = 0; i < neighbors.length; ++i) {
          visit(neighbors[i]);
        }
      }

      visit(src);
      return visited.indexOf(dest) !== -1;
    },

    _collapseCell: function(piece, c) {
      /* It seems like the last move will be collapsed into two cells here, but
       * since the moves are ordered, some other move will be collapsed into the
       * other cell before the last move is processed.
       */
      var i, 
          neighbors = this._edges[c - 1], cells = this._board[c - 1];
      if (!Array.isArray(cells)) {
        return;
      }
      this._board[c - 1] = piece;
      for (i = 0; i < neighbors.length; ++i) {
        this._collapseCell(cells[i], neighbors[i]);
      }
    },

    _updateGameStatus: function() {
      var i, j, cells, pieces, player, minPiece, rowMaxPiece,
          tictactoes = [];

      function isX(c) {
        return typeof c === 'number' && c % 2 === 1;
      }

      function isO(c) {
        return typeof c === 'number' && c % 2 === 0;
      }

      function maxPiece(tictactoe) {
        return Math.max.apply(null, tictactoe.pieces);
      }

      // Find tic-tac-toes
      for (i = 0; i < Board.WIN_POSITIONS.length; ++i) {
        cells = Board.WIN_POSITIONS[i];
        pieces = [];
        player = null;
        for (j = 0; j < cells.length; ++j) {
          pieces[j] = this._board[cells[j] - 1];
        }
        if (pieces.every(isX)) {
          player = Board.PLAYERX;
        } else if (pieces.every(isO)) {
          player = Board.PLAYERO;
        }
        if (player) {
          tictactoes.push({
            player: player,
            cells: cells,
            pieces: pieces});
        }
      }

      // Score tic-tac-toes
      minPiece = 9;
      for (i = 0; i < tictactoes.length; ++i) {
        rowMaxPiece = maxPiece(tictactoes[i]);
        if (minPiece > rowMaxPiece) {
          minPiece = rowMaxPiece;
        }
      }
      for (i = 0; i < tictactoes.length; ++i) {
        tictactoes[i].score = minPiece === maxPiece(tictactoes[i]) ? 2 : 1;
      }

      if (tictactoes.length || this._countClassicalPieces() === 9) {
        this._nextType = null;
      }
      this._tictactoes = tictactoes;
    }
  };

  return Board;
}());
