$(document).ready(function() {
  function onClick(c) {
    console.log(c);
  }

  view = new View("#quantumt3");
  view.onClick = onClick;
  view.addClassical(2, 2).addClassical(3, 3).clear(2);
});
