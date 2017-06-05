// 解析の最小単位は行
console.info("test.b.js");
var a0 = "[a b c] & [/a b c]";
var a1 = 'hello[] #hashpotato # [/daiiz/daiiz#5844e99dadf4e700000995de] #hash #hash2';
var a2 = 'hoge[link1][/ link2 [link22] ]hoga http://daiiz.hatenablog.com/';
var a3 = "hoge[link1][link2]hoga";
var a4 = "daiki [link] [link] iizuka";
var a5 = "I am [daiiz https://scrapbox.io/daiiz/]!";
var a6 = "I am [daiiz https://scrapbox.io/daiiz/daiiz#eeee]! [/daiiz/daiiz#5844e99dadf4e700000995de]";
var a7 = "I am [daiiz https://scrapbox.io/daiiz/daiiz#5844e99dadf4e700000995de]! [daiiz]"
var a8 = "[* bold]";
var a9= "[/ italic]";

var b0 = "[/italic-project]";
var b1 = "[*/- italic-bold-s]";
var b2 = "[daiiz.icon] [/daiiz/daiiz.icon*3]";
var b3 = "foo!! [https://gyazo.com/bbbfc7fc6c0b473d10b60c86fd09da81 http://Image]"
var b4 = "[* [/ iizuka] foo]";
var b5 = "[/shokai/Scrapboxページの文章をMarkdownに変換するBookmarkletを書いた - #daiizメモ]";
var b6 = "[[bold]]";
var b7 = "[* [daiiz.icon]]";
var b8 = "  `[zzz]` & wow! `code1` & `code2` & `[aaa]`";
var b81 = "`[a%20b]` -> `encodeURIComponent('a%20b')` ";
var b9 = "[/** [/ [* d] [f] ]]";

var c0 = "...[/** [/ [* d]] aaa] ...";
var c1 = "[a] [b] [* c[d]]"
var c2 = "[_ re daiki]";
var c3 = "[re https://scrapbox.io/daiiz/daiiz#5844e99dadf4e700000995de]";
var c4 = "[https://hashrock-sandbox.github.io/scrapbox-map/ https://gyazo.com/740ee28b66f36889befccb3bd81f2a1a]"
var c5 = "#動物 #Scrapbox #aa";
var c6 = "いる．https://twitter.com/daizplus/status/869335896482394113";
var c7 = " $ ddd d d dddd [9]";
var c8 = "[http://daiiz.hatenablog.com/archive/category/google%20app%20engine]";
var c9 = "[http://daiiz.hatenablog.com/archive/category/google app engine] &&&& http://daiiz.hatenablog.com/archive/category/google%20app%20engine";

var z0 = "[s [4]";
var z1 = "[s [* 4]";
var z2 = '[Bug https://scrapbox.io/daiiz-private/daiiz%20Script#5934d1dfadf4e700004a6451]';
var z3 = '[/shokai/YAPC2016Gyazzスライド#57ba8991000000000000ff4502] が詳しい';

var x0 = '`[a%20b]` -> `encodeURIComponent("a%20b")` -> `a%2520b` ->  ページ「[a%20b]」「[a%20b]」を開く';  // 後方変換に引っ張られる?
var x1 = '[a%20b] -> `encodeURIComponent("a%20b")` -> `a%2520b` ->  ページ「[a%20b]」「[a%20b]」を開く';
console.log(parseRow(z2));
