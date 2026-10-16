    GameDeskView: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "d0bcescxTRKoq7qUlYTiRkh", "GameDeskView"),
          cc.Class({
            extends: Cls_Component,
            properties: { GameDeskType: 0, WaterMarkNode: cc.Node, DeskTextureNode: cc.Node },
            start: function () {
              this.initDesk();
            },
            initDesk: function () {
              this.WaterMarkNode &&
                (this.WaterMarkNode.active = g_tConst.ShowWaterMarkChannel.includes(
                  g_oPlatform.getChannel(),
                ));
              var e = this.getCurDeskCfg(this.GameDeskType);
              if (!isNull(e)) {
                var t = 1;
                if (e.prop && e.liveProp) {
                  var i =
                    g_oSceneLoader.getCurScene() === g_tConst.SceneCfgs.game &&
                    g_oData.get(g_tData.LiveGameModel).isLivePlayer()
                      ? e.liveProp
                      : e.prop;
                  ((t = i.deskTextureHeight / this.DeskTextureNode.height),
                    (this.DeskTextureNode.height = i.deskTextureHeight),
                    (this.DeskTextureNode.position = i.deskTexturePos),
                    (this.WaterMarkNode.position = i.waterMarkPos));
                }
                if (e.baseInfoColor && !this.node._closeUseDesk) {
                  var a = new cc.Color().fromHEX(e.baseInfoColor);
                  MJ &&
                    MJ.GameViewHandler &&
                    MJ.GameViewHandler.nodeDeskBaseInfo.emit("SET_TABLE_INFO_COLOR", a);
                }
                MJ &&
                  MJ.GameViewHandler &&
                  !this.node._closeUseDesk &&
                  MJ.GameViewHandler.node.emit("UPDATE_COUNT_DOWN_STYLE", {
                    customCountdown: e.customCountdown || "",
                    countdownYScale: t,
                    handOffsets: e.handOffsets || [],
                  });
              }
            },
            getCurDeskCfg: function (e) {
              return (void 0 === e && (e = 0), g_tConst.GameDeskCfg[e + ""] || null);
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
