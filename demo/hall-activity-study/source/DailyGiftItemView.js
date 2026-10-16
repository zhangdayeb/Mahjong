    DailyGiftItemView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "35deckpbGVLl6hPFGDuh5PE", "DailyGiftItemView");
        var i = e("DailyGiftBtnType"),
          a = (e("CommonUtils"), e("CommonPlat")),
          o = cc.Enum({ HIDE: -1, SHOW: -1 });
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            backGround: cc.Node,
            redBubbleBg: cc.Node,
            redBubbleLabel: cc.Label,
            noLeftTag: cc.Node,
            redNode: cc.Node,
            btnType: { default: i.NONE, type: i },
            bubbleStatus: { default: o.SHOW, type: o },
            _bubbleNumber: 1,
            _awaked: !1,
          },
          Awake: function () {
            (this.onCustomEvent(), (this._awaked = !0));
          },
          onCustomEvent: function () {
            (this.node.on("SET_DATA", this.setData, this),
              this.node.on("UPDATE_STYLE", this.updateUI, this));
          },
          onClick: function () {
            switch (this.btnType) {
              case i.NONE:
                break;
              case i.KEEP_LOGIN:
                this.showKeepLogin();
                break;
              case i.LUCKY_WHEEL:
                this.showSlyder();
                break;
              case i.SEE_AD_FOR_BEANS:
                this.showSeeAdForBeans();
                break;
              case i.COLLECT_FOR_GIFT:
                this.showCollectForGift();
                break;
              case i.BROKEN_HELP:
                this.showBrokenHelp();
                break;
              case i.SUBSCRIBE_FOR_GIFT:
                this.showSubscribeForGift();
                break;
              case i.SEE_AD_FOR_RED_PACKET:
                this.showSeeAdForRedPacket();
                break;
              case i.USER_BACK_GIFT:
                this.showUserBackGift();
                break;
              case i.LUCKY_EXCHANGE:
                this.showLuckyExchange();
                break;
              case i.WX_LIVE_ACTIVITY:
                this.showWXLiveActivity();
                break;
              case i.ACTIVE_REDEEMCODE:
                this.showRedeemCodeReward();
                break;
              case i.PRIVILEGE_CARD:
                this.showPrivilegeCard();
            }
          },
          setData: function () {
            switch (this.btnType) {
              case i.NONE:
                break;
              case i.KEEP_LOGIN:
                this.setKeepLoginData();
                break;
              case i.LUCKY_WHEEL:
                this.setLuckyWheelData();
                break;
              case i.SEE_AD_FOR_BEANS:
                this.setSeeAdForBeansData();
                break;
              case i.COLLECT_FOR_GIFT:
                break;
              case i.BROKEN_HELP:
                this.setBrokenHelpData();
                break;
              case i.SUBSCRIBE_FOR_GIFT:
                break;
              case i.SEE_AD_FOR_RED_PACKET:
                this.setSeeAdForRedPacketData();
                break;
              case i.USER_BACK_GIFT:
                this.setUserBackGiftData();
                break;
              case i.LUCKY_EXCHANGE:
                this.setLuckyBagExchange();
                break;
              case i.WX_LIVE_ACTIVITY:
                this.setWxLiveActivity();
                break;
              case i.ACTIVE_REDEEMCODE:
                this.setRedeemCode();
                break;
              case i.PRIVILEGE_CARD:
                this.setPrivilegeCard();
            }
          },
          setUserBackGiftData: function () {
            var e = g_oData.get(g_tData.mod_Share).getUserBackCfg(),
              t = e.isReceivedSignInPack || 0;
            ((this._bubbleNumber = 1 != t ? 1 : 0), e.signInDays >= 7 && (this.node.active = !1));
          },
          setKeepLoginData: function () {
            var e = g_oData.get(g_tData.mod_DataCenter).getKeepLoginInfo().canGet;
            this._bubbleNumber = 1 != e ? 0 : 1;
          },
          setLuckyWheelData: function () {
            var e = g_oData.get(g_tData.mod_Share).getSlyderCfg() || {};
            this._bubbleNumber = e.maxTimes - e.turntablePlayTimes;
            var t = a.canPlayAd() || a.canShare();
            this.node.active = t;
          },
          setSeeAdForBeansData: function () {
            var e = g_oData.get(g_tData.mod_Share).sub.freeAward;
            this._bubbleNumber = e.remainTimes;
          },
          setBrokenHelpData: function () {
            var e = g_oData
              .get(g_tData.mod_Share)
              .getShareCgtInfoByLinkID(g_tConst.ShareConfig.ShareLinkId.Bh_Gu_EnterRoom);
            this._bubbleNumber = e.times;
          },
          setSeeAdForRedPacketData: function () {
            var e = g_oData
              .get(g_tData.mod_Share)
              .getShareCntByLinkID(g_tConst.ShareConfig.ShareLinkId.VideoGetFare);
            this._bubbleNumber = e;
          },
          setWxLiveActivity: function () {
            var e = g_oData.get(g_tData.SwitchModel).isCheckHandle(),
              t = g_oData.get(g_tData.SwitchModel).getWxLiveActivityCfg().showHallEntry;
            this.node.active = t && !e;
          },
          setRedeemCode: function () {
            var e = g_oData.get(g_tData.SwitchModel).isCheckHandle(),
              t = g_oData.get(g_tData.SwitchModel).getActiveRedeemCodeCfg();
            this.node.active = !e && t.isShowOnLobby;
          },
          setLuckyBagExchange: function () {
            var e = g_oData.get(g_tData.SwitchModel).getLuckyBagExchangeCfg();
            this.node.active = e.showHallEntry;
          },
          setPrivilegeCard: function () {
            this.node.active = g_oData.get(g_tData.PrivCardMod).isAct();
          },
          updateUI: function () {
            this.node.active &&
              (this._bubbleNumber
                ? (this.lightAgain(), this.displayRedBubble(!0), this.displayNoLeftTag(!1))
                : (this.goingDark(), this.displayRedBubble(!1), this.displayNoLeftTag(!0)));
          },
          displayRedBubble: function (e) {
            (this.redBubbleBg && (this.redBubbleBg.active = e),
              this.redBubbleLabel &&
                ((this.redBubbleLabel.node.active = e),
                (this.redBubbleLabel.string = "" + this._bubbleNumber)));
          },
          displayNoLeftTag: function (e) {
            this.noLeftTag && (this.noLeftTag.active = e);
          },
          goingDark: function () {
            var e = new cc.Color(180, 180, 180, 255),
              t = new cc.Color(178, 180, 116, 255);
            (this.backGround && (this.backGround.color = e),
              this.redBubbleBg && (this.redBubbleBg.color = e),
              this.redBubbleLabel && (this.redBubbleLabel.node.color = t));
          },
          lightAgain: function () {
            var e = new cc.Color(255, 255, 255, 255),
              t = new cc.Color(254, 255, 166, 255);
            (this.backGround && (this.backGround.color = e),
              this.redBubbleBg && (this.redBubbleBg.color = e),
              this.redBubbleLabel && (this.redBubbleLabel.node.color = t));
          },
          showKeepLogin: function () {
            var e = g_oData.get(g_tData.mod_DataCenter).getKeepLoginInfo();
            if (!isNull(e)) {
              var t = { posNode: this.node };
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_KeepLogin.id, "ON_INIT", t);
            }
          },
          showSlyder: function () {
            var e = { posNode: this.node };
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Slyder.id, "ON_INIT", e);
          },
          showCollectForGift: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.CollectGameForGift.id, "ON_INIT");
          },
          showSeeAdForBeans: function () {},
          showBrokenHelp: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.BrokeHelp.id, "ON_INIT_LOBBY");
          },
          showSubscribeForGift: function () {
            g_oData.get(g_tData.sdkLogin).checkLogin(
              function () {
                g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.RichGiftBag.id, "ON_INIT");
              }.bind(this),
            );
          },
          showUserBackGift: function () {
            g_oData.get(g_tData.mod_AutoPop).popUserBackDailyGift();
          },
          showSeeAdForRedPacket: function () {},
          showWXLiveActivity: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.WxLiveActivity.id, "SHOW_VIEW");
          },
          showRedeemCodeReward: function () {
            g_oLayerManager.emitEvent2Dlg(
              g_tConst.GameLayerCfg.ActiveRedeemCode.id,
              "INIT_ACTIVE_REDEEMCODE_VIEW",
            );
          },
          showLuckyExchange: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.LuckyBagExchange.id);
          },
          showPrivilegeCard: function () {
            var e = g_oData.get(g_tData.PrivCardMod).privCardInfo;
            if (g_oData.get(g_tData.PrivCardMod).privCardCfg && e) {
              var t = g_oData.get(g_tData.PrivCardMod).getClickEntryCfg();
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.PrivilegeCard.id, "ON_INIT", t);
            } else
              g_oPlatform.doAction(
                g_tConst.tPlatActionId.actionShowToast,
                "\u6b63\u5728\u52a0\u8f7d\u4e2d\uff0c\u8bf7\u7a0d\u540e\u518d\u8bd5",
              );
          },
        }),
          cc._RF.pop());
      },
      {
        CommonPlat: "CommonPlat",
        CommonUtils: "CommonUtils",
        DailyGiftBtnType: "DailyGiftBtnType",
      },
    ],
