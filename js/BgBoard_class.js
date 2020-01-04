// BgBoard_class.js
'use strict';

class BgBoard {
  constructor() {
    this.xgidstr = "XGID=--------------------------:0:0:0:00:0:0:0:0:0";
    this.horizOrientation = "R"; // L or R
    this.mainBoard = $('#mainboard'); //need to define before prepareBoard()
    this.bgBoardConfig();
    this.prepareSvgDice();
  } //end of constructor()

  prepareSvgDice() {
    this.svgDice = [];
    this.svgDice[0]  = '';
    this.svgDice[1]  = '<svg class="dice-one" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[1] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[1] += '<circle cx="90" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[1] += '</svg>';
    this.svgDice[2]  = '<svg class="dice-two" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[2] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[2] += '<circle cx="48" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[2] += '<circle cx="132" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[2] += '</svg>';
    this.svgDice[3]  = '<svg class="dice-three" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[3] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[3] += '<circle cx="48" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[3] += '<circle cx="90" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[3] += '<circle cx="132" cy="48" r="8" stroke-width="18" />';
    this.svgDice[3] += '</svg>';
    this.svgDice[4]  = '<svg class="dice-four" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[4] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[4] += '<circle cx="48" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[4] += '<circle cx="48" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[4] += '<circle cx="132" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[4] += '<circle cx="132" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[4] += '</svg>';
    this.svgDice[5]  = '<svg class="dice-five" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[5] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[5] += '<circle cx="48" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[5] += '<circle cx="48" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[5] += '<circle cx="90" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[5] += '<circle cx="132" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[5] += '<circle cx="132" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[5] += '</svg>';
    this.svgDice[6]  = '<svg class="dice-six" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">';
    this.svgDice[6] += '<rect x="7" y="7" rx="30" width="166" height="166" stroke-width="1"/>';
    this.svgDice[6] += '<circle cx="48" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="48" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="48" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="132" cy="48" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="132" cy="90" r="8" stroke-width="18"/>';
    this.svgDice[6] += '<circle cx="132" cy="132" r="8" stroke-width="18"/>';
    this.svgDice[6] += '</svg>';
  }

  setBoardAppearance(boardimg, turncolor, dicepipcolor, stackinfocolor, rotation) {
    const styleClass = {"img/board1.png":"boardStyle1", "img/board2.png":"boardStyle2",
                        "img/board3.png":"boardStyle3", "img/board4.png":"boardStyle4", "img/board5.png":"boardStyle5"};

    this.mainBoard.addClass(styleClass[boardimg]);
    this.setDomNameAndStyle();
    if (rotation == 'cw') {
        this.flipHorizOrientation();
    }
  }

  setBoardStyle(boardtype, rotation) {
    this.mainBoard.addClass(boardtype);
    this.setDomNameAndStyle();
    if (rotation == 'cw') {
        this.flipHorizOrientation();
    }
  }

