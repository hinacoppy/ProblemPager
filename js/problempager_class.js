// problempager_class.js
// include from problempager html (ProblemPager/[C]/{CAT}/{NUM}.html)
'use strict';

class ProblemPager {
  constructor(userVars, problemmode = "quiz") {
    const vars = this.setDefault(userVars);
    this.problemmode = problemmode;
    this.categoryid = vars.categoryid;
    this.probnum = vars.probnum;
    this.showpipflg = vars.showpipflg;

    this.examscore = new ExamScore(this.categoryid);

    if (vars.xgmodeflg) {
      const xgboard = new XgFontBoard(vars.xgid, vars.rotation, vars.chequercolor);
      const board = xgboard.get_xgfontboard();
      $(vars.boardid).text(board);
    } else {
      this.board = new BgBoard(vars.boardid, vars.style, vars.rotation);
      this.board.showBoard(vars.xgid);
    }

    if (this.problemmode == "quiz" || this.problemmode == "keeae" ) {
      this.deschtml = $(".description").html();
    } else {
      this.deschtml = $("#gnuanalysis").text();
    }

    this.cubeactionflg = this.is_cubeaction(this.deschtml);
    this.iframemodeflg = (window != window.parent); //iframeで呼ばれているときはtrue

    this.init();
    this.load("navpopup", "../../navpopup.html", ".navpopup"); //navを挿し込む
    this.setEventHandler();
  }

  setDefault(userVars) {
    const defaultVars = {
      problemmode: "quiz",
      categoryid: "ZZ1",
      probnum: "01",
      showpipflg: true,
      boardid: "#board",
      style: "boardStyle1",
      rotation: "cw",
      xgid: "XGID=--------------------------:0:0:0:00:0:0:0:0:10",
      xgmodeflg: false,
      chequercolor: "wb",
    };
    const vars = Object.assign({}, defaultVars, userVars);
    return vars;
  }

  load(id, url, param="body") {
    //idのところにurlのコンテンツのparamの部分を挿入する。
    fetch(url)
      .then(response => response.text())
      .then(data => {
        const parser = new DOMParser();
        const html = parser.parseFromString(data, "text/html");
        const elem = html.querySelector(param);
        const insertTo = document.getElementById(id);
        if (insertTo !== null) {
          insertTo.appendChild(elem);
        }
      });
  }

  init() {
    //回答、解説を最初は非表示にする
    $('.description').hide();
    $('.gnuanalysis').hide();
    $('.answerscore').hide();
    $('.pipinfo').toggle(this.showpipflg);
    $('.navpopup').hide();

    if (this.problemmode != "exam") {
      $('.answertable').html(this.make_answerlist(this.deschtml)); //答リストを作成し表示
    }

    $("#scr").text(this.examscore.getScoreStr()); //localStorageからPRを取り出して表示
  }

  setEventHandler() {
    //次の問題を表示
    $('#selectnext').on('click', () => {
        this.move_page(this.probnum, +1);
    });

    //前の問題を表示
    $('#selectprev').on('click', () => {
        this.move_page(this.probnum, -1);
    });

    //[Description]ボタンか、ボードのクリックで、回答、解説の表示/非表示を切替え
    $('#answer, #board').on('click', () => {
      $('.navpopup').hide();
      if (this.iframemodeflg) { return; } //iframeで呼ばれているときは何もしない
      this.description("toggle");
    });

    //[navmenu]ボタンで、ナビゲーションボタンを表示/非表示を切替え
    $('#navmenu').on('click', () => {
      $('.navpopup').toggle();
    });

    //問題番号を選択
    $("#navpopup").on("click", "#toctable td", (e) => {
      $('.navpopup').hide();
      const probnum = $(e.target).text();
      this.move_page(probnum, 0);
    });

    //[Home]ボタンで、メニューに遷移
    $("#navpopup").on('click', '#return2menu', () => {
      window.location.href = "../../index.html";
    });

    //[ResetSCR]ボタンで、スコアをリセット
    $("#navpopup").on('click', '#resetscr', () => {
      if (confirm("Reset score, OK?")) {
        this.examscore.resetScore();
        $("#scr").text(this.examscore.getScoreStr());
      }
      $('.navpopup').hide();
    });

    //[showanswer]ボタンか、ボードのクリックで、回答、解説を表示
    $('#navpopup').on('click', '#showanswer', () => {
      this.description("toggle");
    });

    //画面の大きさが変わったときはボードを再描画
    $(window).on('resize', () => {
      this.board.redraw();
    });
  }

  move_page(probnum, delta) {
    const nextpage = Number(probnum) + delta;
    if (nextpage <= 0 || nextpage > 50) { return; } //範囲を超えて移動できない
    const pn = ("00" + String(nextpage)).slice(-2);
    window.location.href = "./" + pn + ".html";
  }

