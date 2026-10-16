    GameTeachResult: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "97570JSVrdMSJuiAANxZEqX", "GameTeachResult");
        var i = e("PopDlgBaseView");
        (cc.Class({
          extends: i,
          properties: { lblAward: cc.Label },
          Awake: function () {
            (this.onCustomEvent(), this.onMessageEvent(), (this._priority = -99));
          },
          onMessageEvent: function () {},
          onCustomEvent: function () {
            this.node.on("ON_INIT", this.onInit, this);
          },
          start: function () {
            this._super();
          },
          onInit: function () {
            var e = g_oData.get(g_tData.GameTeachMod).getGoodsInfo();
            if (e && e[1]) {
              var t = "" + g_oCommonUtils.getBigNum(e[1].num);
              this.lblAward.string = t + "\u6e38\u620f\u8c46\u53ca\u7cbe\u7f8e\u724c\u684c";
            }
          },
          onClickEntry: function () {
            (g_oData.get(g_tData.GameTeachMod).reportDlgEnter(),
              g_oData.get(g_tData.GameTeachMod).inItGameTeach(),
              this.close(!1));
          },
          onClickClose: function () {
            this.close();
          },
        }),
          cc._RF.pop());
      },
      { PopDlgBaseView: "PopDlgBaseView" },
    ],