  setDomNameAndStyle() {
    let xh;

    xh = '<div id="bar" class="bar"></div>';
    this.mainBoard.append(xh);
    $("#bar").css(this.getPosObj(this.pointX[0], 0));

    xh  = '<div id="offtray1" class="offtray"></div>';
    xh += '<div id="offtray2" class="offtray"></div>';
    this.mainBoard.append(xh);
    $("#offtray1").css(this.getPosObj( 0 * this.pointWidth - this.offtrayMargin, 0));
    $("#offtray2").css(this.getPosObj(14 * this.pointWidth, 0));

    //point triangles
    this.point = [];
    const pointColorClass = ["pt_dnev", "pt_dnod", "pt_upev", "pt_upod"];
    for (let i = 1; i < 25; i++) {
      const colfig = ((i>12) ? 1 : 0) * 2 + (i % 2); //0=under+even, 1=under+odd, 2=upper+even, 3=upper+odd
      const xh = '<div id="pt' + i + '" class="point ' + pointColorClass[colfig] + '"></div>';
      this.mainBoard.append(xh);
      this.point[i] = $('#pt' + i);
      const ey = (i > 12) ? 0 : this.mainBoardHeight - this.point[i].height();
      this.point[i].css(this.getPosObj(this.pointX[i], ey));
    }

    //label
    this.labels = [];
    for (let i = 1; i < 25; i++) {
      const xh = '<div id="lb' + i + '" class="label"></div>';
      this.mainBoard.append(xh);
      this.labels[i] = $('#lb'+i);
      const ey = (i > 12) ? this.upperlabelY : this.lowerlabelY;
      this.labels[i].css(this.getPosObj(this.pointX[i], ey));
    }

    //cube
    xh  = '<div id="cube" class="cube">64</div>';
    this.mainBoard.append(xh);
    this.cube = $('#cube');
    this.cube.css(this.getPosObj(this.cubeX, this.cubeY[0]));

    //dice
    xh  = '<div id="dice10" class="dice"></div>';
    xh += '<div id="dice11" class="dice"></div>';
    xh += '<div id="dice20" class="dice"></div>';
    xh += '<div id="dice21" class="dice"></div>';
    this.mainBoard.append(xh);
    this.dice = [[],[$('#dice10'),$('#dice11')],[$('#dice20'),$('#dice21')]];
    this.dice[1][0].css(this.getPosObj(this.dice10X, this.diceY));
    this.dice[1][1].css(this.getPosObj(this.dice11X, this.diceY));
    this.dice[2][0].css(this.getPosObj(this.dice20X, this.diceY));
    this.dice[2][1].css(this.getPosObj(this.dice21X, this.diceY));

    //stack counter
    this.stacks = [];
    for (let i = 0; i < 28; i++) {
      const xh = '<div id="st' + i + '" class="stack"></div>';
      this.mainBoard.append(xh);
      this.stacks[i] = $('#st' + i);
    }

    //Chequer
    this.chequer = [[],[],[]];
    for (let j = 1; j < 3; j++) {
      for (let i = 0; i < 15; i++) {
        this.chequer[j][i] = new Chequer(j, i);
        const xh = this.chequer[j][i].domhtml;
        this.mainBoard.append(xh);
        this.chequer[j][i].set_jQueryDom();
      }
    }
  }

  flipHorizOrientation() {
    const dr = this.toggleHoriz();
    this.setHoriz(dr);
    this.showBoard(this.xgidstr);
  }

  setHoriz(dr) {
    let i, j;
    for (i = 1; i < 7; i++) {
      j = 13 - i;
      BgUtil.swap(this.pointX, i, j);
      BgUtil.swap(this.labels, i, j);
      BgUtil.swap(this.stacks, i, j);
    }
    for (i = 13; i < 19; i++) {
      j = 37 - i;
      BgUtil.swap(this.pointX, i, j);
      BgUtil.swap(this.labels, i, j);
      BgUtil.swap(this.stacks, i, j);
    }
    this.pointX[26] = (dr == 'R') ? this.rightSideOff + this.offtrayMargin : this.leftSideOff - this.offtrayMargin;
  }

  toggleHoriz() {
    this.horizOrientation = (this.horizOrientation == 'R') ? 'L' : 'R';
    return this.horizOrientation;
  }

  resetBoard() {
    this.showBoard("XGID=--------------------------:0:0:0:00:0:0:0:0:0");
  }

  showBoard(xgidstr) { // input for XGID string
    this.showBoard2( new Xgid(xgidstr) );
  }

  showBoard2(xg) { // input for XGID object
    this.xgidstr = xg.xgidstr;
    if (xg.get_boff(0) < 0 || xg.get_boff(1) < 0) {
      alert("Invalid XGID!!\n" + xg.xgidstr + "\nbearoff(0)=" + xg.get_boff(0) + "\nbearoff(1)=" + xg.get_boff(1));
    }
    this.showPosition(xg);
    this.showDiceAll(xg.get_turn(), xg.get_dice(1), xg.get_dice(2));
    this.showCube(xg.get_cubepos(),xg.get_cube(),xg.get_dbloffer(),xg.get_crawford());
    this.showLabels(xg.get_turn());
  }

