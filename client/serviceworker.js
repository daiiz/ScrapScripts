// background

const isChrome = () => {
  return /Chrome/.test(navigator.userAgent);
};

const app = isChrome() ? chrome : browser;

app.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  const cmd = request.command;

  // 外部サイトで発動する機能を有効にする
  if (cmd === "enable-daiiz-script") {
    const funcProjectPairs = request.func_project_pairs;
    const funcNames = Object.keys(funcProjectPairs);
    console.log("[enable-daiiz-script]", funcNames);
    for (let i = 0; i < funcNames.length; i++) {
      const funcName = funcNames[i];
      const projectName = funcProjectPairs[funcName];

      if (!funcName || funcName.length === 0) {
        return;
      }
      if (!projectName || projectName.length === 0) {
        app.storage.local.remove([funcName], () => {
          console.log("removed:", funcName);
        });
      } else if (projectName.length > 0) {
        app.storage.local.set({ [funcName]: projectName }, () => {
          console.log("set:", funcName);
        });
      }
    }
    return;
  }

  // 設定された値を返す
  if (cmd === "get-project-name") {
    console.log("[get-project-name]");
    const funcNames = request.func_names;
    const projectNames = {};
    for (let i = 0; i < funcNames.length; i++) {
      const funcName = funcNames[i];
      if (localStorage[funcName]) {
        projectNames[funcName] = localStorage[funcName];
      }
    }
    sendResponse(projectNames);
    return;
  }

  // Clipboardに保持されたURLのページタイトルを返却する
  if (cmd === "get-clipboard-page") {
    console.log("[get-clipboard-page]");

    // const bg = window.app.extension.getBackgroundPage();
    // const textarea = document.querySelector("#daiiz-ctrlv");
    // textarea.value = "";
    // textarea.focus();
    // bg.document.execCommand("paste");
    // resopondWebpageTitleOrRawText(textarea.value, sendResponse);
  }

  // URLのページタイトルを返却する
  if (cmd === "fetch-page-title") {
    console.log("#", "fetch-page-title");
    const text = request.rawText;
    // resopondWebpageTitleOrRawText(text, sendResponse);
  }
});
