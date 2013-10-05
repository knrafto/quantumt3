$(document).ready(function() {
  var board = new Board(),
      view = new View("#quantumt3"),
      halfMove = null;

  view.onClick = boardClicked;
  $("button[name='new-game']").click(newGame);
  $("button[name='undo']").click(undo);
  $("button[name='rules']").click(openRules);
  $("#scores").hide();

  function boardClicked(c) {
    var nextType = board.nextType(),
        moveNumber = board.placed() + 1,
        move = null;

    if (nextType === Board.QUANTUM) {
      if (halfMove === null && Array.isArray(board.get(c))) {
        view.addQuantum(c, moveNumber);
        halfMove = c;
      } else if (halfMove === c) {
        view.removeQuantum(c, moveNumber);
        halfMove = null;
      } else {
        move = {type: Board.QUANTUM, cells: [c, halfMove]};
      }
    } else if (nextType === Board.COLLAPSE) {
      move = {type: Board.COLLAPSE, cells: c};
    } else if (nextType === Board.CLASSICAL) {
      move = {type: Board.CLASSICAL, cells: c};
    }

    if (!(move && board.move(move))) {
      return;
    }

    if (nextType === Board.QUANTUM) {
      halfMove = null;
      view.addQuantum(c, moveNumber);
    } else if (nextType === Board.COLLAPSE) {
      syncView();
    } else if (nextType === Board.CLASSICAL) {
      view.addClassical(c, moveNumber);
    }

    updateHighlights();
  }

  function newGame() {
    board.clear();
    view.clear();
    halfMove = null;
    $("#scores").hide()
  }

  function undo() {
    var moveNumber = board.placed() + 1;

    if (halfMove) {
      view.removeQuantum(halfMove, moveNumber);
      halfMove = null;
      return;
    }

    var move = board.undo();
    moveNumber -= 1;
    if (!move) {
      return;
    }

    if (move.type === Board.QUANTUM) {
      view.removeQuantum(move.cells[0], moveNumber);
      view.removeQuantum(move.cells[1], moveNumber);
    } else if (move.type === Board.COLLAPSE) {
      syncView();
    } else if (move.type === Board.CLASSICAL) {
      view.clearCell(move.cells);
    }
    updateHighlights();
  }

  function syncView() {
    var i, piece;
    for (i = 1; i <= 9; ++i) {
      piece = board.get(i);
      if (!Array.isArray(piece) && view.hasQuantum(i)) {
        view.clearCell(i);
        view.addClassical(i, piece);
      } else if (Array.isArray(piece) && view.hasClassical(i)) {
        view.clearCell(i);
        piece.forEach(function(moveNumber) {
          view.addQuantum(i, moveNumber);
        });
      }
    }
  }

  function updateHighlights() {
    view.clearHighlights();

    if (board.nextType() === Board.COLLAPSE) {
      updateCollapseHighlights();
    }

    if (board.gameOver()) {
      updateTictactoeHighlights();
      scores = stringifyScores();
      $("#scores").text(scores).slideDown();
    } else {
      $("#scores").hide();
    }
  }

  function stringifyScores() {
    var scores = board.scores();

    function stringify(player) {
      var result,
          half = "\u00bd"
          score = scores[player];
      switch (score) {
        case 0: return "0";
        case 1: return half;
        case 2: return "1";
        case 3: return "1" + half;
        case 4: return "2";
      }
      return "";
    }

    return stringify(Board.PLAYERX) + " \u2014 " + stringify(Board.PLAYERO);
  }

  function updateCollapseHighlights() {
    var i;
    for (i = 1; i <= 9; ++i) {
      if (board.canMove({type: Board.COLLAPSE, cells: i})) {
        view.addHighlight(i, "collapse");
      }
    }
  }

  function updateTictactoeHighlights() {
    var playerClass;
    board.tictactoes().forEach(function(tictactoe) {
      playerClass = tictactoe.player === Board.PLAYERX ? "x" : "o";
      view.addHighlights(tictactoe.cells, playerClass);
    });
  }

  function openRules() {
    window.open("http://www.wikipedia.org/wiki/Quantum_tic-tac-toe", "_blank");
  }
});
