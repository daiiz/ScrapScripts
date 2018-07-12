window.app = (/Chrome/.test(navigator.userAgent)) ? chrome : browser
console.log("#######!", app)

$(function () {
  window.daiizScrapbox.manage.install()
  window.daiizScrapbox.iconButton.enable()
  window.daiizScrapbox.relCardsBubble.enable()
  window.daiizScrapbox.textBubble.enable()
  window.daiizScrapbox.pasteWebpageUrl.enable()
})
