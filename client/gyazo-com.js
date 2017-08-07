$(function () {
  window.daiizGyazo.manage.install()
    .then(projectName => {
      window.daiizGyazo.textBubble.enable(projectName)
    })
})