// background

const isChrome = () => {
  return /Chrome/.test(navigator.userAgent);
};

const app = isChrome() ? chrome : browser;

console.log(app);
console.log(app.tabs);

console.log(app.runtime.onMessage.addListener);
console.log(app.tabs.getSelected);
console.log(app.tabs.query);
console.log(app.tabs.sendMessage);
