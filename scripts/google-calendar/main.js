$(function () {
    $('.wk-daylink').on('click', function (e) {
        // GoogleCalendarに強く依存してる
        var year = $('title').text().match(/\d{4}/);
        var d = $(e.target).text().split('/');
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

        var tags = [
            '#' + date[0],
            '#' + month + '月',
            '#' + day + '曜日'
        ];
        console.warn(tags);
        /****** 編集エリア ******/
        // ScrapboxプロジェクトID
        var scrapboxProject = 'daiiz-private';

        // お好きなタイトル
        var title = date.join('-');

        // お好きなハッシュタグまたは本文
        var body = encodeURIComponent(tags.join(' '));
        /************************/

        // Scrapboxページを開く
        var scrapboxUrl = 'https://scrapbox.io/' + scrapboxProject + '/' +
            encodeURIComponent(title);
        // body = encodeURIComponent(body);
        console.log(scrapboxUrl + '?body=' + body);
        window.open(scrapboxUrl + '?body=' + body);

        return false;
    });
});
