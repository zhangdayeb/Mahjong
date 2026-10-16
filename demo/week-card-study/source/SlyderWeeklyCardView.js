    SlyderWeeklyCardView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "69436qYgGlOga1KB+/ArfU1", "SlyderWeeklyCardView");
        var i = e("AlertDlgBaseView"),
          a = e("QuikStart"),
          o = e("CommonUtils"),
          n = e("CommonSDK");
        (cc.Class({
          extends: i,
          properties: { _serverTime: 0 },
          Awake: function () {
            ((this._activeOver = !1),
              (this.slyderView = this.node
                .getChildByName("slyder")
                .getComponent("SlyderWeeklyCardLayer")),
              this.slyderView.onInit(),
              this.onMessageEvent(),
              this.onCustomEvent());
          },
          onMessageEvent: function () {
            var e = this;
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.RECEIVE_AWARD_SUC,
                function (e) {
                  0 == e.code && g_oData.get(g_tData.SlyderWeeklyCardModel).reqGetPersonMsg();
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GET_NEW_WEEKLY_CARD_CFG,
                  function () {
                    e.onInit();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GET_NEW_WEEKLY_CARD_DATA,
                  function () {
                    e.onInit();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.BUY_NEW_WEEKLY_CARD_FINISH,
                  function () {
                    e.onInit();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GAME_PLAT_NOTIFY_PAY_RST,
                  function (e) {
                    if (g_oData.get(g_tData.SlyderWeeklyCardModel).getGoodsInfo(e.itemId)) {
                      for (
                        var t,
                          i = g_oData
                            .get(g_tData.SlyderWeeklyCardModel)
                            .getSubEffectIdByType("zCoin"),
                          a = g_oData
                            .get(g_tData.SlyderWeeklyCardModel)
                            .getSubEffectIdByType("coin"),
                          n = 0;
                        n < i.length;
                        n++
                      ) {
                        var s = i[n],
                          r = g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(s);
                        r.itemId == e.itemId && (t = r);
                      }
                      for (var c = 0; c < a.length; c++) {
                        var l = a[c],
                          g = g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(l);
                        g.itemId == e.itemId && (t = g);
                      }
                      if (t) {
                        g_oData.get(g_tData.SlyderWeeklyCardModel).reqGetPersonMsg();
                        var d = t.immediateAward,
                          h = o.isOnGameScene(),
                          u = this.checkZcoinCardByCfg(t);
                        this.showGetAward(d, !h, u);
                      }
                      this._isGameOver
                        ? g_oData
                            .get(g_tData.WeeklyCardLayerModel)
                            .report("WeeklyCardBuybankruptcy", "buy" + e.itemId)
                        : g_oData
                            .get(g_tData.WeeklyCardLayerModel)
                            .report("WeeklyCardBuynormal", "buy" + e.itemId);
                    }
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(g_tEvent.ON_SDK_PAY_BACK, function (t) {
                  switch (t) {
                    case g_tConst.PLAT_PAY_BACK.SUCCESS:
                      break;
                    case g_tConst.PLAT_PAY_BACK.CANCLE:
                      e._ZFSopDownTimer = !1;
                  }
                }),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GET_AWARD_NEW_WEEKLY_CARD,
                  function (t) {
                    console.log("lqr...", "\u65b0\u5468\u5361\u6570\u636e", t);
                    var i = t.turnTableAwards,
                      a = t.award,
                      n = g_oData
                        .get(g_tData.SlyderWeeklyCardModel)
                        .getCfgBySubEffectId(t.subEffectId);
                    if (n) {
                      var s = e,
                        r = e.checkZcoinCardByCfg(n),
                        c =
                          (e._serverTime,
                          function () {
                            var e = o.isOnGameScene(),
                              t = a.concat(i);
                            s.showGetAward(t, !e, r, function () {});
                          });
                      e._isGameOver
                        ? c()
                        : e.slyderView.playAnim(n, i, function () {
                            c();
                          });
                    }
                  },
                  this,
                ),
              ));
          },
          onCustomEvent: function () {
            ((this._isGameOver = !1),
              this.node.on(
                "ON_INIT",
                function (e) {
                  ((this._isGameOver = !1),
                    (this._closeCallBack = e.closeCallBack),
                    (this.toggleType = e.toggleType),
                    this.onInit(!0));
                }.bind(this),
              ),
              this.node.on(
                "ON_INIT_GAME_OVER",
                function (e) {
                  ((this._isGameOver = !0),
                    (this._cancelFunc = e.cancelFunc),
                    (this._closeCallBack = e.closeCallBack),
                    (this._closeTime = e.closeTime),
                    (this._viewEndTime = g_oData.get(g_tData.sdkLogin).serverTime),
                    (this._okFunc = e.okFunc),
                    this.onInit(!0),
                    this.startDowmTimer());
                }.bind(this),
              ));
          },
          onInit: function (e) {
            (void 0 === e && (e = !1),
              o.getServerTime(
                function (t) {
                  ((this._serverTime = t), this._initViewType(e));
                }.bind(this),
              ));
          },
          onClickDailyBag: function () {
            g_oData.get(g_tData.SlyderWeeklyCardModel).reqDailyBag();
          },
          onClickToggle: function (e, t) {
            ((this._viewType = t), this._initMainView());
          },
          onClickItemBtnGetAward: function (e) {
            var t = e.node._cfg,
              i = (e.node._info, e.node._buyInfo, this),
              a = function () {
                ((i._itemBtnGetAward = null), i.slyderView.onSlyderPreViewNormal(t));
              }.bind(this);
            this._itemBtnGetAward = a;
            var n = this._serverTime,
              s = g_oData.get(g_tData.SlyderWeeklyCardModel).checkBuyCardByItemId(t.itemId);
            if (s)
              if (i.getDayByDate(s.iExpireTime) - i.getDayByDate(n) - 1 > 0) {
                console.warn("lqr...", "\u5468\u5361\u62c9\u8d77\u8ba2\u9605");
                var r = o.getTodayStr();
                cc.sys.localStorage.getItem("dyWeeklyCard") !== r
                  ? (cc.sys.localStorage.setItem("dyWeeklyCard", r),
                    i.getGameSetting(function () {
                      i.clickYyBtn();
                    }))
                  : a && a();
              } else (console.log("lqr...", "\u5468\u5361\u8df3\u8fc7\u8ba2\u9605"), a && a());
            else a && a();
          },
          onClickSlyderPreview: function (e) {
            var t = e.node,
              i = t.convertToWorldSpaceAR(cc.v2(0, 0)),
              a = t._cfg;
            this.slyderView.onSlyderPreView(a, i);
          },
          close: function () {
            (this._super(),
              this.stopDowmTimer(),
              this._closeCallBack &&
                (this._closeTime
                  ? this._closeCallBack(this._closeTime - this.count)
                  : this._closeCallBack(),
                (this._closeCallBack = null)));
          },
          _initViewType: function (e) {
            if ((void 0 === e && (e = !1), !e)) return this._initMainView();
            if (
              ((this.typeToggleContainer = this.node.getChildByName("typeToggleContainer")),
              this._isGameOver)
            ) {
              this.typeToggleContainer.active = !1;
              for (
                var t = g_oData.get(g_tData.mod_DataCom).getCurrSelectScene(),
                  i = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType(),
                  a = g_oData.get(g_tData.SlyderWeeklyCardModel).UserBuyWeekCard,
                  o = 0;
                o < i.length;
                o++
              ) {
                var n = g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(i[o]);
                if (n && n.poChan)
                  for (var s = 0; s < n.poChan.length; s++)
                    if (n.poChan[s] == t) {
                      for (var r = !1, c = 0; c < a.length; c++)
                        a[c].itemID == n.itemID && (r = !0);
                      r || (this.gameOverShowEffectId = i[o]);
                    }
              }
              if (this.gameOverShowEffectId) {
                for (
                  var l = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType("zCoin"),
                    g = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType("coin"),
                    d = 0;
                  d < l.length;
                  d++
                )
                  l[d] == this.gameOverShowEffectId && (this._viewType = "zCoin");
                for (var h = 0; h < g.length; h++)
                  g[h] == this.gameOverShowEffectId && (this._viewType = "coin");
              } else console.error("lqr...", "\u5468\u5361\u7834\u4ea7\u5f39\u51fa\u51fa\u9519", t);
              "zCoin" == this._viewType
                ? ((this._viewType = "zCoin"),
                  this.typeToggleContainer.children[0].getComponent(cc.Toggle).check(),
                  this._initMainView())
                : "coin" == this._viewType &&
                  this.typeToggleContainer.children[1].getComponent(cc.Toggle).check();
            } else if ("true" != g_oData.get(g_tData.SwitchModel).getWeekCard().mainShow) {
              this._activeOver = !0;
              var u = !1,
                _ = !1,
                m = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType("zCoin"),
                f = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType("coin");
              ((this._buyZcoinSubEffectIdList = []), (this._buyCoinSubEffectIdList = []));
              for (var p = 0; p < m.length; p++) {
                var C = m[p],
                  v = g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(C);
                v &&
                  g_oData.get(g_tData.SlyderWeeklyCardModel).checkBuyCardByItemId(v.itemId) &&
                  ((u = !0), this._buyZcoinSubEffectIdList.push(C));
              }
              for (var y = 0; y < f.length; y++) {
                var S = f[y],
                  D = g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(S);
                D &&
                  g_oData.get(g_tData.SlyderWeeklyCardModel).checkBuyCardByItemId(D.itemId) &&
                  ((_ = !0), this._buyCoinSubEffectIdList.push(S));
              }
              u && _
                ? "zCoin" == this.toggleType
                  ? ((this._viewType = "zCoin"),
                    this.typeToggleContainer.children[0].getComponent(cc.Toggle).check(),
                    this._initMainView())
                  : "coin" == this.toggleType &&
                    ((this._viewType = "coin"),
                    this.typeToggleContainer.children[1].getComponent(cc.Toggle).check())
                : u && !_
                  ? ((this._viewType = "zCoin"),
                    this.typeToggleContainer.children[0].getComponent(cc.Toggle).check(),
                    this._initMainView(),
                    (this.typeToggleContainer.active = !1))
                  : !u && _
                    ? ((this.typeToggleContainer.active = !1),
                      (this._viewType = "coin"),
                      this.typeToggleContainer.children[1].getComponent(cc.Toggle).check(),
                      this._initMainView())
                    : (this.typeToggleContainer.active = !1);
            } else
              "zCoin" == this.toggleType
                ? ((this._viewType = "zCoin"),
                  this.typeToggleContainer.children[0].getComponent(cc.Toggle).check(),
                  this._initMainView())
                : (this.toggleType,
                  this.typeToggleContainer.children[1].getComponent(cc.Toggle).check());
          },
          _initMainView: function () {
            var e = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType(this._viewType),
              t = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType("zCoin"),
              i = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType("coin");
            this.typeToggleContainer.children[0].getChildByName("red_icon").active = !1;
            for (var a = 0, n = 0, s = 0; s < t.length; s++) {
              var r = t[s],
                c = g_oData.get(g_tData.SlyderWeeklyCardModel).getInfoBySubEffectId(r),
                l = g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(r);
              if (l) {
                var g = (c && c.revTimes) || 0,
                  d = g_oData.get(g_tData.SlyderWeeklyCardModel).checkBuyCardByItemId(l.itemId);
                (l.dailyTimes - g > 0 &&
                  d &&
                  (this.typeToggleContainer.children[0].getChildByName("red_icon").active = !0),
                  d && a++);
              }
            }
            this.typeToggleContainer.children[1].getChildByName("red_icon").active = !1;
            for (var h = 0; h < i.length; h++) {
              var u = i[h],
                _ = g_oData.get(g_tData.SlyderWeeklyCardModel).getInfoBySubEffectId(u),
                m = g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(u);
              if (m) {
                var f = (_ && _.revTimes) || 0,
                  p = g_oData.get(g_tData.SlyderWeeklyCardModel).checkBuyCardByItemId(m.itemId);
                (m.dailyTimes - f > 0 &&
                  p &&
                  (this.typeToggleContainer.children[1].getChildByName("red_icon").active = !0),
                  p && n++);
              }
            }
            for (
              var C = this.node.getChildByName("main"),
                v =
                  (this.node.getChildByName("dailyBag").getChildByName("dailyBagRed"),
                  C.getChildByName("strLayout").getChildByName("labDesc")),
                y = C.getChildByName("uiScrollView"),
                S = C.getChildByName("ui_layer"),
                D = y.getComponent(cc.ScrollView).content,
                T = C.getChildByName("labelDownTimer"),
                I = function (e, t, i, a) {
                  var n = g_oData.get(g_tData.SlyderWeeklyCardModel).getInfoBySubEffectId(t),
                    s = g_oData.get(g_tData.SlyderWeeklyCardModel).checkBuyCardByItemId(i.itemId),
                    r = g_oData.get(g_tData.SlyderWeeklyCardModel).getGoodsInfo(i.itemId),
                    c = (n && n.revTimes) || 0,
                    l = e.getChildByName("spr_plate"),
                    g = l.getChildByName("descNode"),
                    d = e.getChildByName("itemTitleBg");
                  ("zCoin" == this._viewType
                    ? ((e.getChildByName("icon_bag").active = !0),
                      (e.getChildByName("icon_bag2").active = !1),
                      (e.getChildByName("iconGold").active = !0),
                      (e.getChildByName("iconGold3").active = !1),
                      (g.getChildByName("iconGold").active = !0),
                      (g.getChildByName("iconCoin").active = !1),
                      (d.getChildByName("iconGold").active = !0),
                      (d.getChildByName("iconCoin").active = !1))
                    : "coin" == this._viewType &&
                      ((e.getChildByName("icon_bag").active = !1),
                      (e.getChildByName("icon_bag2").active = !0),
                      (e.getChildByName("iconGold").active = !1),
                      (e.getChildByName("iconGold3").active = !0),
                      (g.getChildByName("iconGold").active = !1),
                      (g.getChildByName("iconCoin").active = !0),
                      (d.getChildByName("iconGold").active = !1),
                      (d.getChildByName("iconCoin").active = !0)),
                    (e.getChildByName("icon_discount").active = !1));
                  var h = e.getChildByName("btnGetAward"),
                    u = e.getChildByName("btnGray"),
                    _ = e.getChildByName("btnBuy"),
                    m = e.getChildByName("lab_time"),
                    f = e.getChildByName("labGoldNum2");
                  m.getComponent(cc.Label).string =
                    "\u6bcf\u65e5\u8d60\u9001" + i.dailyTimes + "\u6b21";
                  var p = l.getChildByName("labDesc2"),
                    C = g.getChildByName("labNum"),
                    v = e.getChildByName("labGoldNum"),
                    y = d.getChildByName("labNum"),
                    S = i.dailyAward[0];
                  S.type == g_tConst.GameConfig.ItemType.ZCoin
                    ? (v.getComponent(cc.Label).string = o.translateCoinStr(o.initProCoin(S.num)))
                    : S.type == g_tConst.GameConfig.ItemType.GoldCard &&
                      (v.getComponent(cc.Label).string = o.translateCoinStr(o.initProCoin(S.num)));
                  var D = i.immediateAward[0];
                  if (
                    (D.type == g_tConst.GameConfig.ItemType.ZCoin
                      ? (y.getComponent(cc.Label).string =
                          "x" + o.translateCoinStr(o.initProCoin(D.num)))
                      : D.type == g_tConst.GameConfig.ItemType.GoldCard &&
                        (y.getComponent(cc.Label).string =
                          "x" + o.translateCoinStr(o.initProCoin(D.num))),
                    s)
                  ) {
                    ((e.zIndex = a + 1),
                      (_.active = !1),
                      (e.getChildByName("itemDownTimerBg").active = !0),
                      (e.getChildByName("itemTitleBg").active = !1),
                      (e.getChildByName("pic_10").active = !0),
                      i.dailyTimes <= c
                        ? ((u.active = !0), (h.active = !1))
                        : ((h.active = !0),
                          (u.active = !1),
                          (h._info = n),
                          (h._buyInfo = s),
                          (h._cfg = i),
                          h.off("click", this.onClickItemBtnGetAward, this),
                          h.on("click", this.onClickItemBtnGetAward, this),
                          (h
                            .getChildByName("labLayout")
                            .getChildByName("lab_times")
                            .getComponent(cc.Label).string =
                            "\uff08\u5269" + (i.dailyTimes - c) + "\u6b21\uff09")));
                    var T =
                        this.getDayByDate(s.iExpireTime) - this.getDayByDate(this._serverTime) - 1,
                      I = 24 - new Date(1e3 * this._serverTime).getHours();
                    e
                      .getChildByName("itemDownTimerBg")
                      .getChildByName("labDownTimer")
                      .getComponent(cc.Label).string =
                      T + "\u5929" + I + "\u5c0f\u65f6\u540e\u5230\u671f";
                    var M = Number(S.num * (i.dailyTimes * T + i.dailyTimes - c));
                    C.getComponent(cc.Label).string = "x" + o.translateCoinStr(o.initProCoin(M));
                    var L = this.checkZcoinCardByCfg(i);
                    p.getComponent(cc.Label).string = L
                      ? "\u6bcf\u65e5\u76f4\u901a" + E[a] + "\u573a"
                      : Number(i.dailyTimes * T + i.dailyTimes - c) +
                        "\u6b21" +
                        E[a] +
                        "\u8f6c\u76d8";
                  } else {
                    ((e.zIndex = 10 * (a + 1)),
                      (h.active = !1),
                      (_.active = !0),
                      (e.getChildByName("itemDownTimerBg").active = !1),
                      (e.getChildByName("itemTitleBg").active = !0),
                      (e.getChildByName("pic_10").active = !1),
                      (u.active = !1));
                    var A = Number(D.num) + Number(S.num * i.dailyTimes * 7);
                    C.getComponent(cc.Label).string = "x" + o.translateCoinStr(o.initProCoin(A));
                    var P = this.checkZcoinCardByCfg(i);
                    ((p.getComponent(cc.Label).string = P
                      ? "\u6bcf\u65e5\u76f4\u901a" + E[a] + "\u573a"
                      : Number(7 * i.dailyTimes) + "\u6b21" + E[a] + "\u8f6c\u76d8"),
                      r &&
                        (_.off("click", this.onClickBtnBuy, this),
                        _.on("click", this.onClickBtnBuy, this),
                        (_.goodsInfo = r),
                        (_.getChildByName("lab_money").getComponent(cc.Label).string =
                          r.price + "\u5143\u8d2d\u4e70"),
                        (_.getChildByName("lab_oldMoney").getComponent(cc.Label).string =
                          "\u539f\u4ef7" + i.originPrice + "\u5143")));
                  }
                  var N = e.getChildByName("itemBg2_2");
                  ((N._cfg = i),
                    N.off("click", this.onClickSlyderPreview, this),
                    N.on("click", this.onClickSlyderPreview, this),
                    (f.getComponent(cc.Label).string = E[a] + "\u8f6c\u76d8"));
                }.bind(this),
                E = ["\u521d\u7ea7", "\u8fdb\u9636", "\u9ad8\u7ea7", "\u5927\u5e08"],
                M = 0;
              M < D.children.length;
              M++
            ) {
              var L = D.getChildByName("item" + M),
                A = e[M],
                P = g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(A);
              if (P)
                if (this._isGameOver && this.gameOverShowEffectId && A != this.gameOverShowEffectId)
                  L.active = !1;
                else {
                  if (this._activeOver) {
                    var N = !1;
                    if ("zCoin" == this._viewType)
                      for (var w = 0; w < this._buyZcoinSubEffectIdList.length; w++)
                        this._buyZcoinSubEffectIdList[w] == A && (N = !0);
                    else if ("coin" == this._viewType)
                      for (var R = 0; R < this._buyCoinSubEffectIdList.length; R++)
                        this._buyCoinSubEffectIdList[R] == A && (N = !0);
                    if (!N) {
                      L.active = !1;
                      continue;
                    }
                  }
                  ((L.active = !0), I(L, A, P, M));
                }
              else L.active = !1;
            }
            if ((S.removeAllChildren(), this._isGameOver || this._activeOver)) {
              for (var b = 0, G = 0; G < D.children.length; G++) D.children[G].active && b++;
              if (b > 3);
              else
                for (var k = 0; k < D.children.length; k++) {
                  var B = D.getChildByName("item" + k);
                  if (B.active) {
                    var F = cc.instantiate(B);
                    F.parent = S;
                    var x = e[k];
                    (I(F, x, g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(x), k),
                      (B.active = !1));
                  }
                }
            }
            "zCoin" == this._viewType
              ? (this._buyTimes = a)
              : "coin" == this._viewType && (this._buyTimes = n);
            var O = g_oData.get(g_tData.SwitchModel).getWeekCard();
            ((v.getComponent(cc.Label).string =
              "\u4ee5\u4e0b\u793c\u5305\u6700\u591a\u8d2d\u4e70" +
              O.totalBuy +
              "\u4e2a\uff08" +
              this._buyTimes +
              "/" +
              O.totalBuy +
              "\uff09\u4e2a"),
              (C.getChildByName("title").active = !this._isGameOver),
              (C.getChildByName("title2").active = this._isGameOver));
            var H = g_oData.get(g_tData.SlyderWeeklyCardModel).DailyBagRed;
            ((this.node.getChildByName("dailyBag").active = H),
              (this._isGameOver || this._activeOver) &&
                (this.node.getChildByName("dailyBag").active = !1),
              (T.active = this._isGameOver));
          },
          getDayByDate: function (e) {
            var t = (1e3 * (e + 28800)) / 864e5;
            return Math.floor(t);
          },
          onClickClose: function () {
            this.close();
          },
          onClickBtnBuy: function (e) {
            var t = g_oData.get(g_tData.SwitchModel).getWeekCard();
            if (this._buyTimes && this._buyTimes >= t.totalBuy)
              g_oPlatform.doAction(
                g_tConst.tPlatActionId.actionShowToast,
                "\u8d2d\u4e70\u5931\u8d25\uff0c\u540c\u65f6\u6301\u6709\u7684\u5468\u5361\u5df2\u8d85\u51fa" +
                  t.totalBuy +
                  "\u5f20\u4e0a\u9650",
              );
            else {
              var i = e.node.goodsInfo;
              g_oData.get(g_tData.sdkLogin).checkLogin(
                function () {
                  this.zfItem(i);
                }.bind(this),
              );
            }
          },
          onClickBtnGray: function () {
            g_oPlatform.doAction(
              g_tConst.tPlatActionId.actionShowToast,
              "\u660e\u5929\u518d\u6765",
            );
          },
          zfItem: function (e) {
            ((this._ZFSopDownTimer = !0), console.warn("lqr...", e.goodsid));
            var t = e.goodsdesc,
              i = [];
            (i.push({
              type: g_tConst.GameConfig.GiftBagIcon.WeeklyCard,
              desc: e.goodsdesc,
              num: 1,
            }),
              n.zfItem(e, g_tConst.PaySceneId.paySceneIDWeeklyCard, {
                customService: { payType: "zcoin", addDesc: t },
                payForAnother: {
                  giftInfo: { giftName: e.goodsname, giftPrice: e.price, goodsInfoArr: i },
                },
              }));
          },
          startDowmTimer: function () {
            ((this.count = 0),
              (this._ZFSopDownTimer = !1),
              (this.callback = function () {
                if (!this._ZFSopDownTimer) {
                  ((this.count = g_oData.get(g_tData.sdkLogin).serverTime - this._viewEndTime),
                    g_oData.get(g_tData.sdkLogin).serverTime >= this._viewEndTime + 30 &&
                      this._cancelFunc &&
                      (this._cancelFunc(), (this._closeCallBack = null)),
                    g_oData.get(g_tData.sdkLogin).serverTime >= this._viewEndTime + 15 &&
                      (this.stopDowmTimer(), this.close()));
                  var e = 15 - this.count;
                  (e < 0 && (e = 0),
                    (this.node
                      .getChildByName("main")
                      .getChildByName("labelDownTimer")
                      .getComponent(cc.Label).string = "\u5012\u8ba1\u65f6\uff1a" + e + "s"));
                }
              }),
              this.schedule(this.callback, 1));
          },
          stopDowmTimer: function () {
            this.callback && (this.unschedule(this.callback), (this.callback = null));
          },
          showGetAward: function (e, t, i, n) {
            (void 0 === t && (t = !1), void 0 === i && (i = !0));
            var s = this,
              r = null,
              c = null;
            if (
              (t &&
                ((r = function () {
                  s._quickStart(!0);
                }),
                (c = a.getRecommendSceneCfg(g_tConst.GameTypeCfgs.SESXMJ.TYPEID).fullDesc)),
              i || ((c = null), (r = null)),
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.GetAward.id, "onInit", {
                data: e,
                showQuickStartAndClose: !0,
                quickStartStr: c,
                quickStartCb: r,
                closeCb: function () {
                  n && n();
                },
              }),
              this._isGameOver)
            )
              ((this._closeCallBack = null), this._okFunc(), this.close());
            else {
              var l = a.getRecommendSceneCfg(),
                g = o.Long2Number(l.enterFingerCoinLower),
                d = g_oData.get(g_tData.sdkUser);
              o.Long2Number(d.fingerCoin) >= g && (this._closeCallBack = null);
            }
          },
          _quickStart: function (e) {
            (1 == g_oData.get(g_tData.SwitchModel).getMjQuickStartCfg() &&
              (g_oData.get(g_tData.SectionMatchMod).isSectionMatchState = !0),
              e ? a.quickStart(!0, g_tConst.GameTypeCfgs.SESXMJ.TYPEID) : a.quickStart(!0));
          },
          checkZcoinCardByCfg: function (e) {
            for (
              var t = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType("zCoin"),
                i = 0;
              i < t.length;
              i++
            ) {
              var a = t[i];
              if (
                g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(a).itemId == e.itemId
              )
                return !0;
            }
            return !1;
          },
          getGameSetting: function (e) {
            if (((this._subscribeMainSwitchOn = !1), cc.sys.platform === cc.sys.WECHAT_GAME)) {
              console.info("edwin getGameSetting");
              var t = this;
              wx.getSetting({
                withSubscriptions: !0,
                success: function (i) {
                  (console.log("edwin getGameSetting success: " + JSON.stringify(i)),
                    i.subscriptionsSetting
                      ? ((t._subscribeMainSwitchOn = i.subscriptionsSetting.mainSwitch),
                        console.info(
                          "edwin reset _subscribeMainSwitchOn: " + t._subscribeMainSwitchOn,
                        ))
                      : console.error("edwin subscriptionsSetting is null", JSON.stringify(i)),
                    e && e());
                },
                fail: function (t) {
                  (console.error("edwin fatch game setting failed! ", JSON.stringify(t)), e && e());
                },
              });
            } else e && e();
          },
          clickYyBtn: function () {
            if (cc.sys.platform === cc.sys.WECHAT_GAME) {
              if (
                (console.warn(
                  "lqr...",
                  g_oPlatform.getChannel().replace(".", ""),
                  g_tConst.WeeklyCardTmplIds,
                ),
                !g_tConst.WeeklyCardTmplIds[g_oPlatform.getChannel().replace(".", "")])
              )
                return;
              g_oData
                .get(g_tData.gameReportData)
                .reportClickAction(g_tConst.ReportCfg.ClickActionReport.ClickSubscribeRichGift);
              var e = this;
              if (
                (console.info("edwin check _subscribeMainSwitchOn: " + e._subscribeMainSwitchOn),
                !e._subscribeMainSwitchOn)
              )
                return void this.askForSwitchOn();
              g_oPlatform.showModal(
                {
                  title: "\u6e29\u99a8\u63d0\u793a",
                  content:
                    "\u60a8\u672a\u5f00\u542f\u63a5\u6536\u8ba2\u9605\u6d88\u606f\uff0c\u9700\u8981\u60a8\u5f00\u542f\u6b64\u529f\u80fd",
                  showCancel: !0,
                  cancelText: "\u62d2\u7edd",
                  confirmText: "\u540c\u610f",
                },
                function () {
                  wx.requestSubscribeMessage({
                    tmplIds:
                      [g_tConst.WeeklyCardTmplIds[g_oPlatform.getChannel().replace(".", "")]] || "",
                    success: function (t) {
                      if (
                        (console.info(
                          "edwin requestSubscribeMessage success: " + JSON.stringify(t),
                        ),
                        t)
                      ) {
                        var i =
                          t[
                            g_tConst.WeeklyCardTmplIds[g_oPlatform.getChannel().replace(".", "")]
                          ] || "";
                        "accept" == i
                          ? e.subscribeMessageReport()
                          : "reject" == i
                            ? wx.showToast({
                                title: "\u9884\u7ea6\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5",
                                icon: "none",
                              })
                            : "ban" == i &&
                              wx.showToast({
                                title:
                                  "\u9884\u7ea6\u5931\u8d25\uff0c\u672a\u5f00\u542f\u793c\u5305\u9886\u53d6\u63d0\u9192",
                                icon: "none",
                              });
                      }
                    },
                    fail: function (e) {
                      console.info("edwin requestSubscribeMessage failed: " + JSON.stringify(e));
                      var t = "\u9884\u7ea6\u5931\u8d25\uff0c\u8bf7\u91cd\u8bd5";
                      if (e)
                        switch (e.errCode) {
                          case 20004:
                            t =
                              "\u9884\u7ea6\u5931\u8d25\uff0c\u672a\u5f00\u542f\u6d88\u606f\u8ba2\u9605\u529f\u80fd";
                        }
                      wx.showToast({ title: t, icon: "none" });
                    },
                  });
                },
                function () {
                  console.info("\u7528\u6237\u53d6\u6d88\u8ba2\u9605");
                },
              );
            }
          },
          askForSwitchOn: function () {
            g_oPlatform.showModal(
              {
                title: "\u6e29\u99a8\u63d0\u793a",
                content:
                  "\u60a8\u672a\u5f00\u542f\u63a5\u6536\u8ba2\u9605\u6d88\u606f\uff0c\u9700\u8981\u60a8\u5f00\u542f\u6b64\u529f\u80fd",
                showCancel: !0,
                cancelText: "\u62d2\u7edd",
                confirmText: "\u540c\u610f",
              },
              this.agreeSwichOn.bind(this),
              this.denineSwitchOn.bind(this),
            );
          },
          agreeSwichOn: function () {
            this._subscribeMainSwitchOn = !0;
            var e = this;
            wx.openSetting({
              success: function (t) {
                (console.log("edwin openSetting success ", JSON.stringify(t)),
                  e._itemBtnGetAward && e._itemBtnGetAward());
              },
            });
          },
          denineSwitchOn: function () {
            this._itemBtnGetAward && this._itemBtnGetAward();
          },
          subscribeMessageReport: function () {
            var e = this,
              t = "https://support.365you.com/wx/csv/receiveSubscribeMsg",
              i = [g_tConst.WeeklyCardTmplIds[g_oPlatform.getChannel().replace(".", "")] || ""],
              a = g_oPlatform.getGameId(),
              o = g_oData.get(g_tData.mod_gamecfg).getWxAppId(),
              n = g_oPlatform.getOpenId(),
              s = g_oPlatform.getChannel(),
              r = g_oPlatform.getUserId(),
              c = { MsgType: "subscribe", FromUserName: n, wxAppId: o, gameId: a, tmplIds: i };
            (console.log("edwin userId: " + r + " channel: " + s),
              console.log("edwin subscribe report data: " + JSON.stringify(c)),
              e.httpPost(t, c, function (i) {
                var a = JSON.parse(i);
                (console.log("edwin response from " + t + ": " + JSON.stringify(a)),
                  e._itemBtnGetAward && e._itemBtnGetAward(),
                  a.ret && 1 == a.ret
                    ? (g_oPlatform.doAction(
                        g_tConst.tPlatActionId.actionShowToast,
                        "\u8ba2\u9605\u6210\u529f!",
                      ),
                      g_oData
                        .get(g_tData.SubscribeModel)
                        .reqReportSubscribe(
                          s,
                          g_tConst.WeeklyCardTmplIds[g_oPlatform.getChannel().replace(".", "")] ||
                            "",
                        ))
                    : console.log("edwin request " + t + " failed: " + JSON.stringify(a)));
              }));
          },
          httpPost: function (e, t, i) {
            console.info("edwin do httpPost");
            var a = function (e, t) {
                i && i(e, t);
              },
              o = new XMLHttpRequest();
            (o.open("POST", e, !0),
              (o.onload = function () {
                if (
                  (console.log("edwin request response: " + JSON.stringify(o)), 200 == o.status)
                ) {
                  var t = o.responseText;
                  (console.info("edwin request success: " + e),
                    console.log("edwin responseText: " + t),
                    a(t, !0));
                }
              }),
              (o.onerror = function (e) {
                (console.error(e), a("{}", !1));
              }),
              o.setRequestHeader("Content-Type", "application/json"),
              o.send(t));
          },
        }),
          cc._RF.pop());
      },
      {
        AlertDlgBaseView: "AlertDlgBaseView",
        CommonSDK: "CommonSDK",
        CommonUtils: "CommonUtils",
        QuikStart: "QuikStart",
      },
    ],
