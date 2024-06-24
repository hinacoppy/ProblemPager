//tableofcontents.js
//called from index.html (Problem Pager Table of Contents)
"use strict";

function getRadiobuttonValue(name) {
  //ラジオボタンのチェックされている値を取得
  for (const elem of document.getElementsByName(name)) {
    if (elem.checked) {
      return elem.value;
    }
  }
  return null; //checkedのものがなければここに到達
}

function setRadiobuttonValue(name, value) {
  //ラジオボタンをセット
  for (const elem of document.getElementsByName(name)) {
    if (elem.value == value) {
      elem.checked = true;
    }
  }
}

function setRadioButton() {
  //指定されたクエリによりラジオボタンを選択
  const disp = location.search.substring(6); //ignore "disp="
  if (disp == "xg" || disp == "db") {
    setRadiobuttonValue("disp", disp);
    setRadiobuttonValue("mode", "oneonone");
    setCookie(); //クエリで設定したときはcookieをセット
  } else {
    //クエリが設定されていないときはcookieを読み、ラジオボタンに反映
    //cookieを使うのはindex.htmlに返ってきたときにラジオボタンの状態を覚えておくため
    const eachcookie = document.cookie.split(";");
    eachcookie.forEach( (v) => {
      const [key, value] = v.trim().split("="); //cookieをkeyとvalueに分ける
      if (key == "disp") { setRadiobuttonValue("disp", value); }
      if (key == "mode") { setRadiobuttonValue("mode", value); }
    });
  }
  //クエリもcookieもないときは、デフォルト(checked)を使う
}

function hideOnGithub() {
  //GitHubで動いているときはdispのラジオボタンは非表示
  if (location.host == "hinacoppy.github.io") {
    for (const elem of document.querySelectorAll(".ongithub")) {
      elem.style.display = "none";
    }
  }
}

function selectCategory(evt) {
  //カテゴリーを選択 .contentsがクリックされたときに呼ばれる
  const query = evt.target.id;
  const [categoryid, probnm] = query.split("#");
  const probnum = probnm ? probnm : "01";
  const newquery = categoryid + "#" + probnum;

  const disp = getRadiobuttonValue("disp");
  const mode = getRadiobuttonValue("mode");
  let hrefto;
  if      (disp == "db")       { hrefto = "./dbmodePager.html?c=" + newquery; }
  else if (disp == "xg")       { hrefto = "./xg-" + categoryid.slice(0, 1) + "/" + categoryid + "/" + probnum + ".html"; }
  /* else if (disp == "static") */ //oneonone、examモードの選択が有効なのは disp==static のときのみ
  else if (mode == "oneonone") { hrefto = "./"    + categoryid.slice(0, 1) + "/" + categoryid + "/" + probnum + ".html"; }
  else if (mode == "exam")     { hrefto = "./exammodePager.html?c=" + query; }

  window.location.href = hrefto;
}

function setCookie() {
  //Cookieをセット ラジオボタンが変更されたときに呼ばれる
  document.cookie = "disp=" + getRadiobuttonValue("disp");
  document.cookie = "mode=" + getRadiobuttonValue("mode");
}

function setEventListener() {
  //コンテンツのクリックを見張る
  for (const elem of document.querySelectorAll(".contents")) {
    elem.addEventListener("click", (evt) => { selectCategory(evt); });
  }

  //ラジオボタンの変更を見張る
  for (const elem of document.querySelectorAll("input")) {
    elem.addEventListener("change", () => { setCookie(); });
  }
}

//main
hideOnGithub();
setRadioButton();
setEventListener();

