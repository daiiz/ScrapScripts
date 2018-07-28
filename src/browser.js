
exports.isChrome = () => {
  return /Chrome/.test(navigator.userAgent)
}

exports.isFirefox = () => {
  return /Firefox/.test(navigator.userAgent)
}
