var bindEvents = function ($appRoot) {
  /* 関連カード */
  var timer = null;
  $appRoot.on('mouseenter', 'a.page-link', function (e) {
    var relLabelHeight = +($('li.relation-label').css('height').split('px')[0]);
    var pad = 10;  // main.cssでの設定値
    var $a = $(e.target).closest('a.page-link');
    if ($a.hasClass('empty-page-link')) return;
    if (!$a.attr('rel') && $a.attr('rel') !== 'route') return;
    var $bubble = $getRelCardBubble($appRoot);
    var rect = $a[0].getBoundingClientRect();
    $bubble.css({
      'max-width': $('.editor-wrapper')[0].offsetWidth - $a[0].offsetLeft,
      'left': rect.left + window.pageXOffset,
      // .related-page-listのmargin-top=24pxぶん引く
      'top': rect.top + window.pageYOffset - relLabelHeight - (pad * 2) - 24 - 5,  // +$a[0].offsetHeight
      'background-color': $('body').css('background-color')
    });
    var tag = $a[0].innerText.replace(/^#/gi, '').split('#')[0];
    if (tag.startsWith('/')) {
      $bubble.hide();
      return;
    }
    $cards = $getRelCards(tag);
    if ($cards.children().length === 0) {
      $bubble.hide();
      return;
    }

    $bubble.find('.daiiz-cards').remove();
    $bubble.append($cards);
    $bubble.css({
      'height': relLabelHeight
    });

    timer = window.setTimeout(function () {
      $bubble.show();
    }, 650);
  });

  $appRoot.on('mouseleave', 'a.page-link', function (e) {
    window.clearTimeout(timer);
  });

  $appRoot.on('mouseleave', '#daiiz-rel-cards-bubble', function (e) {
    var $bubble = $getRelCardBubble($appRoot);
    window.clearTimeout(timer);
    $bubble.hide();
  });

  $appRoot.on('click', function () {
    var $bubble = $getRelCardBubble($appRoot);
    window.clearTimeout(timer);
    $bubble.hide();
  });
};

/* 関連カード */
var $getRelCardBubble = function ($appRoot) {
  var $relCardsBubble = $('#daiiz-rel-cards-bubble');
  if ($relCardsBubble.length === 0) {
    $relCardsBubble = $('<div id="daiiz-rel-cards-bubble" class="related-page-list"></div>');
    $appRoot.find('.page').append($relCardsBubble);
  }
  return $relCardsBubble;
};

/* 関連カード */
var $getRelCards = function (title) {
  var project = window.encodeURIComponent(window.location.href.match(/scrapbox.io\/([^\/.]*)/)[1]);
  var $fillUpIcon = function ($clonedLi) {
    if ($clonedLi.find('img.lazy-load-img').length === 0) {
      var cardTitle = window.encodeURIComponent($clonedLi.find('div.title').text());
      $clonedLi.find('div.icon').append(
        `<img src="https://scrapbox.io/api/pages/${project}/${cardTitle}/icon"
        class="lazy-load-img">`);
    }
    return $clonedLi;
  };

  $('.daiiz-cards').remove();
  var relationLabels = $('.relation-label');
  var $cards = $('<div class="daiiz-cards grid"></div>');
  for (var i = 0; i < relationLabels.length; i++) {
    var $label = $(relationLabels[i]);
    var label = $label.find('.title')[0].innerText;
    if (label === title) {
      var $li = $label.next('li.page-list-item');
      var $clonedLi = $li.clone(true);
      $cards.append($fillUpIcon($clonedLi));
      var c = 0;
      while ($li.length === 1 && c < 200) {
        $li = $li.next('li.page-list-item');
        var $clonedLi = $li.clone(true);
        $cards.append($fillUpIcon($clonedLi));
        c++;
      }
    }
  }
  return $cards;
};

$(function () {
  var $appRoot = $('#app-container');
  bindEvents($appRoot);
});
