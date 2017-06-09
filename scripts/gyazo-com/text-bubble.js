// Gyazo

var daiizGyazoDescLink = function ($appRoot) {
  // Gyazoの写真の説明文の [] をリンク化する
  $appRoot.on('mouseover', '.image-desc-display', function (e) {
    var $t = $(e.target).closest('.image-desc-display');
    var desc = $t[0].innerHTML;
    var keywords = desc.match(/\[[^\[\]]+\]/gi);
    if (!keywords) return;
    for (var i = 0; i < keywords.length; i++) {
      var keyword = keywords[i].replace('[', '').replace(']', '');
      var projectPage = `/${detectProject()}/${keyword}`;
      desc = desc.replace(keywords[i], `<a class="page-link"
          href="${getScrapboxUrl(projectPage)}">${keyword}</a>`);
    }
    $t.html(desc);
  });
};

var daiizGyazoTextBubbleInit = function ($appRoot, targetSelector) {
  var timer = null;
  $appRoot.on('mouseenter', targetSelector, function (e) {
    //if (!installed('daiiz-text-bubble')) return;

    var $a = $(e.target).closest(targetSelector);
    $a.attr('title', '');

    var $bubble = $getTextBubble();
    var rect = $a[0].getBoundingClientRect();
    $bubble.css({
      'max-width': $('.container-editbox')[0].offsetWidth - $a[0].offsetLeft,
      'left': rect.left + window.pageXOffset,
      'top': rect.top + window.pageYOffset + $a[0].offsetHeight + 3,
      'border-color': '#5f616a'
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

    var tag = $a[0].innerText.replace(/^#/gi, '').replace(/#.{24,32}$/, '');
    if (tag.startsWith('/')) {
      $bubble.hide();
      return;
    }

    timer = window.setTimeout(function () {
      $getRefTextBody(tag.trim(), $appRoot, $bubble);
    }, 650);
  });

  $appRoot.on('mouseleave', targetSelector, function (e) {
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

var daiizGyazoTextBubbleMain = function ($appRoot) {
  daiizGyazoTextBubbleInit($appRoot, 'a.hashtag');
  daiizGyazoTextBubbleInit($appRoot, 'a.page-link');
  daiizGyazoDescLink($appRoot);
};
