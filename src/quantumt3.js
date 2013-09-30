(function() { "use strict";

  var cellSquares,
      board = new Board();

  function createSquares() {
    var i, j, c, row,
        boardSquare = $("<div class='board'/>").appendTo("#quantumt3");

    cellSquares = [];
    for (i = 0; i < 3; ++i) {
      row = $("<div class='board-row'/>");
      for (j = 0; j < 3; ++j) {
        c = 3*i + j + 1;
        cellSquares[c - 1] = $("<div class='board-cell'/>")
          .click(getHandler(c))
          .appendTo(row);
      }
      row.appendTo(boardSquare);
    }
  }

  function getHandler(c) {
    return function() {
      return cellClicked(c);
    };
  }

  function cellClicked(c) {
  }

  $(document).ready(createSquares);
}());
