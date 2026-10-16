    shopGiftBox: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "685b2WXxOtAPIKXbajV5+gv", "shopGiftBox");
        var i = e("CommonUtils"),
          a = (e("CommonPlat"), e("shopBoxBase")),
          o = cc.Enum({ LimitedGift: 0, SpecialActivity: 1 });
        (cc.Class({
          extends: a,
          properties: {
            boxNode: [cc.Node],
            youhuiShouchongItem: cc.Node,
            youhuiYouhuiItem: cc.Node,
            toggleCheckParent: cc.Node,
            nodeSpecialActivity: cc.Node,
            nodeLimitedGift: cc.Node,
            itemPrefab: cc.Prefab,
            _youhuiYouhuiItemCanPay: !1,
            _curPage: o.LimitedGift,
          },
          Awake: function () {
            (this.onCustomEvent(), this.onMessageEvent(), this.initData());
          },
          onCustomEvent: function () {},
          onEnable: function () {
            this.node.activeInHierarchy &&
              g_oData
                .get(g_tData.gameReportData)
                .reportClickAction(g_tConst.ReportCfg.ClickActionReport.ClickShopGiftBox);
          },
          onMessageEvent: function () {
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.GAMEPLAT_GET_SHAKE_COUNT,
                function () {
                  this.initShouchongUi();
                }.bind(this),
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.REFRESH_LIMITEDGIFT,
                  function () {
                    this.initLimitedGiftUI();
                  }.bind(this),
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.MJ_PLAT_BEE_BACK,
                  function () {
                    var e = this;
                    (this.initGameLuckyBox(),
                      g_oData
                        .get(g_tData.Mod_limitedGift)
                        .getHalfGiftCfg()
                        .then(function () {
                          e.initLimitedGiftUI();
                        }));
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(g_tEvent.GAME_DIAMOND_TO_GOLD_RESULT, function (e) {
                  -1 != g_tConst.specialIds.indexOf(e.id) &&
                    -1 == e.retCode &&
                    g_oPlatform.doAction(
                      g_tConst.tPlatActionId.actionShowToast,
                      "\u94bb\u77f3\u6570\u91cf\u4e0d\u8db3",
                    );
                }),
                this,
              ));
          },
          initData: function () {
            this._curPage = o.LimitedGift;
          },
          initBoxUI: function () {
            g_oData.get(g_tData.SwitchModel).isShowLimitedGift().isShow
              ? this.refreshToggle(this._curPage)
              : ((this.toggleCheckParent.active = !1),
                (this.nodeLimitedGift.active = !1),
                this.refreshToggle(o.SpecialActivity));
          },
          initLimitedGiftUI: function () {
            var e;
            e = this.itemPrefab;
            var t = g_oData.get(g_tData.Mod_limitedGift).getLimitedGiftCfg(),
              i = g_oData.get(g_tData.SwitchModel).isShowLimitedGift().showIndex.split("|");
            for (var a in t) {
              var o = t[a];
              if (-1 !== i.indexOf(o.goodsid + "")) {
                var n = this.nodeLimitedGift.getChildByName("limitedGiftItem_" + o.goodsid);
                n ||
                  (((n = g_oPrefabLoader.instantiate(e, this.nodeLimitedGift)).name =
                    "limitedGiftItem_" + o.goodsid),
                  (n.zIndex = i.indexOf()));
                var s = n.getComponent("limitedGiftItemView");
                s ? s.onData(o) : Log.error("\u811a\u672c\u4e0d\u5b58\u5728");
              }
            }
          },
          initSpecialActivityUI: function () {},
          refreshToggle: function (e) {
            ((this.toggleCheckParent.children[e].getComponent(cc.Toggle).isChecked = !0),
              this.onClickBoxToogle(null, e));
          },
          refreshContentUI: function (e) {
            for (var t = this.boxNode, i = 0; i < t.length; i++) t[i].active = !1;
            ((t[e].active = !0),
              e === o.LimitedGift &&
                (g_oData.get(g_tData.mod_Share).reqShareCfg(), this.initLimitedGiftUI()),
              e === o.SpecialActivity && (this.initShouchongUi(), this.initGameLuckyBox()));
          },
          refreshDenefitsDayUI: function () {},
          refreshLuckyBagUI: function () {},
          refreshHalfGiftUI: function () {},
          initShouchongUi: function () {
            g_oData.get(g_tData.mod_Gift).getTodayShakeNum() >= 8 &&
              this.youhuiShouchongItem
                .getChildByName("icon")
                .getComponent(cc.Sprite)
                .setMaterial(0, cc.Material.getBuiltinMaterial("2d-gray-sprite"));
          },
          onClickYouhuiItem: function () {
            this._youhuiYouhuiItemCanZF
              ? g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.youhuiYouhuiItem.id, "ON_INIT")
              : g_oPlatform.doAction(
                  g_tConst.tPlatActionId.actionShowToast,
                  "\u4eca\u65e5\u60a8\u5df2\u8fbe\u5230\u5e78\u8fd0\u5b9d\u7bb1\u7684\u8d2d\u4e70\u6b21\u6570\u4e0a\u9650\uff0c\u8bf7\u5c1d\u8bd5\u8d2d\u4e70\u5176\u5b83\u5546\u54c1",
                );
          },
          onClickShakeActivityItem: function () {
            var e = g_oData.get(g_tData.mod_Gift).getShakeNum();
            if ((console.log("onClickShakeActivityItem.leftCount:", e), e > 0))
              g_oLayerManager.emitEvent2Dlg(
                g_tConst.GameLayerCfg.ShakeActivityPackage.id,
                "ON_INIT",
              );
            else {
              var t = g_oData.get(g_tData.mod_Gift).getTodayShakeNum();
              (console.log("onClickShakeActivityItem.todayShakeNum:", t),
                t >= 8
                  ? g_oPlatform.doAction(
                      g_tConst.tPlatActionId.actionShowToast,
                      "\u4eca\u65e5\u6b21\u6570\u5df2\u7528\u5b8c",
                    )
                  : t >= 5 &&
                    g_oPlatform.doAction(
                      g_tConst.tPlatActionId.actionShowToast,
                      "\u5bf9\u5c40\u53ef\u83b7\u5f97\u6447\u4e00\u6447\u6b21\u6570\uff0c10\u5c40\u9001\u4e00\u6b21\uff0c\u6bcf\u5929\u6700\u591a\u90013\u6b21",
                    ));
            }
          },
          onClickBoxToogle: function (e, t) {
            ((this._curPage = Number(t)), this.refreshContentUI(this._curPage));
          },
          initGameLuckyBox: function () {
            ((this.youhuiYouhuiItem.active = !0),
              (this._youhuiYouhuiItemCanPay = !0),
              this.youhuiYouhuiItem &&
                cc.isValid(this.youhuiYouhuiItem) &&
                i.setGrey(this.youhuiYouhuiItem, this._youhuiYouhuiItemCanPay ? 0 : 1));
          },
          onClickGameLuckyBox: function () {
            (console.log(
              "max147111 onClickGameLuckyBox this._youhuiYouhuiItemCanPay = ",
              this._youhuiYouhuiItemCanPay,
            ),
              this._youhuiYouhuiItemCanPay
                ? g_oLayerManager.emitEvent2Dlg(
                    g_tConst.GameLayerCfg.ShakeActivityPackage.id,
                    "ON_INIT",
                  )
                : g_oPlatform.doAction(
                    g_tConst.tPlatActionId.actionShowToast,
                    "\u4eca\u65e5\u60a8\u5df2\u5230\u8fbe\u6447\u4e00\u6447\u7684\u8d2d\u4e70\u6b21\u6570\u4e0a\u9650\uff0c\u8bf7\u5c1d\u8bd5\u8d2d\u4e70\u5176\u5b83\u5546\u54c1",
                  ));
          },
        }),
          cc._RF.pop());
      },
      { CommonPlat: "CommonPlat", CommonUtils: "CommonUtils", shopBoxBase: "shopBoxBase" },
    ],
