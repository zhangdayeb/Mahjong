    KeepStayView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "42732UQGCROG5ExDQ+3F261", "KeepStayView");
        var i = e("AlertDlgBaseView");
        (cc.Class({
          extends: i,
          properties: {
            lab_content: cc.RichText,
            _backToHallCb: { default: null, visiable: !1 },
            _continuePlayCb: { default: null, visiable: !1 },
          },
          Awake: function () {
            this.onCustomEvent();
          },
          onCustomEvent: function () {
            (this.node.on(
              "ON_INIT",
              function () {
                this.onInit();
              },
              this,
            ),
              this.node.on(
                "CLOSE_KEEP_STAY_VIEW",
                function () {
                  this.onClickClose();
                },
                this,
              ));
          },
          onInit: function () {
            var e = g_oData.get(g_tData.SwitchModel).sub.exchange.isEpt();
            g_oData.get(g_tData.SwitchModel).sub.exchange.isZJ
              ? this.initZhuanJin()
              : e || isNull(g_oData.get(g_tData.mod_BattleHandsel).getBattleHandselFareCfg())
                ? this.onClickBackToHall()
                : this.initBattleHansel();
          },
          initZhuanJin: function () {
            this.setContent(
              "\u5bf9\u5c40\u7ed3\u675f\u6709\u5f88\u5927\u51e0\u7387\u53ef\u4ee5\u9886\u53d6\u7ea2\u5305\uff0c\u60a8\u786e\u5b9a\u8981\u9000\u51fa\u5417\uff1f",
            );
          },
          initBattleHansel: function () {
            var e = g_oData.get(g_tData.mod_BattleHandsel).getUserPlayCount(),
              t = g_oData
                .get(g_tData.mod_BattleHandsel)
                .getBattleHandselFareCfg().battleHandselFare,
              i = t[t.length - 1].playCount,
              a = g_oData.get(g_tData.mod_BattleHandsel).getNeedPlayCountToFare();
            e < i
              ? this.setContent(
                  "\u518d\u6253" +
                    a +
                    "\u5c40\u5c31\u53ef\u4ee5\u9886\u53d6\u7ea2\u5305\u5238\u5956\u52b1\uff0c\u60a8\u786e\u5b9a\u8981\u9000\u51fa\u5417\uff1f",
                )
              : this.onClickBackToHall();
          },
          setContent: function (e) {
            this.lab_content.string = "<color=#3d3e5e>" + e + "</c>";
          },
          onClickBackToHall: function () {
            (g_oEvent.dispatchEvent(g_tEvent.REQUES_EXIT_GAME), this.close());
          },
          onClickContinuePlay: function () {
            var e = MJ.GameLogic.PlayerModel.getMyPlayerInfo();
            if (MJ.GameLogic.isGameStart()) {
              var t = e.isHu,
                i = e.isGiveUp;
              MJ.GameLogic._gameParams.getPlayMod() === g_tConst.GameConfig.playMod.XueLiu
                ? g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.GameMenu.id,
                    "START_NEXT_GAME",
                  )
                : t || i
                  ? (t &&
                      g_oExLayerManager.emitEvent2GameLayer(
                        g_tConst.GameExLayerCfg.GameMenu.id,
                        "START_NEXT_GAME",
                      ),
                    i &&
                      g_oExLayerManager.emitEvent2GameLayer(
                        g_tConst.GameExLayerCfg.GameMenu.id,
                        "QUICK_READY",
                      ))
                  : Log.info(
                      "Samer >>>",
                      "\u79bb\u573a\u633d\u7559 \u5f53\u524d\u4e0d\u80fd\u79bb\u684c",
                      "",
                    );
            } else
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.GameMenu.id,
                "QUICK_READY",
              );
            this.close();
          },
          onClickClose: function () {
            this.close();
          },
        }),
          cc._RF.pop());
      },
      { AlertDlgBaseView: "AlertDlgBaseView" },
    ],
