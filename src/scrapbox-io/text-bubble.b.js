const $ = require('jquery')
const daiizScrapboxManage = require('./manage')
const installed = daiizScrapboxManage.installed
const detectProject = daiizScrapboxManage.detectProject

console.info("text-bubble.b.js");
var BRACKET_OPEN = '[';
var DOUBLE_BRACKET_OPEN = '[[';
var BRACKET_CLOSE = ']';
var DOUBLE_BRACKET_CLOSE = ']]';
var INLINE_CODE = '`';
var openInlineCode = false;
var openCodeBlock = false;

var PROJECT_NAME = null;
var EMPTY_LINKS = [];

var decorate = function (str, strOpenMark, depth) {
  var html = '';
  var tagOpen = [];
  var tagClose = [];
  if (strOpenMark === BRACKET_OPEN) {
    // リンク，装飾
    var body = str.replace(/^\[/, '').replace(/\]$/, '');
    var words = body.split(' ');
    if (words.length >= 2) {
      var pair = makePair(words);
      var p0 = pair[0];
      var p1 = pair[1];
      if (p0.startsWith('http')) {
        // リンク(別名記法)
        body = p1;
        var href = p0;
        tagOpen.push(`<a href="${encodeHref(href, true)}" class="daiiz-ref-link" target="_blank">`);
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
          var href = (body[0] === '/') ? body : `/${PROJECT_NAME}/${body}`;
          var target = (PROJECT_NAME !== detectProject()) ? '_blank' : '_self';
          var classEmptyLink = '';
          if (EMPTY_LINKS.indexOf(body) !== -1) classEmptyLink = 'empty-page-link';
          body = spans(body);
          tagOpen.push(`<a href="${encodeHref(getScrapboxUrl(href), false)}"
            class="page-link ${classEmptyLink}" target="${target}">`);
          tagClose.push('</a>');
        }
      }
      var img = makeImageTag(body);
      if (img[1]) body = img[0];
    }else {
      // [ ] 内に空白を含まない
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

var getScrapboxUrl = function (url) {
  return 'https://scrapbox.io' + url;
};

var makePageLink = function (body, tagOpen, tagClose) {
  var link = {tagOpen: [], tagClose: [], body: ''};

  var href = getScrapboxUrl(`/${PROJECT_NAME}/${body}`);
  var startsWithHttp = false;
  if (body[0] === '/') {
    href = getScrapboxUrl(body);
  }else if (body.startsWith('http')) {
    href = body;
    startsWithHttp = true;
  }

  var className = 'page-link';
  var target = (PROJECT_NAME !== detectProject()) ? '_blank' : '_self';
  if (body.startsWith('http')) {
    className = 'daiiz-ref-link';
    target = '_blank';
  }
  var img = makeImageTag(body);
  if (img[1]) {
    link.tagOpen = [];
    link.tagClose = [];
    link.body = img[0];
  }else {
    if (EMPTY_LINKS.indexOf(body) !== -1) className += ' empty-page-link';
    link.body = spans(body);
    link.tagOpen.push(`<a href="${encodeHref(href, startsWithHttp)}" class="${className}" target="${target}">`);
    link.tagClose.push('</a>');
  }
  return link;
};

var makePair = function (words) {
  var w0 = words[0];
  var wL = words[words.length - 1];
  var pair = [];
  if (wL.startsWith('http')) {
    pair.push(wL);
    pair.push(words.slice(0, words.length - 1).join(' '));
  }else {
    pair.push(w0);
    pair.push(words.slice(1, words.length).join(' '));
  }

  if (pair[0].startsWith('http') && pair[1].startsWith('http')) {
    var a = (pair[0].endsWith('.jpg') || pair[0].endsWith('.png') || pair[0].endsWith('.gif'));
    var b = (pair[0].match(/^https{0,1}:\/\/gyazo.com\/.{24,32}$/) !== null);
    if (a || b) {
      pair.reverse();
    }
  }
  return pair;
}

var encodeHref = function (url, startsWithHttp) {
  var tt = url.match(/scrapbox\.io\/([^\/]+)\/(.+)/);
  if (startsWithHttp || tt === null) {
    url = url.replace(/</gi, '%3C').replace(/>/gi, '%3E').replace(/;/gi, '%3B');
    return url;
  }
  if (tt !== null) {
    var pageName = tt[2];
    var pageRowNum = pageName.match(/#.{24,32}$/);
    if (pageRowNum) {
      // 行リンク
      var n = pageRowNum[0];
      pageName = window.encodeURIComponent(pageName.split(n)[0]) + n;
    }else {
      pageName = window.encodeURIComponent(pageName);
    }
    return url.replace(tt[2], pageName);
  }
};

// 画像になる可能性があるものに対処
var makeImageTag = function (keyword) {
  keyword = keyword.trim();
  var img = '';
  var isImg = true;
  if (keyword.match(/\.icon\**\d*$/gi)) {
    var iconName = keyword.split('.icon')[0];
    if (iconName.charAt(0) !== '/') {
      iconName = '/' + PROJECT_NAME + '/' + iconName;
    }
    var toks = keyword.split('*');
    var times = 1;
    if (toks.length === 2) times = +toks[1];
    for (var i = 0; i < times; i++) {
      img += `<img class="daiiz-tiny-icon" src="https://scrapbox.io/api/pages${iconName}/icon">`;
    }
  }else if (keyword.endsWith('.jpg') || keyword.endsWith('.png') || keyword.endsWith('.gif')) {
    img = `<img class="daiiz-small-img" src="${keyword}">`;
  }else if (keyword.match(/^https{0,1}:\/\/gyazo.com\/.{24,32}$/)) {
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

    if (subStr.startsWith(DOUBLE_BRACKET_OPEN) && !openInlineCode) {
      var token = parse(fullStr, startIdx + DOUBLE_BRACKET_OPEN.length, depth + 1, DOUBLE_BRACKET_CLOSE);
      var str = DOUBLE_BRACKET_OPEN + fullStr.substring(token[0], token[1]) + DOUBLE_BRACKET_CLOSE;
      var res = decorate(str, DOUBLE_BRACKET_OPEN, depth);
      var trans = {};
      trans[str] = res;
      dicts.push(trans);
      startIdx = token[1];
    }else if (subStr.startsWith(BRACKET_OPEN) && !openInlineCode) {
      var token = parse(fullStr, startIdx + BRACKET_OPEN.length, depth + 1, BRACKET_CLOSE);
      var str = BRACKET_OPEN + fullStr.substring(token[0], token[1]) + BRACKET_CLOSE;
      var res = decorate(str, BRACKET_OPEN, depth);
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

  // scriptタグを無効化
  var html = ''
  for (var j = 0; j < res.length; j++) {
    var c = res.charAt(j);
    if (c === '<' && res.substring(j + 1, res.length).startsWith('script')) html += spans('<');
    else if (c === '<' && res.substring(j + 1, res.length).startsWith('/script')) html += spans('<');
    else if (c === ';') html += spans(';');
    else html += c;
  }
  return html;
};

var makeHashTagLinks = function (row) {
  row = ' ' + row + ' ';
  var hashTags = row.match(/(^| )\#[^ ]+/gi);
  if (hashTags) {
    for (var i = 0; i < hashTags.length; i++) {
      var hashTag = hashTags[i].trim();
      var keyword = window.encodeURIComponent(hashTag.substring(1, hashTag.length));
      var target = (PROJECT_NAME !== detectProject()) ? '_blank' : '_self';
      var a = ` <a href="/${PROJECT_NAME}/${keyword}" class="page-link"
        target="${target}">${spans(hashTag)}</a> `;
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
      var a = ` <a href=${encodeHref(word, true)} class="daiiz-ref-link" target="_blank">${word}</a> `;
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
var previewPageText = function ($root, $bubble, title, rowHash) {
  var externalProject = false;
  var extraClassName = '';
  if (PROJECT_NAME !== detectProject()) externalProject = true;
  $.ajax({
    type: 'GET',
    contentType: 'application/json',
    url: `https://scrapbox.io/api/pages/${PROJECT_NAME}/${title}`
  }).success(function (data) {
    EMPTY_LINKS = data.emptyLinks;
    if (externalProject) $bubble.addClass('daiiz-external-project');
    $bubble.attr('data-project', PROJECT_NAME);
    $root.append($bubble);

    var lines = data.lines;
    var contents = [];
    for (var l = 1; l < lines.length; l++) {
      var line = lines[l];
      if (rowHash) {
        if (line.id === rowHash) {
          extraClassName = 'daiiz-line-permalink';
          var row = parseRow(line.text);
          if (row) contents.push(row);
          break;
        }
      }else {
        var row = parseRow(line.text);
        if (row) contents.push(row);
      }
    }
    if (contents.length > 0) {
      $bubble.html(`<div class="daiiz-bubble-text ${extraClassName}">${contents.join('<br>')}</div>`);
      $bubble.show();
    }
  });
};

var $getRefTextBody = function (title, $root, $bubble, projectName) {
  title = title.replace(/^\#/, '');
  var t = title.match(/\#.{24,32}$/);
  var lineHash = null;
  if (t !== null) {
    title = title.replace(/\#.{24,32}$/, '');
    lineHash = t[0].replace('#', '');
  }

  if (title.startsWith('/')) {
    console.log('...');
    return;
    // 外部プロジェクト名とページ名を抽出
    var tt = title.match(/\/([^\/]+)\/(.+)/);
    if (!tt) return;
    var projectName = tt[1];
    var title = tt[2];
  }
  title = window.encodeURIComponent(title);
  PROJECT_NAME = projectName;

  previewPageText($root, $bubble, title, lineHash);
};

exports.enable = function ($appRoot) {
  var timer = null;
  $appRoot.on('mouseenter', 'a.page-link', function (e) {
    var pos = installed('daiiz-text-bubble');
    if (pos === false) return;

    var $a = $(e.target).closest('a.page-link');
    var $parentBubble = $(e.target).closest('div.daiiz-text-bubble');
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
    if ($(`.daiiz-text-bubble[data-pos="${pos}"]`).length > 0) return;

    if ($a.attr('rel') && $a.attr('rel') == 'route') {
      $(`.daiiz-text-bubble:not([data-pos="${pos}"])`).remove();
    }
    var keyword = $a[0].innerText;

    timer = window.setTimeout(function () {
      var projectName = detectProject();
      if ($parentBubble.length > 0) projectName = $parentBubble.attr('data-project');
      $getRefTextBody(keyword.trim(), $root, $bubble, projectName);
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
  var $textBubble = $('<div class="daiiz-text-bubble related-page-list daiiz-card daiiz-card-root"></div>');
  return $textBubble;
};
/* ================ */
