    hall_ShopView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "57df5y8plZKS6KlfVh+PaVA", "hall_ShopView");
        var i = e("AlertDlgBaseView"),
          a = e("CommonUtils"),
          o = e("CommonPlat"),
          n = cc.Enum({
            youhuibtn: 0,
            coinbtn: 1,
            DiamondBtn: 2,
            LeagueMatchBtn: 3,
            ZCoin: 4,
            DeskBtn: 5,
            PropBtn: 6,
          }),
          s = cc.Class({
            name: "ShopToggle",
            properties: {
              type: { default: n.youhuibtn, type: n },
              toggle: cc.Toggle,
              prefab: cc.Prefab,
              boxNode: cc.Node,
              _initSucc: !1,
              _extraData: null,
            },
            initBox: function () {
              !this._initSucc &&
                this.prefab &&
                (this.boxNode = g_oPrefabLoader.instantiate(this.prefab, this.boxNode));
              var e = this.boxNode.getComponent("shopBoxBase");
              (cc.isValid(e) && e.initBoxUI(this._extraData), (this._initSucc = !0));
            },
            check: function () {
              this.toggle.check();
            },
            showBox: function () {
              (this._initSucc || this.initBox(), (this.boxNode.active = !0));
            },
            hideBox: function () {
              this._initSucc && (this.boxNode.active = !1);
            },
            hideToggle: function () {
              ((this.toggle.node.active = !1), this.hideBox());
            },
            setExtraData: function (e) {
              this._extraData = e;
            },
          });
        (cc.Class({
          extends: i,
          properties: {
            toggleContain: cc.ToggleContainer,
            ShopToggles: [s],
            nodeCoinRoot: cc.Node,
            DiamondRoot: cc.Node,
            ZCoinRoot: cc.Node,
            LsbRoot: cc.Node,
            labIosTips: cc.Label,
            cnName: cc.Label,
            spellName: cc.Label,
            _selectBtn: n.youhuibtn,
            _IsZfByFriend: !1,
            widget_left: cc.Widget,
          },
          Awake: function () {
            ((this._event = null),
              this.onCustomEvent(),
              this.onMessageEvent(),
              this.updateShowZF());
          },
          onCustomEvent: function () {
            (this.node.on(
              "ON_INIT",
              function (e) {
                ((this._event = e),
                  isNull(e) || isNull(e.showType) || (this._selectBtn = parseInt(e.showType) - 1));
              }.bind(this),
            ),
              this.node.on(
                "ON_INIT_HORNOR_PRIVILEGE",
                function (e) {
                  ((this._event = e), this.onInitHonorPrivilege(e));
                }.bind(this),
              ),
              this.node.on(
                "INIT_COIN",
                function (e) {
                  ((this._event = e), (this._selectBtn = n.coinbtn));
                }.bind(this),
              ),
              this.node.on(
                "INIT_ZCOIN",
                function (e) {
                  this._event = e;
                  var t = g_oData.get(g_tData.Mod_hall_Shop).isAct();
                  this._selectBtn = t ? n.ZCoin : n.coinbtn;
                }.bind(this),
              ));
          },
          onMessageEvent: function () {
            (this.autoDispose(
              g_oEvent.addEventListener(g_tEvent.ON_SDK_PAY_BACK, function () {
                g_oData.get(g_tData.mod_gamecfg).updateAutoExchangeGoldInfo(null);
              }),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GAME_DIAMOND_TO_GOLD_RESULT,
                  function (e) {
                    if (
                      this._selectBtn != n.DeskBtn &&
                      this._selectBtn != n.PropBtn &&
                      -1 == g_tConst.specialIds.indexOf(e.id)
                    )
                      if (0 == e.retCode) {
                        var t,
                          i = g_oData.get(g_tData.mod_ZFLogic).getPointExchangeGoodsByDiaId(e.id),
                          o = null;
                        if (i) t = a.translateCoinStr(i.exchangeCoin);
                        else {
                          var s = g_oData.get(g_tData.Mod_hall_Shop).getDiamondExChangeCfg();
                          -1 != g_oData.get(g_tData.Mod_hall_Shop).getFilterId().indexOf(e.id) &&
                            (s.forEach(function (t) {
                              t.id != e.id || (o = t);
                            }),
                            o &&
                              (((i = {}).exchangeCoin = o.exchangeGoods[0].num),
                              (t = o.goodsname),
                              g_oData.get(g_tData.Mod_hall_Shop).updateShopZCoinEhg(o.id)));
                        }
                        var r = [
                            {
                              type: g_tConst.GameConfig.ItemType.DiamondToGold,
                              goodsInfo: { desc: t, num: i.exchangeCoin },
                            },
                          ],
                          c = g_oData.get(g_tData.SwitchModel).getShopCoinIdCfg();
                        if (
                          (-1 != c.idArr.indexOf(i.id) &&
                            (g_oData
                              .get(g_tData.mod_gamecfg)
                              .getDiamondGoodsListInfo()
                              .forEach(function (t) {
                                t.id != e.id || (o = t);
                              }),
                            o &&
                              (((i = {}).exchangeCoin = o.exchangeGoods[0].num),
                              (t = o.goodsname))),
                          console.log(" GAME_DIAMOND_TO_GOLD_RESULT shop tItemInfos = ", r, i, c),
                          o && o.privCfg && o.privCfg.isPrivZF)
                        ) {
                          var l,
                            g,
                            d = i.exchangeCoin;
                          if (o.exchangeGoods[0].type == g_tConst.GameConfig.ItemType.GoldCard) {
                            ((l = g_tConst.GameConfig.ItemType.GoldCard),
                              (g = g_tConst.HonorMulType.CoinMul));
                            var h = g_oData
                              .get(g_tData.Mod_hall_Shop)
                              .getPrivInfo(g_tConst.ShopServerPrivType.Coin);
                            h.isPrivZF && (d *= h.multiRate);
                          } else if (
                            o.exchangeGoods[0].type == g_tConst.GameConfig.ItemType.ZCoin
                          ) {
                            ((l = g_tConst.GameConfig.ItemType.ZCoin),
                              (g = g_tConst.HonorMulType.ZCoinMul));
                            var u = g_oData
                              .get(g_tData.Mod_hall_Shop)
                              .getPrivInfo(g_tConst.ShopServerPrivType.ZCoin);
                            u.isPrivZF && (d *= u.multiRate);
                          }
                          if (g && l) {
                            var _ = [{ num: d, type: l, HonorPrivilegeType: g }];
                            return void g_oEvent.dispatchEvent(
                              g_tEvent.BASEHALL_SHARE_EVNET_NORMAL_AWARD_GET,
                              { allAward: _ },
                            );
                          }
                        }
                        g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.GetAward.id, "onInit", {
                          data: r,
                        });
                      } else if (-1 == e.retCode)
                        if (a.isIosSys() && g_oData.get(g_tData.SwitchModel).isOpenPayForAnother())
                          this.notEnoughDiamondExchangeFunc();
                        else {
                          var m = g_oData.get(g_tData.sdkUser).gameGold,
                            f = e.id,
                            p = g_oData.get(g_tData.mod_gamecfg).getDiamondGoodsListInfo(),
                            C = p.length,
                            v = g_oGoodsManger.getDiamondListShopCfg(),
                            y = v.length,
                            S = v[y - 1],
                            D = null;
                          if (C > 0) {
                            for (var T = 0; T < C; T++) {
                              var I = p[T];
                              if (!isNull(I) && I.id == f) {
                                D = I;
                                break;
                              }
                            }
                            var E = D.gameGold - m;
                            if (y > 0)
                              for (var M = 0; M < y; M++) {
                                var L = v[M];
                                if (!isNull(L) && L.goodsTotal >= E) {
                                  S = L;
                                  break;
                                }
                              }
                            console.log(" currGoodInfo = ", E, D, " --- needGoodInfo = ", S);
                          }
                          if (isNull(D) || isNull(S)) this.notEnoughDiamondExchangeFunc();
                          else {
                            console.log(" needGoodInfo = ", S);
                            var A = D.exchangeGoods[0],
                              P = !1;
                            a.isIosSys() &&
                              g_oData.get(g_tData.SwitchModel).isOpenPayForAnother() &&
                              (P = !0);
                            var N = P
                                ? ""
                                : "<color=#A15F38>\u5145\u503c\u6210\u529f\u540e\u5c06\u4e3a\u60a8\u81ea\u52a8\u5151\u6362<color=#ff0000>" +
                                  a.translateCoinStr(a.initProCoin(A.num)) +
                                  "\u8c46",
                              w =
                                "<color=#A15F38>\u94bb\u77f3\u4e0d\u8db3\uff0c\u662f\u5426\u7528<color=#ff0000>" +
                                S.price +
                                "<color=#A15F38>\u5143\u5145\u503c<color=#ff0000>" +
                                S.goodsname +
                                "<color=#A15F38>\uff1f" +
                                N +
                                "<color=#A15F38>\uff0c\u5feb\u53bb\u5145\u503c\u5427\uff01";
                            g_oLayerManager.emitEvent2Dlg(
                              g_tConst.GameLayerCfg.Alert.id,
                              "ON_INIT",
                              {
                                data: {
                                  title: "\u94bb\u77f3\u4e0d\u8db3",
                                  value: w,
                                  okText: "\u786e\u5b9a",
                                  type: 1,
                                  ok: function () {
                                    (g_oData
                                      .get(g_tData.mod_gamecfg)
                                      .updateAutoExchangeGoldInfo({ pGoods: S, eGoods: D }),
                                      a.isIosSys()
                                        ? g_oData.get(g_tData.SwitchModel).isOpenServicePay() &&
                                          g_oData
                                            .get(g_tData.mod_ZFLogic)
                                            .doCustomerServicePay(
                                              S,
                                              "diamond",
                                              g_tConst.PaySceneId.paySceneIDShop,
                                            )
                                        : g_oPlatform.buyItem(
                                            S.id,
                                            1,
                                            g_tConst.PaySceneId.paySceneIDShop,
                                          ),
                                      console.log("1 okokokokok"));
                                  },
                                },
                              },
                            );
                          }
                        }
                      else
                        this.notEnoughDiamondExchangeFunc(
                          "\u5151\u6362\u5931\u8d25\uff0c\u8bf7\u91cd\u65b0\u5151\u6362",
                        );
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.NOTIFY_ENTER_GAME,
                  function () {
                    this.close();
                  },
                  this,
                ),
              ));
          },
          updateShowZF: function () {
            var e = o.canPay(),
              t = g_oData.get(g_tData.Mod_hall_Shop).isAct(),
              i = g_oData.get(g_tData.SwitchModel).getShopLeagueMatchCfg().kg;
            ((this.getShopToggle(n.ZCoin).toggle.node.active = t),
              (this.getShopToggle(n.DiamondBtn).toggle.node.active = e),
              (this.getShopToggle(n.youhuibtn).toggle.node.active = e),
              (this.getShopToggle(n.LeagueMatchBtn).toggle.node.active = e && i),
              (this.getShopToggle(n.PropBtn).toggle.node.active = e));
            var a = g_oData.get(g_tData.SwitchModel).getHallShopCfgH5().toggleShows;
            for (var s in n)
              if (n.hasOwnProperty.call(n, s)) {
                var r = n[s],
                  c = this.getShopToggle(r).toggle;
                c.node.active && ((c.node.active = a.includes(r)), (c.node.zIndex = a.indexOf(r)));
              }
          },
          notEnoughDiamondExchangeFunc: function (e) {
            (void 0 === e && (e = null),
              isNull(e) &&
                (e =
                  "\u94bb\u77f3\u4e0d\u8db3\uff0c\u8bf7\u8865\u5145\u94bb\u77f3\uff0c\u518d\u8fdb\u884c\u5151\u6362"),
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.TipsLayer.id, "SHOW_NORMAL_TIP", {
                tipMsg: e,
                showTime: 2,
              }));
          },
          onClickClose: function () {
            (this.showInterstitialStaticAd(),
              this._event && this._event.closeCallBack && this._event.closeCallBack(),
              this.close());
          },
          showInterstitialStaticAd: function () {
            var e = {
              Scene: g_tConst.ShareConfig.ShareScene.hall,
              Module: g_tConst.ShareConfig.ShareModule.SeeVideo,
              SubModule: g_tConst.ShareConfig.ShareSubModule.SeeVideo,
              AdScene: g_tConst.InterstitialStaticPID.CloseShopView,
              cbSuc: function () {
                g_oData
                  .get(g_tData.mod_Share)
                  .getShareCntByLinkID(g_tConst.ShareConfig.ShareLinkId.CloseShopStaticAD) > 0 &&
                  g_oData
                    .get(g_tData.mod_Share)
                    .reqGPShareSuc(
                      g_tConst.ShareConfig.ShareLinkId.CloseShopStaticAD,
                      void 0,
                      void 0,
                      e.type,
                    );
              },
            };
            g_oAdManager.doSeeAd(g_tConst.eADType.InterstitialStaticAd, e.AdScene, e);
          },
          start: function () {
            (this._super(),
              this.showTips(),
              this.initUi(),
              this.initAllToggle(),
              this.setLeftPos());
          },
          setLeftPos: function () {
            cc.winSize.width >= 1380 &&
              ((this.widget_left.left = (cc.winSize.width - 1380) / 2 + 8),
              this.widget_left.updateAlignment());
          },
          initAllToggle: function () {
            var e = this;
            ((this.toggleContain.allowSwitchOff = !0),
              this.ShopToggles.forEach(function (t) {
                if (t.toggle.node.active) {
                  (t.setExtraData(e._event), (t.toggle.isChecked = !1));
                  var i = new cc.Component.EventHandler();
                  ((i.target = e),
                    (i.component = e.__classname__),
                    (i.handler = "onClickToggle"),
                    (i.customEventData = "" + t.type),
                    t.toggle.checkEvents.push(i));
                }
              }),
              this.getShopToggle(this._selectBtn).check(),
              (this.toggleContain.allowSwitchOff = !1));
          },
          initUi: function () {
            var e = this;
            (g_oPrefabLoader.loadRes(g_tAsset.ComCoinNumPrefab, this.nodeCoinRoot, function (e) {
              (e.emit("SHOW_ADD_COIN_BTN", !1), e.getComponent("ComCoinNum").hideAddBtn(!1));
            }),
              g_oPrefabLoader.loadRes(g_tAsset.DiamondNumPrefab, this.DiamondRoot, function (e) {
                e.emit("SHOW_ADD_COIN_BTN", !1);
              }),
              g_oPrefabLoader.loadRes(g_tAsset.ZCoinNumPrefab, this.ZCoinRoot, function (e) {
                e.emit("SHOW_ADD_COIN_BTN", !1);
              }),
              g_oPrefabLoader.loadRes(g_tAsset.LeagueMatchNumPrefab, this.LsbRoot, function (t) {
                t.getComponent("LeagueMatchNum").initBtn(!1, e._selectBtn);
              }));
          },
          onClickToggle: function (e, t) {
            var i = Number(t);
            this._selectBtn = i;
            for (var a = 0; a < this.ShopToggles.length; a++)
              this.ShopToggles[a].type === i
                ? (this.ShopToggles[a].showBox(),
                  i == n.coinbtn
                    ? g_oEvent.dispatchEvent(g_tEvent.SET_NEW_WEEKLY_CARD_TOGGLE, "coin")
                    : i == n.ZCoin &&
                      g_oEvent.dispatchEvent(g_tEvent.SET_NEW_WEEKLY_CARD_TOGGLE, "zCoin"))
                : this.ShopToggles[a].hideBox();
            this.initLsbRoot(i === n.LeagueMatchBtn);
          },
          initLsbRoot: function (e) {
            ((this.LsbRoot.active = e), (this.nodeCoinRoot.active = !e));
            var t = this.nodeCoinRoot.getChildByName("CoinNumCom");
            t && t.getComponent("ComCoinNum").hideAddBtn(!1);
          },
          onInitHonorPrivilege: function (e) {
            var t = [n.coinbtn, n.DiamondBtn, n.ZCoin];
            this.ShopToggles.forEach(function (e) {
              t.includes(e.type) || e.hideToggle();
            });
            var i = g_oData.get(g_tData.Mod_hall_Shop).isAct();
            e.isZCoinRoom && i ? (this._selectBtn = n.ZCoin) : (this._selectBtn = n.coinbtn);
          },
          showTips: function () {
            a.isIosSys() && g_oData.get(g_tData.SwitchModel).isOpenPayForAnother()
              ? ((this.labIosTips.string =
                  "\u7406\u6027\u6d88\u8d39\uff0c\u9002\u5ea6\u5a31\u4e50\uff01\u4ec5\u5b89\u5353\u597d\u53cb\u53ef\u4ee5\u8d60\u9001\u3002"),
                (this._IsZfByFriend = !0))
              : ((this.labIosTips.string =
                  "\u7406\u6027\u6d88\u8d39\uff0c\u9002\u5ea6\u5a31\u4e50\uff01"),
                (this._IsZfByFriend = !1));
          },
          getShopToggle: function (e) {
            return this.ShopToggles.find(function (t) {
              return t.type === e;
            });
          },
        }),
          cc._RF.pop());
      },
      {
        AlertDlgBaseView: "AlertDlgBaseView",
        CommonPlat: "CommonPlat",
        CommonUtils: "CommonUtils",
      },
    ],
