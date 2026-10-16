    CustomTreasureChoose: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "ac4f2NDVLxIvotDOjR9FUwi", "CustomTreasureChoose");
        var i = e("DlgBaseView");
        (cc.Class({
          extends: i,
          properties: {
            title: cc.Label,
            goLeft: cc.Node,
            goRight: cc.Node,
            filled: cc.Node,
            pageIns: cc.Node,
            dotIns: cc.Node,
            choosedIns: cc.Node,
            tip: cc.Node,
            guides: { default: [], type: [cc.Node] },
            chooseItem: cc.Prefab,
          },
          Awake: function () {
            ((this._closeReleaseRes = !0),
              (this._chooseShowCfg = g_oData.get(g_tData.CustomTreasureMod).getChooseShowCfg()),
              (this._curLevel = 1),
              (this._showPage = this.pageIns),
              (this._hidePage = null),
              (this._lastDot = null),
              (this._sliding = !1),
              (this._chooseArr = []),
              (this._realNum = -1),
              (this._chooseMap = new Map()),
              (this._skipArr = null),
              this.onCustomEvent(),
              this.onMessageEvent());
          },
          start: function () {
            var e = this;
            g_oData.get(g_tData.CustomTreasureMod).reportShowView(1);
            var t = g_oData.get(g_tData.UserLocalModel).getData("CUSTOM_TREASURE_GUIDED", !1);
            ((this.tip.active = t),
              t ||
                this.scheduleOnce(function () {
                  e.startGuide();
                }, 0.3));
          },
          onCustomEvent: function () {
            this.node.on("ON_INIT", this.onInit, this);
          },
          onMessageEvent: function () {
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.GET_CUSTOM_TREASURE_SUC,
                function () {
                  if (g_oData.get(g_tData.CustomTreasureMod).getLeftTime() > 0) {
                    (g_oLayerManager.emitEvent2Dlg(
                      g_tConst.GameLayerCfg.CustomTreasureDraw.id,
                      "ON_INIT",
                    ),
                      this.close());
                    var e = g_oData.get(g_tData.CustomTreasureMod).selectedCfg;
                    if (Array.isArray(e.treasures) && e.treasures.length > 0)
                      for (var t = e.treasures, i = 0; i < t.length; i++) {
                        var a = t[i].goodsInfo[0];
                        g_oData.get(g_tData.CustomTreasureMod).reportChooseTreasure(a.id);
                      }
                  }
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.CLOSE_CUSTOM_CHOOSE_VIEW,
                  function () {
                    this.close();
                  },
                  this,
                ),
              ));
          },
          onInit: function () {
            if (Array.isArray(this._chooseShowCfg) && this._chooseShowCfg.length > 0) {
              var e = this._chooseShowCfg.length;
              (e > 1 &&
                ((this._hidePage = cc.instantiate(this._showPage)),
                (this._hidePage.parent = this._showPage.parent),
                this.initSlideDot(e)),
                this.updatePage(this._showPage, this._curLevel));
            }
          },
          startGuide: function () {
            (g_oData.get(g_tData.UserLocalModel).setData("CUSTOM_TREASURE_GUIDED", !0),
              this.onClickNextGuide(null, 0));
          },
          onClickNextGuide: function (e, t) {
            for (var i = parseInt(t), a = !0, o = 0; o < this.guides.length; o++)
              ((this.guides[o].active = i == o), this.guides[o].active && (a = !1));
            a && (this.tip.active = !0);
          },
          initSlideDot: function (e) {
            this.dotIns.active = !0;
            for (var t = 0; t < e - 1; t++) cc.instantiate(this.dotIns).parent = this.dotIns.parent;
          },
          updateDotsByLevel: function (e) {
            var t = this.dotIns.parent.children[e - 1];
            (this._lastDot && this.showDotLight(this._lastDot, !1),
              this.showDotLight(t, !0),
              (this._lastDot = t));
          },
          showDotLight: function (e, t) {
            ((e.children[0].active = !t), (e.children[1].active = t));
          },
          updatePage: function (e, t) {
            ((e.active = !0),
              this.updateDotsByLevel(t),
              (this.title.string = "\u7b2c" + this.getTitleNum(t) + "\u6863\u5956\u52b1"),
              (this.goLeft.active = t > 1),
              (this.goRight.active = t < this._chooseShowCfg.length));
            var i = this._chooseShowCfg[t - 1].goodsInfo,
              a = e.children;
            if (0 == a.length)
              for (var o = 0; o < i.length; o++) g_oPrefabLoader.instantiate(this.chooseItem, e);
            for (var n = 0; n < a.length; n++) {
              var s = a[n];
              if (s) {
                var r = s.getComponent("CustomTreasureChooseItem");
                r && r.onInit && r.onInit(n, i[n], this);
              }
            }
          },
          getTitleNum: function (e) {
            return 1 == e
              ? "\u4e00"
              : 2 == e
                ? "\u4e8c"
                : 3 == e
                  ? "\u4e09"
                  : 4 == e
                    ? "\u56db"
                    : void 0;
          },
          onClickGo: function (e, t) {
            if (!this._sliding) {
              var i = this._showPage.width + 100,
                a = 0 == t ? -1 : 1;
              ((this._curLevel += a),
                this.updatePage(this._hidePage, this._curLevel),
                (this._hidePage.x = this._showPage.x + i * a));
              var o = this;
              ((this._sliding = !0),
                this.slideAct([this._showPage.parent], i, a, function () {
                  o._sliding = !1;
                  var e = o._showPage;
                  ((o._showPage = o._hidePage), (o._hidePage = e));
                }));
            }
          },
          slideAct: function (e, t, i, a) {
            void 0 === a && (a = null);
            for (var o = g_tConst.CustomTreasureChooseCfg.SlideTime, n = 0; n < e.length; n++) {
              var s = e[n];
              cc.tween(s)
                .by(o, { position: new cc.Vec3(-i * t, 0, 0) }, { easing: "cubicOut" })
                .start();
            }
            this.scheduleOnce(function () {
              a && a();
            }, o);
          },
          onChooseItem: function (e) {
            (this.updateChoosedList(e), this.updateChooseView(e), this.checkSkip(e));
          },
          checkSkip: function (e) {
            var t = e.level,
              i = g_oData.get(g_tData.CustomTreasureMod).topLevel;
            if (!this._skipArr) {
              this._skipArr = [];
              for (var a = 0; a < i; a++) this._skipArr.push(!1);
            }
            if (1 == e.choosed) {
              var o = this._chooseMap.get(t),
                n = this._skipArr[t - 1];
              o &&
                o.levelFirstChooseId > 0 &&
                o.levelSecondChooseId > 0 &&
                t < i &&
                !n &&
                ((this._skipArr[t - 1] = !0), this.onClickGo(null, 1));
            }
          },
          updateChooseView: function (e) {
            var t = e.level,
              i = this._chooseMap.get(t) || {},
              a = i.levelFirstChooseId || -1,
              o = i.levelSecondChooseId || -1;
            if (!0 === e.choosed)
              ((e.choosed = !1),
                e.id == o && (o = -1),
                e.id == a && o >= 0 ? ((a = o), (o = -1)) : e.id == a && (a = -1));
            else {
              for (
                var n = this._chooseShowCfg[t - 1].goodsInfo, s = null, r = null, c = 0, l = 0;
                l < n.length;
                l++
              ) {
                var g = n[l];
                g.level == t &&
                  !0 === g.choosed &&
                  (c++, g.id == a && (s = g), g.id == o && (r = g));
              }
              2 == c && s && r
                ? ((e.choosed = !0), (s.choosed = !1), (a = r.id), (o = e.id))
                : ((e.choosed = !0), 0 == c && (a = e.id), 1 == c && (o = e.id));
            }
            ((i.levelFirstChooseId = a),
              (i.levelSecondChooseId = o),
              this._chooseMap.set(t, i),
              this.updatePage(this._showPage, t));
          },
          updateChoosedList: function (e) {
            var t = 2 * this._chooseShowCfg.length;
            if (0 == this._chooseArr.length) {
              for (var i = 0; i < t; i++) this._chooseArr.push(null);
              this._realNum = 0;
            }
            1 == e.choosed ? this.removeChoose(e.id) : this.insertChoose(e, t);
            for (var a = this.choosedIns.parent.children, o = 0; o < this._chooseArr.length; o++) {
              var n = this._chooseArr[o],
                s = a[o];
              null != n
                ? (s || ((s = cc.instantiate(this.choosedIns)).parent = this.choosedIns.parent),
                  s && ((s.active = !0), this.updateChoosedItem(n, s)))
                : s && (s.active = !1);
            }
            this.filled.active = this._realNum == t;
          },
          updateChoosedItem: function (e, t) {
            var i = t.children[1].getComponent(cc.Sprite),
              a = t.children[3].getComponent(cc.Label);
            (g_oSpriteFrameLoader.loadGoodsIcon(i, e, e.extra, function () {
              var e = 55 / i.node.width;
              ((i.node.width = 55), (i.node.height *= e));
            }),
              (a.string = e.itemDesc));
          },
          removeChoose: function (e) {
            for (var t = 0; t < this._realNum; t++) {
              var i = this._chooseArr[t];
              if (null != i && i.id == e)
                for (var a = t; a < this._realNum; a++)
                  a + 1 < this._realNum
                    ? (this._chooseArr[a] = this._chooseArr[a + 1])
                    : (this._chooseArr[a] = null);
            }
            this._realNum = Math.max(0, this._realNum - 1);
          },
          insertChoose: function (e, t) {
            for (var i = e.level, a = 0, o = -1, n = 0; n < this._realNum; n++) {
              var s = this._chooseArr[n];
              if (null != s && s.level == i && (1 == ++a && (o = n), 2 == a && o >= 0)) {
                this.removeChoose(this._chooseArr[o].id);
                break;
              }
            }
            ((this._chooseArr[this._realNum] = e),
              (this._realNum = Math.min(t, this._realNum + 1)));
          },
          onClickStartDraw: function () {
            if (this._chooseArr.length > 0) {
              var e = g_oData.get(g_tData.SwitchModel).getCustomTreasureCfg().showSeq || null,
                t = [];
              (Array.isArray(e) && e.length > 0
                ? ((t = new Array(e.length)),
                  this._chooseArr.forEach(function (i) {
                    for (var a = 0; a < e.length; a++)
                      if (e[a] == i.level) {
                        ((t[a] = i.id), (e[a] = -1));
                        break;
                      }
                  }))
                : this._chooseArr.forEach(function (e) {
                    t.push(e.id);
                  }),
                g_oData.get(g_tData.CustomTreasureMod).reqSelectCTAward(t));
            }
          },
          onClickClose: function () {
            this._realNum > 0
              ? g_oPrefabLoader.loadRes(
                  g_tAsset.CustomTreasureExitChoosePrefab,
                  this.node,
                  function () {},
                )
              : this.close();
          },
        }),
          cc._RF.pop());
      },
      { DlgBaseView: "DlgBaseView" },
    ],
