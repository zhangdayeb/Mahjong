    PiaoFenItem: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "7083ckfwsVDU5PS1d7ixLQ9", "PiaoFenItem");
        var i = e("CommonUtils"),
          a = cc.Enum({ SectionPoint: 0, GameCoin: -1, DiyRoomPoint: -1, ZCoin: -1 }),
          o = cc.Enum({ Blue: 0, Yellow: -1, Red: -1 });
        (cc.Class({
          extends: cc.Component,
          properties: {
            winEffectNodes: [cc.Node],
            nodeLayout: [cc.Node],
            labScore: [cc.Label],
            labVipScore: cc.Label,
            scoreFont: [cc.Font],
            imgDCoinIcon: cc.SpriteFrame,
            _nViewSeatId: 0,
            _nQualifyingPoint: 0,
            _nDiyPoint: 0,
            _nScore: 0,
            _nZCoin: 0,
            _nShareMoreWin: 0,
            _nSign: 0,
            _totalFan: 0,
            _bShowSvip: !1,
          },
          init: function (e) {
            ((this._nViewSeatId = e.nViewSeatId),
              (this._nQualifyingPoint = e.nQualifyingPoint),
              (this._nDiyPoint = e.nDiyPoint),
              (this._nScore = e.nScore),
              (this._nShareMoreWin = e.nShareMoreWin),
              (this._nSign = e.nSign),
              (this._bShowSvip = e.bShowSvip),
              (this._iMKBKMoreWin = e.iMKBKMoreWin),
              (this._nZCoin = e.nZCoin),
              (this._totalFan = e.totalFan));
            var t = this._nZCoin;
            if (MJ.GameLogic.TableModel.isDCoinRoom()) {
              t = Math.floor(t / g_oData.get(g_tData.DianFengSaiMod).getDianFengSaiRatio());
              var o = this.nodeLayout[a.ZCoin].getChildByName("img_icon");
              if (o) {
                var n = o.getComponent(cc.Sprite);
                n && (n.spriteFrame = this.imgDCoinIcon);
              }
            }
            var s = !1;
            (MJ.GameLogic.TableModel.isTeam() && MJ.GameLogic.TableModel.isXLHZ2V2() && (s = !0),
              this.setPiaoFen(
                this._nQualifyingPoint,
                this.nodeLayout[a.SectionPoint],
                this.labScore[a.SectionPoint],
                this.scoreFont,
                a.SectionPoint,
                s,
              ),
              this.setPiaoFen(
                this._nScore,
                this.nodeLayout[a.GameCoin],
                this.labScore[a.GameCoin],
                this.scoreFont,
                a.GameCoin,
                !0,
              ),
              this.setPiaoFen(
                this._nDiyPoint,
                this.nodeLayout[a.DiyRoomPoint],
                this.labScore[a.DiyRoomPoint],
                this.scoreFont,
                null,
                !1,
              ),
              this.setPiaoFen(
                t,
                this.nodeLayout[a.ZCoin],
                this.labScore[a.ZCoin],
                this.scoreFont,
                a.ZCoin,
                !0,
              ),
              this.addString(
                this._nScore,
                this.labScore[a.GameCoin],
                this._nShareMoreWin,
                this._nSign,
              ),
              this.addString(t, this.labScore[a.ZCoin], this._nShareMoreWin, this._nSign),
              this._bShowSvip &&
                (this._iMKBKMoreWin > 0
                  ? (this.labVipScore.node.active || (this.labVipScore.node.active = !0),
                    (this.labVipScore.string =
                      "(+" + i.translateCoinStr(i.initProCoin(this._iMKBKMoreWin)) + ")"))
                  : (this.labVipScore.node.active = !1)));
          },
          isWinEffectActive: function (e) {
            this.winEffectNodes.forEach(function (t) {
              t.active = e;
            });
          },
          setPiaoFen: function (e, t, n, s, r, c) {
            var l = "";
            if (isNaN(e) || 0 == e) t.active = !1;
            else {
              var g = e > 0,
                d = Math.abs(e);
              MJ.GameLogic.TableModel.getGameType() == g_tConst.GameTypeCfgs.LS6HZ.TYPEID &&
                t.getChildByName("img_icon") &&
                ((t.getChildByName("img_icon").active = !1), (c = !1));
              var h = c ? i.initProCoin(d) : d + "";
              switch (r) {
                case a.GameCoin:
                case a.SectionPoint:
                case a.ZCoin:
                  ((h = i.translateCoinStr(h, { afterNum: 1 })),
                    (h = MJ.GameLogic.translatePiaoFenCoin(h)));
              }
              ((l = g ? "+" + h : "-" + h),
                (n.font = g ? s[o.Yellow] : s[o.Blue]),
                g &&
                  MJ.GameLogic.TableModel.isInCrazyMode &&
                  this._totalFan >= MJ.GameLogic.TableModel.getFengDingFan() &&
                  (n.node.color = new cc.Color(255, 180, 180, 255)),
                this.isWinEffectActive(g));
            }
            n.string = l;
          },
          addString: function (e, t, a, o) {
            if (0 !== e) {
              var n = "";
              switch (
                (a > 0 &&
                  (n +=
                    " +" +
                    MJ.GameLogic.translatePiaoFenCoin(
                      i.translateCoinStr(i.initProCoin(a), { afterNum: 1 }),
                    )),
                o)
              ) {
                case 1:
                  n += "(\u5c01\u9876)";
                  break;
                case 2:
                  n += "(\u7834\u4ea7)";
              }
              t.string += n;
            }
          },
          merge: function (e) {
            this.init({
              nViewSeatId: this._nViewSeatId,
              nQualifyingPoint: this._nQualifyingPoint + (e.nQualifyingPoint || 0),
              nDiyPoint: this._nDiyPoint + (e.nDiyPoint || 0),
              nScore: this._nScore + (e.nScore || 0),
              nShareMoreWin: this._nShareMoreWin + (e._nShareMoreWin || 0),
              vipWillMoreWin: this._vipWillMoreWin + (e.vipWillMoreWin || 0),
              nSign: Math.max(this._nSign, e.nSign || 0),
              bShowSvip: this._bShowSvip || e.bShowSvip,
              iMKBKMoreWin: this._iMKBKMoreWin + (e.iMKBKMoreWin || 0),
              nZCoin: this._nZCoin + (e.nZCoin || 0),
              totalFan: this._totalFan + (e.totalFan || 0),
            });
          },
        }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils" },
    ],
