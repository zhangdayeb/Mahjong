    CustomTreasureMod: [
      function (e, t) {
        "use strict";
        var i, a, o;
        cc._RF.push(t, "456afnn891K2qLVGLFFVc81", "CustomTreasureMod");
        var n = Object.create(null),
          s = [],
          r =
            (((i = {})[12190] = {
              name: "GetUserCTData",
              req: "PlatEvent.Req_GetUserCTData",
              resp: "PlatEvent.Rsp_GetUserCTData",
              desc: "\u83b7\u53d6\u7528\u6237\u81ea\u9009\u5b9d\u85cf\u6570\u636e",
              proto: 0,
            }),
            (i[12191] = {
              name: "SelectCTAward",
              req: "PlatEvent.Req_SelectCTAward",
              resp: "PlatEvent.Rsp_SelectCTAward",
              desc: "\u9009\u62e9\u5b9d\u85cf\u5185\u5bb9",
              proto: 0,
            }),
            (i[12192] = {
              name: "DoCustomTreasureLot",
              req: "PlatEvent.Req_DoCustomTreasureLot",
              resp: "PlatEvent.Rsp_DoCustomTreasureLot",
              desc: "\u6d88\u8017\u4f53\u529b\u62bd\u5956(\u4f53\u529b\u9053\u5177id 120015)",
              proto: 0,
            }),
            i);
        function c() {
          for (var e in r)
            if (r.hasOwnProperty(e)) {
              var t = r[e];
              n[t.name] = Number(e);
            }
          g_oEvent.addEventListener(g_tEvent.SDK_GAME_PRIVATE_MSG, function (e, t) {
            var i = r[e];
            if (i) {
              Log.info("netmsg recv cmdId = " + e + ",desc = " + i.name);
              var a = s[i.proto].build(i.resp).decode(t);
              try {
                Log.info("netmsg recv data = ", JSON.stringify(a));
              } catch (err) {
                console.error(err);
              }
              var o = "on" + i.name,
                n = g_oData.get(g_tData.CustomTreasureMod);
              n[o] && n[o](a);
            }
          });
        }
        function l(e, t) {
          var i = s[r[e].proto].build(r[e].req);
          if (i) {
            var a = new i();
            for (var o in a) a.hasOwnProperty(o) && (a[o] = t[o]);
            Log.info("netmsg send cmdId = " + e + ",desc = " + r[e].name);
            try {
              Log.info("netmsg send data = ", JSON.stringify(a));
            } catch (err) {
              console.error(err);
            }
            g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(e, a);
          }
        }
        var g = null,
          d = null,
          h = null,
          u = -1,
          _ = null,
          m = [],
          f =
            ((a = {
              __onLoadFinish__: function () {
                ((s[0] = g_oProto.loadProtoFile(g_tAsset.CustomTreasureV3Pb.format(ZG_GAME_NAME))),
                  this.onMessageEvent(),
                  c());
              },
              onMessageEvent: function () {
                g_oEvent.addEventListener(
                  g_tEvent.RSP_GAMEPLAT_PLAT_CFG,
                  function () {
                    var e = g_oData.get(g_tData.mod_gamecfg).getPlatCfgByName("customTreasureCfg");
                    e && (this.onGetAllCfg(e), this.reqData());
                  },
                  this,
                );
              },
              set marqueeMsg(e) {
                _ = e;
              },
              get marqueeMsg() {
                return _;
              },
              get topLevel() {
                return u;
              },
              get treasureCfg() {
                return g;
              },
              set selectedCfg(e) {
                d = e;
              },
              get selectedCfg() {
                return d;
              },
              get lastSelectedCfg() {
                return h;
              },
              get needPower() {
                return m;
              },
            }),
            ((o = {}).needPower = o.needPower || {}),
            (o.needPower.get = function () {
              return m;
            }),
            (a.getAward = function (e, t) {
              void 0 === t && (t = !1);
              var i = [],
                a = [];
              if ((Array.isArray(e) ? (a = e) : (a[0] = e), a.length > 0))
                for (var o = 0; o < a.length; o++) {
                  var n = a[o],
                    s = this.getAwardData(n, !0);
                  (i.push({
                    type: n.type,
                    goodsID: 1 == n.type ? n.goodsID : n.type,
                    goodsInfo: { extra: s.extra, desc: s.itemDesc },
                    num: s.num,
                    itemPicPath: g_tAsset.ITEM_PROP_PATH + s.itemIcon,
                    name: s.itemDesc,
                  }),
                    g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.GetAward.id, "onInit", {
                      data: i,
                      multipleCb: null,
                      quickStartCb: null,
                      supermultipleNum: null,
                      superMultipleCb: null,
                      quickStartStr: null,
                      closeCb: function () {},
                    }));
                }
            }),
            (a.getAwardData = function (e, t) {
              void 0 === t && (t = !1);
              var i = e.type,
                a = g_oCommonUtils.Long2Number(e.minNum || e.num),
                o = {
                  type: i,
                  goodsID: e.goodsID || -1,
                  itemDesc: "missing",
                  itemIcon: "zhuangban_default",
                  num: e.num || e.minNum || e.maxNum,
                  extra: { suffix: "" },
                };
              switch (i) {
                case g_tConst.GameConfig.ItemType.CSFare:
                  switch (e.goodsID) {
                    case g_tConst.GameConfig.ItemID.Power:
                      ((o.itemIcon = "power"),
                        (o.itemDesc = a),
                        t && (o.itemDesc += "\u4f53\u529b"));
                  }
                  break;
                case g_tConst.GameConfig.ItemType.GoldCard:
                  ((o.extra.suffix = "2"),
                    (o.itemIcon = "2_2"),
                    (o.itemDesc = g_oCommonUtils.translateCoinStr(g_oCommonUtils.initProCoin(a))),
                    t && (o.itemDesc += "\u6e38\u620f\u8c46"));
                  break;
                case g_tConst.GameConfig.ItemType.Diamond:
                  ((o.extra.suffix = "2"),
                    (o.itemIcon = "6_2"),
                    (o.itemDesc = a),
                    t && (o.itemDesc += "\u94bb\u77f3"));
                  break;
                case g_tConst.GameConfig.ItemType.ZCoin:
                  ((o.extra.suffix = "2"),
                    (o.itemIcon = "25_2"),
                    (o.itemDesc = g_oCommonUtils.translateCoinStr(g_oCommonUtils.initProCoin(a))),
                    t && (o.itemDesc += "\u6307\u5c16\u5e01"));
              }
              return o;
            }),
            (a.onGetAllCfg = function (e) {
              var t = e;
              (t.awardCfg.sort(function (e, t) {
                return (e.level > u && (u = e.level), e.level - t.level);
              }),
                (m = e.needPower),
                (g = []));
              for (var i = 0; i < t.awardCfg.length; i++) {
                var a = t.awardCfg[i],
                  o = a.level;
                if (((a.goodsInfo[0].id = a.awardId), o > u && (u = o), g.length < o))
                  for (var n = g.length, s = o - n, r = 0; r < s; r++)
                    g.push({ level: n + r + 1, treasures: [] });
                g[o - 1].treasures.push(a);
              }
            }),
            (a.setOwn = function (e, t) {
              if (d)
                for (var i = d.treasures, a = 0; a < i.length; a++) {
                  var o = i[a].goodsInfo[0];
                  o.id == e && (o.owned = t ? 1 : 0);
                }
            }),
            (a.getMarqueeData = function () {
              var e = g_oData.get(g_tData.SwitchModel).getCustomTreasureCfg(),
                t = e.ouhuang,
                i = e.fuxing;
              return (
                g &&
                  g.forEach(function (e) {
                    e.treasures.forEach(function (e) {
                      for (var a = e.goodsInfo[0], o = 0; o < t.length; o++)
                        if ("number" == typeof t[o] && t[o] == a.id) {
                          t[o] = a;
                          break;
                        }
                      for (var n = 0; n < i.length; n++)
                        if ("number" == typeof i[n] && i[n] == a.id) {
                          i[n] = a;
                          break;
                        }
                    });
                  }),
                [t, i]
              );
            }),
            (a.getMainShowCfg = function () {
              var e = this.treasureCfg,
                t = [];
              if (e)
                for (var i = e[u - 1].treasures, a = i.length, o = 1 / 0, n = 0; n < a; n++) {
                  var s = i[n],
                    r = s.goodsInfo[0].id;
                  if (t.length >= 4) {
                    if (r < o) {
                      for (var c = 0; c < t.length; c++)
                        if (t[c].id == o) {
                          t[c] = this.getShowData(s.goodsInfo[0], s.level, !0);
                          break;
                        }
                      for (var l = 0; l < t.length; l++) o = t[l].id > o ? o : t[l].id;
                    }
                  } else
                    ((o = r > o ? o : r), t.push(this.getShowData(s.goodsInfo[0], s.level, !0)));
                }
              return t;
            }),
            (a.getChooseShowCfg = function () {
              var e = this,
                t = [],
                i = this.treasureCfg;
              return (
                i &&
                  i.forEach(function (i) {
                    var a = { level: i.level, goodsInfo: [] };
                    (i.treasures.forEach(function (t) {
                      a.goodsInfo.push(e.getShowData(t.goodsInfo[0], i.level));
                    }),
                      t.push(a));
                  }),
                t
              );
            }),
            (a.getShowData = function (e, t, i) {
              void 0 === i && (i = !1);
              var a = e.type,
                o = g_oCommonUtils.Long2Number(e.num),
                n = {
                  type: a,
                  goodsID: e.goodsID,
                  id: e.id || -1,
                  level: t,
                  itemDesc: "missing",
                  itemIcon: "zhuangban_default",
                  isOwned: 1 == e.owned,
                  extra: { suffix: "" },
                };
              switch (a) {
                case g_tConst.GameConfig.ItemType.CSFare:
                  var s = g_oData.get(g_tData.mod_Bag).getLocalCfgById(e.subEffectID);
                  if (s) {
                    n.itemIcon = s.iconBig || s.iconSmall;
                    var r = {
                        id: s.id,
                        expireTime: g_oData.get(g_tData.sdkLogin).serverTime + 86400 * o,
                      },
                      c = g_oData.get(g_tData.mod_Bag).getLimitTimeStr(r);
                    ((n.itemDesc = c), i && (n.itemDesc = s.name + "*" + c));
                  }
                  break;
                case g_tConst.GameConfig.ItemType.GoldCard:
                  ((n.extra.suffix = "2"),
                    (n.itemIcon = "2_2"),
                    (n.itemDesc = g_oCommonUtils.translateCoinStr(g_oCommonUtils.initProCoin(o))),
                    i && (n.itemDesc += "\u6e38\u620f\u8c46"));
                  break;
                case g_tConst.GameConfig.ItemType.Diamond:
                  ((n.extra.suffix = "2"),
                    (n.itemIcon = "6_2"),
                    (n.itemDesc = o),
                    i && (n.itemDesc += "\u94bb\u77f3"));
                  break;
                case g_tConst.GameConfig.ItemType.ZCoin:
                  ((n.extra.suffix = "2"),
                    (n.itemIcon = "25_2"),
                    (n.itemDesc = g_oCommonUtils.translateCoinStr(g_oCommonUtils.initProCoin(o))),
                    i && (n.itemDesc += "\u6307\u5c16\u5e01"));
              }
              return n;
            }),
            (a.reqGetUserCTData = function () {
              l(n.GetUserCTData, {});
            }),
            (a.onGetUserCTData = function (e) {
              if (0 == e.code && e.userCTData) {
                h = d;
                for (var t = e.userCTData, i = [], a = 0; a < g.length; a++)
                  for (var o = 0; o < g[a].treasures.length; o++)
                    for (var n = g[a].treasures[o], s = 0; s < t.selectedAwardId.length; s++)
                      if (t.selectedAwardId[s] == n.awardId) {
                        (i.push(n), (n.goodsInfo[0].owned = 0));
                        for (var r = 0; r < t.receivedAwardId.length; r++)
                          if (t.receivedAwardId[r] == n.awardId) {
                            n.goodsInfo[0].owned = 1;
                            break;
                          }
                        break;
                      }
                d = { treasures: [], refreshTime: 0 };
                var c = g_oData.get(g_tData.SwitchModel).getCustomTreasureCfg().showSeq || null,
                  l = [];
                (Array.isArray(c) && c.length > 0
                  ? ((l = new Array(c.length)),
                    i.forEach(function (e) {
                      for (var t = 0; t < c.length; t++)
                        if (c[t] == e.level) {
                          ((l[t] = e), (c[t] = -1));
                          break;
                        }
                    }))
                  : i.forEach(function (e) {
                      l.push(e);
                    }),
                  (d.treasures = l),
                  (d.refreshTime = t.refreshTime),
                  g_oEvent.dispatchEvent(g_tEvent.GET_CUSTOM_TREASURE_SUC));
              } else Log.info("Edwin onGetUserCTData error code:" + e.code);
            }),
            (a.reqSelectCTAward = function (e) {
              var t = { awardId: e };
              l(n.SelectCTAward, t);
            }),
            (a.onSelectCTAward = function (e) {
              0 == e.code
                ? (g_oPlatform.doAction(
                    g_tConst.tPlatActionId.actionShowToast,
                    "\u4fdd\u5b58\u5b9d\u85cf\u6210\u529f",
                  ),
                  this.reqGetUserCTData(),
                  g_oEvent.dispatchEvent(g_tEvent.SAVE_CUSTOM_TREASURE_SUC),
                  g_oData
                    .get(g_tData.gameReportData)
                    .reportAction(g_tConst.ReportCfg.CustomTreasure.SaveSuccessfully))
                : g_oPlatform.doAction(
                    g_tConst.tPlatActionId.actionShowToast,
                    "\u4fdd\u5b58\u5b9d\u85cf\u5931\u8d25,\u9519\u8bef\u7801:" + e.code,
                  );
            }),
            (a.reqDoCustomTreasureLot = function () {
              l(n.DoCustomTreasureLot, {});
            }),
            (a.onDoCustomTreasureLot = function (e) {
              0 == e.code
                ? (g_oData.get(g_tData.CustomTreasureMod).setOwn(e.award.awardId, !0),
                  g_oEvent.dispatchEvent(g_tEvent.DRAW_CUSTOM_TREASURE_SUC, e))
                : g_oPlatform.doAction(
                    g_tConst.tPlatActionId.actionShowToast,
                    "\u62bd\u5956\u5931\u8d25,\u9519\u8bef\u7801:" + e.code,
                  );
            }),
            (a.reqData = function () {
              this.reqGetUserCTData();
            }),
            (a.getLeftTime = function () {
              var e = 0;
              if (d) {
                var t = g_oData.get(g_tData.sdkLogin).serverTime,
                  i = d.refreshTime || 0;
                e = Math.max(0, i - t);
              }
              return e;
            }),
            (a.isFinishedOneRound = function () {
              var e = !1;
              return (
                d &&
                  Array.isArray(d.treasures) &&
                  d.treasures.length > 0 &&
                  ((e = !0),
                  d.treasures.forEach(function (t) {
                    0 != t.goodsInfo[0].owned || (e = !1);
                  })),
                e
              );
            }),
            (a.onClickEntry = function () {
              this.getLeftTime() > 0
                ? g_oLayerManager.emitEvent2Dlg(
                    g_tConst.GameLayerCfg.CustomTreasureDraw.id,
                    "ON_INIT",
                  )
                : g_oLayerManager.emitEvent2Dlg(
                    g_tConst.GameLayerCfg.CustomTreasureMain.id,
                    "ON_INIT",
                  );
            }),
            (a.reportDrawTimes = function (e) {
              var t = g_tConst.ReportCfg.CustomTreasure.DrawTimes;
              ((t.Step = e), g_oData.get(g_tData.gameReportData).reportAction(t));
            }),
            (a.reportShowView = function (e) {
              var t = g_tConst.ReportCfg.CustomTreasure.ShowView;
              ((t.Step = e), g_oData.get(g_tData.gameReportData).reportAction(t));
            }),
            (a.reportChooseTreasure = function (e) {
              var t = g_tConst.ReportCfg.CustomTreasure.ChooseTreasure;
              ((t.Step = e), g_oData.get(g_tData.gameReportData).reportAction(t));
            }),
            (function (e, t) {
              for (var i in t)
                (((n = t[i]).configurable = n.enumerable = !0),
                  "value" in n && (n.writable = !0),
                  Object.defineProperty(e, i, n));
              if (Object.getOwnPropertySymbols)
                for (var a = Object.getOwnPropertySymbols(t), o = 0; o < a.length; o++) {
                  var n,
                    s = a[o];
                  (((n = t[s]).configurable = n.enumerable = !0),
                    "value" in n && (n.writable = !0),
                    Object.defineProperty(e, s, n));
                }
            })(a, o),
            a);
        ((t.exports = f), cc._RF.pop());
      },
      {},
    ],
