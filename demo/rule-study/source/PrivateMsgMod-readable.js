    PrivateMsgMod: [
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
        cc._RF.push(t, "77415IzQeNAnZSBgYJpO5Ck", "PrivateMsgMod");
        var n = [],
          s = 10060,
          r = ["", "ScmjPlat.Rsp_MatchCfg"],
          c = 10061,
          l = ["ScmjPlat.Req_ApplyMatch", "ScmjPlat.Rsp_ApplyMatch"],
          g = 10063,
          d = ["ScmjPlat.Req_GetUserMatchInfo", "ScmjPlat.Rsp_GetUserMatchInfo"],
          h = 10064,
          u = ["", "ScmjPlat.Rsp_UserSceneMatchRecordChg"],
          _ = 10065,
          m = ["", "ScmjPlat.Rsp_UserSceneMatchInfoChg"],
          f = 10140,
          p = ["", "PlatEvent.TCmdS2CAllGameCfg"],
          C = [],
          v = [],
          y = [],
          S = [],
          D = [],
          T = (new Map(), []),
          I = new Map(),
          E = [],
          M = new Map(),
          L = new Map(),
          A = [],
          P = !1;
        function N(e) {
          e.forEach(function (e) {
            e.iRoomType === g_tConst.GameConfig.RoomType.Diy &&
              (g_tAsset.diyCreateConfig[e.iID] ||
                Log.warn(
                  "\u5ba2\u6237\u7aef g_tAsset.diyCreateConfig \u4e2d\u6ca1\u6709\u8be5\u73a9\u6cd5\u7684\u81ea\u5efa\u623f\u89c4\u5219\u914d\u7f6e\uff1a",
                  e,
                ));
          });
        }
        function w(e, t) {
          for (var i = 0; i < e.length; i++) {
            for (var a = e[i], o = !1, n = 0; n < y.length; n++) {
              var s = y[n];
              a.sceneID === s.sceneID && ((s = a), (o = !0));
            }
            !1 === o && y.push(a);
          }
          for (var r = 0; r < t.length; r++) {
            for (var c = t[r], l = !1, g = 0; g < S.length; g++) {
              var d = S[g];
              c.sceneID === d.sceneID && ((d = c), (l = !0));
            }
            !1 === l && S.push(c);
          }
        }
        function R() {
          T.sort(function (e, t) {
            return e.iShowWeight - t.iShowWeight;
          });
          var e = g_oData.get(g_tData.SwitchModel).getFilterGameTypeCfg(),
            t = function (t) {
              for (var i = 0; i < e.length; i++) if (t === e[i]) return !0;
              return !1;
            };
          (function () {
            for (var e = D.length; e--; ) {
              var i = D[e].iID;
              t(i) && D.splice(e, 1);
            }
          })();
          for (
            var a = function (e) {
                var t = T[e];
                ((t.PlayCfgs = {}), (t.PlayCfgs.DiyGame = []), (t.PlayCfgs.CoinGame = []));
                for (
                  var i = t.iAreaCode,
                    a = function (e) {
                      var a = D[e],
                        o = a.iRoomType;
                      (a.iID,
                        a.iAreaCode.forEach(function (e) {
                          e === i &&
                            (o === g_tConst.GameConfig.RoomType.Coin
                              ? t.PlayCfgs.CoinGame.push(a)
                              : o === g_tConst.GameConfig.RoomType.Diy &&
                                t.PlayCfgs.DiyGame.push(a));
                        }));
                    },
                    o = 0;
                  o < D.length;
                  o++
                )
                  a(o);
                (t.PlayCfgs.CoinGame.sort(function (e, t) {
                  return e.iShowWeight - t.iShowWeight;
                }),
                  t.PlayCfgs.DiyGame.sort(function (e, t) {
                    return e.iShowWeight - t.iShowWeight;
                  }));
              },
              o = 0;
            o < T.length;
            o++
          )
            a(o);
          ((function () {
            for (var e = T.length; e--; ) {
              var t = T[e];
              t.PlayCfgs.CoinGame.length + t.PlayCfgs.DiyGame.length <= 0 && T.splice(e, 1);
            }
          })(),
            I.clear());
          for (var n, s = i(T); !(n = s()).done; ) {
            var r = n.value;
            I.set(r.sName, r.iAreaCode);
          }
        }
        function b() {
          M.clear();
          for (var e = 0; e < D.length; e++) {
            var t = D[e],
              i = t.iID;
            M.set(i, t);
          }
        }
        function G() {
          L.clear();
          for (var e = 0; e < E.length; e++) {
            var t = E[e],
              i = t.iID;
            L.set(i, t);
          }
        }
        function k() {
          (R(),
            b(),
            G(),
            0 !== T.length &&
              ((P = !0), g_oEvent.dispatchEvent(g_tEvent.PRIVATEMSG_ON_MJDATA_BUILD)));
        }
        var B = {
          get isBuildOver() {
            return P;
          },
          __onLoadFinish__: function () {
            ((n[0] = g_oProto.loadProtoFile(g_tAsset.common_privateMsgPb.format(ZG_GAME_NAME))),
              (n[1] = g_oProto.loadProtoFile(g_tAsset.GameCfgPb.format(ZG_GAME_NAME))),
              g_oEvent.addEventListener(g_tEvent.SDK_GAME_PRIVATE_MSG, function (e, t) {
                switch ((Log.info("----------recieve privatemsg cmdid:" + e + "----------"), e)) {
                  case c:
                    var i = n[0].build(l[1]).decode(t);
                    g_oEvent.dispatchEvent(g_tEvent.PRIVATEMSG_MATHAPPLY, i);
                    break;
                  case s:
                    var a = n[0].build(r[1]).decode(t);
                    ((C = a.sceneMatchCfgList), (v = a.sceneMatchInfo));
                    break;
                  case g:
                    var o = n[0].build(d[1]).decode(t);
                    (w(o.sceneMatchInfo, o.sceneMatchRecord),
                      g_oEvent.dispatchEvent(g_tEvent.PRIVATEMSG_ON_MATCH_USERINFO, {
                        UserSceneMatchInfos: y,
                        UserSceneMatchRecords: S,
                      }));
                    break;
                  case h:
                    for (var I = n[0].build(u[1]).decode(t), M = 0; M < S.length; M++)
                      S[M].sceneID === I.sceneMatchRecord.sceneID && (S[M] = I);
                    g_oEvent.dispatchEvent(g_tEvent.PRIVATEMSG_ON_UPDATE_MATCH_RECORDE, S);
                    break;
                  case _:
                    for (var L = n[0].build(m[1]).decode(t), P = 0; P < y.length; P++)
                      y[P].sceneID === L.sceneMatchInfo.sceneID && (y[P] = L);
                    g_oEvent.dispatchEvent(g_tEvent.PRIVATEMSG_ON_UPDATE_MATCH_INFO, y);
                    break;
                  case f:
                    var R = n[1].build(p[1]).decode(t);
                    (console.log(R),
                      N((D = R.stMahjongPlay)),
                      (T = R.stAreaCfg),
                      (E = R.stQualifyingCfg),
                      (A = R.qualifyingSceneAddition),
                      k());
                }
              }),
              g_oEvent.addEventListener(g_tEvent.SCMJ_REQ_GAME_CONFIG_FINISH, function () {
                k();
              }));
          },
          reqMatchApply: function (e, t) {
            var i = new (n[0].build(l[0]))();
            ((i.reqCode = e),
              (i.sceneID = t),
              g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(c, i));
          },
          reqUserMatchInfo: function (e) {
            var t = new (n[0].build(d[0]))();
            ((t.sceneID = e), g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(g, t));
          },
          getMatchCfgs: function () {
            return (
              C.sort(function (e, t) {
                return e.sceneID - t.sceneID;
              }),
              C
            );
          },
          getMatchCfgBySceneId: function (e) {
            for (var t = 0; t < C.length; t++) if (C[t].sceneID === e) return C[t];
          },
          getMatchInfos: function () {
            return v;
          },
          getMatchRewardInfo: function (e, t) {
            return C.filter(function (t) {
              if (e === t.sceneID) return t;
            })[0].rewardList.filter(function (e) {
              if (e.rank === t) return e;
            })[0];
          },
          getUserMatchRecords: function () {
            return S;
          },
          getUserMatchInfos: function () {
            return y;
          },
          getUserMatchInfoBySceneId: function (e) {
            for (var t = 0; t < y.length; t++) if (y[t].sceneID === e) return y[t];
          },
          getUserMatchRecordsBySceneId: function (e) {
            for (var t = {}, i = 0; i < S.length; i++)
              if (S[i].sceneID === e) {
                t = S[i];
                break;
              }
            return (
              0 === Object.keys(t).length &&
                ((t.sceneID = e),
                (t.applyCount = 0),
                (t.bestRank = 0),
                (t.bestRankTime = 0),
                (t.enterFinalTurn = 0),
                (t.getBountyNum = 0),
                (t.todayFreeCount = 0)),
              t
            );
          },
          getRoomTypeByGameType: function (e) {
            return this.getPlayCfgByGameType(e).iRoomType;
          },
          getPlayCfgByGameType: function (e) {
            return M.get(e) || {};
          },
          getSectionCfgByGameType: function (e) {
            return L.get(e) || {};
          },
          isExistSectionCfgByGameType: function (e) {
            return !isNull(L.get(e));
          },
          getSceneAddBySceneID: function (e, t) {
            cc.assert(
              cc.js.isNumber(e) && cc.js.isNumber(t),
              "getSceneAddBySceneID : argument is error",
            );
            var i = g_oData.get(g_tData.mod_gamecfg).getGameTypeSceneCfgs(e),
              a = [];
            i.forEach(function (e) {
              a.push(e.typeID);
            });
            var o = a.indexOf(t);
            return this.getSceneAddByIndex(o);
          },
          getSceneAddByIndex: function (e) {
            return A[e] || 0;
          },
          getMJAreaCfg: function () {
            return T;
          },
          getMJPlayCfgs: function () {
            return D;
          },
          getMJDiyPlayCfgs: function () {
            return D.filter(function (e) {
              return e.iRoomType === g_tConst.GameConfig.RoomType.Diy;
            });
          },
          getMjPlayCfgByGameType: function (e) {
            return D.find(function (t) {
              return t.iID === e;
            });
          },
          getMjSectionMatchCfgs: function () {
            return L;
          },
          getAreaCfgByAreaCode: function (e) {
            for (var t = 0; t < T.length; t++) {
              var i = T[t];
              if (i.iAreaCode === e) return i;
            }
          },
          getAreaCodeByAreaName: function (e) {
            if (!I) return 51;
            e = (e = e.replace("\u7701", "")).replace("\u5e02", "");
            var t = I.get(e);
            if (t) return t;
            var i = Object.keys(I);
            if (i.length > 0)
              return (
                console.error(
                  "PrivateMsgMod.js getAreaCodeByAreaName(AreaName)",
                  "\u83b7\u53d6AreaCode\u5931\u8d25\uff0c\u8f93\u5165\u7684AreaName\u662f",
                  e,
                ),
                I.get(i[0])
              );
            var a =
              window.g_oMjProject &&
              g_tConst.MJ_GameTypeRecommend[g_tConst.MJ_BODY_TYPE[g_oMjProject.MjBodyType]]
                .HOT_AREA_NAME;
            return I.get(a);
          },
          getAreaNewGameType: function (e, t) {
            for (var i = [], a = 0; a < D.length; a++)
              for (
                var o = D[a], n = o.iTag, s = o.iID, r = o.iRoomType, c = 0;
                c < o.iAreaCode.length;
                c++
              )
                o.iAreaCode[c] === e && 2 === n && r === t && i.push(s);
            return i;
          },
          isBelongProvince: function (e) {
            var t =
              g_oPlatform.getPlatUserInfo().province ||
              g_oNativeHelp.getPlayerPosition().Province ||
              "";
            return !("" == t || (!e.includes(t) && !t.includes(e)));
          },
          getProvinceHotGame: function () {
            var e =
                g_oPlatform.getPlatUserInfo().province ||
                g_oNativeHelp.getPlayerPosition().Province ||
                "",
              t = { nHotAreaCode: -1, nHotGameType: -1 };
            if (!e || "" === e) return t;
            for (var i = 0; i < T.length; i++) {
              var a = T[i],
                o = a.sName;
              if (this.isBelongProvince(o)) {
                ((t.nHotAreaCode = a.iAreaCode), (t.nHotGameType = a.PlayCfgs.CoinGame[0].iID));
                break;
              }
            }
            return t;
          },
          getAreaHotGame: function (e) {
            for (var t = 0; t < T.length; t++) {
              var i = T[t];
              if (i.iAreaCode === e) return i.PlayCfgs.CoinGame[0].iID;
            }
            return -1;
          },
          getAreaHotGames: function (e, t, i) {
            for (var a = 0; a < T.length; a++) {
              var o = T[a];
              if (o.iAreaCode === e)
                return t
                  ? ((i = i < 0 ? o.PlayCfgs.DiyGame.length : i), o.PlayCfgs.DiyGame.slice(0, i))
                  : ((i = i < 0 ? o.PlayCfgs.CoinGame.length : i), o.PlayCfgs.CoinGame.slice(0, i));
            }
            return null;
          },
          getGameNameByGameType: function (e) {
            var t = M.get(e);
            return t && t.sName ? t.sName : "";
          },
          getGameCfgByGameType: function (e) {
            for (var t = 0; t < D.length; t++) {
              var i = D[t];
              if (i.iID === e) return i;
            }
            return null;
          },
          getGameTypeByProity: function (e) {
            for (var t = 0; t < D.length; t++) {
              var i = D[t],
                a = i.iShowWeight,
                o = i.iID;
              if (a === e) return o;
            }
          },
          getAreaCfgByPriority: function (e) {
            for (var t = 0; t < T.length; t++) {
              var i = T[t];
              if (i.iShowWeight === e) return i;
            }
          },
        };
        ((t.exports = B), cc._RF.pop());
      },
      {},
    ],
