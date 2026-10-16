    SceneLoader: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "066b1f78CNCq4Gf6zbBKPmG", "SceneLoader");
        var i = e("MgrPackage"),
          a = e("ResPoolManager"),
          o = e("ConfigPrefab"),
          n = (e("CommonUtils"), e("UserInfoYuyinManger")),
          s = !1,
          r = "login",
          c = "login",
          l = null,
          g = e("GameTestData"),
          d = function () {
            if (g_tConst.ResCfgs.bOpenTest) {
              g_oData.get(g_tData.mod_GameTest).set("serverData", g.serverData || {});
              var e = (MJ && MJ.GameLogic && MJ.GameLogic.events()) || {};
              (g_oData.get(g_tData.mod_GameTest).registProtos(e, !1),
                g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.GameTest.id, "ON_INIT"));
            }
          },
          h = {
            __onLoadFinish__: function () {
              this.onMessageEvent();
            },
            onMessageEvent: function () {
              g_oEvent.addEventListener(
                g_tEvent.SYS_APP_ENTER_FOREGROUND_EVENT,
                function () {
                  (Log.info("SYS_APP_ENTER_FOREGROUND_EVENT"), this.updateCanvas());
                },
                this,
              );
            },
            preloadScene: function (e, t) {
              (Log.info(">>>>\u9884\u52a0\u8f7d\u573a\u666f", e), g_oEngine.preloadScene(e, t));
            },
            getCurScene: function () {
              return r;
            },
            getLastScene: function () {
              return c;
            },
            onLoadErrorScene: function (e) {
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Alert.id, "ON_INIT", {
                data: {
                  value:
                    "\u7f51\u7edc\u8fde\u63a5\u5f02\u5e38\uff0c\n\u8bf7\u68c0\u67e5\u7f51\u7edc\u540e\u518d\u91cd\u8bd5\u3002",
                  type: 1,
                  ok: e,
                },
              });
            },
            preloadAsyn: function (e, t, a) {
              (this.stopPreloadAsyn(),
                (l = g_oMgrScheduler.scheduleOnce(
                  function () {
                    var t;
                    (e == g_tConst.SceneCfgs.lobby
                      ? (t = i.getGamePackage())
                      : e == g_tConst.SceneCfgs.game && (t = i.getHallPackage()),
                      i.checkDownPackage(t)
                        ? a && a()
                        : i.downMuchPackage(t, null, function (e, t, i) {
                            e ? a && a(e) : i && a && a();
                          }));
                  },
                  null,
                  t,
                )));
            },
            stopPreloadAsyn: function () {
              l && (g_oMgrScheduler.unschedule(l), (l = null));
            },
            gotoScene: function (t, i, s) {
              var l = this;
              if (
                (void 0 === i && (i = function () {}),
                void 0 === s &&
                  (s = function (e) {
                    e();
                  }),
                console.log("gotoScene senceName:" + t),
                t !== r)
              ) {
                (g_oSceneLoader.getCurScene() !== g_tConst.SceneCfgs.login &&
                  g_oCtrl.get(g_tCtrl.com_loading).openFlowLoading(0),
                  this.stopPreloadAsyn());
                var g = {
                  from:
                    "Canvas" === g_oSceneMgr.canvas.name
                      ? g_tConst.SceneCfgs.login
                      : g_oSceneMgr.canvas.name,
                  to: t,
                };
                ((r = t), (c = g.from));
                var h = g.to === g_tConst.SceneCfgs.lobby && g.from !== g_tConst.SceneCfgs.game,
                  u = "scene_change_" + g.from + "_to_" + g.to;
                (h && g_oMJNetManger.pauseGameLoop(u), a.clearAll(), g_oItemPoolManager.clearAll());
                var _ = function () {
                    (g_oCtrl.get(g_tCtrl.com_loading).closeFlowLoading(),
                      cc.director.loadScene(t, function (e) {
                        if (
                          (Log.info("runScene success isSuccess ", !e, e),
                          h && g_oMJNetManger.resumeGameLoop(u),
                          l.setFrameRate(),
                          l.updateCanvas(),
                          l.setAudioSources(t),
                          (g_oSceneMgr.canvas.name = t),
                          g_oEvent.dispatchEvent(g_tEvent.SCENELOADER_SCENECHG, g),
                          Log.info(">>>>\u8f7d\u5165\u573a\u666f", t),
                          t === g_tConst.SceneCfgs.lobby)
                        ) {
                          if (g.from === g_tConst.SceneCfgs.login) {
                            g_oMgrPrefab.preloadAsynList(g_oMgrPrefab.eType.HALL);
                            var i = o.getGameListInHall();
                            (g_oMgrPrefab.preloadSynList(i, g_oMgrPrefab.eType.GAME),
                              g_oMgrPrefab.preloadAsynList(g_oMgrPrefab.eType.GAME, 0.8, 0));
                          } else
                            g.from == g_tConst.SceneCfgs.game &&
                              g_tConst.ResCfgs.bAutoRelease &&
                              g_oMgrPrefab.releaseByType(g_oMgrPrefab.eType.GAME);
                          (g_oData.get(g_tData.HistoryMod).restore(), d());
                        } else
                          t === g_tConst.SceneCfgs.game &&
                            (g.from == g_tConst.SceneCfgs.lobby &&
                              g_tConst.ResCfgs.bAutoRelease &&
                              g_oMgrPrefab.releaseByType(g_oMgrPrefab.eType.HALL),
                            g_oMgrPrefab.unPreload(g_oMgrPrefab.eType.GAME),
                            g_oMgrPrefab.preloadAsynList(g_oMgrPrefab.eType.GAME, 0.5, 2),
                            d());
                      }));
                  },
                  m = function (e, t) {
                    Math.floor((e / t) * 100);
                  },
                  f = function () {
                    (Log.info("preloadScene complete"), i && i(), s && s(_));
                  },
                  p = 0,
                  C = 0,
                  v = function () {
                    C == p && cc.director.preloadScene(t, m, f);
                  };
                if (t === g_tConst.SceneCfgs.game) {
                  var y = g_oData.get(g_tData.mod_LoadHelper).getRoomInfoByTableInfo();
                  y && y.gameType == g_tConst.GameTypeCfgs.SGMJ2.TYPEID
                    ? (p++,
                      p++,
                      e("SanGuoTableUICtrl").createLayer(function () {
                        (C++, v && v());
                      }, null),
                      e("SGMatchingAnimCtrl").createDlg(function () {
                        (C++, v && v());
                      }, null))
                    : y && y.gameType == g_tConst.GameTypeCfgs.LS6HZ.TYPEID
                      ? (p++,
                        e("MatchingCtrl").createLayer(function () {
                          (C++, v && v());
                        }, null))
                      : v && v();
                } else v && v();
                if (t === g_tConst.SceneCfgs.lobby) {
                  var S = o.getHallList();
                  g_oMgrPrefab.preloadSynList(S, g_oMgrPrefab.eType.HALL);
                } else if (t === g_tConst.SceneCfgs.game) {
                  g_oMgrPrefab.unPreload(g_oMgrPrefab.eType.HALL);
                  var D = o.getGameListInGame();
                  (g_oMgrPrefab.preloadSynList(D, g_oMgrPrefab.eType.GAME),
                    g_oAudioManager.preloadCommon(),
                    n.exit());
                }
              }
            },
            setAudioSources: function (e) {
              (e == g_tConst.SceneCfgs.lobby &&
                g_oAudioManager.playBGMByPriority(g_tAsset.bgSound, !0),
                s ||
                  ((s = !0),
                  g_oAudioManager.loadRes(
                    g_tAsset.btnSound,
                    function (e) {
                      g_oAudioMgr.setBtnClip(e);
                    },
                    !0,
                  )));
            },
            setFrameRate: function () {
              var e;
              ((e =
                "LOW" == g_oPlatManager.getPerformanceLevel()
                  ? 25
                  : "MIDDLE" == g_oPlatManager.getPerformanceLevel()
                    ? 30
                    : 60),
                cc.game.setFrameRate(e),
                Log.warn(">>>\u8bbe\u7f6e\u5e27", e));
            },
            updateCanvas: function () {
              var e = cc.view.getFrameSize(),
                t = cc.view.getDesignResolutionSize(),
                i = t.width / t.height,
                a = e.width / e.height,
                o = cc.find("Canvas");
              if (o) {
                var n = o.getComponent(cc.Canvas);
                if (!isNull(n))
                  return void (i > a
                    ? ((n.fitWidth = !0), (n.fitHeight = !1))
                    : ((n.fitWidth = !1), (n.fitHeight = !0)));
              } else Log.warn(">>>\u573a\u666f\u6ca1\u6709Canvas");
              return o;
            },
            getPreloadSynList: function (e) {
              var t = null;
              return (
                e === g_tConst.SceneCfgs.lobby
                  ? (t = o.getHallList())
                  : e === g_tConst.SceneCfgs.game && (t = o.getGameListInGame()),
                t
              );
            },
          };
        (cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
          (Log.info("cc.Director.EVENT_AFTER_SCENE_LAUNCH"), h.updateCanvas());
        }),
          (t.exports = h),
          cc._RF.pop());
      },
      {
        CommonUtils: "CommonUtils",
        ConfigPrefab: "ConfigPrefab",
        GameTestData: "GameTestData",
        MatchingCtrl: "MatchingCtrl",
        MgrPackage: void 0,
        ResPoolManager: "ResPoolManager",
        SGMatchingAnimCtrl: "SGMatchingAnimCtrl",
        SanGuoTableUICtrl: "SanGuoTableUICtrl",
        UserInfoYuyinManger: "UserInfoYuyinManger",
      },
    ],
