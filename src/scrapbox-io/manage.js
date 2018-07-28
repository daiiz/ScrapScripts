// Scrapbox
const $ = require('jquery')
const ESC_KEY_CODE = 27
const DAIIZ_GYAZO_TEXT_BUBBLE = 'daiiz-gyazo-text-bubble'

// XXX: 直したい
exports.installed = function (functionName) {
  var d = `data-${functionName}`
  var defaulfValue = {
    'daiiz-text-bubble': 's', // South
    'daiiz-rel-bubble': 'n', // North
    'daiiz-icon-button': true,
    'daiiz-paste-url-title': 'ctrl'
  }
  if ($('body').attr(d)) {
    d = $('body').attr(d)
    if (d === 'off') return false
    if (d === 'on') {
      return defaulfValue[functionName]
    } else if (d.length >= 1) {
      // n, s
      // ctrl
      return d
    }
  }
  return false
}

exports.detectProject = function () {
  const r = window.location.href.match(/scrapbox\.io\/([^/.]*)/)
    || window.location.href.match(/localhost\:\d+\/([^/.]*)/)
  if (r && r.length >= 2) return encodeURIComponent(r[1])
  return 'daiiz'
}

var enableDaiizScript = function (pairs) {
  window.app.runtime.sendMessage({
    command: 'enable-daiiz-script',
    func_project_pairs: pairs
  })
}

exports.install = () => {
  var mo = new window.MutationObserver(function (mutationRecords) {
    var pairs = {}
    for (var i = 0; i < mutationRecords.length; i++) {
      var record = mutationRecords[i]
      var attr = record.attributeName
      if (attr.startsWith('data-daiiz-')) {
        var projectName = $('body').attr(attr)
        var funcName = attr.replace(/^data-/, '')
        if (funcName === DAIIZ_GYAZO_TEXT_BUBBLE) {
          pairs[funcName] = projectName
        }
      }
    }
    if (Object.keys(pairs).length > 0) enableDaiizScript(pairs)
  })
  mo.observe($('body')[0], {
    attributes: true
  })

  $('body').on('keydown', function (e) {
    if (e.keyCode === ESC_KEY_CODE) $('.daiiz-card-root').remove()
  })
}
