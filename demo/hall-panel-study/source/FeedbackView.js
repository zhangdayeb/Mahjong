    FeedbackView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "6e77f2SDjZJa76aWE8miuem", "FeedbackView");
        var i = e("AlertDlgBaseView"),
          a = e("StarAndTagsCtrl"),
          o = e("CommonUtils"),
          n = e("CommonPlat");
        (cc.Class({
          extends: i,
          properties: {
            starAndTagsCtrl: {
              default: null,
              type: a,
              tooltip: "\u661f\u661f\u6807\u7b7e\u7ba1\u7406\u5668",
            },
            edit_advise: {
              default: null,
              type: cc.EditBox,
              tooltip: "\u7528\u6237\u53cd\u9988\u5efa\u8bae\u7684\u8f93\u5165\u6846",
            },
            edit_wechatNum: {
              default: null,
              type: cc.EditBox,
              tooltip: "\u5fae\u4fe1\u53f7\u7684\u8f93\u5165\u6846",
            },
            n_tooLongTip: {
              default: null,
              type: cc.Node,
              tooltip: "\u53cd\u9988\u5efa\u8bae\u592a\u957f\u63d0\u793a",
            },
            n_serviceBtn: { default: null, type: cc.Node, tooltip: "\u5ba2\u670d\u6309\u94ae" },
            arrN_Advise: {
              default: [],
              type: [cc.Node],
              tooltip: "\u53cd\u9988\u5efa\u8bae\u76f8\u5173\u7684\u8282\u70b9",
            },
            arrN_StarTags: {
              default: [],
              type: [cc.Node],
              tooltip: "\u661f\u7ea7\u6807\u7b7e\u76f8\u5173\u7684\u8282\u70b9",
            },
            btnSubscribe: {
              default: null,
              type: cc.Node,
              tooltip: "\u8ba2\u9605\u5c42\uff08\u5efa\u8bae\u91c7\u7eb3\u901a\u77e5\uff09",
            },
            imgSubscribeState: {
              default: null,
              type: cc.Sprite,
              tooltip: "\u8ba2\u9605\u72b6\u6001sprite",
            },
            subscribeStateSf: {
              default: [],
              type: [cc.SpriteFrame],
              tooltip: "\u8ba2\u9605\u72b6\u6001sf",
            },
            wecahtIcon: cc.Node,
            phoneIcon: cc.Node,
          },
          Awake: function () {
            (this._super(),
              this.onMessageEvents(),
              (this.n_serviceBtn.active = n.canService()),
              o.signDebounce("FeedbackView-TextChange", 350),
              o.signDebounce("FeedbackView-Post", 300));
          },
          start: function () {
            (this._super(),
              this.starAndTagsCtrl.init(g_oData.get(g_tData.SwitchModel).sub.feedback.config),
              g_oLayerManager.isLayerShow(g_tConst.GameLayerCfg.Hall_TwoFight.id) &&
                (this.node.active = !1),
              (this.subscribeCfg = g_oData.get(g_tData.SubscribeModel).getCfgByType(1)),
              1 === g_oData.get(g_tData.SwitchModel).getSteerTipCfg().version
                ? (this.checkSubscribeState(),
                  (this.edit_wechatNum.placeholder =
                    "\u8bf7\u8f93\u5165\u5fae\u4fe1\u53f7(\u9009\u586b)"))
                : ((this.phoneIcon.active = !0),
                  (this.btnSubscribe.active = !1),
                  (this.wecahtIcon.active = !1),
                  (this.edit_wechatNum.placeholder =
                    "\u8bf7\u8f93\u5165\u8054\u7cfb\u65b9\u5f0f(\u9009\u586b)"),
                  (this.btnSubscribe.active = !1),
                  (this.wecahtIcon.active = !1)));
          },
          onMessageEvents: function () {
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.SHAREMOD_Hall2V2_ENABLE,
                this.onHall2v2Enable,
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.SHAREMOD_Hall2V2_DISABLE,
                  this.onHall2v2Disable,
                  this,
                ),
              ));
          },
          checkSubscribeState: function () {
            ((this.subscribeState = g_oData.get(g_tData.SubscribeModel).getSubscribeState()),
              1 == this.subscribeState
                ? (this.updateSubscribeState(!1), (this.btnSubscribe.active = !0))
                : (this.btnSubscribe.active = !1));
          },
          onHall2v2Enable: function () {
            this.node.active = !1;
          },
          onHall2v2Disable: function () {
            this.node.active = !0;
          },
          onAdviseTextChange: function () {
            o.isDebounce(
              "FeedbackView-TextChange",
              function () {
                this.edit_advise.string.length > 200
                  ? ((this.n_tooLongTip.getComponent(cc.Label).string =
                      "\u53cd\u9988\u5185\u5bb9\u8d85\u8fc7200\u5b57\uff0c\u65e0\u6cd5\u63d0\u4ea4(" +
                      this.edit_advise.string.length +
                      "/200)"),
                    (this.n_tooLongTip.active = !0))
                  : (this.n_tooLongTip.active = !1);
              },
              this,
            );
          },
          onEnable: function () {
            var e = this;
            (this.scheduleOnce(this.useUpTodayAutoPop, 0.5),
              this.scheduleOnce(function () {
                g_oLayerManager.isLayerShow(g_tConst.GameLayerCfg.Hall_TwoFight.id) &&
                  (e.node.active = !1);
              }, 0));
          },
          onDisable: function () {
            this.unschedule(this.useUpTodayAutoPop);
          },
          useUpTodayAutoPop: function () {
            g_oData.get(g_tData.mod_Feedback).useUpTodayAutoPop();
          },
          onClickCus: function () {
            o.isNative() ? g_oPlatform.doAction(126, "") : g_oPlatform.openService();
          },
          onClickClose: function () {
            (this.starAndTagsCtrl.onClickClose(), this.close());
          },
          onClickPost: function () {
            o.isDebounce(
              "FeedbackView-Post",
              function () {
                var e = this,
                  t = this.edit_advise.string.trim(),
                  i = this.edit_wechatNum.string.trim(),
                  a = this.starAndTagsCtrl.getSelect();
                if (isNull(t) || isNull(a) || isNull(a.starLevel) || isNull(a.tags))
                  Log.error(
                    "BIRD\ud83d\ude21>>>",
                    "FeedbackView.js",
                    "onClickPost data logic error",
                  );
                else {
                  if (0 === a.starLevel)
                    return (
                      g_oPlatform.doAction(
                        g_tConst.tPlatActionId.actionShowToast,
                        "\u8bf7\u9009\u62e9\u661f\u6570\u4e3a\u6e38\u620f\u6253\u5206",
                      ),
                      void this.arrN_StarTags.forEach(function (t) {
                        return e.PopNode(t);
                      })
                    );
                  if ("" === t)
                    return (
                      g_oPlatform.doAction(
                        g_tConst.tPlatActionId.actionShowToast,
                        "\u8bf7\u8f93\u5165\u5177\u4f53\u7684\u53cd\u9988\u5185\u5bb9",
                      ),
                      void this.arrN_Advise.forEach(function (t) {
                        return e.PopNode(t);
                      })
                    );
                  if (t.length > 200)
                    return (
                      g_oPlatform.doAction(
                        g_tConst.tPlatActionId.actionShowToast,
                        "\u62b1\u6b49\uff0c\u53cd\u9988\u5185\u5bb9\u8fc7\u957f\uff0c\u65e0\u6cd5\u63d0\u4ea4",
                      ),
                      void this.PopNode(this.n_tooLongTip)
                    );
                  (g_oData
                    .get(g_tData.mod_Feedback)
                    .report({
                      FeedbackType: g_tConst.FeedbackTypeEnum.FillForm,
                      CustomFeedback: Object.assign({}, a, { advise: t, wechatAccount: i }),
                    }),
                    g_oPlatform.doAction(
                      g_tConst.tPlatActionId.actionShowToast,
                      "\u611f\u8c22\u60a8\u5b9d\u8d35\u7684\u5efa\u8bae",
                    ),
                    this.close());
                }
              },
              this,
            );
          },
          updateSubscribeState: function (e) {
            this.imgSubscribeState.spriteFrame = e
              ? this.subscribeStateSf[1]
              : this.subscribeStateSf[0];
          },
          onClickSubscribe: function () {
            var e = this;
            (console.log("test=========jay==111===", e.subscribeState),
              1 == e.subscribeState &&
                (g_oData
                  .get(g_tData.gameReportData)
                  .sendMjEvent(
                    g_tConst.MjReportCfg.FBSubscribeReq.Point,
                    g_tConst.MjReportCfg.FBSubscribeReq.Module,
                  ),
                wx.requestSubscribeWhatsNew({
                  msgType: 1,
                  success: function (t) {
                    if (
                      (console.log(
                        "\u8bf7\u6c42\u8ba2\u9605\u8fd4\u56de\u6210\u529f==============",
                        t,
                      ),
                      !0 === t.confirm)
                    ) {
                      (g_oData
                        .get(g_tData.gameReportData)
                        .sendMjEvent(
                          g_tConst.MjReportCfg.FBSubscribeSuc.Point,
                          g_tConst.MjReportCfg.FBSubscribeSuc.Module,
                        ),
                        g_oData.get(g_tData.SubscribeModel).setSubscribeState(2),
                        (e.subscribeState = 2),
                        e.updateSubscribeState(!0));
                      var i = e.subscribeCfg && e.subscribeCfg.goodInfos;
                      if (i) {
                        var a = {
                          allAward: i,
                          multiple: 2,
                          closeCb: function () {
                            g_oData.get(g_tData.SubscribeModel).reqGetSubscribeReward(!1);
                          },
                          multipleCb: function () {
                            g_oData.get(g_tData.SubscribeModel).reqGetSubscribeReward(!0);
                          },
                        };
                        g_oEvent.dispatchEvent(g_tEvent.BASEHALL_SHARE_EVNET_NORMAL_AWARD_GET, a);
                      }
                    }
                  },
                  fail: function (e) {
                    console.log(
                      "\u8bf7\u6c42\u8ba2\u9605\u8fd4\u56de\u5931\u8d25==============",
                      e,
                    );
                  },
                })));
          },
          PopNode: function (e) {
            e.stopAllActions();
            var t = cc.sequence(
              cc.delayTime(1),
              cc.scaleTo(0.5, 1.15, 1.15),
              cc.scaleTo(0.5, 1, 1),
            );
            e.runAction(t.easing(cc.easeInOut(3)));
          },
          resetInputEditState: function () {
            this.edit_advise.isFocused()
              ? this.edit_advise.blur()
              : this.edit_wechatNum.isFocused() && this.edit_wechatNum.blur();
          },
          close: function () {
            (this.resetInputEditState(), this._super());
          },
        }),
          cc._RF.pop());
      },
      {
        AlertDlgBaseView: "AlertDlgBaseView",
        CommonPlat: "CommonPlat",
        CommonUtils: "CommonUtils",
        StarAndTagsCtrl: "StarAndTagsCtrl",
      },
    ],
