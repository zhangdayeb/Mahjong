    hallShopDeskItem: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "0b15cPYAlFKuaaekDl0dABl", "hallShopDeskItem"),
          cc.Class({
            extends: cc.Component,
            properties: {
              deskIcon: cc.Sprite,
              tagIcon: cc.Sprite,
              itemName: cc.Label,
              lessDiamond: cc.Label,
              owned: cc.Node,
              sealed: cc.Node,
              n_btnBg: cc.Node,
              btnFreeUse: cc.Node,
            },
            onInit: function (e, t, i) {
              ((this._data = e),
                (this._index = t),
                (this._viewCtrl = i),
                g_oData
                  .get(g_tData.mod_Bag)
                  .loadItemIcon(this.deskIcon, e.localCfg.id, e.localCfg));
              var a = g_oData.get(g_tData.mod_Bag).getItemRareLevel(e.localCfg.id);
              (g_oData.get(g_tData.mod_Bag).loadItemRareIcon(this.tagIcon, a),
                (this.itemName.string = e.localCfg.name),
                this.updateByStatus());
            },
            onClickItem: function () {
              !this._data.isSealed &&
                this._ownedStatus <= 0 &&
                g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.ShopPropZF.id, "ON_INIT", {
                  data: this._data,
                  diamondNum: parseInt(this.lessDiamond.string),
                });
            },
            onClickFreeUse: function () {
              if (this._viewCtrl) {
                var e = g_oData.get(g_tData.mod_Bag).getVideoRewardCfg();
                if (isNull(e)) g_oData.get(g_tData.mod_Bag).reqVideoRewardCfg();
                else {
                  var t = this,
                    i = this._viewCtrl,
                    a = {
                      Scene: g_tConst.ShareConfig.ShareScene.hall,
                      Module: g_tConst.ShareConfig.ShareModule.HallShop,
                      SubModule: g_tConst.ShareConfig.ShareSubModule.HallShopDesk,
                      ShareType: g_tConst.ShareConfig.ShareType.HallShopDesk,
                      AdScene: g_tConst.AwardAdPID.HallShopDesk,
                      enbleSubGuide: !0,
                      cbSuc: function () {
                        if (cc.isValid(i)) {
                          var e = g_tConst.BagGoodIdBaseNum + t._data.localCfg.id;
                          g_oData.get(g_tData.mod_Bag).reqReceiveVideoReward(e, t._data.localCfg);
                        }
                      },
                    };
                  ((this._viewCtrl._invokeType = g_tConst.InvokeType.Video),
                    this._viewCtrl.invokeAD(a));
                }
              }
            },
            onClickShowPre: function () {
              g_oLayerManager.emitEvent2Dlg(
                g_tConst.GameLayerCfg.TablePreview.id,
                "ON_INIT",
                this._data.localCfg,
              );
            },
            updateByStatus: function () {
              if (
                ((this.lessDiamond.node.parent.active = !1),
                (this.owned.active = !1),
                (this.sealed.active = !1),
                (this.btnFreeUse.active = !1),
                (this.n_btnBg.active = !1),
                this._data.isSealed)
              )
                this.sealed.active = !0;
              else {
                var e = this.getOwnStatus();
                ((this._ownedStatus = e),
                  (this.btnFreeUse.active = e < 0),
                  1 == e
                    ? (this.owned.active = !0)
                    : ((this.lessDiamond.node.parent.active = !0),
                      (this.n_btnBg.active = !0),
                      this._data.zfArr.sort(function (e, t) {
                        return e.gameGold - t.gameGold;
                      }),
                      (this.lessDiamond.string = this.getLessDiamond(this._data.zfArr))));
              }
            },
            getLessDiamond: function (e) {
              for (var t = e[0].gameGold, i = 1; i < e.length; i++)
                e[i].gameGold < t && (t = e[i].gameGold);
              return t;
            },
            getOwnStatus: function () {
              var e = -1,
                t = g_oData.get(g_tData.mod_Bag).getServerGoodCfgs();
              if (Array.isArray(t))
                for (var i = 0; i < t.length; i++)
                  if (t[i].id == this._data.localCfg.id) {
                    ((e = 0), g_oData.get(g_tData.mod_Bag).isForever(t[i]) && (e = 1));
                    break;
                  }
              return e;
            },
            updateItem: function () {
              if (Array.isArray(this._data.zfArr))
                for (var e = 0; e < this._data.zfArr.length; e++) this.updateByStatus();
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