  description(action) {
    const descout = this.mark_choiced(this.deschtml);
    switch(this.problemmode) {
    case "quiz":
    case "keeae":
      $(".description").html(descout);
      break;
    case "gnubg":
      $("#gnuanalysis").text(descout);
      break;
    }

    const [errscore, choicedflg] = this.get_errscore();
    if (choicedflg && !this.iframemodeflg) { //iframeで呼ばれているときはここでスコアを計算しない
      this.examscore.calc_next_score(errscore);
      $("#scr").text(this.examscore.getScoreStr());
    }

    switch (action) {
    case "show":
      $('.description').show();
      $('.gnuanalysis').show();
      if (this.problemmode != "exam") {
        //$('.answertable').hide();
      }
      $('.answerscore').show();
      $('.pipinfo').show();
      break;
    case "hide":
      $('.description').hide();
      $('.gnuanalysis').hide();
      $('.answertable').show();
      $('.answerscore').hide();
      $('.pipinfo').toggle(this.showpipflg);
      break;
    case "toggle":
      $('.description').toggle();
      $('.gnuanalysis').toggle();
      if (this.problemmode != "exam") {
        //$('.answertable').toggle();
      }
      $('.answerscore').toggle();
      if (!this.showpipflg) { $('.pipinfo').toggle(); }
      break;
    }
  }

  is_cubeaction(deschtml) {
    return (deschtml.match(/cube action/i) !== null);
  }

  mark_choiced(deschtml) {
    switch(this.problemmode) {
    case "quiz":
      return this.mark_choiced_quiz(deschtml);
      break;
    case "keeae":
      return this.mark_choiced_keeae(deschtml);
      break;
    case "gnubg":
      return this.mark_choiced_gnubg(deschtml);
      break;
    }
  }

  mark_choiced_quiz(deschtml) {
    const ansval = $('[name=uchoice]:checked').val();
    const [choice, eqstr] = (ansval !== undefined) ? ansval.split("#") : [null, "0"];
    let descout = "";
    let srchflg = false;
    for (const line of deschtml.split("\n")) {
      if (line.indexOf("<pre>")  !== -1) { srchflg = true; } //マークするのは<pre>内のみ
      if (line.indexOf("</pre>") !== -1) { srchflg = false; }
      const choiceflg = (line.indexOf(choice) !== -1);
      descout += line + ((choiceflg && srchflg) ? "★" : "") + "\n";
    }
    return descout;
  }

  mark_choiced_gnubg(deschtml) {
    const ansval = $('[name=uchoice]:checked').val();
    const [choice, eqstr] = (ansval !== undefined) ? ansval.split("#") : [null, "0"];
    let descout = "";
    let srchflg = true;
    for (const line of deschtml.split("\n")) {
      const choiceflg = (line.indexOf(choice) !== -1);
      descout += line + ((choiceflg && srchflg) ? "★" : "") + "\n"; //最初に見つけた行だけにマーク
      if (choiceflg) { srchflg = false; }
    }
    return descout;
  }

  mark_choiced_keeae(deschtml) {
    const ansval = $('[name=uchoice]:checked').val();
    const [choice, eqstr] = (ansval !== undefined) ? ansval.split("#") : [null, "0"];
    let descout = "";
    let srchflg = true;
    const regex = new RegExp(eqstr, "i");
    for (const line of deschtml.split("\n")) {
      if (line.indexOf("<pre>   +24-23-22-21-20-19-") !== -1) { //解説に複数ポジションがある場合は、最初の解析結果のみにマーク
        srchflg = false;
      }
      if (line.indexOf(choice) !== -1 && line.match(regex) != null && srchflg) {
        const line2 = line.slice(0, -1 * "<br>".length); //delete <br>
        descout += line2 + "★" + "<br>\n"; //insert ★ before <br>
      } else {
        descout += line + "\n";
      }
    }
    return descout;
  }

  get_errscore() {
    const ansval = $('[name=uchoice]:checked').val();
    const choicedflg = (ansval !== undefined);
    const [choice, eqstr] = (choicedflg) ? ansval.split("#") : [null, "0"];
    const eq = Number(eqstr);
    return [eq, choicedflg];
  }

  get_eq(eqstr) {
    let eq = 0;
    const scstr = eqstr.match(/\((.+?)\)/); //ex. (-0.123) -> -0.123
    if (scstr != null){ //キューブアクションで最善手でない or チェッカーアクションのとき
      eq = parseFloat(scstr[1]); //"-0.123" -> -0.123
      if (Number.isNaN(eq)) { eq = 0; } //チェッカーアクションで最善手のとき (ex. G:10.97% B:0.42%)
    }
    eq = Math.trunc(Math.abs(eq) * 1000); //eqを千倍して整数化
    return eq;
  }

