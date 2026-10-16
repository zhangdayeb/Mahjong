    CoinGameResultView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "88169HUgU1HX6/HEPvThKn4", "CoinGameResultView");
        var i = e("PopDlgBaseView");
        (cc.Class({
          extends: i,
          properties: {
            nodeRoot: { default: null, type: cc.Node, tooltip: "\u6839\u7ed3\u70b9" },
            prefabComGameResult: {
              default: null,
              type: cc.Prefab,
              tooltip: "\u91d1\u5e01\u573a\u901a\u7528\u7ed3\u7b97\u9762\u677f\u9884\u5236",
            },
          },
          Awake: function () {
            ((this._closeReleaseRes = !0), this.onCustomEvent(), this.onMessageEvent());
          },
          onCustomEvent: function () {
            (this.node.on("ON_INIT_NEWCOMMON_MOD", this.setGameResultData, this),
              this.node.on("ON_CLOSE_GAME_RESULT_VIEW", this.onCloseView, this),
              this.node.on(
                "ON_CLOSE_GAME_RESULT_VIEW_NO_NEXT_DLG",
                this.onCloseViewNoNextDlg,
                this,
              ));
          },
          onMessageEvent: function () {
            this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.GAME_AGAIN_PLAY_CLOSE_POP_VIEW,
                this.onCloseView,
                this,
              ),
            );
          },
          setGameResultData: function (e) {
            (g_oExLayerManager.emitEvent2GameLayer(
              g_tConst.GameExLayerCfg.GameMenu.id,
              "LOOK_DESK_INFO",
            ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.GameRMBRedBagEntry.id,
                "LOOK_DESK_INFO",
              ),
              this.nodeRoot.removeAllChildren());
            var t = cc.instantiate(this.prefabComGameResult);
            (this.nodeRoot.addChild(t), t.emit("ON_INIT_NEWCOMMON_MOD", e));
          },
          onCloseView: function () {
            this.close();
          },
          onCloseViewNoNextDlg: function () {
            this.close(!1);
          },
          onClose: function () {
            (console.info("_bGameEnd be set false onClickNext"),
              MJ.GameLogic.setGameEndFalse(),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.GameMenu.id,
                "NO_LOOK_DESK_INFO",
                !0,
              ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.GameRMBRedBagEntry.id,
                "NO_LOOK_DESK_INFO",
                !0,
              ));
            var e = {
              Scene: g_tConst.ShareConfig.ShareScene.game,
              Module: g_tConst.ShareConfig.ShareModule.GameEnd,
              SubModule: g_tConst.ShareConfig.ShareSubModule.GameEnd,
              AdScene: g_tConst.InterstitialPID.GameEnd,
            };
            g_oData.get(g_tData.SwitchModel).isShowInterstitial(e.AdScene) &&
              g_oAdManager.doSeeAd(g_tConst.eADType.InterstitialAd, e.AdScene, e);
          },
        }),
          cc._RF.pop());
      },
      { PopDlgBaseView: "PopDlgBaseView" },
    ],
