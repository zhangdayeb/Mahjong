    GameMenuView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "15af5QK3CRHC5liJwG7mh6H", "GameMenuView");
        var i = e("QuikStart"),
          a = e("CommonGT"),
          o = e("CommonPlat"),
          n = e("DlgBaseView"),
          s = e("CommonUtils");
        (cc.Class({
          extends: n,
          properties: {
            leftTopNode: cc.Node,
            BtnChat: { default: null, type: cc.Node, tooltip: "\u804a\u5929\u6309\u94ae" },
            BtnChatUpdateTip: cc.Node,
            BtnTingTip: {
              default: null,
              type: cc.Node,
              tooltip: "\u67e5\u770b\u542c\u724c\u4fe1\u606f\u6309\u94ae",
            },
            BtnTingTipTeam: cc.Node,
            BtnReadyGroup: {
              default: null,
              type: cc.Node,
              tooltip: "\u51c6\u5907\u3001\u5f00\u59cb\u6309\u94ae\u7236\u8282\u70b9",
            },
            nodeButtonReady: { default: null, type: cc.Node, tooltip: "\u51c6\u5907\u6309\u94ae" },
            nodeButtonDiyGameStart: {
              default: null,
              type: cc.Node,
              tooltip: "\u5f00\u59cb\u6e38\u620f\u6309\u94ae",
            },
            nodeGuideFinger: { default: null, type: cc.Node, tooltip: "\u5f15\u5bfc\u624b\u6307" },
            BtnShare: { default: null, type: cc.Node, tooltip: "\u5206\u4eab\u6309\u94ae" },
            spWaitCharge: cc.Sprite,
            yuyinBtn: { default: null, type: cc.Node, tooltip: "\u8bed\u97f3\u6309\u94ae" },
            n_TeamTag: {
              default: null,
              type: cc.Node,
              tooltip: "\u8bed\u97f3\u961f\u53cb\u6807\u8bc6",
            },
            pbVoice: { default: null, type: cc.Prefab, tooltip: "\u8bed\u97f3box Prefab" },
            huDetailBtn: {
              default: null,
              type: cc.Button,
              tooltip: "\u80e1\u724c\u8be6\u60c5\u6309\u94ae",
            },
            HuEarlyBtns: {
              default: null,
              type: cc.Node,
              tooltip: "\u8840\u6218\u5148\u80e1\u540e\u7684\u6309\u94ae\u7ec4",
            },
            BtnNextGame: {
              default: null,
              type: cc.Node,
              tooltip: "\u4e0b\u4e00\u5c40\u6309\u94ae",
            },
            BtnLuckyTileStart: {
              default: null,
              type: cc.Node,
              tooltip: "\u597d\u724c\u5f00\u59cb\u6309\u94ae",
            },
            BtnSupplementEnergy: {
              default: null,
              type: cc.Node,
              tooltip: "\u8865\u5145\u80fd\u91cf\u6309\u94ae",
            },
            lab_videoBubble: {
              default: null,
              type: cc.Label,
              tooltip: "\u89c6\u9891\u6309\u94ae\u6587\u672c",
            },
            labelRecorder: {
              default: null,
              type: cc.Label,
              tooltip: "\u8bb0\u724c\u5668\u6570\u91cf",
            },
            n_gpsBtn: { default: null, type: cc.Node, tooltip: "GPS\u6309\u94ae" },
            n_roomruleBtn: {
              default: null,
              type: cc.Node,
              tooltip: "\u81ea\u5efa\u623f\u623f\u95f4\u73a9\u6cd5\u6309\u94ae",
            },
            btnRecorder: { default: null, type: cc.Node, tooltip: "\u8bb0\u724c\u5668" },
            nodeReadyRcd: {
              default: null,
              type: cc.Node,
              tooltip:
                "\u51fa\u73b0\u51c6\u5907\u6309\u94ae\u65f6\uff0c\u663e\u793a\u5bfc\u51fa\u4f4d\u7f6e\u7684\u6839\u8282\u70b9",
            },
            yuyinBox: null,
            canTouchYuyin: !0,
            RightDownNode: cc.Node,
            DianFengSaiRankEntry: cc.Node,
            YuSaiEntry: cc.Node,
            FanXingTips: cc.Node,
            _IsShowTingTip: !1,
          },
          Awake: function () {
            ((this._nInvokeType = g_tConst.InvokeType.Video),
              (this.BtnReadyGroup.active = !0),
              (this.yuyinBtn.active = !1),
              (this._IsShowTingTip = !1),
              (this._IsShowMemberTingTip = !1),
              (this._isInitView = !1),
              (this.n_roomruleBtn.active = !1),
              this.initHuEarlyBtns(!0),
              MJ.GameLogic.isPlayBack ? (this.node.active = !1) : this.onCustomEvent(),
              this.onMessageEvent(),
              this.setReadyRcdStatus(!0),
              this.updateRightNodeLayout());
          },
          start: function () {
            ((this._table_mod = MJ.GameLogic.TableModel),
              (this.clickLong = 0),
              this.adjustHuEarlyBtnsPos(),
              this.showHuDetailBtn(),
              this.showDianFengSaiBtn(),
              this.updateFanXingTipsPos());
            var e = g_oData.get(g_tData.UserLocalModel).getData("BACKPACK_GOOD_CHANGE", !1);
            (g_oData.get(g_tData.UserLocalModel).setData("BACKPACK_GOOD_CHANGE", !1),
              e && g_oData.get(g_tData.mod_Bag).reqBackpackGoods());
            var t = g_oData.get(g_tData.SwitchModel).getRecorderCfg();
            if (
              ((this.btnRecorder.active = t.show),
              g_oData
                .get(g_tData.mod_MJrecorder)
                .setRecorderNum(g_oData.get(g_tData.mod_Bag).getPropNumById(100020)),
              this.refreshRecorderNum(),
              this.isSESX())
            )
              return (
                (this.leftTopNode.getComponent(cc.Widget).left = 260),
                void this.leftTopNode.getComponent(cc.Widget).updateAlignment()
              );
          },
          isSESX: function () {
            var e = MJ.GameLogic.TableModel.getGameType();
            return (
              g_tConst.GameTypeCfgs.SESXMJ.TYPEID == e || g_tConst.GameTypeCfgs.SGMJ2.TYPEID == e
            );
          },
          onCustomEvent: function () {
            var e = this;
            (this.node.on("SHOW_READY_BUTTON", function () {
              if (
                (Log.info("\u663e\u793a\u51c6\u5907\u6309\u94ae"),
                !e.HuEarlyBtns.active &&
                  !MJ.GameLogic.TableModel.IsMatchRoom() &&
                  !MJ.GameLogic.TableModel.IsLeagueRoom())
              ) {
                if (g_oData.get(g_tData.GameTeachMod).CheckShowIsAutoLayer()) return;
                ((e.nodeButtonReady.active = !0), (e.nodeReadyRcd.active = e.ableShowReadyRcd));
              }
            }),
              this.node.on("HIDE_READY_BUTTON", function () {
                (Log.info("\u9690\u85cf\u51c6\u5907\u6309\u94ae"),
                  (e.nodeButtonReady.active = !1),
                  (e.nodeReadyRcd.active = !1));
              }),
              this.node.on("TOGGLE_DIY_GAMESTART_BTN", function (t) {
                e.nodeButtonDiyGameStart.active = t;
              }),
              this.node.on("TOGGLE_GUIDE_FINGER", function (t) {
                e.nodeGuideFinger.active = t;
              }),
              this.node.on("GAME_PLAT_EVENT_SHOW_READY_RCD", function (t) {
                (e.setReadyRcdStatus(t), (e.nodeReadyRcd.active = e.ableShowReadyRcd));
              }),
              this.node.on("IS_SHOW_WAIT_CHARGE", function (t) {
                e.isShowWaitCharge(t);
              }),
              this.node.on("SHOW_YUYIN_BTN", function (t) {
                e.showYuyinBtn(t);
              }),
              this.node.on("QUICK_READY", this.onClickReady, this),
              this.node.on("START_NEXT_GAME", this.onClickNextGame, this),
              this.node.on("SHOW_GPSBUTTON", function () {
                e.n_gpsBtn.active = !0;
              }),
              this.node.on("HIDE_GPSBUTTON", function () {
                e.n_gpsBtn.active = !1;
              }),
              this.node.on("RESET_MENU", function () {
                e.BtnTingTip.active = !1;
              }),
              this.node.on("HIDE_TING_TIP", function () {
                e.BtnTingTip.active = !1;
              }),
              this.node.on("HIDE_BTN_NEXT_GAME", function () {
                (e.isShowWaitCharge(!1), (e.HuEarlyBtns.active = !1));
              }),
              this.node.on("SHOW_BTN_NEXT_GAME", function () {
                e.HuEarlyBtns.active = !0;
              }),
              this.node.on("SHOW_TING_TIP", function () {
                e.BtnTingTip.active = !0;
              }),
              this.node.on("SHOW_BTN_SHARE", function (t) {
                var i = t;
                e.BtnShare.active = i;
              }),
              this.node.on("SHOW_RULE_POP", function () {
                e.onClickRoomRule();
              }),
              this.node.on("LOOK_DESK_INFO", function () {
                e.BtnReadyGroup.active = !1;
              }),
              this.node.on("NO_LOOK_DESK_INFO", function (t) {
                g_oData.get(g_tData.GameTeachMod).CheckShowIsAutoLayer() ||
                  (1 == t
                    ? (e.BtnReadyGroup.active = !0)
                    : e.scheduleOnce(function () {
                        e.BtnReadyGroup.active = !0;
                      }, 0.2));
              }),
              cc.director.on("HIDE_TING_TIP_NOTIFY", function () {
                e._IsShowTingTip = !1;
              }),
              this.node.on("CHANGE_MEMBER_TING", function (t) {
                e.BtnTingTipTeam.active = t;
              }),
              cc.director.on("HIDE_MEMBER_TING_TIP_NOTIFY", function () {
                e._IsShowMemberTingTip = !1;
              }),
              this.node.on("LEAVE_TABLE", function () {
                e.leaveTable();
              }),
              this.node.on("SHOW_MENU", function (t) {
                e.node.active = t;
              }),
              this.node.on("ON_GAME_TEACH", function () {
                ((e.HuEarlyBtns.active = !1), (e.BtnReadyGroup.acive = !1));
              }));
          },
          onMessageEvent: function () {
            var e = this;
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.DIANFENGSAI_CFG_SUCCESS,
                function () {
                  this.showDianFengSaiBtn();
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.ON_USER_ENTER_GAME,
                  function () {
                    this.showHuDetailBtn();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.USER_CANTOUCH_YUYIN_BTN,
                  function (e) {
                    this.canTouchYuyinBtn(e);
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GAMEPLAT_SHARE_EVENT_NOTIFY_SHARECFG,
                  function () {
                    e.initHuEarlyBtns();
                  },
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.ON_BACKPACK_PROP_NUM_UPD,
                  function (e) {
                    this.propDataChanged(e);
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.SHOW_RECORDER,
                  function () {
                    this.onClickJPQ(null, 1);
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.NOTIFY_GAME_END,
                  function () {
                    (g_oData.get(g_tData.UserLocalModel).setData("usedRecorder", 0),
                      g_oData.get(g_tData.UserLocalModel).setData("buyRecorder", 0));
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.NOTIFY_ENTER_GAME,
                  function () {
                    (g_oData.get(g_tData.UserLocalModel).setData("usedRecorder", 0),
                      g_oData.get(g_tData.UserLocalModel).setData("buyRecorder", 0));
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.ON_GET_BACKPACKGOOD_SUC,
                  function () {
                    this.refreshRecorderNum();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.UPDATE_FANXING_TIPS_POS,
                  function () {
                    this.updateFanXingTipsPos();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.ON_SHOW_BAG_NEW_GOOD,
                  function () {
                    g_oData.get(g_tData.mod_Bag).reqBackpackGoods();
                  },
                  this,
                ),
              ));
          },
          showHuDetailBtn: function () {
            var e = MJ.GameLogic.TableModel.getGameType();
            (a.isDiyGametype(e) || MJ.GameLogic.TableModel.IsLeagueRoom()
              ? (this.huDetailBtn.node.active = !0)
              : (this.huDetailBtn.node.active = !(
                  -1 === g_tConst.ShowDuiJuDetailCoinGameType.indexOf(e)
                )),
              g_tConst.NotShowChatGameType.includes(e)
                ? (this.BtnChat.active = !1)
                : (this.BtnChatUpdateTip.active = this.canShowBtnChatUpdateTip()));
          },
          canTouchYuyinBtn: function (e) {
            ((this.canTouchYuyin = e),
              this.yuyinBox.getComponent("gameYuyinBox").setInteractable(e));
          },
          showYuyinBtn: function (e) {
            var t = e.isShowTeamTag,
              i = MJ.GameLogic.TableModel,
              a = i.IsDiyRoom();
            if (o.canVoice())
              if (i && i.openYuyin) {
                var n = !0;
                (a && (n = !!g_oData.get(g_tData.SwitchModel).getProvisionalSwitch("DiyShowChat")),
                  (this.yuyinBtn.active = n),
                  n && this.onYuyinBtnClickEvent());
              } else this.yuyinBtn.active = !1;
            else this.yuyinBtn.active = !1;
            ((this.n_TeamTag.active = t), a || (this.yuyinBtn.active = !1));
          },
          onYuyinBtnClickEvent: function () {
            this.yuyinBox ||
              ((this.yuyinBox = cc.instantiate(this.pbVoice)), (this.yuyinBox.parent = this.node));
            var e = this.yuyinBox.getComponent("gameYuyinBox");
            ((e.onSendMsg = function (e, t) {
              void 0 === t && (t = 3);
              var i = null;
              if (MJ.GameLogic.TableModel.IsBattleRoom()) {
                if (!g_oData.get(g_tData.mod_ChatMsg).sub.team.checkMember({ withAlert: !0 }))
                  return;
                i = MJ.GameLogic.PlayerModel.getUserIdBySeatId(
                  MJ.GameLogic.PlayerModel.memberSeatId,
                );
              }
              (Log.warn(">>>GameMenuView.js onSendMsg yuyin:", e, t, i),
                g_oData
                  .get(g_tData.mod_ChatMsg)
                  .sendChatMsg({ sMsgStr: e, nType: t, priToUserID: i }));
            }),
              this.yuyinBtn.on(
                cc.Node.EventType.TOUCH_START,
                function (t) {
                  this.canTouchYuyin
                    ? e.onData(0, t, !1)
                    : g_oPlatform.doAction(
                        g_tConst.tPlatActionId.actionShowToast,
                        "\u8bed\u97f3\u6b63\u5728\u64ad\u653e\u4e2d\uff0c\u8bf7\u7a0d\u540e",
                      );
                },
                this,
              ),
              this.yuyinBtn.on(
                cc.Node.EventType.TOUCH_MOVE,
                function (t) {
                  this.canTouchYuyin && e.onData(1, t, !1);
                },
                this,
              ),
              this.yuyinBtn.on(
                cc.Node.EventType.TOUCH_CANCEL,
                function (t) {
                  this.canTouchYuyin && e.onData(2, t, !1);
                },
                this,
              ),
              this.yuyinBtn.on(
                cc.Node.EventType.TOUCH_END,
                function (t) {
                  this.canTouchYuyin && e.onData(3, t, !1);
                },
                this,
              ));
          },
          propDataChanged: function (e) {
            for (var t = e.backPackCountUpdateMsg, i = 0; i < t.length; i++)
              if (100020 == t[i].id)
                return void (t[i].status
                  ? (g_oData.get(g_tData.mod_MJrecorder).setRecorderNum(t[i].count),
                    this.refreshRecorderNum(),
                    g_oExLayerManager.emitEvent2GameLayer(
                      g_tConst.GameExLayerCfg.MJrecorder.id,
                      "",
                    ),
                    g_oEvent.dispatchEvent(g_tEvent.REFRESH_RECORDER),
                    g_oPlatform.doAction(
                      g_tConst.tPlatActionId.actionShowToast,
                      "\u6d88\u8017\u8bb0\u724c\u5668x1",
                    ),
                    g_oData.get(g_tData.UserLocalModel).setData("usedRecorder", 1))
                  : (g_oData.get(g_tData.UserLocalModel).setData("usedRecorder", -1),
                    (g_oData.get(g_tData.UserLocalModel).getData("buyRecorder", 0) &&
                      1 == this.clickLong) ||
                      g_oLayerManager.emitEvent2Dlg(
                        g_tConst.GameLayerCfg.BuyRecorder.id,
                        "ON_INIT",
                        this.clickLong,
                      )));
          },
          refreshRecorderNum: function () {
            if (g_oData.get(g_tData.SwitchModel).getRecorderCfg().show)
              if (MJ.GameLogic.TableModel.IsDiyRoom()) this.btnRecorder.active = !1;
              else {
                var e = g_oData.get(g_tData.mod_MJrecorder).getRecorderNum();
                ((this.recorderNum = e),
                  (this.labelRecorder.string = this.recorderNum > 99 ? "99+" : this.recorderNum),
                  (this.btnRecorder.getChildByName("img_circl").active = null != e),
                  g_oData.get(g_tData.MakabakaMod).isMKBK &&
                    (this.btnRecorder.getChildByName("img_circl").active = !1));
              }
          },
          setReadyRcdStatus: function () {
            (g_oCtrl.get(g_tCtrl.RecommendNodePool), (this.ableShowReadyRcd = !1));
          },
          isShowWaitCharge: function (e) {
            ((this.spWaitCharge.node.active = e),
              e &&
                (MJ.GameLogic.TableModel.isZCoinRoom()
                  ? (this.spWaitCharge.node
                      .getChildByName("label")
                      .getComponent("cc.Label").string =
                      "\u7b49\u5f85\u5176\u4ed6\u73a9\u5bb6\u8865\u5145\u6307\u5c16\u5e01...")
                  : (this.spWaitCharge.node
                      .getChildByName("label")
                      .getComponent("cc.Label").string =
                      "\u7b49\u5f85\u5176\u4ed6\u73a9\u5bb6\u8865\u5145\u6e38\u620f\u8c46...")));
          },
          isUsedJPQ: function () {
            var e = MJ.GameLogic.PlayerModel.getPlayerOtherInfoByUserId(g_oPlatform.getUserId()),
              t = !1;
            return (e && e.jiPaiQi && (t = e.jiPaiQi), t);
          },
          onClickJPQ: function (e, t) {
            if (
              ((this.clickLong = t),
              g_oData.get(g_tData.SwitchModel).getRecorderCfg().show &&
                !MJ.GameLogic.TableModel.IsDiyRoom())
            ) {
              var i = MJ.GameLogic.canTrustee,
                a = MJ.GameLogic.isGameStart();
              if (i && a) {
                g_oData
                  .get(g_tData.gameReportData)
                  .reportClickAction(g_tConst.ReportCfg.ClickActionReport.ClickMJRecoder);
                var o = g_oData.get(g_tData.UserLocalModel).getData("usedRecorder", 0),
                  n = g_oData.get(g_tData.UserLocalModel).getData("buyRecorder", 0),
                  s = this.isUsedJPQ(),
                  r = g_oData.get(g_tData.MakabakaMod).isMKBK;
                if (o > 0 || r || s)
                  (g_oExLayerManager.emitEvent2GameLayer(g_tConst.GameExLayerCfg.MJrecorder.id, ""),
                    this.refreshRecorderNum(),
                    g_oEvent.dispatchEvent(g_tEvent.REFRESH_RECORDER));
                else {
                  if (o < 0 && 0 == this.recorderNum)
                    return void (
                      (n && 1 == this.clickLong) ||
                      g_oLayerManager.emitEvent2Dlg(
                        g_tConst.GameLayerCfg.BuyRecorder.id,
                        "ON_INIT",
                        this.clickLong,
                      )
                    );
                  this.isNotUsePopToday()
                    ? g_oData.get(g_tData.mod_MJrecorder).reqCardCfg()
                    : g_oExLayerManager.emitEvent2GameLayer(
                        g_tConst.GameExLayerCfg.UseRecorder.id,
                        "ON_INIT",
                      );
                }
              } else
                g_oPlatform.doAction(
                  g_tConst.tPlatActionId.actionShowToast,
                  "\u8bb0\u724c\u5668\u5f53\u524d\u9636\u6bb5\u4e0d\u53ef\u4f7f\u7528",
                );
            }
          },
          isNotUsePopToday: function () {
            var e = g_oData.get(g_tData.UserLocalModel).getData("MJrecorder_USE_NotPopToday", 0);
            return s.isSameDay(
              new Date(1e3 * e),
              new Date(1e3 * g_oData.get(g_tData.sdkLogin).serverTime),
            );
          },
          onClickDetails: function () {
            MJ.GameLogic.TableModel.IsDiyRoom()
              ? g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.DiyHuDetail.id, "ON_INIT")
              : MJ.GameLogic.TableModel.IsBattleRoom()
                ? g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.BattleHuDetail.id, "ON_INIT")
                : g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.CoinHuDetail.id, "ON_INIT");
          },
          onClickTingTip: function () {
            0 == this._IsShowTingTip
              ? ((this._IsShowTingTip = !0),
                g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.TingTip.id,
                  "SHOW_TING_TIP",
                ))
              : ((this._IsShowTingTip = !1),
                g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.TingTip.id,
                  "HIDE_TING_TIP",
                ));
          },
          onClickChat: function () {
            (this.saveClickDateOfBtnChat(new Date()),
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.chatChoose.id, "ON_SHOW", {
                updated: this.BtnChatUpdateTip.active,
              }),
              !0 === this.BtnChatUpdateTip.active && (this.BtnChatUpdateTip.active = !1));
          },
          saveClickDateOfBtnChat: function (e) {
            var t = s.getDateString(e);
            g_oData.get(g_tData.UserLocalModel).setData("clickBtnChatDate", t);
          },
          canShowBtnChatUpdateTip: function () {
            var e = !1,
              t = g_oData.get(g_tData.UserLocalModel).getData("clickBtnChatDate", null);
            return (
              (e =
                null === t ||
                (t !== s.getDateString(new Date()) &&
                  !MJ.GameLogic.PlayerModel.isUserOfMakabaka(g_oPlatform.getUserId()))),
              g_oData.get(g_tData.SwitchModel).getMakabakaCfg().isShowMkbkUpdateTip || (e = !1),
              e
            );
          },
          onClickGPS: function () {
            g_oLayerManager.emitEvent2Dlg(
              g_tConst.GameLayerCfg.AntiCheating.id,
              "ON_CLICK_GPSBUTTON",
            );
          },
          onClickReady: function () {
            if (
              !MJ.GameLogic.isPlayBack &&
              g_oData.get(g_tData.DianFengSaiMod).checkCanContinueGame()
            ) {
              var e = MJ.GameLogic.TableModel.IsDiyRoom(),
                t = MJ.GameLogic.TableModel.IsCounterPlay(),
                i = MJ.GameLogic.TableModel.isZCoinRoom();
              e
                ? (MJ.GameLogic.reqReady(), this.reportOnNewPlayerReady())
                : t
                  ? this.reqCounterGameStart()
                  : i
                    ? this.reqZCoinGameStart()
                    : this.reqCoinGameStart();
            }
          },
          adjustHuEarlyBtnsPos: function () {
            var e = this,
              t = function () {
                var t = e.HuEarlyBtns.children.filter(function (e) {
                  return e.active;
                });
                e.HuEarlyBtns.x = 1 === t.length ? 365 : 10;
              };
            (t(),
              this.HuEarlyBtns.on(
                cc.Node.EventType.SIZE_CHANGED,
                function () {
                  t();
                },
                this,
              ));
          },
          initHuEarlyBtns: function (e) {
            (void 0 === e && (e = !1),
              !this._isInitView && e && (this.HuEarlyBtns.active = !1),
              (this._isInitView = !0),
              (this.BtnNextGame.active = !1),
              (this.BtnLuckyTileStart.active = !1),
              (this.BtnSupplementEnergy.active = !1));
            var t = g_oData.get(g_tData.SwitchModel).getGameBtnsCfg(),
              i = g_tConst.GameBtnsDefine.HuEarlyBtns,
              a = t.HuEarlyBtns,
              o = a.indexOf(i.nextGame);
            if (
              ((this.BtnNextGame.active = -1 !== o),
              (this.BtnNextGame.zIndex = o),
              MJ.GameLogic.TableModel.IsCoinRoom())
            ) {
              var n = a.indexOf(i.luckyTileStart),
                s = g_oData
                  .get(g_tData.mod_Share)
                  .getShareCntByLinkID(g_tConst.ShareConfig.ShareLinkId.GameLuckyTile);
              ((this.BtnLuckyTileStart.active = -1 !== n && s > 0),
                (this.BtnLuckyTileStart.zIndex = n),
                this.BtnLuckyTileStart.active &&
                  (this.lab_videoBubble.string =
                    (this._invokeType === g_tConst.InvokeType.Video
                      ? "\u89c2\u770b\u5b8c\u6574\u89c6\u9891"
                      : "\u5206\u4eab\u7ed9\u597d\u53cb") +
                    "\uff0c\u4e0b\u5c40\u53d1\u597d\u724c"));
            }
            if (MJ.GameLogic.TableModel.IsCounterPlay()) {
              var r = a.indexOf(i.supplementEnergy);
              ((this.BtnSupplementEnergy.active = -1 !== r), (this.BtnSupplementEnergy.zIndex = r));
            }
          },
          onClickNextGame: function () {
            var e = this;
            if (g_oData.get(g_tData.DianFengSaiMod).checkCanContinueGame()) {
              var t = this;
              ((this.HuEarlyBtns.active = !1),
                this.isShowWaitCharge(!1),
                g_oData.get(g_tData.mod_Share).reqGameEndaward(function () {
                  e.leaveTable();
                  var i,
                    a = MJ.GameLogic.TableModel.IsCounterPlay(),
                    o = MJ.GameLogic.TableModel.isZCoinRoom();
                  a
                    ? e.reqCounterGameStart()
                    : o
                      ? e.reqZCoinGameStart()
                      : e.isCoinsEnough()
                        ? ((i = 0),
                          (MJ.GameLogic.getWinFailList() || []).forEach(function (e) {
                            i += e.iCoin;
                          }),
                          g_oData
                            .get(g_tData.SwitchModel)
                            .isSeeVideoBySceneId(g_tConst.SeeVideoScene.GameEndGetMore) &&
                          MJ.GameLogic.TableModel.IsCoinRoom() &&
                          i > 0
                            ? g_oLayerManager.emitEvent2Dlg(
                                g_tConst.GameLayerCfg.VideoAward.id,
                                "INIT_VIDEO_AWARD_VIEW",
                                {
                                  sceneId: g_tConst.SeeVideoScene.GameEndGetMore,
                                  coin: 4 * MJ.GameLogic.TableModel.getTableCfg().blind,
                                  fCallBack: function () {
                                    if (cc.isValid(t.node)) {
                                      var i = new cc.Event.EventCustom("INIT_UI", !0);
                                      (t.node.dispatchEvent(i), e.reqCoinGameStart());
                                    }
                                  },
                                },
                              )
                            : e.reqCoinGameStart())
                        : e.basicGamingAllowancesCheck();
                }));
            }
          },
          onClickLuckyTileStart: function () {
            var e = this;
            if (MJ.GameLogic.TableModel.isOnTable()) {
              var t = new cc.Event.EventCustom("REQ_LEAVE_TABLE", !0);
              this.node.dispatchEvent(t);
            }
            var i = g_tConst.ShareConfig.ShareScene.game;
            g_oCommonUtils.isOnGameScene()
              ? (i =
                  i +
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
              : (i += "_lobby");
            var a = {
              Scene: i,
              Module: g_tConst.ShareConfig.ShareModule.GameLuckyTile,
              SubModule: g_tConst.ShareConfig.ShareSubModule.GameLuckyTile,
              ShareType: g_tConst.ShareConfig.ShareType.GameLuckyTile,
              AdScene: g_tConst.AwardAdPID.LuckyTileStart,
              enbleSubGuide: !1,
              cbSuc: function () {
                (g_oData
                  .get(g_tData.mod_Share)
                  .reqGPShareSuc(
                    g_tConst.ShareConfig.ShareLinkId.GameLuckyTile,
                    void 0,
                    void 0,
                    a.type,
                  ),
                  g_oData
                    .get(g_tData.gameReportData)
                    .reportClickFirstAdAwardAction(
                      e._invokeType,
                      g_tConst.ShareConfig.ShareSubModule.GameLuckyTile,
                    ),
                  g_oPlatform.doAction(
                    g_tConst.tPlatActionId.actionShowToast,
                    "\u60a8\u5df2\u83b7\u5f97\u597d\u724c\u5f00\u59cb\u673a\u4f1a\uff0c\u4e0b\u5c40\u53d1\u597d\u724c",
                  ),
                  e.onClickNextGame());
              },
            };
            this.invokeAD(a);
          },
          onClickShare: function () {
            g_oData.get(g_tData.Login).authorize(function (e) {
              e &&
                g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.DiyShare.id, "START_DIY_SHARE");
            });
          },
          onClickRoomRule: function () {
            if (MJ && MJ.GameLogic && MJ.GameLogic.DiyModel) {
              var e = JSON.parse(MJ.GameLogic.DiyModel.getPriParams());
              e.ruleUIInfo
                ? g_oLayerManager.emitEvent2Dlg(
                    g_tConst.GameLayerCfg.DiyRoomRule.id,
                    "ON_INIT",
                    e.ruleUIInfo,
                  )
                : g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.DiyDescViewDlg.id, "INIT");
            } else
              Log.error(
                "BIRD\ud83d\ude21>>>",
                "GameMenuView.js",
                "\u975e\u5bf9\u5c40\u6216\u975e\u81ea\u5efa\u623f\u4e2d\u70b9\u51fb onClickRoomRule",
              );
          },
          onClickDiyGameStart: function () {
            if (MJ.GameLogic.PlayerModel.getAllNetErrUserId().length > 0)
              g_oPlatform.doAction(
                g_tConst.tPlatActionId.actionShowToast,
                "\u6709\u73a9\u5bb6\u5904\u4e8e\u79bb\u7ebf\uff0c\u6682\u505c\u53d1\u724c",
              );
            else {
              var e = new cc.Event.EventCustom("REQ_DIY_GAME_START", !0);
              this.node.dispatchEvent(e);
            }
          },
          basicGamingAllowancesCheck: function () {
            var e,
              t = this,
              i = g_oData.get(g_tData.sdkUser).coin,
              a = g_oData
                .get(g_tData.mod_gamecfg)
                .getSceneCfgBySceneID(this._table_mod.getSceneId()),
              o = g_oData
                .get(g_tData.mod_gamecfg)
                .getGameTypeSceneCfgs(this._table_mod.getGameType())
                .sort(function (e, t) {
                  return e.enterCoinLower - t.enterCoinLower;
                }),
              n = g_oData.get(g_tData.mod_gamecfg).getGameCfg("bgCfg"),
              s = !isNull(o) && !isNull(o[0]) && i < o[0].enterCoinLower,
              r = i < n.triggerCoin,
              c = a.enterCoinLower > i;
            if (r || s) {
              var l = g_tConst.PaySceneId.paySceneIDProtectView,
                g = null,
                d = !0;
              if (this._table_mod.IsBattleRoom())
                g = {
                  autoQuickStart: !1,
                  cbGetBeansSuc: function () {
                    t.onClickReady();
                  },
                };
              else {
                var h = g_oAdManager.checkPlayingSomePopCfg(12);
                isNull(h) || (d = !(h.noPop >= 0) && d);
              }
              d &&
                (e = function () {
                  g_oEvent.dispatchEvent(g_tEvent.DAILY_PUSH_MSG_LOW_COIN, g, l);
                });
            } else
              c &&
                (e = function () {
                  g_oEvent.dispatchEvent(
                    g_tEvent.DAILY_PUSH_MSG_LOW_COIN,
                    "",
                    g_tConst.PaySceneId.paySceneIDLuckGiftNoCoin,
                  );
                });
            g_oData
              .get(g_tData.TicketMod)
              .checkBeforeEnterTable(MJ.GameLogic.TableModel.getSceneId())
              ? g_oData.get(g_tData.TicketMod).askUseTicket(MJ.GameLogic.TableModel.getSceneId(), e)
              : e();
          },
          isCoinsEnough: function () {
            var e = g_oData.get(g_tData.sdkUser).coin;
            return (
              g_oData.get(g_tData.mod_gamecfg).getSceneCfgBySceneID(this._table_mod.getSceneId())
                .enterCoinLower <= e
            );
          },
          isCoinsTooMany: function () {
            var e = g_oData.get(g_tData.sdkUser).coin,
              t = g_oData
                .get(g_tData.mod_gamecfg)
                .getSceneCfgBySceneID(this._table_mod.getSceneId());
            return !(-1 === t.enterCoinUpper) && e > t.enterCoinUpper;
          },
          showCoinsTooManyTip: function () {
            var e = g_tConst.GameConfig.eWinGood.Coin;
            (MJ.GameLogic.TableModel.isZCoinRoom() && (e = _tConst.GameConfig.eWinGood.ZCoin),
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.TooManyCoin.id, "TooManyCoin", {
                type: e,
              }));
          },
          reportOnNewPlayerReady: function () {
            var e = MJ.GameLogic.PlayerModel.getMyPlayerInfo(),
              t = e.win + e.equal + e.loss;
            if (0 === t) {
              var i = g_tConst.ReportCfg.NewUserPlayFunnel;
              g_oData.get(g_tData.gameReportData).reportNewUserFunnel(i, i.Events.ClickFirstReady);
            } else if (1 === t) {
              var a = g_tConst.ReportCfg.NewUserPlayFunnel;
              g_oData.get(g_tData.gameReportData).reportNewUserFunnel(a, a.Events.ClickSecondReady);
            }
          },
          leaveTable: function () {
            if (MJ.GameLogic.TableModel.isOnTable()) {
              var e = new cc.Event.EventCustom("REQ_LEAVE_TABLE", !0);
              (this.node.dispatchEvent(e),
                MJ &&
                  MJ.GameLogic &&
                  MJ.GameLogic.canLeaveTable() &&
                  MJ.GameLogic.TableModel.setOnTable(!1));
            } else this.node.emit("SHOW_READY_BUTTON");
          },
          heightestSceneCanEnter: function () {
            for (
              var e = g_oData.get(g_tData.sdkUser).coin,
                t = g_oData
                  .get(g_tData.mod_gamecfg)
                  .getSceneCfgBySceneID(this._table_mod.getSceneId()),
                i = g_oData
                  .get(g_tData.mod_gamecfg)
                  .getGameTypeSceneCfgs(this._table_mod.getGameType()),
                a = null,
                o = 0;
              o < i.length;
              o++
            )
              t.enterCoinLower < i[o].enterCoinLower && e >= i[o].enterCoinLower && (a = i[o]);
            return a;
          },
          reqCoinGameStart: function () {
            if (this.isCoinsEnough()) {
              var e = g_oData.get(g_tData.SwitchModel).sub.strategyCfg.isAutoHightScene(),
                t = this.heightestSceneCanEnter();
              !isNull(t) && e
                ? (this.leaveTable(),
                  i.quickStart(!0),
                  g_oLayerManager.emitEvent2Dlg(
                    g_tConst.GameLayerCfg.TipsLayer.id,
                    "SHOW_NORMAL_TIP",
                    {
                      tipMsg:
                        "\u606d\u559c\u5927\u795e\u6210\u529f\u8dfb\u8eab" +
                        i.getSceneNameByCfg(t) +
                        "\uff0c\u795d\u60a8\u9e3f\u8fd0\u5f53\u5934\uff01",
                      showTime: 2,
                    },
                  ))
                : this.isCoinsTooMany()
                  ? this.showCoinsTooManyTip()
                  : (MJ.GameLogic.reqReady(), this.reportOnNewPlayerReady());
            } else this.basicGamingAllowancesCheck();
          },
          reqCounterGameStart: function () {
            MJ.GameLogic.reqReady();
          },
          reqZCoinGameStart: function () {
            MJ.GameLogic.reqReady();
          },
          onClickTingTipTeam: function () {
            0 == this._IsShowMemberTingTip
              ? ((this._IsShowMemberTingTip = !0),
                g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.TingTipMember.id,
                  "SHOW_MEMBER_TING_TIP",
                ))
              : ((this._IsShowMemberTingTip = !1),
                g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.TingTipMember.id,
                  "HIDE_MEMBER_TING_TIP",
                ));
          },
          updateRightNodeLayout: function () {
            var e = g_oData.get(g_tData.LiveGameModel).isLivePlayer();
            this.RightDownNode.position = e ? cc.v2(594, -65) : cc.v2(594, -120);
          },
          showDianFengSaiBtn: function (e) {
            var t = this;
            if (((e = e || g_tAsset.DianFengSaiRankEntry), this._loadingRankEntry != e)) {
              var i = g_oData.get(g_tData.SwitchModel).getDianFengSaiCfg();
              if (i) {
                var a = g_oData.get(g_tData.DianFengSaiMod).canSupportMatch(),
                  o = MJ.GameLogic.TableModel.isDCoinRoom(),
                  n = g_oData
                    .get(g_tData.DianFengSaiMod)
                    .canSupportYuSaiScene(MJ.GameLogic.TableModel.getSceneId());
                ((a && o && i.jueSaiRankEntry) || (i.yuSaiRankEntry && n)) &&
                  !this._isloadingRankEntry &&
                  (Log.info("showDianFengSaiBtn:", e),
                  (this._loadingRankEntry = e),
                  (this._isloadingRankEntry = !0),
                  g_oPrefabLoader.loadRes(e, null, function (i) {
                    ((t._isloadingRankEntry = !1),
                      cc.isValid(t) &&
                        t._loadingRankEntry == e &&
                        (t.DianFengSaiRankEntry.removeAllChildren(),
                        (i.parent = t.DianFengSaiRankEntry)));
                  }));
              }
            }
          },
          updateFanXingTipsPos: function () {
            var e = MJ.GameLogic.TableModel.getFanXingTipsPos();
            e && (e.x && (this.FanXingTips.x = e.x), e.y && (this.FanXingTips.y = e.y));
          },
        }),
          cc._RF.pop());
      },
      {
        CommonGT: "CommonGT",
        CommonPlat: "CommonPlat",
        CommonUtils: "CommonUtils",
        DlgBaseView: "DlgBaseView",
        QuikStart: "QuikStart",
      },
    ],
