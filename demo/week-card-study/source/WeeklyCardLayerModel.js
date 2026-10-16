    WeeklyCardLayerModel: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "e12begPElRCoIciFFENb58T", "WeeklyCardLayerModel");
        var i = e("CommonUtils"),
          a = [],
          o = 12166,
          n = ["PlatEvent.Req_GetPersonMsg", "PlatEvent.Rsp_GetPersonMsg"],
          s = 12167,
          r = ["PlatEvent.Req_GetWeekCardCfg", "PlatEvent.Rsp_GetWeekCardCfg"],
          c = 12168,
          l = ["PlatEvent.Req_ReceiveAward", "PlatEvent.Rsp_ReceiveAward"],
          g = null,
          d = null,
          h = !0,
          u = 0,
          _ = [1522, 1523, 1524, 1535, 1551, 1536, 1552, 1534],
          m = [[1522], [1523, 1535, 1551, 1536], [1524, 1552, 1534]],
          f = {
            __onLoadFinish__: function () {
              ((a[0] = g_oProto.loadProtoFile(g_tAsset.WeekCardPB.format(ZG_GAME_NAME))),
                g_oEvent.addEventListener(g_tEvent.SDK_GAME_PRIVATE_MSG, function (e, t) {
                  switch (e) {
                    case o:
                      var i = a[0].build(n[1]).decode(t);
                      ((g = i.weekCard).sort(
                        function (e, t) {
                          return e.type - t.type;
                        }.bind(this),
                      ),
                        console.log("lqr...\u5468\u5361,userWeekCard,", i),
                        g_oEvent.dispatchEvent(g_tEvent.GET_WEEKLY_CARD_DATA, i));
                      break;
                    case s:
                      var h = a[0].build(r[1]).decode(t);
                      ((d = h.weekCardCfg).sort(
                        function (e, t) {
                          return e.type - t.type;
                        }.bind(this),
                      ),
                        console.log("lqr...\u5468\u5361,weekCardCfg,", h),
                        g_oEvent.dispatchEvent(g_tEvent.GET_WEEKLY_CARD_CFG, h));
                      break;
                    case c:
                      var u = a[0].build(l[1]).decode(t);
                      (u && 0 == u.code
                        ? g_oEvent.dispatchEvent(g_tEvent.BUY_WEEKLY_CARD_FINISH, !0)
                        : console.log(
                            "lqr...\u8d2d\u4e70\u5468\u5361,\u70b9\u51fb\uff0c\u9886\u53d6\u5956\u52b1\uff0c\u5931\u8d25\u4e86",
                            u,
                          ),
                        f.reqGetPersonMsg());
                  }
                }),
                this.onMessageEvent(),
                setInterval(this._checkSmallPackTimer.bind(this), 1e3));
            },
            onMessageEvent: function () {},
            initLoginWeekCard: function () {
              g_oData.get(g_tData.SwitchModel).getWeekCard().showNewWeeklyCard
                ? g_oData.get(g_tData.SlyderWeeklyCardModel).initLoginWeekCard()
                : (this.reqGetPersonMsg(),
                  this.reqGetWeekCardCfg(),
                  i.getServerTime(
                    function (e) {
                      u = Math.ceil((e - 28800) / 86400);
                    }.bind(this),
                  ));
            },
            reqGetPersonMsg: function () {
              var e = new (a[0].build(n[0]))();
              g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(o, e);
            },
            reqGetWeekCardCfg: function () {
              var e = new (a[0].build(r[0]))();
              g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(s, e);
            },
            reqReceiveAward: function (e) {
              var t = new (a[0].build(l[0]))();
              ((t.type = e),
                g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(c, t),
                console.log("lqr...\u9886\u53d6\u793c\u5305", t));
            },
            CheckShowIcon: function () {
              return g_oData.get(g_tData.SwitchModel).getWeekCard().showNewWeeklyCard
                ? g_oData.get(g_tData.SlyderWeeklyCardModel).CheckShowIcon()
                : !(!g || !d || this.getSwitchShow());
            },
            CheckShowIconRedPoint: function () {
              if (g_oData.get(g_tData.SwitchModel).getWeekCard().showNewWeeklyCard)
                return g_oData.get(g_tData.SlyderWeeklyCardModel).CheckShowIconRedPoint();
              if (!g || !d) return !1;
              if (this.getSwitchShow()) return !1;
              if (g && d)
                for (var e = 0; e < g.length; e++)
                  if (g[e].status && d[e].everyDayTimes - g[e].receiveTimes > 0) return !0;
              return !1;
            },
            CheckShowAutoViewByGame: function () {
              var e = g_oData.get(g_tData.SwitchModel).getWeekCard();
              if (e.showNewWeeklyCard)
                return g_oData.get(g_tData.SlyderWeeklyCardModel).CheckShowAutoViewByGame();
              if (!g || !d) return !1;
              if (this.getSwitchShow()) return !1;
              var t = g_oData.get(g_tData.sdkUser),
                a = i.Long2Number(t.fingerCoin);
              if (g && h) {
                if (((h = !1), "true" != e.firstShow)) return !1;
                for (var o = !0, n = 0; n < g.length; n++) g[n].status > 0 && (o = !1);
                if (o)
                  return (
                    null == this._firstShowTime && (this._firstShowTime = 0),
                    this._firstShowTime++,
                    this.report("show_firstShowTime", this._firstShowTime),
                    !0
                  );
              }
              if (g && a < 5e3) {
                if ("true" != e.gameOver) return !1;
                for (var s = !0, r = 0; r < g.length; r++) g[r].status > 0 && (s = !1);
                if (s)
                  return (
                    null == this._comBackTime && (this._comBackTime = 0),
                    this._comBackTime++,
                    this.report("show_comBackTime", this._comBackTime),
                    !0
                  );
              }
              if (a < 5e3 && g && d)
                for (var c = 0; c < g.length; c++)
                  if (g[c].status > 0 && g[c].everyDayTimes < d[c].receiveTimes)
                    return (
                      null == this._getAwayTime && (this._getAwayTime = 0),
                      this._getAwayTime++,
                      this.report("show_getAwayTime", this._getAwayTime),
                      !0
                    );
              return !1;
            },
            CheckShowAutoViewByLogin: function () {
              if (g_oData.get(g_tData.SwitchModel).getWeekCard().showNewWeeklyCard)
                return g_oData.get(g_tData.SlyderWeeklyCardModel).CheckShowAutoViewByLogin();
              if (!g || !d) return !1;
              if (this.getSwitchShow()) return !1;
              var e = g_oData.get(g_tData.sdkUser),
                t = i.Long2Number(e.fingerCoin);
              if (g && h && t < 5e3) {
                if (((h = !1), "true" != g_oData.get(g_tData.SwitchModel).getWeekCard().firstShow))
                  return !1;
                for (var a = !0, o = 0; o < g.length; o++) g[o].status > 0 && (a = !1);
                if (a)
                  return (
                    null == this._comBackTime && (this._comBackTime = 0),
                    this._comBackTime++,
                    this.report("show_comBackTime", this._comBackTime),
                    !0
                  );
              }
              return !1;
            },
            CheckShowReviveWeeklyCard: function () {
              var t = g_oData.get(g_tData.SwitchModel).getWeekCard();
              if (t.showNewWeeklyCard)
                return g_oData.get(g_tData.SlyderWeeklyCardModel).CheckShowReviveWeeklyCard();
              if (!g || !d) return !1;
              if (g_oCommonUtils.isIosSys()) return !1;
              var i = g_oData.get(g_tData.SwitchModel).isOpenServicePay(),
                a = g_oData.get(g_tData.SwitchModel).isOpenPayForAnother();
              if (!i && !a) return !1;
              var o = e("QuikStart").getLastGameType();
              if (t.playList) {
                for (
                  var n = !1, s = g_oData.get(g_tData.mod_DataCom).getCurrSelectScene(), r = 0;
                  r < d.length;
                  r++
                )
                  for (var c = d[r], l = 0; l < c.poChan.length; l++)
                    c.poChan[l] == s &&
                      g[r].status <= 0 &&
                      this._checkShowListByType(this._checkShowViewItems(), c.type) &&
                      (n = !0);
                if (n)
                  for (var h = 0; h < t.playList.length; h++)
                    if (t.playList[h] == o)
                      return (
                        null == this._playListTime && (this._playListTime = 0),
                        this._playListTime++,
                        this.report("show_playListTime" + o, this._playListTime),
                        !0
                      );
              }
              return !1;
            },
            CheckShowWeeklyCard: function () {
              var e = g_oData.get(g_tData.SwitchModel).getWeekCard();
              if (e.showNewWeeklyCard)
                return g_oData.get(g_tData.SlyderWeeklyCardModel).CheckShowWeeklyCard();
              if (!g || !d) return !1;
              if (this.getSwitchShow()) return !1;
              if ("true" != e.zCoinNoEnough) return !1;
              var t = g_oData.get(g_tData.mod_DataCom).getCurrSelectScene();
              if (d && g) {
                for (var a = this.getShowViewShopDataList(), o = 0, n = 0; n < d.length; n++) {
                  for (var s = d[n], r = !1, c = 0; c < s.poChan.length; c++)
                    s.poChan[c] == t && (r = !0);
                  if (r) {
                    o = s.type;
                    break;
                  }
                }
                for (var l = !1, h = 0; h < a.length; h++) {
                  var _ = a[h].cardCfg,
                    m = a[h].cardData;
                  (a[h].goodsData,
                    _.type >= o &&
                      m.status > 0 &&
                      _.everyDayTimes - m.receiveTimes > 0 &&
                      (l = !0));
                }
                if (!l) {
                  if (
                    (0 == u && (u = i.getTodayStr()),
                    cc.sys.localStorage.getItem("ShowNoBuyWeeklyCard") == "" + u)
                  )
                    return !1;
                  cc.sys.localStorage.setItem("ShowNoBuyWeeklyCard", u);
                }
                return (
                  null == this._zCoinNoEnoughTime && (this._zCoinNoEnoughTime = 0),
                  this._zCoinNoEnoughTime++,
                  this.report("show_zCoinNoEnoughTime", this._zCoinNoEnoughTime),
                  !0
                );
              }
              return !1;
            },
            CheckShowWeeklyCardCoin: function () {
              return (
                !!g_oData.get(g_tData.SwitchModel).getWeekCard().showNewWeeklyCard &&
                g_oData.get(g_tData.SlyderWeeklyCardModel).CheckShowWeeklyCardCoin()
              );
            },
            getWeekCardCfg: function () {
              return d;
            },
            getUserWeekCard: function () {
              return g;
            },
            getGoodsList: function () {
              for (
                var e = [], t = g_oData.get(g_tData.sdkConfig).getCfgByName("goods"), i = 0;
                i < t.default.length;
                i++
              ) {
                for (var a = t.default[i], o = !1, n = 0; n < _.length; n++)
                  _[n] == a.id && (o = !0);
                o && e.push(a);
              }
              for (var s = this._checkShowViewItems(), r = [], c = 0; c < s.length; c++)
                if (s[c] > 0)
                  for (var l = 0; l < e.length; l++) {
                    var g = e[l];
                    g.id == _[s[c] - 1] && r.push(g);
                  }
                else r[c] = {};
              return r;
            },
            getSwitchShow: function () {
              var e = g_oData.get(g_tData.SwitchModel).isOpenServicePay(),
                t = g_oData.get(g_tData.SwitchModel).isOpenPayForAnother(),
                i = g_oData.get(g_tData.SwitchModel).getWeekCard(),
                a = !(e || t);
              if (a) return a;
              var o = [];
              if (g)
                for (var n = 0; n < g.length; n++) {
                  var s = g[n];
                  1 == s.status && o.push(s.type);
                }
              return "true" != i.mainShow && 0 == o.length;
            },
            report: function (e, t) {
              if (g_oData.get(g_tData.SwitchModel).getWeekCard().showNewWeeklyCard)
                return g_oData.get(g_tData.SlyderWeeklyCardModel).report(e, t);
              var i = {};
              ((i.Name = "WeeklyCard" + e),
                (i.Step = t),
                g_oData.get(g_tData.gameReportData).reportClickAction(i));
            },
            _checkShowViewItems: function () {
              if (!d || !g) return [];
              for (var e = [], t = 0; t < g.length; t++) {
                var i = g[t];
                1 == i.status && e.push(i.type);
              }
              for (
                var a = g_oData.get(g_tData.SwitchModel).getWeekCard().showBag, o = [], n = 0;
                n < 3;
                n++
              ) {
                o[n] = a[n];
                for (var s = 0; s < e.length; s++) {
                  var r = e[s],
                    c = _[r - 1];
                  this.getItemTypeByPayID(c) == n && (o[n] = r);
                }
              }
              return o;
            },
            _checkShowListByType: function (e, t) {
              for (var i = 0; i < e.length; i++) if (e[i] == t) return !0;
              return !1;
            },
            getItemTypeByPayID: function (e) {
              for (var t = 0; t < m.length; t++)
                for (var i = m[t], a = 0; a < i.length; a++) if (i[a] == e) return t;
              return 0;
            },
            getItemIndexByPayID: function (e) {
              for (var t = 0; t < _.length; t++) if (_[t] == e) return t;
              return 0;
            },
            getShowViewShopDataList: function () {
              for (
                var e = this._checkShowViewItems(), t = [], i = this.getGoodsList(), a = 0;
                a < 3;
                a++
              ) {
                var o = e[a] - 1;
                if (!(o < 0)) {
                  var n = g[o],
                    s = d[o],
                    r = i[a];
                  this._checkShowListByType(e, s.type) &&
                    t.push({ cardData: n, cardCfg: s, goodsData: r });
                }
              }
              return t;
            },
            _checkSmallPackTimer: function () {
              (null == this._today && (this._today = i.getTodayStr()),
                i.getTodayStr() != this._today &&
                  ((this._today = i.getTodayStr()), this.reqGetPersonMsg()));
            },
          };
        ((t.exports = f), cc._RF.pop());
      },
      { CommonUtils: "CommonUtils", QuikStart: "QuikStart" },
    ],
