    BlockDiscardWin: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "59b2dpMlMJA57fVQYVAnb+B", "BlockDiscardWin");
        var i = e("BlockBase");
        (cc.Class({
          extends: i,
          properties: {},
          onLoad: function () {
            this.onCustomEvent();
          },
          onNotify: function (e) {
            g_oExLayerManager.emitEvent2GameLayer(
              g_tConst.GameExLayerCfg.UserCtrl.id,
              "ADD_CTRL",
              e,
            );
          },
          onResult: function (e, t) {
            var i = this._oPlayerModel.getViewSeatId(e.iSrcSeatID),
              a = this._oPlayerModel.getViewSeatId(e.seatID),
              o = e.card,
              n = e.eBlockType;
            (this._oTileModel.onPlayerHu(a, o, i, t),
              this._oTileModel.onPlayerHuVirtualStatus(a, e.iHuCardVirtualStatus, i));
            var s = {
                nBlockType: n,
                nViewSeatId: a,
                nHuTileValue: o,
                bIsZiMo: !1,
                nLastViewSeatId: i,
                nBlockCount: e.nBlockCount,
                isTransparent: t,
                iHuCardVirtualStatus: e.iHuCardVirtualStatus,
                isYiPaoDuoXiang: e.isYiPaoDuoXiang,
              },
              r = 0;
            (e.needAddCtrl && (r = g_tConst.OrderedAnimType.Hu.time),
              MJ.GameAnimMgr.orderedPlayAnim(
                function () {
                  (g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.GameAnim.id,
                    "ANIM_HU",
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
