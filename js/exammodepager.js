// exammodepager.js
// 問題回答と解説を別にした試験モードページャー
'use strict';

//グローバル変数
var categoryid;
var probnum;
var exammode = true;
var navmenu = false; //まだ表示されていない
var tocfloatwindow;

//イベントハンドラの登録
$(function() {

  //最初の問題を表示する
  const query = $(location).attr("search"); //ex. ?c=QZ1#31 --> ?c=QZ1
  const hash = $(location).attr("hash"); //ex. ?c=QZ1#31 --> #31
  categoryid = query ? query.slice(3, 6) : "E19"; //広域変数
  const probnm = hash ? hash.slice(1, 4) : "01";
  move_page(probnm, 0);

  //ナビゲーションボタンがクリックされたときは、ボタンIDで処理を振り分け
  $("button").on("click",  function(e){
    button_action(this.id);
  });

  //問題番号を選択
  $("#toctable td").on("click", (e) => {
    const probnum = $(e.target).text();
    move_page(probnum, 0);
    tocfloatwindow.hide();
  });

  //モードの変更
  $("[name=mode]").on("change", (e) => {
    exammode = ($('[name=mode]:checked').val() == "Exam");
    if (!exammode) {
      set_examscore();
    } else {
      put_nextbutton();
    }
    $("#nextbutton").toggle(exammode);
    $("#iframe").contents().find('#showanswer').click();　//showanswerボタンを押下し解説を表示
    $("#iframe").contents().find("#scr").text(getScoreStr()).toggle(!exammode); //exammodeの時は非表示
  });

});

//ナビゲーションボタンがクリックされたときの処理
function button_action(buttonid) {
  switch ( buttonid ) {
  case "selectfirst":
    setStorageExam(categoryid, probnum);
    move_page("01", 0);
    break;
  case "selectlast":
    setStorageExam(categoryid, probnum);
    move_page("50", 0);
    break;
  case "selectnext":
  case "nextbutton":
    setStorageExam(categoryid, probnum);
    move_page(probnum, +1);
    break;
  case "selectprev":
    setStorageExam(categoryid, probnum);
    move_page(probnum, -1);
    break;
  case "jumpbtn":   //Jumpボタンを押したとき
    tocfloatwindow.show();
    break;
  default:
    return;
  }
}

function move_page(probnm, delta) {
  const nextpage = Number(probnm) + delta;
  if (nextpage <= 0 || nextpage > 50) { return; } 
  probnum = ("00" + String(nextpage)).slice(-2); //広域変数
  draw_iframe(categoryid, probnum);

  //範囲を超えて移動できないようにする
  $("#selectfirst, #selectprev").prop("disabled", (probnum == "01"));
  $("#selectlast,  #selectnext").prop("disabled", (probnum == "50"));
}

function draw_iframe(categoryid, probnum) {
  const pphtml = "./" + categoryid.slice(0, 1) + "/" + categoryid + "/" + probnum + ".html";
  $("#iframe").prop("src", pphtml); //iframeにHTMLファイルを読み込む

  setTimeout(() => {
    resize_iframe();
    check_selectedanswer();
    put_navmenu();
    if (exammode) {
      put_nextbutton();
    } else {
      $("#iframe").contents().find('#showanswer').click();
      $("#nextbutton").hide();
    }
    $("#iframe").contents().find("button").hide(); //子画面のボタンを非表示
    $("#iframe").contents().find("#scr").toggle(!exammode); //exammodeの時は非表示
  }, 500); //iframeが表示されて200ms後にボタンを非表示

  setTimeout(() => {
    $("#iframe").contents().find("button").hide(); //子画面のボタンを非表示
    $("#iframe").contents().find("#scr").toggle(!exammode); //exammodeの時は非表示
  }, 800); //500ms後にもう一度実行して確実に非表示させる
}

//iframeのサイズ変更
function resize_iframe() {
  $("#iframe").height($('body').height() - 10); //メイン側の縦スクロールバーを消す。10=縦スクロールバーを出さないため
}

function check_selectedanswer() {
  const [answerstr, score] = getStorageExam(categoryid, probnum);
  const ansval = answerstr + "#" + score;
  $("#iframe").contents().find('[name=uchoice]').val([ansval]);
}

function get_answerstr() {
  const checkedval  = $("#iframe").contents().find('[name=uchoice]:checked').val();
  return checkedval;
}

function getStorageExam(categoryid, probnm) {
  const today = get_today();
  const exampager = JSON.parse(localStorage.getItem("exammodepager")) || [];
  const findobj = exampager.find(elem =>  (elem.categoryid === categoryid && elem.date === today));

  if (findobj === undefined || findobj.answerlist === undefined) { return [null, null]; }

  const findans = findobj.answerlist.find(elem => (elem.probnum === probnm));
  if (findans === undefined) { return [null, null]; }

  const answerstr = findans.answerstr;
  const score = findans.score;
  return [answerstr, score];
}

