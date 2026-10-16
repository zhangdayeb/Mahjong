    RuleHSZ: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "cd946/qJxFGAqsi7nRhfkL3", "RuleHSZ");
        var i = e("RuleBase"),
          a = e("RuleHSZ_TeamHelper"),
          o = e("CommonUtils");
        (cc.Class({
          extends: i,
          properties: {},
          init: function () {
            ((this.TeamHelper = new a(this)), this.onMessageEvent(), this.onCustomEvent());
          },
          reset: function () {
            this.TeamHelper.reset();
          },
          statics: {
            layers: function () {
              return [g_tConst.GameExLayerCfg.GDHSZ];
            },
          },
          events: function () {
            return {
              1501: ["MaJiang.TCmdC2SRequestChangeCard"],
              1511: ["MaJiang.TCmdC2SRequestSelectChangeCard"],
              1610: [
                "MaJiang.TCmdS2CResponseChangeCard",
                this.onResponseChangeCard.bind(this),
                "\u786e\u5b9a\u6362\u724c",
              ],
              1613: [
                "MaJiang.TCmdS2CNotifySelectChangeCard",
                this.onNotifySelectChangeCard.bind(this),
                "\u9009\u62e9\u8981\u6362\u7684\u724c",
              ],
              1701: [
                "MaJiang.TCmdS2CNotifyChangeCard",
                this.onNotifyChangeCard.bind(this),
                "\u5f00\u59cb\u6362\u4e09\u5f20",
              ],
              1702: [
                "MaJiang.TCmdS2CNotifyChangeCardRst",
                this.onNotifyChangeCardRst.bind(this),
                "\u6362\u4e09\u5f20\u7ed3\u679c",
              ],
            };
          },
          onResponseChangeCard: function (e) {
            (Log.info("RuleHSZ.js onResponseChangeCard"),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.GDHSZ.id,
                "ON_PLAYER_HSZ_RST",
                e,
              ),
              e.seatID === MJ.GameLogic.PlayerModel.mySeatID &&
                MJ.GameViewHandler.tileModule.emit("ON_HSZ_ACTION", e),
              this.isTeam() && this.TeamHelper.onResponseChangeCard(e));
          },
          onNotifySelectChangeCard: function (e) {
            (Log.info("RuleHSZ.js onNotifySelectChangeCard"),
              this.isTeam() && this.TeamHelper.onNotifySelectChangeCard(e));
          },
          onNotifyChangeCard: function (e, t) {
            if ((Log.info("RuleHSZ.js onNotifyChangeCard"), this.isTeam()))
              this.TeamHelper.onNotifyChangeCard(e, t);
            else {
              var i = e.iDefaultChangeCards || [],
                a =
                  t ||
                  MJ.GameLogic.GameParams.getActTime(g_tConst.GameConfig.TimeParams.InitHandsCards);
              this.launchChangeCard(i.slice(), a, {
                eChangeMode: e.eChangeMode,
                isTeam: !1,
                bAllColor: e.bAllColor,
                ActTime: a,
              });
            }
          },
          reqChangeCard: function (e) {
            (Log.info("RuleHSZ.js reqChangeCard "),
              this.reqRuleMsg(1501, { iChangeCards: e }),
              MJ.GameViewHandler.nodeCountDown.emit("UPDATE_CURRENT_SEAT", { nCurViewSeatId: -1 }));
          },
          reqSelectCard: function (e) {
            (Log.info("RuleHSZ.js reqSelectCard"), this.reqRuleMsg(1511, { iSelectCards: e }));
          },
          onNotifyChangeCardRst: function (e) {
            this.isTeam() ? this.TeamHelper.onNotifyChangeCardRst(e) : this.launchChangeCardRst(e);
          },
          onMessageEvent: function () {},
          onCustomEvent: function () {
            (MJ.GameViewHandler.onDelegateEvent(
              "PLAY_HSZ_ANIM",
              function (e) {
                g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.GDHSZ.id,
                  "PLAY_HSZ_ANIM",
                  e,
                );
              },
              this,
            ),
              MJ.GameViewHandler.onDelegateEvent(
                "SELECT_HAND_TILE",
                function (e) {
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.GDHSZ.id,
                    "SELECT_HAND_TILE",
                    e.detail,
                  );
                },
                this,
              ),
              MJ.GameViewHandler.onDelegateEvent(
                "SELECT_TOO_MANY_TILES",
                function (e) {
                  MJ.GameViewHandler.tileModule.emit("ONLY_SELECT_ONE_TILE", {
                    nlastSelectIndex: e.detail.lastSelectTile,
                  });
                },
                this,
              ),
              MJ.GameViewHandler.onDelegateEvent(
                "HSZ_TRY_CONFIRM",
                function () {
                  MJ.GameViewHandler.tileModule.emit("HSZ_TRY_CONFIRM");
                },
                this,
              ),
              MJ.GameViewHandler.onDelegateEvent(
                "HSZ_REQ_UPT_SELECT",
                function (e) {
                  this.isTeam() && this.TeamHelper.reqSelectCard(e);
                },
                this,
              ),
              MJ.GameViewHandler.onDelegateEvent(
                "HSZ_REQ_PLAYER",
                function (e) {
                  var t = e.detail;
                  this.reqChangeCard(t);
                },
                this,
              ));
          },
          onEnterGame: function (e) {
            var t = this;
            if ((Log.info("RuleHSZ.js onEnterGame"), this.isTeam())) this.TeamHelper.onEnterGame(e);
            else if (e.iGameStatus != g_tConst.GameConfig.TableStatus.Free)
              if (e.iGameStatus === g_tConst.GameConfig.TableStatus.HSZ) {
                var i = MJ.GameLogic.PlayerModel.mySeatID,
                  a = e.stPlayerEnv
                    .map(function (e) {
                      return e.stTurnStatus.eTurnStatus === g_tConst.GameConfig.TurnStatus.ChangeOff
                        ? 1
                        : 0;
                    })
                    .reduce(function (e, t) {
                      return e + t;
                    });
                if (
                  (Log.info("BIRD >>>", "RuleHSZ.js", "onEnterGame completePlayerNum " + a),
                  a < e.stPlayerEnv.length)
                ) {
                  var n = o.getPlayerData(e.stPlayerEnv, g_oPlatform.getUserId()),
                    s = g_oData.get(g_tData.sdkLogin).serverTime - n.stTurnStatus.iStartTime,
                    r =
                      MJ.GameLogic.GameParams.getActTime(
                        g_tConst.GameConfig.TimeParams.InitHandsCards,
                      ) - s;
                  (Log.info("RuleHSZ.js \u81ea\u884c\u8c03\u7528 onNotifyChangeCard"),
                    this.onNotifyChangeCard(
                      {
                        iDefaultChangeCards: n.stTurnStatus.iDefaultChangeCard,
                        eChangeMode: e.reEnterInfo.eChangeMode,
                        bAllColor: e.reEnterInfo.bAllColor,
                        seatID: i,
                      },
                      r,
                    ),
                    e.stPlayerEnv.forEach(function (e) {
                      e.stTurnStatus.eTurnStatus === g_tConst.GameConfig.TurnStatus.ChangeOff &&
                        (Log.info("RuleHSZ.js \u81ea\u884c\u8c03\u7528 onNotifyChangeCard"),
                        t.onResponseChangeCard({
                          seatID: e.seatID,
                          iChangeCards: e.stTurnStatus.iDefaultChangeCard,
                        }));
                    }));
                }
              } else g_oExLayerManager.hide2Dlg(g_tConst.GameExLayerCfg.GDHSZ.id);
          },
          launchChangeCard: function (e, t, i) {
            (g_oExLayerManager.emitEvent2GameLayer(
              g_tConst.GameExLayerCfg.GDHSZ.id,
              "ON_START_PLAYER_HSZ",
              i,
            ),
              MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_ENBLE_MUL_SELECT", {
                enbleMulSelect: !0,
                MeUnSelectInfo: i.MeUnSelectInfo,
              }),
              MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_SELECT", {
                nViewSeatId: g_tConst.GameConfig.ViewSeat.SeatMine,
                isSelectTile: function (t) {
                  if (e.includes(t)) {
                    var i = e.indexOf(t);
                    return ((e[i] = -1), !0);
                  }
                  return !1;
                },
              }),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.GDHSZ.id,
                "ON_START_PLAYER_HSZ",
                i,
              ),
              MJ.GameViewHandler.nodeCountDown.emit("UPDATE_COUNT_DOWN", {
                nCurViewSeatId: MJ.GameLogic.PlayerModel.getViewSeatId(
                  MJ.GameLogic.PlayerModel.mySeatID,
                ),
                nCountDownTime: t,
              }));
          },
          launchChangeCardRst: function (e) {
            var t = e.iAfterChangeCard,
              i = e.iChangeCard,
              a = g_tConst.GameConfig.ViewSeat.SeatMine,
              o = MJ.GameLogic.TileModel;
            o.__delHandTiles(a, i);
            var n = o.mHandTileValues;
            ((n[a] = n[a].concat(t)),
              MJ.GameViewHandler.tileModule.emit("ON_NOTIFY_HSZ_RESULT", e),
              MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_ENBLE_MUL_SELECT", {
                enbleMulSelect: !1,
                MeUnSelectInfo: e.MeUnSelectInfo,
              }),
              g_oMJNetManger.autoGameLoop("ON_NOTIFY_HSZ_RESULT", 1.5),
              MJ.GameViewHandler.nodeCountDown.emit("UPDATE_COUNT_DOWN", {
                nCurViewSeatId: -1,
                nCountDownTime: -1,
              }));
          },
          isTeam: function () {
            return 50103 === this.getID();
          },
        }),
          cc._RF.pop());
      },
      {
        CommonUtils: "CommonUtils",
        RuleBase: "RuleBase",
        RuleHSZ_TeamHelper: "RuleHSZ_TeamHelper",
      },
    ],
