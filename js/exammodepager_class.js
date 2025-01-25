// exammodepager_class.js
// 問題回答と解説を別にした試験モードページャー
'use strict';

class ExamModePager {
  constructor() {
    this.categoryid;
    this.probnum;
    this.exammode = true;
    this.parseQuery(); //this.categoryid, this.probnum を設定

    this.examscore = new ExamScore(this.categoryid);

    this.init();
    this.setEventHandler();
    this.draw_iframe(this.categoryid, this.probnum);
  }

  init() {
    $('.navpopup').hide();
  }

  parseQuery() {
    //クエリから問題情報を取り出す
    const query = $(location).attr("search"); //ex. ?c=QZ1#31 --> ?c=QZ1
    const hash = $(location).attr("hash"); //ex. ?c=QZ1#31 --> #31
    this.categoryid = query ? query.slice(3, 6) : "E22";
    this.probnum = hash ? hash.slice(1, 4) : "01";
  }

  setEventHandler() {
    //次の問題を表示
    $('#selectnext').on('click', () => {
      this.setStorageExam(this.categoryid, this.probnum); //次の問題に進むタイミングでスコアを登録・計算
      this.move_page(this.probnum, +1);
    });

    //前の問題を表示
    $('#selectprev').on('click', () => {
      this.setStorageExam(this.categoryid, this.probnum);
      this.move_page(this.probnum, -1);
    });

    //[navmenu]ボタンで、ナビゲーションボタンを表示/非表示を切替え
    $('#navmenu').on('click', () => {
      $('.navpopup').toggle();
    });

    //問題番号を選択
    $("#toctable td").on("click", (e) => {
      const probnum = $(e.target).text();
      this.move_page(probnum, 0);
      $('.navpopup').hide();
    });

    //[Home]ボタンで、メニューに遷移
    $("#return2menu").on('click', () => {
      window.location.href = "index.html";
    });

    //モードの変更
    $("[name=mode]").on("change", (e) => {
      this.exammode = ($('[name=mode]:checked').val() == "Exam");
      $("#iframe").contents().find('#showanswer').click(); //showanswerボタンを押下し解説を表示
      $("#iframe").contents().find("#scr").text(this.examscore.getScoreStr()).toggle(!this.exammode); //exammodeの時は非表示
    });
  }

  move_page(probnm, delta) {
    const nextpage = Number(probnm) + delta;
    if (nextpage <= 0 || nextpage > 50) { return; }
    this.probnum = ("00" + String(nextpage)).slice(-2);
    this.draw_iframe(this.categoryid, this.probnum);
  }

  draw_iframe(categoryid, probnum) {
    const pphtml = "./" + categoryid.slice(0, 1) + "/" + categoryid + "/" + probnum + ".html";
    const iframe = document.getElementById('iframe');
    iframe.src = pphtml; //iframeにHTMLファイルを読み込む
    iframe.onload = () => {
      $("#iframe").contents().find("button").hide(); //子画面のボタンを非表示
      $("#iframe").contents().find("#scr").toggle(!this.exammode); //exammodeの時は非表示
      this.check_selectedanswer();
      if (!this.exammode) {
        setTimeout(() => {
          $("#iframe").contents().find('#showanswer').click();
        }, 300); //確実にクリックさせるため、300msの待ちを入れる
      }
    };
  }

  check_selectedanswer() {
    const [answerstr, score] = this.getStorageExam(this.categoryid, this.probnum);
    const ansval = answerstr + "#" + score;
    $("#iframe").contents().find('[name=uchoice]').val([ansval]);
  }

  get_answerstr() {
    const checkedval = $("#iframe").contents().find('[name=uchoice]:checked').val();
    return checkedval;
  }

  getStorageExam(categoryid, probnm) {
    const today = this.get_today();
    const exampager = JSON.parse(localStorage.getItem("exammodepager")) || [];
    const findobj = exampager.find(elem =>  (elem.categoryid === categoryid && elem.date === today));

    if (findobj === undefined || findobj.answerlist === undefined) { return [null, null]; }

    const findans = findobj.answerlist.find(elem => (elem.probnum === probnm));
    if (findans === undefined) { return [null, null]; }

    const answerstr = findans.answerstr;
    const score = findans.score;
    return [answerstr, score];
  }

  setStorageExam(categoryid, probnm) {
    const today = this.get_today();
    //ローカルストレージから試験データを取出し
    const exampager0 = JSON.parse(localStorage.getItem("exammodepager")) || [];
    //以前の試験データを削除
    const exampager = exampager0.filter(elem => !(elem.categoryid === categoryid && elem.date !== today));

    //新規か更新か
    const idx = exampager.findIndex(elem => (elem.categoryid === categoryid && elem.date === today));
    const newobj = (idx !== -1) ? exampager[idx] : { "categoryid":categoryid, "date":today, "answerlist":[] };

    const ansidx = newobj.answerlist.findIndex(elem => (elem.probnum === probnm));

    const answerstr = this.get_answerstr();
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

    localStorage.setItem("exammodepager", JSON.stringify(exampager)); //ローカルストレージのexammodepagerに書込み
    this.set_examscore(); //ローカルストレージのexampagerに登録
  }

  set_examscore() {
    const today = this.get_today();
    const exampager = JSON.parse(localStorage.getItem("exammodepager")) || [];
    const findobj = exampager.find(elem =>  (elem.categoryid === this.categoryid && elem.date === today));

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
    this.examscore.setStorage(response, correct, errorsum); //exampagerに登録
  }

  get_today() {
    const date = new Date();
    const year = date.getFullYear();
    const month = ("00" + (date.getMonth() + 1)).slice(-2);
    const day = ("00" + date.getDate()).slice(-2);
    const hours = ("00" + date.getHours()).slice(-2);
    const min = ("00" + date.getMinutes()).slice(-2);
    const datestr = year + "/" + month + "/" + day;
    return datestr;
  }

}
