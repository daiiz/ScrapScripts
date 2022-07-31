// background

const isChrome = () => {
  return /Chrome/.test(navigator.userAgent);
};

const app = isChrome() ? chrome : browser;

app.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
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

  // 廃止
  // Clipboardに保持されたURLのページタイトルを返却する
  // if (cmd === "get-clipboard-page") {
  //   console.log("[get-clipboard-page]");
  //   // const bg = window.app.extension.getBackgroundPage();
  //   // const textarea = document.querySelector("#daiiz-ctrlv");
  //   // textarea.value = "";
  //   // textarea.focus();
  //   // bg.document.execCommand("paste");
  //   // resopondWebpageTitleOrRawText(textarea.value, sendResponse);
  // }

  // URLのページタイトルを返却する
  if (cmd === "fetch-page-title") {
    const text = request.rawText;
    console.log("#", "fetch-page-title", text);
    await resopondWebpageTitleOrRawText(text, sendResponse);
  }
});

const resopondWebpageTitleOrRawText = async (text, sendResponse) => {
  if (text.match(/\n/)) {
    return sendResponse(text);
  }
  if (text.match(/^https?:\/\/scrapbox\.io\//)) {
    return sendResponse(text);
  }
  if (text.match(/gyazo\.com\//)) {
    return sendResponse(text);
  }
  if (text.match(/www\.youtube\.com\//)) {
    return sendResponse(text);
  }
  if (text.match(/www\.google/) && text.match(/\/maps\//)) {
    return sendResponse(text);
  }
  if (text.match(/^https?:\/\//)) {
    const tabs = await app.tabs.query({ currentWindow: true, active: true });
    try {
      await fetchPage(text, tabs);
    } catch (err) {
      console.error(err);
      // textarea#text-inputをブロックしており、解除する必要があるので必ず応答を返す
      app.tabs.sendMessage(tabs[0].id, {
        command: "re:get-clipboard-page",
        externalLink: text,
      });
    }
    return;
  }
  return sendResponse(text);
};

const fetchPage = async (url, tabs) => {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error("Failed to fetch page.");
  }
  const body = await res.text();
  // const parser = new DOMParser();
  // const doc = parser.parseFromString(body, "text/html");

  // DOMParserを使えないので文字列操作でtitleを取り出す
  let externalLink = url;
  let title = "";

  let substr = body.split("</title>")[0];
  if (substr) {
    substr = substr.split("<title>")[1];
  }
  if (substr) {
    title = substr
      .trim()
      .split("\n")
      .filter((x) => !!x.trim())
      .join("");
    console.log("[fetchPage]", title);
  }
  if (title) {
    externalLink = `[${url} ${title}]`;
  }

  app.tabs.sendMessage(tabs[0].id, {
    command: "re:get-clipboard-page",
    externalLink,
  });

  // if (isChrome()) {
  //   window.app.tabs.getSelected(null, (tab) => {
  //     window.app.tabs.sendMessage(tab.id, {
  //       command: "re:get-clipboard-page",
  //       externalLink,
  //     });
  //   });
  // } else {
  //   // Firefox extension
  //   const tab = await window.app.tabs.query({
  //     currentWindow: true,
  //     active: true,
  //   });
  //   window.app.tabs.sendMessage(tab[0].id, {
  //     command: "re:get-clipboard-page",
  //     externalLink,
  //   });
  // }
};
