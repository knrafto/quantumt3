var View = (function($) { "use strict";

  function View(element, options) {
    var i, j, c, row, cell,
        container = $(element),
        board = $("<div class='board'/>").appendTo(container),
        cells = [];

    function makeHandler(thisArg, c) {
      return function () {
        return thisArg._onClick(c);
      };
    }

    for (i = 0; i < 3; ++i) {
      row = $("<div class='board-row'/>").appendTo(board);
      for (j = 0; j < 3; ++j) {
        c = 3*i + j + 1;
        cells[c - 1] = $("<div class='board-cell'/>")
          .click(makeHandler(this, c))
          .appendTo(row);
      }
    }

    this._options = options || {};
    this._container = container;
    this._cells = cells;
  }

  View.prototype = {
    _onClick: function(c) {
      var handler = this._options.onClick;
      if (handler) {
        handler(c);
      }
    }
  };

  return View;
}(jQuery));
