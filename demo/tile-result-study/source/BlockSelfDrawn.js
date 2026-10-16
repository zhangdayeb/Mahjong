    BlockSelfDrawn: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "9ad2dMsoWFJ3ZRBOw7Gfc7k", "BlockSelfDrawn");
        var i = e("BlockBase");
        (cc.Class({
          extends: i,
          properties: {},
          onLoad: function () {
            this.onCustomEvent();
          },
          onNotify: function (e) {
            (g_oExLayerManager.emitEvent2GameLayer(
              g_tConst.GameExLayerCfg.UserCtrl.id,
              "ADD_CTRL",
              e,
            ),
              this._oGameLogic.setDiscardViewSeatId(g_tConst.GameConfig.ViewSeat.SeatMine));
          },
          onResult: function (e) {
            var t = this._oPlayerModel.getViewSeatId(e.iSrcSeatID),
              i = this._oPlayerModel.getViewSeatId(e.seatID),
              a = this.isUniversalCardBlock(e),
              o = e.card,
              n = e.eBlockType;
            (MJ.BlockMgr.doMingPaiBlockRst(e, [o]),
              this._oTileModel.onPlayerZiMo(i, o, t),
              this._oGameLogic.updateTingTip(i, o),
              this._oGameLogic.setDiscardViewSeatId(-1),
              this._oTileModel.onPlayerHuVirtualStatus(i, e.iHuCardVirtualStatus, t));
            var s = {
                nBlockType: n,
                nViewSeatId: i,
                nHuTileValue: o,
                bIsZiMo: !0,
                nLastViewSeatId: t,
                nBlockCount: e.nBlockCount,
                iHuCardVirtualStatus: e.iHuCardVirtualStatus,
                isYiPaoDuoXiang: e.isYiPaoDuoXiang,
                isUniversalCard: a,
                huDelIndex: e.index,
              },
              r = 0;
            (e.needAddCtrl && (r = g_tConst.OrderedAnimType.ZiMo.time),
              MJ.GameAnimMgr.orderedPlayAnim(
                function () {
                  (g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.GameAnim.id,
                    "ANIM_ZIMO",
                    s,
                  ),
                    MJ.GameViewHandler.tileModule.emit("HU_TILE", s));
                },
                { playDesc: "\u64ad\u653e\u80e1\u52a8\u753b", pauseGameLoop: r },
              ));
          },
          start: function () {},
          onCustomEvent: function () {},
        }),
          cc._RF.pop());
      },
      { BlockBase: "BlockBase" },
    ],
