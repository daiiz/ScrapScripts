const $ = require('jquery')

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

exports.enable = () => {
  const $body = $('body')
  const href = window.location.href

  console.log(matchScrapScript(href))
  if (!matchScrapScript(href)) return
  const [_, featureName, projectName] = matchScrapScript(href)
  if (!featureName === 'stream') return
  $body.html('')

  // main editor
  const $editor = $(document.createElement('iframe'))
  $editor.attr('src', `https://scrapbox.io/${projectName}`)
  $editor.css(style({
    width: 'calc(100% - 330px)',
    left: 0
  }))
  $body.append($editor)

  // side stream
  const $stream = $(document.createElement('iframe'))
  $stream.attr('src', `https://scrapbox.io/stream/${projectName}`)
  $stream.css(style({
    width: '330px',
    right: 0
  }))
  $body.append($stream)
}