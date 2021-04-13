// bgquiz.js
// include from bgquiz html (BgQuiz/[C]/{CAT}/{NUM}.html)
'use strict';

//回答、解説を最初は非表示にする
$('.description').hide();
$('.gnuanalysis').hide();
if (!showpipflg) { $('.pipinfo').hide(); }

var deschtml = $(".description").html();
$('.answertable').html(make_answerlist(deschtml)); //答リストを作成し表示

var calcprflg = false;
$("#pr").text(getPtstr()); //localStorageからPRを取り出して表示

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

  //[Home]ボタンで、メニューに遷移
  $('#return2menu').on('click', function(e){
    window.location.href = "../../index.html";
  });

  //[ResetPR]ボタンで、PRをリセット
  $('#resetpr').on('click', function(e){
    localStorage.removeItem("bgquiz");
    $("#pr").text(getPtstr());
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
  const descout = mark_choiced(deschtml);
  $(".description").html(descout);

  calc_next_pr(descout);
  $("#pr").text(getPtstr());

  switch (action) {
  case "show":
    $('.answerscore').show();
    $('.description').show();
    $('.answertable').hide();
    if (!showpipflg) { $('.pipinfo').show(); }
    break;
  case "hide":
    $('.answerscore').hide();
    $('.description').hide();
    $('.answertable').show();
    if (!showpipflg) { $('.pipinfo').hide(); }
    break;
  case "toggle":
    $('.answerscore').toggle();
    $('.description').toggle();
    $('.answertable').toggle();
    if (!showpipflg) { $('.pipinfo').toggle(); }
    break;
  }
}

function is_cubeaction(desc) {
  return (desc.indexOf("Best Cube action") > 1)
}

function mark_choiced(deschtml) {
  const choice = $('[name=uchoice]:checked').val();
  const choice2 = is_cubeaction(deschtml) ? choice + ":" : choice;
  const descout = deschtml.replace(choice2, '<input type="radio" checked>' + choice2 + "·"); //mark choiced
  return descout;
}

function calc_next_pr(deschtml) {
  if (calcprflg) { return; }
  calcprflg = true;
  const temp1 = deschtml.indexOf("·"); //マークを基準に eq を抽出
  const temp2 = deschtml.indexOf("</tr>", temp1);
  const str = deschtml.substr(temp1, temp2 - temp1);
  const temp = str.indexOf("(");

  let eq = 0;
  if (temp > 1){ //最善手でないとき
    eq = parseFloat(str.substr(temp +2, 5));
    if (Number.isNaN(eq)) { alert(eq); return; }
  }

  let [errorsum, count, pr, prstr] = getStorage();
  errorsum += eq;
  count    += 1;
  pr        = errorsum / count * 500;
  prstr     = "(PR = " + pr.toFixed(1) + " / " + count + ")";
  setStorage(errorsum, count, pr, prstr);
}

function getPtstr() {
  let [errorsum, count, pr, prstr] = getStorage();
  return prstr;
}

function getStorage() {
  const bgquiz = JSON.parse(localStorage.getItem("bgquiz"));
  if (bgquiz == null) {
    return [0, 0, 0, "(PR = 0.0 / 0)"];
  }
  const errorsum = parseFloat(bgquiz["errorsum"]);
  const count    = parseInt(bgquiz["count"]);
  const pr       = parseFloat(bgquiz["pr"]);
  const prstr    = bgquiz["prstr"];
  return [errorsum, count, pr, prstr];
}

function setStorage(errorsum, count, pr, prstr) {
  const bgquiz = {"errorsum": errorsum, "count": count, "pr": pr, "prstr": prstr};
  localStorage.setItem("bgquiz", JSON.stringify(bgquiz));
}

function make_answerlist(deschtml) {
  let answers = [];
  if(is_cubeaction(deschtml)) {
    const choices = ["No double:", "Double/Take:", "Double/Beaver:", "Double/Pass:",
                     "No redouble:", "Redouble/Take:", "Redouble/Beaver:", "Redouble/Pass:"];
    for (const choice of choices) {
      if(deschtml.indexOf(choice) > 1) {
        answers.push(choice.substr(0, choice. length -1)); //delete :
      }
    }
  } else {
    for (const str of deschtml.split("<table")) {
      if (str.indexOf("eq:") > 1) {
        for (const tr of str.split("<tr style")) {
          if (tr.indexOf("eq:") > 1) {
            const td = tr.split("<td style");
            const temp1 = td[3].substr(td[3].indexOf(">") +1, td[3].indexOf(">") +5);
            const temp2 = temp1.substr(0, temp1.length -5);
            if(!answers.includes(temp2)) {
              answers.push(temp2);
            }
          }
        }
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

//回答選択肢を上位ポイントから順に並べる
function sort_answerlist(answers) {
  let answork = [];
  for (const item of answers) {
    let array = item.match(/[0-9]+/g); //数字部分を抽出
    for(let i = 0; i < array.length; i++) {
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

