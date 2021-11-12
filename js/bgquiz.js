// bgquiz.js
// include from bgquiz html (/B/{CAT}/{NUM}.html)
'use strict';

//回答、解説を最初は非表示にする
$('.description').hide();
if (!showpipflg) { $('.pipinfo').hide(); }

var deschtml = $(".description").html();
$('.answertable').html(make_answerlist(deschtml)); //答リストを作成し表示

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
  const descout = mark_choiced(deschtml);
  $(".description").html(descout);

  const errscore = get_errscore(descout);
  calc_next_score(errscore);
  $("#scr").text(getScoreStr());

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

function is_cubeaction(desc) {
  return (desc.indexOf("Best Cube action") > 1)
}

function mark_choiced(deschtml) {
  const choice = $('[name=uchoice]:checked').val();
  const choice2 = is_cubeaction(deschtml) ? choice + ":" : choice;
  const descout = deschtml.replace(choice2, '<input type="radio" checked>' + choice2 + "·"); //mark choiced
  return descout;
}

function get_errscore(deschtml) {
  const temp1 = deschtml.indexOf("·"); //マークを基準に eq を抽出
  const temp2 = deschtml.indexOf("</tr>", temp1);
  const temp3 = deschtml.substr(temp1, temp2 - temp1);
  const temp  = temp3.indexOf("(");

  let eq = 0;
  if (temp > 1){ //最善手でないとき
    eq = parseFloat(temp3.substr(temp +2, 5));
    if (Number.isNaN(eq)) { alert(eq); return 0; }
  }
  eq = Math.trunc(eq * 1000); //eqを千倍して整数化
  return eq;
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

//回答選択肢を文字列ソートして並べる
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

function calc_next_score(errscore) {
console.log("calc_next_score", calcprflg, errscore);
  if (calcprflg) { return; }
  calcprflg = true;

  let [response, correct, errorsum] = getStorage();
  response += 1;
  errorsum  += errscore;
  if (errscore == 0) {
    correct += 1;
  }
  setStorage(response, correct, errorsum);
}

function getScoreStr() {
  const [response, correct, errorsum] = getStorage();
  const scrstr = "(CorrectAnswer= " + correct + "/" + response + ", ErrorScore= " + errorsum + ")";
  return scrstr;
}

function resetScore() {
  setStorage(0, 0, 0);
}

function getStorage() {
  const exampager = JSON.parse(localStorage.getItem("exampager")) || [];
  const findobj = exampager.find(elem =>  (elem.categoryid === categoryid && elem.date === get_today()));

  if (findobj === undefined) {
    return [0, 0, 0];
  }

  const response = parseInt(findobj["response"]); //回答数
  const correct  = parseInt(findobj["correct"]); //正答数
  const errorsum = parseInt(findobj["errorsum"]); //エラー合計
  return [response, correct, errorsum];
}

function setStorage(response, correct, errorsum) {
  const today = get_today();
  const newobj = {"categoryid":categoryid,
                  "response": response,
                  "correct": correct,
                  "errorsum": errorsum,
                  "date": today};

  const exampager = JSON.parse(localStorage.getItem("exampager")) || [];
  const idx = exampager.findIndex(elem => (elem.categoryid === categoryid && elem.date === today));
  const deletecount = (idx === -1) ? 0 : 1;
  exampager.splice(idx, deletecount, newobj); //deletecountで新規追加か置換を制御
  localStorage.setItem("exampager", JSON.stringify(exampager));
}

function get_today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = ("00" + (date.getMonth() + 1)).substr(-2);
  const day = ("00" + date.getDate()).substr(-2);
  const datestr = year + "/" + month + "/" + day;
  return datestr;
}
