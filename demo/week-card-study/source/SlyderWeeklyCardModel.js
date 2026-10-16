    SlyderWeeklyCardModel: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "300edkhuPRKJZxZGSn0gCaB", "SlyderWeeklyCardModel");
        var i = e("CommonUtils"),
          a = [],
          o = 12170,
          n = ["PlatEvent.Req_GetUserWeekCardInfo", "PlatEvent.Rsp_GetUserWeekCardInfo"],
          s = 12171,
          r = ["PlatEvent.Req_ReceiveDailyAward", "PlatEvent.Rsp_ReceiveDailyAward"],
          c = null,
          l = null,
          g = null,
          d = [],
          h = !1,
          u = !0,
          _ = 0,
          m = [1712, 1713, 1714, 1715, 1716, 1717, 1718, 1719],
          f = {
            get UserBuyWeekCard() {
              return d;
            },
            get DailyBagRed() {
              return h;
            },
            __onLoadFinish__: function () {
              ((a[0] = g_oProto.loadProtoFile(g_tAsset.WeekCardV2PB.format(ZG_GAME_NAME))),
                g_oEvent.addEventListener(g_tEvent.SDK_GAME_PRIVATE_MSG, function (e, t) {
                  switch (e) {
                    case o:
                      var i = a[0].build(n[1]).decode(t);
                      (0 !== i.code &&
                        console.error("lqr...", "\u65b0\u5468\u5361\u6570\u636e\u95ee\u9898", i),
                        (h = !i.treasureRev),
                        (c = i.dailyRev).sort(
                          function (e, t) {
                            return e.type - t.type;
                          }.bind(this),
                        ),
                        console.log("lqr...\u65b0\u5468\u5361,\u6570\u636e,", i),
                        g_oEvent.dispatchEvent(g_tEvent.GET_NEW_WEEKLY_CARD_DATA, i));
                      break;
                    case s:
                      var l = a[0].build(r[1]).decode(t);
                      (l && 0 == l.code
                        ? g_oEvent.dispatchEvent(g_tEvent.GET_AWARD_NEW_WEEKLY_CARD, l)
                        : (console.warn(
                            "lqr...\u8d2d\u4e70\u65b0\u5468\u5361,\u70b9\u51fb\uff0c\u9886\u53d6\u5956\u52b1\uff0c\u5931\u8d25\u4e86",
                            l,
                          ),
                          g_oEvent.dispatchEvent(g_tEvent.GET_AWARD_NEW_WEEKLY_CARD_ERR, l)),
                        f.reqGetPersonMsg());
                  }
                }),
                this.onMessageEvent(),
                setInterval(this._checkSmallPackTimer.bind(this), 1e3));
            },
            onMessageEvent: function () {
              var e = this;
              (g_oEvent.addEventListener(
                g_tEvent.RSP_GAMEPLAT_PLAT_CFG,
                function () {
                  ((l = g_oData.get(g_tData.mod_gamecfg).getPlatCfgByName("weekCardCfg")),
                    (g = g_oData
                      .get(g_tData.mod_gamecfg)
                      .getPlatCfgByName("weekCardDailyTreasureCfg")),
                    isNull(l) || isNull(g)
                      ? console.error(
                          "lqr...",
                          "\u65b0\u5468\u5361\u914d\u7f6e\u51fa\u95ee\u9898",
                          l,
                          g,
                        )
                      : (console.log("lqr...", "\u65b0\u5468\u5361\u914d\u7f6e", l, g),
                        g_oEvent.dispatchEvent(g_tEvent.GET_NEW_WEEKLY_CARD_CFG)),
                    this.getBuyItemInfo(!1));
                },
                this,
              ),
                g_oEvent.addEventListener(g_tEvent.PLAT_EVENT_GAME_EFFECT_ITEM_UPDATE, function () {
                  e.getBuyItemInfo(!1);
                }));
            },
            getBuyItemInfo: function (e) {
              void 0 === e && (e = !0);
              var t = function (e) {
                i.getServerTime(
                  function (t) {
                    if (l) {
                      d = [];
                      for (var i = 0; i < e.length; i++)
                        for (var a = e[i], o = 0; o < l.length; o++) {
                          var n = l[o];
                          if (n.subEffectId == a.iSubEffect) {
                            for (var s = !0, r = 0; r < d.length; r++) {
                              var c = d[r];
                              c.iSubEffect == a.iSubEffect &&
                                (c.iExpireTime >= a.iExpireTime
                                  ? (s = !1)
                                  : ((a.itemID = n.itemId), (d[r] = a)));
                            }
                            s && t < a.iExpireTime && ((a.itemID = n.itemId), d.push(a));
                          }
                        }
                      (console.log("lqr...", "\u83b7\u53d6\u8d2d\u4e70\u4fe1\u606f", t, d),
                        g_oEvent.dispatchEvent(g_tEvent.BUY_NEW_WEEKLY_CARD_FINISH));
                    }
                  }.bind(this),
                );
              }.bind(this);
              e
                ? g_oData.get(g_tData.mod_GameItem).reqEffectItemInfo()
                : t(g_oData.get(g_tData.mod_GameItem).getEffectListInfo());
            },
            checkBuyCardByItemId: function (e) {
              var t = this.getCfgByItemId(e);
              if (!t) return null;
              for (var i = 0; i < d.length; i++) {
                var a = d[i];
                if (a.iSubEffect == t.subEffectId) return a;
              }
              return null;
            },
            getCfgByItemId: function (e) {
              if (!l) return null;
              for (var t = 0; t < l.length; t++) {
                var i = l[t];
                if (i.itemId == e) return i;
              }
              return null;
            },
            getInfoBySubEffectId: function (e) {
              if (!c) return null;
              for (var t = 0; t < c.length; t++) {
                var i = c[t];
                if (i.subEffectId == e) return i;
              }
              return null;
            },
            getCfgBySubEffectId: function (e) {
              if (!l) return null;
              for (var t = 0; t < l.length; t++) {
                var i = l[t];
                if (i.subEffectId == e) return i;
              }
              return null;
            },
            getSubEffectIdByType: function (e) {
              return "zCoin" == e
                ? [100008, 100009, 100010, 100011]
                : "coin" == e
                  ? [100004, 100005, 100006, 100007]
                  : [100004, 100005, 100006, 100007, 100008, 100009, 100010, 100011];
            },
            initLoginWeekCard: function () {
              (i.getServerTime(
                function (e) {
                  (console.log("lqr...", "_serverTime", e), (_ = Math.ceil((e - 28800) / 86400)));
                }.bind(this),
              ),
                this.getBuyItemInfo(!0),
                this.reqGetPersonMsg());
            },
            reqDailyBag: function () {
              g_oData
                .get(g_tData.GetAwardMod)
                .reqReceiveAward(g_tConst.ReceiveAwardType.WEEK_CARD_V2_DAILY_TREASURE);
            },
            reqGetPersonMsg: function () {
              var e = new (a[0].build(n[0]))();
              g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(o, e);
            },
            reqReceiveAward: function (e) {
              var t = new (a[0].build(r[0]))();
              ((t.subEffectId = e),
                g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(s, t),
                console.log("lqr...\u9886\u53d6\u793c\u5305", t));
            },
            CheckShowIcon: function () {
              if (!c || !l) return !1;
              if (this.getSwitchShow()) return !1;
              if ("true" != g_oData.get(g_tData.SwitchModel).getWeekCard().mainShow) {
                for (
                  var e = !1,
                    t = !1,
                    i = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType("zCoin"),
                    a = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType("coin"),
                    o = 0;
                  o < i.length;
                  o++
                ) {
                  var n = i[o],
                    s = g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(n);
                  s &&
                    g_oData.get(g_tData.SlyderWeeklyCardModel).checkBuyCardByItemId(s.itemId) &&
                    (e = !0);
                }
                for (var r = 0; r < a.length; r++) {
                  var g = a[r],
                    d = g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(g);
                  d &&
                    g_oData.get(g_tData.SlyderWeeklyCardModel).checkBuyCardByItemId(d.itemId) &&
                    (t = !0);
                }
                if (!t && !e) return !1;
              }
              return !0;
            },
            CheckShowIconRedPoint: function () {
              if (!c || !l) return !1;
              if (this.getSwitchShow()) return !1;
              if (h) return !0;
              for (
                var e = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType("zCoin"),
                  t = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType("coin"),
                  i = 0;
                i < e.length;
                i++
              ) {
                var a = e[i],
                  o = g_oData.get(g_tData.SlyderWeeklyCardModel).getInfoBySubEffectId(a),
                  n = g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(a);
                if (n) {
                  var s = (o && o.revTimes) || 0,
                    r = g_oData.get(g_tData.SlyderWeeklyCardModel).checkBuyCardByItemId(n.itemId);
                  if (n.dailyTimes - s > 0 && r) return !0;
                }
              }
              for (var g = 0; g < t.length; g++) {
                var d = t[g],
                  u = g_oData.get(g_tData.SlyderWeeklyCardModel).getInfoBySubEffectId(d),
                  _ = g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(d);
                if (_) {
                  var m = (u && u.revTimes) || 0,
                    f = g_oData.get(g_tData.SlyderWeeklyCardModel).checkBuyCardByItemId(_.itemId);
                  if (_.dailyTimes - m > 0 && f) return !0;
                }
              }
              return !1;
            },
            CheckShowAutoViewByGame: function () {
              if (!c || !l) return !1;
              if (this.getSwitchShow()) return !1;
              if ("true" != g_oData.get(g_tData.SwitchModel).getWeekCard().mainShow) return !1;
              var e = g_oData.get(g_tData.SwitchModel).getWeekCard(),
                t = g_oData.get(g_tData.sdkUser),
                a = i.Long2Number(t.fingerCoin);
              if (u) {
                if (((u = !1), "true" != e.firstShow)) return !1;
                if (d.length > 0) return (this.report("show_firstShowTime", 1), !0);
              }
              if (a < 5e3) {
                if ("true" != e.gameOver) return !1;
                if (d.length <= 0) return (this.report("show_comBackTime", 1), !0);
              }
              if (a < 5e3 && d.length > 0) {
                for (
                  var o = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType("zCoin"),
                    n = g_oData.get(g_tData.SlyderWeeklyCardModel).getSubEffectIdByType("coin"),
                    s = 0;
                  s < o.length;
                  s++
                ) {
                  var r = o[s],
                    g = g_oData.get(g_tData.SlyderWeeklyCardModel).getInfoBySubEffectId(r),
                    h = g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(r);
                  if (h) {
                    var _ = (g && g.revTimes) || 0,
                      m = g_oData.get(g_tData.SlyderWeeklyCardModel).checkBuyCardByItemId(h.itemId);
                    if (h.dailyTimes - _ > 0 && m) return !0;
                  }
                }
                for (var f = 0; f < n.length; f++) {
                  var p = n[f],
                    C = g_oData.get(g_tData.SlyderWeeklyCardModel).getInfoBySubEffectId(p),
                    v = g_oData.get(g_tData.SlyderWeeklyCardModel).getCfgBySubEffectId(p);
                  if (v) {
                    var y = (C && C.revTimes) || 0,
                      S = g_oData.get(g_tData.SlyderWeeklyCardModel).checkBuyCardByItemId(v.itemId);
                    if (v.dailyTimes - y > 0 && S) return !0;
                  }
                }
              }
              return !1;
            },
            CheckShowAutoViewByLogin: function () {
              if (!c || !l) return !1;
              if (this.getSwitchShow()) return !1;
              if ("true" != g_oData.get(g_tData.SwitchModel).getWeekCard().mainShow) return !1;
              var e = g_oData.get(g_tData.sdkUser),
                t = i.Long2Number(e.fingerCoin);
              if (c && u && t < 5e3) {
                if (((u = !1), "true" != g_oData.get(g_tData.SwitchModel).getWeekCard().firstShow))
                  return !1;
                if (d.length <= 0) return (this.report("show_comBackTime", 1), !0);
              }
              return !1;
            },
            CheckShowReviveWeeklyCard: function () {
              if (!c || !l) return !1;
              if ("true" != g_oData.get(g_tData.SwitchModel).getWeekCard().mainShow) return !1;
              if (g_oCommonUtils.isIosSys()) return !1;
              var t = g_oData.get(g_tData.SwitchModel).isOpenServicePay(),
                i = g_oData.get(g_tData.SwitchModel).isOpenPayForAnother();
              if (!t && !i) return !1;
              var a = e("QuikStart").getLastGameType(),
                o = g_oData.get(g_tData.SwitchModel).getWeekCard();
              if (o.playList) {
                for (
                  var n = !1,
                    s = g_oData.get(g_tData.mod_DataCom).getCurrSelectScene(),
                    r = this.getSubEffectIdByType(),
                    g = 0;
                  g < r.length;
                  g++
                ) {
                  var h = this.getCfgBySubEffectId(r[g]);
                  if (h && h.poChan)
                    for (var u = 0; u < h.poChan.length; u++)
                      if (h.poChan[u] == s) {
                        for (var _ = !1, m = 0; m < d.length; m++)
                          d[m].itemID == h.itemId && (_ = !0);
                        _ || (n = !0);
                      }
                }
                if (n)
                  for (var f = 0; f < o.playList.length; f++)
                    if (o.playList[f] == a) return (this.report("show_playListTime" + a, 1), !0);
              }
              return !1;
            },
            CheckShowWeeklyCard: function () {
              if (!c || !l) return !1;
              if (this.getSwitchShow()) return !1;
              if ("true" != g_oData.get(g_tData.SwitchModel).getWeekCard().mainShow) return !1;
              if ("true" != g_oData.get(g_tData.SwitchModel).getWeekCard().zCoinNoEnough) return !1;
              if (l && c) {
                for (
                  var e = g_oData.get(g_tData.mod_DataCom).getCurrSelectScene(),
                    t = this.getSubEffectIdByType("zCoin"),
                    a = !1,
                    o = !1,
                    n = 0;
                  n < t.length;
                  n++
                ) {
                  var s = this.getCfgBySubEffectId(t[n]);
                  if (s) {
                    for (var r = 0; r < s.poChan.length; r++)
                      if (s.poChan[r] == e) {
                        a = !0;
                        for (var g = 0; g < d.length; g++)
                          if (d[g].itemID == s.itemId) {
                            var h = g_oData
                                .get(g_tData.SlyderWeeklyCardModel)
                                .getInfoBySubEffectId(t[n]),
                              u = (h && h.revTimes) || 0;
                            if (s.dailyTimes > u)
                              return (this.report("show_zCoinNoEnoughTime_zCoin", 1), !0);
                          }
                        o = !0;
                      }
                    if (a)
                      for (var m = 0; m < d.length; m++)
                        if (d[m].itemID == s.itemId) {
                          var f = g_oData
                              .get(g_tData.SlyderWeeklyCardModel)
                              .getInfoBySubEffectId(t[n]),
                            p = (f && f.revTimes) || 0;
                          if (s.dailyTimes > p)
                            return (this.report("show_zCoinNoEnoughTime_zCoin", 1), !0);
                        }
                  }
                }
                if (o)
                  return (
                    0 == _ && (_ = i.getTodayStr()),
                    cc.sys.localStorage.getItem("ShowNoBuyZcoinWeeklyCard") != "" + _ &&
                      (cc.sys.localStorage.setItem("ShowNoBuyZcoinWeeklyCard", _),
                      this.report("show_zCoinNoEnoughTime_zCoin", 1),
                      !0)
                  );
              }
              return !1;
            },
            CheckShowWeeklyCardCoin: function () {
              if (!c || !l) return !1;
              if (this.getSwitchShow()) return !1;
              if ("true" != g_oData.get(g_tData.SwitchModel).getWeekCard().mainShow) return !1;
              var e = g_oData.get(g_tData.SwitchModel).getWeekCard();
              if ("true" != e.coinNoEnough) return !1;
              if (l && c) {
                for (
                  var t = g_oData.get(g_tData.mod_DataCom).getCurrSelectScene(),
                    a = this.getSubEffectIdByType("coin"),
                    o = !1,
                    n = !1,
                    s = 0;
                  s < a.length;
                  s++
                ) {
                  var r = this.getCfgBySubEffectId(a[s]);
                  if (r) {
                    for (var g = 0; g < r.poChan.length; g++)
                      if (r.poChan[g] == t) {
                        o = !0;
                        for (var h = 0; h < d.length; h++)
                          if (d[h].itemID == r.itemId) {
                            var u = g_oData
                                .get(g_tData.SlyderWeeklyCardModel)
                                .getInfoBySubEffectId(a[s]),
                              m = (u && u.revTimes) || 0;
                            if (r.dailyTimes > m)
                              return (this.report("show_zCoinNoEnoughTime_coin", 1), !0);
                          }
                        n = !0;
                      }
                    if (o)
                      for (var f = 0; f < d.length; f++)
                        if (d[f].itemID == r.itemId) {
                          var p = g_oData
                              .get(g_tData.SlyderWeeklyCardModel)
                              .getInfoBySubEffectId(a[s]),
                            C = (p && p.revTimes) || 0;
                          if (e.dailyTimes > C)
                            return (this.report("show_zCoinNoEnoughTime_coin", 1), !0);
                        }
                  }
                }
                if (n)
                  return (
                    0 == _ && (_ = i.getTodayStr()),
                    cc.sys.localStorage.getItem("ShowNoBuyWeeklyCoinCard") != "" + _ &&
                      (cc.sys.localStorage.setItem("ShowNoBuyWeeklyCoinCard", _),
                      this.report("show_zCoinNoEnoughTime_coin", 1),
                      !0)
                  );
              }
              return !1;
            },
            getWeekCardCfg: function () {
              return l;
            },
            getUserWeekCard: function () {
              return c;
            },
            getGoodsInfo: function (e) {
              for (
                var t = [], i = g_oData.get(g_tData.sdkConfig).getCfgByName("goods"), a = 0;
                a < i.default.length;
                a++
              ) {
                for (var o = i.default[a], n = !1, s = 0; s < m.length; s++)
                  m[s] == o.id && (n = !0);
                n && t.push(o);
              }
              for (var r = 0; r < t.length; r++) {
                var c = t[r];
                if (c.id == e) return c;
              }
              return null;
            },
            getSwitchShow: function () {
              var e = g_oData.get(g_tData.SwitchModel).isOpenServicePay(),
                t = g_oData.get(g_tData.SwitchModel).isOpenPayForAnother(),
                i = g_oData.get(g_tData.SwitchModel).getWeekCard(),
                a = !(e || t);
              if (a) return a;
              var o = [];
              if (d)
                for (var n = 0; n < d.length; n++) {
                  var s = d[n];
                  o.push(s);
                }
              return "true" != i.mainShow && 0 == o.length;
            },
            report: function (e, t) {
              var i = {};
              ((i.Name = "newWeeklyCard" + e),
                (i.Step = t),
                g_oData.get(g_tData.gameReportData).reportClickAction(i));
            },
            _checkSmallPackTimer: function () {
              (null == this._today && (this._today = i.getTodayStr()),
                i.getTodayStr() != this._today &&
                  ((this._today = i.getTodayStr()),
                  this.reqGetPersonMsg(),
                  this.getBuyItemInfo(!0)));
            },
          };
        ((t.exports = f), cc._RF.pop());
      },
      { CommonUtils: "CommonUtils", QuikStart: "QuikStart" },
    ],
