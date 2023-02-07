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

  const [errscore, choicedflg] = get_errscore();
  if (choicedflg && !iframemodeflg) { //iframeで呼ばれているときはここでスコアを計算しない
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
  return (deschtml.match(/cube action/i) !== null);
}

function mark_choiced(deschtml) {
  const ansval = $('[name=uchoice]:checked').val();
  const [choice, eqstr] = (ansval !== undefined) ? ansval.split("#") : [null, "0"];
  let descout = "";
  let srchflg = true;
  for (const line of deschtml.split("\n")) {
    const choiceflg = (line.indexOf(choice) !== -1);
    descout += line + ((choiceflg && srchflg) ? "★" : "") + "\n"; //最初に見つけた行だけにマーク
    if (choiceflg) { srchflg = false; }
  }
  return descout;
}

function get_errscore() {
  const ansval = $('[name=uchoice]:checked').val();
  const choicedflg = (ansval !== undefined);
  const [choice, eqstr] = (choicedflg) ? ansval.split("#") : [null, "0"];
  const eq = Number(eqstr);
  return [eq, choicedflg];
}

function get_eq(eqstr) {
  let eq = 0;
  const scstr = eqstr.match(/\((.+?)\)/); //ex. (-0.123) -> -0.123
  if (scstr != null){ //キューブアクションで最善手でない or チェッカーアクションのとき
    eq = parseFloat(scstr[1]); //"-0.123" -> -0.123
    if (Number.isNaN(eq)) { eq = 0; } //チェッカーアクションで最善手のとき (ex. G:10.97% B:0.42%)
  }
  eq = Math.trunc(Math.abs(eq) * 1000); //eqを千倍して整数化
  return eq;
}

function make_answerlist(deschtml) {
  let answers = [];
  const regex = cubeactionflg ? new RegExp("\\d\\. +(.+?)  +(.*)", "i")
                              : new RegExp(".*\\d\\..*?  +(.+?)  +eq(.*)", "i"); //スペース2個で区切る

  for (const line of deschtml.split("\n")) {
    const matchary = line.match(regex); //\1=action, \2=equity
    if (matchary != null) {
      const action = matchary[1].trim();
      const eq = get_eq(matchary[2]);
      const ansval = action + "#" + eq;
      answers.push(ansval);
    }
  }
  answers = sort_answerlist(answers);

  let answerlist = "";
  for (const ansval of answers) {
    const [anstext, eq] = ansval.split("#");
    answerlist += '<label><input type="radio" name="uchoice" value="' + ansval + '"> ' + anstext + '</label><br>';
  }
  answerlist += '<br><button id="answer">Answer</button>';
  return answerlist;
}

//回答選択肢を文字列ソートして並べる
function sort_answerlist(answers) {
  if (cubeactionflg) {
    return sort_answerlist_cube(answers);
  } else {
    return sort_answerlist_checker(answers);
  }
}

function sort_answerlist_cube(answers) {
  const choices = ["No double","Double, take","Double, pass","Too good to double, pass"];
  let answersout = [];
  for (const choice of choices) {
    for (const ans of answers) {
      const [action, eq] = ans.split("#");
      if (choice == action) {
        answersout.push(ans);
      }
    }
  }
  return answersout;
}

function sort_answerlist_checker(answers) {
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
