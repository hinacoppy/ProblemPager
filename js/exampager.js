// exampager.js
// include from exam html (/E/{CAT}/{NUM}.html)
'use strict';

//回答、解説を最初は非表示にする
$('.description').hide();
$('.gnuanalysis').hide();
$('.answerscore').hide();
if (!showpipflg) { $('.pipinfo').hide(); }

var calcprflg = false;
$("#scr").text(getScoreStr()); //localStorageからPRを取り出して表示

//範囲を超えて移動できないようにする
$("#selectfirst, #selectprev").prop('disabled', (probnum == "01"));
$("#selectlast,  #selectnext").prop('disabled', (probnum == "50"));

$(function() {

  //ナビゲーションボタンがクリックされたときは、ボタンIDで処理を振り分け
  $('button').on('click',  function(e){
    switch ( $(this).attr("id") ) {
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
  $('#showanswer, #board, #answer').on('click', function(e){
    description("toggle");
    if(window != window.parent) {
      window.parent.resize_iframe(); //iframeで呼ばれているときは親画面の関数を実行する
    }
  });

  //[Analysis Result]ボタンで、解析結果を表示/非表示を切替え
  $('#analyse').on('click', function(e){
    $('#gnuanalysis').toggle();
  });

  //[Home]ボタンで、メニューに遷移
  $('#return2menu').on('click', function(e){
    window.location.href = "../../index.html";
  });

  //[ResetSCR]ボタンで、スコアをリセット
  $('#resetscr').on('click', function(e){
    resetScore();
    $("#scr").text(getScoreStr());
  });

  //画面の大きさが変わったときはボードを再描画
  $(window).on('resize', function(e){
    board.redraw();
  });
});

function move_page(probnum, delta) {
  const nextpage = Number(probnum) + delta;
  if (nextpage <= 0 || nextpage > 50) { return; } 
  const pn = ("00" + String(nextpage)).substr(-2);
  window.location.href = "./" + pn + ".html";
}

function description(action) {
  calc_next_score();
  $("#scr").text(getScoreStr());

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

function calc_next_score() {
  if (calcprflg) { return; }
  calcprflg = true;

  const scoreval = $('[name=uchoice]:checked').val();
  if (scoreval === undefined) { //ラジオボタンが選択されていないとき
    return; //do nothing
  }

  const errscore = parseInt(scoreval);
  let [responses, correct, errorsum] = getStorage();
  responses += 1;
  errorsum  += errscore;
  if (errscore == 0) {
    correct += 1;
  }
  setStorage(responses, correct, errorsum);
}

function getScoreStr() {
  const [responses, correct, errorsum] = getStorage();
  const scrstr = "(CorrectAnswer= " + correct + "/" + responses + ", ErrorScore= " + errorsum + ")";
  return scrstr;
}

function resetScore() {
  setStorage(0, 0, 0);
}

function getStorage() {
  const exampager = JSON.parse(localStorage.getItem("exampager")) || [];
  const findobj = exampager.find(elem => Object.keys(elem)[0] === categoryid);

  if (findobj === undefined) {
    return [0, 0, 0];
  }

  const findobjval = findobj[categoryid];
  const responses = parseInt(findobjval["responses"]); //回答数
  const correct   = parseInt(findobjval["correct"]); //正答数
  const errorsum  = parseInt(findobjval["errorsum"]); //エラー合計
  return [responses, correct, errorsum];
}

function setStorage(responses, correct, errorsum) {
  const exampager = JSON.parse(localStorage.getItem("exampager")) || [];
  const newobj = {[categoryid]: {"responses": responses, "correct": correct, "errorsum": errorsum}};

  const idx = exampager.findIndex(elem => Object.keys(elem)[0] === categoryid);
  const deletecount = (idx === -1) ? 0 : 1;
  exampager.splice(idx, deletecount, newobj); //deletecountで新規追加か置換を制御
  localStorage.setItem("exampager", JSON.stringify(exampager));
}
