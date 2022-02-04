// keeaepager.js
// include from problempager html (ProblemPager/[C]/{CAT}/{NUM}.html)
'use strict';

//回答、解説を最初は非表示にする
$('.description').hide();
if (!showpipflg) { $('.pipinfo').hide(); }

var deschtml = $(".description").html();
var cubeactionflg = is_cubeaction(deschtml);
$('.answertable').html(make_answerlist(deschtml)); //答リストを作成し表示

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
  $(".description").html(descout);

  const [errscore, choicedflg] = get_errscore(deschtml);
  if (choicedflg) {
    calc_next_score(errscore);
    $("#scr").text(getScoreStr());
  }

  switch (action) {
  case "show":
    $('.description').show();
    $('.answertable').hide();
    if (!showpipflg) { $('.pipinfo').show(); }
    break;
  case "hide":
    $('.description').hide();
    $('.answertable').show();
    if (!showpipflg) { $('.pipinfo').hide(); }
    break;
  case "toggle":
    $('.description').toggle();
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
  for (const line of deschtml.split("\n")) {
    if (line.indexOf(choice) !== -1 && line.match(/eq/i) != null) {
      const line2 = line.slice(0, -1 * "<br>".length); //delete <br>
      descout += line2 + "★" + "<br>\n"; //insert ★ before <br>
    } else {
      descout += line + "\n";
    }
  }
  return descout;
}

function get_errscore(deschtml) {
  const choice = $('[name=uchoice]:checked').val();

  let scstr;
  let choicedflg = false;
  for (const line of deschtml.split("\n")) {
    if (line.indexOf(choice) !== -1 && line.match(/eq/i) != null) {
      const regex = cubeactionflg ? new RegExp("\\((.+?)\\)", "i") : new RegExp("eq.*? \\((.+?)\\)", "i");
      scstr = line.match(regex); //ex. (-0.123) -> -0.123
      choicedflg = true;
      break;
    }
  }

  let eq = 0;
  if (scstr != null){ //キューブアクションで最善手でない or チェッカーアクションのとき
    eq = parseFloat(scstr[1]); //"-0.123" -> -0.123
    if (Number.isNaN(eq)) { eq = 0; } //チェッカーアクションで最善手のとき (ex. G:10.97% B:0.42%)
  }
  eq = Math.trunc(Math.abs(eq) * 1000); //eqを千倍して整数化
  return [eq, choicedflg];
}

function make_answerlist(deschtml) {
  let answers = [];
  if (cubeactionflg) {
    const choices = ["No double:", "Double/Take:", "Double/Beaver:", "Double/Pass:",
                     "No redouble:", "Redouble/Take:", "Redouble/Beaver:", "Redouble/Pass:"];
    for (const choice of choices) {
      if (deschtml.indexOf(choice) !== -1) {
        answers.push(choice);
      }
    }
  } else {
    for (const line of deschtml.split("\n")) {
      if (line.indexOf("<pre>   +24-23-22-21-20-19-") !== -1) { //解説に複数ポジションがある場合は、最初の解析結果のみを使う
        break;
      }
      const movestrregx = line.match(/\d\. (.+) eq/i); //ex. 2. 8/6 8/3    eq: +0.156 (-0.094) ... -> 8/6 8/3
      if (movestrregx != null) {
        const movstr = movestrregx[1].trim();
        answers.push(movstr);
      }
    }
    answers = sort_answerlist(answers);
  }

  let answerlist = "";
  for (const ansval of answers) {
    const anstext = cubeactionflg ? ansval.slice(0, -1) : ansval; // delte ":" when cubeaction
    answerlist += '<label><input type="radio" name="uchoice" value="' + ansval + '"> ' + anstext + '</label><br>';
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
