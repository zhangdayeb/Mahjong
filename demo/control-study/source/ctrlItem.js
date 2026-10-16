    ctrlItem: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "401d4he9UJNuZ1KBox4ToiS", "ctrlItem"),
          cc.Class({
            extends: Cls_BaseView,
            properties: {
              btnBody: cc.Sprite,
              _nBlockType: 0,
              _sBlockInfos: [],
              _voiceOrderHandle: [],
            },
            Awake: function () {},
            setBtn: function (e) {
              switch (((this._nBtnType = e), this._nBtnType)) {
                case g_tConst.BlockBtnType.Gang:
                  this._voiceOrderHandle.push(
                    g_oEvent.addEventListener(
                      g_tEvent.MOD_VOICEORDER_ORDER_GANG,
                      this.onClicked,
                      this,
                    ),
                  );
                  break;
                case g_tConst.BlockBtnType.Pass:
                  this._voiceOrderHandle.push(
                    g_oEvent.addEventListener(
                      g_tEvent.MOD_VOICEORDER_ORDER_GUO,
                      this.onClicked,
                      this,
                    ),
                  );
                  break;
                case g_tConst.BlockBtnType.Hu:
                  this._voiceOrderHandle.push(
                    g_oEvent.addEventListener(
                      g_tEvent.MOD_VOICEORDER_ORDER_HU,
                      this.onClicked,
                      this,
                    ),
                  );
                  break;
                case g_tConst.BlockBtnType.Pong:
                  this._voiceOrderHandle.push(
                    g_oEvent.addEventListener(
                      g_tEvent.MOD_VOICEORDER_ORDER_PENG,
                      this.onClicked,
                      this,
                    ),
                  );
                  break;
                case g_tConst.BlockBtnType.Chow:
                  (this._voiceOrderHandle.push(
                    g_oEvent.addEventListener(
                      g_tEvent.MOD_VOICEORDER_ORDER_CHI,
                      this.onClicked,
                      this,
                    ),
                  ),
                    this._voiceOrderHandle.push(
                      g_oEvent.addEventListener(
                        g_tEvent.MOD_VOICEORDER_ORDER_CHI_CHOOSE,
                        this.onClicked,
                        this,
                      ),
                    ));
                  break;
                case g_tConst.BlockBtnType.Ting:
                  this._voiceOrderHandle.push(
                    g_oEvent.addEventListener(
                      g_tEvent.MOD_VOICEORDER_ORDER_TIN,
                      this.onClicked,
                      this,
                    ),
                  );
              }
              this.initBtn(this._nBtnType);
            },
            setBtnBlockType: function (e) {
              this._nBlockType = e;
            },
            getBtnBlockType: function () {
              return this._nBlockType;
            },
            setBtnBlockInfos: function (e) {
              this._sBlockInfos = e;
            },
            getBtnType: function (e) {
              var t = MJ.BlockMgr.getBlockCfgByType(e);
              return t ? t.BtnType : -1;
            },
            initBtn: function (e) {
              for (var t = g_tAsset.ctrlItemAnimsConfig, i = 0; i < t.length; i++) {
                var a = t[i],
                  o = a.BtnType,
                  n = a.name;
                if (o === e)
                  return ((this.btnBody.node.active = !1), void this.playBtnAnimation(n));
              }
              this.btnBody.node.active = !0;
            },
            playBtnAnimation: function (e, t) {
              var i = this,
                a = function (e) {
                  t && (e.scale = t);
                  var a = cc.v2(0, 67);
                  ((e.position = a),
                    (i.btnBody.node.active = !0),
                    i.btnBody.node.addChild(e),
                    (i.btnBody.enabled = !1),
                    (e.active = !0));
                  var o = e.getComponent(cc.Animation);
                  o && o.play();
                },
                o = g_tAsset.ctrlItemAnimsAnimPath + e;
              g_oPrefabLoader.loadRes(o, null, function (e) {
                a(e);
              });
            },
            onClicked: function () {
              Log.info("BIRD >>>", "ctrlItem.js", "onClicked");
              var e = {
                nType: this._nBlockType,
                aBlockInfos: this._sBlockInfos,
                nBtnType: this._nBtnType,
              };
              switch (this._nBlockType) {
                case g_tConst.BlockCfgs.BlockLiangDao.BlockType:
                  return void this.showKouTile();
                case g_tConst.BlockCfgs.BlockTing.BlockType:
                  return (
                    MJ.GameViewHandler.tileModule.emit("TING_ACTION", e),
                    void this.showSubItemTing(e)
                  );
                case g_tConst.BlockCfgs.BlockKaoXiang.BlockType:
                  this.onClickKaoXiang(e);
                  break;
                case g_tConst.BlockCfgs.BlockMingPai.BlockType:
                  break;
                case g_tConst.BlockCfgs.BlockSelfDrawForCrazy.BlockType:
                case g_tConst.BlockCfgs.BlockWinKongForCrazy.BlockType:
                case g_tConst.BlockCfgs.BlockDiscardWinForCrazy.BlockType:
                case g_tConst.BlockCfgs.BlockWinAfterKongForCrazy.BlockType:
                  return void this.reqHuForCrazyMode();
                default:
                  if (this._nBtnType === g_tConst.BlockBtnType.Dan) return void this.onClickDan(e);
                  if (this._sBlockInfos.length > 1) this.showSubItem(e);
                  else if (1 === this._sBlockInfos.length)
                    switch (this._nBlockType) {
                      case g_tConst.BlockCfgs.BlockPass.BlockType:
                        this.reqPass(this._nBlockType);
                        break;
                      default:
                        var t = this._sBlockInfos[0].stBlockCard;
                        if (t.length > 1) this.showSubItem(e);
                        else {
                          var i = t[0].iCards;
                          this.reqBlock(this._nBlockType, i);
                        }
                    }
              }
            },
            onClickKaoXiang: function (e) {
              var t = this;
              this.showSubItem(e);
              var i = this._sBlockInfos.filter(function (e) {
                return e.eBlockType === t._nBlockType;
              })[0];
              if (!isNull(i)) {
                var a = i.stBlockCard.map(function (e) {
                  return e.iCards;
                });
                MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_MASK", {
                  bMask: !0,
                  nViewSeatId: g_tConst.GameConfig.ViewSeat.SeatMine,
                  enbleCtrlTile: function (e) {
                    for (var t = 0; t < a.length; t++) if (a[t].includes(e)) return !1;
                    return !0;
                  },
                });
              }
            },
            onClose: function () {
              if (0 !== this._voiceOrderHandle.length) {
                for (var e = 0; e < this._voiceOrderHandle.length; e++)
                  (g_oEvent.removeEventListener(this._voiceOrderHandle[e]),
                    (this._voiceOrderHandle[e] = null));
                this._voiceOrderHandle = [];
              }
            },
            onDisable: function () {
              if (0 !== this._voiceOrderHandle.length) {
                for (var e = 0; e < this._voiceOrderHandle.length; e++)
                  (g_oEvent.removeEventListener(this._voiceOrderHandle[e]),
                    (this._voiceOrderHandle[e] = null));
                this._voiceOrderHandle = [];
              }
            },
            onClickDan: function (e) {
              var t = new cc.Event.EventCustom("SHOW_DAN_SUB_ITEM", !0);
              (t.setUserData({ nBtnType: e.nBtnType }), this.node.dispatchEvent(t));
            },
            showSubItem: function (e) {
              var t = new cc.Event.EventCustom("SHOW_SUB_ITEM", !0);
              (t.setUserData({ aSubCtrlInfos: e }), this.node.dispatchEvent(t));
            },
            showSubItemTing: function (e) {
              var t = new cc.Event.EventCustom("SHOW_SUB_ITEM_TING", !0);
              (t.setUserData({ aSubCtrlInfos: e }), this.node.dispatchEvent(t));
            },
            reqBlock: function (e, t) {
              var i = new cc.Event.EventCustom("REQ_BLOCK", !0);
              (i.setUserData({ nType: e, aTileValues: t }), this.node.dispatchEvent(i));
            },
            showKouTile: function () {
              var e = new cc.Event.EventCustom("SHOW_KOU_TILE_LAYER", !0);
              (e.setUserData({ aHuKouTiles: this._sBlockInfos }), this.node.dispatchEvent(e));
            },
            reqHuForCrazyMode: function () {
              var e = this._sBlockInfos[0].stBlockCard,
                t = [];
              (e.forEach(function (e) {
                e.iCards.forEach(function (e) {
                  t.push(e);
                });
              }),
                this.reqBlock(this._nBlockType, t));
            },
            reqPass: function (e) {
              var t = e,
                i = MJ.GameLogic.TileModel.getLeftDrawTilesNum(
                  g_tConst.GameConfig.ViewSeat.SeatMine,
                ),
                a = MJ.GameLogic.TableModel.isInCrazyMode;
              i > 0 && a ? MJ.GameLogic.reqDisCard(-1, !1) : this.reqBlock(t);
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