  make_answerlist(deschtml) {
console.log("make_answerlist", this.problemmode);
console.log("make_answerlist", deschtml);
    switch(this.problemmode) {
    case "quiz":
      return this.make_answerlist_quiz(deschtml);
      break;
    case "gnubg":
      return this.make_answerlist_gnubg(deschtml);
      break;
    case "keeae":
      return this.make_answerlist_keeae(deschtml);
      break;
    }
  }

  make_answerlist_quiz(deschtml) {
    let answers = [];
    const regex = this.cubeactionflg ? new RegExp(" +(.+?:) +(.*)", "i")
                                     : new RegExp(".*\\d\\. +(.+?) +eq(.*)", "i");

    for (const line of deschtml.split("\n")) {
      const matchary = line.match(regex); //\1=action, \2=equity
      if (matchary != null) {
        const action = matchary[1].trim();
        const eq = this.get_eq(matchary[2]);
        const ansval = action + "#" + eq;
        answers.push(ansval);
      }
    }
    answers = this.sort_answerlist(answers);

    let answerlist = "";
    for (const ansval of answers) {
      const [anstxt, eq] = ansval.split("#");
      const anstext = this.cubeactionflg ? anstxt.slice(0, -1) : anstxt; // delte ":" when cubeaction
      answerlist += '<label><input type="radio" name="uchoice" value="' + ansval + '"> ' + anstext + '</label><br>';
    }
    answerlist += '<br><button id="answer">Answer</button>';
    return answerlist;
  }

  make_answerlist_gnubg(deschtml) {
    let answers = [];
    const regex = this.cubeactionflg ? new RegExp("\\d\\. +(.+?)  +(.*)", "i")
                                     : new RegExp(".*\\d\\..*?  +(.+?)  +eq(.*)", "i"); //スペース2個で区切る

    for (const line of deschtml.split("\n")) {
      const matchary = line.match(regex); //\1=action, \2=equity
      if (matchary != null) {
        const action = matchary[1].trim();
        const eq = this.get_eq(matchary[2]);
        const ansval = action + "#" + eq;
        answers.push(ansval);
      }
    }
    answers = this.sort_answerlist(answers);

    let answerlist = "";
    for (const ansval of answers) {
      const [anstext, eq] = ansval.split("#");
      answerlist += '<label><input type="radio" name="uchoice" value="' + ansval + '"> ' + anstext + '</label><br>';
    }
    answerlist += '<br><button id="answer">Answer</button>';
    return answerlist;
  }

  make_answerlist_keeae(deschtml) {
    let answers = [];
    const regex = this.cubeactionflg ? new RegExp("\\d\\. +(.+?)  +(.*)", "i") //keeaeにはキューブアクションはないため、適当
                                : new RegExp(".*\\d\\. +(.+?) +eq(.*)", "i");

    for (const line of deschtml.split("\n")) {
      if (line.indexOf("<pre>   +24-23-22-21-20-19-") !== -1) { //解説に複数ポジションがある場合は、最初の解析結果のみを使う
        break;
      }
      const matchary = line.match(regex); //\1=action, \2=equity
      if (matchary != null) {
        const action = matchary[1].trim();
        const eq = this.get_eq(matchary[2]);
        const ansval = action + "#" + eq;
        answers.push(ansval);
      }
    }
    answers = this.sort_answerlist(answers);

    let answerlist = "";
    for (const ansval of answers) {
      const [anstext, eq] = ansval.split("#");
      answerlist += '<label><input type="radio" name="uchoice" value="' + ansval + '"> ' + anstext + '</label><br>';
    }
    answerlist += '<br><button id="answer">Answer</button>';
    return answerlist;
  }

  //回答選択肢を文字列ソートして並べる
  sort_answerlist(answers) {
    if (this.cubeactionflg) {
      return this.sort_answerlist_cube(answers);
    } else {
      return this.sort_answerlist_checker(answers);
    }
  }

  sort_answerlist_cube(answers) {
    const choices_gnubg = ["No double","Double, take","Double, pass","Too good to double, pass"];
    const choices_quiz  = ["No double:", "Double/Take:", "Double/Beaver:", "Double/Pass:",
                           "No redouble:", "Redouble/Take:", "Redouble/Beaver:", "Redouble/Pass:"];
    const choices = this.problemmode == "quiz" ? choices_quiz
                  : this.problemmode == "gnubg" ? choices_gnubg
                  : this.problemmode == "keeae" ? choices_gnubg
                  : choices_gnubg; //default

    let answersout = [];
    for (const choice of choices) {
      for (const ans of answers) {
        const [action, eq] = ans.split("#");
        if (choice == action) {
          answersout.push(ans);
        }
      }
    }
    return answersout;
  }

  sort_answerlist_checker(answers) {
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
}
