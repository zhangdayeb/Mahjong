    CoinGameResultPageView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "d57abviXr1D366G5PuNbhuP", "CoinGameResultPageView");
        var i = e("CommonUtils"),
          a = e("DlgBaseView"),
          o = e("tileLogicHelper");
        (cc.Class({
          extends: a,
          properties: {
            nodeMask: { default: null, type: cc.Node, tooltip: "\u89e6\u6478\u8499\u677f" },
            PrefabPlayerItem: {
              default: null,
              type: cc.Prefab,
              tooltip: "\u7ed3\u7b97\u9762\u677f\u73a9\u5bb6\u5355\u5143\u9884\u5236",
            },
            nodePlayer: {
              default: [],
              type: cc.Node,
              tooltip:
                "\u73a9\u5bb6\u4fe1\u606f\u9884\u5236\u7684\u663e\u793a\u7684\u7236\u8282\u70b9,\u5b9a\u4f4d\u7f6e",
            },
            winLab: { default: null, type: cc.Label, tooltip: "\u8d62\u591a\u5c11" },
            loseLab: { default: null, type: cc.Label, tooltip: "\u8f93\u591a\u5c11" },
            WinBg: { default: null, type: cc.Node, tooltip: "\u8d62\u5206\u80cc\u666f" },
            LoseBg: { default: null, type: cc.Node, tooltip: "\u8f93\u5206\u80cc\u666f" },
            nodeGameCoinLayout: { default: null, type: cc.Node, tooltip: "GameCoin\u5bb9\u5668" },
            svipWinLab: { default: null, type: cc.Label, tooltip: "mkbk\u8d62\u591a\u5c11" },
            svipLoseLab: { default: null, type: cc.Label, tooltip: "mkbk\u8f93\u591a\u5c11" },
            fanDetailNode: {
              default: null,
              type: cc.Node,
              tooltip: "\u6240\u6709\u756a\u578b\u8be6\u60c5",
            },
            fanItemPrefab: { default: null, type: cc.Prefab, tooltip: "\u756a\u8be6\u60c5item" },
            nodeChangeTable: { default: null, type: cc.Node, tooltip: "\u6362\u684c\u6309\u94ae" },
            nodeNextGame: {
              default: null,
              type: cc.Node,
              tooltip: "\u4e0b\u4e00\u5c40\u6309\u94ae",
            },
            BtnSupplementEnergy: {
              default: null,
              type: cc.Node,
              tooltip: "\u8865\u5145\u80fd\u91cf\u503c\u6309\u94ae",
            },
            nodeBackButton: {
              default: null,
              type: cc.Node,
              tooltip: "\u8fd4\u56de\u6bb5\u4f4d\u8d5b\u9762\u677f",
            },
            nodeGameEndAwardTip: {
              default: null,
              type: cc.Node,
              tooltip: "\u83b7\u53d6\u7ea2\u5305\u5238\u63d0\u793a",
            },
            node_videoBtn: { default: null, type: cc.Node, tooltip: "\u89c6\u9891\u6309\u94ae" },
            lab_videoBtn: {
              default: null,
              type: cc.Label,
              tooltip: "\u89c6\u9891\u6309\u94ae\u6587\u672c",
            },
            lab_videoBubble: {
              default: null,
              type: cc.Label,
              tooltip: "\u89c6\u9891\u6309\u94ae\u6587\u672c",
            },
            lab_maxFanCount: { default: null, type: cc.Label, tooltip: "\u5c01\u9876\u500d\u6570" },
            bankruptTag: { default: null, type: cc.Node, tooltip: "\u7834\u4ea7\u6807\u8bc6" },
            spriteHead: { default: null, type: cc.Sprite, tooltip: "\u5934\u50cf" },
            img_HeadFrame: { default: null, type: cc.Sprite, tooltip: "\u5934\u50cf\u6846" },
            labelNickName: { default: null, type: cc.Label, tooltip: "\u6635\u79f0" },
            n_bigWinMan: { default: null, type: cc.Node, tooltip: "\u5927\u8d62\u5bb6" },
            tempatePic: { default: null, type: cc.Node, tooltip: "\u724c" },
            detailTips: { default: null, type: cc.Node, tooltip: "\u8be6\u7ec6\u4ecb\u7ecd" },
            btn_change: { default: null, type: cc.Node, tooltip: "\u8be6\u7ec6\u4ecb\u7ecd" },
            btn_left: { default: null, type: cc.Node, tooltip: "\u5de6\u4e0b\u89d2\u6309\u94ae" },
            node_JPQ: { default: null, type: cc.Node, tooltip: "\u8bb0\u724c\u5f00\u5c40" },
            wgt_close: cc.Widget,
            _MoneyBoxicon: !1,
            node_guideBtn: {
              default: null,
              type: cc.Node,
              tooltip: "\u65b0\u624b\u6307\u5f15\u6309\u94ae",
            },
          },
          Awake: function () {
            (this.nodeMask.on("touchstart", this.touchstart, this),
              this.nodeMask.on("touchend", this.touchend, this),
              this.nodeMask.on("touchcancel", this.touchcancel, this),
              this.initUI(),
              this.onCustomEvent(),
              this.onMessageEvent(),
              (this._clickedClose = !1),
              cc.winSize.width >= 1380 &&
                ((this.wgt_close.left = (cc.winSize.width - 1380) / 2),
                this.wgt_close.updateAlignment()),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.GameMenu.id,
                "LOOK_DESK_INFO",
              ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.GameRMBRedBagEntry.id,
                "LOOK_DESK_INFO",
              ));
          },
          start: function () {
            this.showTigerBack();
          },
          initUI: function () {
            ((this.WinBg.active = !1), (this.LoseBg.active = !1));
            for (var e = 0; e < this.btn_left.children.length; e++) {
              var t = this.btn_left.children[e];
              "MoneyBoxEntry" == t.name
                ? (t.active = this._MoneyBoxicon)
                : "FanXingResearchGame" == t.name && (t.active = !this._MoneyBoxicon);
            }
            (this.fanDetailNode.removeAllChildren(), this.initGameResultBtns());
          },
          initGameResultBtns: function () {
            ((this.nodeChangeTable.active = !1),
              (this.nodeNextGame.active = !1),
              (this.node_videoBtn.active = !1),
              (this.BtnSupplementEnergy.active = !1),
              (this.node_guideBtn.active = !1),
              (this.node_JPQ.active = !1));
            for (
              var e = g_oData.get(g_tData.SwitchModel).getGameBtnsCfg(),
                t = g_tConst.GameBtnsDefine.GameResultBtns,
                i = e.GameResultBtns,
                a = [],
                o = 0;
              o < i.length;
              o++
            )
              Array.isArray(i[o]) && a.push(i[o][0]);
            var n = a.indexOf(t.changeTable);
            ((this.nodeChangeTable.active = -1 !== n), (this.nodeChangeTable.zIndex = n));
            var s = a.indexOf(t.nextGame);
            ((this.nodeNextGame.active = -1 !== s), (this.nodeNextGame.zIndex = s));
            var r = a.indexOf(t.videoBtn);
            ((this.node_videoBtn.active = -1 !== r),
              (this.node_videoBtn.zIndex = r),
              MJ.GameLogic.getGuideExist() &&
                ((this.node_guideBtn.active = !0), (this.node_videoBtn.active = !1)));
            var c = a.indexOf(t.jipaiqi);
            if (
              ((this.node_JPQ.active = -1 !== c),
              (this.node_JPQ.zIndex = c),
              MJ.GameLogic.TableModel.IsCounterPlay() && !MJ.GameLogic.CounterModel.isNewbieScene())
            ) {
              var l = a.indexOf(t.supplementEnergy);
              ((this.BtnSupplementEnergy.active = -1 !== l), (this.BtnSupplementEnergy.zIndex = l));
            }
          },
          onCustomEvent: function () {
            var e = this;
            (e.node.on(
              "SET_PLAYERINFO_COMMON",
              function (t) {
                e.setPlayerInfo(t);
              },
              e,
            ),
              e.node.on(
                "SET_RULE_FAN_DETAIL",
                function (t) {
                  e.addRuleFanDetail(t.ruleFanDetailInfos || []);
                },
                e,
              ),
              e.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.ON_CLICK_FAN_DETAILS,
                  function (e) {
                    this.onClickTips(e);
                  },
                  this,
                ),
              ));
          },
          onMessageEvent: function () {
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.MOD_CRAZYZF_NotifyGiftPack,
                function () {
                  this.showTigerBack();
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.CLOSE_GAME_RESULT,
                  function () {
                    this.onCloseView();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.INIT_GAME_TEACH,
                  function () {
                    this.onCloseViewNoNextDlg();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.RSEULT_MONEYBOX_ICON,
                  function (e) {
                    for (var t = 0; t < this.btn_left.children.length; t++) {
                      var i = this.btn_left.children[t];
                      "MoneyBoxEntry" == i.name
                        ? (i.active = e)
                        : "FanXingResearchGame" == i.name && (i.active = !e);
                    }
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.RESULT_NEXT_GAME,
                  function () {
                    (this.onClickClose(),
                      g_oExLayerManager.emitEvent2GameLayer(
                        g_tConst.GameExLayerCfg.GameMenu.id,
                        "QUICK_READY",
                      ));
                  },
                  this,
                ),
              ));
          },
          touchstart: function () {
            return (
              [
                MJ.GameViewHandler.dlgLayerNode,
                g_oCtrl.get(g_tCtrl.GameMenuCtrl) &&
                  g_oCtrl.get(g_tCtrl.GameMenuCtrl).getView().nodeButtonReady,
                g_oCtrl.get(g_tCtrl.BattleHandselCtrl) &&
                  g_oCtrl.get(g_tCtrl.BattleHandselCtrl).node,
                g_oCtrl.get(g_tCtrl.GameRMBRedBagEntryCtrl) &&
                  g_oCtrl.get(g_tCtrl.GameRMBRedBagEntryCtrl).node,
              ].forEach(function (e) {
                isNull(e) || cc.tween(e).to(0.2, { opacity: 200 }).to(0.2, { opacity: 0 }).start();
              }),
              !0
            );
          },
          touchend: function () {
            [
              MJ.GameViewHandler.dlgLayerNode,
              g_oCtrl.get(g_tCtrl.GameMenuCtrl) &&
                g_oCtrl.get(g_tCtrl.GameMenuCtrl).getView().nodeButtonReady,
              g_oCtrl.get(g_tCtrl.BattleHandselCtrl) && g_oCtrl.get(g_tCtrl.BattleHandselCtrl).node,
              g_oCtrl.get(g_tCtrl.GameRMBRedBagEntryCtrl) &&
                g_oCtrl.get(g_tCtrl.GameRMBRedBagEntryCtrl).node,
            ].forEach(function (e) {
              isNull(e) || (e.stopAllActions(), cc.tween(e).to(0.2, { opacity: 255 }).start());
            });
          },
          touchcancel: function (e) {
            this.touchend(e);
          },
          onClickBack: function () {
            var e = this;
            if (g_oData.get(g_tData.SectionMatchMod).isSectionMatchState) {
              var t = new cc.Event.EventCustom("ON_CHANGE_GAME_RESULT_VIEW", !0);
              (t.setUserData({ PanelType: "SectionGameResult" }), this.node.dispatchEvent(t));
            } else
              this.antiMultipleClick() &&
                g_oData.get(g_tData.mod_Share).reqGameEndaward(function () {
                  e.onClickClose();
                });
          },
          onClickNextGame: function () {
            var e = this;
            this.antiMultipleClick() &&
              g_oData.get(g_tData.mod_Share).reqGameEndaward(function () {
                (e.onClickClose(),
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.GameMenu.id,
                    "QUICK_READY",
                  ));
              });
          },
          onClickGuide: function () {
            var e = this;
            this.antiMultipleClick() &&
              g_oData.get(g_tData.mod_Share).reqGameEndaward(function () {
                (e.onClickClose(),
                  g_oData.get(g_tData.GameTeachMod).reportResultEnter(),
                  g_oData.get(g_tData.GameTeachMod).inItGameTeach());
              });
          },
          onClickChangeTable: function () {
            var e = this;
            this.antiMultipleClick() &&
              g_oData.get(g_tData.mod_Share).reqGameEndaward(function () {
                (e.onClickClose(),
                  MJ.GameLogic.reqChangeTable(),
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.GameMenu.id,
                    "QUICK_READY",
                  ));
              });
          },
          antiMultipleClick: function () {
            var e = this;
            return this._clickedClose
              ? (Log.info("CLick too many times please wait a second"), !1)
              : ((this._clickedClose = !0),
                this.scheduleOnce(function () {
                  e._clickedClose = !1;
                }, 2),
                !0);
          },
          onClickClose: function () {
            this.onCloseView();
          },
          onCloseView: function () {
            var e = new cc.Event.EventCustom("ON_CLOSE_GAME_RESULT_VIEW", !0);
            this.node.dispatchEvent(e);
          },
          onCloseViewNoNextDlg: function () {
            var e = new cc.Event.EventCustom("ON_CLOSE_GAME_RESULT_VIEW_NO_NEXT_DLG", !0);
            this.node.dispatchEvent(e);
          },
          dealAllFanDetailInfo: function (e, t) {
            for (var i = [], a = [], o = 0; o < e.length; o++) {
              var n = e[o].iFanType,
                s = (e[o].iCount, Math.abs(e[o].iTotalFan), MJ.RuleMgr.getFanCfgByType(n));
              a.push(s);
            }
            a.sort(function (e, t) {
              return Number(e.id) - Number(t.id);
            });
            for (var r = 0; r < a.length; r++)
              for (var c = a[r], l = 0; l < e.length; l++) {
                var g = e[l].iFanType,
                  d = (e[l].iCount, Math.abs(e[l].iTotalFan));
                if (Number(c.type) === g) {
                  var h;
                  h =
                    (t ? "" : "-") +
                    MJ.GameLogic.formatFan(d) +
                    g_tConst.PluginCfgs[MJ.GameLogic.TableModel.getGameType()].FanUnit;
                  var u = { sFanName: c.name, sFanNum: h, isMeWin: t };
                  i.push(u);
                }
              }
            return i;
          },
          getMkbkMoreWin: function (e) {
            var t = 0;
            if (e && e.length > 0)
              for (var i = 0; i < e.length; ++i) {
                var a = e[i].iMKBKMoreWin;
                a && a > 0 && (t += a);
              }
            return t;
          },
          setMyResultInfo: function (e) {
            this._playData = e;
            var t = e.stPlayerResultInfo,
              a = e.nShowMode,
              o = this.getMkbkMoreWin(t.GameResultInfo.stPlayerBalance);
            if (
              ((this.winLab.node.active = !1),
              (this.loseLab.node.active = !1),
              (this.svipWinLab.node.active = !1),
              (this.svipLoseLab.node.active = !1),
              o > 0)
            ) {
              var n = "(\u9ebb\u5361+" + i.translateCoinStr(i.initProCoin(o)) + ")";
              t.nWinCoin >= 0
                ? ((this.svipWinLab.node.active = !0), (this.svipWinLab.string = n))
                : ((this.svipLoseLab.node.active = !0), (this.svipLoseLab.string = n));
            }
            if (
              [g_tConst.GameTypeCfgs.JBCROOMWHMJ.TYPEID].includes(
                MJ.GameLogic.TableModel.getGameType(),
              ) &&
              t.nWinCoin < 0
            ) {
              var s = t.GameResultInfo.stPlayerBalance[t.GameResultInfo.stPlayerBalance.length - 1];
              if (s && s.eBalanceLimit && 1 === s.eBalanceLimit) {
                var r =
                  s.stFanGroup.iTotalFanCount +
                  g_tConst.PluginCfgs[MJ.GameLogic.TableModel.getGameType()].FanUnit;
                this.lab_maxFanCount &&
                  ((this.lab_maxFanCount.string = r),
                  (this.lab_maxFanCount.node._parent.active = !0));
              }
            }
            if (
              [g_tConst.GameTypeCfgs.JBCROOMWHMJ.TYPEID].includes(
                MJ.GameLogic.TableModel.getGameType(),
              ) &&
              t.nWinCoin < 0
            ) {
              var c = t.GameResultInfo.stPlayerBalance[t.GameResultInfo.stPlayerBalance.length - 1];
              c &&
                c.eBalanceLimit &&
                2 === c.eBalanceLimit &&
                this.bankruptTag &&
                (this.bankruptTag = !0);
            }
            if (t.nWinCoin >= 0) {
              this.WinBg.active = !0;
              var l = "+" + i.translateCoinStr(i.initProCoin(t.nWinCoin));
              ((this.winLab.string = l), (this.winLab.node.active = !0));
            } else {
              this.LoseBg.active = !0;
              var g = "-" + i.translateCoinStr(i.initProCoin(-t.nWinCoin));
              ((this.loseLab.string = g), (this.loseLab.node.active = !0));
            }
            g_oEvent.dispatchEvent(g_tEvent.MJ_PATH_WIN_LOSE, t.nWinCoin);
            var d = t.GameResultInfo;
            if (1 == a) {
              var h = !0,
                u = d.stPlayerBalance.length;
              if (u > 0) {
                var _ = d.stPlayerBalance[u - 1];
                _.iCoin < 0 && (h = !1);
                var m = _.stFanGroup,
                  f = (m.eFanType, m.iTotalFanCount, m.stTileFan),
                  p = this.dealAllFanDetailInfo(f, h);
                this.showAllFanDetail(p);
              }
            } else if (2 == a) {
              var C = this.dealLiuShuiDetailInfo(d);
              this.showAllFanDetail(C);
            }
            var v = this.nodeGameCoinLayout.getComponent(cc.Layout);
            if ((v && v.updateLayout(), d.paiXinData)) {
              var y = d.paiXinData;
              this.showBigFanPaiXing(y, !0);
            } else {
              for (var S = "", D = 0; D < d.stSetCard.length; D++) {
                var T = d.stSetCard[D],
                  I = T.iCard;
                S += T.eBlockType + ":" + T.iTriggerCard + "." + I.join(",") + "_";
              }
              ((S = S + "|" + d.iHandsCards.join(",")), this.showBigFanPaiXing(S));
            }
            (this.addRuleFanDetail(e.ruleFanDetailInfos || []),
              this.setPlayerHead(t.GameResultInfo),
              this.setPlayerHeadFrame(t.GameResultInfo),
              this.setNickName(t.sNickName),
              (this.n_bigWinMan.active = t.GameResultInfo.bigWinMan));
          },
          showBigFanPaiXing: function (e, t) {
            void 0 === t && (t = !1);
            var i = { hand: [], chow: [], peng: [], gang: [], hu: [] },
              a = e.split("|"),
              n = a[0].split("_"),
              s = a[1] || [],
              r = function (e) {
                var t,
                  i = e.split(":"),
                  a = Number(i[0]),
                  n = i[1].split("."),
                  s = Number(n[0]),
                  r = (n[1] || "").split(",").filter(function (e) {
                    return e && "" != e;
                  });
                return (
                  r.forEach(function (e, t, i) {
                    i[t] = Number(e);
                  }),
                  0 == r.length &&
                    (r =
                      a == g_tConst.BlockCfgs.BlockChow.BlockType
                        ? [s, s + 1, s + 2]
                        : a == g_tConst.BlockCfgs.BlockPong.BlockType
                          ? [s, s, s]
                          : [s, s, s, s]),
                  {
                    eBlockType: a,
                    cards:
                      ((t = r),
                      [].concat(t).sort(function (e, t) {
                        var i = o.toTileValue(e) - o.toTileValue(t);
                        return 0 === i && e !== t ? -(e - t) : i;
                      })),
                  }
                );
              };
            (n.forEach(function (e) {
              if ("" != e) {
                var t = r(e),
                  a = t.eBlockType,
                  o = t.cards;
                a == g_tConst.BlockCfgs.BlockPong.BlockType
                  ? i.peng.push({ iCard: o, eBlockType: a })
                  : a == g_tConst.BlockCfgs.BlockChow.BlockType
                    ? i.chow.push({ iCard: o, eBlockType: a })
                    : a == g_tConst.BlockCfgs.BlockExposedKong.BlockType
                      ? i.gang.push({ iCard: o, eBlockType: a })
                      : a == g_tConst.BlockCfgs.BlockConcealedKong.BlockType
                        ? i.gang.push({ iCard: o, eBlockType: a })
                        : a == g_tConst.BlockCfgs.BlockPatchedKong.BlockType &&
                          i.gang.push({ iCard: o, eBlockType: a });
              }
            }),
              (i.hand = s.split(",")),
              this.showHandTile(i, t));
          },
          setNickName: function (e) {
            this.labelNickName.string = i.getFitSubStringByLen(String(e), 10);
          },
          setPlayerHead: function (e) {
            var t = e.sHeadUrl,
              a = e.nUserID;
            (a != g_oPlatform.getUserId() &&
              (t = i.getLiveModeDefaultHead({ userID: a, headUrl: t })),
              g_oData.get(g_tData.comHead).loadHead(t, this.spriteHead));
          },
          setPlayerHeadFrame: function (e) {
            if (((this.img_HeadFrame.node.active = !1), e.nUserID >= 0)) {
              var t = MJ.GameLogic.PlayerModel.getPlayerInfoByUserId(e.nUserID);
              if (t) {
                var i = t.useIds;
                if (Array.isArray(i)) {
                  var a = i[g_tConst.ServerBagType.HeadFrame];
                  g_oData.get(g_tData.comHeadFrame).loadHeadFrameWithCurUse(this.img_HeadFrame, a);
                }
              }
            }
          },
          formatTile: function (e) {
            var t = "";
            if (!e) return t;
            for (var i = 0; i < e.length; i++) {
              var a = e[i];
              "" == t ? (t += a) : (t = t + "|" + a);
            }
            return t;
          },
          showHandTile: function (e, t) {
            var i = e.hand,
              a = e.chow,
              n = e.peng,
              s = e.gang;
            if (
              4 == i.length &&
              o.toTileValue(i[0]) == o.toTileValue(i[1]) &&
              o.toTileValue(i[0]) == o.toTileValue(i[2]) &&
              o.toTileValue(i[0]) == o.toTileValue(i[3])
            )
              for (var r = 0; r < i.length; r++) i[r] = i[r] + 1e4;
            t ||
              (i = i.sort(function (e, t) {
                var i = o.toTileValue(e) - o.toTileValue(t);
                return 0 === i && e !== t ? -(e - t) : i;
              }));
            var c = "" + this.formatTile(i);
            if (a)
              for (var l = 0; l < a.length; l++) {
                var g = a[l];
                c += "#-1#";
                for (var d = 0; d < g.iCard.length; d++) {
                  var h = parseInt(g.iCard[d]);
                  0 == d ? (c += h + 1e4) : (c = c + "|" + (h + 1e4));
                }
              }
            if (s)
              for (var u = 0; u < s.length; u++) {
                var _ = s[u];
                if (_.eBlockType != g_tConst.BlockCfgs.BlockRascalKong.BlockType) {
                  var m = _.iCard;
                  ((m = m.sort(function (e, t) {
                    var i = (e % 1e3) - (t % 1e3);
                    return 0 === i && e !== t ? -(e - t) : i;
                  })),
                    (c =
                      _.eBlockType == g_tConst.BlockCfgs.BlockConcealedKong.BlockType
                        ? c + "#-1#10000|10000|" + (m[0] + 1e4) + "|10000"
                        : c +
                          "#-1#" +
                          (m[1] + 1e4) +
                          "|" +
                          (m[2] + 1e4) +
                          "|" +
                          (m[0] + 1e4) +
                          "|" +
                          (m[3] + 1e4)));
                }
              }
            if (n)
              for (var f = 0; f < n.length; f++) {
                var p = n[f],
                  C = !1;
                if (s)
                  for (var v = 0; v < s.length; v++)
                    if (o.toTileValue(p.iTriggerCard) == o.toTileValue(s[v].iTriggerCard)) {
                      C = !0;
                      break;
                    }
                if (!C) {
                  var y = p.iCard;
                  c =
                    c +
                    "#-1#" +
                    ((y = y.sort(function (e, t) {
                      var i = (e % 1e3) - (t % 1e3);
                      return 0 === i && e !== t ? -(e - t) : i;
                    }))[0] +
                      1e4) +
                    "|" +
                    (y[1] + 1e4) +
                    "|" +
                    (y[2] + 1e4);
                }
              }
            this.tempatePic.getComponent("ComGameResultTempatePic").show(c);
          },
          getItemShowInfo: function (e) {
            var t = e.stFanGroup.stTileFan,
              i = (MJ.RuleMgr.getFanCfgs(), 1);
            return (
              e.stFanGroup.iTotalFanCount && (i = e.stFanGroup.iTotalFanCount),
              {
                sFanName: g_tConst.gameEndShowFanType.includes(e.stFanGroup.eFanType)
                  ? g_tConst.CommonFanType[e.stFanGroup.eFanType] + ""
                  : MJ.GameLogic.getTFanInfoDesc(t),
                nFanNum: Math.abs(i),
              }
            );
          },
          dealLiuShuiDetailInfo: function (e) {
            for (
              var t = [],
                i = new Map(),
                a = ["\u672c\u5bb6", "\u4e0a\u5bb6", "\u5bf9\u5bb6", "\u4e0b\u5bb6"],
                o = MJ.GameLogic.PlayerModel.viewSeatIDPool,
                n = this.model.mapPlayerInfo,
                s = 0;
              s < o.length;
              s++
            ) {
              var r = o[s],
                c = a[r];
              i.arrayPush(r, c);
            }
            for (var l = e.stPlayerBalance, g = 0; g < l.length; g++) {
              var d = l[g],
                h = d.stTFanExtraInfo,
                u = d.iLossSeatID,
                _ = "",
                m = !0;
              if (d.iCoin < 0)
                ((m = !1),
                  (_ =
                    h && h.iChengBaoNum && h.iChengBaoNum > 0
                      ? "(" + i[n.get(u[0]).viewSeatID] + "\u627f\u5305)"
                      : "[" + i[n.get(d.iWinSeatID).viewSeatID] + "]"));
              else {
                if (!(d.iCoin > 0)) continue;
                if (h && h.iChengBaoNum && h.iChengBaoNum > 0)
                  _ = "(" + i[n.get(u[0]).viewSeatID] + "\u627f\u5305)";
                else if (u && u.length > 0) {
                  for (var f = 0; f < u.length; f++) {
                    var p = n.get(u[f]);
                    if (p) {
                      var C = p.viewSeatID,
                        v = "";
                      (f != u.length - 1 && (v = "\u3001"), (_ = _ + i[C] + v));
                    }
                  }
                  _ = "[" + _ + "]";
                }
              }
              var y = this.getItemShowInfo(d),
                S = {
                  sFanName: y.sFanName,
                  sFanNum:
                    (m ? "" : "-") +
                    MJ.GameLogic.formatFan(y.nFanNum) +
                    g_tConst.PluginCfgs[MJ.GameLogic.TableModel.getGameType()].FanUnit,
                  sExtraDescStr: _,
                  isMeWin: m,
                  nFanCount: y.nFanNum,
                };
              t.push(S);
            }
            return t;
          },
          showAllFanDetail: function (e) {
            for (var t = 0; t < e.length; t++) {
              var i = e[t];
              i &&
                g_oPrefabLoader
                  .instantiate(this.fanItemPrefab, this.fanDetailNode)
                  .emit("INIT_FAN_DETAIL", i);
            }
            e.length <= 0 && (this.btn_change.active = !1);
          },
          addRuleFanDetail: function (e) {
            var t = this;
            e.forEach(function (e) {
              t.showAllFanDetail(e.coinRoomRuleInfo || []);
            });
          },
          setPlayerInfo: function (e) {
            cc.assert(1 === arguments.length, " GameResultDZMJ Param error ");
            var t = this,
              i = e.stPlayerResultInfo;
            if (i.nSeatView === g_tConst.GameConfig.ViewSeat.SeatMine)
              (this.setMyResultInfo(e), (this._myGameResultInfo = i));
            else {
              var a = g_oPrefabLoader.instantiate(
                t.PrefabPlayerItem,
                t.nodePlayer[i.nSeatView - 1],
              );
              a.emit("SET_ITEMINFO_COMMON", i);
            }
          },
          updateUI: function () {
            (this.initVideoBtn(),
              (this.nodeGameEndAwardTip.active =
                g_oData.get(g_tData.mod_Share).hasGameEndaward() && !MJ.GameLogic.getGuideExist()));
          },
          onEnable: function () {
            (Log.info("Enter ComGameResultView Enable!"),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.GameMenu.id,
                "GAME_PLAT_EVENT_SHOW_READY_RCD",
                !1,
              ),
              this.updateUI(),
              g_oEvent.dispatchEvent(g_tEvent.DLGEVENT_COMGAMERESULT_SHOW),
              this.scheduleOnce(this.showInterstitialStaticAd, 0.5));
          },
          onDisable: function () {
            (g_oEvent.dispatchEvent(g_tEvent.DLGEVENT_COMGAMERESULT_HIDE),
              this.unschedule(this.showInterstitialStaticAd));
          },
          onDestroy: function () {
            (g_oExLayerManager.emitEvent2GameLayer(
              g_tConst.GameExLayerCfg.GameMenu.id,
              "GAME_PLAT_EVENT_SHOW_READY_RCD",
              !0,
            ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.GameMenu.id,
                "NO_LOOK_DESK_INFO",
                !0,
              ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.GameRMBRedBagEntry.id,
                "NO_LOOK_DESK_INFO",
                !0,
              ),
              this._super());
          },
          showInterstitialStaticAd: function () {
            var e = {
              Scene: g_tConst.ShareConfig.ShareScene.game,
              Module: g_tConst.ShareConfig.ShareModule.SeeVideo,
              SubModule: g_tConst.ShareConfig.ShareSubModule.SeeVideo,
              AdScene: g_tConst.InterstitialStaticPID.GameEnd,
            };
            g_oAdManager.doSeeAd(g_tConst.eADType.InterstitialStaticAd, e.AdScene, e);
          },
          initVideoBtn: function () {
            var e = this;
            if (!MJ.GameLogic.getGuideExist()) {
              var t = MJ && MJ.GameLogic.GameParams.getTopGameEndAdBtnData();
              isNull(t)
                ? this.showLuckyTileBtn()
                : ((this.node_videoBtn.active = !0),
                  (this.node_JPQ.active = !1),
                  (this.lab_videoBtn.string = t.videoBtnDesc),
                  (this.lab_videoBubble.string = t.bubbleMsg),
                  (this.videoBtnClickEvent = function () {
                    t.clickEvent instanceof Function
                      ? t.clickEvent(function () {
                          e.initVideoBtn();
                        })
                      : e.initVideoBtn();
                  }));
            }
          },
          onClickVideoBtn: function () {
            this.videoBtnClickEvent instanceof Function && this.videoBtnClickEvent();
          },
          showLuckyTileBtn: function () {
            var e = this,
              t = MJ.GameLogic.TableModel.IsCoinRoom(),
              i = MJ.GameLogic.TableModel.getGameType(),
              a = g_oData
                .get(g_tData.mod_Share)
                .getShareCntByLinkID(g_tConst.ShareConfig.ShareLinkId.GameLuckyTile);
            t && g_tConst.ShowLuckyTileStartGameType.includes(i) && a > 0
              ? ((this.node_videoBtn.active = !0),
                (this.lab_videoBtn.string = "\u597d\u724c\u5f00\u59cb"),
                (this.lab_videoBubble.string =
                  (this._invokeType === g_tConst.InvokeType.Video
                    ? "\u89c2\u770b\u5b8c\u6574\u89c6\u9891"
                    : "\u5206\u4eab\u7ed9\u597d\u53cb") + "\uff0c\u4e0b\u5c40\u53d1\u597d\u724c"),
                (this.videoBtnClickEvent = function () {
                  var t = g_tConst.ShareConfig.ShareScene.game;
                  g_oCommonUtils.isOnGameScene()
                    ? (t =
                        t +
                        "_" +
                        ((MJ.GameLogic &&
                          MJ.GameLogic.TableModel &&
                          MJ.GameLogic.TableModel.getGameType()) ||
                          0) +
                        "_" +
                        ((MJ.GameLogic &&
                          MJ.GameLogic.TableModel &&
                          MJ.GameLogic.TableModel.getSceneId()) ||
                          0))
                    : (t += "_lobby");
                  var i = {
                    Scene: t,
                    Module: g_tConst.ShareConfig.ShareModule.GameLuckyTile,
                    SubModule: g_tConst.ShareConfig.ShareSubModule.GameLuckyTile,
                    ShareType: g_tConst.ShareConfig.ShareType.GameLuckyTile,
                    AdScene: g_tConst.AwardAdPID.LuckyTileStart,
                    enbleSubGuide: !1,
                    cbSuc: function () {
                      (g_oData
                        .get(g_tData.gameReportData)
                        .reportClickFirstAdAwardAction(
                          e._invokeType,
                          g_tConst.ShareConfig.ShareSubModule.GameLuckyTile,
                        ),
                        g_oData
                          .get(g_tData.mod_Share)
                          .reqGPShareSuc(
                            g_tConst.ShareConfig.ShareLinkId.GameLuckyTile,
                            void 0,
                            void 0,
                            i.type,
                          ),
                        g_oPlatform.doAction(
                          g_tConst.tPlatActionId.actionShowToast,
                          "\u60a8\u5df2\u83b7\u5f97\u597d\u724c\u5f00\u59cb\u673a\u4f1a\uff0c\u4e0b\u5c40\u53d1\u597d\u724c",
                        ),
                        cc.isValid(e.node) &&
                          g_oData.get(g_tData.mod_Share).reqGameEndaward(function () {
                            (e.onClickClose(),
                              g_oExLayerManager.emitEvent2GameLayer(
                                g_tConst.GameExLayerCfg.GameMenu.id,
                                "QUICK_READY",
                              ));
                          }));
                    },
                  };
                  e.invokeAD(i);
                }))
              : ((this.node_videoBtn.active = !1),
                this.showBtnByNextId(
                  g_tConst.GameBtnsDefine.GameResultBtns.videoBtn,
                  this.node_videoBtn.zIndex,
                ),
                (this.videoBtnClickEvent = function () {}));
          },
          showBtnByNextId: function (e, t) {
            var i = g_oData.get(g_tData.SwitchModel).getGameBtnsCfg().GameResultBtns,
              a = g_tConst.GameBtnsDefine.GameResultBtns,
              o = null;
            switch (
              (function (e) {
                for (var t = 0; t < i.length; t++) {
                  var a = i[t];
                  if (Array.isArray(a) && -1 != a.indexOf(e)) {
                    var o = a.indexOf(e);
                    if (o < a.length - 1) return a[o + 1];
                  }
                }
                return -1;
              })(e)
            ) {
              case a.nextGame:
                o = this.nodeNextGame;
                break;
              case a.videoBtn:
                o = this.node_videoBtn;
                break;
              case a.changeTable:
                o = this.nodeChangeTable;
                break;
              case a.supplementEnergy:
                o = this.BtnSupplementEnergy;
                break;
              case a.jipaiqi:
                o = this.node_JPQ;
            }
            o && ((o.active = !0), (o.zIndex = t));
          },
          showTigerBack: function () {
            g_oData
              .get(g_tData.TigerBackBtnMod)
              .showTigerBack(!0, MJ.GameLogic.TableModel.isZCoinRoom(), !0);
          },
          onCloseTips: function () {
            this.detailTips.active = !1;
          },
          onClickTips: function (e) {
            this.detailTips.active = !0;
            var t = this.detailTips.getChildByName("bg"),
              i = t.getChildByName("label_msg"),
              a = this.detailTips.convertToNodeSpaceAR(e.worldPos);
            t.position = cc.v2(a.x + 40, a.y + 45);
            var o = function () {
              t.height = i.height + 30;
            };
            (o(),
              i.off(cc.Node.EventType.SIZE_CHANGED, o, this),
              i.on(cc.Node.EventType.SIZE_CHANGED, o, this),
              (i.getComponent(cc.Label).string = e.tip_string));
          },
          onClickChangeView: function () {
            this.tempatePic.active
              ? ((this.tempatePic.active = !1),
                (this.btn_change.y += 100),
                (this.btn_change.scaleY *= -1),
                (this.fanDetailNode.parent.height += 100),
                this.fanDetailNode.parent.parent.getComponent(cc.ScrollView).scrollToTop(0.1))
              : ((this.tempatePic.active = !0),
                (this.btn_change.y -= 100),
                (this.btn_change.scaleY *= -1),
                (this.fanDetailNode.parent.height -= 100),
                this.fanDetailNode.parent.parent.getComponent(cc.ScrollView).scrollToTop(0.1));
          },
          onClickGetJPQ: function () {
            var e = {
              Scene: g_tConst.ShareConfig.ShareScene.hall,
              Module: g_tConst.ShareConfig.ShareModule.gameJiPaiQi,
              SubModule: g_tConst.ShareConfig.ShareSubModule.gameJiPaiQi,
              ShareType: g_tConst.ShareConfig.ShareType.gameJiPaiQi,
              AdScene: g_tConst.AwardAdPID.gameJiPaiQi,
              enbleSubGuide: !1,
              cbSuc: function () {
                g_oData
                  .get(g_tData.GetAwardMod)
                  .reqReceiveAward(g_tConst.ReceiveAwardType.GAME_WATCH_VIDEO_JI_PAI_QI);
              },
            };
            this.invideoAD(e);
          },
          update: function () {},
        }),
          cc._RF.pop());
      },
      {
        CommonUtils: "CommonUtils",
        DlgBaseView: "DlgBaseView",
        tileLogicHelper: "tileLogicHelper",
      },
    ],
