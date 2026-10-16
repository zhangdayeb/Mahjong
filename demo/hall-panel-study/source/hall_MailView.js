    hall_MailView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "1c897RoEU5ArpzkLmCX8cUi", "hall_MailView");
        var i = e("AlertDlgBaseView"),
          a = e("CommonUtils");
        (cc.Class({
          extends: i,
          properties: {
            prefabMailItem: { default: null, type: cc.Prefab, tooltip: "\u90ae\u4ef6\u9884\u5236" },
            nodeMailContainer: { default: null, type: cc.Node, tooltip: "\u5bb9\u5668" },
            nodeNoMail: { default: null, type: cc.Node, tooltip: "\u6ca1\u6709\u90ae\u4ef6" },
            imgSystemLight: {
              default: null,
              type: cc.Node,
              tooltip: "\u7cfb\u7edf\u901a\u77e5\u9ad8\u4eae\u56fe",
            },
            imgGiftLight: {
              default: null,
              type: cc.Node,
              tooltip: "\u5956\u52b1\u90ae\u4ef6\u9ad8\u4eae\u56fe",
            },
            mailDetailPrefab: {
              default: null,
              type: cc.Prefab,
              tooltip: "\u90ae\u4ef6\u8be6\u60c5\u9884\u5236\u4f53",
            },
            labKeepDayTips: {
              default: null,
              type: cc.Label,
              tooltip: "\u90ae\u4ef6\u4fdd\u7559\u671f\u9650\u548c\u6570\u91cf\u63d0\u793a",
            },
            btnGetReward: {
              default: null,
              type: cc.Node,
              tooltip: "\u4e00\u952e\u9886\u53d6\u6309\u94ae",
            },
            btnGetRead: {
              default: null,
              type: cc.Node,
              tooltip: "\u4e00\u952e\u8bfb\u53d6\u6309\u94ae",
            },
            imgRedPointLeft: {
              default: null,
              type: cc.Node,
              tooltip: "\u5de6\u8fb9\u6807\u7b7e\u7684\u7ea2\u70b9",
            },
            imgRedPointRight: {
              default: null,
              type: cc.Node,
              tooltip: "\u53f3\u8fb9\u6807\u7b7e\u7684\u7ea2\u70b9",
            },
            contentScrollview: {
              default: null,
              type: cc.Node,
              tooltip: "\u6ed1\u52a8\u5217\u8868",
            },
          },
          Awake: function () {
            (this.onMessageEvent(), this.onCustomEvent());
          },
          start: function () {
            (this._super(),
              this.nodeMailContainer.removeAllChildren(),
              this.resetData(),
              this.reqGetMailList(),
              this.contentScrollview.on("bounce-bottom", this.bounce_bottom, this));
          },
          bounce_bottom: function () {
            this.updateMailListUI(this.tagIndex);
          },
          resetData: function () {
            ((this.curLoadIndex = 0), (this.tagIndex = 1), (this._mailMap = new Map()));
          },
          onMessageEvent: function () {
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.SHOW_MAILS_LIST_MSG,
                function () {
                  1 == this.tagIndex ? this.clickTagSystem(!0) : this.clickTagGift(!0);
                }.bind(this),
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.UPDATE_MAILS_STATUS,
                  function (e) {
                    (this.updateRedPoint(), console.log(" UPDATE_MAILS_STATUS mailIdList = ", e));
                    for (var t = 0; t < e.length; t++) {
                      var i = e[t],
                        a = this._mailMap.get(i),
                        o = g_oData.get(g_tData.mod_MailData).getOnceMailDetailByMailId(i);
                      if ((isNull(a) || a.emit("UPDATE_MAIL_STATE", o), this.unReadId))
                        for (var n = 0; n < this.unReadId.length; n++)
                          if (i == this.unReadId[n]) {
                            this.unReadId.splice(n, 1);
                            break;
                          }
                      this.nodeMailContainer.getComponent(cc.Layout).updateLayout();
                    }
                  }.bind(this),
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.ADD_NEW_MAIL,
                  function (e) {
                    this.addNewMail(e);
                  }.bind(this),
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.DELETE_MAIL,
                  function (e) {
                    this.updateRedPoint();
                    for (var t = 0; t < e.length; t++) {
                      var i = e[t],
                        a = this._mailMap.get(i);
                      (isNull(a) || (a.destroy(), this._mailMap.delete(i)),
                        this.nodeMailContainer.getComponent(cc.Layout).updateLayout());
                    }
                    this.checkIsNoMail();
                  }.bind(this),
                ),
              ));
          },
          onCustomEvent: function () {
            var e = this;
            this.node.on(
              "SHOW_MAIL_CHECK_PANNEL",
              function (t) {
                var i = t.detail.mail,
                  a = cc.instantiate(e.mailDetailPrefab);
                ((a.parent = e.node), a.getComponent("hall_MailDetail").updateUI(i));
              },
              this,
            );
          },
          updateMailListUI: function (e) {
            (this.updateRedPoint(),
              this.updateTips(),
              1 == e
                ? ((this.btnGetReward.active = !1), (this.btnGetRead.active = !0))
                : ((this.btnGetReward.active = !0), (this.btnGetRead.active = !1)));
            var t = g_oData.get(g_tData.mod_MailData).getMailListByType(e, this.mailInfoList);
            if (t && t.length > 0) {
              (t.sort(function (e, t) {
                return t.time - e.time;
              }),
                t.sort(function (e, t) {
                  return e.status - t.status;
                }),
                (this.unReadId = []));
              for (var i = 0; i < t.length && !t[i].hadRead; i++) this.unReadId.push(t[i].mailID);
              for (
                var a = this.curLoadIndex,
                  o = t.length > this.curLoadIndex + 5 ? this.curLoadIndex + 5 : t.length,
                  n = a;
                n < o;
                n++
              ) {
                var s = g_oPrefabLoader.instantiate(this.prefabMailItem, this.nodeMailContainer);
                (this._mailMap.set(t[n].mailID, s), s.emit("INIT_MAIL_ITEM", t[n]));
              }
              this.curLoadIndex = o;
            } else 2 == e ? (this.btnGetReward.active = !1) : (this.btnGetRead.active = !1);
            (this.checkIsNoMail(), this.nodeMailContainer.getComponent(cc.Layout).updateLayout());
          },
          updateTips: function () {
            var e = g_oData.get(g_tData.mod_MailData).getMailMaxCount(),
              t = g_oData.get(g_tData.mod_MailData).getMailKeepDay();
            this.labKeepDayTips.string =
              "\u4ec5\u4fdd\u7559\u6700\u8fd1" +
              t +
              "\u5929\u7684\u90ae\u4ef6\uff0c\u6700\u591a" +
              e +
              "\u5c01";
          },
          checkIsNoMail: function () {
            this.nodeMailContainer.children.length > 0
              ? (this.nodeNoMail.active = !1)
              : ((this.nodeNoMail.active = !0), (this.btnGetReward.active = !1));
          },
          addNewMail: function (e) {
            var t = this,
              i = this;
            (i.updateRedPoint(),
              (e = e.filter(function (e) {
                var t;
                return ((t = 1 != i.tagIndex), a.valueAtBit(e.status, 3) ? t : !t);
              })).length > 0 && (i.nodeNoMail.active = !1),
              e.forEach(function (e) {
                var i = g_oPrefabLoader.instantiate(t.prefabMailItem, t.nodeMailContainer);
                (t._mailMap.set(e.mailID, i), i.emit("INIT_MAIL_ITEM", e));
              }),
              this.nodeMailContainer.getComponent(cc.Layout).updateLayout());
          },
          updateRedPoint: function () {
            ((this.imgRedPointLeft.active = g_oData
              .get(g_tData.mod_MailData)
              .getMailListRedPointByType(1)),
              (this.imgRedPointRight.active = g_oData
                .get(g_tData.mod_MailData)
                .getMailListRedPointByType(2)));
          },
          onClickClose: function () {
            (this.close(), this.showInterstitialStaticAd());
          },
          reqGetMailList: function () {
            g_oData.get(g_tData.mod_MailData).reqGetMailsListDetail();
          },
          showInterstitialStaticAd: function () {
            var e = {
              Scene: g_tConst.ShareConfig.ShareScene.hall,
              Module: g_tConst.ShareConfig.ShareModule.SeeVideo,
              SubModule: g_tConst.ShareConfig.ShareSubModule.SeeVideo,
              AdScene: g_tConst.InterstitialStaticPID.ClosePannel,
            };
            g_oAdManager.doSeeAd(g_tConst.eADType.InterstitialStaticAd, e.AdScene, e);
          },
          clickTagSystem: function (e) {
            (void 0 === e && (e = !1),
              (1 != this.tagIndex || e) &&
                (this.nodeMailContainer.removeAllChildren(),
                (this.curLoadIndex = 0),
                (this.tagIndex = 1),
                (this.imgSystemLight.active = !0),
                (this.imgGiftLight.active = !1),
                (this.mailInfoList = g_oData
                  .get(g_tData.mod_MailData)
                  .getMailListByType(this.tagIndex)),
                this.updateMailListUI(this.tagIndex)));
          },
          clickTagGift: function (e) {
            (void 0 === e && (e = !1),
              (2 != this.tagIndex || e) &&
                (this.nodeMailContainer.removeAllChildren(),
                (this.curLoadIndex = 0),
                (this.tagIndex = 2),
                (this.imgSystemLight.active = !1),
                (this.imgGiftLight.active = !0),
                (this.mailInfoList = g_oData
                  .get(g_tData.mod_MailData)
                  .getMailListByType(this.tagIndex)),
                this.updateMailListUI(this.tagIndex)));
          },
          onClickQuickDel: function () {
            var e = g_oData.get(g_tData.mod_MailData).getCanDeleteMailListByType(this.tagIndex);
            e.length > 0
              ? g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Alert.id, "ON_INIT", {
                  data: {
                    title: "\u63d0\u793a",
                    value:
                      "\u90ae\u4ef6\u5220\u9664\u540e\u65e0\u6cd5\u627e\u56de,\u662f\u5426\u786e\u8ba4\u5220\u9664",
                    ok: function () {
                      (g_oData.get(g_tData.mod_MailData).reqDeleteMail(e),
                        g_oLayerManager.emitEvent2Dlg(
                          g_tConst.GameLayerCfg.TipsLayer.id,
                          "SHOW_NORMAL_TIP",
                          {
                            tipMsg: "\u6210\u529f\u5220\u9664\u5df2\u8bfb\u90ae\u4ef6",
                            showTime: 2,
                          },
                        ));
                    },
                  },
                })
              : g_oLayerManager.emitEvent2Dlg(
                  g_tConst.GameLayerCfg.TipsLayer.id,
                  "SHOW_NORMAL_TIP",
                  { tipMsg: "\u6682\u65e0\u53ef\u5220\u9664\u7684\u90ae\u4ef6", showTime: 2 },
                );
          },
          onClickQuickGet: function () {
            var e = g_oData.get(g_tData.mod_MailData).getCanGetRewardMailList();
            e.length > 0
              ? g_oData.get(g_tData.mod_MailData).reqGetMailReward(e)
              : g_oLayerManager.emitEvent2Dlg(
                  g_tConst.GameLayerCfg.TipsLayer.id,
                  "SHOW_NORMAL_TIP",
                  { tipMsg: "\u6682\u65e0\u53ef\u9886\u53d6\u7684\u9644\u4ef6", showTime: 2 },
                );
          },
          onDestroy: function () {
            (this._super(),
              cc.isValid(this.scrollview) &&
                this.contentScrollview.off("bounce-bottom", this.bounce_bottom, this));
          },
          onClickQuickRead: function () {
            var e = this.unReadId;
            !e || !e.length <= 0
              ? g_oData.get(g_tData.mod_MailData).reqMailReaded(e)
              : g_oPlatform.doAction(
                  g_tConst.tPlatActionId.actionShowToast,
                  "\u5df2\u8bfb\u53d6\u5168\u90e8\u90ae\u4ef6!",
                );
          },
        }),
          cc._RF.pop());
      },
      { AlertDlgBaseView: "AlertDlgBaseView", CommonUtils: "CommonUtils" },
    ],
