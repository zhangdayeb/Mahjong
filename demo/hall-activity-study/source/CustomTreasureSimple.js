    CustomTreasureSimple: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "7f08fIzHxVDzpbP9WGNSHN1", "CustomTreasureSimple"),
          cc.Class({
            extends: Cls_BaseView,
            properties: { ruleText: cc.Label, tip: cc.Label, _index: -1 },
            Awake: function () {
              (this.onCustomEvent(), this.onMessageEvent(), this.onInit());
            },
            onInit: function () {
              if (this.ruleText) {
                var e =
                    g_oData.get(g_tData.CustomTreasureMod).selectedCfg.refreshTime ||
                    g_oData.get(g_tData.sdkLogin).serverTime,
                  t = new Date(1e3 * e);
                this.ruleText.string =
                  "1.\u53c2\u4e0e\u6d3b\u52a8\uff0c\u53ef\u5728\u9875\u9762\u4e2d\u81ea\u9009\u5956\u52b1\u3002\u9875\u9762\u5956\u52b1\u5206\u4e3a4\u4e2a\u6863\u6b21\uff0c\u6bcf\u4e2a\u6863\u6b21\u53ef\u9009\u62e92\u4e2a\u3002\u9009\u5b9a\u5956\u54c1\u4e4b\u540e\u5373\u53ef\u5f00\u542f\u62bd\u5956\u9875\u9762\uff0c\u53c2\u4e0e\u6d3b\u52a8\u3002\u5956\u54c1\u9009\u5b9a\u4e4b\u540e\u4e0d\u53ef\u6539\u53d8\u3002\n2.\u4e0d\u653e\u56de\u5956\u6c60\u62bd\u5956\uff0c\u62bd8\u8f6e\u5373\u53ef\u89e3\u9501\u5168\u90e8\u81ea\u9009\u5956\u52b1\uff0c\u6bcf\u65e5\u5237\u65b0\u65f6\u95f4\u4e3a" +
                  t.getHours() +
                  "\u70b9\u3002\n3.\u6bcf\u65e5\u9650\u8d2d\u4e00\u6b21\u3002\n4.\u670d\u52a1\u5668\u5237\u65b0\u65f6\u95f4\u5b58\u5728\u5ef6\u8fdf \u8bf7\u907f\u514d\u5728\u5237\u65b0\u65f6\u95f4\u70b9\u64cd\u4f5c\u3002\n5.\u81ea\u9009\u5b9d\u85cf\u6d3b\u52a8\u6700\u7ec8\u89e3\u91ca\u6743\u5f52\u5b98\u65b9\u6240\u6709\uff0c\u6d3b\u52a8\u671f\u95f4\u5982\u9047\u7279\u6b8a\u60c5\u51b5\u6216\u4e0d\u53ef\u6297\u529b\u5f71\u54cd\uff0c\u5b98\u65b9\u6709\u6743\u8c03\u6574\u6216\u4e0b\u7ebf\u90e8\u5206\u5956\u52b1\u3002\n6.\u5982\u6709\u7591\u95ee\uff0c\u8bf7\u54a8\u8be2\u5b98\u65b9\u5ba2\u670d\u4e86\u89e3\u8be6\u60c5\u3002";
              }
            },
            buyPowerTip: function (e, t, i) {
              (void 0 === e && (e = null),
                void 0 === t && (t = null),
                (this._callBack = i),
                (this._index = t),
                (this.tip.string =
                  "\u4f53\u529b\u4e0d\u8db3\uff0c\u662f\u5426\u652f\u4ed8" +
                  e[t] +
                  "\u5143\u8d2d\u4e70\u201c\u56db\u5b63\u5e38\u6625\u724c\u684c (" +
                  e[t] +
                  "\u5929)\u201d\uff1f\u8d2d\u4e70\u6210\u529f\u540e\u5c06\u989d\u5916\u8d60\u9001" +
                  e[t] +
                  "\u4f53\u529b"));
            },
            onCustomEvent: function () {},
            onMessageEvent: function () {
              (this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GAME_PLAT_NOTIFY_PAY_RST,
                  function (e) {
                    var t = g_oData.get(g_tData.SwitchModel).getCustomTreasureCfg().DrawGoodsId;
                    (console.log(" RoyitemId", e.itemId),
                      -1 != t.indexOf(e.itemId) &&
                        (console.log(" Roy\u6210\u529f", e), this.close()));
                  },
                  this,
                ),
              ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.DRAW_CUSTOM_TREASURE_SUC,
                    function () {
                      this.close();
                    },
                    this,
                  ),
                ));
            },
            onClickExitChoose: function () {
              (g_oEvent.dispatchEvent(g_tEvent.CLOSE_CUSTOM_CHOOSE_VIEW), this.close());
            },
            onClickClose: function () {
              this.close();
            },
            onClickBuyPower: function () {
              this._callBack(!0);
              var e = g_oData.get(g_tData.SwitchModel).getCustomTreasureCfg().DrawGoodsId[
                  this._index
                ],
                t = g_oGoodsManger.getGoodByGoodsId(e);
              this.zfItem(t);
            },
            zfItem: function (t) {
              console.log("Roy zhifu data_121", t);
              var i = t.goodsdesc,
                a = [];
              (a.push({
                type: g_tConst.GameConfig.GiftBagIcon.CustomTreasure,
                desc: t.goodsdesc,
                num: 1,
              }),
                e("CommonSDK").zfItem(t, g_tConst.PaySceneId.pZFSceneIDCustomTreasure, {
                  customService: { payType: "zcoin", addDesc: i },
                  payForAnother: {
                    giftInfo: { giftName: t.goodsname, giftPrice: t.price, goodsInfoArr: a },
                  },
                }));
            },
          }),
          cc._RF.pop());
      },
      { CommonSDK: "CommonSDK" },
    ],
