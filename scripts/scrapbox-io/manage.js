// shared
var ESC_KEY_CODE = 27;
var DAIIZ_GYAZO_TEXT_BUBBLE = 'daiiz-gyazo-text-bubble';

var installed = function (functionName) {
  var d = `data-${functionName}`;
  var defaulfValue = {
    'daiiz-text-bubble': 's', // South
    'daiiz-rel-bubble' : 'n', // North
    'daiiz-icon-button': true
  };
  if ($('body').attr(d)) {
    var d = $('body').attr(d);
    if (d === 'off') return false;
    if (d === 'on') {
      return defaulfValue[functionName];
    }else if (d === 'n' || d === 's'){
      return d;
    }
  }
  return false;
};

var detectProject = function () {
  var r = window.location.href.match(/scrapbox.io\/([^\/.]*)/);
  if (r && r.length >= 2) return window.encodeURIComponent(r[1]);
  return 'daiiz';
};

var enableDaiizScript = function (pairs) {
  chrome.runtime.sendMessage({
    command: 'enable-daiiz-script',
    func_project_pairs: pairs
  });
};

$(function () {
  var $appRoot = $('#app-container');

  var mo = new MutationObserver(function (mutationRecords) {
    var pairs = {};
    for (var i = 0; i < mutationRecords.length; i++) {
      var record = mutationRecords[i];
      var attr = record.attributeName;
      if (attr.startsWith('data-daiiz-')) {
        var projectName = $('body').attr(attr);
        var funcName = attr.replace(/^data-/, '');
        if (funcName === DAIIZ_GYAZO_TEXT_BUBBLE) {
          pairs[funcName] = projectName;
        }
      }
    }
    if (Object.keys(pairs).length > 0) enableDaiizScript(pairs);
  });
  mo.observe($('body')[0], {
    attributes: true
  });

  $('body').on('keydown', function (e) {
    if (e.keyCode === ESC_KEY_CODE) $('.daiiz-card-root').remove();
  });

  daiizRelCardsMain($appRoot);
  daiizTextBubbleMain($appRoot);
});
