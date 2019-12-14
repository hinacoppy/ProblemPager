// BgXgid_class.js
'use strict';

class Xgid {
  constructor(xgid) {
    if (xgid == null || xgid == "") {
      xgid = "XGID=--------------------------:0:0:0:00:0:0:0:0:0";
    }
    this._xgid = xgid;
    this._position = "--------------------------";
    this._cube = 0;
    this._cubepos = 0;
    this._turn = 0;
    this._dice = "00";
    this._dice_odr = "00";
    this._dice_ary = [0, 0, 0];
    this._sc_me = 0;
    this._sc_yu = 0;
    this._jb = 0;
    this._matchsc = 0;
    this._maxcube = 0;
    this._crawford = false;
    this._ptno = new Array(26);
    this._ptcol = new Array(26);
    this._pip = [0, 0];
    this._boff = [0, 0];
    this._dbloffer = false;

    this._parse_xgid(this._xgid); // XGIDを解析
    this._parse_position(this._position); // ボード状態を解析
  }

  // XGIDをパースし状態をローカル変数に格納
  _parse_xgid(xgidstr) {
    const xgidstr2 = xgidstr.substr("XGID=".length);
    const s = xgidstr2.split(":");

    if (s[4] == "D") { s[4] = "00"; this._dbloffer = true; }

    this._position= s[0];
    this._cube    = Number(s[1]);
    this._cubepos = Number(s[2]);
    this._turn    = Number(s[3]);
    this._set_dice(s[4]);
    this._sc_me   = Number(s[5]);
    this._sc_yu   = Number(s[6]);
    this._jb      = Number(s[7]);
    this._matchsc = Number(s[8]);
    this._maxcube = Number(s[9]);

    // クロフォード状態を確認
    this._crawford = (this._matchsc > 0 && this._jb != 0) ? true : false;
  }

  _set_dice(dicestr) {
    this._dice = dicestr;
    // dice_odrはダイスを昇順にして保持する
    const dice1 = dicestr.substr(0,1);
    const dice2 = dicestr.substr(1,1);
    if (dice1 > dice2) { this._dice_odr = dice2 + dice1; }
    this._dice_ary = [0, parseInt(dice1), parseInt(dice2)];
  }

  //ポジション情報をパースし状態をローカル変数に格納
  //ついでに、ピップ数とベアオフチェッカーを数えておく
  _parse_position(pt) {
    this._pip[0]  = this._pip[1]  = 0;
    this._boff[0] = this._boff[1] = 15;

    const posary = pt.split("");  // 一文字ずつに分解
    for (let i=0; i<=25; i++) {
      const asc = posary[i].charCodeAt(0);
      if (asc == "-".charCodeAt(0)) {
        this._ptno[i] = 0; this._ptcol[i] = 0;
      } else if (asc >= "a".charCodeAt(0) && asc <= "z".charCodeAt(0)) {
        this._ptno[i] = asc - "a".charCodeAt(0) + 1;
        this._ptcol[i] = -1;
        this._boff[1] -= this._ptno[i];
        this._pip[1] += this._ptno[i] * (25 - i); // ピップ数を計算
      } else if (asc >= "A".charCodeAt(0) && asc <= "Z".charCodeAt(0)) {
        this._ptno[i] = asc - "A".charCodeAt(0) + 1;
        this._ptcol[i] = 1;
        this._boff[0] -= this._ptno[i];
        this._pip[0] += this._ptno[i] * (i - 0); // ピップ数を計算
      }
    } // for
  }

  _makeXgidStr() {
    this._xgid = "XGID=" +
                 this._position + ":" +
                 this._cube + ":" +
                 this._cubepos + ":" +
                 this._turn + ":" +
                 (this._dbloffer ? "D" : this._dice) + ":" +
                 this._sc_me + ":" +
                 this._sc_yu + ":" +
                 ((this._matchsc > 0) ? (this._crawford ? 1 : 0) : this._jb) + ":" +
                 this._matchsc + ":" +
                 this._maxcube ;
  }

