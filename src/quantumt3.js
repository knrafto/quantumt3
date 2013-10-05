$(document).ready(function() {
  var board = new Board(),
      view = new View("#quantumt3"),
      halfMove = null;
  view.onClick = boardClicked;
  $("button[name='new-game']").click(newGame);
  $("button[name='undo']").click(undo);

  function boardClicked(c) {
    var i, piece,
        nextType = board.nextType(),
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
      for (i = 1; i <= 9; ++i) {
        piece = board.get(i);
        if (!Array.isArray(piece) && view.hasQuantum(i)) {
          view.clearCell(i);
          view.addClassical(i, piece);
        }
      }
    } else if (nextType === Board.CLASSICAL) {
      view.addClassical(c, moveNumber);
    }

    updateHighlights();
  }

  function newGame() {
    board.clear();
    view.clear();
    halfMove = null;
  }

  function undo() {
    var i, piece,
        moveNumber = board.placed() + 1;

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
      for (i = 1; i <= 9; ++i) {
        piece = board.get(i);
        if (Array.isArray(piece) && view.hasClassical(i)) {
          view.clearCell(i);
          piece.forEach(function(moveNumber) {
            view.addQuantum(i, moveNumber);
          });
        }
      }
    } else if (move.type === Board.CLASSICAL) {
      view.clearCell(c);
    }
    updateHighlights();
  }

  function updateHighlights() {
    var cells, playerClass;
    view.clearHighlights();

    if (board.nextType() === Board.COLLAPSE) {
      cells = [];
      for (i = 1; i <= 9; ++i) {
        if (board.canMove({type: Board.COLLAPSE, cells: i})) {
          cells.push(i);
        }
      }
      view.addHighlights(cells, "collapse");
    }

    board.tictactoes().forEach(function(tictactoe) {
      playerClass = tictactoe.player === Board.PLAYERX ? "x" : "o";
      view.addHighlights(tictactoe.cells, playerClass);
    });
  }
});
