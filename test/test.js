// 解析の最小単位は行
var a = "[link]";
var b = "[[bold]]";
var c = "[* bold]";
var d = "[* [/ iizuka]]";

console.info('test!');


var BRACKET_OPEN = '[';
var BRACKET_CLOSE = ']';

var tokens = [];
var parse = function (nowstr, substr, seekCtrlStr) {
  console.info('INA>', nowstr);
  for (var j = 0; j < substr.length; j++) {
    var str = substr.substring(j, substr.length);
    if (str.startsWith(BRACKET_OPEN)) {
      var nextStr = str.substring(BRACKET_OPEN.length, str.length);
      var closedIdx = parse(str, nextStr, BRACKET_CLOSE);
      j += closedIdx;
    }

    // 探していた閉じ記号が見つかった
    if (str.startsWith(seekCtrlStr)) {
      var closedIdx = j + seekCtrlStr.length;
      console.info('GOT>', substr.substring(0, j));
      return closedIdx;
    }
  }
};

// HTML文字列を返す
var decorate = function (token) {

}

var parseRow = function (row) {
  row = row.trim();
  for (var i = 0; i < row.length; i++) {
    var substr = row.substring(i, row.length);
    if (substr.startsWith(BRACKET_OPEN)) {
      var closedIdx = parse(substr, substr, BRACKET_CLOSE);
      //console.info('GOT>', substr.substring(i, closedIdx));
      i += closedIdx;
    }
  }
  console.log(tokens);
};