  // getter functions
  get_xgidstr()  { return this._xgid; }
  get_position() { return this._position; }
  get_cube()     { return this._cube; }
  get_cubepos()  { return this._cubepos; }
  get_turn()     { return this._turn; }
  get_dice(n)    {
    if (n == 1 || n == 2) { return this._dice_ary[n]; }
    else                  { return this._dice; }
  }
  get_dice_odr() { return this._dice_odr; }
  get_sc_me()    { return this._sc_me; }
  get_sc_yu()    { return this._sc_yu; }
  get_jb()       { return this._jb; }
  get_matchsc()  { return this._matchsc; }
  get_maxcube()  { return this._maxcube; }
  get_crawford() { return this._crawford; }
  get_ptno(p)    { return this._ptno[p]; }
  get_ptcol(p)   { return this._ptcol[p]; }
  get_pip(t)     { return (t == -1) ? this._pip[1] : (t == 1) ? this._pip[0] : 0; }
  get_boff(t)    { return (t == -1) ? this._boff[1] : (t == 1) ? this._boff[0] : 0; }
  get_dbloffer() { return this._dbloffer; }

  //setter method
  set position(x) { this._position = x; this._makeXgidStr(); }
  set cube(x)     { this._cube = x;     this._makeXgidStr(); }
  set cubepos(x)  { this._cubepos = x;  this._makeXgidStr(); }
  set turn(x)     { this._turn = x;     this._makeXgidStr(); }
  set dice(x)     { this._set_dice(x);  this._makeXgidStr(); }
  set sc_me(x)    { this._sc_me = x;    this._makeXgidStr(); }
  set sc_yu(x)    { this._sc_yu = x;    this._makeXgidStr(); }
  set jb(x)       { this._jb = x;       this._makeXgidStr(); }
  set matchsc(x)  { this._matchsc = x;  this._makeXgidStr(); }
  set maxcube(x)  { this._maxcube = x;  this._makeXgidStr(); }
  set crawford(x) { this._crawford = x; this._makeXgidStr(); }
  set dbloffer(x) { this._dbloffer = x; this._makeXgidStr(); }

  //getter method
  get xgidstr()  { return this._xgid; }
  get position() { return this._position; }
  get cube()     { return this._cube; }
  get cubepos()  { return this._cubepos; }
  get turn()     { return this._turn; }
  get dice()     { return this._dice; }
  get dice_odr() { return this._dice_odr; }
  get sc_me()    { return this._sc_me; }
  get sc_yu()    { return this._sc_yu; }
  get jb()       { return this._jb; }
  get matchsc()  { return this._matchsc; }
  get maxcube()  { return this._maxcube; }
  get crawford() { return this._crawford; } //boolean
  get dbloffer() { return this._dbloffer; } //boolean

  //public functions
  checkCrawford(winnerscr, delta, loserscr) {
    return ((winnerscr + delta == this._matchsc - 1) && (loserscr != this._matchsc - 1)) ? true : false;
  }

  _incdec(chr, delta, turn) {
    const stdchar = (turn == 1) ? "A" : "a";
    const charcd = stdchar.charCodeAt(0);
    const numbfr = (chr == "-") ? 0 : chr.charCodeAt(0) - charcd + 1;
    const numaft = numbfr + delta;
    return (numaft == 0) ? "-" : String.fromCharCode(numaft + charcd - 1);
  }

  moveChequer(pos, mov, turn) {
    let frto, fr, to, fpt, tpt, bar;
    const move = BgUtil.reformMoveStr(pos, mov, turn); // apply for Dubrovnik_SJP.txt format
    const oppo = (-1) * turn;
    let posary = pos.split("");
    for (let mv of BgUtil.cleanupMoveStr(move)) {
      frto = mv.split("/");
      fr = parseInt(frto[0]); fpt = (turn == 1) ? fr : 25 - fr;
      to = parseInt(frto[1]); tpt = (turn == 1) ? to : 25 - to; bar = (turn == 1) ? 0 : 25;
      if (isNaN(fr)) { break; }
      if (fr > to) { //normal move
        posary[fpt] = this._incdec(posary[fpt], -1, turn);
        if (to != 0) {
          posary[tpt] = this._incdec(posary[tpt], +1, turn);
        }
      } else { //hit move (to the bar)
        posary[fpt] = this._incdec(posary[fpt], -1, oppo);
        posary[bar] = this._incdec(posary[bar], +1, oppo);
      }
    }
    return posary.join("");
  }

} //class Xgid
