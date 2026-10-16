    CommonGT: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "13e96b6l+xE8pHSILXgbgrA", "CommonGT");
        var i = new Map(),
          a = new Map(),
          o = e("RoomTypeEnum"),
          n = {
            __onLoadFinish__: function () {
              this._initCoinDiyMap();
            },
            _initCoinDiyMap: function () {
              for (var e in g_tConst.GameTypeCfgs)
                if (g_tConst.GameTypeCfgs.hasOwnProperty(e)) {
                  var t = g_tConst.GameTypeCfgs[e];
                  isNull(t.DIY_TYPEID)
                    ? isNull(t.COIN_TYPEID) || a.set(t.TYPEID, t.COIN_TYPEID)
                    : i.set(t.TYPEID, t.DIY_TYPEID);
                }
            },
            coin2diy: function (e) {
              return i.has(e) ? i.get(e) : null;
            },
            diy2coin: function (e) {
              return a.has(e) ? a.get(e) : null;
            },
            isGametype: function (e) {
              for (var t in g_tConst.GameTypeCfgs)
                if (
                  g_tConst.GameTypeCfgs.hasOwnProperty(t) &&
                  g_tConst.GameTypeCfgs[t].TYPEID === e
                )
                  return !0;
              return !1;
            },
            isDiyGametype: function (e) {
              var t = this.getGameTypeCfgs(e);
              return t
                ? t.RoomType === o.Diy
                : (Log.error(
                    "BIRD\ud83d\ude21>>>",
                    "CommonGT.js",
                    "isCoinGametype(gametype) gametype is",
                    e,
                    "fail to judge isCoinGametype",
                  ),
                  !1);
            },
            isCoinGametype: function (e) {
              var t = this.getGameTypeCfgs(e);
              return t
                ? t.RoomType === o.Coin || t.RoomType === o.ZCoin
                : (Log.error(
                    "BIRD\ud83d\ude21>>>",
                    "CommonGT.js",
                    "isCoinGametype(gametype) gametype is",
                    e,
                    "fail to judge isCoinGametype",
                  ),
                  !1);
            },
            getGameTypeCfgs: function (e) {
              var t = null;
              for (var i in g_tConst.GameTypeCfgs)
                if (g_tConst.GameTypeCfgs.hasOwnProperty(i)) {
                  var a = g_tConst.GameTypeCfgs[i];
                  if (a.TYPEID === e) {
                    t = a;
                    break;
                  }
                }
              return t;
            },
            getGamtypeCorspAreacode: function (e) {
              return isNull(e) ? null : g_tConst.GametypeAreacodeMap[e];
            },
            isTeamGT: function (e) {
              return g_tConst.TEAM_GT.includes(e);
            },
            findCfgById: function (e) {
              var t = g_tConst.GameTypeCfgs;
              for (var i in t)
                if (t.hasOwnProperty(i)) {
                  var a = t[i];
                  if (a.TYPEID === e) return a;
                }
              return null;
            },
            findCfgByName: function (e) {
              var t = g_tConst.GameTypeCfgs;
              for (var i in t)
                if (t.hasOwnProperty(i)) {
                  var a = t[i];
                  if (a.Name === e) return a;
                }
              return null;
            },
            isZCoinGameType: function (e) {
              var t = !1,
                i = g_oData.get(g_tData.mod_gamecfg).getGameTypeSceneCfgs(e);
              return (Array.isArray(i) && i.length > 0 && (t = i[0].enterFingerCoinLower > 0), t);
            },
          };
        ((t.exports = n), cc._RF.pop());
      },
      { RoomTypeEnum: "RoomTypeEnum" },
    ],
