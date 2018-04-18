// background

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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

  // Clipboardに保持されたURLのページタイトルを取得する
  if (cmd === 'get-clipboard-page') {
    const bg = chrome.extension.getBackgroundPage()
    const textarea = document.querySelector('#ctrlv')
    textarea.value = ''
    textarea.focus()
    bg.document.execCommand('paste')
    let text = textarea.value

    if (text.match(/^https:\/\/scrapbox\.io\//)) sendResponse(text)
    if (text.match(/^https?:\/\//)) {
      fetchPage(text)
      return
    }
    sendResponse(text)
  }
})

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
  chrome.tabs.getSelected(null, tab => {
    chrome.tabs.sendMessage(tab.id, {
      command: 're:get-clipboard-page',
      externalLink
    })
  })
}
