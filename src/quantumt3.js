$(document).ready(function() {
  var board = new Board(),
      view = new View("#quantumt3"),
      halfMove = null,
      collapseCells = [];
  view.onClick = onClick;

  function onClick(c) {
    var nextType = board.nextType();
    if (nextType === Board.QUANTUM) {
      moveQuantum(c);
    } else if (nextType === Board.COLLAPSE) {
      moveCollapse(c);
    } else if (nextType === Board.CLASSICAL) {
      moveClassical(c);
    }
  }

  function moveQuantum(c) {
    if (!Array.isArray(board.get(c))) {
      return;
    }
    var cells = [c, halfMove],
        moveNumber = board.placed() + 1;
    if (halfMove === null) {
      view.addQuantum(c, moveNumber);
      halfMove = c;
    } else if (halfMove === c) {
      view.removeQuantum(c, moveNumber);
      halfMove = null;
    } else {
      board.move({type: Board.QUANTUM, cells: cells});
      view.addQuantum(c, moveNumber);
      halfMove = null;
      if (board.nextType() === Board.COLLAPSE) {
        view.addHighlights(cells, "collapse");
      }
    }
  }

  function moveCollapse(c) {
    var i, piece,
        move = {type: Board.COLLAPSE, cells: c};
    if (!board.move(move)) {
      return;
    }
    view.clearHighlights();
    for (i = 1; i <= 9; ++i) {
      piece = board.get(i);
      if (!Array.isArray(piece) && view.hasQuantum(i)) {
        view.clear(i);
        view.addClassical(i, piece);
      }
    }
    checkGameStatus();
  }

  function moveClassical(c) {
    if (!Array.isArray(board.get(c))) {
      return;
    }
    var moveNumber = board.placed() + 1;
    board.move({type: Board.CLASSICAL, cells: c});
    view.addClassical(c, moveNumber);
    checkGameStatus();
  }

  function checkGameStatus() {
    var playerClass;
    board.tictactoes().forEach(function(tictactoe) {
      playerClass = tictactoe.player === Board.PLAYERX ? "x" : "o";
      view.addHighlights(tictactoe.cells, playerClass);
    });
  }
});
