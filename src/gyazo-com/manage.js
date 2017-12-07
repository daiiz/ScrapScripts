// Gyazo
var ROOT_PROJECT_NAME = null
var DAIIZ_GYAZO_TEXT_BUBBLE = 'daiiz-gyazo-text-bubble'

exports.detectProject = function () {
  return ROOT_PROJECT_NAME
}

exports.install = () => {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({
      command: 'get-project-name',
      func_names: ['daiiz-gyazo-text-bubble']
    }, function (projectNames) {
      console.info('ScrapScripts', projectNames)
      if (projectNames[DAIIZ_GYAZO_TEXT_BUBBLE]) {
        ROOT_PROJECT_NAME = projectNames[DAIIZ_GYAZO_TEXT_BUBBLE]
        // daiizGyazoTextBubbleMain($appRoot, ROOT_PROJECT_NAME)
        resolve(ROOT_PROJECT_NAME)
      }
    })
  })
}
