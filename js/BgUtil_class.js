// BgUtil_class.js
'use strict';

class BgUtil {
  //constructor() {} // no constructor

  //static utility methods
  static swap(arr, a, b) {
    let t = arr[a]; arr[a] = arr[b]; arr[b] = t;
  }

  static calcCubeVal(val) {
    return  Math.pow(2, val);
  }

  static calcCubeDisp(val, crawford) {
    if (crawford) { return "Cr"; }
    const out = this.calcCubeVal(val);
    return (out <= 1) ? 64 : out;
  }

  static calcCubeValRev(val) {
    return Math.floor(Math.log2(val));
  }

  static cvtTurnXg2Bd(t) { //cvt Xgid turn to Board turn
    const hash = { "0":0, "1":1, "-1":2 };
    return hash[t];
  }

  static cvtTurnBd2Xg(t) { //cvt Board turn to Xgid turn
    const hash = { "0":0, "1":1, "2":-1 };
    return hash[t];
  }

  static cvtTurnGm2Bd(t) { //cvt Game turn to Board turn
    return (t) ? 1 : 2;
  }

  static cvtTurnBd2Gm(t) { //cvt Board turn to Game turn
    const hash = { "0":null, "1":true, "2":false };
    return hash[t];
  }

  static cvtTurnGm2Xg(t) { //cvt Game turn to Xgid turn
    return (t) ? 1 : -1;
  }

  static cvtTurnXg2Gm(t) { //cvt Xgid turn to Game turn
    const hash = { "0":null, "1":true, "-1":false };
    return hash[t];
  }

  static getBdOppo(t) { //get Oponent turn number (BoardObj)
    const hash = { "0":0, "1":2, "2":1 };
    return hash[t];
  }

  static getXgOppo(t) { //get Oponent turn number (XgidObj)
    const hash = { "0":0, "1":-1, "-1":1 };
    return hash[t];
  }

  static getGmOppo(t) { //get Oponent turn number (GameObj)
    // true -> false, false -> true
    return !t;
  }

  //UserAgentを確認し、iOSか否かを判断する
  static isIOS() {
    const ua = window.navigator.userAgent.toLowerCase();
    return (ua.indexOf('iphone') !== -1 || ua.indexOf('ipod') !== -1 || ua.indexOf('ipad') !== -1);
  }

  static findLine(ary, str) {
    let idx = 0;
    for (let n of ary) {
      if (n.indexOf(str) >= 0) { return idx; }
      idx++;
    }
    return -1;
  }

  static insertStr(str, idx, ins) {
    return str.slice(0, idx) + ins + str.slice(idx);
  }

  static replaceStr(str, idx, rpl) {
    return str.slice(0, idx) + rpl + str.slice(idx + rpl.length);
  }

  static isContain(str, tgt) {
    if (tgt === "") { return (str.trim() === ""); }
    if (str === "") { return false; }
    return (str.indexOf(tgt) >= 0);
  }

  // Convert "x/y(2)" to [x/y],[x/y], if hitted "x/y*(2)" to [x/y*],[x/y]
  static cvtMoveMultiple(xs) {
    const res = xs.match(/(.+)\((\d)\)/);
    let ary = [];
    if (res !== null) {
      let p = res[1];
      for (let k = 0; k < parseInt(res[2]); k++) {
        if (k > 0) { p = p.replace("*", ""); } //2個目以降ではヒットできない
        ary.push(p);
      }
    }
    return ary;
  }

  // Convert "24/18*/16*/12" to [24/18*],[18/16*],[16/12]
  static cvtMoveHopping(xs) {
    const res = xs.split("/");
    let ary = [];
    for (let i = 0; i < res.length -1; i++) {
      if ( res[i+1] != null ) {
        let p = res[i].replace("*", "") + "/" + res[i+1]; //delete * on start pt
        ary.push(p);
      }
    }
    return ary;
  }

  // Convert "24/18*" to [18/25],[24/18] (move hitted chequer previously)
  static cvtMoveHitted(xs) {
    const res = xs.split("/");
    const p = res[1].replace("*", "");
    let ary = [];
    ary.push(p + "/25");
    ary.push(res[0] + "/" + p);
    return ary;
  }

  //check leap move or not
  static isLeaped(xs, xgidstr) {
    const xgid = new Xgid(xgidstr);
    const res = xs.split("/");
    const p = parseInt(res[0]) - parseInt(res[1]);
    return !(res[1] == 0 || p <= 0 || isNaN(p) || [xgid.get_dice(1), xgid.get_dice(2)].includes(p));
  }

  //convert leap move to step move
  //ex. dice=64, [24/14] to [24/18][18/14] or [24/20][20/14] if 18pt was blocked
  static cvtLeapMove(xs, xgidstr) {
    const xgid = new Xgid(xgidstr);
    const res = xs.split("/");
    let dice = [xgid.get_dice(1), xgid.get_dice(2)]
    if (xgid.isBlocked(res[0] - dice[0])) {
      this.swap(dice, 0, 1);
    }
    if (xgid.get_dice(1) == xgid.get_dice(2)) {
      dice.push( xgid.get_dice(1) );
      dice.push( xgid.get_dice(1) );
    }

    let ary = [];
    let fr = parseInt(res[0]);
    let toend = parseInt(res[1]);
    for (let d of dice) {
      let to = fr - d;
      let movestr = fr + "/" + to;
      if (to == toend && res[1].match(/\*/)) { movestr += "*"; }
      ary.push(movestr);
      if (to <= toend) { break; }
      fr = to;
    }
    return ary;
  }

