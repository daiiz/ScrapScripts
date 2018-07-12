const $ = require('jquery')
const daiizScrapboxManage = require('./manage')
const installed = daiizScrapboxManage.installed
const detectProject = daiizScrapboxManage.detectProject

exports.enable = () => {
  var $appRoot = $('#app-container')

  $appRoot.on('click', 'img.icon', async function (e) {
    if (!installed('daiiz-icon-button')) return
    e.preventDefault()
    var projectName = detectProject()

    var $t = $(e.target).closest('img.icon')
    var src = $t.attr('src')
    var iconProject = src.split('/api/pages/')[1].split('/')[0]
    if (iconProject !== projectName) return

    // 自分のプロジェクトの管理下のscriptだけ実行できる
    var iconName = $t.attr('title').match(/[^\s/]+-button$/g)
    if (iconName) {
      var buttonName = iconName[0]
      var scriptFilePath = `https://scrapbox.io/api/code/${projectName}/${buttonName}/button.js`

      const res = await fetch(scriptFilePath, {credentials: 'include'})
      const body = await res.text()
      eval(body)
      return false
    }
  })
}