  showCube(pos, val, offer, crawford){
    const cubepos = BgUtil.cvtTurnXg2Bd(pos);
    const cubeval = BgUtil.calcCubeDisp(val, crawford);
    const cubePosClass = ["cubepos0", "cubepos1", "cubepos2"];
    const cubePosJoin = cubePosClass.join(" ");
    this.cube.text(cubeval).css(this.getPosObj(this.cubeX, this.cubeY[cubepos]))
             .removeClass(cubePosJoin).addClass(cubePosClass[cubepos])
             .toggleClass("cubeoffer", offer);
  }

  showDiceAll(turn, d1, d2) {
    switch( BgUtil.cvtTurnXg2Bd(turn) ) {
    case 0:
      this.showDice(1, d1, 0);
      this.showDice(2, d2, 0);
      break;
    case 1:
      this.showDice(1, d1, d2);
      this.showDice(2, 0,  0);
      break;
    case 2:
      this.showDice(1, 0,  0);
      this.showDice(2, d1, d2);
      break;
    }
  }

  showDice(turn, d0, d1) {
    const dicefaceClass = ["", "diceface1", "diceface2"];
    this.dice[turn][0].html(this.svgDice[d0]);
    this.dice[turn][1].html(this.svgDice[d1]);
    this.dice[turn][0].children("svg").addClass(dicefaceClass[turn]);
    this.dice[turn][1].children("svg").addClass(dicefaceClass[turn]);
    (d0 == 0) ? this.dice[turn][0].hide() : this.dice[turn][0].show();
    (d1 == 0) ? this.dice[turn][1].hide() : this.dice[turn][1].show();
  }

  showLabels(turn) {
    for (let i = 1; i < 25; i++) {
      let c = (turn == 0) ? "" : (turn == 1) ? i : 25 - i;
      this.labels[i].text(c);
    }
  }

  showPosition(xg) {
    let piecePointer = [0, 0, 0];
    for (let pt = 0; pt <= 25; pt++) {
      const num = xg.get_ptno(pt);
      const player = BgUtil.cvtTurnXg2Bd(xg.get_ptcol(pt));
      for (let j = 0; j < num; j++) {
        this.chequer[player][piecePointer[player]].point = pt;
        this.chequer[player][piecePointer[player]].stack = num;
        piecePointer[player] += 1;
      }
    }

    // now move any unused pieces to the off tray
    for (let player = 1; player <= 2; player++) {
      for (let i = piecePointer[player]; i < 15; i++) {
        const pt = (player == 2) ? 26 : 27;
        this.chequer[player][i].point = pt;
        this.chequer[player][i].stack = 15 - piecePointer[player];
      }
    }

    let ex, ey, ty, sf, bf;
    let ptStack = Array(28);
    ptStack.fill(0);
    for (let player = 1; player <= 2; player++) {
      for (let i=0; i<15; i++) {
        const pt = this.chequer[player][i].point;
        const st = this.chequer[player][i].stack;
        bf = false;

        if (pt == 26 || pt == 27) { //bear off
          bf = true;
          ex = this.pointX[26];
          sf = false;
          ey = (player == 1) ? this.offY[player] - (ptStack[pt] * this.boffHeight)
                             : this.offY[player] + (ptStack[pt] * this.boffHeight); //player==2
        } else if (pt == 0 || pt == 25) { //on the bar
          ex = this.pointX[pt];
          sf = (st > this.barStackThreshold + 1);
          ty = (ptStack[pt] > this.barStackThreshold) ? this.barStackThreshold : ptStack[pt];
          ey = (pt == 0) ? this.barY[player] - (ty * this.pieceHeight)
                         : this.barY[player] + (ty * this.pieceHeight); //pt==25
        } else { //in field
          ex = this.pointX[pt];
          sf = (st > this.pointStackThreshold + 1);
          ty = (ptStack[pt] > this.pointStackThreshold) ? this.pointStackThreshold : ptStack[pt];
          ey = (pt > 12) ? this.yupper + (ty * this.pieceHeight)
                         : this.ylower - (ty * this.pieceHeight);
        }
        ptStack[pt] += 1;
        const position = this.getPosObj(ex, ey);
        const zindex = 10 + ptStack[pt];
        this.chequer[player][i].position = position;
        this.chequer[player][i].zindex = zindex;
        this.chequer[player][i].dom.css(position).css("z-index", zindex).toggleClass("bearoff", bf);
        const stackColorClass = ["", "stackcol1", "stackcol2"];
        this.stacks[pt].text("").removeClass(stackColorClass.join(" "));
        if (sf) {
          this.stacks[pt].text(st).css(position).addClass(stackColorClass[player]);
        }
      }
    }

  }

