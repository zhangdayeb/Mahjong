    sceneBgView: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "83426iItklIAI0P0uZ9W2Av", "sceneBgView"),
          cc.Class({
            extends: Cls_Component,
            properties: {
              sectionBg: {
                default: null,
                type: cc.SpriteFrame,
                tooltip: "SECTION\u8d5b\u4e8b = 1",
              },
              spriteBg: {
                default: null,
                type: cc.Sprite,
                tooltip: "\u5f53\u524d\u4f7f\u7528\u7684\u80cc\u666f\u56fe",
              },
              sceneBg: [cc.SpriteFrame],
            },
            Awake: function () {
              (this.onMessageEvent(), this.setBg());
            },
            onMessageEvent: function () {
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.BACK_GROUND_EXCHANGE,
                  function () {
                    this.setBg();
                  },
                  this,
                ),
              );
            },
            onLoad1111: function () {},
            setBg: function () {
              ((this.spriteBg.spriteFrame = this.sceneBg[g_tConst.DayOrNight]),
                (this._DayOrNight = g_tConst.DayOrNight));
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
