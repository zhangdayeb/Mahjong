    GDPlayerHSZView: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "3b46dY9WzNM0btFl29NluvG", "GDPlayerHSZView"),
          new cc.color(95, 95, 95, 255),
          new cc.color(255, 255, 255, 255));
        var i = e("HSZView_TeamCtrl");
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            nodeHszTip: {
              default: null,
              type: cc.Node,
              tooltip: "\u6362\u4e09\u5f20\u6309\u94ae\u63d0\u793a",
            },
            buttonHsz: { default: null, type: cc.Button, tooltip: "HSZ\u6309\u94ae" },
            nodePlayerHszStatus: {
              default: [],
              type: cc.Node,
              tooltip: "\u73a9\u5bb6\u6362\u4e09\u5f20\u72b6\u6001,0:1,1:2,2:3",
            },
            nodeAnimLayer: {
              default: null,
              type: cc.Node,
              tooltip: "\u684c\u9762\u65cb\u8f6c\u52a8\u753bNode",
            },
            nodeArrTile: { default: [], type: [cc.Node], tooltip: "HSZ\u65cb\u8f6c\u9ebb\u5c06" },
            nodeArrowsAnim: {
              default: null,
              type: cc.Node,
              tooltip: "\u7bad\u5934\u65cb\u8f6c\u52a8\u753b\u8282\u70b9",
            },
            img_AllCorlorWord: { default: null, type: cc.Node, tooltip: "" },
            img_SameCorlorWord: { default: null, type: cc.Node, tooltip: "" },
            prefabAnime: cc.Prefab,
            HSZView_TeamCtrl: { default: null, type: i },
            n_normalRoot: cc.Node,
            n_2v2Root: cc.Node,
            TimeLabel: {
              default: null,
              type: cc.Label,
              tooltip: "\u786e\u5b9a\u6309\u94ae\u6587\u5b57label",
            },
            _TimeNum: -1,
          },
          Awake: function () {
            (this.updateAllPlayerNodeLayout(),
              this.node.on("SELECT_HAND_TILE", this.onSelectHandTile, this),
              this.node.on("ON_START_PLAYER_HSZ", this.onStartHSZ, this),
              this.node.on("ON_PLAYER_HSZ_RST", this.onPlayerHSZRst, this),
              this.node.on("PLAY_HSZ_ANIM", this.onNotifyHSZResult, this),
              this.node.on("CLOSE_HSZ", this.closeHSZ, this),
              this.initUI());
          },
          initUI: function () {
            for (var e = 0; e < this.nodePlayerHszStatus.length; e++)
              this.nodePlayerHszStatus[e].active = !1;
            ((this.nodeHszTip.active = !1),
              (this.nodeAnimLayer.active = !1),
              (this.nodeArrowsAnim.active = !1),
              (this.n_normalRoot.active = !1),
              (this.n_2v2Root.active = !1));
            for (var t = 0; t < this.nodeArrTile.length; t++) this.nodeArrTile[t].active = !1;
            ((this.img_AllCorlorWord.active = !1), (this.img_SameCorlorWord.active = !1));
          },
          _isSameColor: function (e) {
            for (
              var t = function (e) {
                  return (240 & e) >> 4;
                },
                i = !0,
                a = 1;
              a < e.length;
              a++
            )
              if (t(e[a - 1]) !== t(e[a])) {
                i = !1;
                break;
              }
            return i;
          },
          _isThreeSelected: function (e) {
            return 3 === e.length;
          },
          _isEnableClick: function (e) {
            var t = this._isSameColor(e),
              i = this._isThreeSelected(e);
            return (
              this._bAllColor ||
                (t ||
                  g_oLayerManager.emitEvent2Dlg(
                    g_tConst.GameLayerCfg.TipsLayer.id,
                    "SHOW_NORMAL_TIP",
                    {
                      tipMsg: "\u8bf7\u9009\u62e9\u4e09\u5f20 \u540c\u82b1\u8272 \u624b\u724c~",
                      showTime: 1.2,
                      posType: "bottom",
                    },
                  ),
                (i = t && i)),
              i
            );
          },
          listenStart: function () {
            g_oData.get(g_tData.mod_VoiceOrder).listenStart();
          },
          onSelectHandTile: function (e) {
            Log.warn(">>>>>>>onSelectHandTile", e);
            var t = e.selectTiles.slice(),
              i = this._isEnableClick(t);
            ((this.buttonHsz.interactable = i), (this.buttonHsz.node.scale = 1));
            var a,
              o = this._isSameColor(t);
            ((t.length > 3 || (!this._bAllColor && !o)) &&
              ((a = new cc.Event.EventCustom("SELECT_TOO_MANY_TILES", !0)).setUserData({
                lastSelectTile: e.lastHitTileIndex,
              }),
              this.node.dispatchEvent(a),
              (t = [e.lastHitTileValue])),
              this.HSZView_TeamCtrl.onSelectHandTile({ isEnableClick: i, selectTiles: t }));
          },
          onStartHSZ: function (e) {
            (this.initUIPos(),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.MOD_VOICEORDER_ORDER_HUAN,
                  this.onVoiceHuan,
                  this,
                ),
              ),
              g_oData.get(g_tData.SwitchModel).sub.voiceOrder.isAutoAwake("HSZ") &&
                this.scheduleOnce(this.listenStart, 1.42),
              (this._eChangeMode = e.eChangeMode),
              (this.nodeAnimLayer.active = !0));
            var t = [g_tConst.GameConfig.ViewSeat.SeatMine];
            if (
              ((this._bAllColor = e.bAllColor),
              (this.img_AllCorlorWord.active = this._bAllColor),
              (this.img_SameCorlorWord.active = !this._bAllColor),
              e.isTeam)
            ) {
              var i = e.MeDefaultCards,
                a = e.MemberDefaultCards,
                o = e.MemberVSid,
                n = e.ActTime;
              (this.HSZView_TeamCtrl.onStartHSZ({
                MeDefaultCards: i,
                MemberDefaultCards: a,
                ActTime: n,
              }),
                (this.n_2v2Root.active = !0),
                (t = [g_tConst.GameConfig.ViewSeat.SeatMine, o]));
            } else
              ((this.nodeHszTip.active = !0),
                (this.n_normalRoot.active = !0),
                this.updateCountDown(e.ActTime));
            var s = MJ.GameLogic.PlayerModel.playersInfo;
            for (var r in s)
              if (s.hasOwnProperty(r)) {
                var c = s[r].viewSeatID;
                this.nodePlayerHszStatus[c] &&
                  !t.includes(c) &&
                  (this.nodePlayerHszStatus[c].active = !0);
              }
          },
          onPlayerHSZRst: function (e) {
            var t = MJ.GameLogic.PlayerModel.getViewSeatId(e.seatID);
            ((this.nodePlayerHszStatus[t].active = !1),
              g_oMJNetManger.pauseGameLoop("\u663e\u793a\u6362\u4e09\u5f203D\u624b\u52bf"),
              g_oData
                .get(g_tData.hand3DMod)
                .playHSZHandAnim({ seatID: t, nodeArrTile: this.nodeArrTile }),
              e.seatID === MJ.GameLogic.PlayerModel.mySeatID &&
                (this.unschedule(this.listenStart), (this.nodeHszTip.active = !1)));
          },
          onNotifyHSZResult: function (e) {
            var t = this,
              i = e.detail.rotationDuration;
            ((t.nodeHszTip.active = !1),
              t.nodeArrowsAnim.removeAllChildren(),
              (t.nodeArrowsAnim.active = !0),
              g_oPrefabLoader
                .instantiate(t.prefabAnime, t.nodeArrowsAnim)
                .emit("PLAY_HSZ_CHANGE_ANIME", { mode: t._eChangeMode }),
              t.node.runAction(
                cc.sequence(
                  cc.delayTime(i),
                  cc.callFunc(function () {
                    t.close();
                  }),
                ),
              ));
            for (var a = 0; a < this.nodePlayerHszStatus.length; a++)
              this.nodePlayerHszStatus[a].active = !1;
            var o = MJ.GameLogic.PlayerModel.playersInfo;
            for (var n in o)
              if (o.hasOwnProperty(n)) {
                var s = o[n].viewSeatID;
                this.nodeArrTile[s] && (this.nodeArrTile[s].active = !0);
              }
            this.HSZView_TeamCtrl.onNotifyHSZResult(e);
          },
          onVoiceHuan: function (e) {
            var t = e.slice();
            (MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_SELECT", {
              nViewSeatId: g_tConst.GameConfig.ViewSeat.SeatMine,
              isSelectTile: function (e) {
                if (t.includes(e)) {
                  var i = t.indexOf(e);
                  return ((t[i] = -1), !0);
                }
                return !1;
              },
            }),
              this.onClickHSZ());
          },
          onClickHSZ: function () {
            if (g_oData.get(g_tData.GameTeachMod).CheckShowIsAutoLayer())
              g_oEvent.dispatchEvent(g_tEvent.TEACH_CLICK);
            else {
              var e = new cc.Event.EventCustom("HSZ_TRY_CONFIRM", !0);
              this.node.dispatchEvent(e);
            }
          },
          updateCountDown: function (e) {
            if (!MJ.GameLogic.TableModel.IsDiyRoom() && 0 != this.nodeHszTip.active) {
              this.unschedule(this.countDownAction);
              var t = e - 1;
              (t = (t > 0 && t) || 0) <= 0
                ? (this.nodeHszTip.active = !1)
                : ((this.TimeLabel.string = "\u540c\u610f(" + e + ")"),
                  (this._TimeNum = e),
                  this.schedule(this.countDownAction, 1, t));
            }
          },
          countDownAction: function () {
            if (
              (this._TimeNum--,
              (this.TimeLabel.string = "\u540c\u610f(" + this._TimeNum + ")"),
              this._TimeNum <= 0)
            )
              return (
                (this.TimeLabel.string = "\u540c\u610f"),
                void this.unschedule(this.countDownAction)
              );
          },
          updateAllPlayerNodeLayout: function () {
            var e = g_oData.get(g_tData.LiveGameModel).isLivePlayer(),
              t = this.n_2v2Root.getChildByName("imgBg2v2"),
              i = this.nodeArrTile[0],
              a = this.nodeArrTile[1],
              o = this.nodeArrTile[2],
              n = this.nodeArrTile[3];
            e
              ? (!isNull(t) && (t.position = cc.v2(0, 95)),
                (this.nodeHszTip.position = cc.v2(0, -50.5)),
                (i.position = cc.v2(0, -82)),
                (a.position = cc.v2(-278, 86.5)),
                (o.position = cc.v2(0, 232)),
                (n.position = cc.v2(278, 86.5)))
              : (!isNull(t) && (t.position = cc.v2(0, 27)),
                (this.nodeHszTip.position = cc.v2(0, -135)),
                (i.position = cc.v2(0, -145)),
                (a.position = cc.v2(-271, 25)),
                (o.position = cc.v2(0, 220)),
                (n.position = cc.v2(275, 25)));
          },
          initUIPos: function () {
            var e = this.n_normalRoot;
            if (e) {
              var t = e.position;
              if (((t.y = 0), MJ && MJ.GameViewHandler._handOffsets)) {
                var i = (MJ.GameViewHandler._handOffsets[0] || {}).y || 0;
                t.y = i || 0;
              }
              e.setPosition(t);
            }
          },
          closeHSZ: function () {
            this.nodeHszTip.active = !1;
          },
        }),
          cc._RF.pop());
      },
      { HSZView_TeamCtrl: "HSZView_TeamCtrl" },
    ],
