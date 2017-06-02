var bindEvents = function ($appRoot) {
  /* 関連カード */
  var timer = null;
  $appRoot.on('mouseenter', 'a.page-link', function (e) {
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
    var tag = $a[0].innerText.replace(/^#/gi, '').split('#')[0];
    if (tag.startsWith('/')) {
      $bubble.hide();
      return;
    }

    timer = window.setTimeout(function () {
      $getRefTextBody(tag, $root, $bubble);
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

var $getRefTextBody = function (title, $root, $bubble) {
  var project = window.encodeURIComponent(window.location.href.match(/scrapbox.io\/([^\/.]*)/)[1]);
  var title = window.encodeURIComponent(title);
  $.ajax({
    type: 'GET',
    url: `https://scrapbox.io/api/pages/${project}/${title}/text`
  }).success(function (data) {
    $root.append($bubble);
    var rows = data.split('\n');
    var res = [];
    for (var j = 1; j < rows.length; j++) {
      var row = rows[j];

      // 太文字 [[ ]]
      var bolds = row.match(/\[\[.+?\]\]/gi);
      if (bolds) {
        for (var i = 0; i < bolds.length; i++) {
          var bold = bolds[i];
          var keyword = bold.replace(/\[\[/gi, '').replace(/\]\]/gi, '');
          var b = `<b>${keyword}</b>`;
          row = row.replace(bold, b);
        }
      }

      // 太文字 [* ]
      var bolds = row.match(/\[\*.* .+?\]/gi);
      if (bolds) {
        for (var i = 0; i < bolds.length; i++) {
          var bold = bolds[i];
          console.info(bold)
          var keyword = bold.replace(/\[\*.* /gi, '').replace(/\]/gi, '');
          var b = `<b>${keyword}</b>`;
          row = row.replace(bold, b);
        }
      }

      // 斜体
      var italics = row.match(/\[\/ .+?\]/gi);
      if (italics) {
        for (var i = 0; i < italics.length; i++) {
          var italic = italics[i];
          var keyword = italic.replace(/\[\/ /gi, '').replace(/\]/gi, '');
          var b = `<i>${keyword}</i>`;
          row = row.replace(italic, b);
        }
      }

      // リンク，画像，アイコン
      var links = row.match(/\[.+?\]/gi);
      if (links) {
        for (var i = 0; i < links.length; i++) {
          var link = links[i];
          var keyword = link.replace(/\[/gi, '').replace(/\]/gi, '').split('<')[0];
          var href = (keyword[0] === '/') ? keyword : `/${project}/${keyword}`;
          var className = (keyword[0] === '/') ? '' : 'page-link';
          // 別名記法
          if (keyword.indexOf(' ') > 0) {
            var toks = keyword.split(' ');
            var t0 = toks[0];
            var t1 = toks[1];
            if (t0.startsWith('http')) {
              // 先頭以外の要素を全結合
              toks.reverse().pop();
              toks.reverse();
            }else if (t1.startsWith('http')){
              // 末尾以外の要素を全結合
              t0 = toks.pop();
            }else {
              t0 = toks.join(' ');
            }
            t1 = toks.join(' ');

            var fmts = {};
            if (t0.startsWith('http') && !t0.endsWith('.jpg') && !t0.endsWith('.png') && !t0.endsWith('.gif')) {
              fmts.href = t0;
              fmts.label = t1;
            }else {
              fmts.href = t1;
              fmts.label = t0;
            }
            keyword = fmts.label.replace('#', '');
            var toks = fmts.href.split('/');
            var pageName = window.encodeURIComponent(toks.pop());
            href = toks.join('/') + '/' + pageName;
            className = 'daiiz-ref-link';
          };
          var a = `<a href="${href}" class="${className}">${keyword}</a>`;
          if (keyword.endsWith('.icon')) {
            a = `<img class="daiiz-tiny-icon" src="https://scrapbox.io/api/pages${href.split('.icon')[0]}/icon">`;
          }else if (keyword.endsWith('.jpg') || keyword.endsWith('.png') || keyword.endsWith('.gif')) {
            a = `<img class="daiiz-small-img" src="${keyword}">`;
          }else if (keyword.startsWith('https://gyazo.com/') || keyword.startsWith('http://gyazo.com/')) {
            a = `<img class="daiiz-small-img" src="${keyword}/raw">`;
          }
          row = row.replace(link, a);
        }
      }

      // ハッシュタグ
      var hashTags = row.match(/(^| )\#[^ ]+/gi);
      if (hashTags) {
        for (var i = 0; i < hashTags.length; i++) {
          var hashTag = hashTags[i].trim();
          var keyword = hashTag.substring(1, hashTag.length);
          var a = `<a href="/${project}/${keyword}" class="page-link">${hashTag}</a>`;
          row = row.replace(hashTag, a);
        }
      }

      if (row && row.length > 0) {
        res.push(row);
      }

    }
    $bubble.html(`<div class="daiiz-bubble-text">${res.join('<br>')}</div>`);
    $bubble.show();
  });
};

$(function () {
  var $appRoot = $('#app-container');
  bindEvents($appRoot);
});
