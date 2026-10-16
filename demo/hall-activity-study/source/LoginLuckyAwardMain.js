    LoginLuckyAwardMain: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "5d298XsEyBCN5ZN3tGoMt4p", "LoginLuckyAwardMain");
        var i = e("AlertDlgBaseView");
        (cc.Class({
          extends: i,
          properties: {
            maxCanGet: { default: null, type: cc.Label, tooltip: "" },
            btnCollect: { default: null, type: cc.Node, tooltip: "" },
            btnNoMore: { default: null, type: cc.Node, tooltip: "" },
            _popReason: 0,
          },
          Awake: function () {
            ((this._closeReleaseRes = !0), this.onCustomEvent(), this.onMessageEvent());
          },
          start: function () {
            this._super();
          },
          onCustomEvent: function () {
            this.node.on("ON_INIT", this.onInit, this);
          },
          onMessageEvent: function () {
            this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.ON_GET_LLA_AWARD_SUC,
                function (e) {
                  var t = e.type,
                    i = g_tConst.LoginLuckyAwardCfg.ELuckyAwardType;
                  (t != i.Dice && t != i.TurnTable) ||
                    (g_oData.get(g_tData.LoginLuckyAwardMod).reportDiceViewShow(this._popReason),
                    this.close());
                },
                this,
              ),
            );
          },
          onInit: function (e) {
            ((this._popReason = e.popReason),
              g_oData.get(g_tData.LoginLuckyAwardMod).reportMainViewShow(this._popReason));
            var t = g_tConst.LoginLuckyAwardCfg.ELuckyAwardType.Dice,
              i = g_oData.get(g_tData.LoginLuckyAwardMod).getAwardCfgByType(t),
              a = g_oData.get(g_tData.LoginLuckyAwardMod).getAwardInfoByType(t);
            if (
              ((i && a && a.todayReceivedTimes < i.canReceiveTimes) ||
                ((this.btnCollect.active = !1), (this.btnNoMore.active = !0)),
              i && a)
            ) {
              var o = i.fingerVipAddCfg,
                n = a.multiple,
                s =
                  (o.length > 0 ? g_oCommonUtils.Long2Number(o[o.length - 1].baseFingerCoin) : 0) *
                  (n.length > 0 ? n[n.length - 1] : 1);
              this.maxCanGet.string =
                "\u6700\u9ad8\u53ef\u5f97" +
                g_oCommonUtils.translateCoinStr(g_oCommonUtils.initProCoin(s));
            }
          },
          onClickCollect: function () {
            var e = g_tConst.LoginLuckyAwardCfg.ELuckyAwardType.Dice,
              t = g_oData.get(g_tData.LoginLuckyAwardMod).getAwardCfgByType(e),
              i = g_oData.get(g_tData.LoginLuckyAwardMod).getAwardInfoByType(e);
            t &&
              i &&
              i.todayReceivedTimes < t.canReceiveTimes &&
              g_oData.get(g_tData.LoginLuckyAwardMod).reqReceiveLuckyAward(e);
          },
          onClickClose: function () {
            this.close();
          },
        }),
          cc._RF.pop());
      },
      { AlertDlgBaseView: "AlertDlgBaseView" },
    ],
