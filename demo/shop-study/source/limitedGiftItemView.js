    limitedGiftItemView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "2ea9bQTbJBD+5VCksGFdjZt", "limitedGiftItemView");
        var i = e("CommonUtils"),
          a = e("DlgBaseView"),
          o = e("CommonPlat"),
          n = [10112, 400, 861];
        (cc.Class({
          extends: a,
          properties: {
            image_icon: cc.Sprite,
            txt_title: cc.Label,
            txt_limitType: cc.Label,
            txt_times: cc.Label,
            redPoint: cc.Node,
            biaoqian1: cc.Node,
            biaoqian2: cc.Node,
            iconPath: [cc.SpriteFrame],
            btn_Grey: cc.Node,
            btn_light: cc.Node,
            lab_grey: cc.Label,
            buyNode: cc.Node,
            txt_price: cc.Label,
            lay_iosPrice: cc.Node,
            lab_iosPrice: cc.Label,
            diamondNode: cc.Node,
            diamondPrice: cc.Label,
            ADNode: cc.Node,
            _GoodsInfo: { default: null },
            _isCanZF: !0,
          },
          Awake: function () {
            this.onCustomEvent();
          },
          start: function () {
            i.isIosSys() && g_oData.get(g_tData.SwitchModel).isOpenPayForAnother()
              ? ((this.lay_iosPrice.active = !0), (this.txt_price.node.active = !1))
              : ((this.lay_iosPrice.active = !1), (this.txt_price.node.active = !0));
          },
          onCustomEvent: function () {},
          onData: function (e) {
            ((this._GoodsInfo = e), this.setShopInfo(e));
          },
          setShopInfo: function (e) {
            this.txt_title.string = e.goodsname;
            var t = e.limitedType;
            (e.limitedTimes && 0 != t
              ? ((this.txt_limitType.string =
                  1 == t ? "\u6bcf\u65e5\u9650\u8d2d" : "\u6bcf\u5468\u9650\u8d2d"),
                (this.txt_times.string = e.getTimes + "/" + e.limitedTimes))
              : (this.txt_times.string = ""),
              e.limitedTimes <= e.getTimes
                ? ((this.btn_Grey.active = !0), (this.btn_light.active = !1), (this._isCanZF = !1))
                : ((this.btn_Grey.active = !1), (this.btn_light.active = !0), (this._isCanZF = !0)),
              this.updateUIByGoodsId(e.goodsid, this._isCanZF),
              this.showGetType(e.zfType, e.price),
              this.setGreyBtn(this._isCanZF, e.zfType));
          },
          getGoods: function () {
            var e = this._GoodsInfo;
            g_oData.get(g_tData.sdkLogin).checkLogin(
              function () {
                if (this._isCanZF && -1 != n.indexOf(e.goodsid)) {
                  var t = g_oData.get(g_tData.Mod_hall_Shop).getShopDHReport();
                  g_oData.get(g_tData.mod_gamecfg).reqGameDiamondExchangeGold(e.goodsid, 0, t);
                }
              }.bind(this),
            );
          },
          onClickGetGoods: function () {
            var e = this,
              t = this._GoodsInfo;
            if (t.limitedTimes <= t.getTimes)
              1 == t.limitedType
                ? g_oPlatform.doAction(
                    g_tConst.tPlatActionId.actionShowToast,
                    "\u672c\u65e5\u6b21\u6570\u5df2\u8fbe\u4e0a\u9650",
                  )
                : g_oPlatform.doAction(
                    g_tConst.tPlatActionId.actionShowToast,
                    "\u672c\u5468\u6b21\u6570\u5df2\u8fbe\u4e0a\u9650",
                  );
            else if (400 == t.goodsid) {
              var a = g_tConst.ReportCfg.DiamondExchange,
                s = g_oData.get(g_tData.Mod_hall_Shop).getShopDHReport() + "_" + t.goodsid,
                r = i.translateCoinStr(i.initProCoin(5e5)),
                c = i.translateCoinStr(i.initProCoin(1e4)),
                l = i.translateCoinStr(i.initProCoin(1e5));
              (g_oData.get(g_tData.gameReportData).reportDiamondDH(s, a.Show),
                g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Alert.id, "ON_INIT", {
                  data: {
                    title: "\u94bb\u77f3\u5151\u6362",
                    value: format(
                      "\u662f\u5426\u82b1\u8d39<color=#ee7b00>66\u94bb\u77f3</c>\u8d2d\u4e70\u8d22\u795e\u798f\u888b?<br/>\u4fdd\u5e95\u83b7\u5f97<color=#ee7b00>{0}\u6e38\u620f\u8c46</c>\uff0c\u6709\u6982\u7387\u989d\u5916\u83b7\u5f97<color=#ee7b00>{1}-{2}\u6e38\u620f\u8c46</c>\u3002",
                      r,
                      c,
                      l,
                    ),
                    ok: function () {
                      (e.getGoods(), g_oData.get(g_tData.gameReportData).reportDiamondDH(s, a.Ok));
                    },
                    close: function () {
                      g_oData.get(g_tData.gameReportData).reportDiamondDH(s, a.Cancle);
                    },
                  },
                }));
            } else if (10112 == t.goodsid) {
              var g = function () {
                (g_oData
                  .get(g_tData.mod_Share)
                  .reqGPShareSuc(g_tConst.ShareConfig.ShareLinkId.DaysGift),
                  g_oData
                    .get(g_tData.gameReportData)
                    .reportClickAction(g_tConst.ReportCfg.ClickActionReport.ClickDayGift));
              };
              if (o.canPlayAd()) {
                this._invokeType = g_tConst.InvokeType.Video;
                var d = {
                  Scene: g_tConst.ShareConfig.ShareScene.hall,
                  Module: g_tConst.ShareConfig.ShareModule.DaysGift,
                  SubModule: g_tConst.ShareConfig.ShareSubModule.DaysGift,
                  ShareType: g_tConst.ShareConfig.ShareType.DaysGift,
                  AdScene: g_tConst.AwardAdPID.DaysGift,
                  enbleSubGuide: !1,
                  cbSuc: g,
                };
                this.invokeAD(d);
              } else g();
            } else
              861 == t.goodsid &&
                g_oData.get(g_tData.sdkLogin).checkLogin(
                  function () {
                    if (this._isCanZF && -1 != n.indexOf(t.goodsid)) {
                      var e = g_tConst.PaySceneId.paySceneIDShop;
                      (g_oCommonUtils.isIosSys()
                        ? g_oData.get(g_tData.SwitchModel).isOpenPayForAnother()
                          ? g_oData.get(g_tData.mod_Share).doPayForAnotherShare(t.goodsid, e)
                          : g_oData.get(g_tData.SwitchModel).isOpenServicePay() &&
                            g_oData.get(g_tData.SwitchModel).isOpenServicePay() &&
                            g_oData.get(g_tData.mod_ZFLogic).doCustomerServicePay(t, "diamond", e)
                        : g_oPlatform.buyItem(t, 1, e),
                        (this._isCanZF = !1),
                        this.unschedule(this.timeCanZF),
                        this.scheduleOnce(this.timeCanZF, 3));
                    }
                  }.bind(this),
                );
          },
          timeCanZF: function () {
            this._isCanZF = !0;
          },
          showGetType: function (e, t) {
            switch (
              ((this.buyNode.active = e === g_tConst.limitedGIftZfType.Buy),
              (this.diamondNode.active = e === g_tConst.limitedGIftZfType.Diamond),
              (this.ADNode.active = e === g_tConst.limitedGIftZfType.AD),
              e)
            ) {
              case g_tConst.limitedGIftZfType.Buy:
                ((this.txt_price.string = "\uffe5" + t), (this.lab_iosPrice.string = "\uffe5" + t));
                break;
              case g_tConst.limitedGIftZfType.Diamond:
                this.diamondPrice.string = "" + t;
                break;
              case g_tConst.limitedGIftZfType.AD:
            }
          },
          updateUIByGoodsId: function (e, t) {
            switch (
              ((this.redPoint.active = !1),
              (this.biaoqian1.active = !1),
              (this.biaoqian2.active = !1),
              e)
            ) {
              case 10112:
                ((this.redPoint.active = t), (this.image_icon.spriteFrame = this.iconPath[0]));
                break;
              case 400:
                ((this.image_icon.spriteFrame = this.iconPath[1]),
                  (this.biaoqian2.active = !0),
                  (this.biaoqian2.getChildByName("label").getComponent(cc.Label).string =
                    "\u5fc5\u5f97" + i.translateCoinStr(i.initProCoin(5e5))));
                break;
              case 861:
                ((this.image_icon.spriteFrame = this.iconPath[2]), (this.biaoqian1.active = !0));
            }
          },
          setGreyBtn: function (e, t) {
            ((this.btn_Grey.active = !e),
              (this.btn_light.active = e),
              e ||
                ((this.buyNode.active = !1),
                (this.diamondNode.active = !1),
                (this.ADNode.active = !1),
                (this.lab_grey.string =
                  t === g_tConst.limitedGIftZfType.AD
                    ? "\u660e\u65e5\u518d\u6765"
                    : "\u5df2\u552e\u7f44")));
          },
        }),
          cc._RF.pop());
      },
      { CommonPlat: "CommonPlat", CommonUtils: "CommonUtils", DlgBaseView: "DlgBaseView" },
    ],
