// exampager.js
// include from exam html (/E/{CAT}/{NUM}.html)
'use strict';

//回答、解説を最初は非表示にする
$('.description').hide();
$('.answerscore').hide();
if (!showpipflg) { $('.pipinfo').hide(); }

$("#scr").text(getScoreStr()); //localStorageからPRを取り出して表示

//範囲を超えて移動できないようにする
$("#selectfirst, #selectprev").prop('disabled', (probnum == "01"));
$("#selectlast,  #selectnext").prop('disabled', (probnum == "50"));

var iframemodeflg = (window != window.parent); //iframeで呼ばれているときはtrue

$(function() {

  //ナビゲーションボタンがクリックされたときは、ボタンIDで処理を振り分け
  $('button').on('click',  (e) => {
    switch ( $(e.target).attr("id") ) {
    case 'selectfirst':
      move_page("01", 0);
      break;
    case 'selectlast':
      move_page("50", 0);
      break;
    case 'selectnext':
      move_page(probnum, +1);
      break;
    case 'selectprev':
      move_page(probnum, -1);
      break;
    }
  });

  //[Description]ボタンか、ボードのクリックで、回答、解説の表示/非表示を切替え
  $('#showanswer').on('click', () => {
    description("toggle");
  });

  //[Description]ボタンか、ボードのクリックで、回答、解説の表示/非表示を切替え
  $('#answer, #board').on('click', () => {
    if (iframemodeflg) { return; } //iframeで呼ばれているときは何もしない
    description("toggle");
  });

  //[Home]ボタンで、メニューに遷移
  $('#return2menu').on('click', () => {
    window.location.href = "../../index.html";
  });

  //[ResetSCR]ボタンで、スコアをリセット
  $('#resetscr').on('click', () => {
    resetScore();
    $("#scr").text(getScoreStr());
  });

  //Debounce 関数(参考：https://www.webdesignleaves.com/pr/jquery/debounce-and-throttle.html)
  const debounce = (func, timeout) => {
    let timer;
    // 引数に受け取った関数 func を拡張して返す
    return function (...args) {
      clearTimeout(timer);
      // timeout で指定された時間後に呼び出しをスケジュール
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    }
  }

  //画面の大きさが変わったときはボードを再描画
  $(window).on("resize", debounce(() => {
    board.redraw();
    if (iframemodeflg) {
      window.parent.resize_iframe(); //iframeで呼ばれているときは親画面の関数を実行する
    }
  }, 100));

});

function move_page(probnum, delta) {
  const nextpage = Number(probnum) + delta;
  if (nextpage <= 0 || nextpage > 50) { return; } 
  const pn = ("00" + String(nextpage)).slice(-2);
  window.location.href = "./" + pn + ".html";
}

function description(action) {
  const [errscore, choicedflg] = get_errscore();
  if (choicedflg && !iframemodeflg) { //iframeで呼ばれているときはここでスコアを計算しない
    calc_next_score(errscore);
    $("#scr").text(getScoreStr());
  }

  switch (action) {
  case "show":
    $('.answerscore').show();
    $('.description').show();
    if (!showpipflg) { $('.pipinfo').show(); }
    break;
  case "hide":
    $('.answerscore').hide();
    $('.description').hide();
    if (!showpipflg) { $('.pipinfo').hide(); }
    break;
  case "toggle":
    $('.answerscore').toggle();
    $('.description').toggle();
    if (!showpipflg) { $('.pipinfo').toggle(); }
    break;
  }
}

function get_errscore() {
  const ansval = $('[name=uchoice]:checked').val();
  const choicedflg = (ansval !== undefined);
  const [choice, eqstr] = (choicedflg) ? ansval.split("#") : [null, "0"];
  const eq = Number(eqstr);
  return [eq, choicedflg];
}
