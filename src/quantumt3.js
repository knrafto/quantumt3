$(document).ready(function() {
  function onClick(c) {
    console.log(c);
  }

  view = new View("#quantumt3");
  view.onClick = onClick;
});
