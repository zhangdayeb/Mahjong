    ConfirmQueView: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "64925snvr9BvoumhUR30R0F", "ConfirmQueView"),
          cc.Class({
            extends: Cls_BaseView,
            properties: {
              queAnims: [cc.Prefab],
              nodeChoose: cc.Node,
              nodeDingQue: cc.Node,
              nDingQueTip: [cc.Node],
              queSpriteFrame: [cc.SpriteFrame],
              spMyQueShow: cc.Sprite,
              wanBtn: cc.Node,
              tiaoBtn: cc.Node,
              tongBtn: cc.Node,
              DingQueCompTip: [cc.Node],
              NoticeNumLabel: cc.Label,
              NoticeLabel: cc.Label,
              _recQueColor: -1,
              _TimeNum: -1,
            },
            Awake: function () {
              var e = this;
              ((this.NoticeNumLabel.node.active = !1),
                this.updateMineChooseQueNodeLayout(),
                this.onCustomEvent(),
                g_oData.get(g_tData.SwitchModel).sub.voiceOrder.isAutoAwake("ComfirmQue") &&
                  (g_oData.get(g_tData.mod_VoiceOrder).listenStart(),
                  this.autoDispose(
                    g_oEvent.addEventListener(g_tEvent.MOD_VOICEORDER_ORDER_QUE, function (t) {
                      switch (t) {
                        case "\u7b52":
                          e.onClickTong();
                          break;
                        case "\u4e07":
                          e.onClickWan();
                          break;
                        case "\u6761":
                          e.onClickTiao();
                          break;
                        default:
                          Log.warn(
                            "BIRD\ud83d\ude31>>>",
                            "\u6536\u5230\u7684\u7f3a\u6307\u4ee4\u6709\u8bef\u4e3a",
                            t,
                          );
                      }
                    }),
                  )));
            },
            reqDingQue: function (e) {
              var t = new cc.Event.EventCustom("REQ_DING_QUE", !0);
              (t.setUserData({ nTileColor: e }), this.node.dispatchEvent(t));
            },
            onClickWan: function () {
              this.reqDingQue(g_tConst.GameConfig.TileColor.wan);
            },
            onClickTiao: function () {
              this.reqDingQue(g_tConst.GameConfig.TileColor.tiao);
            },
            onClickTong: function () {
              this.reqDingQue(g_tConst.GameConfig.TileColor.tong);
            },
            start: function () {},
            playQueAnimation: function (e, t) {
              var i = g_oPrefabLoader.instantiate(e),
                a = i.getComponent(cc.Animation);
              ((a.node.active = !0), t.addChild(i), a.play());
            },
            updateTime: function () {
              this._time = this._time + 1;
              var e = this._time % 3,
                t = MJ.GameLogic.PlayerModel.playersInfo;
              for (var i in t)
                if (t.hasOwnProperty(i)) {
                  var a = t[i].viewSeatID;
                  if (this.nDingQueTip[a] && a !== g_tConst.GameConfig.ViewSeat.SeatMine)
                    for (var o = this.nDingQueTip[a].childrenCount, n = 0; n < o; n++)
                      this.nDingQueTip[a].children[n].active = n <= e;
                }
            },
            onCustomEvent: function () {
              (this.node.on(
                "ON_START_DING_QUE",
                function (e) {
                  (this.initUIPos(),
                    (this._recQueColor = e.nDefaultColor),
                    (this.nodeDingQue.active = !0),
                    (this.nodeChoose.active = !0),
                    (this.spMyQueShow.node.active = !1),
                    e.NoticeLabel && (this.NoticeLabel.string = e.NoticeLabel),
                    (this._time = -1),
                    this.unschedule(this.updateTime));
                  var t = MJ.GameLogic.PlayerModel.playersInfo;
                  for (var i in t)
                    if (t.hasOwnProperty(i)) {
                      var a = t[i];
                      if (a.userID !== g_oPlatform.getUserId()) {
                        var o = a.viewSeatID;
                        this.nDingQueTip[o] && (this.nDingQueTip[o].active = !0);
                      }
                    }
                  (this.schedule(this.updateTime, 1, cc.macro.REPEAT_FOREVER),
                    this.removeRecQueAnim());
                  var n = g_oPrefabLoader.instantiate(this.queAnims[0]),
                    s = n.getComponent(cc.Animation);
                  ((s.node.active = !0), this.wanBtn.addChild(n));
                  var r = g_oPrefabLoader.instantiate(this.queAnims[1]),
                    c = r.getComponent(cc.Animation);
                  ((c.node.active = !0), this.tiaoBtn.addChild(r));
                  var l = g_oPrefabLoader.instantiate(this.queAnims[2]),
                    g = l.getComponent(cc.Animation);
                  ((g.node.active = !0),
                    this.tongBtn.addChild(l),
                    1 == this._recQueColor
                      ? s.play()
                      : 2 == this._recQueColor
                        ? c.play()
                        : 3 == this._recQueColor && g.play());
                },
                this,
              ),
                this.node.on(
                  "UPDATE_DQ_COUNT_DOWN",
                  function (e) {
                    this.updateCountDown(e);
                  },
                  this,
                ),
                this.node.on(
                  "ON_PLAYER_QUE_ALL",
                  function () {
                    this.close();
                  },
                  this,
                ),
                this.node.on(
                  "PLAYER_QUE_COMP",
                  function (e) {
                    this.completeQueAction(e);
                  },
                  this,
                ));
            },
            completeQueAction: function (e) {
              var t = e.seatId;
              if (t >= 0) {
                this.nDingQueTip[t] && (this.nDingQueTip[t].active = !1);
                var i = !0;
                if (t === g_tConst.GameConfig.ViewSeat.SeatMine) {
                  var a = e.color;
                  ((this.nodeChoose.active = !1),
                    this.unschedule(this.countDownAction),
                    (this.spMyQueShow.node.active = !0),
                    (this.spMyQueShow.spriteFrame = this.queSpriteFrame[a - 1]),
                    (i = !1));
                }
                this.DingQueCompTip[t] && (this.DingQueCompTip[t].active = i);
              }
            },
            removeRecQueAnim: function () {
              for (var e = this.wanBtn.childrenCount, t = 0; t < e; t++)
                if (this.wanBtn.children[t]) {
                  var i = this.wanBtn.children[t].getComponent(cc.Animation);
                  i && i.node.destroy();
                }
              for (var a = this.tiaoBtn.childrenCount, o = 0; o < a; o++)
                if (this.tiaoBtn.children[o]) {
                  var n = this.tiaoBtn.children[o].getComponent(cc.Animation);
                  n && n.node.destroy();
                }
              for (var s = this.tongBtn.childrenCount, r = 0; r < s; r++)
                if (this.tongBtn.children[r]) {
                  var c = this.tongBtn.children[r].getComponent(cc.Animation);
                  c && c.node.destroy();
                }
            },
            resetUI: function () {
              ((this.nodeDingQue.active = !1),
                this.unschedule(this.updateTime),
                this.removeRecQueAnim());
            },
            updateCountDown: function (e) {
              if (
                !(
                  MJ.GameLogic.TableModel.IsDiyRoom() ||
                  (this.unschedule(this.countDownAction), this._TimeNum > 0)
                )
              ) {
                var t = e.nCountDownTime,
                  i = t - 1;
                (i = (i > 0 && i) || 0) <= 0
                  ? (this.NoticeNumLabel.node.active = !1)
                  : ((this.NoticeNumLabel.string = t.toString()),
                    (this.NoticeNumLabel.node.active = !0),
                    (this._TimeNum = t),
                    this.schedule(this.countDownAction, 1, i));
              }
            },
            countDownAction: function () {
              if (
                (this._TimeNum--,
                (this.NoticeNumLabel.string = this._TimeNum.toString()),
                this._TimeNum <= 0)
              )
                return (
                  (this.NoticeNumLabel.string = "0"),
                  (this.NoticeNumLabel.node.active = !1),
                  void this.unschedule(this.countDownAction)
                );
            },
            updateMineChooseQueNodeLayout: function () {
              var e = g_oData.get(g_tData.LiveGameModel).isLivePlayer();
              this.spMyQueShow.node.position = e ? cc.v2(0, -92) : cc.v2(0, -155);
            },
            initUIPos: function () {
              var e = this.nodeChoose;
              if (e) {
                var t = e.position;
                if (((t.y = 0), MJ && MJ.GameViewHandler._handOffsets)) {
                  var i = (MJ.GameViewHandler._handOffsets[0] || {}).y || 0;
                  t.y = i || 0;
                }
                e.setPosition(t);
              }
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
