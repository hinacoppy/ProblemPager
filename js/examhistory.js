//examhistory.js
//called from examhistory.html
"use strict";

function getTitle(row) {
  const titlelist = {
    E11:"バックギャモン検定 2011", E12:"バックギャモン検定 2012", E13:"バックギャモン検定 2013",
    E14:"バックギャモン検定 2014", E15:"バックギャモン検定 2015", E16:"バックギャモン検定 2016",
    E17:"バックギャモン検定 2017", E18:"バックギャモン検定 2018", E19:"バックギャモン検定 2019",
    E22:"バックギャモン検定 2022", E24:"バックギャモン検定 2024", E25:"バックギャモン検定 2025",
    ZP1:"Problem of Week 1", ZP2:"Problem of Week 2", ZP3:"Problem of Week 3", ZP4:"Problem of Week 4",
    ZP5:"Problem of Week 5", ZP6:"Problem of Week 6", ZP7:"Problem of Week 7",
    ZH1:"Human vs XG 1", ZH2:"Human vs XG 2", ZH3:"Human vs XG 3", ZH4:"Human vs XG 4", ZH5:"Human vs XG 5",
    ZM1:"Money Move 1",  ZM2:"Money Move 2",  ZM3:"Money Move 3",  ZM4:"Money Move 4",
    ZM5:"Money Move 5",  ZM6:"Money Move 6",  ZM7:"Money Move 7",  ZM8:"Money Move 8",
    ZM9:"Money Move 9",  ZMa:"Money Move 10", ZMb:"Money Move 11", ZMc:"Money Move 12",
    ZMd:"Money Move 13", ZMe:"Money Move 14", ZMf:"Money Move 15", ZMg:"Money Move 16",
    ZS1:"Backgammon Strategy 1", ZS2:"Backgammon Strategy 2", ZS3:"Backgammon Strategy 3", ZS4:"Backgammon Strategy 4",
    ZO1:"Opening Replies 1", ZO2:"Opening Replies 2", ZO3:"Opening Replies 3", ZO4:"Opening Replies 4",
    ZO5:"Opening Replies 5", ZO6:"Opening Replies 6", ZO7:"Opening Replies 7", ZO8:"Opening Replies 8",
    ZO9:"Opening Replies 9",
    ZD1:"Money Doubles 1",  ZD2:"Money Doubles 2",  ZD3:"Money Doubles 3",  ZD4:"Money Doubles 4",
    ZD5:"Money Doubles 5",  ZD6:"Money Doubles 6",  ZD7:"Money Doubles 7",  ZD8:"Money Doubles 8",
    ZD9:"Money Doubles 9",  ZDa:"Money Doubles 10", ZDb:"Money Doubles 11", ZDc:"Money Doubles 12",
    ZDd:"Money Doubles 13", ZDe:"Money Doubles 14", ZDf:"Money Doubles 15", ZDg:"Money Doubles 16",
    ZDh:"Money Doubles 17", ZDi:"Money Doubles 18", ZDj:"Money Doubles 19", ZDk:"Money Doubles 20",
    ZDl:"Money Doubles 21",
    HA1:"林プロブレム 1", HA2:"林プロブレム 2", HA3:"林プロブレム 3",
    HA4:"林プロブレム 4", HA5:"林プロブレム 5", HA6:"林プロブレム 6",
    KA1:"今日の成長 1", KA2:"今日の成長 2", KA3:"今日の成長 3", KA4:"今日の成長 4", KA5:"今日の成長 5",
    KA6:"今日の成長 6", KA7:"今日の成長 7", KA8:"今日の成長 8", KA9:"今日の成長 9",
    CB1:"ChrisBray 2014 1", CB2:"ChrisBray 2014 2", CB3:"ChrisBray 2014 3",
    CB4:"ChrisBray 2014 4", CB5:"ChrisBray 2014 5", CB6:"ChrisBray 2014 6",
    CB7:"ChrisBray 2015 1", CB8:"ChrisBray 2015 2", CB9:"ChrisBray 2015 3",
    CBa:"ChrisBray 2015 4", CBb:"ChrisBray 2015 5", CBc:"ChrisBray 2015 6",
    CBd:"ChrisBray 2016 1", CBe:"ChrisBray 2016 2", CBf:"ChrisBray 2016 3",
    CBg:"ChrisBray 2016 4", CBh:"ChrisBray 2016 5", CBi:"ChrisBray 2016 6",
    CBj:"ChrisBray 2017 1", CBk:"ChrisBray 2017 2", CBl:"ChrisBray 2017 3",
    CBm:"ChrisBray 2017 4", CBn:"ChrisBray 2017 5", CBo:"ChrisBray 2017 6",
    CBp:"ChrisBray 2018 1", CBq:"ChrisBray 2018 2", CBr:"ChrisBray 2018 3",
    CBs:"ChrisBray 2018 4", CBt:"ChrisBray 2018 5", CBu:"ChrisBray 2018 6",
    CBv:"ChrisBray 2019 1", CBw:"ChrisBray 2019 2", CBx:"ChrisBray 2019 3", CBy:"ChrisBray 2019 4", CBz:"ChrisBray 2019 5",
    CC1:"ChrisBray 2020 1", CC2:"ChrisBray 2020 2", CC3:"ChrisBray 2020 3", CC4:"ChrisBray 2020 4", CC5:"ChrisBray 2020 5",
    CC6:"ChrisBray 2021 1", CC7:"ChrisBray 2021 2", CC8:"ChrisBray 2021 3", CC9:"ChrisBray 2021 4", CCa:"ChrisBray 2021 5",
    CCb:"ChrisBray 2022 1", CCc:"ChrisBray 2022 2", CCd:"ChrisBray 2022 3", CCe:"ChrisBray 2022 4", CCf:"ChrisBray 2022 5",
    CCg:"ChrisBray 2023 1", CCh:"ChrisBray 2023 2", CCi:"ChrisBray 2023 3", CCj:"ChrisBray 2023 4", CCk:"ChrisBray 2023 5",
    CCl:"ChrisBray 2024 1", CCm:"ChrisBray 2024 2", CCn:"ChrisBray 2024 3", CCo:"ChrisBray 2025",
    QZ1:"Othello Quiz 2000 - 2004", QZ2:"Othello Quiz 2005 - 2009", QZ3:"Othello Quiz 2010 - 2014",
    QZ4:"Othello Quiz 2015 - 2019", QZ5:"Othello Quiz 2022 - 202x",
    QZ6:"Osaka Quiz 2014, 06 - 03", QZ7:"Sapporo Quiz 2010 - 2008", QZ8:"Sapporo Quiz 2007 - 2005",
    QZ9:"Nagoya Quiz 2004 - 2005", QZa:"peever Quiz 2005, 2013", QZb:"Osaka Quiz 2024 - 202x",
    TC1:"Timothy Chow",
    GP1:"Gammon Minami Aoyama 1", GP2:"Gammon Minami Aoyama 2", GP3:"Gammon Minami Aoyama 3",
    GP4:"Gammon Minami Aoyama 4", GP5:"Gammon Minami Aoyama 5",
    GP6:"Gammon Platform Square 1", GP7:"Gammon Platform Square 2", GP8:"Gammon Platform Square 3",
    GP9:"Gammon Platform Square 4",
    KE1:"バックギャモンのお勉強 1", KE2:"バックギャモンのお勉強 2", KE3:"バックギャモンのお勉強 3",
    KE4:"バックギャモンのお勉強 4", KE5:"バックギャモンのお勉強 5", KE6:"バックギャモンのお勉強 6",
    KE7:"バックギャモンのお勉強 7", KE8:"バックギャモンのお勉強 8", KE9:"バックギャモンのお勉強 9",
    KEa:"バックギャモンのお勉強 10",KEb:"バックギャモンのお勉強 11",KEc:"バックギャモンのお勉強 12",
    BR1:"501 1", BR2:"501 2", BR3:"501 3", BR4:"501 4", BR5:"501 5", BR6:"501 6",
    BR7:"501 7", BR8:"501 8", BR9:"501 9", BRa:"501 10", BRb:"501 11",
  };
  const categoryid = row.cells[1].data;
  return titlelist[categoryid] ? titlelist[categoryid] : categoryid;
}

