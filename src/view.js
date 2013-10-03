var View = (function($) { "use strict";

  $.fn.translate = function(dx, dy) {
    var offset = this.offset();
    offset["left"] += dx;
    offset["top"] += dy;
    return this.offset(offset);
  }

  function createPiece(className, moveNumber) {
    var pieceClass = moveNumber % 2 == 1 ? "x" : "o";
    return $("<div>")
      .addClass(className)
      .append($("<div class='piece'>").addClass(pieceClass))
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

    addClassical: function(c, moveNumber) {
      createPiece("classical", moveNumber).appendTo(this._$cell(c));
      return this;
    },

    addQuantum: function(c, moveNumber) {
      var pieceSize, $piece,
          i = Math.floor((moveNumber - 1) / 3),
          j = (moveNumber - 1) % 3;

      $piece = createPiece("quantum", moveNumber)
        .appendTo(this._$cell(c));
      pieceSize = $piece.width();
      $piece.translate(j*pieceSize, i*pieceSize);
      return this;
    },

    removeQuantum: function(c, moveNumber) {
      this._$cell(c).find("p:contains(" + moveNumber + ")").parent().remove();
      return this;
    },

    hasQuantum: function(c) {
      return this._$cell(c).find(".quantum").length !== 0;
    },

    clear: function(c) {
      this._$cell(c).empty();
      return this;
    },

    clearAll: function() {
      this._$board.find(".cell").empty();
    },

    addHighlight: function(c, className) {
      var highlight = $("<div class='highlight'>").appendTo(this._$cell(c));
      if (className) {
        highlight.addClass(className);
      }
      return this;
    },

    clearHighlight: function(c) {
      this._$cell(c).find(".highlight").remove();
      return this;
    },

    clearAllHighlights: function(c) {
      this._$board.find(".highlight").remove();
      return this;
    }
  };

  return View;
}(jQuery));
