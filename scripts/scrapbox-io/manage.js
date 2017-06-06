// shared
var installed = function (functionName) {
  var d = `data-${functionName}`;
  if ($('body').attr(d) && $('body').attr(d) === 'on') return true;
  return false;
};

var detectProject = function () {
  var r = window.location.href.match(/scrapbox.io\/([^\/.]*)/);
  if (r && r.length >= 2) return window.encodeURIComponent(r[1]);
  return 'daiiz';
};
