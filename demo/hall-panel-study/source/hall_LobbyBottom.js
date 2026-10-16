    hall_LobbyBottom: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "fa3110JzOBI1L9TWz6nghgh", "hall_LobbyBottom");
        var i = e("QuikStart"),
          a = e("CommonUtils"),
          o = e("CommonPlat");
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            node_btnLayout: cc.Node,
            nodeDiyStandings: {
              default: null,
              type: cc.Node,
              tooltip: "\u81ea\u5efa\u623f\u6218\u7ee9",
            },
            node_downMore: {
              default: null,
              type: cc.Node,
              tooltip: "\u6536\u8d77\u66f4\u591a\u9009\u9879",
            },
            node_Exchange: { default: null, type: cc.Node, tooltip: "\u5151\u6362\u6309\u94ae" },
            node_PNRedPoint: { default: null, type: cc.Node, tooltip: "\u516c\u544a\u7ea2\u70b9" },
            node_mailRedPoint: { default: null, type: cc.Node },
            node_moreRedPoint: { default: null, type: cc.Node },
            node_feedbackBtn: {
              default: null,
              type: cc.Node,
              tooltip: "\u5fae\u4fe1\u53cd\u9988\u6309\u94ae",
            },
            node_serviceBtn: { default: null, type: cc.Node, tooltip: "\u5ba2\u670d\u6309\u94ae" },
            node_mijiBtn: { default: null, type: cc.Node, tooltip: "\u79d8\u7c4d\u6309\u94ae" },
            node_BagBtn: { default: null, type: cc.Node, tooltip: "\u80cc\u5305\u6309\u94ae" },
            node_PublicNotice: {
              default: null,
              type: cc.Node,
              tooltip: "\u6d3b\u52a8\u516c\u544a\u6309\u94ae",
            },
            node_shopRedPoint: cc.Node,
            mijiBtnTip: cc.Node,
            shopBtn: cc.Button,
            casionBtn: cc.Button,
            btnLayoutSpaceX: { type: cc.Integer, default: [] },
            spArrow: cc.Node,
            MaCardBtn: cc.Button,
            MaCardBtnTip: cc.Node,
            _McTipLocKey: "HallMaKaBaKaTipClick",
            casionBtnIcon: cc.Node,
          },
          Awake: function () {
            ((this.MaCardBtnTip.active = !1),
              (this.mijiBtnTip.active = !1),
              (this.node_moreRedPoint.active = !1),
              this.onCustomEvent(),
              this.onMessageEvent());
          },
          start: function () {
            (this.isAutoPopDiyRoomStandings(),
              g_oData.get(g_tData.SwitchModel).isCheckHandle()
                ? ((this.casionBtn.node.active = !1),
                  (this.shopBtn.node.active = !1),
                  (this.casionBtnIcon.active = !1))
                : ((this.casionBtn.node.active = !1),
                  (this.shopBtn.node.active = o.canPay()),
                  (this.casionBtnIcon.active =
                    o.canRecommend() && g_oCtrl.get(g_tCtrl.RecommendNodePool).needShowCasino())),
              (this.MaCardBtn.node.active = !g_oData.get(g_tData.SwitchModel).isCheckHandle()),
              this.updateMaCardBtnTipState(),
              this.initMijiBtn(),
              this.initBagBtn(),
              this.updatePNRedPoint(),
              this.updateShopRedPoint(),
              this.refreshBottom());
          },
          onCustomEvent: function () {},
          onMessageEvent: function () {
            var e = this,
              t = this,
              i = function () {
                g_oData.get(g_tData.SwitchModel).isCheckHandle();
                (g_oData.get(g_tData.SwitchModel).isShowDiyRoom(),
                  t.dealAntiMistakenlyPullUpMenu(),
                  (t.node_btnLayout.active = !0),
                  (t.node_btnLayout.getComponent(cc.Layout).spacingX = t.node_Exchange.active
                    ? t.btnLayoutSpaceX[0]
                    : t.btnLayoutSpaceX[1]));
              };
            (i(),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.SCMJ_REQ_GAME_CONFIG_FINISH,
                  function () {
                    i();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.SCMJ_UPDATA_ZHUANJIN,
                  function () {
                    i();
                  },
                  this,
                ),
              ),
              g_oData.get(g_tData.mod_MailData).reqMailCount(),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.UPDATE_MAILS_RED_POINT,
                  function () {
                    this.node_mailRedPoint.active = g_oData
                      .get(g_tData.mod_MailData)
                      .getMailListRedPointByType(0);
                  }.bind(this),
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.SHOW_MIJI_BTN_TIP,
                  function (t) {
                    t.isShowEntryTip &&
                      ((e.mijiBtnTip.active = !0),
                      a.startJumpJumpTipAction(e.mijiBtnTip, 8, 0.32, 5));
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.ON_BACKPACK_UPDATE_TYPES,
                  function () {
                    e.initBagBtn();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.PUBLICNOTICE_RED_POINT,
                  function () {
                    this.updatePNRedPoint();
                  }.bind(this),
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.REFRESH_LIMITEDGIFT,
                  function () {
                    this.updateShopRedPoint();
                  }.bind(this),
                ),
              ));
          },
          initMijiBtn: function () {},
          initBagBtn: function () {
            var e = g_oData.get(g_tData.mod_Bag).getUpdateTypes().length > 0;
            if (this.node_BagBtn.active) {
              var t = this.node_BagBtn.getChildByName("redDot");
              t && (t.active = null == e || 1 == e);
            }
          },
          dealAntiMistakenlyPullUpMenu: function () {
            if (g_oData.get(g_tData.SwitchModel).isAntiMistakenlyPullUpMenu()) {
              var e = this.node.getComponent(cc.Widget);
              ((e.bottom = 20), e.updateAlignment());
            }
          },
          refreshBottom: function () {
            var e = {
                More: "btn_More",
                PublicNotice: "btn_PublicNotice",
                MijiStyle: "btn_MijiStyle",
                Rank: "btn_rank",
                Mail: "btn_Mail",
                Exchange: "btn_Exchange",
                Bag: "btn_Bag",
                Set: "btn_Set",
                Rule: "btn_Rule",
                Standings: "btn_Standings",
                Service: "btn_Service",
                Feedback: "btn_feedback",
                wxGameClub: "wxGameClub",
              },
              t = g_oData.get(g_tData.SwitchModel).getLobbyBottomCfg().btn;
            (this.node_btnLayout.children.forEach(function (e) {
              e.active = !1;
            }),
              g_oData.get(g_tData.SwitchModel).isCheckHandle() && (t = []),
              t.length <= 0 && (t.push("Set"), t.push("Feedback")));
            for (var i = 1, a = t.length > 5 ? 4 : t.length, o = 0; o < a; o++) {
              var n = t[o];
              if (e[n] && this.node_btnLayout.getChildByName(e[n])) {
                var s = this.node_btnLayout.getChildByName(e[n]);
                ((s.active = !0),
                  (s.zIndex = i),
                  i++,
                  s.active && "wxGameClub" == n && s.emit("ON_INIT"));
              }
            }
            if (t.length > 5) {
              ((this.node_btnLayout.getChildByName(e.More).active = !0),
                (this.node_btnLayout.getChildByName(e.More).zIndex = 0));
              for (var r = 4; r < t.length; r++) {
                var c = t[r];
                if (e[c] && this.node_btnLayout.getChildByName(e[c])) {
                  var l = this.node_btnLayout.getChildByName(e[c]);
                  ((l.parent = this.node_downMore),
                    (l.active = !0),
                    (l.zIndex = i),
                    (l.y = 0),
                    i++,
                    l.active && "wxGameClub" == c && l.emit("ON_INIT"));
                }
              }
            }
          },
          onClickAddCoin: function () {
            g_oData.get(g_tData.sdkLogin).checkLogin(
              function () {
                g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_Shop.id, "ON_INIT");
              }.bind(this),
            );
          },
          onClickAddFare: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_FareShop.id, "ON_INIT");
          },
          onClickShare: function () {
            var e = {
              title:
                "\u73a9\u9ebb\u5c06\u8d62\u73b0\u91d1\uff0c\u767e\u4e07\u5927\u5956\u9886\u4e0d\u505c~",
            };
            g_oData.get(g_tData.sdkLogin).checkLogin(
              function () {
                g_oData
                  .get(g_tData.mod_Share)
                  .doNormalShare(
                    e,
                    g_tConst.ShareConfig.ShareScene.hall,
                    g_tConst.ShareConfig.ShareModule.shareBtn,
                    g_tConst.ShareConfig.ShareSubModule.shareBtn,
                  );
              }.bind(this),
            );
          },
          onClickDiyRoomStandings: function () {
            g_oData.get(g_tData.sdkLogin).checkLogin(function () {
              (g_oData
                .get(g_tData.gameReportData)
                .reportClickAction(g_tConst.ReportCfg.ClickActionReport.ClickOpenStandings),
                g_oData.get(g_tData.WinLossModel).reqGetAllPlayID(function (e) {
                  g_oLayerManager.emitEvent2Dlg(
                    g_tConst.GameLayerCfg.DiyRoomStanding.id,
                    "INIT_DIY_ROOM_STANDINGS",
                    e,
                  );
                }));
            });
          },
          onClickSet: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_Setting.id, "ON_INIT");
          },
          onClickRuleHall: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_RuleHall.id, "ON_INIT");
          },
          onClickShop: function () {
            o.canPay()
              ? g_oData.get(g_tData.sdkLogin).checkLogin(
                  function () {
                    g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_Shop.id, "ON_INIT");
                  }.bind(this),
                )
              : g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.FreeAwardDlg.id, "ON_INIT");
          },
          onClickCasino: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_Casino.id, "ON_INIT");
          },
          onClickFeedback: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Feedback.id, "ON_INIT");
          },
          onClickSwap: function () {
            g_oPlatform.doAction(g_tConst.tPlatActionId.actionShowUrl);
          },
          onClickRank: function () {
            g_oData.get(g_tData.sdkLogin).checkLogin(function () {
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_Rank.id, "ON_INIT");
            });
          },
          onClickMail: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_Mail.id);
          },
          onClickCus: function () {
            a.isNative() ? g_oPlatform.doAction(126, "") : g_oPlatform.openService();
          },
          onClickLogger: function () {
            o.isWeChatGame() && g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.UserLogger.id);
          },
          onClickQuikStart: function () {
            (g_oData
              .get(g_tData.gameReportData)
              .recordStartAction(g_tConst.ReportCfg.QuickStart.Hall),
              1 == g_oData.get(g_tData.SwitchModel).getMjQuickStartCfg() &&
                (g_oData.get(g_tData.SectionMatchMod).isSectionMatchState = !0),
              i.quickStart(!0));
          },
          onClickExchange: function () {
            var e = "https://wegame.365you.com/wap/gg/exchange",
              t = g_oPlatform.getGameId(),
              i = g_oPlatform.getUserId(),
              a = md5.md5(String(e)),
              n = g_oPlatform.doAction(g_tConst.tPlatActionId.actionGetChannelId, ""),
              s =
                e +
                "?gameid=" +
                t +
                "&uid=" +
                i +
                "&sign=" +
                a +
                "&version=" +
                g_oPlatform.doAction(g_tConst.tPlatActionId.actionGetVersionName, "") +
                "&gameVersion=" +
                g_oPlatform.getGameVersion() +
                "&channelid=" +
                n +
                "&type=creator&template=tmp_cm_creator";
            o.isNative()
              ? g_oPlatform.doAction(g_tConst.tPlatActionId.actionShowUrl, s)
              : ((s += "&apiType=api"),
                g_oLayerManager.emitEvent2Dlg(
                  g_tConst.GameLayerCfg.Hall_FareShop.id,
                  "ON_INIT",
                  s,
                ));
          },
          onClickMore: function () {
            ((this.node_downMore.active = !this.node_downMore.active),
              (this.spArrow.active = !this.spArrow.active));
          },
          onClickMaCard: function () {
            (g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.MaCardShop.id, "ON_INIT", null),
              this.whenClickMaCard());
          },
          onClickMiji: function () {
            (this.mijiBtnTip.stopAllActions(), (this.mijiBtnTip.active = !1));
            var e = g_oData.get(g_tData.SwitchModel).getMijiCfg();
            g_oLayerManager.emitEvent2Dlg(
              g_tConst.GameLayerCfg.WatchVideoCollection.id,
              "ON_INIT",
              e.videoDefine,
            );
          },
          onClickDownMor: function () {
            ((this.node_downMore.active = !1), (this.spArrow.active = !1));
          },
          onClickBackpack: function () {
            var e = g_oData.get(g_tData.mod_Bag).getServerGoodCfgs();
            isNull(e)
              ? g_oData.get(g_tData.mod_Bag).reqBackpackGoods()
              : g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Backpack.id, "ON_INIT");
          },
          onClickPublicNotice: function () {
            g_oData.get(g_tData.PublicNoticeMod).popPublicNotice(!0);
          },
          isAutoPopDiyRoomStandings: function () {
            g_oData.get(g_tData.WinLossModel).getIsNeedAutoPopStandings() &&
              (g_oData.get(g_tData.sdkLogin).checkLogin(function () {
                g_oData.get(g_tData.WinLossModel).reqGetAllPlayID(function (e) {
                  g_oLayerManager.emitEvent2Dlg(
                    g_tConst.GameLayerCfg.DiyRoomStanding.id,
                    "INIT_DIY_ROOM_STANDINGS",
                    e,
                  );
                });
              }),
              g_oData.get(g_tData.WinLossModel).setIsNeedAutoPopStandings(!1));
          },
          updateMaCardBtnTipState: function () {
            if (g_oData.get(g_tData.SwitchModel).isCheckHandle()) this.MaCardBtnTip.active = !1;
            else {
              var e = g_oData.get(g_tData.SwitchModel).getMakabakaCfg().isAutoPopMa;
              if (e) {
                var t = this._McTipLocKey,
                  i = g_oData.get(g_tData.UserLocalModel).getData(t);
                a.isSameDay(new Date(i), new Date())
                  ? (e = !1)
                  : (g_oData.get(g_tData.UserLocalModel).setData(t, new Date().getTime()),
                    this.startMaCardBtnTipAction());
              }
              this.MaCardBtnTip.active = e;
            }
          },
          whenClickMaCard: function () {
            if (this.MaCardBtnTip.active) {
              var e = this._McTipLocKey;
              g_oData.get(g_tData.UserLocalModel).setData(e, new Date().getTime());
            }
            this.MaCardBtnTip.active = !1;
          },
          startMaCardBtnTipAction: function () {
            var e = this;
            (this.stopMaCardBtnTipAction(), (this.MaCardBtnTip.y = 40));
            var t = cc.v2(this.MaCardBtnTip.x, this.MaCardBtnTip.y),
              i = cc.v2(this.MaCardBtnTip.x, this.MaCardBtnTip.y + 8),
              a = cc.moveTo(0.16, i),
              o = cc.moveTo(0.16, t),
              n = cc.sequence(a, o, a, o, cc.delayTime(5));
            this.scheduleOnce(function () {
              e.MaCardBtnTip.runAction(cc.repeatForever(n));
            }, 5);
          },
          stopMaCardBtnTipAction: function () {
            this.MaCardBtnTip && this.MaCardBtnTip.stopAllActions();
          },
          updatePNRedPoint: function () {
            this.node_PNRedPoint.active = g_oData.get(g_tData.PublicNoticeMod).isExistNewNotice();
          },
          updateShopRedPoint: function () {
            this.node_shopRedPoint.active = g_oData.get(g_tData.Mod_hall_Shop).isShowRedPoint();
          },
          onDestroy: function () {
            (this.mijiBtnTip.stopAllActions(), this.stopMaCardBtnTipAction(), this._super());
          },
        }),
          cc._RF.pop());
      },
      { CommonPlat: "CommonPlat", CommonUtils: "CommonUtils", QuikStart: "QuikStart" },
    ],
