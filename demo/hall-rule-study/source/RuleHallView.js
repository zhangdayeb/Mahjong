    RuleHallView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "eb1a79Q8CdHBqEwZXZg9D83", "RuleHallView");
        var i = e("AlertDlgBaseView");
        (cc.Class({
          extends: i,
          properties: { ruleNode: cc.Node },
          Awake: function () {
            this.node.on("HALLRULE_UPDATA_RULE", this.initRule, this);
          },
          start: function () {
            this._super();
            var e = g_oData.get(g_tData.PrivateMsgModel).getMJAreaCfg()[0].PlayCfgs.DiyGame[0].iID;
            this.ruleNode.getComponent("RuleView").initUI(e);
          },
          initRule: function (e) {
            var t = e.detail.id;
            this.ruleNode.getComponent("RuleView").initUI(t);
          },
          onClickClose: function () {
            this.close();
          },
          onMessageEvent: function () {},
        }),
          cc._RF.pop());
      },
      { AlertDlgBaseView: "AlertDlgBaseView" },
    ],
