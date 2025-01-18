// examscore_class.js
// include from problempager html (ProblemPager/[C]/{CAT}/{NUM}.html)
'use strict';

class ExamScore {
  constructor(categoryid) {
    this.categoryid = categoryid;
    this.calcprflg = false;
  }

  calc_next_score(errscore) {
    if (this.calcprflg) { return; }
    this.calcprflg = true; //同じ問題を解きなおすときはスコアを再計算しない

    let [response, correct, errorsum] = this.getStorage();
    response += 1;
    errorsum  += errscore;
    if (errscore == 0) {
      correct += 1;
    }
    this.setStorage(response, correct, errorsum);
  }

  getScoreStr() {
    const [response, correct, errorsum] = this.getStorage();
    const scrstr = "(CorrectAnswer= " + correct + "/" + response + ", ErrorScore= " + errorsum + ")";
    return scrstr;
  }

  resetScore() {
    this.setStorage(0, 0, 0);
  }

  getStorage() {
    const today = this.get_todaytime();
    const exampager = JSON.parse(localStorage.getItem("exampager")) || [];
    const findfn = (elem) => (elem.categoryid === this.categoryid && elem.date.substring(0,10) === today.substring(0,10));
    const findobj = exampager.find(findfn);

    if (findobj === undefined) {
      return [0, 0, 0];
    }

    const response = parseInt(findobj["response"]); //回答数
    const correct  = parseInt(findobj["correct"]); //正答数
    const errorsum = parseInt(findobj["errorsum"]); //エラー合計
    return [response, correct, errorsum];
  }

  setStorage(response, correct, errorsum) {
    const today = this.get_todaytime();
    const newobj = {
      "categoryid":this.categoryid,
      "response": response,
      "correct": correct,
      "errorsum": errorsum,
      "date": today,
    };

    const exampager = JSON.parse(localStorage.getItem("exampager")) || [];
    const findfn = (elem) => (elem.categoryid === this.categoryid && elem.date.substring(0,10) === today.substring(0,10));
    const idx = exampager.findIndex(findfn);
    const deletecount = (idx === -1) ? 0 : 1;
    exampager.splice(idx, deletecount, newobj); //deletecountで新規追加か置換を制御
    localStorage.setItem("exampager", JSON.stringify(exampager));
  }

  get_todaytime() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ("00" + (date.getMonth() + 1)).slice(-2);
    const day = ("00" + date.getDate()).slice(-2);
    const hour = ("00" + date.getHours()).slice(-2);
    const min = ("00" + date.getMinutes()).slice(-2);
    const datestr = year + "/" + month + "/" + day + " " + hour + ":" + min;
    return datestr;
  }
}
