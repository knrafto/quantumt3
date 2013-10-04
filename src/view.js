var View = (function($) { "use strict";

  function show(elements) {
    elements.hide().fadeIn(150);
  }

  function remove(elements) {
    elements.fadeOut(150, function() {
      elements.remove();
    });
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

    _createPiece: function(className, c, moveNumber) {
      var text, piece,
          pieceClass = moveNumber % 2 == 1 ? "x" : "o";
      text = $("<p class='move-text'>" + moveNumber + "</p>");
      piece = $("<div>")
        .addClass(className)
        .append($("<div class='piece'>").addClass(pieceClass))
        .append(text)
        .appendTo(this._$cell(c));
      // Center text vertically
      text.css({"line-height": text.css("height")});
      return piece;
    },

    addClassical: function(c, moveNumber) {
      var $piece = this._createPiece("classical", c, moveNumber);
      show($piece);
      return this;
    },

    addQuantum: function(c, moveNumber) {
      var pieceSize, $piece,
          i = Math.floor((moveNumber - 1) / 3),
          j = (moveNumber - 1) % 3;

      $piece = this._createPiece("quantum", c, moveNumber);
      pieceSize = $piece.width();
      $piece.css({"top": i*pieceSize + "px", "left": j*pieceSize + "px"})
      show($piece);
      return this;
    },

    removeQuantum: function(c, moveNumber) {
      var $piece = this._$cell(c).find("p:contains(" + moveNumber + ")").parent();
      remove($piece);
      return this;
    },

    hasQuantum: function(c) {
      return this._$cell(c).find(".quantum").length !== 0;
    },

    clear: function(c) {
      remove(this._$cell(c).children());
      return this;
    },

    clearAll: function() {
      remove(this._$board.find(".cell").children());
    },

    addHighlights: function(cells, className) {
      var $highlight,
          $matchedCells = $(),
          view = this;
      cells.forEach(function(c) {
        $highlight = $("<div class='highlight'>").addClass(className);
        view._$cell(c).append($highlight);
        show($highlight);
      });
      return this;
    },

    clearHighlights: function(c) {
      remove(this._$board.find(".highlight"));
      return this;
    }
  };

  return View;
}(jQuery));
