    ProvinceGameTypeItem: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "299708YcHtGW4HUo7KESy65", "ProvinceGameTypeItem");
        (cc.Class({
          extends: Cls_BaseCtrl,
          properties: {
            spBg: {
              default: null,
              type: cc.Sprite,
              tooltip: "\u5730\u677f\u80cc\u666f\u7684\u7eb9\u7406\u7ec4\u4ef6",
            },
            spfBgs: {
              default: [],
              type: [cc.SpriteFrame],
              tooltip:
                "\u73a9\u6cd5\u5730\u677f\u7684\u5404\u79cd\u5e95\u56fe\uff0c\u4ece0\u52307\u5206\u522b\u7531\u5de6\u5230\u53f3\uff0c\u7531\u4e0a\u5230\u4e0b",
            },
            labGameType: { default: null, type: cc.Label, tooltip: "\u73a9\u6cd5\u540d\u79f0" },
            labOnlinePlayer: {
              default: null,
              type: cc.Label,
              tooltip: "\u8be5\u73a9\u6cd5\u7684\u5728\u7ebf\u4eba\u6570",
            },
            nodeHotTag: {
              default: null,
              type: cc.Node,
              tooltip: "\u70ed\u95e8\u6807\u7b7e\u7684\u8282\u70b9",
            },
            _ClickItemCb: null,
          },
          onLoad: function () {
            this.buildSpfBgsAfter8order();
          },
          start: function () {},
          buildSpfBgsAfter8order: function () {},
          init: function (e) {
            (this.buildSpfBgsAfter8order(),
              (this._nGameType = e.nGameType),
              (this._sName = e.sName),
              this._updateUI(e),
              (this.itemIdx = e.index),
              (this._ClickItemCb = e.clickItemCb || null));
          },
          _updateUI: function (e) {
            ((this.nodeHotTag.active = 4 === e.iTag),
              this._updateNameLab(e.sName),
              this._updateBg(e.index),
              this._updateOnlinePlayer(),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.UPDATE_ONLINE_PLAYER_NUMBERS,
                  this._updateOnlinePlayer,
                  this,
                ),
              ));
          },
          _updateNameLab: function (e) {
            switch (e) {
              case "\u8840\u6d41\u6210\u6cb3\u6362\u4e09\u5f20":
                this.labGameType.string = "\u8840\u6d41\u6362\u4e09\u5f20";
                break;
              case "\u8840\u6218\u5230\u5e95\u6362\u4e09\u5f20":
                this.labGameType.string = "\u8840\u6218\u6362\u4e09\u5f20";
                break;
              case "\u8840\u6d41\u7ea2\u4e2d\u9ebb\u5c06":
                this.labGameType.string = "\u8840\u6d41\u7ea2\u4e2d";
                break;
              default:
                this.labGameType.string = e;
            }
          },
          _updateBg: function (e) {
            this.spBg.spriteFrame =
              e < this.spfBgs.length ? this.spfBgs[e] : this.spfBgs[e % this.spfBgs.length];
          },
          _updateOnlinePlayer: function () {
            var e = g_oData.get(g_tData.mod_gamecfg).getGameTypeSceneCfgs(this._nGameType),
              t = g_oData.get(g_tData.RoomMod).getTotalPlayerCount(e);
            this.labOnlinePlayer.string = String(t) + "\u4eba";
          },
          onClickGameType: function () {
            (this._ClickItemCb && this._ClickItemCb(this.itemIdx),
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_TabelSel.id, "onInit", {
                nGameType: this._nGameType,
                sGameName: this._sName,
              }));
          },
        }),
          cc._RF.pop());
      },
      {},
    ],
