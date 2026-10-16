    AlertDlgBaseView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "35ed0cqa/hA1azcIhEMUKsd", "AlertDlgBaseView");
        var i = e("DlgBaseView"),
          a = e("AlertDlgCtrl");
        (cc.Class({
          extends: i,
          properties: { ___uuid: "alert" },
          onLoad: function () {
            this._super();
          },
          start: function () {
            (a.push(this._priority, this.node), this._super());
          },
          close: function () {
            (a.close(this.node), this._super());
          },
          onDestroy: function () {
            (a.close(this.node), this._super());
          },
        }),
          cc._RF.pop());
      },
      { AlertDlgCtrl: "AlertDlgCtrl", DlgBaseView: "DlgBaseView" },
    ],
