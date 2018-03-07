const $ = require('jquery')
window.jQuery = $
require('../lib/split-pane.js')

const matchScrapScript = url => {
  return url.match(/scrapbox\.io\/daiizscript\/([^\/\.]+)\.([^\/\.]+)$/)
}

const style = styles => {
  const base = {
    height: '100%',
    border: 0,
    position: 'fixed',
    top: 0,
    right: 0,
    zIndex: 20000
  }
  const keys = Object.keys(styles)
  for (let key of keys) base[key] = styles[key]
  return base
}

const appendStage = () => {
  const $html = $('html')
  const $body = $('body')
  const $stage = $(`
  <div class="pretty-split-pane-frame">
    <div class="split-pane fixed-left" style="min-width: 200px;">
      <div class="split-pane-component" id="left-component" style="width: 35%;">
      </div>
      <div class="split-pane-divider" id="my-divider" style="left: 35%;">
        <div class="split-pane-divider-inner"></div>
      </div>
      <div class="split-pane-component" id="right-component" style="left: 35%;">
      </div>
      <div class="split-pane-resize-shim" style="display: none;"></div></div>
  </div>`)
  $html.css({
    height: '100%',
    overflow: 'hidden'
  })
  $body.css({
    height: '100%',
    'margin-bottom': 0
  })

  // $('body').append('<div id="pane-dummy"></div>')
  $('body').append($stage)

  $('#my-divider').css({
    'background-color': '#999'
  })

  $('#my-divider').on('mousedown', e => {
    $('iframe').css('display', 'none')
  })

  $('body').on('mouseup', e => {
    $('iframe').css('display', 'block')
  })
}

exports.enable = () => {
  const $body = $('body')
  const href = window.location.href

  console.log(matchScrapScript(href))
  if (!matchScrapScript(href)) return
  const [_, featureName, projectName] = matchScrapScript(href)
  if (!featureName === 'stream') return
  $('#app-container').css({ display: 'none' })

  appendStage()

  // main editor
  const $editor = $(document.createElement('iframe'))
  $editor.attr('src', `https://scrapbox.io/${projectName}`)
  $editor.attr('id', 'm')
  $editor.attr('tabindex', -1)
  $editor.attr('class', 'pretty-split-pane-component-inner wm')
  $('#left-component').append($editor)

  const onClick = e => {
    e.preventDefault()
    e.stopPropagation()
    const a = e.target.closest('a')
    const url = a.dataset.href
    $editor.attr('src', url)
    return false
  }

  const onMouseenter = e => {
    const a = e.target.closest('a')
    if (a.dataset.href) return
    console.log(a.href)
    a.dataset.href = a.href
    a.href = ''
  }

  // side stream
  const $stream = $(document.createElement('iframe'))
  $stream.attr('src', `https://scrapbox.io/stream/${projectName}`)
  $stream.attr('id', 'mm')
  $stream.attr('tabindex', -1)
  $stream.attr('class', 'pretty-split-pane-component-inner em')
  $('#right-component').append($stream)
  $stream.on('load', function () {
    $(this).contents().on('mouseenter', '.page a', onMouseenter)
    $(this).contents().on('click', '.page a', onClick)
  })

  $('#app-container').html('')
  $('div.split-pane').splitPane()
}