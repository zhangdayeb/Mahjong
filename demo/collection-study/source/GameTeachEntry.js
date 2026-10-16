    GameTeachEntry: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "3de2arqh59O4IShgJyB1agD", "GameTeachEntry"),
          cc.Class({
            extends: Cls_BaseView,
            properties: { tipLabel: cc.Label },
            Awake: function () {
              this.onMessageEvent();
            },
            start: function () {
              ((this.currentState = 0),
                this.schedule(this.startAnimation, 2, cc.REPEAT_FOREVER, 0),
                g_oData.get(g_tData.GameTeachMod).isFinshGuide()
                  ? (this.tipLabel.node.parent.active = !1)
                  : this.startAnimation());
            },
            onMessageEvent: function () {},
            startAnimation: function () {
              (this.currentState++, this.updateLabel(this.currentState % 2));
            },
            updateLabel: function (e) {
              this.tipLabel.string = 0 === e ? "\u9886\u6e38\u620f\u8c46" : "\u9886\u724c\u684c";
            },
            stopAnimation: function () {
              ((this.tipLabel.node.parent.active = !1), this.unschedule(this.startAnimation));
            },
            onClickEntry: function () {
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Alert.id, "ON_INIT", {
                data: {
                  title: "\u63d0  \u793a",
                  value: "\u786e\u5b9a\u7acb\u5373\u5b66\u4e60\u73a9\u6cd5\u6307\u5f15\u5417\uff1f",
                  type: 0,
                  ok: function () {
                    (g_oData.get(g_tData.GameTeachMod).reportLobbyEnter(),
                      g_oData.get(g_tData.GameTeachMod).inItGameTeach(),
                      g_oSceneLoader.gotoScene(g_tConst.SceneCfgs.game, null, function (e) {
                        e && e();
                      }));
                  },
                },
              });
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
