// Gyazo
let ROOT_PROJECT_NAME = null;
const DAIIZ_GYAZO_TEXT_BUBBLE = "daiiz-gyazo-text-bubble";

exports.detectProject = function () {
  return ROOT_PROJECT_NAME;
};

// exports.install2 = () => {
//   return new Promise((resolve) => {
//     window.app.runtime.sendMessage(
//       {
//         command: "get-project-name",
//         func_names: ["daiiz-gyazo-text-bubble"],
//       },
//       function (projectNames) {
//         console.info("ScrapScripts:", projectNames);
//         if (projectNames[DAIIZ_GYAZO_TEXT_BUBBLE]) {
//           ROOT_PROJECT_NAME = projectNames[DAIIZ_GYAZO_TEXT_BUBBLE];
//           // daiizGyazoTextBubbleMain($appRoot, ROOT_PROJECT_NAME)
//           resolve(ROOT_PROJECT_NAME);
//         }
//       }
//     );
//   });
// };

exports.install = () => {
  return new Promise((resolve, reject) => {
    const payload = {
      command: "get-project-name",
      func_names: ["daiiz-gyazo-text-bubble"],
    };

    window.app.runtime.sendMessage(payload, () => {});

    window.app.runtime.onMessage.addListener(
      (request, sender, sendResponse) => {
        const { command, projectNames } = request;
        if (command === "re:get-project-name") {
          console.info("ScrapScripts:", projectNames);
          if (projectNames[DAIIZ_GYAZO_TEXT_BUBBLE]) {
            ROOT_PROJECT_NAME = projectNames[DAIIZ_GYAZO_TEXT_BUBBLE];
            resolve(ROOT_PROJECT_NAME);
          } else {
            resolve("");
          }
        }
      }
    );
  });
};
