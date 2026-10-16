    hall_ShopItemView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "08e3clq75tLoLmUeimUViuw", "hall_ShopItemView");
        var i = e("CommonUtils");
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            image_hot: cc.Node,
            image_icon: cc.Sprite,
            txt_price: cc.Label,
            txt_gold: cc.Label,
            lay_iosPrice: cc.Node,
            lab_iosPrice: cc.Label,
            _GoodsInfo: { default: null },
            node_huiguitequantips: { default: null, type: cc.Node },
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
          setShopDiamondInfo: function (e, t, i) {
            (void 0 === t && (t = null),
              void 0 === i && (i = !1),
              (this._GoodsInfo = e),
              (this.lab_iosPrice.string = "\uffe5" + e.price),
              (this.txt_price.string = "\uffe5" + e.price),
              (this.txt_gold.string = e.goodsname),
              isNull(t) || (this.image_icon.spriteFrame = t),
              (this.image_hot.active = 1 == e.flag),
              this.node.getChildByName("isDouble") &&
                (this.node.getChildByName("isDouble").active = e.isPrivZF),
              i
                ? this.setShopInfo(e)
                : this.node_huiguitequantips && (this.node_huiguitequantips.active = !1));
          },
          onClickByGoods: function () {
            g_oData.get(g_tData.sdkLogin).checkLogin(
              function () {
                this.payItem(this._GoodsInfo);
              }.bind(this),
            );
          },
          payItem: function (e) {
            (e.isPrivZF && (e.extra = g_oData.get(g_tData.Mod_hall_Shop).getExtraZF(e.goodsid)),
              Log.debug("pay nID = ", e),
              this._rewardCallBack && this._rewardCallBack(e));
            var t = g_oData.get(g_tData.Mod_hall_Shop).getShopZFScene(this._GoodsInfo.goodsid);
            i.isIosSys()
              ? g_oData.get(g_tData.SwitchModel).isOpenServicePay() &&
                g_oData.get(g_tData.mod_ZFLogic).doCustomerServicePay(e, "diamond", t)
              : g_oPlatform.buyItem(e, 1, t);
          },
          clickShare: function () {
            var e = g_oData.get(g_tData.Mod_hall_Shop).getShopZFScene(this._GoodsInfo.goodsid),
              t = {};
            if (this._GoodsInfo.isPrivZF) {
              var i = g_oData.get(g_tData.Mod_hall_Shop).getExtraZF(this._GoodsInfo.goodsid);
              t.extra = i;
            }
            g_oData.get(g_tData.mod_Share).doPayForAnotherShare(this._GoodsInfo.id, e, t);
          },
          addListPayFinish: function () {
            var e = function () {
                g_oEvent.removeEventListener(t);
              }.bind(this),
              t = g_oEvent.addEventListener(g_tEvent.LOGIN_COMPLETE_GAME_ZF_LIST, e);
          },
          setShopInfo: function (e) {
            if (this.node_huiguitequantips) {
              var t = g_oData.get(g_tData.RegressionActMod).getShopAddBuffer();
              this.node_huiguitequantips.active = !e.isPrivZF && t > 0;
            }
          },
        }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils" },
    ],
