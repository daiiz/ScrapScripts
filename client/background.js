// background

const isChrome = () => {
  return /Chrome/.test(navigator.userAgent)
}

window.app = isChrome() ? chrome : browser

window.app.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  var cmd = request.command;

  // 外部サイトで発動する機能を有効にする
  if (cmd === 'enable-daiiz-script') {
    var funcProjectPairs = request.func_project_pairs;

    var funcNames = Object.keys(funcProjectPairs);
    for (var i = 0; i < funcNames.length; i++) {
      var funcName = funcNames[i];
      var projectName = funcProjectPairs[funcName];

      if (!funcName || funcName.length === 0) return;
      if (!projectName || projectName.length === 0) {
        localStorage.removeItem(funcName);
      }else if (projectName.length > 0) {
        localStorage[funcName] = projectName;
      }
    }
    return;
  }

  // 設定された値を返す
  if (cmd === 'get-project-name') {
    var funcNames = request.func_names;
    var projectNames = {};
    for (var i = 0; i < funcNames.length; i++) {
      var funcName = funcNames[i];
      if (localStorage[funcName]) {
        projectNames[funcName] = localStorage[funcName];
      }
    }
    sendResponse(projectNames);
    return;
  }

  // Clipboardに保持されたURLのページタイトルを返却する
  if (cmd === 'get-clipboard-page') {
    const bg = window.app.extension.getBackgroundPage()
    const textarea = document.querySelector('#daiiz-ctrlv')
    textarea.value = ''
    textarea.focus()
    bg.document.execCommand('paste')
    resopondWebpageTitleOrRawText(textarea.value, sendResponse)
  }

  // URLのページタイトルを返却する
  if (cmd === 'fetch-page-title') {
    const text = request.rawText
    resopondWebpageTitleOrRawText(text, sendResponse)
  }
})

const resopondWebpageTitleOrRawText = (text, sendResponse) => {
  if (text.match(/\n/)) return sendResponse(text)
  if (text.match(/^https?:\/\/scrapbox\.io\//)) return sendResponse(text)
  if (text.match(/gyazo\.com\//)) return sendResponse(text)
  if (text.match(/www\.youtube\.com\//)) return sendResponse(text)
  if (text.match(/www\.google/) && text.match(/\/maps\//)) return sendResponse(text)
  if (text.match(/^https?:\/\//)) {
    fetchPage(text)
    return
  }
  sendResponse(text)
}

const fetchPage = async (url) => {
  const res = await fetch(url, {
    credentials: 'include'
  })
  const body = await res.text()
  const parser = new DOMParser()
  const doc = parser.parseFromString(body, 'text/html')
  console.log(doc.title)

  let externalLink = url
  const title = doc.title || null
  if (title) externalLink = `[${url} ${title}]`

  console.log(externalLink)

  if (isChrome()) {
    window.app.tabs.getSelected(null, tab => {
      window.app.tabs.sendMessage(tab.id, {
        command: 're:get-clipboard-page',
        externalLink
      })
    })
  } else {
    // Firefox extension
    const tab = await window.app.tabs.query({
      currentWindow: true,
      active: true
    })
    window.app.tabs.sendMessage(tab[0].id, {
      command: 're:get-clipboard-page',
      externalLink
    })
  }
}