  static cleanupMoveStr(movestr, xgid) {
    // This function takes a move string (e.g. "24/18 18/8") and converts special GNU and other
    // constructs to plain moves, e.g.:
    // "6/off" to "6/0"
    // "bar/23" to "25/23"
    // "24/22(2)" to "24/22 24/22"
    // "24/22*/18" to "24/22* 22/18" -> "22/25 24/22 22/18" (hitted)

    // append hit mark when without * hitting
    const str = this.appendHitMark(movestr, xgid);

    // strip leading and trailing spaces
    // and reduce multiple embedded spaces to single space, e.g. "6/1      5/4" to "6/1 5/4"
    let strary = str.replace(/off/gi, "0").replace(/bar/gi, "25").trim().replace(/\s+/, " ").split(" ");

    //pass1 Normalization multiple moves and hopping moves
    let xsout = [];
    for (let xs of strary) {
      if (xs.match(/(.+)\((\d)\)/)) {
        xsout = xsout.concat(this.cvtMoveMultiple(xs)); // convert "x/y(2)" format to "x/y","x/y"
      } else if (xs.match(/(.+)\/(.+)\/(.+)\/?(.*)/)) {
        xsout = xsout.concat(this.cvtMoveHopping(xs)); // convert "x/y/z" format to "x/y","y/z"
      } else {
        xsout.push(xs);
      }
    }

    //pass2 convert leap move to step move
    //eg. dice=33, [10/4][8/5][8/5] to [10/7][7/4][8/5][8/5]
    //eg. dice=64, [24/14] to [24/18][18/14] or [24/20][20/14] if 18pt was blocked
    let xsout2 = [];
    for (let xs of xsout) {
      if (this.isLeaped(xs, xgid)) {
        xsout2 = xsout2.concat(this.cvtLeapMove(xs, xgid));
      } else {
        xsout2.push(xs);
      }
    }

    //pass3 Hitting move conversion.  eg. [24/18*] to [18/25],[24/18]
    let xsout3 = [];
    for (let xs of xsout2) {
      if (xs.match(/\*/)) {
        xsout3 = xsout3.concat(this.cvtMoveHitted(xs));
      } else {
        xsout3.push(xs);
      }
    }

    //pass4 Do BearIn before BearOff  eg. [2/0][7/6] to [7/6][2/0]
    xsout3.sort((a, b) => {
      let a_fr = a.split("/")[0];
      let b_to = b.split("/")[1];
      return (b_to == 0 && a_fr > 6) ? -1 : 0;
    });

    return xsout3;
  }

  static appendHitMark(move, xgidstr) {
    //ex.
    //pos = ----bAE-C---cE-b-c-e----A-
    //move= 21/20 20/14 (roll 61)
    //turn= -1
    //then return(move) 21/20* 20/14

    if (BgUtil.isContain(move, "*")) { return move; } // do nothing when hitting with *

    const xgid = new Xgid(xgidstr);
    const turn = xgid.turn;
    let posary = xgid.position.split("");
    let retmovestr = "";
    const moveary = move.trim().replace(/\s+/, " ").split(" ");
    for (let mov of moveary) {
      const to =  mov.split("/")[1];
      const pt = (turn == 1) ? to : 25 - to;
      retmovestr += " " + mov;
      if (to != 0 && ((posary[pt] == 'a' && turn == 1) || (posary[pt] == 'A' && turn == -1))) {
         retmovestr += "*";
         posary[pt] = "-";
      }
    }
    return retmovestr;
  }

  static makeMoveStr(ary, n) {
    if (!BgUtil.isContain(ary[n], "/")) {
      return ary[n];
    }

    let wkary = Array.from(ary); //deep copy
    let idxary = new Array(ary.length); //size only copy
    let count = 0;
    for (let i = 0; i < ary.length; i++) {
      idxary[i] = count;
      const aa = wkary[i].split("/");
      const bb = (i < ary.length - 1) ? wkary[i+1].split("/") : [0,0];
      if (ary[i].match(/\/25/)) {
        wkary[i+1] += '*'; //[10/25][12/10] -> [12/10*]
        delete wkary[i]; //and mark to delete [10/25]
      } else if (aa[1] == bb[0]) {
        wkary[i+1] = aa[0] + "/" + bb[1]; //[24/20][20/15] -> [24/15]
        delete wkary[i]; //and mark to delete [24/20]
      } else {
        count += 1;
      }
    }
    const reduced = wkary.filter(n => n !== void 0); //remove delete_marked items

    let htm = "", out;
    for (let i = 0; i < reduced.length; i++) {
      out = reduced[i].replace("/0", "/Off").replace("25/", "Bar/");
      if (i == idxary[n]) {
        htm += "<font color='blue'>" + out + "</font>&emsp;";
      } else {
        htm += out + "&emsp;";
      }
    }
    return htm;
  }

  static sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

} //class BgUtil
