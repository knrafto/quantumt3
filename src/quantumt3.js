$(document).ready(function() {
  function onClick(c) {
    console.log(c);
  }

  view = new View("#quantumt3");
  view.onClick = onClick;
  view.addClassical(2, 2).addClassical(3, 3).clear(2);
  view.addQuantum(4, 4).addQuantum(5, 5).addQuantum(5, 6).removeQuantum(5, 5);
});
