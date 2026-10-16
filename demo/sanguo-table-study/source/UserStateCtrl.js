    UserStateCtrl: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "b69e2e8kf9PQrMhRUerdwY7", "UserStateCtrl"),
          e("CommonUtils"),
          (t.exports = {
            createLayer: function (e, t) {
              g_oPrefabLoader.loadRes(
                g_tAsset.UserStateLayer,
                t,
                function (t) {
                  void 0 !== e && e(t);
                },
                g_oEnvMgr.Env,
              );
            },
          }),
          cc.Class({
            extends: Cls_BaseCtrl,
            properties: {
              spUserState: [cc.Sprite],
              nReadyAni: [cc.Node],
              sfUserState: [cc.SpriteFrame],
              UserMoreHuState: [cc.SpriteFrame],
              UserMoreZiMoState: [cc.SpriteFrame],
              _IsHadHuArr: [],
            },
            Awake: function () {
              (this.updateAllPlayerNodeLayout(),
                this.onCustomEvent(),
                this.ajustMineReadyStatePos());
            },
            start: function () {},
            onCustomEvent: function () {
              (this.node.on(
                "SHOW_READY_STATE",
                function (e) {
                  var t = e,
                    i = t.nViewSeatId,
                    a = t.isReady;
                  if (a && !MJ.GameLogic.isGameStart()) {
                    if (this.nReadyAni[i]) {
                      i === g_tConst.GameConfig.ViewSeat.SeatMine && this.ajustMineReadyStatePos();
                      for (var o = 0; o < 4; o++) this.spUserState[o].node.active = !1;
                      this.nReadyAni[i].active = a;
                      var n = this.nReadyAni[i].getComponent(cc.Animation);
                      ((n.node.active = !0), n.play(), n.on("finished", function () {}, this));
                    }
                  } else 1 != a && (this.nReadyAni[i].getComponent(cc.Animation).node.active = !1);
                },
                this,
              ),
                this.node.on(
                  "SHOW_GIVEUP_STATE",
                  function (e) {
                    this.showGiveUpState(e);
                  },
                  this,
                ),
                this.node.on(
                  "SHOW_PLAYER_PAY",
                  function (e) {
                    e.nViewSeatID;
                  },
                  this,
                ),
                this.node.on(
                  "SHOW_HU_STATE",
                  function (e) {
                    this.showHuState(e);
                  },
                  this,
                ),
                this.node.on(
                  "HIDE_STATE",
                  function (e) {
                    var t = e.nViewSeatId;
                    this.nReadyAni[t] &&
                      ((this.nReadyAni[t].active = !1),
                      (this.spUserState[t].node.active = !1),
                      this.node.stopAllActions());
                  },
                  this,
                ),
                this.node.on(
                  "HIDE_ALL",
                  function () {
                    this._IsHadHuArr = [];
                    for (var e = 0; e < 4; e++)
                      ((this.spUserState[e].node.active = !1), (this.nReadyAni[e].active = !1));
                  },
                  this,
                ),
                this.node.on(
                  "TO_BE_SHOW",
                  function (e) {
                    this.checkIsNeedShow(e);
                  },
                  this,
                ));
            },
            checkIsNeedShow: function (e) {
              (void 0 === e && (e = !1), (this.node.opacity = e ? 255 : 0));
            },
            ajustMineReadyStatePos: function () {
              MJ.GameLogic.TableModel.IsDiyRoom()
                ? (this.nReadyAni[g_tConst.GameConfig.ViewSeat.SeatMine].y = -95)
                : (this.nReadyAni[g_tConst.GameConfig.ViewSeat.SeatMine].y = -195);
            },
            showGiveUpState: function (e) {
              var t = e.nViewSeatID;
              e.isGiveUp &&
                ((this.spUserState[t].node.active = !0),
                (this.spUserState[t].spriteFrame = this.sfUserState[2]),
                g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.GameMenu.id,
                  "IS_SHOW_WAIT_CHARGE",
                  !1,
                ));
            },
            showHuState: function (e) {
              var t = e.isHu,
                i = e.nViewSeatId;
              -1 == this._IsHadHuArr.indexOf(i) &&
                null != t &&
                0 != t &&
                (this._IsHadHuArr.push(i),
                this.node.runAction(
                  cc.sequence(
                    cc.delayTime(1.2),
                    cc.callFunc(function () {
                      var t = e,
                        i = t.nViewSeatId;
                      if (t.isHu) {
                        if (
                          MJ.GameLogic._gameParams.getPlayMod() ===
                          g_tConst.GameConfig.playMod.XueZhan
                        ) {
                          var a = t.huInfo;
                          if (a) {
                            var o = a.blockType,
                              n = a.index;
                            this.spUserState[i].spriteFrame =
                              1 == o
                                ? this.UserMoreHuState[n]
                                : 2 == o
                                  ? this.UserMoreZiMoState[n]
                                  : this.sfUserState[1];
                          }
                        } else this.spUserState[i].spriteFrame = this.sfUserState[1];
                        this.spUserState[i].node.active = !0;
                      } else this.spUserState[i].node.active = !1;
                    }, this),
                  ),
                ));
            },
            updateAllPlayerNodeLayout: function () {
              var e = g_oData.get(g_tData.LiveGameModel).isLivePlayer(),
                t = this.nReadyAni[0],
                i = this.spUserState[0];
              e
                ? ((t.position = cc.v2(0, -125)), (i.node.position = cc.v2(0, -125)))
                : ((t.position = cc.v2(0, -195)), (i.node.position = cc.v2(0, -195)));
            },
          }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils" },
    ],
