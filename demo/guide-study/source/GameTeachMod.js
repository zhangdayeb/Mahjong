    GameTeachMod: [
      function (e, t) {
        "use strict";
        var i;
        cc._RF.push(t, "0ab3bA3esdFhInV2qs245Kr", "GameTeachMod");
        var a = Object.create(null),
          o = [],
          n = null,
          s = null,
          r = null,
          c =
            (((i = {})[12750] = {
              name: "NotifyPlayGuide",
              resp: "PlatEvent.Rsp_NotifyPlayGuide",
              desc: "\u901a\u77e5\u73a9\u6cd5\u6307\u5f15\u5f39\u7a97",
              proto: 0,
            }),
            (i[12751] = {
              name: "CompletePlayGuide",
              req: "PlatEvent.Req_CompletePlayGuide",
              resp: "PlatEvent.Rsp_CompletePlayGuide",
              desc: "\u5b8c\u6210\u73a9\u6cd5\u6307\u5f15",
              proto: 0,
            }),
            (i[12752] = {
              name: "GetPlayGuideData",
              req: "PlatEvent.Req_GetPlayGuideData",
              resp: "PlatEvent.Rsp_GetPlayGuideData",
              desc: "\u83b7\u53d6\u7528\u6237\u73a9\u6cd5\u6307\u5f15\u6570\u636e",
              proto: 0,
            }),
            i);
        function l() {
          for (var e in c)
            if (c.hasOwnProperty(e)) {
              var t = c[e];
              a[t.name] = Number(e);
            }
          g_oEvent.addEventListener(g_tEvent.SDK_GAME_PRIVATE_MSG, function (e, t) {
            var i = c[e];
            if (i) {
              Log.info("netmsg recv cmdId = " + e + ",desc = " + i.name);
              var a = o[i.proto].build(i.resp).decode(t);
              try {
                Log.info("netmsg recv data = ", JSON.stringify(a));
              } catch (err) {
                console.error(err);
              }
              var n = "on" + i.name,
                s = g_oData.get(g_tData.GameTeachMod);
              s[n] && s[n](a);
            }
          });
        }
        function g(e, t) {
          var i = o[c[e].proto].build(c[e].req);
          if (i) {
            var a = new i();
            for (var n in a) a.hasOwnProperty(n) && (a[n] = t[n]);
            Log.info("netmsg send cmdId = " + e + ",desc = " + c[e].name);
            try {
              Log.info("netmsg send data = ", JSON.stringify(a));
            } catch (err) {
              console.error(err);
            }
            g_oData.get(g_tData.sdkPBGamePrivate).sendGamePrivate(e, a);
          }
        }
        var d = {
          __onLoadFinish__: function () {
            ((o[0] = g_oProto.loadProtoFile(g_tAsset.GameTeachPb.format(ZG_GAME_NAME))),
              this.onMessageEvent(),
              l());
          },
          onMessageEvent: function () {
            g_oEvent.addEventListener(
              g_tEvent.SCMJ_REQ_GAME_CONFIG_FINISH,
              function () {
                g_oData.get(g_tData.SwitchModel).getNewPlayerShow();
              }.bind(this),
            );
          },
          get HasAttendPlayTeach() {
            return _HasAttendPlayTeach;
          },
          getCoinNum: function (e) {
            return n[e];
          },
          setCoinNum: function (e) {
            n = e;
          },
          isFinshGuide: function () {
            return (s && s.status) || (r && 0 === r.code);
          },
          haveEnterGuide: function () {
            return g_oData.get(g_tData.UserLocalModel).getData("HAVE_ENTER_TEACH", null);
          },
          getGoodsInfo: function () {
            return s && s.goodsInfo;
          },
          getGuidePlayType: function () {
            return s && s.playType;
          },
          reqData: function () {
            this.reqGetPlayGuideData();
          },
          reqCompletePlayGuide: function () {
            g(a.CompletePlayGuide, {});
          },
          reqGetPlayGuideData: function () {
            g(a.GetPlayGuideData, {});
          },
          onNotifyPlayGuide: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.GameTeachResult.id, "ON_INIT");
          },
          onGetPlayGuideData: function (e) {
            (console.log("haig guide data refresh: msg", JSON.stringify(e)), (s = e));
          },
          onCompletePlayGuide: function (e) {
            (console.log("haig completeguide: msg", JSON.stringify(e)), (r = e));
          },
          CheckShowIsAutoLayer: function () {
            return (
              !g_oData.get(g_tData.SwitchModel).isCheckHandle() &&
              !!g_oData.get(g_tData.UserLocalModel).getData("IS_GAME_TEACH", null)
            );
          },
          reportNewOrOld: function (e) {
            var t = g_tConst.ReportCfg.gameTeach.newOrOld;
            ((t.Step = e), g_oData.get(g_tData.gameReportData).reportAction(t));
          },
          reportExitTeach: function (e) {
            var t = g_tConst.ReportCfg.gameTeach.exitTeach;
            ((t.Step = e), g_oData.get(g_tData.gameReportData).reportAction(t));
          },
          reportFinshStep: function (e) {
            var t = g_tConst.ReportCfg.gameTeach.finshStep;
            ((t.Step = e), g_oData.get(g_tData.gameReportData).reportAction(t));
          },
          reportDlgEnter: function () {
            var e = g_tConst.ReportCfg.gameTeach.dlgEnter;
            g_oData.get(g_tData.gameReportData).reportAction(e);
          },
          reportResultEnter: function () {
            var e = g_tConst.ReportCfg.gameTeach.resultEnter;
            g_oData.get(g_tData.gameReportData).reportAction(e);
          },
          reportTeachAgain: function () {
            var e = g_tConst.ReportCfg.gameTeach.teachAgain;
            g_oData.get(g_tData.gameReportData).reportAction(e);
          },
          reportLobbyEnter: function () {
            var e = g_tConst.ReportCfg.gameTeach.lobbyEnter;
            g_oData.get(g_tData.gameReportData).reportAction(e);
          },
          getRoomInfoByTableInfo: function () {
            return 396;
          },
          inItGameTeach: function () {
            (MJ.GameLogic &&
              (MJ.GameLogic.reqLeaveToGuide(), g_oEvent.dispatchEvent(g_tEvent.INIT_GAME_TEACH)),
              g_oData.get(g_tData.UserLocalModel).setData("IS_GAME_TEACH", !0));
          },
        };
        ((t.exports = d), cc._RF.pop());
      },
      {},
    ],
