var ROOT_PROJECT_NAME = null;
var DAIIZ_GYAZO_TEXT_BUBBLE = 'daiiz-gyazo-text-bubble';

var detectProject = function () {
  return ROOT_PROJECT_NAME;
};

$(function () {
  var $appRoot = $('body');

  chrome.runtime.sendMessage({
    command: 'get-project-name',
    func_names: ['daiiz-gyazo-text-bubble'],
  }, function (projectNames) {
    console.info('ScrapScripts', projectNames);
    if (projectNames[DAIIZ_GYAZO_TEXT_BUBBLE]) {
      ROOT_PROJECT_NAME = projectNames[DAIIZ_GYAZO_TEXT_BUBBLE];
      daiizGyazoTextBubbleMain($appRoot, ROOT_PROJECT_NAME);
    }
  });
});
