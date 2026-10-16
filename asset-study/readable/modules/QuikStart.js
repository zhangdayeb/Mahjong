    QuikStart: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "f1c9anhwx5JKaUCe+Vpg3s0", "QuikStart");
        var i = e("CommonGT"),
          a = !1,
          o = {
            tempForceGT: [],
            quickStart: function (e, t) {
              (g_oData
                .get(g_tData.mod_DataCenter)
                .reportEnterTable(g_tConst.GameConfig.RoomType.Coin),
                g_oMgrRecord.time(g_tConst.ReportCfg.TimeRecord.EnterTableToGame.MAIN));
              var i = this.getRecommendSceneCfg(t);
              (Log.info("\u5feb\u901f\u5f00\u59cb\u573a\u6b21\u5339\u914d = ", i),
                this.saveLastGameType(i.gameType),
                g_oEvent.dispatchEvent(g_tEvent.HALL_EVENT_ENTER_TABLE, i.typeID, e));
            },
            enterTable: function (e, t) {
              (Log.info("\u8fdb\u5165\u573a\u6b21 = ", t),
                console.warn("\u8fdb\u5165\u573a\u6b21 = ", t),
                g_oEvent.dispatchEvent(g_tEvent.HALL_EVENT_ENTER_TABLE, t, e));
            },
            checkJumpToPlay: function () {
              if (!a) {
                a = !0;
                var e = g_oData.get(g_tData.SwitchModel).refreshJumpToPlayCfg();
                e && this.saveLastGameType(e);
              }
            },
            getRecommendSceneCfg: function (e) {
              this.checkJumpToPlay();
              var t = this._getTempForceGametype(),
                i = this.getLastGameType(),
                a =
                  e ||
                  t ||
                  i ||
                  g_oMjProject.CurGameTypeInfo.nGameType ||
                  g_tConst.GameTypeCfgs.JBCXZDDHSZ.TYPEID;
              g_oData.get(g_tData.SectionMatchMod).isSectionMatchState &&
                ((a != g_tConst.GameTypeCfgs.XLHZMJ.TYPEID &&
                  a != g_tConst.GameTypeCfgs.LZXLMJ.TYPEID &&
                  a != g_tConst.GameTypeCfgs.SJCCMJ.TYPEID &&
                  a != g_tConst.GameTypeCfgs.SJCCBXP.TYPEID &&
                  a != g_tConst.GameTypeCfgs.XLHZMJ5.TYPEID &&
                  a != g_tConst.GameTypeCfgs.XL8HZBXP.TYPEID &&
                  a != g_tConst.GameTypeCfgs.FKBHZMJ.TYPEID &&
                  a != g_tConst.GameTypeCfgs.ZSXL8HZBXP.TYPEID &&
                  a != g_tConst.GameTypeCfgs.ZHHXSHMJ.TYPEID &&
                  a != g_tConst.GameTypeCfgs.FKSJCCBXP.TYPEID &&
                  a != g_tConst.GameTypeCfgs.SESXMJ.TYPEID) ||
                  (a = g_tConst.GameTypeCfgs.JBCXZDDHSZ.TYPEID));
              var o = this.checkGameTypeUseCoin(a),
                n = g_tConst.GameConfig.quickRecommendCheckCfg[o],
                s = g_oData.get(g_tData.sdkUser)[n.value],
                r = [];
              r = g_oData.get(g_tData.mod_gamecfg).getGameTypeSceneCfgs(Number(a));
              var c = g_oData.get(g_tData.SwitchModel).getTableItemSelCfg();
              if (c)
                for (var l = 0; l < r.length; l++)
                  c[r[l].typeID] &&
                    (r[l] = g_oData
                      .get(g_tData.mod_gamecfg)
                      .getSceneCfgBySceneID(Number(c[r[l].typeID])));
              var g = g_oData.get(g_tData.SwitchModel).getJumpSceneCoefficient(),
                d = r[0];
              d.level = 0;
              for (var h = d[n.lower], u = 1; u < r.length; u++)
                if (!g_oData.get(g_tData.DianFengSaiMod).canSupportScene(r[u].typeID)) {
                  var _ = r[u],
                    m = g * _.blind,
                    f = _[n.lower],
                    p = _[n.upper],
                    C = r[u - 1][n.lower],
                    v = r[u - 1][n.upper];
                  if (
                    s >= f &&
                    (s < p || -1 == p) &&
                    (s >= m || (p < m && -1 !== p) || (s >= C && -1 !== v))
                  )
                    if (f > h) ((h = f), ((d = _).level = u));
                    else if (f == h) {
                      var y = parseInt(d.extra.match(/sceneIndex:([+-]?\d+)/)[1]),
                        S = parseInt(_.extra.match(/sceneIndex:([+-]?\d+)/)[1]);
                      y && S ? S > y && ((d = _).level = u) : ((d = _).level = u);
                    }
                }
              return ((d.fullDesc = this._getFullDesc(d)), d);
            },
            checkGameTypeUseCoin: function (e) {
              var t = "Coin";
              return (i.isZCoinGameType(e) && (t = "ZCoin"), t);
            },
            _getFullDesc: function (e) {
              return (
                g_oData.get(g_tData.PrivateMsgModel).getGameNameByGameType(e.gameType) +
                "." +
                this.__traslateLevel(e.level)
              );
            },
            __calculateLevel: function (e) {
              for (
                var t = g_oData.get(g_tData.mod_gamecfg).getGameTypeSceneCfgs(Number(e.gameType)),
                  i = this.checkGameTypeUseCoin(e.gameType),
                  a = g_tConst.GameConfig.quickRecommendCheckCfg[i],
                  o = 0,
                  n = 0;
                n < t.length;
                n++
              ) {
                var s = t[n];
                e[a.lower] === s[a.lower] && (o = Math.max(o, n));
              }
              return o;
            },
            getSceneNameByCfg: function (e) {
              return this.__traslateLevel(this.__calculateLevel(e));
            },
            __traslateLevel: function (e) {
              var t = "";
              switch (e) {
                case 0:
                  t = "\u65b0\u624b";
                  break;
                case 1:
                  t = "\u521d\u7ea7";
                  break;
                case 2:
                  t = "\u8fdb\u9636";
                  break;
                case 3:
                  t = "\u9ad8\u7ea7";
                  break;
                case 4:
                  t = "\u5927\u5e08";
                  break;
                case 5:
                  t = "\u81f3\u5c0a";
                  break;
                default:
                  (Log.error("\u51fa\u73b0\u4e86\u9519\u8bef\u7684Level\uff0c\u4e3a", e),
                    (t = "\u9519\u8bef"));
              }
              return t + "\u573a";
            },
            saveLastGameType: function (e) {
              (cc.assert("number" == typeof e, "error, nGameType typeof is " + typeof e),
                (i.isCoinGametype(e) || i.isZCoinGameType(e)) &&
                  g_oData.get(g_tData.UserLocalModel).setData("QuickStartGameType", e),
                g_oEvent.dispatchEvent("QUICKSTART_GAMETYPE_CHANGE"));
            },
            getLastGameType: function () {
              return g_oData.get(g_tData.UserLocalModel).getData("QuickStartGameType", null);
            },
            _getTempForceGametype: function () {
              return this.tempForceGT.length > 0
                ? this.tempForceGT[this.tempForceGT.length - 1]
                : null;
            },
            popTempForceGametype: function () {
              this.tempForceGT.pop();
            },
            pushTempForceGametype: function (e) {
              this.tempForceGT.includes(e) || this.tempForceGT.push(e);
            },
            canEnterSceneLower: function (e) {
              var t = !1,
                i = g_oData.get(g_tData.mod_gamecfg).getSceneCfgBySceneID(e);
              if (!isNull(i)) {
                var a = this.checkGameTypeUseCoin(i.gameType),
                  o = g_tConst.GameConfig.quickRecommendCheckCfg[a];
                t = g_oData.get(g_tData.sdkUser)[o.value] > i[o.lower];
              }
              return t;
            },
          };
        ((window.QuickStart = o), (t.exports = o), cc._RF.pop());
      },
      { CommonGT: "CommonGT" },
    ],
