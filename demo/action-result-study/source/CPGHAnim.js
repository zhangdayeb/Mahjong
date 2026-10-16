    CPGHAnim: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "51f98VXLj9Pq4iWLgJli/qP", "CPGHAnim"),
          cc.Class({
            extends: cc.Component,
            properties: { animPos: [cc.Vec2] },
            onLoad: function () {
              (this.updateAllPlayerNodeLayout(),
                (this._noWindAndXiaYuGameType = [g_tConst.GameTypeCfgs.JBCROOMWHMJ.TYPEID]));
            },
            start: function () {},
            playXiaYu: function () {
              if (!this._noWindAndXiaYuGameType.includes(MJ.GameLogic.TableModel.getGameType())) {
                var e = this.node.getComponent("NewCPGHAnim"),
                  t = cc.v2(0, 0);
                e.playXiaYu(t);
              }
            },
            playLiuJu: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = cc.v2(0, 0);
              t.playLiuJu(i, e);
            },
            playTing: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = this.animPos[e];
              t.playTing(i, e);
            },
            playPeng: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = this.animPos[e];
              t.playPeng(i);
            },
            playChow: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = this.animPos[e];
              t.playChow(i);
            },
            playWind: function () {
              if (!this._noWindAndXiaYuGameType.includes(MJ.GameLogic.TableModel.getGameType())) {
                var e = this.node.getComponent("NewCPGHAnim"),
                  t = cc.v2(0, -200);
                e.playWind(t);
              }
            },
            playGang: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = this.animPos[e];
              (t.playGang(i), this.playWind());
            },
            playAnGang: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = this.animPos[e];
              (t.playGang(i), this.playXiaYu());
            },
            playZIMO: function (e, t) {
              void 0 === t && (t = {});
              var i = this.node.getComponent("NewCPGHAnim"),
                a = this.animPos[e];
              i.playZIMO(a, t);
            },
            playHu: function (e, t) {
              void 0 === t && (t = {});
              var i = this.node.getComponent("NewCPGHAnim"),
                a = this.animPos[e];
              i.playHu(a, t);
            },
            playQGH: function (e, t) {
              void 0 === t && (t = {});
              var i = this.node.getComponent("NewCPGHAnim"),
                a = this.animPos[e];
              i.playQGH(a, t);
            },
            playPJKS: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = cc.v2(0, 0);
              t.playPJKS(i, e);
            },
            playMatchPJKS: function (e, t) {
              var i = this.node.getComponent("NewCPGHAnim"),
                a = cc.v2(0, 0);
              i.playMatchPJKS(a, e, t);
            },
            playShaiZi: function () {
              this.node.getComponent("NewCPGHAnim").playShaiZi();
            },
            playHuDian: function (e) {
              this.node.getComponent("NewCPGHAnim").playHuDian(e);
            },
            playZiMoLight: function (e) {
              this.node.getComponent("NewCPGHAnim").playZiMoLight(e);
            },
            playMingDan: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = this.animPos[e];
              t.playMingDan(i);
            },
            playAnDan: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = this.animPos[e];
              t.playAnDan(i);
            },
            playGuoDan: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = this.animPos[e];
              t.playGuoDan(i);
            },
            playCha: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = this.animPos[e];
              t.playCha(i);
            },
            playTongBao: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = this.animPos[e];
              t.playTongBao(i);
            },
            playDuiBao: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = this.animPos[e];
              t.playDuiBao(i);
            },
            playMoBao: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = this.animPos[e];
              t.playMoBao(i);
            },
            playHuAniByFanXing: function (e, t, i, a, o) {
              var n = this.node.getComponent("NewCPGHAnim"),
                s = this.animPos[e];
              n.playHuAniByFanXing(e, t, i, a, s, o);
            },
            updateAllPlayerNodeLayout: function () {
              if (g_oData.get(g_tData.LiveGameModel).isLivePlayer()) {
                var e = this.animPos[0];
                this.animPos[0] = cc.v2(e.x, -70);
              }
            },
            playProtectGift: function (e, t, i) {
              this.node.getComponent("NewCPGHAnim").playProtectGift(e, t, i);
            },
            playMingPai: function (e) {
              var t = this.node.getComponent("NewCPGHAnim"),
                i = this.animPos[e];
              switch (e) {
                case 2:
                  i = i.add(cc.v2(0, -50));
                  break;
                case 1:
                  i = i.add(cc.v2(200, 0));
                  break;
                case 3:
                  i = i.add(cc.v2(-200, 0));
                  break;
                case 0:
                  i = i.add(cc.v2(0, 120));
              }
              t.playMingPai(i);
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
