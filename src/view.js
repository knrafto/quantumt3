var View = (function($) { "use strict";

  function createTable(n, m) {
    var i, j, c, row,
        table = $("<table/>");

    for (i = 0; i < n; ++i) {
      row = $("<tr/>").appendTo(table);
      for (j = 0; j < m; ++j) {
        c = 3*i + j + 1;
        $("<td id='" + c + "'/>").appendTo(row);
      }
    }
    return table;
  }

  function View(container, options) {
    var i, j, c, row, cell,
        board = createTable(3, 3).addClass("board").appendTo(container),
        view = this;

    board.find("td")
      .addClass("cell")
      .click(function() {
        var cid = $(this).attr("id");
        view._onClick(cid);
      });

    this._options = options || {};
    this._board = board;
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
