    DailyGiftView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "ecbbaF+kvpG6qV7oixz1h6p", "DailyGiftView");
        var i = e("AlertDlgBaseView");
        (cc.Class({
          extends: i,
          properties: {
            content: cc.Node,
            btnKeepLogin: cc.Node,
            btnLuckyWheel: cc.Node,
            btnSeeAdForBeans: cc.Node,
            btnCollectForGift: cc.Node,
            btnBrokenHelp: cc.Node,
            btnSubscribeForGift: cc.Node,
            btnSeeAdForRedPacket: cc.Node,
            btnUserBackGift: cc.Node,
            _hideNode: null,
            wgt_close: cc.Widget,
          },
          Awake: function () {
            (this._super(), this.onCustomEvent(), this.onMessageEvent(), this.initBtnShow());
          },
          start: function () {
            (this._super(),
              this.initUI(),
              cc.winSize.width >= 1380 &&
                ((this.wgt_close.left = (cc.winSize.width - 1380) / 2),
                this.wgt_close.updateAlignment()));
          },
          onCustomEvent: function () {
            (this.node.on(
              "SHOW",
              function (e) {
                ((this._hideNode = e.hideNode), g_oPlatform.hiddenGameClubButton());
              },
              this,
            ),
              this.node.on(
                "HIDE",
                function () {
                  this.doHideAnimation();
                },
                this,
              ));
          },
          onMessageEvent: function () {
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.HALL_KEEPLOGIN_GETSTATE,
                function () {
                  (this.btnKeepLogin.emit("SET_DATA"), this.btnKeepLogin.emit("UPDATE_STYLE"));
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GAMEPLAT_SLYDER_RECEIVE_RESULT,
                  function (e) {
                    1 === e.code &&
                      (this.btnLuckyWheel.emit("SET_DATA"),
                      this.btnLuckyWheel.emit("UPDATE_STYLE"));
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GAMEPLAT_SHARE_EVENT_NOTIFY_SHARECFG,
                  function () {
                    (this.btnLuckyWheel.emit("SET_DATA"),
                      this.btnLuckyWheel.emit("UPDATE_STYLE"),
                      this.btnBrokenHelp.emit("SET_DATA"),
                      this.btnBrokenHelp.emit("UPDATE_STYLE"));
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GAMEPLAT_SHARE_EVENT_NORMAL_SUCESS,
                  function (e) {
                    (console.log(
                      "edwin normal success in DailyGiftView, nLinkId :",
                      JSON.stringify(e),
                    ),
                      g_tConst.ShareConfig.ShareLinkId.VideoGetFare,
                      e == g_tConst.ShareConfig.ShareLinkId.NormalShareOrVideo &&
                        (this.btnSeeAdForBeans.emit("SET_DATA"),
                        this.btnSeeAdForBeans.emit("UPDATE_STYLE")));
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GAMEPLAT_SUBSCRIBE_RST_CHANGE,
                  function () {},
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.UPDATE_USER_BACK_DAILY_GIFT_ENTRY,
                  function (e) {
                    (e >= 7 && (this.btnUserBackGift.active = !1),
                      this.btnUserBackGift.emit("SET_DATA"),
                      this.btnUserBackGift.emit("UPDATE_STYLE"));
                  },
                  this,
                ),
              ));
          },
          doHideAnimation: function () {
            var e = this,
              t = cc.scaleTo(0.15, 0.2),
              i = cc.callFunc(function () {
                e.content.active = !1;
              });
            this.content.runAction(cc.sequence(t, i));
          },
          initBtnShow: function () {
            this.initBtnUserBackGift();
          },
          initBtnUserBackGift: function () {
            var e = g_oData.get(g_tData.SwitchModel).isCheckHandle(),
              t = g_oData.get(g_tData.mod_Share).getUserBackCfg(),
              i = g_oData.get(g_tData.SwitchModel).getUserBackCfg().isActive,
              a = Object.keys(t);
            i && a.length > 0 && t.isUserBack && !e && (this.btnUserBackGift.active = !0);
          },
          initBtnCollectGameForGift: function () {
            var e = g_oData.get(g_tData.SwitchModel).getRichGiftBagCfg();
            this.btnCollectForGift.active = e.showCollectGameBtn || !1;
          },
          initBtnSubscribeForGift: function () {
            var e = g_oData.get(g_tData.SwitchModel).isCheckHandle(),
              t = g_oData.get(g_tData.SwitchModel).getRichGiftBagCfg();
            ((this.btnSubscribeForGift.active = (t.showEntry && !e) || !1),
              g_oData.get(g_tData.SubscribeModel).setCustomCallFuc(
                function (e) {
                  (console.log(
                    "edwin customCallFunc work in DailyGiftView.js: " + JSON.stringify(e),
                  ),
                    1 === e.status && (this.btnSubscribeForGift.active = !1));
                }.bind(this),
              ),
              g_oData.get(g_tData.SubscribeModel).reqQuerySubscribeStatus());
          },
          initUI: function () {
            for (var e = 0; e < this.content.children.length; ++e) {
              var t = this.content.children[e];
              if (t.active) {
                var i = t.getComponent("DailyGiftItemView");
                i._awaked && (i.setData(), i.updateUI());
              }
            }
          },
          clickClose: function () {
            this.close();
          },
        }),
          cc._RF.pop());
      },
      { AlertDlgBaseView: "AlertDlgBaseView" },
    ],
