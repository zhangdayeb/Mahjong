    ConfigPrefab: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "9f090G28bFLVIKdOE9K5QFe", "ConfigPrefab");
        var i = e("mod_LoadHelperConst"),
          a = e("CommonUtils"),
          o = !0,
          n = Object.create(null),
          s = Object.create(null),
          r =
            (Object.create(null),
            {
              init: function () {},
              getListByType: function (e) {
                return (
                  cc.assert(
                    "string" == typeof e && n[e],
                    "Invalid nType of argument 1, need a string",
                  ),
                  n[e]
                );
              },
              getPathByName: function (e, t) {
                return (
                  cc.assert(
                    "string" == typeof e && n[e],
                    "Invalid nType of argument 1, need a string",
                  ),
                  n[e][t]
                );
              },
              register: function (e, t, i) {
                (n[e] || (n[e] = {}), n[e][t] || (n[e][t] = "mjhj/" + i));
              },
              getHallList: function (e) {
                var t = {},
                  n = [],
                  s = a.isTodayFirstLogin();
                (!g_oPlatform.isNewUser() && o && n.push(g_tConst.GameLayerCfg.PublicNotice),
                  s &&
                    (e || o) &&
                    ((n = n.concat([
                      g_tConst.GameLayerCfg.Hall_KeepLogin,
                      g_tConst.GameLayerCfg.Slyder,
                    ])),
                    (o = !1)));
                for (var r = g_tAsset, c = 0; c < n.length; c++) {
                  var l = n[c],
                    g = l.prefabPath;
                  (this.register(l.from, g, r[g]),
                    (t[g] = {}),
                    (t[g].nType = l.from),
                    (t[g].name = g),
                    (t[g].bSyn = l.bSyn),
                    (t[g].bRelease = l.bRelease),
                    (t[g].path = "mjhj/" + r[g]));
                }
                return (
                  (t.GameToastPreb = {
                    nType: i.HALL,
                    name: "GameToastPreb",
                    path: "mjhj/" + g_tAsset.GameToastPreb,
                    bSyn: !1,
                    bRelease: !1,
                  }),
                  t
                );
              },
              getGameListInHall: function () {
                var e = {
                  tile_base_front: {
                    nType: i.GAME.COMMON,
                    name: "tile_base_front",
                    path: "prefabs/game/Tiles/prefeb/base/tile_base_front",
                    bSyn: !1,
                    bRelease: !1,
                  },
                  tile_base_left: {
                    nType: i.GAME.COMMON,
                    name: "tile_base_left",
                    path: "prefabs/game/Tiles/prefeb/base/tile_base_left",
                    bSyn: !1,
                    bRelease: !1,
                  },
                  tile_base_mine: {
                    nType: i.GAME.COMMON,
                    name: "tile_base_mine",
                    path: "prefabs/game/Tiles/prefeb/base/tile_base_mine",
                    bSyn: !1,
                    bRelease: !1,
                  },
                  tile_base_right: {
                    nType: i.GAME.COMMON,
                    name: "tile_base_right",
                    path: "prefabs/game/Tiles/prefeb/base/tile_base_right",
                    bSyn: !1,
                    bRelease: !1,
                  },
                  DisplayTile: {
                    nType: i.GAME.COMMON,
                    name: "DisplayTile",
                    path: "prefabs/game/Tiles/prefeb/base/DisplayTile",
                    bSyn: !1,
                    bRelease: !1,
                  },
                };
                for (var t in e) e[t].path = "mjhj/" + e[t].path;
                return e;
              },
              getGameAniList: function () {
                var e = {},
                  t = g_tAsset.GameAnimPrefabMap,
                  a = {
                    chi2: t.chi2,
                    peng2: t.peng2,
                    gang2: t.gang2,
                    hu2: t.hu2,
                    huDian: t.huDian,
                    ziMo2: t.ziMo2,
                    ZiMoLight: t.ZiMoLight,
                    QGH: t.QGH,
                    shaizi: t.shaizi,
                    kaiju: t.kaiju,
                    xiayu: t.guafeng,
                    guafeng: t.guafeng,
                    liuJu: t.liuJu,
                    MingPai: t.MingPai,
                  },
                  o = ["shaizi", "kaiju"];
                for (var n in a)
                  ((e[n] = {}),
                    (e[n].nType = i.GAME.ANIM),
                    (e[n].name = n + "_anim"),
                    (e[n].bSyn = -1 !== o.indexOf(n)),
                    (e[n].bRelease = !e[n].bSyn),
                    (e[n].path = "mjhj/" + a[n]));
                return e;
              },
              getCurGameDesk: function () {
                var e = g_tConst.ServerBagType.CardTable,
                  t = g_oData.get(g_tData.mod_Bag).getCurUseId(e),
                  a = g_oData.get(g_tData.mod_Bag).getCurUseLocalCfg(t, e),
                  o = g_tAsset.GameDeskPrefabPath + a.PrefabName,
                  n = {};
                return (
                  (n.nType = i.GAME.COMMON),
                  (n.name = o),
                  (n.bSyn = !0),
                  (n.bRelease = !1),
                  (n.path = "mjhj/" + o),
                  n
                );
              },
              getGameListInGame: function () {
                var e = g_oData.get(g_tData.mod_LoadHelper).getRoomInfoByTableInfo(),
                  t = Object.create(null),
                  a = 0;
                for (var o in s)
                  if (s[o]) {
                    a = 1;
                    break;
                  }
                var n = e.roomType;
                if (0 == a)
                  for (
                    var r = [g_tConst.GameLayerCfg, g_tConst.GameExLayerCfg], c = [], l = 0;
                    l < r.length;
                    l++
                  ) {
                    var g = r[l];
                    for (var d in g)
                      if (g.hasOwnProperty(d)) {
                        -1 != c.indexOf(d)
                          ? cc.error(
                              "GameLayerCfg \u548c GameExLayerCfg\u4e0d\u80fd\u5b9a\u4e49\u91cd\u590d\u7684key : " +
                                d,
                            )
                          : c.push(d);
                        var h = g[d].prefabPath,
                          u = g[d].from;
                        (s[u] || (s[u] = Object.create(null)),
                          (s[u][h] = g[d]),
                          u != i.HALL &&
                            (u == i.GAME.COMMON ? (t[h] = g[d]) : u == n && (t[h] = g[d]),
                            n == i.GAME.MATCH.SECTION && u == i.GAME.MATCH.COIN && (t[h] = g[d])));
                      }
                  }
                else {
                  var _ = [i.GAME.COMMON];
                  (n == i.GAME.MATCH.SECTION && _.push(i.GAME.MATCH.COIN), _.push(n));
                  for (var m = 0; m < _.length; m++) {
                    var f = _[m];
                    if (s[f]) for (var p in s[f]) t[p] = s[f][p];
                  }
                }
                for (var C = e.useRule, v = g_tConst.RuleCfgs, y = 0; y < e.useRule.length; ) {
                  for (var S in v) {
                    var D = S;
                    if (void 0 !== D && v.hasOwnProperty(D) && v[D].id == C[y]) {
                      if (!v[D].proto || !v[D].proto.layers) {
                        cc.error("ruleCfgs \u672a\u5b9a\u4e49\u63a5\u53e3 override : " + D);
                        continue;
                      }
                      for (var T = v[D].proto.layers() || [], I = 0; I < T.length; I++) {
                        var E = T[I].prefabPath;
                        E
                          ? t[E] || (t[E] = T[I])
                          : cc.error("ruleCfgs \u672a\u5b9a\u4e49 prefabPath : ", T[I]);
                      }
                      break;
                    }
                  }
                  y++;
                }
                var M = {},
                  L = g_tAsset;
                for (var A in t) {
                  var P = t[A],
                    N = P.prefabPath;
                  (this.register(P.from, N, L[N]),
                    (M[N] = {}),
                    (M[N].nType = P.from),
                    (M[N].name = N),
                    (M[N].bSyn = P.bSyn),
                    (M[N].bRelease = P.bRelease),
                    (M[N].path = "mjhj/" + L[N]));
                }
                var w = this.getGameAniList();
                for (var R in w) M[R] = w[R];
                var b = this.getCurGameDesk();
                return ((M[b.name] = b), M);
              },
              getIsRelease: function (e, t) {
                var i = g_oData.get(g_tData.mod_LoadHelper).getEnterTableFrom() || [],
                  a = !!s[e] && s[e][t];
                return (!a || -1 == i.indexOf(a.id)) && !!a && a.bRelease;
              },
              getIsReleaseByUrl: function () {
                var e = g_tAsset;
                (e.RecommendGamePrefab,
                  e.TingTipPrefab,
                  e.prefab_TipTime,
                  e.GameRMBRedBagEntryPrefab,
                  e.GameAnimPrefabMap);
              },
            });
        ((t.exports = r), cc._RF.pop());
      },
      { CommonUtils: "CommonUtils", mod_LoadHelperConst: "mod_LoadHelperConst" },
    ],