function setStorageExam(categoryid, probnm) {
  const today = get_today();
  //ローカルストレージから試験データを取出し
  const exampager0 = JSON.parse(localStorage.getItem("exammodepager")) || [];
  //以前の試験データを削除
  const exampager = exampager0.filter(elem => !(elem.categoryid === categoryid && elem.date !== today));

  //新規か更新か
  const idx = exampager.findIndex(elem => (elem.categoryid === categoryid && elem.date === today));
  const newobj = (idx !== -1) ? exampager[idx] : { "categoryid":categoryid, "date":today, "answerlist":[] };

  const ansidx = newobj.answerlist.findIndex(elem => (elem.probnum === probnm));

  const answerstr = get_answerstr();
  if (answerstr === undefined) { return; }

  const [answertext, scorestr] = answerstr.split("#");
  const score = Number(scorestr);

  const ansobj = {"probnum":probnm, "answerstr":answertext, "score":score};
  if (ansidx === -1) {
    newobj.answerlist.push(ansobj); //新規は末尾に追加
  } else {
    newobj.answerlist.splice(ansidx, 1, ansobj); //同問題の回答があれば置換え
  }

  if (idx === -1) {
    exampager.push(newobj); //新規は末尾に追加
  } else {
    exampager.splice(idx, 1, newobj); //更新は以前のデータを置換え
  }

  localStorage.setItem("exammodepager", JSON.stringify(exampager)); //ローカルストレージに書込み
}

function set_examscore() {
  const today = get_today();
  const exampager = JSON.parse(localStorage.getItem("exammodepager")) || [];
  const findobj = exampager.find(elem =>  (elem.categoryid === categoryid && elem.date === today));

  if (findobj === undefined || findobj.answerlist === undefined) { return; }

  let response = 0;
  let correct  = 0;
  let errorsum = 0;
  for (const ans of findobj.answerlist) {
    response += 1;
    const scr = Number(ans.score);
    errorsum += scr;
    if (scr == 0) {
      correct += 1;
    }
  }
  setStorage(response, correct, errorsum); //exampagerに登録
}

function get_today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = ("00" + (date.getMonth() + 1)).slice(-2);
  const day = ("00" + date.getDate()).slice(-2);
  const hours = ("00" + date.getHours()).slice(-2);
  const min = ("00" + date.getMinutes()).slice(-2);
  const datestr = year + "/" + month + "/" + day;
  return datestr;
}

function createFloatWindow() {
  $("#floatWindow").show();

  const jumpbtnpos = $("#jumpbtn").offset();

  //[Jump]で開くモーダルウィンドウを準備
  const tocfloatwindow = new FloatWindow({
    hoverid:  '#floatWindow',    //擬似ウィンドウのID
    headid:   '#toctableheader', //ドラッグ移動可能な要素のID
    bodyid:   '#toctable',       //最小化(非表示)される部分
    maxbtn:   '#maxBtn',         //擬似ウィンドウ最大化(再表示)
    minbtn:   '#minBtn',         //擬似ウィンドウ最小化
    closebtn: '#closeBtn',       //擬似ウィンドウを閉じる要素のID
    left:     jumpbtnpos.left,   //表示位置
    top:      jumpbtnpos.top + 50,
    width:    $("#toctable").width(), //ウィンドウサイズ
    height:   $("#toctable").height() + $("#toctableheader").height()
  });
  return tocfloatwindow;
}

function put_nextbutton() {
  const iframeoffset = $("#iframe").offset(); //子画面の位置を取得
  const buttonoffset = $("#iframe").contents().find("#answer").offset(); //子画面の[Answer]ボタンの位置を取得
  const nextbtntop = buttonoffset.top + iframeoffset.top;
  const nextbtnleft = buttonoffset.left + iframeoffset.left;
  const nextbtnpos = {top: nextbtntop, left: nextbtnleft};
  $("#nextbutton").offset(nextbtnpos).show();
}

function put_navmenu() {
  if (navmenu) { return; } //一度表示されれば、二度とこのルーチンは動かない
  const iframeoffset = $("#iframe").offset(); //子画面の位置を取得
  const buttonoffset = $("#iframe").contents().find("#selectfirst").offset(); //子画面の[selectfirst]ボタンの位置を取得
  const navmenutop = buttonoffset.top + iframeoffset.top;
  const navmenuleft = buttonoffset.left + iframeoffset.left;
  const navmenupos = {top: navmenutop, left: navmenuleft};
  $("#nav").offset(navmenupos).show();
  navmenu = true;

  tocfloatwindow = createFloatWindow(); //FloatWindowの位置はjumpボタンの位置決定後
}
