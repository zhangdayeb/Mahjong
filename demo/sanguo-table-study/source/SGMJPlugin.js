    SGMJPlugin: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "5d7156IRgJOL4lUKdi9zuD9", "SGMJPlugin");
        var i = e("BasePlugin"),
          a = e("tileLogicHelper");
        (cc.Class({
          extends: i,
          properties: { isShowUnique: !0 },
          init: function () {
            (this._super(), this.addRuleEventListener("SET_HAND_TILE_TAG", this.setHandTileTag));
            var e = MJ.GameLogic.TableModel.getGameBGSoundPath();
            (g_oAudioManager.playBGMByPriority(e),
              this.addRuleEventListener("RESET_MAX_TILE_COUNT", this.resetMaxTileCount),
              this.setTileFront());
          },
          onGameEnd: function (e) {
            this._super(e, { nLiujuMode: 2 });
            var t = [].concat(e.stPlayerEnv),
              i = g_tConst.eAnimTime.GameEnd,
              a = {
                nTagType: g_tConst.eTileTag.LaiziTile,
                enbleTileTag: function (e) {
                  return MJ.GameLogic.TileModel.aGuiPai.includes(e);
                },
                stPlayerEnv: t,
              };
            this.scheduleOnce(function () {
              MJ &&
                MJ.GameViewHandler &&
                cc.isValid(MJ.GameViewHandler.tileModule) &&
                MJ.GameViewHandler.tileModule.emit("SET_ALL_OPEN_TILE_TAG", a);
            }, i.DelayShow);
          },
          setHandTileTag: function () {
            var e = {
              nTagType: g_tConst.eTileTag.LaiZi_R,
              nViewSeatId: g_tConst.GameConfig.ViewSeat.SeatMine,
              enbleTileTag: function (e) {
                return MJ.GameLogic.TileModel.aGuiPai.includes(e);
              },
            };
            (Log.info("!>XLHZPlugin setHandTileTag", e.nTagType),
              MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_TAG", e));
          },
          onChangeTurn: function (e) {
            if ((this._super(e), e.nViewSeatId === g_tConst.GameConfig.ViewSeat.SeatRight)) {
              var t = MJ.GameLogic.TileModel.getHandTileValues();
              t &&
                t[g_tConst.GameConfig.ViewSeat.SeatMine] &&
                g_oData.get(g_tData.mod_DataCom).isShowSGTileTip() &&
                g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.SGGameTip.id,
                  "SHOW_SGTILE_TIP",
                );
            }
          },
          onDiscardResult: function (e) {
            (this._super(e),
              MJ.GameLogic.PlayerModel.getViewSeatId(e.seatID) ===
                g_tConst.GameConfig.ViewSeat.SeatMine && this.closeSGGameTip());
          },
          onBlockResult: function (e) {
            var t = this;
            (this._super(e),
              e.stBlockRspContent.forEach(function (e) {
                var i = e.eBlockType;
                MJ.GameLogic.TableModel.isShowFanXingAnimBlock(i) && t.blockHuAniFuc(e);
              }));
            for (var i = 0; i < e.stBlockRspContent.length; i++) {
              var a = e.stBlockRspContent[i];
              if (
                MJ.GameLogic.PlayerModel.getViewSeatId(a.seatID) ===
                g_tConst.GameConfig.ViewSeat.SeatMine
              )
                return void this.closeSGGameTip();
            }
          },
          onNotifyBlock: function (e) {
            if (
              (this._super(e),
              MJ.GameLogic.PlayerModel.getViewSeatId(e.seatID) ===
                g_tConst.GameConfig.ViewSeat.SeatMine)
            ) {
              var t = g_tConst.BlockCfgs,
                i = !1;
              (e.stBlockInfo.find(function (e) {
                var a = e.eBlockType;
                if (
                  a === t.BlockTypeTreasureDig.BlockType ||
                  a === t.BlockTypeTreasureDigForCrazy.BlockType
                )
                  return (
                    g_oData.get(g_tData.mod_DataCom).isShowSGTreasureTip() &&
                      ((i = !0),
                      g_oExLayerManager.emitEvent2GameLayer(
                        g_tConst.GameExLayerCfg.SGGameTip.id,
                        "SHOW_TREASURE_TIP",
                      )),
                    !0
                  );
              }),
                i || this.closeSGGameTip());
            }
          },
          onNotifyDiscard: function (e) {
            (this._super(e),
              MJ.GameLogic.PlayerModel.getViewSeatId(e.seatID) ===
                g_tConst.GameConfig.ViewSeat.SeatMine && this.closeSGGameTip());
          },
          openTilesSort: function (e) {
            var t = [],
              i = [];
            return (
              e.forEach(function (e) {
                -1 !== MJ.GameLogic.TileModel.aGuiPai.indexOf(e) ? t.push(e) : i.push(e);
              }),
              t.concat(i).concat([])
            );
          },
          openAnimTilesTag: function (e) {
            var t = function (e) {
              return MJ.GameLogic.TileModel.aGuiPai.includes(e);
            };
            e.forEach(function (e) {
              var i = e.getComponent("ZMJTile");
              t &&
                t(i.tileValue) &&
                e.emit("SET_TILE_TAG", { nTagType: g_tConst.eTileTag.LaiziTile });
            });
          },
          getDefHuAniName: function () {
            return "ex_bigHu_SanGuo";
          },
          checkUniqueTile: function (e) {
            return this.isShowUnique && 114 === e;
          },
          getUniqueCardAsset: function () {
            return g_tAsset.SESXUniquePaibeiTex;
          },
          closeSGGameTip: function () {
            var e = g_tConst.GameExLayerCfg.SGGameTip.id;
            (g_oExLayerManager.isLayerShow(e) || g_oExLayerManager.isLayerLoading(e)) &&
              g_oExLayerManager.emitEvent2GameLayer(e, "CLOSE_VIEW");
          },
          resetMaxTileCount: function () {
            MJ.GameLogic.PlayerModel.nMaxTileCount = 14;
          },
          showMatchingAnim: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.SGMatchingAnim.id, "ON_INIT", []);
          },
          setTileFront: function () {
            MJ.GameViewHandler.updateTileFront(2);
          },
          checkReqDisCard: function (e) {
            var t = this._super(e);
            return (a.isColorOf(g_tConst.MJColor.SGBao, e) && (t.isSimulate = !1), t);
          },
        }),
          cc._RF.pop());
      },
      { BasePlugin: "BasePlugin", tileLogicHelper: "tileLogicHelper" },
    ],
