(function () {
    var diffDate = function (date, diff) {
      // date: '1993-09-11'
      // diff: +1, -1
      var d = new Date(date);
      d.setDate(d.getDate() + diff);
      var a = [
        d.getFullYear(),
        ('00' + (1 + d.getMonth())).slice(-2),
        ('00' + d.getDate()).slice(-2)
      ];
      return a.join('-');
    };

    window.addEventListener('click', function (e) {
        if (e.target.className.indexOf('wk-dayname') === -1) return;
        var daylink = e.target.querySelector('.wk-daylink');

        // GoogleCalendarに強く依存してる
        var year = document.getElementById('currentDate:1').innerText.match(/\d{4}/);
        var d = daylink.innerText.split('/');
        if (year === null || d.length < 2) return;

        var day = d[1].match(/\(.+?\)/);
        if (day === null) return;

        var month = d[0].match(/\d+/)[0];
        var date = [
            year[0],
            ('00' + month).slice(-2),
            ('00' + d[1].match(/\d+/)[0]).slice(-2)
        ];
        day = day[0].replace('(', '').replace(')', '');

        /****** 編集エリア ******/
        // お好きなタイトル
        var title = date.join('-');

        // ScrapboxプロジェクトID
        var scrapboxProject = 'daiiz-private';
        /************************/

        var projectUrl = 'https://scrapbox.io/' + scrapboxProject + '/';
        var tags = [
            '[← ' + projectUrl + encodeURIComponent(diffDate(title, -1)) +']',
            '#' + date[0],
            '#' + month + '月',
            '#' + day + '曜日',
            '[→ ' + projectUrl + encodeURIComponent(diffDate(title, +1)) +']'
        ];

        /****** 編集エリア ******/
        // お好きなハッシュタグまたは本文
        var body = encodeURIComponent(tags.join(' '));
        /************************/

        // Scrapboxページを開く
        var scrapboxUrl = 'https://scrapbox.io/' + scrapboxProject + '/' +
            encodeURIComponent(title);

        window.open(scrapboxUrl + '?body=' + body);
        e.stopPropagation();
    }, false);
})();