function makeCheckbox(row) {
  const val = row.cells[0].data + "%" + row.cells[1].data;
  return "<input type='checkbox' name='check' value='" + val + "'>";
}

function getDataFromStorage() {
  const compare = (a, b) => { return (a.date < b.date) ? 1 : -1; } //実施日の降順に並べるためのソート関数

  let jsondata = JSON.parse(localStorage.getItem("exampager"));
  jsondata.sort(compare);
  return jsondata;
}

function setDataToStorage(exampager) {
  localStorage.setItem("exampager", JSON.stringify(exampager));
}

//Deleteボタンが押下されたときの処理
function actionDeleteButton() {
  let exampager = getDataFromStorage();
  let dirty = false;
  for (const elem of document.getElementsByName("check")) {
    if (elem.checked === true) {
      dirty = true;
      const [date, categoryid] = elem.value.split("%");
      exampager = exampager.filter( (d) => !(d.date == date && d.categoryid == categoryid) );
      //選択行を削除して(選択行以外のデータで)データを再作成
    }
  }

  if (dirty) { //checkが入っていてデータ編集が必要なら
    if (!confirm("削除してよろしいでしょうか？")) { return; }
    setDataToStorage(exampager); //ローカルストレージを更新して
    location.reload(); //ページを再表示(テーブルを最新データで再表示)
  }
}

function getGridJsSettingObject() {
  const settings = { //GridJS config
    data: getDataFromStorage(), //表示データ
    pagination: {limit: 10}, //ページネーション設定
    search: true, //検索フィールドあり
    sort: true, //ソートあり
    columns: [
      { name: "実施日",     id: "date" },
      { name: "番号",       id: "categoryid" },
      { name: "名称",       formatter: (_, row) => getTitle(row) },
      { name: "回答数",     id: "response" },
      { name: "正答数",     id: "correct" },
      { name: "エラー合計", id: "errorsum" },
      { name: "削除",       formatter: (_, row) => gridjs.html(makeCheckbox(row)), sort: false },
    ],
    style: {
      th: {
        "text-align": "center",
      },
      td: {
        "text-align": "center",
        "padding": "6px",
      },
    },
  };
  return settings;
}

function setEventListener() {
  const deletebtn = document.querySelector("#deletebtn");
  deletebtn.addEventListener("click", () => { actionDeleteButton(); });

  const closebtn = document.querySelector("#closebtn");
  closebtn.addEventListener("click", () => { window.close(); });
}

function showHistoryTable() {
  const table = new gridjs.Grid(getGridJsSettingObject());
  table.render(document.querySelector("#historylist"));
}

//main
setEventListener(); //イベントリスナー登録
showHistoryTable(); //テーブル表示

