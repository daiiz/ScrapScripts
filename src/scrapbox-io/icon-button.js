const $ = require('jquery')
const daiizScrapboxManage = require('./manage')
const installed = daiizScrapboxManage.installed
const detectProject = daiizScrapboxManage.detectProject

const isChrome = () => {
  return /Chrome/.test(navigator.userAgent)
}

const isFirefox = () => {
  return /Firefox/.test(navigator.userAgent)
}

exports.enable = () => {
  var $appRoot = $('#app-container')

  $appRoot.on('click', 'img.icon', function (e) {
    if (!installed('daiiz-icon-button')) return
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

      // const res = await fetch(scriptFilePath, {credentials: 'include'})
      // const body = await res.text()
      // eval(body)
      // location.href = `https://scrapbox.io/${projectName}/${buttonName}`

      // $.ajax({
      //   type: 'GET',
      //   url: scriptFilePath,
      //   contentType: 'application/javascript; charset=UTF-8'
      // }).done(body => {
      //   const lines = body.split('\n')
      //   const commands = lines[0]
      //   if (isChrome() && commands.includes('--eval')) {
      //     console.warn('chrome', commands)
      //     eval(body)
      //   } else if (isFirefox()) {
      //     eval(body)
      //   } else {
      //     // 自動実行される
      //   }
      // })

      const xhr = new XMLHttpRequest()
      xhr.open('GET', scriptFilePath)
      xhr.onload = function () {
        const {response} = this
        eval(response)
      }
      xhr.send()

      return false
    }
  })
}
