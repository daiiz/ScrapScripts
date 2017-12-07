document.querySelector('#btn-main-project').addEventListener('click', function () {
  var p = document.querySelector('#main-project').value;
  if (p && p.length > 0) localStorage['main-project'] = p;
}, false);
