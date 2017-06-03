var $getRefTextBody = function (title, $root, $bubble) {
  var project = window.encodeURIComponent(window.location.href.match(/scrapbox.io\/([^\/.]*)/)[1]);
  if (title.indexOf('%') === -1) var title = window.encodeURIComponent(title);
  $.ajax({
    type: 'GET',
    url: `https://scrapbox.io/api/pages/${project}/${title}/text`
  }).success(function (data) {
    $root.append($bubble);
    var scrapObjects = parser(data);
    var deco = decorator(scrapObjects, project, title);
    $bubble.html(`<div class="daiiz-bubble-text">${deco.join('')}</div>`);
    $bubble.show();
  });
};

var decorator = function (scrapObjects, project, title) {
  var body = [];
  for (var i = 1; i < scrapObjects.length; i++) {
    // 行
    var objs = scrapObjects[i];
    var raw = '';
    for (var j = 0; j < objs.length; j++) {
      var tok = objs[j];

      if (tok.type === 'text') {
        // プレーンテキスト
        // 裸リンクを探す
        var words = tok.raw.split(' ');
        var res = [];
        for (var k = 0; k < words.length; k++) {
          var word = words[k].trim();
          if (word.startsWith('http')) {
            var attrs = makeATagAttrs(word, word, word);
            word = `<a href=${attrs.href} class="${attrs.className}">${attrs.raw}</a>`;
          }
          res.push(word);
        }
        body.push(solveInnerLink(res.join(' '), project));
      }else if (tok.type === 'backquote') {
        var txt = '';
        for (var k = 0; k < tok.raw.length; k++) {
          txt += `<span>${tok.raw[k]}</span>`;
        }
        body.push(`<span class="daiiz-backquote">${txt}</span>`);
      }else if (tok.type === 'bracket') {
        raw = tok.raw.trim();
        var toks = raw.split(' ');
        var toksLen = toks.length;
        var others = true;

        var head = toks.reverse().pop();
        tail = toks.reverse().join(' ');

        if (toksLen >= 2 && head.indexOf('http') === -1 && others) {
          raw = tail;

          if (head.indexOf('/') !== -1 && head.length < 6) {
            // 斜体
            raw = `<i>${solveInnerLink(raw, project)}</i>`;
            others = false;
          }

          if (head.indexOf('*') !== -1) {
            // 太字
            raw = `<b>${solveInnerLink(raw, project)}</b>`;
            others = false;
          }
        }

        if (toksLen >= 2 && others) {
          raw = tail;

          // 別名記法
          var t0 = head.trim();
          var t1 = tail.trim();
          var fmts = {};

          if (t0.startsWith('http') && !t0.endsWith('.jpg') && !t0.endsWith('.png')
            && !t0.endsWith('.gif')) {
            fmts.href = t0;
            fmts.label = t1;
          }else {
            fmts.href = t1;
            fmts.label = t0;
          }

          if (!fmts.href.startsWith('http')) {
            fmts.href = (head + ' ' + tail).trim();
            fmts.label = (head + ' ' + tail).trim();
          }

          var attrs = makeATagAttrs(fmts.href, project);
          var a = `<a href="${encodeHref(attrs.href)}"
            class="${attrs.className}">${makeImageTag(fmts.label, fmts.label, fmts.label)}</a>`;
          raw = a;
          others = false;
        }

        if (others) {
          var raw = tok.raw.trim();
          if (raw.startsWith('[') && raw.endsWith(']')) {
            // 記法 [[]]
            raw = raw.replace('[', '').replace(']', '');
            raw = `<b>${makeImageTag(raw, raw, raw)}</b>`;
          }else {
            // 記法 []
            raw = raw.replace('[', '').replace(']', '');
            var attrs = makeATagAttrs(raw, project);
            var a = `<a href="${encodeHref(attrs.href)}" class="${attrs.className}">${attrs.raw}</a>`;
            raw = makeImageTag(attrs.raw, attrs.href, a);
          }
        }

        body.push(raw);
      }
    }
    if (body[body.length - 1] !== '<br>') body.push('<br>');
  }
  body[body.length - 1] = '';
  return body;
}

var makeATagAttrs = function (raw, project) {
  var res = {'className': '', 'href': '', 'raw': ''};
  var href = (raw[0] === '/') ? raw : `/${project}/${raw}`;
  var className = (raw[0] === '/') ? '' : 'page-link';
  if (raw.startsWith('http')) {
    href = raw;
    className = 'daiiz-ref-link';
  }
  res.href = href;
  res.className = className;
  res.raw = raw.trim();
  return res;
};

var encodeHref = function (url) {
  var toks = url.split('/');
  var pageName = toks.pop();
  return toks.join('/') + (url[0] === '/' || url.startsWith('http') ? '/' : '') +
    window.encodeURIComponent(pageName);
};

// 装飾記法内のリンクを解決
var solveInnerLink = function (row, project) {
  var links = row.match(/\[.+?\]/gi);
  if (links) {
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var keyword = link.replace('[', '').replace(']', '');
      var attrs = makeATagAttrs(keyword, project);
      var a = `<a href="${encodeHref(attrs.href)}" class="${attrs.className}">${attrs.raw}</a>`;
      a = makeImageTag(attrs.raw, attrs.href, a);
      row = row.replace(link, a);
    }
  }

  var hashTags = row.match(/(^| )\#[^ ]+/gi);
  if (hashTags) {
    for (var i = 0; i < hashTags.length; i++) {
      var hashTag = hashTags[i].trim();
      var keyword = hashTag.substring(1, hashTag.length);
      var a = `<a href="/${project}/${keyword}" class="page-link">${hashTag}</a>`;
      row = row.replace(hashTag, a);
    }
  }
  return row;
};

