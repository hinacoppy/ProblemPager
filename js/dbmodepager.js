// dbmodepager.js
// データをAJAXでDBから取得する方式のページャー
'use strict';

function createFloatWindow(jumpbtnpos) {
  $("#floatWindow").show();
  //[Jump]で開くモーダルウィンドウを準備
  const tocfloatwindow = new FloatWindow({
    hoverid:  "#floatWindow",    //擬似ウィンドウのID
    headid:   "#toctableheader", //ドラッグ移動可能な要素のID
    bodyid:   "#toctable",       //最小化(非表示)される部分
    maxbtn:   "#maxBtn",         //擬似ウィンドウ最大化(再表示)
    minbtn:   "#minBtn",         //擬似ウィンドウ最小化
    closebtn: "#closeBtn",       //擬似ウィンドウを閉じる要素のID
    left:     jumpbtnpos.left,   //表示位置
    top:      jumpbtnpos.top + 50,
    width:    $("#toctable").width(), //ウィンドウサイズ
    height:   $("#toctable").height() + $("#toctableheader").height()
  });
  return tocfloatwindow;
}

function make_referdata(d) {
  let table ="<table>";
  table += "<tr><td>id: </td><td>" + d.categoryid + "-" + d.probnum + "</td></tr>";
  table += "<tr><td>xgid: </td><td>" + d.xgid + "</td></tr>";
  table += "<tr><td>refer: </td><td>" + d.refer + "</td></tr>";
  table += "<tr><td>date: </td><td>" + d.date + "</td></tr>";
  table += "<tr><td>imagefile: </td><td>" + d.imagefile + "</td></tr>";
  table += "<tr><td>pageTitle: </td><td>" + d.pageTitle + "</td></tr>";
  table += "<tr><td>showpipflg: </td><td>" + d.showpipflg + "</td></tr>";
  table += "</table>";
  return table;
}

// AJAXで得られたデータを画面に反映する
function display_data(d) {
  $("title").text(d.title);
  $("#sectionTitle").text(d.sectionTitle);
  $(".doAction").text(d.doAction);
  $(".gamesituation").text(d.gamesituation);
  $(".bgboard").html(d.bgboard).css("width", d.bdwidth);
  $(".pipinfo").text(d.pipinfo);
  $(".answertable").html(d.answertable);
  $(".description").html(d.description);
  const reffer = make_referdata(d);
  $(".bgid").html(reffer);
  $("#categoryid").val(d.categoryid);
  $("#probnum").val(d.probnum);
}

//AJAX通信により、position情報を取得する
function get_position_ajax(categoryid, probnum) {
  // AJAX通信する際のクエリデータをセットする
  const formData = new FormData();
  formData.append("categoryid", categoryid);
  formData.append("probnum", probnum);

  $.ajax({
    url: "/bg_position_json.php",
    method: "POST",
    dataType: "json",
    contentType: false,
    processData: false,
    data: formData
  }).done(function(data) {
    display_data(data);
  }).fail(function() {
    alert("データ取得に失敗しました");
  });
}

function show_page(probnum) {
  const categoryid = $("#categoryid").val();
  const newquery = "?c=" + categoryid + "#" + probnum;
  const hrefto =  "./dbmodePager.html" + newquery;
  location.href = hrefto;
  get_position_ajax(categoryid, probnum);
}

function move_page(probnum, delta) {
  const nextpage = Number(probnum) + delta;
  if (nextpage <= 0 || nextpage > 50) { return; } 
  const nextpn = ("00" + String(nextpage)).slice(-2);
  show_page(nextpn);
}


$(function() {
  //Jumpボタンの下にFloatWindowを用意する
  const jumpbtnpos = $("#jumpbtn").offset();
  const tocfloatwindow = createFloatWindow(jumpbtnpos);

  //クエリで与えられた情報から最初の問題をAJAXでロードする
  const categoryid = location.search.substring(3);
  const probnum = location.hash ? location.hash.substring(1) : "01";
  get_position_ajax(categoryid, probnum);

  //ナビゲーションボタンがクリックされたときは、ボタンIDで処理を振り分け
  $("button").on("click",  (e) => {
    const probnum = $("#probnum").val();
    switch ( $(e.target).attr("id") ) {
    case "selectfirst":
      move_page("01", 0);
      break;
    case "selectlast":
      move_page("50", 0);
      break;
    case "selectnext":
      move_page($("#probnum").val(), +1);
      break;
    case "selectprev":
      move_page($("#probnum").val(), -1);
      break;
    case "return2menu":
      window.location.href = "index.html";
      break;
    case "jumpbtn":
      tocfloatwindow.show();
      break;
    }
  });

  //問題番号を選択
  $("#toctable td").on("click", (e) => {
    e.preventDefault();
    tocfloatwindow.hide();
    const probnum = $(e.target).text();
    show_page(probnum);
  });

});
