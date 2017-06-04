// 解析の最小単位は行
var a = "hoge[link1][link2]hoga";
var b = "daiki [link] [link] iizuka";
var n = "I am [daiiz https://scrapbox.io/daiiz/]!";
var m = "I am [daiiz https://scrapbox.io/daiiz/daiiz#eeee]! [/daiiz/daiiz#5844e99dadf4e700000995de]";
var s = "I am [daiiz https://scrapbox.io/daiiz/daiiz#5844e99dadf4e700000995de]! [daiiz]"
var c = "[* bold]";
var d = "[/ italic]";
var cd = "[*/- italic-bold-s]";
var s3 = "[a b c] & [/a b c]";
var icon = "[daiiz.icon] [/daiiz/daiiz.icon*3]";
var il = "foo!! [https://gyazo.com/bbbfc7fc6c0b473d10b60c86fd09da81 http://Image]"
var e = "[* [/ iizuka] foo]";

var bb = "[[bold]]";
var cc = "[* [daiiz.icon]]";
var code = "wow! `code1` & `code2`";
var f = "[/** [/ [* d] [f] ]]";
var g = "...[/** [/ [* d]] aaa] ...";
var h = "[a] [b] [* c[d]]"


console.info('test.a!');
//var project = window.encodeURIComponent(window.location.href.match(/scrapbox.io\/([^\/.]*)/)[1]);
var project = 'daiiz';

var BRACKET_OPEN = '[';
var DOUBLE_BRACKET_OPEN = '[[';
var BRACKET_CLOSE = ']';
var DOUBLE_BRACKET_CLOSE = ']]';
var INLINE_CODE = '`';
var openInlineCode = false;
var openCodeBlock = false;

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
      }else {
        var f = true;
        body = p1;

        // 太字, 斜体, 打ち消し
        if (p0.indexOf('*') >= 0) {
          tagOpen.push('<b>');
          tagClose.push('</b>');
          f = false;
        }
        if (p0.indexOf('/') >= 0) {
          tagOpen.push('<i>');
          tagClose.push('</i>');
          f = false;
        }
        if (p0.indexOf('-') >= 0) {
          tagOpen.push('<s>');
          tagClose.push('</s>');
          f = false;
        }

        if (f) {
          // 半角空白を含むタイトルのページ
          body = words.join(' ');
          var href = (body[0] === '/') ? body : `/${project}/${body}`;
          tagOpen.push(`<a href="${encodeHref(href)}" class="page-link">`);
          tagClose.push('</a>');
        }
      }
      var img = makeImageTag(body);
      if (img[1]) body = img[0];
    }else {
      // リンク, 画像
      var pageLink = makePageLink(body, tagOpen, tagClose);
      tagOpen = pageLink.tagOpen;
      tagClose = pageLink.tagClose;
      body = pageLink.body;
    }

  }else if (strOpenMark === DOUBLE_BRACKET_OPEN) {
    var body = str.replace(/^\[\[/, '').replace(/\]\]$/, '');
    tagOpen.push('<b>');
    tagClose.push('</b>');
    var img = makeImageTag(body);
    if (img[1]) body = img[0];

  }else if (strOpenMark === INLINE_CODE) {
    var code = str.replace(/^\`/, '').replace(/\`$/, '');
    body = '';
    for (var k = 0; k < code.length; k++) {
      body += `<span>${code[k]}</span>`;
    }
    console.log(body)
  }

  return `${tagOpen.join('')}${body}${tagClose.reverse().join('')}`;
};


var makePageLink = function (body, tagOpen, tagClose) {
  var href = (body[0] === '/') ? body : `/${project}/${body}`;
  var className = (body[0] === '/') ? '' : 'page-link';
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
  if (pageRowNum) {
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
      iconName = '/' + project + '/' + iconName;
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

    if (subStr.startsWith(DOUBLE_BRACKET_OPEN)) {
      var token = parse(fullStr, startIdx + DOUBLE_BRACKET_OPEN.length, depth + 1, DOUBLE_BRACKET_CLOSE);
      var str = DOUBLE_BRACKET_OPEN + fullStr.substring(token[0], token[1]) + DOUBLE_BRACKET_CLOSE;
      var res = decorate(str, DOUBLE_BRACKET_OPEN, depth);
      var trans = {};
      trans[str] = res;
      dicts.push(trans);
      startIdx = token[1];
    }else if (subStr.startsWith(BRACKET_OPEN)) {
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

  var result = fullStr;
  for (var i = 1; i < dicts.length; i++) {
    var key = Object.keys(dicts[i])[0];
    result = result.replace(key, dicts[i][key]);
  }
  console.info(dicts);

  return result;
};


var parseRow = function (row) {
  dicts = [];
  var res = parse(row, 0, 0, null);
  console.info(res);
};

parseRow(il);
