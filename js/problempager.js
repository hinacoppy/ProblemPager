// problempager.js
// include from problempager html (ProblemPager/[C]/{CAT}/{NUM}.html)
'use strict';

//回答、解説を最初は非表示にする
$('.description').hide();
$('.gnuanalysis').hide();
if (!showpipflg) { $('.pipinfo').hide(); }

var deschtml = $("#gnuanalysis").text();
var cubeactionflg = is_cubeaction(deschtml);
$('.answertable').html(make_answerlist(deschtml)); //答リストを作成し表示

var calcprflg = false;
$("#scr").text(getScoreStr()); //localStorageからPRを取り出して表示

//範囲を超えて移動できないようにする
$("#selectfirst, #selectprev").prop('disabled', (probnum == "01"));
$("#selectlast,  #selectnext").prop('disabled', (probnum == "50"));

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
  $('#showanswer, #board, #answer').on('click', () => {
    description("toggle");
    if (window != window.parent) {
      window.parent.resize_iframe(); //iframeで呼ばれているときは親画面の関数を実行する
    }
  });

  //[Analysis Result]ボタンで、解析結果を表示/非表示を切替え
  $('#analyse').on('click', () => {
    $('#gnuanalysis').toggle();
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

  //画面の大きさが変わったときはボードを再描画
  $(window).on('resize', () => {
    board.redraw();
  });
});

function move_page(probnum, delta) {
  const nextpage = Number(probnum) + delta;
  if (nextpage <= 0 || nextpage > 50) { return; } 
  const pn = ("00" + String(nextpage)).slice(-2);
  window.location.href = "./" + pn + ".html";
}

function description(action) {
  const descout = mark_choiced(deschtml);
  $("#gnuanalysis").text(descout);

  const [errscore, choicedflg] = get_errscore(deschtml);
  if (choicedflg) {
    calc_next_score(errscore);
    $("#scr").text(getScoreStr());
  }

  switch (action) {
  case "show":
    $('.description').show();
    $('.gnuanalysis').show();
    $('.answertable').hide();
    if (!showpipflg) { $('.pipinfo').show(); }
    break;
  case "hide":
    $('.description').hide();
    $('.gnuanalysis').hide();
    $('.answertable').show();
    if (!showpipflg) { $('.pipinfo').hide(); }
    break;
  case "toggle":
    $('.description').toggle();
    $('.gnuanalysis').toggle();
    $('.answertable').toggle();
    if (!showpipflg) { $('.pipinfo').toggle(); }
    break;
  }
}

function is_cubeaction(deschtml) {
  return (deschtml.match(/cube action/i) != null);
}

function mark_choiced(deschtml) {
  const choice = $('[name=uchoice]:checked').val();
  let descout = "";
  for (const str of deschtml.split("\n")) {
    const choiceflg = (str.indexOf(choice) !== -1);
    descout += str + (choiceflg ? "★" : "") + "\n";
  }
  return descout;
}

function get_errscore(deschtml) {
  const choice = $('[name=uchoice]:checked').val();

  let scstr;
  let choicedflg = false;
  for (const str of deschtml.split("\n")) {
    if (str.indexOf(choice) !== -1) {
      const trary = cubeactionflg ? str.split(choice) : str.split("Eq.:");
      scstr = trary[1].match(/\((.+)\)/); //ex. (-0.123) -> -0.123
      choicedflg = true;
      break;
    }
  }

  let eq = 0;
  if (scstr != null){ //最善手でないとき
    eq = parseFloat(scstr[1]); //"-0.123" -> -0.123
    if (Number.isNaN(eq)) { alert(eq); eq = 0; }
  }
  eq = Math.trunc(Math.abs(eq) * 1000); //eqを千倍して整数化
  return [eq, choicedflg];
}

function make_answerlist(deschtml) {
  let answers = [];
  if (cubeactionflg) {
    const choices = ["No double ","Double, take ","Double, pass ","Too good to double, pass "];
    for (const choice of choices) {
      if (deschtml.indexOf(choice) !== -1) {
        answers.push(choice);
      }
    }
  } else {
    for (const str of deschtml.split("\n")) {
      if (str.indexOf("Eq.") !== -1) {
        const trary = str.split(/  +/); //スペース2個以上のところで区切る
        answers.push(trary[2]);
      }
    }
    answers = sort_answerlist(answers);
  }

  let answerlist = "";
  for (const ans of answers) {
    answerlist += '<label><input type="radio" name="uchoice" value="' + ans + '"> ' + ans + '</label><br>';
  }
  answerlist += '<br><button id="answer">Answer</button>';
  return answerlist;
}

//回答選択肢を文字列ソートして並べる
function sort_answerlist(answers) {
  let answork = [];
  for (const item of answers) {
    let array = item.match(/[0-9]+/g); //数字部分を抽出
    for (let i = 0; i < array.length; i++) {
      array[i] = ('00' + array[i]).slice(-2); //文字列ソート可能となるよう0パディング
    }
    array.push(item); //後で取り出せるよう格納
    answork.push(array);
  }
  answork.sort().reverse(); //逆順ソート

  let ansret = [];
  for (const item of answork) {
    ansret.push(item.pop()); //ソート結果を取り出す
  }
  return ansret;
}
