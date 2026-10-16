    WeeklyCardView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "3ff86Ua8Y1Gx6VPDb5zCtXx", "WeeklyCardView");
        var i = e("AlertDlgBaseView"),
          a = e("QuikStart"),
          o = e("CommonUtils"),
          n = (e("HonorPrivilegeZFLogic"), e("CommonSDK"));
        (cc.Class({
          extends: i,
          properties: {},
          Awake: function () {
            ((this._closeReleaseRes = !0),
              this.onMessageEvent(),
              this.onCustomEvent(),
              g_oData.get(g_tData.WeeklyCardLayerModel).reqGetPersonMsg());
          },
          onMessageEvent: function () {
            var e = this;
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.GET_WEEKLY_CARD_DATA,
                function () {
                  e.onInit();
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GET_WEEKLY_CARD_CFG,
                  function () {
                    e.onInit();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.BUY_WEEKLY_CARD_FINISH,
                  function () {
                    if ((e.onInit(), null != e._getAwayIndex)) {
                      var t = e.weekCardCfg[e._getAwayIndex],
                        i = [{ type: g_tConst.GameConfig.ItemType.ZCoin, count: t.everyTimesNum }],
                        a = o.isOnGameScene();
                      e.showGetAward(i, !a);
                    }
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GAME_PLAT_NOTIFY_PAY_RST,
                  function (e) {
                    var t = e.itemId;
                    if (this.goodsList)
                      for (var i = 0; i < this.goodsList.length; i++)
                        if (this.goodsList[i].goodsid == t) {
                          g_oData.get(g_tData.WeeklyCardLayerModel).reqGetPersonMsg();
                          var a = g_oData.get(g_tData.WeeklyCardLayerModel).getItemIndexByPayID(t),
                            n = this.weekCardCfg[a],
                            s = [
                              {
                                type: g_tConst.GameConfig.ItemType.ZCoin,
                                count: n.immediateArrivalNum,
                              },
                            ],
                            r = o.isOnGameScene();
                          (this.showGetAward(s, !r),
                            this._isGameOver
                              ? g_oData
                                  .get(g_tData.WeeklyCardLayerModel)
                                  .report("WeeklyCardBuybankruptcy", "buy" + t)
                              : g_oData
                                  .get(g_tData.WeeklyCardLayerModel)
                                  .report("WeeklyCardBuynormal", "buy" + t));
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
              ));
          },
          onCustomEvent: function () {
            ((this._isGameOver = !1),
              this.node.on(
                "ON_INIT",
                function (e) {
                  ((this._isGameOver = !1), (this._closeCallBack = e.closeCallBack), this.onInit());
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
                    this.onInit(),
                    this.startDowmTimer());
                }.bind(this),
              ));
          },
          onInit: function () {
            o.getServerTime(
              function (e) {
                this.init(e);
              }.bind(this),
            );
          },
          init: function (e) {
            var t = g_oData.get(g_tData.WeeklyCardLayerModel).getUserWeekCard(),
              i = g_oData.get(g_tData.WeeklyCardLayerModel).getWeekCardCfg(),
              a = g_oData.get(g_tData.WeeklyCardLayerModel).getGoodsList();
            if (t && i) {
              ((this.userWeekCard = t), (this.weekCardCfg = i), (this.goodsList = a));
              var n = this.node.getChildByName("main");
              ((n.getChildByName("title").active = !this._isGameOver),
                (n.getChildByName("title2").active = this._isGameOver),
                (n.getChildByName("title3").active = !this._isGameOver),
                (n.getChildByName("labelDownTimer").active = this._isGameOver));
              for (
                var s = g_oData.get(g_tData.WeeklyCardLayerModel)._checkShowViewItems(),
                  r = [],
                  c = 0;
                c < 3;
                c++
              ) {
                var l = n.getChildByName("item" + c),
                  g = s[c] - 1;
                if (g < 0) l.active = !1;
                else {
                  var d = t[g],
                    h = i[g],
                    u = a[c];
                  if (g_oData.get(g_tData.WeeklyCardLayerModel)._checkShowListByType(s, h.type)) {
                    if (
                      ((l.getChildByName("item_title").active = !this._isGameOver),
                      (l.getChildByName("item_title2").active = this._isGameOver),
                      (l.active = !0),
                      this._isGameOver)
                    ) {
                      g_oData.get(g_tData.mod_ZFLogic).isInGame();
                      for (
                        var _ = g_oData.get(g_tData.mod_DataCom).getCurrSelectScene(),
                          m = (g_oData.get(g_tData.com_CrazyZFMod).isSupportSceneID(_), !1),
                          f = 0;
                        f < h.poChan.length;
                        f++
                      )
                        h.poChan[f] == _ && (m = !0);
                      if (!m) {
                        l.active = !1;
                        continue;
                      }
                      l.x = 0;
                    }
                    l.active && r.push(l);
                    var p = l.getChildByName("btnGray"),
                      C = l.getChildByName("btnBuy"),
                      v = C.getChildByName("lab_money"),
                      y = C.getChildByName("labGetAway"),
                      S = C.getChildByName("lab_oldMoney"),
                      D = l.getChildByName("itemTitleBg"),
                      T = l.getChildByName("itemDownTimerBg"),
                      I = D.getChildByName("labNum"),
                      E = l
                        .getChildByName("spr_plate")
                        .getChildByName("descNode")
                        .getChildByName("labDesc1"),
                      M = l.getChildByName("spr_plate").getChildByName("iconUse"),
                      L = l
                        .getChildByName("spr_plate")
                        .getChildByName("descNode")
                        .getChildByName("labNum"),
                      A = l.getChildByName("icon_discount"),
                      P = A.getChildByName("lab_discount"),
                      N = l.getChildByName("lab_time"),
                      w = l.getChildByName("labGoldNum");
                    ((C._index = g),
                      (C._zfIndex = c),
                      (C._cardCfg = h),
                      C.on("click", this.onClickBtnBuy, this),
                      p.on("click", this.onClickBtnGray, this));
                    var R = void 0,
                      b = h.everyDayTimes,
                      G = h.immediateArrivalNum,
                      k = h.everyTimesNum;
                    if (d.status) {
                      var B = h.everyDayTimes - d.receiveTimes;
                      (B > 0
                        ? ((C.active = !0),
                          (p.active = !1),
                          (y.active = !0),
                          (v.active = !1),
                          (S.active = !1),
                          (C._type = 1),
                          (y.getComponent(cc.Label).string =
                            "\u9886\u53d6\u5956\u52b1(" + B + "\u6b21)"))
                        : ((C.active = !1), (p.active = !0), (C._type = 2)),
                        (M.active = !0),
                        (A.active = !1),
                        (D.active = !1),
                        (T.active = !0));
                      var F = this.getDayByDate(e),
                        x = this.getDayByDate(d.buyTime),
                        O = h.duration - (F - x + 1);
                      O < 0 && (O = 0);
                      var H = 24 - new Date(1e3 * e).getHours();
                      ((T.getChildByName("labDownTimer").getComponent(cc.Label).string =
                        O + "\u5929" + H + "\u5c0f\u65f6\u540e\u5230\u671f"),
                        (E.getComponent(cc.Label).string = "\u5269\u4f59"),
                        (R = Number((b - d.receiveTimes + O * b) * k)),
                        (L.getComponent(cc.Label).string =
                          "x" + o.translateCoinStr(o.initProCoin(R))));
                    } else
                      ((M.active = !1),
                        (A.active = !0),
                        (C._type = 3),
                        (C.active = !0),
                        (p.active = !1),
                        (y.active = !1),
                        (v.active = !0),
                        (S.active = !0),
                        (D.active = !0),
                        (T.active = !1),
                        (E.getComponent(cc.Label).string = "\u5171"),
                        (R = Number(G) + Number(h.duration * b * k)),
                        (L.getComponent(cc.Label).string =
                          "x" + o.translateCoinStr(o.initProCoin(R))));
                    ((S.getComponent(cc.Label).string = "\u539f\u4ef7" + h.originPrice + "\u5143"),
                      (N.getComponent(cc.Label).string = "\u6bcf\u65e5\u8d60\u9001" + b + "\u6b21"),
                      (I.getComponent(cc.Label).string =
                        "x" + o.translateCoinStr(o.initProCoin(G))),
                      (w.getComponent(cc.Label).string =
                        "x" + o.translateCoinStr(o.initProCoin(k))),
                      (v.getComponent(cc.Label).string = u.price + "\u5143\u8d2d\u4e70"),
                      (P.getComponent(cc.Label).string =
                        (u.price / h.originPrice).toFixed(2) + "\u6298\u6263"),
                      (u.goodsTotal = R));
                  } else l.active = !1;
                }
              }
              if (2 == r.length)
                for (var U = 0; U < r.length; U++) {
                  r[U].x = 0 == U ? -200 : 200;
                }
              else if (1 == r.length) r[0].x = 0;
              else if (3 == r.length) for (var V = 0; V < r.length; V++) r[V].x = 350 * V - 350;
            }
          },
          getDayByDate: function (e) {
            var t = (1e3 * (e + 28800)) / 864e5;
            return Math.floor(t);
          },
          getDayByTime: function (e) {
            var t = e / 86400;
            return Math.ceil(t);
          },
          onClickClose: function () {
            this.close();
          },
          onClickBtnBuy: function (e) {
            var t = e.node,
              i = t._zfIndex,
              a = t._cardCfg,
              o = t._index;
            if (1 == this.userWeekCard[o].status)
              ((this._getAwayIndex = o),
                g_oData.get(g_tData.WeeklyCardLayerModel).reqReceiveAward(a.type));
            else {
              var n = this.goodsList[i];
              g_oData.get(g_tData.sdkLogin).checkLogin(
                function () {
                  this.zfItem(n);
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
            this._ZFSopDownTimer = !0;
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
          close: function () {
            (this._super(),
              this.stopDowmTimer(),
              this._closeCallBack &&
                (this._closeTime
                  ? this._closeCallBack(this._closeTime - this.count)
                  : this._closeCallBack(),
                (this._closeCallBack = null)));
          },
          showGetAward: function (e, t) {
            void 0 === t && (t = !1);
            var i = this,
              n = null,
              s = null;
            if (
              (t &&
                ((n = function () {
                  i._quickStart(!0);
                }),
                (s = a.getRecommendSceneCfg(g_tConst.GameTypeCfgs.SESXMJ.TYPEID).fullDesc)),
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.GetAward.id, "onInit", {
                data: e,
                showQuickStartAndClose: !0,
                quickStartStr: s,
                quickStartCb: n,
                closeCb: function () {
                  g_oPlatform.doAction(
                    g_tConst.tPlatActionId.actionShowToast,
                    "\u9886\u53d6\u6210\u529f",
                  );
                },
              }),
              this._isGameOver)
            )
              ((this._closeCallBack = null), this._okFunc(), this.close());
            else {
              var r = a.getRecommendSceneCfg(),
                c = o.Long2Number(r.enterFingerCoinLower),
                l = g_oData.get(g_tData.sdkUser);
              o.Long2Number(l.fingerCoin) >= c && (this._closeCallBack = null);
            }
          },
          _quickStart: function (e) {
            (1 == g_oData.get(g_tData.SwitchModel).getMjQuickStartCfg() &&
              (g_oData.get(g_tData.SectionMatchMod).isSectionMatchState = !0),
              e ? a.quickStart(!0, g_tConst.GameTypeCfgs.SESXMJ.TYPEID) : a.quickStart(!0));
          },
        }),
          cc._RF.pop());
      },
      {
        AlertDlgBaseView: "AlertDlgBaseView",
        CommonSDK: "CommonSDK",
        CommonUtils: "CommonUtils",
        HonorPrivilegeZFLogic: "HonorPrivilegeZFLogic",
        QuikStart: "QuikStart",
      },
    ],
