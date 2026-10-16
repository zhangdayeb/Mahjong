    shopDiamondBox: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "7b807AA9mFH9or6a4G1P8La", "shopDiamondBox"),
          e("CommonUtils"),
          e("CommonPlat"));
        var i = e("shopBoxBase");
        (cc.Class({
          extends: i,
          properties: {
            DiamondContent: cc.Node,
            shopItem: cc.Prefab,
            DiamondGoodIcon: [cc.SpriteFrame],
            _DiamondInfoList: [],
            _diamondRewardGoodInfo: null,
          },
          Awake: function () {
            this.onMessageEvent();
          },
          initBoxUI: function () {
            this.initDiamondList();
          },
          onEnable: function () {
            this._showView = !0;
          },
          onDisable: function () {
            this._showView = !1;
          },
          onMessageEvent: function () {
            var e = this,
              t = function () {}.bind(this);
            ((this._zfSDKSuccess = !1),
              this.autoDispose(
                g_oEvent.addEventListener(g_tEvent.ON_SDK_PAY_BACK, function (i) {
                  (console.log(
                    "lqr...",
                    "ON_SDK_PAY_BACK",
                    "1",
                    i,
                    g_tConst.PLAT_PAY_BACK.SUCCESS,
                    e._diamondRewardGoodInfo,
                  ),
                    i !== g_tConst.PLAT_PAY_BACK.SUCCESS
                      ? (e._diamondRewardGoodInfo = null)
                      : ((e._zfSDKSuccess = !0), t()),
                    console.log(
                      "lqr...",
                      "ON_SDK_PAY_BACK",
                      "2",
                      i,
                      g_tConst.PLAT_PAY_BACK.SUCCESS,
                      e._diamondRewardGoodInfo,
                    ));
                }),
              ),
              (this._zfSDKSuccess1 = !1),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.LOGIN_COMPLETE_GAME_ZF_LIST,
                  function (e) {
                    (console.log(
                      "lqr...",
                      "LOGIN_COMPLETE_GAME_ZF_LIST",
                      "1",
                      e,
                      this._diamondRewardGoodInfo,
                    ),
                      this._diamondRewardGoodInfo && ((this._zfSDKSuccess1 = !0), t()),
                      this.initDiamondList());
                  },
                  this,
                ),
              ));
          },
          initDiamondList: function () {
            var e = g_oGoodsManger.getDiamondListShopCfg();
            (console.log(" dList = ", e), (this._DiamondInfoList = e.slice()));
            for (
              var t = e.length,
                i = g_oData.get(g_tData.Mod_hall_Shop).isAct(),
                a = 0 == this.DiamondContent.children.length,
                o = 0;
              o < this.DiamondContent.children.length;
              o++
            )
              this.DiamondContent.children[o].active = !1;
            this._diamondRewardGoodInfo = null;
            for (var n = 0; n < t; n++) {
              var s = e[n],
                r = void 0;
              (r =
                !a && this.DiamondContent.children[n]
                  ? this.DiamondContent.children[n]
                  : g_oPrefabLoader.instantiate(this.shopItem, this.DiamondContent)).active = !0;
              var c = r.getComponent("hall_ShopItemView"),
                l = !!i && this.getIsFirstZF(s.goodsid);
              ((s.isPrivZF = l),
                c
                  ? (c.setShopDiamondInfo(s, this.DiamondGoodIcon[n], !0),
                    (c._rewardCallBack = function (e) {
                      this._diamondRewardGoodInfo = e;
                    }.bind(this)))
                  : Log.error("\u811a\u672c\u4e0d\u5b58\u5728"));
            }
          },
          getIsFirstZF: function (e) {
            return g_oData.get(g_tData.Mod_hall_Shop).checkIsFirstZFById(e);
          },
        }),
          cc._RF.pop());
      },
      { CommonPlat: "CommonPlat", CommonUtils: "CommonUtils", shopBoxBase: "shopBoxBase" },
    ],