// 画像になる可能性があるものに対処
var makeImageTag = function (keyword, href, a) {
  if (keyword.match(/\.icon\**\d*$/gi)) {
    var toks = href.split('*');
    var times = 1;
    if (toks.length === 2) times = +toks[1];
    a = ''
    for (var i = 0; i < times; i++) {
      a += `<img class="daiiz-tiny-icon" src="https://scrapbox.io/api/pages${href.split('.icon')[0]}/icon">`;
    }
  }else if (keyword.endsWith('.jpg') || keyword.endsWith('.png') || keyword.endsWith('.gif')) {
    a = `<img class="daiiz-small-img" src="${keyword}">`;
  }else if (keyword.startsWith('https://gyazo.com/') || keyword.startsWith('http://gyazo.com/')) {
    a = `<img class="daiiz-small-img" src="${keyword}/raw">`;
  }
  return a;
};

var parser = function (text) {
  var buf = [];
  var bracketCounter = 0;
  var backquartoCounter = 0;
  var codeOpen = false;
  // 行に区切る
  var rows = text.split('\n');
  var scrapObjs = [];

  var storeBuf = function (idx, objType) {
    if (buf.length > 0 && buf.join('').trim().length > 0) {
      scrapObjs[idx].push({
        'raw': buf.join(''),
        'type': objType
      });
      buf = [];
    }
  };

  var c = 0;
  for (var i = 0; i < rows.length; i++) {
    // 行
    var row = rows[i].trim();
    if (row.startsWith('code:')) {
        codeOpen = true;
    }
    if (row.trim().length === 0) {
      codeOpen = false;
    }

    if (codeOpen) continue;
    scrapObjs.push([]);

    for (var j = 0; j < row.length; j++) {
      var char = row[j];
      if (char === '\t') {
      }else if (char === '[' && backquartoCounter === 0) {
        if (bracketCounter === 0) {
          storeBuf(c, 'text');
        }else {
          buf.push('[');
        }
        bracketCounter++;
      }else if (char === ']' && backquartoCounter === 0) {
        bracketCounter--;
        if (bracketCounter === 0) {
          storeBuf(c, 'bracket'); // 開きと閉じが一致
        }else {
          buf.push(']');
        }
      }else if (char === '`') {
        if (backquartoCounter === 0) {
          backquartoCounter++; // 開き
          storeBuf(c, 'text');
        }else {
          backquartoCounter = 0; // 閉じ
          storeBuf(c, 'backquote');
        }
      }else {
        if (char.length > 0) buf.push(char);  // 記録対象文字
      }
    }
    // 一行終わり
    storeBuf(c, 'text');
    c++;
  }
  return scrapObjs;
};

var installed = function (functionName) {
  var d = `data-${functionName}`;
  if ($('body').attr(d) && $('body').attr(d) === 'on') return true;
  return false;
};

var bindEvents = function ($appRoot) {
  /* 関連カード */
  var timer = null;
  $appRoot.on('mouseenter', 'a.page-link', function (e) {
    if (!installed('daiiz-text-bubble')) return;

    var $a = $(e.target).closest('a.page-link');
    $root = $appRoot.find('.page');

    if ($a.hasClass('empty-page-link')) return;
    var $bubble = $getTextBubble();
    var rect = $a[0].getBoundingClientRect();
    $bubble.css({
      'max-width': $('.editor-wrapper')[0].offsetWidth - $a[0].offsetLeft,
      'left': rect.left + window.pageXOffset,
      // .related-page-listのmargin-top=24pxぶん引く
      'top': rect.top + window.pageYOffset + $a[0].offsetHeight + 3 - 24,
      'border-color': $('body').css('background-color')
    });
    var pos = `${$bubble.css('top')}_${$bubble.css('left')}`;
    $bubble.attr('data-pos', pos);

    // すでに表示されているならば，何もしない
    if ($(`.daiiz-text-bubble[data-pos="${pos}"]`).length > 0) {
      return;
    }

    if ($a.attr('rel') && $a.attr('rel') == 'route') {
      $(`.daiiz-text-bubble:not([data-pos="${pos}"])`).remove();
    }

    var tag = $a[0].innerText.replace(/^#/gi, '').split('#')[0];
    if (tag.startsWith('/')) {
      $bubble.hide();
      return;
    }

    timer = window.setTimeout(function () {
      $getRefTextBody(tag.trim(), $root, $bubble);
    }, 650);
  });

  $appRoot.on('mouseleave', 'a.page-link', function (e) {
    window.clearTimeout(timer);
  });

  $appRoot.on('mouseleave', '.daiiz-card', function (e) {
    var $bubble = $('.daiiz-card');
    window.clearTimeout(timer);
  });

  $appRoot.on('click', function (e) {
    window.clearTimeout(timer);
    var $bubble = $('.daiiz-card');
    var $t = $(e.target).closest('.daiiz-card');
    if ($(e.target)[0].tagName.toLowerCase() === 'a') {
      $bubble.remove();
    }else if ($t.length > 0) {
      $t.remove();
    }else {
      $bubble.remove();
    }
  });
};

/* テキストカード */
var $getTextBubble = function () {
  var $textBubble = $('<div class="daiiz-text-bubble related-page-list daiiz-card"></div>');
  return $textBubble;
};

$(function () {
  var $appRoot = $('#app-container');
  bindEvents($appRoot);
});
