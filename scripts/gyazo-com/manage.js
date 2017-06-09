var detectProject = function (callback) {
  //var r = window.location.href.match(/scrapbox.io\/([^\/.]*)/);
  //if (r && r.length >= 2) return window.encodeURIComponent(r[1]);
  if (callback) callback();
  return 'daiiz-private';
};

$(function () {
  var $appRoot = $('body');

  chrome.runtime.sendMessage({
    command: 'get-project-name',
    func_names: ['daiiz-gyazo-text-bubble'],
  }, function (projectNames) {
    console.info('ScrapScripts', projectNames);
    daiizGyazoTextBubbleMain($appRoot, projectNames);
  });
});
