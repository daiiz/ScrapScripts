console.info("text-bubble.b.js");
var BRACKET_OPEN = '[';
var DOUBLE_BRACKET_OPEN = '[[';
var BRACKET_CLOSE = ']';
var DOUBLE_BRACKET_CLOSE = ']]';
var INLINE_CODE = '`';
var openInlineCode = false;
var openCodeBlock = false;

var detectProject = function () {
  var r = window.location.href.match(/scrapbox.io\/([^\/.]*)/);
  if (r && r.length >= 2) return window.encodeURIComponent(r[1]);
  return 'daiiz';
};

var decorate = function (str, strOpenMark, depth) {
  var html = '';
  var tagOpen = [];
  var tagClose = [];
  if (strOpenMark === BRACKET_OPEN) {
    // リンク，装飾
    var body = str.replace(/^\[/, '').replace(/\]$/, '');
    var words = body.split(' ');
    if (words.length >= 2) {
      var pear = makePear(words);
      var p0 = pear[0];
      var p1 = pear[1];
      if (p0.startsWith('http')) {
        // リンク(別名記法)
        body = p1;
        var href = p0;
        tagOpen.push(`<a href="${encodeHref(href)}" class="daiiz-ref-link">`);
        tagClose.push('</a>');
        var img = makeImageTag(body);
        if (img[1]) {
          body = img[0];
        }else {
          body = spans(p1);
        }
      }else {
        var f = true;
        body = p1;

        // 太字, 斜体, 打ち消し
        var o = !p0.match(/[^\-\*\/\_]/gi);
        if (o && p0.indexOf('*') >= 0) {
          tagOpen.push('<b>');
          tagClose.push('</b>');
          f = false;
        }
        if (o && p0.indexOf('/') >= 0) {
          tagOpen.push('<i>');
          tagClose.push('</i>');
          f = false;
        }
        if (o && p0.indexOf('-') >= 0) {
          tagOpen.push('<s>');
          tagClose.push('</s>');
          f = false;
        }
        if (o && p0.indexOf('_') >= 0) {
          tagOpen.push('<span class="daiz-underline">');
          tagClose.push('</span>');
          f = false;
        }

        if (f) {
          // 半角空白を含むタイトルのページ
          body = words.join(' ');
          var href = (body[0] === '/') ? body : `/${detectProject()}/${body}`;
          tagOpen.push(`<a href="${encodeHref(href)}" class="page-link">`);
          tagClose.push('</a>');
          body = spans(body);
        }
      }
      var img = makeImageTag(body);
      if (img[1]) body = img[0];
    }else {
      if (body.length === 0) {
        body = '[]';
      }else {
        // リンク, 画像
        var pageLink = makePageLink(body, tagOpen, tagClose);
        tagOpen = pageLink.tagOpen;
        tagClose = pageLink.tagClose;
        body = pageLink.body;
      }
    }

  }else if (strOpenMark === DOUBLE_BRACKET_OPEN) {
    var body = str.replace(/^\[\[/, '').replace(/\]\]$/, '');
    tagOpen.push('<b>');
    tagClose.push('</b>');
    var img = makeImageTag(body);
    if (img[1]) body = img[0];

  }else if (strOpenMark === INLINE_CODE) {
    var code = str.replace(/^\`/, '').replace(/\`$/, '');
    body = `<span class="daiiz-backquote">${spans(code)}</span>`;
  }

  return `${tagOpen.join('')}${body}${tagClose.reverse().join('')}`;
};

var spans = function (txt) {
  var body = '';
  for (var k = 0; k < txt.length; k++) {
    body += `<span>${txt[k]}</span>`;
  }
  return body;
};

var makePageLink = function (body, tagOpen, tagClose) {
  var href = (body[0] === '/' || body.startsWith('http')) ? body : `/${detectProject()}/${body}`;
  var className = (body[0] === '/') ? '' : 'page-link';
  if (body.startsWith('http')) className = 'daiiz-ref-link';
  tagOpen.push(`<a href="${encodeHref(href)}" class="${className}">`);
  tagClose.push('</a>');
  var img = makeImageTag(body);
  if (img[1]) {
    tagOpen = [];
    tagClose = [];
    body = img[0];
  }
  return {tagOpen: tagOpen, tagClose: tagClose, body: body};
};

var makePear = function (words) {
  var w0 = words[0];
  var wL = words[words.length - 1];
  var pear = [];
  if (wL.startsWith('http')) {
    pear.push(wL);
    pear.push(words.slice(0, words.length - 1).join(' '));
  }else {
    pear.push(w0);
    pear.push(words.slice(1, words.length).join(' '));
  }

  if (pear[0].startsWith('http') && pear[1].startsWith('http')) {
    var a = (pear[0].endsWith('.jpg') || pear[0].endsWith('.png') || pear[0].endsWith('.gif'));
    var b = (pear[0].startsWith('https://gyazo.com/') || pear[0].startsWith('http://gyazo.com/'));
    if (a || b) {
      pear.reverse();
    }
  }
  return pear;
}

var encodeHref = function (url) {
  var toks = url.split('/');
  var pageName = toks.pop();
  var pageRowNum = pageName.match(/#.{24}$/); // 行リンク対応
  if (url.startsWith('http')) {
    return url;
  }else if (pageRowNum) {
    // 行リンク
    var n = pageRowNum[0];
    pageName = window.encodeURIComponent(pageName.split(n)[0]) + n;
  }else {
    pageName = window.encodeURIComponent(pageName);
  }
  return toks.join('/') + (url[0] === '/' || url.startsWith('http') ? '/' : '') + pageName;
};

// 画像になる可能性があるものに対処
var makeImageTag = function (keyword) {
  keyword = keyword.trim();
  var img = '';
  var isImg = true;
  if (keyword.match(/\.icon\**\d*$/gi)) {
    var iconName = keyword.split('.icon')[0];
    if (iconName.charAt(0) !== '/') {
      iconName = '/' + detectProject() + '/' + iconName;
    }
    var toks = keyword.split('*');
    var times = 1;
    if (toks.length === 2) times = +toks[1];
    for (var i = 0; i < times; i++) {
      img += `<img class="daiiz-tiny-icon" src="https://scrapbox.io/api/pages${iconName}/icon">`;
    }
  }else if (keyword.endsWith('.jpg') || keyword.endsWith('.png') || keyword.endsWith('.gif')) {
    img = `<img class="daiiz-small-img" src="${keyword}">`;
  }else if (keyword.startsWith('https://gyazo.com/') || keyword.startsWith('http://gyazo.com/')) {
    img = `<img class="daiiz-small-img" src="${keyword}/raw">`;
  }else {
    img = keyword;
    isImg = false;
  }
  return [img, isImg];
};


/** Scrapboxの行単位での記法解析 */
var dicts = [];
var parse = function (fullStr, startIdx, depth, seekEnd) {
  fullStr = fullStr.trim();
  var l = fullStr.length;
  var startIdxkeep = startIdx;
  while (startIdx < l) {
    var subStr = fullStr.substring(startIdx, l);
    //console.info(depth, subStr);

    if (subStr.startsWith(DOUBLE_BRACKET_OPEN) && !openInlineCode) {
      var token = parse(fullStr, startIdx + DOUBLE_BRACKET_OPEN.length, depth + 1, DOUBLE_BRACKET_CLOSE);
      var str = DOUBLE_BRACKET_OPEN + fullStr.substring(token[0], token[1]) + DOUBLE_BRACKET_CLOSE;
      var res = decorate(str, DOUBLE_BRACKET_OPEN, depth);
      var trans = {};
      trans[str] = res;
      dicts.push(trans);
      startIdx = token[1];
    }else if (subStr.startsWith(BRACKET_OPEN) && !openInlineCode) {
      var token = parse(fullStr, startIdx + 1, depth + 1, BRACKET_CLOSE);
      //console.info('>', token[0], token[1], fullStr.substring(token[0], token[1]));

      // 記法記号を含む抽出文字列
      var str = BRACKET_OPEN + fullStr.substring(token[0], token[1]) + BRACKET_CLOSE;
      var res = decorate(str, BRACKET_OPEN, depth);
      //res = res.replace(str, html);
      var trans = {};
      trans[str] = res;
      dicts.push(trans);
      startIdx = token[1];
    }else if (subStr.startsWith(INLINE_CODE) && !openInlineCode) {
      openInlineCode = true;
      // このマークは入れ子構造をとり得ないことに注意
      var token = parse(fullStr, startIdx + INLINE_CODE.length, depth + 1, INLINE_CODE);
      var str = INLINE_CODE + fullStr.substring(token[0], token[1]) + INLINE_CODE;
      var res = decorate(str, INLINE_CODE, depth);
      var trans = {};
      trans[str] = res;
      dicts.push(trans);
      startIdx = token[1];
    }

    // 探していた閉じマークが見つかった
    if (subStr.startsWith(seekEnd)) {
      if (seekEnd === INLINE_CODE) openInlineCode = false;
      return [startIdxkeep, startIdx];
    }

    startIdx++;
  }

  // 置換する順番に格納されている
  // HTML文字列を作成する
  dicts.push(fullStr);
  dicts.reverse();
  var html = fullStr;
  for (var i = 1; i < dicts.length; i++) {
    var key = Object.keys(dicts[i])[0];
    html = html.replace(key, dicts[i][key]);
  }
  //console.info(dicts);
  return html;
};


/* ======================== */
/*  Main: 行単位の記法解析  */
/* ======================== */
var parseRow = function (row) {
  if (row.length === 0) return null;
  var t0 = row.charAt(0);
  row = row.trim();
  // コードブロックを無視する処理
  if (row.startsWith('code:')) {
    openCodeBlock = true;
    return null;
  }
  if (openCodeBlock) {
    if (t0 == ' ' || t0 == '\t') {
      return null;
    }else {
      openCodeBlock = false;
    }
  }

  // シェル記法の対応
  if (row.charAt(0) === '$') return makeShellStr(row);
  // 括弧を用いる記法の解析
  dicts = [];
  var res = parse(row, 0, 0, null);
  // プレーンテキストに埋め込まれたリンクに対応する
  res = makePlainLinks(res);
  // ハッシュタグをリンク化する
  res = makeHashTagLinks(res);
  return res;
};

var makeHashTagLinks = function (row) {
  row = ' ' + row + ' ';
  var hashTags = row.match(/(^| )\#[^ ]+/gi);
  if (hashTags) {
    for (var i = 0; i < hashTags.length; i++) {
      var hashTag = hashTags[i].trim();
      var keyword = hashTag.substring(1, hashTag.length);
      var a = ` <a href="/${detectProject()}/${keyword}" class="page-link">${hashTag}</a> `;
      row = row.replace(` ${hashTag} `, a);
    }
  }
  return row.substring(1, row.length - 1);
}

makePlainLinks = function (row) {
  row = ' ' + row + ' ';
  var words = row.split(' ');
  var res = [];
  for (var k = 0; k < words.length; k++) {
    var word = words[k].trim();
    if (word.startsWith('http')) {
      var a = ` <a href=${encodeHref(word)} class="daiiz-ref-link">${word}</a> `;
      row = row.replace(` ${word} `, a);
    }
  }
  return row.substring(1, row.length - 1);
};

var makeShellStr = function (row) {
  return `<span class="daiiz-backquote">${spans(row)}</span>`
};

/* ================ */
/*  表示コントール  */
/* ================ */
var $getRefTextBody = function (title, $root, $bubble) {
  title = window.encodeURIComponent(title);
  $.ajax({
    type: 'GET',
    url: `https://scrapbox.io/api/pages/${detectProject()}/${title}/text`
  }).success(function (data) {
    $root.append($bubble);
    var rows = data.split('\n');
    var contents = [];
    for (var l = 1; l < rows.length; l++) {
      var row = parseRow(rows[l]);
      if (row) contents.push(row);
    }
    $bubble.html(`<div class="daiiz-bubble-text">${contents.join('<br>')}</div>`);
    $bubble.show();
  });
};

var installed = function (functionName) {
  var d = `data-${functionName}`;
  if ($('body').attr(d) && $('body').attr(d) === 'on') return true;
  return false;
};

var bindEvents = function ($appRoot) {
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

    var tag = $a[0].innerText.replace(/^#/gi, '').replace(/#.{24}$/, '');
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

var $getTextBubble = function () {
  var $textBubble = $('<div class="daiiz-text-bubble related-page-list daiiz-card"></div>');
  return $textBubble;
};

$(function () {
  var $appRoot = $('#app-container');
  bindEvents($appRoot);
});
/* ================ */
