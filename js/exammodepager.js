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
  $("button").on("click",  (e) => {
    button_action(e.currentTarget.id);
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
    }
    $("#iframe").contents().find('#showanswer').click(); //showanswerボタンを押下し解説を表示
    $("#iframe").contents().find("#scr").text(getScoreStr()).toggle(!exammode); //exammodeの時は非表示
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

  $(window).on("resize", debounce(() => {
    resize_iframe();
//    navmenu = false;
//    put_navmenu();
  }, 100));
});

//ナビゲーションボタンがクリックされたときの処理
function button_action(buttonid) {
  switch ( buttonid ) {
  case "selectnext":
    setStorageExam(categoryid, probnum);
    move_page(probnum, +1);
    break;
  case "selectprev":
    setStorageExam(categoryid, probnum);
    move_page(probnum, -1);
    break;
  case "jumpbtn":
    tocfloatwindow.show();
    break;
  case "homebtn":
    location.href = "index.html";
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
  const iframe = document.getElementById('iframe');
  iframe.src = pphtml; //iframeにHTMLファイルを読み込む
  iframe.onload = () => {
    resize_iframe();
    check_selectedanswer();
    put_navmenu();
    if (!exammode) {
      setTimeout(() => {
        $("#iframe").contents().find('#showanswer').click();
      }, 300); //確実にクリックさせるため、300msの待ちを入れる
    }
    $("#iframe").contents().find("button").hide(); //子画面のボタンを非表示
    $("#iframe").contents().find("#scr").toggle(!exammode); //exammodeの時は非表示
  };
}

//iframeのサイズ変更
function resize_iframe() {
//  $("#iframe").height($('body').height() - 10); //メイン側の縦スクロールバーを消す。10=縦スクロールバーを出さないため
  const iframe = document.getElementById("iframe");
//  iframe.style.width  = iframe.contentWindow.document.body.scrollWidth + "px";
//  iframe.style.height = iframe.contentWindow.document.body.scrollHeight + "px";
  iframe.style.width  = (document.body.scrollWidth     )+ "px";
  iframe.style.height = (document.body.scrollHeight -10)+ "px";
//  iframe.contentWindow.document.body.width = iframe.style.width;
//  iframe.contentWindow.document.body.height = iframe.style.height;
//console.log("resize_iframe", iframe.style.width, iframe.style.height, $('body').height(), document.body.scrollHeight);
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

function put_navmenu() {
  if (navmenu) { return; } //一度表示されれば、二度とこのルーチンは動かない
  navmenu = true;

  //Navigationモーダルウィンドウを準備
  const buttonoffset = $("#iframe").contents().find("#selectfirst").offset(); //子画面の[selectfirst]ボタンの位置に配置
  const navwindow = new FloatWindow({
    hoverid:  '#nav', //擬似ウィンドウのID
    headid:   '#navheader', //ドラッグ移動可能な要素のID
    bodyid:   '#navbody', //最小化(非表示)される部分
    left:     buttonoffset.left, //子画面の[selectfirst]ボタンの位置に表示
    top:      1, //上端に表示したいが、0はfalsyなので、画面中央に計算されてしまう。あえて1をセット
    width:    $("#nav").width(), //ウィンドウサイズ
    height:   $("#nav").height(),
    initshow: true,
  });

  //[Jump]で開くモーダルウィンドウを準備
  const jumpbtnpos = $("#jumpbtn").offset(); //FloatWindowの位置はjumpボタンの位置決定後
  tocfloatwindow = new FloatWindow({ //tocfloatwindowは広域変数
    hoverid:  '#tocWindow',    //擬似ウィンドウのID
    headid:   '#toctableheader', //ドラッグ移動可能な要素のID
    bodyid:   '#toctable',       //最小化(非表示)される部分
    maxbtn:   '#maxBtn',         //擬似ウィンドウ最大化(再表示)
    minbtn:   '#minBtn',         //擬似ウィンドウ最小化
    closebtn: '#closeBtn',       //擬似ウィンドウを閉じる要素のID
    left:     jumpbtnpos.left,   //表示位置
    top:      jumpbtnpos.top + 50,
    width:    $("#toctable").width(), //ウィンドウサイズ
    height:   $("#toctable").height() + $("#toctableheader").height(),
    initshow: false,
  });
}
