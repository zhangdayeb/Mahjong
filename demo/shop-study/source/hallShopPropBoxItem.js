    hallShopPropBoxItem: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "adfd2BlLOdATquNAV25izrT", "hallShopPropBoxItem"), e("CommonUtils"));
        var i = e("DlgBaseView"),
          a = [new cc.Color().fromHEX("#DE5E1C"), new cc.Color().fromHEX("#525252")],
          o = e("CommonSDK");
        (cc.Class({
          extends: i,
          properties: {
            title: cc.Label,
            propIcon: cc.Sprite,
            price: cc.Label,
            priceIcon: cc.Sprite,
            nAwards: cc.Node,
            moreTip: cc.RichText,
            nAdIcon: cc.Node,
            img_down: cc.Sprite,
            imgs_down: [cc.SpriteFrame],
          },
          Awake: function () {
            this.onMessageEvent();
          },
          onMessageEvent: function () {
            var e = this;
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.RECEIVE_AWARD_SUC,
                function (t) {
                  0 == t.code &&
                    e._data.isAd &&
                    t.type == e._data.data.type &&
                    g_oData.get(g_tData.Mod_hall_Shop).reqGetAdAwardData(t.type);
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GET_AD_AWARD_DATA,
                  function (t) {
                    e._data.isAd && t.type == e._data.data.type && ((e._data.data = t), e.setAD());
                  },
                  this,
                ),
              ));
          },
          onInit: function (e, t, i) {
            ((this._data = e),
              (this._index = t),
              (this._viewCtrl = i),
              this._data.isAd
                ? this.setAD()
                : this._data.exchangeGoods
                  ? this.setExchange()
                  : (g_oSpriteFrameLoader.load_in_bundle(
                      g_tConst.GameConfig.BundleName.Common,
                      g_tAsset.BACKPACK_ITEM_PATH[this._data.newGoodsType],
                      this._data.newGoodspic,
                      this.propIcon,
                    ),
                    (this.title.string = "" + this._data.goodsdesc),
                    this._data.more
                      ? ((this.nAwards.active = !0),
                        (this.moreTip.string =
                          "<color=#2170D1>\u5df2\u52a0\u8d60</c><color=#FF4527>" +
                          this._data.more +
                          "\u4e2a</color>"))
                      : (this.nAwards.active = !1),
                    this.setPrice()));
          },
          setAD: function () {
            ((this.nAwards.active = !0),
              (this.priceIcon.node.active = !1),
              (this.moreTip.string =
                "<color=#2170D1>\u4eca\u65e5\u5269\u4f59</c><color=#FF4527>" +
                Math.max(0, this._data.cfg.dailyLimit - this._data.data.times) +
                "</color><color=#2170D1>\u6b21</c>"),
              (this.title.string =
                "\u8bb0\u724c\u5668x" + this._data.cfg.packageGoodsCfg[0].minNum),
              (this._data.state = g_oData.get(g_tData.Mod_hall_Shop).getCoinADState(this._data)),
              this.setItemView(this._data.state));
          },
          setItemView: function (e) {
            switch (e) {
              case 0:
                ((this.nAdIcon.active = !1),
                  (this.price.node.color = a[1]),
                  (this.img_down.spriteFrame = this.imgs_down[1]),
                  (this.price.string = "\u660e\u65e5\u518d\u6765"));
                break;
              case 1:
                ((this.nAdIcon.active = !0),
                  (this.price.node.color = a[0]),
                  (this.img_down.spriteFrame = this.imgs_down[0]),
                  (this.price.string = "\u514d\u8d39\u9886\u53d6"));
                break;
              case 2:
                ((this.nAdIcon.active = !1),
                  (this.price.node.color = a[1]),
                  (this.img_down.spriteFrame = this.imgs_down[1]),
                  this.useTimer(),
                  this.schedule(this.useTimer, 1, cc.REPEAT_FOREVER, 0));
            }
          },
          setExchange: function () {
            var e = this._data.exchangeGoods[0].subType,
              t = g_tConst.propChangeInfo[e];
            (g_oSpriteFrameLoader.load_in_bundle(
              g_tConst.GameConfig.BundleName.Common,
              g_tAsset.BACKPACK_ITEM_PATH[10],
              t.pic,
              this.propIcon,
            ),
              (this.title.string = t.name),
              (this.priceIcon.node.active = !1),
              (this.price.string = "\u5151\u6362"),
              (this.nAwards.active = !1));
          },
          useTimer: function () {
            var e = g_oData.get(g_tData.Mod_hall_Shop).getLeftTime(this._data);
            if (e > 0) {
              var t,
                i = Math.floor(e / 60),
                a = e % 60;
              ((t = (i = i >= 10 ? i : "0" + i) + ":" + (a = a >= 10 ? a : "0" + a)),
                (this.price.string = t));
            } else
              (this.unschedule(this.useTimer),
                (this._data.state = g_oData.get(g_tData.Mod_hall_Shop).getCoinADState(this._data)),
                this.setItemView(this._data.state));
          },
          setPrice: function () {
            this._data.priceType
              ? ((this.priceIcon.node.active = !0), (this.price.string = "" + this._data.price))
              : ((this.priceIcon.node.active = !1),
                (this.price.string = "\uffe5" + this._data.price));
          },
          onClickItem: function () {
            if (this._data.isAd) this.clickAdGet(this._data);
            else if (this._data.exchangeGoods) {
              if (1801 == this._data.id)
                return void g_oLayerManager.emitEvent2Dlg(
                  g_tConst.GameLayerCfg.BuyRecorder.id,
                  "ON_INIT",
                );
              var e;
              ((e = Array(Number(this.price.string)).fill(this._data.goodsid)),
                g_oData.get(g_tData.mod_gamecfg).reqGameDiamondExchangeGoldByIds(e, 0, "shop"));
            } else {
              var t = this._data.goodsdesc,
                i = g_oData.get(g_tData.Mod_hall_Shop).getShopZFScene(this._data.goodsid),
                a = { num: 0 };
              ((a.type = g_tConst.GameConfig.ItemType.CSFare),
                (a.goodsInfo = {
                  desc: this._data.goodsdesc,
                  iconBundle: g_tConst.GameConfig.BundleName.Common,
                  iconPath: g_tAsset.BACKPACK_ITEM_PATH[this._data.newGoodsType],
                  iconName: this._data.newGoodspic,
                }),
                o.zfItem(this._data, i, {
                  customService: { payType: "", addDesc: t },
                  payForAnother: {
                    giftInfo: {
                      giftName: this._data.goodsname,
                      giftPrice: this._data.price,
                      goodsInfoArr: [a],
                    },
                  },
                }));
            }
          },
          clickAdGet: function (e) {
            switch (e.state) {
              case 0:
                break;
              case 1:
                this.onClickShareGet(e.data.type);
            }
          },
          onClickShareGet: function (e) {
            var t = {
              Scene: g_tConst.ShareConfig.ShareScene.hall,
              Module: g_tConst.ShareConfig.ShareModule.shopJiPaiQi,
              SubModule: g_tConst.ShareConfig.ShareSubModule.shopJiPaiQi,
              ShareType: g_tConst.ShareConfig.ShareType.shopJiPaiQi,
              AdScene: g_tConst.AwardAdPID.shopJiPaiQi,
              enbleSubGuide: !1,
              cbSuc: function () {
                g_oData.get(g_tData.GetAwardMod).reqReceiveAward(e);
              },
            };
            this.invideoAD(t);
          },
        }),
          cc._RF.pop());
      },
      { CommonSDK: "CommonSDK", CommonUtils: "CommonUtils", DlgBaseView: "DlgBaseView" },
    ],
