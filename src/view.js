var View = (function($) { "use strict";

  $.fn.fadeShow = function() {
    return this.hide().fadeIn(150);
  };

  $.fn.fadeRemove = function() {
    var elements = this;
    return this.fadeOut(150, function() {
      elements.remove();
    });
  };

  function View(container) {
    var i, j, c, properties, row,
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
        $("<div class='cell'>")
          .appendTo(row)
          .click(makeHandler(this, c));
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
      var pieceClass = moveNumber % 2 == 1 ? "x" : "o",
          piece = $("<div>").addClass(className),
          text = $("<p class='move-text'>" + moveNumber + "</p>");
      piece
        .append($("<div class='piece'>").addClass(pieceClass))
        .append(text)
        .appendTo(this._$cell(c));
      // Center text vertically
      text.css({"text-align": "center", "line-height": text.css("height")});
      return piece;
    },

    addClassical: function(c, moveNumber) {
      this._createPiece("classical", c, moveNumber).fadeShow();
    },

    hasClassical: function(c) {
      return this._$cell(c).find(".classical").length !== 0;
    },

    addQuantum: function(c, moveNumber) {
      var pieceSize, $piece,
          i = Math.floor((moveNumber - 1) / 3),
          j = (moveNumber - 1) % 3;

      $piece = this._createPiece("quantum", c, moveNumber);
      pieceSize = $piece.width();
      $piece
        .css({"top": i*pieceSize + "px", "left": j*pieceSize + "px"})
        .fadeShow()
    },

    removeQuantum: function(c, moveNumber) {
      this._$cell(c)
        .find("p:contains(" + moveNumber + ")")
        .parent()
        .fadeRemove();
    },

    hasQuantum: function(c) {
      return this._$cell(c).find(".quantum").length !== 0;
    },

    clearCell: function(c) {
      this._$cell(c).children().fadeRemove();
    },

    clear: function() {
      this._$board.find(".cell").children().fadeRemove();
    },

    addHighlight: function(c, className) {
      $("<div class='highlight'>")
        .addClass(className)
        .appendTo(this._$cell(c))
        .fadeShow();
    },

    addHighlights: function(cells, className) {
      var view = this;
      cells.forEach(function(c) {
        view.addHighlight(c, className);
      });
    },

    clearHighlights: function(c) {
      this._$board.find(".highlight").fadeRemove();
    }
  };

  return View;
}(jQuery));
