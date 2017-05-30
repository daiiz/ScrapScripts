var bindEvents = function ($appRoot) {
  // 関連カード
  var timer = null;
  $appRoot.on('mouseenter', 'a.page-link', function (e) {
    var $a = $(e.target).closest('a.page-link');
    if ($a.hasClass('empty-page-link')) return;
    var $bubble = $getRelCardBubble($appRoot);
    var rect = $a[0].getBoundingClientRect();
    $bubble.css({
      'max-width': $('.editor-wrapper')[0].offsetWidth - $a[0].offsetLeft,
      'left': rect.left + window.pageXOffset,
      'top': rect.top + $a[0].offsetHeight + window.pageYOffset + 3,
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
      'height': $('.grid li').css('height')
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

// 関連カード
var $getRelCardBubble = function ($appRoot) {
  var $relCardsBubble = $('#daiiz-rel-cards-bubble');
  if ($relCardsBubble.length === 0) {
    $relCardsBubble = $('<div id="daiiz-rel-cards-bubble"></div>');
    $appRoot.find('.page').append($relCardsBubble);
  }
  return $relCardsBubble;
};

var $getRelCards = function (title) {
  var relationLabels = $('.relation-label');
  var $cards = $('<div class="daiiz-cards grid"></div>');
  for (var i = 0; i < relationLabels.length; i++) {
    var $label = $(relationLabels[i]);
    var label = $label.find('.title')[0].innerText;
    if (label === title) {
      var $li = $label.next('li.page-list-item');
      $cards.append($li.clone(true));
      var c = 0;
      while ($li.length === 1 && c < 200) {
        $li = $li.next('li.page-list-item');
        $cards.append($li.clone(true));
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
