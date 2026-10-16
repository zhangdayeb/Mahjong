    Menu: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "b92aaHV2qBNDq/IuSL00/ae", "Menu");
        var i = e("CommonGT");
        (cc.Class({
          extends: Cls_Component,
          properties: {
            BtnTrustee: { default: null, type: cc.Button, tooltip: "\u6258\u7ba1\u6309\u94ae" },
            nodeMenuList: { default: null, type: cc.Node, tooltip: "\u6309\u94ae\u83dc\u5355" },
            menuHuDetailBtn: {
              default: null,
              type: cc.Button,
              tooltip: "\u83dc\u5355\u80e1\u724c\u8be6\u60c5\u6309\u94ae",
            },
          },
          Awake: function () {
            this.onMessageEvent();
          },
          start: function () {
            if (
              (this.setMoreMenu(),
              (this.nodeMenuList.x += 50),
              (this._table_mod = MJ.GameLogic.TableModel),
              MJ.GameLogic.TableModel.IsLeagueRoom())
            ) {
              var e = this.nodeMenuList.getChildByName("btn_exit");
              e && (e.active = !1);
            }
            this.showGameHuBehavior();
          },
          setMoreMenu: function () {
            var e = this;
            ((this.moreMenu = this.node.getChildByName("panel_menuList_bg")),
              this.moreMenu &&
                this.moreMenu.on("active-in-hierarchy-changed", function () {
                  g_oEvent.dispatchEvent(g_tEvent.MENU_ACTIVE_CHANGE, e.moreMenu.active);
                }));
          },
          onMessageEvent: function () {
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.ON_CLICK_OUT_GAME,
                function () {
                  this.onClickExit();
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.PLAYER_LEAVE_TABLE,
                  function (e) {
                    if (
                      this._clickLeaveTale &&
                      e.nViewSeatId == g_tConst.GameConfig.ViewSeat.SeatMine
                    )
                      if (MJ.GameLogic.TableModel.IsDiyRoom()) {
                        var t = MJ.GameLogic.DiyModel;
                        0 === t.curRound &&
                          t.getRoomOwnerUserID() !== g_oPlatform.getUserId() &&
                          g_oSceneLoader.gotoScene(g_tConst.SceneCfgs.lobby);
                      } else
                        MJ.GameLogic.TableModel.IsCounterPlay()
                          ? (g_oData.get(g_tData.CounterPlayMod).reqExitCounterPlay(),
                            g_oSceneLoader.gotoScene(g_tConst.SceneCfgs.lobby))
                          : g_oSceneLoader.gotoScene(g_tConst.SceneCfgs.lobby);
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.ON_USER_ENTER_GAME,
                  function () {
                    this.showMenuHuBtn();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.INIT_DIYROOMRULE_BTN,
                  function () {
                    MJ.GameLogic.TableModel.IsDiyRoom();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.REQUES_EXIT_GAME,
                  function () {
                    this.reqExitGame();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.HIDE_TRUSTEE_BTN,
                  function () {
                    this.BtnTrustee.node.active = !1;
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.CURR_RESULT_STATE,
                  function () {
                    this.moreMenu && (this.moreMenu.active = !1);
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.NOTIFY_MATCH_APPLY_RESULT,
                  function (e) {
                    e.resultCode === g_tConst.MatchApplyResultCode.CANCEL_APPLY_SUCCESS &&
                      this.reqExitGame();
                  },
                  this,
                ),
              ));
          },
          showMenuHuBtn: function () {
            var e = MJ.GameLogic.TableModel.getGameType();
            i.isDiyGametype(e) || MJ.GameLogic.TableModel.IsLeagueRoom()
              ? (this.menuHuDetailBtn.node.active = !1)
              : (this.menuHuDetailBtn.node.active =
                  -1 === g_tConst.ShowDuiJuDetailCoinGameType.indexOf(e));
          },
          onClickMoreMenu: function () {
            this.showGameMenu();
          },
          onClickMoreMenuOther: function () {
            this.hideGameMenu();
          },
          showGameMenu: function () {
            (g_oLayerManager.showCallback && g_oLayerManager.showCallback(),
              this.moreMenu && (this.moreMenu.active = !0));
          },
          hideGameMenu: function () {
            (g_oLayerManager.hideCallback && g_oLayerManager.hideCallback(),
              this.moreMenu && (this.moreMenu.active = !1));
          },
          onClickTrustee: function () {
            var e = MJ.GameLogic.canTrustee,
              t = MJ.GameLogic.isGameStart();
            if (e && t) {
              this.hideGameMenu();
              var i = new cc.Event.EventCustom("REQ_TRUSTEE_CHANGE", !0);
              this.node.dispatchEvent(i);
            }
          },
          onClicRoomRule: function () {
            this.hideGameMenu();
          },
          onClickPlayRule: function () {
            this.hideGameMenu();
            var e = MJ.GameLogic.TableModel.getGameType();
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.GametypeRule.id, "INIT_RULE", e);
          },
          reqExitGame: function () {
            var e = this,
              t = new cc.Event.EventCustom("REQ_LEAVE_TABLE", !0);
            (e.node.dispatchEvent(t),
              (e._clickLeaveTale = !0),
              e.node.runAction(
                cc.sequence(
                  cc.delayTime(3),
                  cc.callFunc(function () {
                    e._clickLeaveTale = !1;
                  }),
                ),
              ));
          },
          onClickExit: function () {
            var e =
              MJ && MJ.GameLogic.TableModel.getGameType() == g_tConst.GameTypeCfgs.LS6HZ.TYPEID;
            this.hideGameMenu();
            var t = MJ.GameLogic.TableModel;
            if (t.IsDiyRoom()) this.reqExitGame();
            else if (t.IsMatchRoom()) {
              var i = MJ.GameLogic.MatchModel.isMatchMatching(),
                a = MJ.GameLogic.MatchModel.isExistArchives();
              if (i && !a) {
                var o = MJ.GameLogic.MatchModel.matchID;
                g_oData.get(g_tData.MatchMod).reqMatchApply(o, !0);
              } else
                MJ.GameLogic.isGameStart()
                  ? g_oPlatform.doAction(
                      g_tConst.tPlatActionId.actionShowToast,
                      "\u60a8\u6b63\u5728\u6bd4\u8d5b\u4e2d,\u4e0d\u80fd\u9000\u51fa!",
                    )
                  : g_oPlatform.doAction(
                      g_tConst.tPlatActionId.actionShowToast,
                      "\u684c\u5b50\u5df2\u7ecf\u7ec4\u597d\u5566\uff0c\u6e38\u620f\u9a6c\u4e0a\u5f00\u59cb\uff01",
                    );
            } else
              t.IsCounterPlay()
                ? this.reqExitGame()
                : MJ.GameLogic.canLeaveTable() && !e
                  ? g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Game_KeepStay.id, "ON_INIT")
                  : this.reqExitGame();
          },
          onClickSet: function () {
            (this.hideGameMenu(),
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_Setting.id, "ON_INIT"));
          },
          onClickDetails: function () {
            (this.hideGameMenu(),
              MJ.GameLogic.TableModel.IsDiyRoom()
                ? g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.DiyHuDetail.id, "ON_INIT")
                : MJ.GameLogic.TableModel.IsBattleRoom()
                  ? g_oLayerManager.emitEvent2Dlg(
                      g_tConst.GameLayerCfg.BattleHuDetail.id,
                      "ON_INIT",
                    )
                  : g_oLayerManager.emitEvent2Dlg(
                      g_tConst.GameLayerCfg.CoinHuDetail.id,
                      "ON_INIT",
                    ));
          },
          showGameHuBehavior: function () {
            var e = this.nodeMenuList.getChildByName("btn_GameBehavior");
            if (cc.isValid(e)) {
              var t = g_oData.get(g_tData.SwitchModel).getGameBehaviorCfg();
              e.active = t && t.HuBehavior;
            }
          },
          onClickGameHuBehavior: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.GameHuBehavior.id);
          },
        }),
          cc._RF.pop());
      },
      { CommonGT: "CommonGT" },
    ],
