    BaseInfoView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "fdcc5KLv1hD5ZwjfvMNitUr", "BaseInfoView");
        var i = e("CommonUtils");
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            labRemainCard: cc.Label,
            labTime: cc.Label,
            labDuiJuCount: cc.Label,
            nodeDuiJu: cc.Node,
            nodeRoomNum: cc.Node,
            labRoomNum: cc.Label,
            LineNode1: cc.Node,
            NetWorkMsLabel: cc.Label,
            WifiIcon: cc.Sprite,
            WifiIconArr: [cc.SpriteFrame],
            BatterySprite: cc.Sprite,
            PlayInstructionsBtn: cc.Node,
            TipRuleTextIcon: cc.Node,
            btnNode: cc.Node,
            AddSessionBtn: cc.Button,
            TimeDownNode: cc.Node,
            TimeNumLabel: cc.Label,
            TilesNumRoot: cc.Node,
            leagueMatch: cc.Node,
            leagueMatchLab: cc.Label,
            leagueTimeBg: cc.Node,
            n_teamRoot: cc.Node,
            lab_teamPoints: cc.Label,
            _UpdateBatteryMaxNum: 60,
            _UpdateBatteryNum: 60,
            _IsNative: null,
            _IsWeChat: null,
            _IsShowRuleText: !0,
            _TimeMaxNum: 10,
            _TimeCurrNum: 10,
            _IsNeedTimeNumRun: !1,
            _CurRound: 0,
            _TotalRound: 0,
            _start: !1,
            _nodeCountdown: null,
          },
          Awake: function () {
            ((this._remainTileY = this.TilesNumRoot.y),
              (this._IsShowRuleText = !0),
              (this.NetWorkMsLabel.node.active = !1),
              (this.WifiIcon.node.active = !1),
              (this.PlayInstructionsBtn.active = !1),
              (this.nodeDuiJu.active = !1),
              (this.TipRuleTextIcon.active = !1),
              (this.nodeRoomNum.active = !1),
              (this.AddSessionBtn.node.active = !1),
              (this.TimeDownNode.active = !1),
              (this._IsNeedTimeNumRun = !1),
              (this.n_teamRoot.active = !1),
              (this.lab_teamPoints.string = "\u961f\u4f0d\u79ef\u52060"),
              (this._IsNative = i.isNative()),
              (this._IsWeChat = i.isWeChatGame()),
              this.onCustomEvent(),
              this.updateTilesNodeLayout(),
              this.initLeagueMatch(),
              this.node.getComponent(cc.Widget).updateAlignment());
          },
          start: function () {
            var e = this;
            ((this._start = !0),
              this.checkPlayInstructionsBtnFunc(),
              this.schedule(this.updateTime, 1, cc.macro.REPEAT_FOREVER),
              MJ.GameLogic.isPlayBack
                ? (this.labTime.node.active = !1)
                : ((this.labTime.node.active = !0), (this.btnNode.active = !0)),
              this._nodeCountdownData &&
                this.scheduleOnce(function () {
                  e.updateRemainPos(e._nodeCountdownData);
                }, 0.05));
          },
          updateTime: function () {
            var e = new Date(),
              t = e.getMonth() + 1,
              i = e.getDate(),
              a = e.getHours(),
              o = e.getMinutes(),
              n = e.getSeconds();
            (t < 10 && (t = "0" + t),
              i < 10 && (i = "0" + i),
              o < 10 && (o = "0" + o),
              a < 10 && (a = "0" + a));
            var s = t + "-" + i + " " + a;
            ((this.labTime.string = n % 2 == 0 ? s + ":" + o : s + " " + o),
              1 == this._IsNeedTimeNumRun &&
                (this._TimeCurrNum--,
                this._TimeCurrNum < 0
                  ? ((this.TimeDownNode.active = !1), (this._IsNeedTimeNumRun = !1))
                  : (this.TimeNumLabel.string = this._TimeCurrNum + "s")),
              this._UpdateBatteryNum++,
              this._UpdateBatteryNum >= this._UpdateBatteryMaxNum &&
                ((this._UpdateBatteryNum = 0), this.updateBatteryInfo()));
          },
          onCustomEvent: function () {
            (this.node.on(
              "INIT_BASE_INFO",
              function () {
                (this.updateTime(), (this.labRemainCard.string = ""));
              },
              this,
            ),
              this.node.on(
                "UPDATE_REMAIN_TILE",
                function (e) {
                  var t = e;
                  t.nRemainTileCount < 0
                    ? (this.labRemainCard.string = "")
                    : (this.labRemainCard.string = t.nRemainTileCount);
                },
                this,
              ),
              this.node.on(
                "UPDATE_DUIJU_COUNT",
                function (e) {
                  ((this.PlayInstructionsBtn.active = !1), (this.nodeDuiJu.active = !0));
                  var t = e,
                    i = t.nCurRound,
                    a = t.nTotalRound;
                  ((this._CurRound = i), (this._TotalRound = a));
                  var o = -1 === a;
                  this.labDuiJuCount.string = o ? i + "\u5c40" : i + "/" + a + "\u5c40";
                },
                this,
              ),
              this.node.on(
                "RESET_INFO",
                function () {
                  this.labRemainCard.string = "";
                },
                this,
              ),
              this.node.on(
                "SET_DIY_ROOMNUM",
                function (e) {
                  ((this.nodeRoomNum.active = !0),
                    (this.labRoomNum.string = "\u623f\u95f4\u53f7:" + e));
                },
                this,
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.ON_USER_ENTER_GAME,
                  function () {
                    this.checkPlayInstructionsBtnFunc();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.BATTLEMOD_TEAMPOINTS_UPT,
                  function () {
                    this.onBattleModSetTeamPoints();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.UPDATE_LEAGUE_SCORE,
                  function (e) {
                    (this.leagueMatch.active || (this.leagueMatch.active = !0),
                      (this.leagueMatchLab.string =
                        "\u5c40\u6570:" + e.curRound + "/" + e.totalRound));
                  },
                  this,
                ),
              ),
              this.node.on(
                "SHOW_ADD_SESSION_BTN",
                function (e) {
                  var t = !1;
                  if (e) {
                    if (e.hasOwnProperty("isShow")) {
                      var i = e.isShow;
                      ((this.AddSessionBtn.node.active = i), (t = i));
                    }
                    if (e.hasOwnProperty("TotalRound")) {
                      var a = e.TotalRound,
                        o = this._TotalRound + a;
                      ((this.labDuiJuCount.string = this._CurRound + "/" + o + "\u5c40"),
                        1 == t && this.showTimeDownAction());
                    }
                  }
                },
                this,
              ),
              this.node.on("INIT_TEAM", this.onInitTeam, this),
              this.node.on("CLEAR_TEAM", this.onClearTeam, this),
              this.node.on("UPDATE_REMAIN_POS", this.updateRemainPos, this),
              cc.director.on("notify_NetState", this.showWifiMess, this));
          },
          showWifiMess: function (e) {
            var t = parseInt(e.level || 5);
            if (t > 0) {
              var i = t - 1;
              if (i >= 0 && i < this.WifiIconArr.length - 1) {
                var a = this.WifiIconArr[i];
                a && ((this.WifiIcon.node.active = !0), (this.WifiIcon.spriteFrame = a));
              }
            }
            var o = e.time || null;
            o >= 0 &&
              ((this.NetWorkMsLabel.string = o + "ms"), (this.NetWorkMsLabel.node.active = !0));
          },
          onBattleModSetTeamPoints: function () {
            this.updateTeamPoints();
          },
          onInitTeam: function () {
            ((this.n_teamRoot.active = !0), this.updateTeamPoints());
          },
          updateTeamPoints: function () {
            var e = MJ.GameLogic.BattleModel.getTeamPoints();
            if (
              (e >= 0
                ? ((this.lab_teamPoints.node.color = new cc.Color().fromHEX("#ffdd00")),
                  (this.lab_teamPoints.getComponent(cc.LabelOutline).color = new cc.Color().fromHEX(
                    "#ffdd00",
                  )))
                : ((this.lab_teamPoints.node.color = new cc.Color().fromHEX("#81acff")),
                  (this.lab_teamPoints.getComponent(cc.LabelOutline).color = new cc.Color().fromHEX(
                    "#81acff",
                  ))),
              MJ.GameLogic.TableModel.isXLHZ2V2())
            ) {
              e *= MJ.GameLogic.TableModel.getTableCfg().blind;
              var t = i.translateCoinStr(i.initProCoin(Math.abs(e)));
              this.lab_teamPoints.string = (e < 0 ? "-" : "") + t;
            } else {
              var a = e;
              this.lab_teamPoints.string = e >= 0 ? a : "- " + -a;
            }
          },
          onClearTeam: function () {
            this.n_teamRoot.active = !1;
          },
          checkPlayInstructionsBtnFunc: function () {
            MJ.GameLogic.TableModel.IsDiyRoom() &&
              !MJ.GameLogic.isPlayBack &&
              (cc.isValid(this.PlayInstructionsBtn) &&
                ((this.PlayInstructionsBtn.active = !0), (this.nodeDuiJu.active = !1)),
              1 == this._IsShowRuleText &&
                ((this._IsShowRuleText = !1),
                (this.TipRuleTextIcon.active = !0),
                this.tipShowAction()));
          },
          updateBatteryInfo: function () {
            if (this._IsNative);
            else if (this._IsWeChat) {
              var e = this;
              wx.getBatteryInfo({
                success: function (t) {
                  var i = 100;
                  ((i = parseInt(t.level) / i) >= 0 || i <= 1 || (i = 1),
                    (e.BatterySprite.fillRange = i));
                },
              });
            }
          },
          clickLookRuleAction: function () {
            ((this.TipRuleTextIcon.active = !1),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.GameMenu.id,
                "SHOW_RULE_POP",
              ));
          },
          tipShowAction: function () {
            var e = this;
            setTimeout(function () {
              e.TipRuleTextIcon && e.TipRuleTextIcon.isValid && (e.TipRuleTextIcon.active = !1);
            }, 1e4);
          },
          clickAddSessionBtnAction: function () {
            g_oLayerManager.emitEvent2Dlg(
              g_tConst.GameLayerCfg.AddSessionPopView.id,
              "INIT_ADD_SESSION_VIEW",
            );
          },
          showTimeDownAction: function () {
            1 != this._IsNeedTimeNumRun &&
              ((this._IsNeedTimeNumRun = !0),
              (this._TimeCurrNum = this._TimeMaxNum),
              (this.TimeNumLabel.string = this._TimeCurrNum + "s"),
              (this.TimeDownNode.active = !0));
          },
          onClose: function () {
            cc.director.off("notify_NetState", this.showWifiMess, this);
          },
          onClickTeamPoints: function () {
            MJ.GameLogic.TableModel.IsBattleRoom() &&
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.BattleHuDetail.id, "ON_INIT");
          },
          updateTilesNodeLayout: function () {},
          initLeagueMatch: function () {
            if (MJ.GameLogic.TableModel.IsLeagueRoom()) {
              ((this.leagueTimeBg.active = !0), (this.leagueMatch.active = !0));
              var e = g_oData.get(g_tData.LeagueGameResultMod).getTableInfo();
              if (!e) return;
              this.leagueMatchLab.string = "\u5c40\u6570:" + e.curRound + "/" + e.totalRound;
            }
          },
          updateRemainPos: function () {},
        }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils" },
    ],
