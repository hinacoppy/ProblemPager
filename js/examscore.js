// examscore.js
// include from problempager html (ProblemPager/[C]/{CAT}/{NUM}.html)
'use strict';

var calcprflg = false;

function calc_next_score(errscore) {
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
  const today = get_todaytime();
  const exampager = JSON.parse(localStorage.getItem("exampager")) || [];
  const findobj = exampager.find(elem =>  (elem.categoryid === categoryid && elem.date.substring(0,10) === today.substring(0,10)));

  if (findobj === undefined) {
    return [0, 0, 0];
  }

  const response = parseInt(findobj["response"]); //回答数
  const correct  = parseInt(findobj["correct"]); //正答数
  const errorsum = parseInt(findobj["errorsum"]); //エラー合計
  return [response, correct, errorsum];
}

function setStorage(response, correct, errorsum) {
  const today = get_todaytime();
  const newobj = {"categoryid":categoryid,
                  "response": response,
                  "correct": correct,
                  "errorsum": errorsum,
                  "date": today};

  const exampager = JSON.parse(localStorage.getItem("exampager")) || [];
  const idx = exampager.findIndex(elem => (elem.categoryid === categoryid && elem.date.substring(0,10) === today.substring(0,10)));
  const deletecount = (idx === -1) ? 0 : 1;
  exampager.splice(idx, deletecount, newobj); //deletecountで新規追加か置換を制御
  localStorage.setItem("exampager", JSON.stringify(exampager));
}

function get_todaytime() {
  const date = new Date();
  const year = date.getFullYear();
  const month = ("00" + (date.getMonth() + 1)).slice(-2);
  const day = ("00" + date.getDate()).slice(-2);
  const hours = ("00" + date.getHours()).slice(-2);
  const min = ("00" + date.getMinutes()).slice(-2);
  const datestr = year + "/" + month + "/" + day + " " + hours + ":" + min;
  return datestr;
}
