    SlyderItem: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "ebd7ax2akJEcr51dMtBR9Js", "SlyderItem");
        var i = e("CommonUtils");
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            label_desc: { default: null, type: cc.Label, tooltip: "\u5956\u54c1\u63cf\u8ff0" },
            spriteIcon: { default: null, type: cc.Sprite, tooltip: "\u5956\u54c1ICON" },
            spriteFrameAward: {
              default: [],
              type: [cc.SpriteFrame],
              tooltip: "\u5bf9\u5e94\u7684\u5956\u54c1\u7eb9\u7406",
            },
          },
          Awake: function () {
            ((this._nIndex = -1), this.onCustomEvent());
          },
          onCustomEvent: function () {
            this.node.on("ON_INIT", this.onInit, this);
          },
          onInit: function (e) {
            if (((this._GoodsCfg = e.GoodsCfg), (this._nIndex = this._GoodsCfg.index), !e.open)) {
              var t = 360 / e.gearNum;
              return (
                (this.node.angle = t * this._nIndex - t / 2),
                void (this.spriteIcon.node.parent.active = !1)
              );
            }
            ((this.spriteIcon.node.parent.active = !0), this._initAwardDesc(), this._initIcon());
          },
          _initAwardDesc: function () {
            var e = "";
            (this._isGameCoin(this._GoodsCfg.type, this._GoodsCfg.goodsID)
              ? (e =
                  this._GoodsCfg.minNum !== this._GoodsCfg.maxNum
                    ? i.translateCoinStr(i.initProCoin(this._GoodsCfg.minNum)) +
                      "~" +
                      i.translateCoinStr(i.initProCoin(this._GoodsCfg.maxNum)) / NaN
                    : i.translateCoinStr(i.initProCoin(this._GoodsCfg.minNum)) + "\u8c46")
              : this._isFare(this._GoodsCfg.type, this._GoodsCfg.goodsID)
                ? (g_oData.get(g_tData.SwitchModel).sub.exchange.isZJExchange,
                  (e = this._GoodsCfg.minNum + "\u5151\u6362\u5238"))
                : this._isRedPacket(this._GoodsCfg.type, this._GoodsCfg.goodsID)
                  ? (e = this._isShowRedPacket()
                      ? this._GoodsCfg.minNum !== this._GoodsCfg.maxNum
                        ? (this._GoodsCfg.minNum / 100).toFixed(2) +
                          "~" +
                          (this._GoodsCfg.maxNum / 100).toFixed(2) +
                          "\u5143"
                        : (this._GoodsCfg.minNum / 100).toFixed(2) + "\u5143"
                      : i.translateCoinStr(i.initProCoin(88e4)) + "\u8c46")
                  : this._isGameDiamond(this._GoodsCfg.type, this._GoodsCfg.goodsID) &&
                    (e = this._GoodsCfg.minNum + "\u94bb\u77f3"),
              (this.label_desc.string = e));
          },
          _initIcon: function () {
            var e = g_tConst.eSlyderAwardIcon.Coin1888;
            (this._isGameCoin(this._GoodsCfg.type, this._GoodsCfg.goodsID)
              ? (e =
                  this._GoodsCfg.minNum >= 1e5
                    ? g_tConst.eSlyderAwardIcon.Coin10w
                    : this._GoodsCfg.minNum >= 1e4
                      ? g_tConst.eSlyderAwardIcon.Coin10000
                      : g_tConst.eSlyderAwardIcon.Coin1888)
              : this._isFare(this._GoodsCfg.type, this._GoodsCfg.goodsID)
                ? (e = g_tConst.eSlyderAwardIcon.fare)
                : this._isRedPacket(this._GoodsCfg.type, this._GoodsCfg.goodsID)
                  ? (e = this._isShowRedPacket()
                      ? g_tConst.eSlyderAwardIcon.redPacket
                      : g_tConst.eSlyderAwardIcon.Coin10w)
                  : this._isGameDiamond(this._GoodsCfg.type, this._GoodsCfg.goodsID) &&
                    (e = g_tConst.eSlyderAwardIcon.Diamond),
              (this.spriteIcon.spriteFrame = this.spriteFrameAward[e]));
          },
          _isGameCoin: function (e) {
            return e === g_tConst.GameConfig.ItemType.GoldCard;
          },
          _isGameDiamond: function (e) {
            return e === g_tConst.GameConfig.ItemType.Diamond;
          },
          _isFare: function (e) {
            return e === g_tConst.GameConfig.ItemType.SJFare;
          },
          _isRedPacket: function (e, t) {
            return (
              (e === g_tConst.GameConfig.ItemType.CSFare &&
                t === g_tConst.GameConfig.ItemID.SlyderRedPacket) ||
              e === g_tConst.GameConfig.ItemType.rmbSlyderRedPacket
            );
          },
          _isShowRedPacket: function () {
            return (
              g_oData.get(g_tData.SwitchModel).sub.slyder.isShowRedBag() ||
              g_oData.get(g_tData.SwitchModel).sub.exchange.isZJ
            );
          },
        }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils" },
    ],
