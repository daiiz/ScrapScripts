var detectProject = function () {
  //var r = window.location.href.match(/scrapbox.io\/([^\/.]*)/);
  //if (r && r.length >= 2) return window.encodeURIComponent(r[1]);
  return 'daiiz-private';
};


$(function () {
  var $appRoot = $('body');
  daiizGyazoTextBubbleMain($appRoot);
});
