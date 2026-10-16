    PiaoFen: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "dfdd9vwbXVNnKaBqfWQG4Ou", "PiaoFen"),
          cc.Class({
            extends: cc.Component,
            properties: {
              itemPrefab: cc.Prefab,
              descItemPrefab: cc.Prefab,
              PiaoFenPos: [cc.Vec2],
              NextPiaoFenStep: cc.Vec2,
            },
            onLoad: function () {
              (this.updateAllPlayerNodeLayout(), (this._tPiaoFenNode = new Map()));
            },
            start: function () {},
            playPiaoFenAnim: function (e) {
              var t = this,
                i = e.nViewSeatId,
                a = e.showTime,
                o = e.nQualifyingPoint,
                n = e.nDiyPoint,
                s = e.nScore,
                r = e.nShareMoreWin,
                c = e.vipWillMoreWin,
                l = e.nSign,
                g = i === g_tConst.GameConfig.ViewSeat.SeatMine,
                d = e.iMKBKMoreWin,
                h = e.nZCoin,
                u = e.totalFan,
                _ = e.seatIdx,
                m = e.seatMaxNum;
              if (i != g_tConst.GameConfig.ViewSeat.SeatMine && m > 4 && _ > 0) {
                var f = this._tPiaoFenNode[i][0];
                f &&
                  f
                    .getComponent("PiaoFenItem")
                    .merge({
                      nQualifyingPoint: o,
                      nDiyPoint: n,
                      nScore: s,
                      nShareMoreWin: r,
                      vipWillMoreWin: c,
                      nSign: l,
                      bShowSvip: g,
                      iMKBKMoreWin: d,
                      nZCoin: h,
                      totalFan: u,
                    });
              } else {
                a = a <= 0.5 ? 0.5 : a;
                var p = cc.instantiate(this.itemPrefab);
                (p
                  .getComponent("PiaoFenItem")
                  .init({
                    nViewSeatId: i,
                    nQualifyingPoint: o,
                    nDiyPoint: n,
                    nScore: s,
                    nShareMoreWin: r,
                    vipWillMoreWin: c,
                    nSign: l,
                    bShowSvip: g,
                    iMKBKMoreWin: d,
                    nZCoin: h,
                    totalFan: u,
                  }),
                  this._tPiaoFenNode.arrayPush(i, p));
                var C = this._tPiaoFenNode[i].length,
                  v = this.NextPiaoFenStep.mul(C - 1),
                  y = this.PiaoFenPos[i].add(v),
                  S = y.sub(cc.v2(0, 10));
                if ((this.node.addChild(p), i == g_tConst.GameConfig.ViewSeat.SeatMine && m > 3)) {
                  var D = _ + 1,
                    T = cc.view.getVisibleSize(),
                    I = Math.ceil(m / 3),
                    E = Math.ceil(D / 3),
                    M = I / 2 + 0.5,
                    L = T.width / Math.max(I, 3),
                    A = new cc.Vec2(0, 0);
                  if (((A.x = L * (E - M)), D > 3)) {
                    var P = D % 3,
                      N = (0 == P ? 3 : P) - 1;
                    A.y = this.PiaoFenPos[i].y + this.NextPiaoFenStep.y * N - y.y;
                  }
                  ((S = S.add(A)), (y = y.add(A)));
                } else if (i == g_tConst.GameConfig.ViewSeat.SeatFront && m >= 3 && m < 5) {
                  var w = m - 3 + 1,
                    R = new cc.Vec2(0, -1 * w * this.NextPiaoFenStep.y);
                  ((S = S.add(R)), (y = y.add(R)));
                }
                ((p.position = S),
                  cc
                    .tween(p)
                    .to(0.1, { position: y })
                    .delay(a - 0.1)
                    .call(function () {
                      (t._tPiaoFenNode[i].shift(), p.destroy());
                    })
                    .start());
              }
            },
            playDescAnim: function (e, t) {
              var i = this;
              if (-1 != e) {
                var a = cc.instantiate(this.descItemPrefab);
                (a.getComponent("PiaoFenDescItem").init(t), this._tPiaoFenNode.arrayPush(e, a));
                var o = this.NextPiaoFenStep.mul(this._tPiaoFenNode[e].length - 1),
                  n = this.PiaoFenPos[e].add(o),
                  s = n.sub(cc.v2(0, 10));
                (this.node.addChild(a),
                  (a.position = s),
                  cc
                    .tween(a)
                    .to(0.1, { position: n })
                    .delay(1.3)
                    .to(0.14, { scale: 0, opacity: 0 })
                    .call(function () {
                      (i._tPiaoFenNode[e].shift(), a.destroy());
                    })
                    .start());
              }
            },
            updateAllPlayerNodeLayout: function () {
              var e = g_oData.get(g_tData.LiveGameModel).isLivePlayer();
              this.PiaoFenPos[0] = e ? cc.v2(0, -102) : cc.v2(0, -163);
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
