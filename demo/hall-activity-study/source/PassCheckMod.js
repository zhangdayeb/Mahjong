    PassCheckMod: [
      function (e, t) {
        "use strict";
        function i(e, t) {
          var i;
          if ("undefined" == typeof Symbol || null == e[Symbol.iterator]) {
            if (Array.isArray(e) || (i = a(e)) || (t && e && "number" == typeof e.length)) {
              i && (e = i);
              var o = 0;
              return function () {
                return o >= e.length ? { done: !0 } : { done: !1, value: e[o++] };
              };
            }
            throw new TypeError(
              "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
            );
          }
          return (i = e[Symbol.iterator]()).next.bind(i);
        }
        function a(e, t) {
          if (e) {
            if ("string" == typeof e) return o(e, t);
            var i = Object.prototype.toString.call(e).slice(8, -1);
            return (
              "Object" === i && e.constructor && (i = e.constructor.name),
              "Map" === i || "Set" === i
                ? Array.from(e)
                : "Arguments" === i || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)
                  ? o(e, t)
                  : void 0
            );
          }
        }
        function o(e, t) {
          (null == t || t > e.length) && (t = e.length);
          for (var i = 0, a = new Array(t); i < t; i++) a[i] = e[i];
          return a;
        }
        cc._RF.push(t, "c0875A1ISlEhq3QcGEwlrUO", "PassCheckMod");
        var n = e("../PassCheck/redPointCtrl/redPointCtrl"),
          s = e("../PassCheck/redPointCtrl/redPointEnum"),
          r = [],
          c = {
            id: 13090,
            name: ["PlatEvent.Req_GetPassCheckInfo", "PlatEvent.Rsp_GetPassCheckInfo"],
          },
          l = {
            id: 13091,
            name: ["PlatEvent.Req_GetPassCheckAward", "PlatEvent.Rsp_GetPassCheckAward"],
          },
          g = { id: 13092, name: ["", "PlatEvent.Rsp_PassCheckInfoUpdate"] },
          d = {
            id: 13093,
            name: ["PlatEvent.Req_GetUserPassCheckInfo", "PlatEvent.Rsp_GetUserPassCheckInfo"],
          },
          h = {
            id: 13094,
            name: ["PlatEvent.Req_GetPassCheckTaskAward", "PlatEvent.Rsp_GetPassCheckTaskAward"],
          },
          u = {
            id: 13096,
            name: ["PlatEvent.Req_PassCheckOpenBox", "PlatEvent.Rsp_PassCheckOpenBox"],
          },
          _ = {
            id: 13097,
            name: ["PlatEvent.Req_PassCheckUserAwardLog", "PlatEvent.Rsp_PassCheckUserAwardLog"],
          },
          m = { id: 13098, name: ["PlatEvent.Req_PassCheckRefreshUser", ""] },
          f = { id: 12303, name: ["", "PlatEvent.Rsp_GetUserCustomAchieveInfo"] },
          p = {
            id: 114,
            name: ["basehall_prop.Req_HadBoughtItems", "basehall_prop.Ans_HadBoughtItems"],
          },
          C = { DailyAwardRank: 1 },
          v = {},
          y = null,
          S = !1,
          D = null,
          T = {},
          I = !1,
          E = !1;
        function M(e) {
          var t = JSON.parse(JSON.stringify(e));
          switch (t.type) {
            case g_tConst.GameConfig.ItemType.GoldCard:
            case g_tConst.GameConfig.ItemType.ZuanShi:
            case g_tConst.GameConfig.ItemType.ZCoin:
              t.num = g_oCommonUtils.Long2Number(t.num);
              break;
            case g_tConst.GameConfig.ItemType.CSFare:
              (t.subEffectID < 0 && (t.subEffectID = t.goodsID % 1e5),
                g_oData.get(g_tData.mod_Bag).loadLocalCfgById(t.subEffectID, function (e) {
                  e &&
                    ((t.itemPicPath = g_tAsset.ITEM_PROP_PATH + e.iconSmall),
                    (t.num = g_oCommonUtils.Long2Number(t.num)));
                }));
          }
          return t;
        }
        var L = {
          __onLoadFinish__: function () {
            ((r[0] = g_oProto.loadProtoFile(g_tAsset.PassCheck_PB.format(ZG_GAME_NAME))),
              (r[1] = g_oProto.loadProtoFile(g_tAsset.CustomAchieve_PB.format(ZG_GAME_NAME))),
              (r[2] = g_oProto.loadProtoFile(g_tAsset.common_GameItemPb.format(ZG_GAME_NAME))),
              (C = g_tConst.PassCheckType),
              g_oNetEvent.addNetListener(p.id, function (e) {
                r[2].build(p.name[1]).decode(e) &&
                  g_oData.get(g_tData.PassCheckMod).reqPassCheckUserInfo();
              }),
              g_oEvent.addEventListener(g_tEvent.SDK_GAME_PRIVATE_MSG, function (e, t) {
                switch (e) {
                  case c.id:
                    if ((o = r[0].build(c.name[1]).decode(t)).passCheckType != C.DailyAwardRank)
                      ((v[o.passCheckType] = o),
                        g_oEvent.dispatchEvent(g_tEvent.PASSCHECK_INFO_UPDATE));
                    else {
                      var i = new Date(1e3 * g_oData.get(g_tData.sdkLogin).serverTime),
                        a = ((i.getDay() + 6) % 7) + 1;
                      i.setHours(24, 0, 0, 0) / 1e3 + 86400 * (7 - a) == y
                        ? ((v[o.passCheckType] = o),
                          (v[o.passCheckType].endTimeInt = y),
                          g_oData.get(g_tData.PassCheckMod).reqPassCheckUserInfo(o.passCheckType))
                        : g_oData.get(g_tData.PassCheckMod).reqPassCheckActCfg(o.passCheckType);
                    }
                    break;
                  case l.id:
                    0 == (o = r[0].build(l.name[1]).decode(t)).ret &&
                      o.goods &&
                      o.goods.length > 0 &&
                      g_oLayerManager.emitEvent2Dlg(
                        g_tConst.GameLayerCfg.PassCheckGetAward.id,
                        "ON_INIT",
                        o,
                      );
                    break;
                  case d.id:
                    var o = r[0].build(d.name[1]).decode(t);
                    v[o.passCheckType] &&
                      ((v[o.passCheckType].passCheckInfo = o.passCheckInfo),
                      g_oData.get(g_tData.PassCheckMod).checkRedPoint(o.passCheckType),
                      g_oEvent.dispatchEvent(g_tEvent.PASSCHECK_INFO_UPDATE));
                    break;
                  case g.id:
                    ((o = r[0].build(g.name[1]).decode(t)),
                      v[o.passCheckType] &&
                        ((v[o.passCheckType].passCheckInfo = o.passCheckInfo),
                        g_oData.get(g_tData.PassCheckMod).checkRedPoint(o.passCheckType),
                        g_oEvent.dispatchEvent(g_tEvent.PASSCHECK_INFO_UPDATE)));
                    break;
                  case h.id:
                    0 == (o = r[0].build(h.name[1]).decode(t)).ret &&
                      o.goods &&
                      o.goods.length > 0 &&
                      g_oEvent.dispatchEvent(g_tEvent.BASEHALL_SHARE_EVNET_NORMAL_AWARD_GET, {
                        allAward: o.goods.map(function (e) {
                          return M(e);
                        }),
                      });
                    break;
                  case u.id:
                    (0 == (o = r[0].build(u.name[1]).decode(t)).retCode &&
                      o.goods &&
                      o.goods.length > 0 &&
                      ((o.allAward = o.goods.map(function (e) {
                        return M(e);
                      })),
                      g_oEvent.dispatchEvent(g_tEvent.PASSCHECK_OPENBOX_AWARD, o)),
                      (S = !1),
                      clearTimeout(D));
                    break;
                  case _.id:
                    0 == (o = r[0].build(_.name[1]).decode(t)).retCode &&
                      (T[o.passCheckType] ||
                        (T[o.passCheckType] = { _lock: !1, _page: 1, info: { 1: [] } }),
                      (T[o.passCheckType]._lock = !1),
                      (T[o.passCheckType]._page = o.page),
                      (T[o.passCheckType].info[T[o.passCheckType]._page] = o.awardLog),
                      g_oEvent.dispatchEvent(g_tEvent.PASSCHECK_AWARDLOG_UPDATE));
                    break;
                  case f.id:
                    ((o = r[1].build(f.name[1]).decode(t)),
                      g_oEvent.dispatchEvent(g_tEvent.PASSCHECK_TASK_UPDATE, o));
                }
              }),
              this.onMessageEvent());
          },
          onMessageEvent: function () {
            (g_oEvent.addEventListener(
              g_tEvent.SCENELOADER_SCENECHG,
              function (e) {
                e.to == g_tConst.SceneCfgs.login
                  ? ((v = {}), (y = null), (S = !1), (D = null), (T = {}), (I = !1), (E = !1))
                  : e.to == g_tConst.SceneCfgs.lobby &&
                    e.from == g_tConst.SceneCfgs.game &&
                    (E = !0);
              },
              this,
            ),
              g_oEvent.addEventListener(
                g_tEvent.PASSCHECK_TASK_UPDATE,
                function (e) {
                  var t;
                  if (null != (t = v[C.DailyAwardRank]) && t.passCheckInfo) {
                    for (
                      var a,
                        o = function () {
                          var e = a.value,
                            t = v[C.DailyAwardRank].passCheckInfo.rows.findIndex(function (t) {
                              return t.id == e.id;
                            });
                          -1 != t
                            ? (v[C.DailyAwardRank].passCheckInfo.rows[t] = e)
                            : v[C.DailyAwardRank].passCheckInfo.rows.push(e);
                        },
                        n = i(e.rows);
                      !(a = n()).done;

                    )
                      o();
                    (g_oEvent.dispatchEvent(g_tEvent.PASSCHECK_INFO_UPDATE),
                      g_oData.get(g_tData.PassCheckMod).checkRedPoint(e.passCheckType));
                  }
                },
                this,
              ),
              g_oEvent.addEventListener(g_tEvent.RSQ_GAMEPLAT_DATA_READY, function () {
                for (var e in v) {
                  var t = v[e];
                  null != t &&
                    t.passCheckInfo &&
                    g_oData.get(g_tData.PassCheckMod).reqPassCheckUserInfo(e);
                }
              }),
              g_oEvent.addEventListener(g_tEvent.GET_ITEM_LIST_BACK, function (e) {
                for (var t in v) {
                  var i,
                    a = v[t];
                  null != a &&
                    a.passCheckInfo &&
                    a.cfg.giftPackage
                      .map(function (e) {
                        return Number(e.itemId);
                      })
                      .includes(Number(null != (i = e.itemId) ? i : e.itemID)) &&
                    g_oData.get(g_tData.PassCheckMod).reqPassCheckUserInfo(t);
                }
              }));
          },
          reqPassCheckActCfg: function (e) {
            if ((void 0 === e && (e = C.DailyAwardRank), e == C.DailyAwardRank)) {
              var t = new Date(1e3 * g_oData.get(g_tData.sdkLogin).serverTime),
                i = ((t.getDay() + 6) % 7) + 1;
              y = t.setHours(24, 0, 0, 0) / 1e3 + 86400 * (7 - i);
            }
            var a = new (r[0].build(c.name[0]))();
            ((a.passCheckType = e), g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(c.id, a));
          },
          reqPassCheckAward: function (e, t) {
            void 0 === t && (t = C.DailyAwardRank);
            var i = new (r[0].build(l.name[0]))();
            ((i.passCheckType = t),
              (i.lv = e),
              g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(l.id, i));
          },
          reqPassCheckUserInfo: function (e) {
            void 0 === e && (e = C.DailyAwardRank);
            var t = new (r[0].build(d.name[0]))();
            ((t.passCheckType = e), g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(d.id, t));
          },
          reqGetTaskAward: function (e, t) {
            void 0 === t && (t = C.DailyAwardRank);
            var i = new (r[0].build(h.name[0]))();
            ((i.passCheckType = t),
              (i.id = e),
              g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(h.id, i));
          },
          reqUserMissile: function (e, t, i) {
            if ((void 0 === i && (i = C.DailyAwardRank), !S)) {
              ((S = !0),
                (D = setTimeout(function () {
                  S = !1;
                }, 15e3)));
              var a = new (r[0].build(u.name[0]))();
              ((a.passCheckType = i),
                (a.count = e),
                (a.type = t),
                g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(u.id, a));
            }
          },
          reqUserAwardLog: function (e) {
            if ((void 0 === e && (e = C.DailyAwardRank), !T[e] || 0 == T[e]._page)) {
              var t = new (r[0].build(_.name[0]))();
              return (
                (t.passCheckType = e),
                (t.page = 1),
                (t.pageCount = 20),
                void g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(_.id, t)
              );
            }
            if (20 == T[e].info[T[e]._page].length && !T[e]._lock) {
              T[e]._lock = !0;
              var i = new (r[0].build(_.name[0]))();
              ((i.passCheckType = e),
                (i.page = T[e]._page + 1),
                (i.pageCount = 20),
                g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(_.id, i));
            }
          },
          reqRefreshUser: function (e) {
            void 0 === e && (e = C.DailyAwardRank);
            var t = new (r[0].build(m.name[0]))();
            ((t.passCheckType = e), g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(m.id, t));
          },
          getPassCheckActCfg: function (e) {
            var t;
            return (
              void 0 === e && (e = C.DailyAwardRank),
              g_oData.get(g_tData.PassCheckMod).initAllTask(e),
              null != (t = v[e]) ? t : {}
            );
          },
          getLeftTime: function () {
            var e = this.getPassCheckActCfg(g_tConst.PassCheckType.DailyAwardRank),
              t = 0;
            if (e) {
              var i,
                a = g_oData.get(g_tData.sdkLogin).serverTime,
                o = Number(null != (i = null == e ? void 0 : e.endTimeInt) ? i : 0);
              t = Math.max(0, o - a);
            }
            return t;
          },
          getPassCheckUserInfo: function (e) {
            var t, i;
            return (
              void 0 === e && (e = C.DailyAwardRank),
              null != (t = null == (i = v[e]) ? void 0 : i.passCheckInfo) ? t : {}
            );
          },
          getAwardLog: function (e) {
            if ((void 0 === e && (e = C.DailyAwardRank), !T[e])) return null;
            var t = [];
            for (var i in T[e].info) {
              var a = T[e].info[i];
              t = t.concat(a);
            }
            return t;
          },
          getAwardLogPage: function (e) {
            return (void 0 === e && (e = C.DailyAwardRank), T[e] ? T[e]._page : 0);
          },
          clearAwardLogPage: function (e) {
            (void 0 === e && (e = C.DailyAwardRank), (T[e] = null));
          },
          getReceiveType: function (e, t, i) {
            void 0 === i && (i = C.DailyAwardRank);
            var a = this.getPassCheckUserInfo(i),
              o = 1 == t ? a.normalAwardStatus[0] : a.plusAwardStatus[0];
            return Boolean((o >> (e - 1)) % 2);
          },
          checkActivityOpen: function (e) {
            void 0 === e && (e = C.DailyAwardRank);
            var t = g_oData.get(g_tData.sdkLogin).serverTime,
              i = v[e];
            return i ? (i.passCheckInfo && i.endTimeInt && t < i.endTimeInt ? 1 : 2) : -1;
          },
          initAllTask: function (e) {
            if ((void 0 === e && (e = C.DailyAwardRank), v[e] && null == v[e].taskInfo)) {
              var t;
              v[e].taskInfo = {};
              var i = null != (t = v[e].gameTaskCfg) ? t : [];
              ((v[e].taskInfo[g_tConst.PassCheckTaskType[e][0]] = i.filter(function (t) {
                return t.showType == g_tConst.PassCheckTaskType[e][0];
              })),
                (v[e].taskInfo[g_tConst.PassCheckTaskType[e][1]] = i.filter(function (t) {
                  return t.showType == g_tConst.PassCheckTaskType[e][1];
                })));
            }
          },
          getAllPlusAwardCanGet: function (e, t) {
            (void 0 === e && (e = !1), void 0 === t && (t = C.DailyAwardRank));
            var i = this.getPassCheckActCfg(t),
              a = this.getPassCheckUserInfo(t),
              o = [];
            return (
              i.levelCfg.forEach(function (i, n) {
                var s = g_oData.get(g_tData.PassCheckMod).getReceiveType(n + 1, 2, t),
                  r = n + 1 <= a.lv;
                (e || (r && !s)) &&
                  i.plusGoods.forEach(function (e) {
                    var t = o.findIndex(function (t) {
                      return t.type == e.type && t.goodsID == e.goodsID;
                    });
                    -1 != t
                      ? (o[t].num =
                          g_oCommonUtils.Long2Number(o[t].num) + g_oCommonUtils.Long2Number(e.num))
                      : o.push(JSON.parse(JSON.stringify(e)));
                  });
              }),
              o
            );
          },
          checkRedPoint: function (e) {
            var t, a, o, r, c;
            if (
              (void 0 === e && (e = C.DailyAwardRank),
              1 != g_oData.get(g_tData.PassCheckMod).checkActivityOpen())
            )
              return (
                n.setRedPointData(s.PassCheckTaskDay, !1),
                n.setRedPointData(s.PassCheckTaskWeek, !1),
                n.setRedPointData(s.PassCheckTaskUse, !1),
                void n.setRedPointData(s.PassCheckTaskCard, !1)
              );
            g_oData.get(g_tData.PassCheckMod).initAllTask(e);
            var l = !1;
            l = !1;
            for (
              var g,
                d = function () {
                  var t,
                    i,
                    a = g.value;
                  if (
                    (l =
                      null == (t = v[e])
                        ? void 0
                        : null == (i = t.passCheckInfo)
                          ? void 0
                          : i.rows.some(function (e) {
                              return e.id == a.id && 2 == e.status;
                            }))
                  )
                    return "break";
                },
                h = i(
                  null == (t = v[e])
                    ? void 0
                    : t.taskInfo[
                        g_tConst.PassCheckTaskType[g_tConst.PassCheckType.DailyAwardRank][0]
                      ],
                );
              !(g = h()).done && "break" !== d();

            );
            (n.setRedPointData(s.PassCheckTaskDay, l), (l = !1));
            for (
              var u,
                _ = function () {
                  var t,
                    i,
                    a = u.value;
                  if (
                    (l =
                      null == (t = v[e])
                        ? void 0
                        : null == (i = t.passCheckInfo)
                          ? void 0
                          : i.rows.some(function (e) {
                              return e.id == a.id && 2 == e.status;
                            }))
                  )
                    return "break";
                },
                m = i(
                  null == (a = v[e])
                    ? void 0
                    : a.taskInfo[
                        g_tConst.PassCheckTaskType[g_tConst.PassCheckType.DailyAwardRank][1]
                      ],
                );
              !(u = m()).done && "break" !== _();

            );
            if (
              (n.setRedPointData(s.PassCheckTaskWeek, l),
              null != (o = v[e]) && null != (r = o.passCheckInfo) && r.nowMissile
                ? (n.setRedPointData(s.PassCheckTaskUse, v[e].passCheckInfo.nowMissile >= 1),
                  n.setRedPointData(s.PassCheckTaskUse5, v[e].passCheckInfo.nowMissile >= 5))
                : (n.setRedPointData(s.PassCheckTaskUse, !1),
                  n.setRedPointData(s.PassCheckTaskUse5, !1)),
              (l = !1),
              null != (c = v[e]) && c.passCheckInfo)
            )
              for (var f = v[e], p = v[e].passCheckInfo, y = p.vipNum > 0, S = 0; S < p.lv; S++) {
                var D = g_oData
                    .get(g_tData.PassCheckMod)
                    .getReceiveType(S + 1, 1, g_tConst.PassCheckType.DailyAwardRank),
                  T =
                    !y ||
                    g_oData
                      .get(g_tData.PassCheckMod)
                      .getReceiveType(S + 1, 2, g_tConst.PassCheckType.DailyAwardRank);
                if (
                  (!D && f.levelCfg[S].normalGoods.length > 0) ||
                  (!T && f.levelCfg[S].plusGoods.length > 0)
                ) {
                  l = !0;
                  break;
                }
              }
            n.setRedPointData(s.PassCheckTaskCard, l);
          },
          isAutoPop: function () {
            var e = !1,
              t = g_oData.get(g_tData.SwitchModel).getSolarTermsCfg();
            if (!(t = t.PassDay)) return e;
            var i = g_oData.get(g_tData.sdkUser),
              a = i.gameInfo.win + i.gameInfo.equal + i.gameInfo.loss > 0,
              o = new Date(1e3 * g_oData.get(g_tData.sdkLogin).serverTime).setHours(0, 0, 0, 0);
            switch (a ? t.auto : t.autoNew) {
              case 0:
                break;
              case 1:
                var r, c;
                I ||
                  ((e = !0),
                  (I = !0),
                  g_oData
                    .get(g_tData.UserLocalModel)
                    .setData(g_tConst.SolarTermsTodayAuto + "PassDay", o),
                  g_oData
                    .get(g_tData.UserLocalModel)
                    .setData(
                      g_tConst.SolarTermsActAuto + "PassDay",
                      null != (r = null == (c = v[C.DailyAwardRank]) ? void 0 : c.startTimeInt)
                        ? r
                        : o,
                    ));
                break;
              case 2:
                var l, g;
                g_oData
                  .get(g_tData.UserLocalModel)
                  .getData(g_tConst.SolarTermsTodayAuto + "PassDay", -1) != o &&
                  ((e = !0),
                  (I = !0),
                  g_oData
                    .get(g_tData.UserLocalModel)
                    .setData(g_tConst.SolarTermsTodayAuto + "PassDay", o),
                  g_oData
                    .get(g_tData.UserLocalModel)
                    .setData(
                      g_tConst.SolarTermsActAuto + "PassDay",
                      null != (l = null == (g = v[C.DailyAwardRank]) ? void 0 : g.startTimeInt)
                        ? l
                        : o,
                    ));
                break;
              case 3:
                var d,
                  h,
                  u,
                  _ = g_oData
                    .get(g_tData.UserLocalModel)
                    .getData(g_tConst.SolarTermsActAuto + "PassDay", -1);
                v[C.DailyAwardRank] &&
                  _ != (null == (d = v[C.DailyAwardRank]) ? void 0 : d.startTimeInt) &&
                  ((e = !0),
                  (I = !0),
                  g_oData
                    .get(g_tData.UserLocalModel)
                    .setData(g_tConst.SolarTermsTodayAuto + "PassDay", o),
                  g_oData
                    .get(g_tData.UserLocalModel)
                    .setData(
                      g_tConst.SolarTermsActAuto + "PassDay",
                      null != (h = null == (u = v[C.DailyAwardRank]) ? void 0 : u.startTimeInt)
                        ? h
                        : o,
                    ));
                break;
              case 4:
                if (!E) return;
                var m, f;
                ((E = !1),
                  this.checkRedPoint(C.DailyAwardRank),
                  n.getRedPointDatas([s.PassCheckTaskDay, s.PassCheckTaskWeek]) &&
                    ((e = !0),
                    (I = !0),
                    g_oData
                      .get(g_tData.UserLocalModel)
                      .setData(g_tConst.SolarTermsTodayAuto + "PassDay", o),
                    g_oData
                      .get(g_tData.UserLocalModel)
                      .setData(
                        g_tConst.SolarTermsActAuto + "PassDay",
                        null != (m = null == (f = v[C.DailyAwardRank]) ? void 0 : f.startTimeInt)
                          ? m
                          : o,
                      )));
            }
            return e;
          },
          getRedPoint: function () {
            var e = !1,
              t = n.getRedPointData(s.PassCheckTaskDay),
              i = n.getRedPointData(s.PassCheckTaskWeek),
              a = n.getRedPointData(s.PassCheckTaskUse),
              o = n.getRedPointData(s.PassCheckTaskCard),
              r = n.getRedPointData(s.PassCheckTaskUse5);
            return ((t || i || a || o || r) && (e = !0), e);
          },
          initItemCfg: function (e) {
            var t = null,
              i = null,
              a = "",
              o = "",
              n = "",
              s = "";
            if (e)
              switch (e.type) {
                case g_tConst.GameConfig.ItemType.GoldCard:
                  ((t = g_tAsset.BACKPACK_ITEM_PATH[10]),
                    (a =
                      "" +
                      g_oCommonUtils.translateCoinStr(
                        g_oCommonUtils.initProCoin(g_oCommonUtils.Long2Number(e.num)),
                      )),
                    (n = o = "\u6e38\u620f\u8c46"),
                    (s = g_tAsset.BACKPACK_ITEM_BUNDLE[1]),
                    (i = "jindou"));
                  break;
                case g_tConst.GameConfig.ItemType.Diamond:
                  ((t = g_tAsset.BACKPACK_ITEM_PATH[10]),
                    (a = "" + g_oCommonUtils.Long2Number(e.num)),
                    (n = o = "\u94bb\u77f3"),
                    (s = g_tAsset.BACKPACK_ITEM_BUNDLE[1]),
                    (i = "zuanshi"));
                  break;
                case g_tConst.GameConfig.ItemType.ZCoin:
                  ((t = g_tAsset.BACKPACK_ITEM_PATH[10]),
                    (a =
                      "" +
                      g_oCommonUtils.translateCoinStr(
                        g_oCommonUtils.initProCoin(g_oCommonUtils.Long2Number(e.num)),
                      )),
                    (n = o = "\u6307\u5c16\u5e01"),
                    (s = g_tAsset.BACKPACK_ITEM_BUNDLE[1]),
                    (i = "ZCoin"));
                  break;
                case g_tConst.GameConfig.ItemType.CSFare:
                  var r;
                  e.subEffectID < 0 &&
                    (e.subEffectID = (null != (r = e.goodsID) ? r : e.subType) % 1e5);
                  var c = g_oCommonUtils.Long2Number(e.num);
                  ((a = c < 0 || Math.floor(c / 365) >= 10 ? "\u6c38\u4e45" : c + "\u5929"),
                    g_oData.get(g_tData.mod_Bag).loadLocalCfgById(e.subEffectID, function (r) {
                      r &&
                        ((s = g_tAsset.BACKPACK_ITEM_BUNDLE[r.type]),
                        (t = g_tAsset.BACKPACK_ITEM_PATH[r.type]),
                        (i = r.iconSmall),
                        (o = "" + r.name),
                        (n = "" + g_tConst.ServerBagNameByType[r.type]),
                        r.type == g_tConst.ServerBagType.daoJu
                          ? ((a = g_oCommonUtils.Long2Number(e.num) + "\u4e2a"), (n = ""))
                          : g_tConst.ServerBagType.Weapon &&
                            r.type == g_tConst.ServerBagType.Weapon &&
                            (a = ""),
                        926 === e.subEffectID && (o = "\u9ad8\u7ea7\u5165\u573a\u5238"),
                        927 === e.subEffectID && (o = "\u5927\u5e08\u5165\u573a\u5238"));
                    }));
              }
            return (
              i || (i = "wu"),
              { itemBundle: s, itemPathName: i, itemPath: t, itemNum: a, itemName: o, itemType: n }
            );
          },
          getSumArrByArr: function (e) {
            var t = this.getSumByArrType(e, g_tConst.GameConfig.ItemType.GoldCard),
              i = this.getSumByArrType(e, g_tConst.GameConfig.ItemType.ZuanShi),
              a = this.getSumByArrType(e, g_tConst.GameConfig.ItemType.ZCoin),
              o = { type: g_tConst.GameConfig.ItemType.GoldCard, num: t },
              n = { type: g_tConst.GameConfig.ItemType.ZuanShi, num: i },
              s = { type: g_tConst.GameConfig.ItemType.ZCoin, num: a },
              r = e.filter(function (e) {
                return (
                  e.type != g_tConst.GameConfig.ItemType.GoldCard &&
                  e.type != g_tConst.GameConfig.ItemType.ZuanShi &&
                  e.type != g_tConst.GameConfig.ItemType.ZCoin
                );
              }),
              c = [],
              l = [];
            r.forEach(function (e) {
              if (-1 == c.indexOf(e.goodsID)) {
                var t = deepClone(e);
                ((t.num = g_oCommonUtils.Long2Number(t.num)), c.push(e.goodsID), l.push(t));
              } else l[c.indexOf(e.goodsID)].num += g_oCommonUtils.Long2Number(e.num);
            });
            var g = [];
            return (t > 0 && g.push(o), i > 0 && g.push(n), a > 0 && g.push(s), g.concat(l));
          },
          getSumByArrType: function (e, t, i) {
            var a = 0;
            return (
              e
                .filter(function (e) {
                  return i ? e.type == t && e.goodsID == i : e.type == t;
                })
                .forEach(function (e) {
                  a += g_oCommonUtils.Long2Number(e.num);
                }),
              a
            );
          },
        };
        ((t.exports = L), cc._RF.pop());
      },
      {
        "../PassCheck/redPointCtrl/redPointCtrl": "redPointCtrl",
        "../PassCheck/redPointCtrl/redPointEnum": "redPointEnum",
      },
    ],
