    MaCardShop: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "c8dc0KEMqZOW5XlT5dE6cRb", "MaCardShop");
        var i = e("BasePayView"),
          a = e("CommonUtils"),
          o = e("CommonPlat");
        (cc.Class({
          extends: i,
          properties: {
            MkbkNormalNode: cc.Node,
            _MkbkNormalKey: "MaCardNormal",
            TimeBgIcon: cc.Node,
            ShowNumTipLabel: cc.Label,
            TitleIconArr: [cc.SpriteFrame],
            WelfareIconArr: [cc.SpriteFrame],
            WelfareTypeItem: cc.Prefab,
            ShopListNode: cc.Node,
            ShopListContent: cc.Node,
            MaCardItemPrefab: cc.Prefab,
            DayNumIconArr: [cc.SpriteFrame],
            BottomTip: cc.Label,
            _ShowDataInfo: null,
            _GoodCfg: null,
            _showGetCoinAfterBuyMKBK: null,
            _IsZfFriend: !1,
            getBtnNode: cc.Node,
            renewBtnNode: cc.Node,
          },
          Awake: function () {
            (this._super(),
              (this._closeReleaseRes = !0),
              (this._IsZfFriend = !1),
              (this.ShopListNode.active = !1),
              (this._MKBKGoodsList = []),
              this.onCustomEvent(),
              this.onMessageEvent());
          },
          start: function () {
            ((this._MkbkNormalNodeSrc = this.MkbkNormalNode.getComponent(this._MkbkNormalKey)),
              this._MkbkNormalNodeSrc.onInitMaCardDetailInfo(
                this.WelfareTypeItem,
                this.TitleIconArr,
                this.WelfareIconArr,
              ),
              (this.MkbkNormalNode.active = !0),
              this.onInitShopList());
          },
          onInit: function (e) {
            void 0 === e && (e = null);
            var t = g_oData.get(g_tData.SwitchModel).isOpenPayForAnother();
            ((this._IsZfFriend = t),
              e && (this._closeCb = e.closeCb),
              a.isIosSys() && this._IsZfFriend
                ? (this.BottomTip.string =
                    "\u7406\u6027\u6d88\u8d39\uff0c\u9002\u5ea6\u5a31\u4e50\uff01\u4ec5\u5b89\u5353\u597d\u53cb\u53ef\u4ee5\u8d60\u9001\u3002")
                : (this.BottomTip.string =
                    "\u7406\u6027\u6d88\u8d39\uff0c\u9002\u5ea6\u5a31\u4e50\uff01"),
              e &&
                e.closeBuyNode &&
                ((this.getBtnNode.active = !1), (this.renewBtnNode.active = !1)));
          },
          updateGoodsInfo: function () {},
          onInitShopList: function () {
            var e = this;
            this.ShopListContent.removeAllChildren();
            var t = g_oGoodsManger.getMaCardInfoListCfg();
            this._MKBKGoodsList = t || [];
            for (var i = t.length, a = null, o = 0; o < i; o++) {
              var n = t[o],
                s = g_oPrefabLoader
                  .instantiate(this.MaCardItemPrefab, this.ShopListContent)
                  .getComponent("MaCardItem"),
                r = n.goodicon,
                c = { nData: n, itemIdx: o };
              (isNull(a) ? (a = n) : a.price >= n.price && (a = n),
                s.initItem(c, this.DayNumIconArr[r - 1], function (t) {
                  e.clickMaCardItemAction(t);
                }));
            }
            isNull(a)
              ? (this.TimeBgIcon.active = !1)
              : ((this.ShowNumTipLabel.string = a.price + "\u94bb/" + a.goodsSubDesc),
                (this.TimeBgIcon.active = !0));
          },
          clickMaCardItemAction: function (e) {
            var t = this;
            if ((console.log("max147258 clickMaCardItemAction data = ", e), !isNull(e))) {
              var i =
                "<color=#A15F38>\u662f\u5426\u6d88\u8017<color=#ff0000>" +
                e.price +
                "\u94bb\u77f3<color=#A15F38>\uff0c\u8d2d\u4e70<color=#ff0000>" +
                e.goodsSubDesc +
                "<color=#A15F38>\u9ebb\u5361\u5df4\u5361";
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Alert.id, "ON_INIT", {
                data: {
                  title: "\u63d0\u793a",
                  value: i,
                  okText: "\u786e\u5b9a",
                  cancelText: "\u653e\u5f03",
                  hideClose: !0,
                  ok: function () {
                    t.goToExchangeAction(e);
                  },
                },
              });
            }
          },
          goToExchangeAction: function (e) {
            (this.onClickShopListNode(),
              g_tConst.PaySceneId.payMaKaBaKaGoodByHall,
              a.isOnGameScene() && g_tConst.PaySceneId.payMaKaBaKaGoodByTable,
              g_oData.get(g_tData.sdkLogin).checkLogin(
                function () {
                  var t = g_oData.get(g_tData.Mod_hall_Shop).getDHReportHead() + "-MaCardShop";
                  g_oData.get(g_tData.mod_gamecfg).reqGameDiamondExchangeGold(e.exchangeId, 0, t);
                }.bind(this),
              ));
          },
          onCustomEvent: function () {
            this.node.on("ON_INIT", this.onInit, this);
          },
          onMessageEvent: function () {
            var e = this;
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.EXCHANGE_SUCCESS_BACK,
                function () {
                  console.warn("lqr...", "EXCHANGE_SUCCESS_BACK");
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(g_tEvent.SDK_PLAT_BEE_BACK, function (t) {
                  switch ((console.log("max147258 MJ_PLAT_BEE_BACKMJ_PLAT_BEE_BACK"), t)) {
                    case g_tConst.PLAT_PAY_BACK.SUCCESS:
                      e.onClickClose();
                      break;
                    case g_tConst.PLAT_PAY_BACK.CANCLE:
                      break;
                    default:
                      e.onClickClose();
                  }
                }),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.SDK_USER_INFO_CHG,
                  function (e) {
                    var t = this._MKBKGoodsList.find(function (t) {
                      (t.goodsid, e.subreason);
                    });
                    if (2 == e.reason && t) {
                      var i = a.Long2Number(e.chgcoin),
                        o = [];
                      ((o[0] = { type: g_tConst.GameConfig.ItemType.GoldCard, count: i }),
                        (this._showGetCoinAfterBuyMKBK = function () {
                          g_oLayerManager.emitEvent2Dlg(
                            g_tConst.GameLayerCfg.GetAward.id,
                            "onInit",
                            { data: o },
                          );
                        }));
                    }
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.AFTER_GAME_TOAST_HIDE,
                  function () {
                    "function" == typeof this._showGetCoinAfterBuyMKBK &&
                      this._showGetCoinAfterBuyMKBK();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GAME_DIAMOND_TO_GOLD_RESULT,
                  function (e) {
                    var t = null;
                    if (
                      (0 == e.retCode
                        ? ((t =
                            "\u5151\u6362\u6210\u529f\uff0c\u606d\u559c\u60a8\u6210\u4e3a\u5c0a\u8d35\u7684\u9ebb\u5361\u5df4\u5361\u7528\u6237\uff01"),
                          g_oEvent.dispatchEvent(g_tEvent.CLOSE_BROKE_HELP))
                        : (t =
                            -1 == e.retCode
                              ? "\u94bb\u77f3\u6570\u91cf\u4e0d\u591f\uff0c\u5151\u6362\u5931\u8d25"
                              : "\u5151\u6362\u5931\u8d25\uff0c\u8bf7\u91cd\u65b0\u5151\u6362"),
                      -1 == e.retCode)
                    ) {
                      var i = this;
                      g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Alert.id, "ON_INIT", {
                        data: {
                          title: "\u63d0\u793a",
                          value:
                            "\u4f60\u7684\u94bb\u77f3\u4e0d\u8db3\uff0c\u662f\u5426\u524d\u5f80\u94bb\u77f3\u8d2d\u4e70\u754c\u9762\uff1f",
                          okText: "\u524d\u5f80",
                          cancelText: "\u53d6\u6d88",
                          hideClose: !0,
                          ok: function () {
                            (g_oLayerManager.emitEvent2Dlg(
                              g_tConst.GameLayerCfg.Hall_Shop.id,
                              "ON_INIT",
                              { showType: 3 },
                            ),
                              i.onClickClose(),
                              g_oEvent.dispatchEvent(g_tEvent.CLOSE_BROKE_HELP));
                          },
                        },
                      });
                    } else
                      isNull(t) ||
                        g_oLayerManager.emitEvent2Dlg(
                          g_tConst.GameLayerCfg.TipsLayer.id,
                          "SHOW_NORMAL_TIP",
                          { tipMsg: t, showTime: 2 },
                        );
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.MKBK_STATE_CHANGE_SERVICE_TIME,
                  function () {
                    !isNull(this._MkbkNormalNodeSrc) &&
                      this._MkbkNormalNodeSrc.updateGetNodeState();
                  },
                  this,
                ),
              ));
          },
          onClickClose: function () {
            (this.unschedule(this.callback), this._closeCb && this._closeCb(), this.close());
          },
          onClickGet: function () {
            if (
              (g_oData.get(g_tData.MakabakaMod).MKBKExpireTime -
                g_oData.get(g_tData.sdkLogin).serverTime) /
                86400 >
              3600
            )
              g_oPlatform.doAction(
                g_tConst.tPlatActionId.actionShowToast,
                "\u8d2d\u4e70\u5931\u8d25\uff0c\u5df2\u8fbe\u5230\u6700\u5927\u65f6\u957f!",
              );
            else {
              if (
                g_oData.get(g_tData.RegressionActMod).getLeftTime() > 0 &&
                g_oData.get(g_tData.RegressionActMod).checkMKBKNeedShowTips()
              )
                return void this._onClickGet();
              this._MKBKGoodsList.length > 1
                ? (this.ShopListNode.active = !0)
                : 1 === this._MKBKGoodsList.length &&
                  this.clickMaCardItemAction(this._MKBKGoodsList[0]);
            }
          },
          onClickShopListNode: function () {
            this.ShopListNode.active = !1;
          },
          showZFTip: function (e, t) {
            var i = this;
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Alert.id, "ON_INIT", {
              data: {
                title: "\u63d0\u793a",
                value: e,
                type: 1,
                ok: function () {
                  g_oData.get(g_tData.sdkLogin).checkLogin(
                    function () {
                      this.ZFItem(t);
                    }.bind(i),
                  );
                },
              },
            });
          },
          _onClickGet: function () {
            var e = g_oData.get(g_tData.MakabakaMod).getMKBKCfg(g_tConst.MKBK_PROP_ID.Normal),
              t = format(
                "\u662f\u5426\u6d88\u8017<color=#ee7b00>{0}\u94bb\u77f3</c>\uff0c\u8d2d\u4e70<color=#ee7b00>{1}\u5929</c>{2}\u9ebb\u5361\u5df4\u5361",
                e.gameGold,
                30,
                "",
              );
            this.showZFTip(t, e);
          },
          ZFItem: function (e) {
            if (g_oData.get(g_tData.sdkUser).gameGold < e.gameGold) {
              if (!o.canPay())
                return void g_oPlatform.doAction(
                  g_tConst.tPlatActionId.actionShowToast,
                  "\u94bb\u77f3\u4e0d\u8db3",
                );
              g_oPlatform.doAction(
                g_tConst.tPlatActionId.actionShowToast,
                "\u94bb\u77f3\u4e0d\u8db3",
              );
            }
            var t = g_oData.get(g_tData.Mod_hall_Shop).getDHReportHead() + "-NewMaCardShop";
            g_oData.get(g_tData.Mod_hall_Shop).reqExchangePorp(e.id, void 0, void 0, t);
          },
        }),
          cc._RF.pop());
      },
      { BasePayView: "BasePayView", CommonPlat: "CommonPlat", CommonUtils: "CommonUtils" },
    ],
