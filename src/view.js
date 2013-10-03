var View = (function($) { "use strict";

  function createPiece(className, moveNumber) {
    var pieceClass = "piece-" + (moveNumber % 2 == 1 ? "x" : "o");
    return $("<div>")
      .addClass(className)
      .append($("<div>").addClass(pieceClass))
      .append($("<p class='move-text'>" + moveNumber + "</p>"));
  }

  function View(container) {
    var i, j, c, properties, row, board;

    board = $("<div class='quantumt3'>").appendTo(container);

    function makeHandler(view, c) {
      return function() {
        return view._onClick(c);
      };
    }

    for (i = 0; i < 3; ++i) {
      row = $("<div class='row'>").appendTo(board);
      for (j = 0; j < 3; ++j) {
        c = 3*i + j + 1;
        $("<div class='cell'>").click(makeHandler(this, c)).appendTo(row);
      }
    }

    this._$board = board;
  }

  View.prototype = {
    _onClick: function(c) {
      var handler = this.onClick;
      if (handler) {
        handler(c);
      }
    },

    _$cell: function(c) {
      return this._$board.find(".cell").eq(c - 1);
    },

    clear: function(c) {
      this._$cell(c).empty();
      return this;
    },

    addClassical: function(c, moveNumber) {
      this._$cell(c).append(createPiece("classical-piece", moveNumber));
      return this;
    }
  };

  return View;
}(jQuery));
