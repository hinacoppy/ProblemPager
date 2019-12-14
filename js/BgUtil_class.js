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

  static cvtTurnXg2kv(t) { //cvt XGID's turn to ThisApp's turn
    const hash = { "0":0, "1":2, "-1":1 };
    return hash[t];
  }

  static cvtTurnKv2xg(t) { //cvt ThisApp's turn to XGID's turn
    const hash = { "0":0, "1":-1, "2":1 };
    return hash[t];
  }

  static getOppo(t) { //get Oponent turn number
    const hash = { "0":0, "1":2, "2":1 };
    return hash[t];
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
        if (k > 0) { p = p.replace("*", ""); } //2å¬ñ⁄à»ç~Ç≈ÇÕÉqÉbÉgÇ≈Ç´Ç»Ç¢
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

  static cleanupMoveStr(str) {
    // This function takes a move string (e.g. "24/18 18/8") and converts special GNU and other
    // constructs to plain moves, e.g.:
    // "6/off" to "6/0"
    // "bar/23" to "25/23"
    // "24/22(2)" to "24/22 24/22"
    // "24/22*/18" to "24/22* 22/18" -> "22/25 24/22 22/18" (hitted)

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

    //pass2 Hitting move conversion.  eg. [24/18*] to [18/25],[24/18]
    let xsout2 = [];
    for (let xs of xsout) {
      if (xs.match(/\*/)) {
        xsout2 = xsout2.concat(this.cvtMoveHitted(xs));
      } else {
        xsout2.push(xs);
      }
    }
//console.log("cleanupMoveStr-xsout2", xsout2);
    return xsout2;
  }

  static reformMoveStr(pos, move, turn) {
    return move;  // fix me
// Mochy : 1                       Peter Raugust : 0
//  1) 52: 24/22 13/8              63: 24/18 6/3
//  2) 61: 25/24 13/7              62: 25/23 24/18
//to
//  1) 52: 24/22 13/8              63: 24/18 6/3*
//  2) 61: 25/24 13/7*             62: 25/23 24/18
  }

  static makeMoveStr(ary, n) {
    if (!BgUtil.isContain(ary[n], "/")) {
      return ary[n];
    }
    let reduced = [], idxary = [];
    for (let i = 0; i < ary.length; i++) {
      if (ary[i].match(/\/25/)) {
        idxary[i] = idxary[i+1] = reduced.length;
        reduced.push(ary[i+1] + "*"); // if hitted then reduce the 'ary'
        i++;
      } else {
        idxary[i] = reduced.length;
        reduced.push(ary[i]);
      }
    }
//console.log("makeMoveStr", reduced, idxary);
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