  bgBoardConfig() {
    this.mainBoardHeight = this.mainBoard.height()
    this.mainBoardWidth = this.mainBoard.width()
    this.vw = this.mainBoardWidth / 45;
    this.vh = this.mainBoardHeight / 70;

    this.pointWidth = 3 * this.vw; // equal to width in css
    this.pieceWidth = this.pointWidth;
    let pieceHeightRatio = this.mainBoardHeight / 13 / this.pieceWidth;
    pieceHeightRatio = (pieceHeightRatio > 1) ? 1 : pieceHeightRatio;
    this.pieceHeight = this.pieceWidth * pieceHeightRatio;
    this.boffHeight = this.pieceWidth / 4 ; // bearoff chequer height

    this.pointX = [7, 13, 12, 11, 10,  9,  8,  6,  5,  4,  3,  2,  1,
                       1,  2,  3,  4,  5,  6,  8,  9, 10, 11, 12, 13,  8, 14, 0];
    for (let i=0; i< this.pointX.length; i++) {
      this.pointX[i] *= this.pointWidth;
    }

    this.yupper = 0;
    this.ylower = this.mainBoardHeight - this.pieceWidth;

    const tray2Y = -0.4 * this.pieceHeight;
    const tray1Y = this.mainBoardHeight - this.pieceWidth - tray2Y;
    this.offY = [null, tray1Y, tray2Y];

    this.diceSize = this.pointWidth;
    this.diceY = this.mainBoardHeight / 2 - this.diceSize / 2;
    this.dice10X = this.pointX[3];
    this.dice11X = this.pointX[4];
    this.dice20X = this.pointX[9];
    this.dice21X = this.pointX[10];

    this.pointStackThreshold = 5;
    this.barStackThreshold = 3;

    this.cubeSize = 0.9 * this.pointWidth;
    this.cubeX = this.pointX[0] + 0.1 * this.vw; // cube class widthを加味
    const cubeY0 = Math.round(this.mainBoardHeight / 2 - this.cubeSize / 2);
    const cubeY2 = 5;
    const cubeY1 = this.mainBoardHeight - this.cubeSize - cubeY2;
    this.cubeY = [cubeY0, cubeY1, cubeY2];

    const bar1Y = this.cubeSize + 5;
    const bar2Y = this.mainBoardHeight - bar1Y - this.pieceHeight;
    this.barY = [null, bar1Y, bar2Y];

    this.upperlabelY = -20; // equal to border-width of mainBoard
    this.lowerlabelY = this.mainBoardHeight;

    this.leftSideOff = 0; // Off tray x coord (left)
    this.rightSideOff = this.mainBoardWidth - this.pieceWidth; // Off tray x coord (right)
    this.offtrayMargin = 5; // equal to offtray border size

    this.pointX[26] = (this.horizOrientation == 'R') ?
                      this.rightSideOff + this.offtrayMargin : this.leftSideOff - this.offtrayMargin;
  }

  getPosObj(x, y) {
    return {left:x, top:y}
  }

} //class BgBoard
