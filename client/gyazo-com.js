window.app = (/Chrome/.test(navigator.userAgent)) ? chrome : browser

$(function () {
  window.daiizGyazo.manage.install()
    .then(projectName => {
      window.daiizGyazo.textBubble.enable(projectName)
    })
})
