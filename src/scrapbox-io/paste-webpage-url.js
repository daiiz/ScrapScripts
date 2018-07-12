const $ = require('jquery')
const daiizScrapboxManage = require('./manage')
const {installed, detectProject} = daiizScrapboxManage
const app = window.browser || window.chrome

const keys = {
  ctrl: 17,
  alt: 18,
  v: 86
}

exports.enable = () => {
  let c = 0
  const textInput = $('#text-input')[0]

  $(window).on('keydown', event => {
    const key = installed('daiiz-paste-url-title')
    if (!key) return
    const { keyCode } = event
    if (keyCode === keys[key]) c = 1
  })

  $(window).on('keydown', event => {
    if (!installed('daiiz-paste-url-title')) return
    const { keyCode } = event
    if (keyCode !== keys.v || c !== 1) {
      return
    }
    event.preventDefault()
    event.stopPropagation()

    app.runtime.sendMessage({
      command: 'get-clipboard-page'
    }, text => {
      if (!text) return
      document.execCommand('insertText', false, text)
    })
  })

  $(window).on('keyup', () => {
    c = 0
  })

  app.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { command } = request
    if (command === 're:get-clipboard-page') {
      const { externalLink } = request
      document.execCommand('insertText', false, externalLink)
    }
  })
}
