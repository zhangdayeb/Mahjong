    userCtrlInterface: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "20c5bW4s0dJgaXcweznKLPb", "userCtrlInterface"),
          (t.exports = {
            createLayer: function (e, t) {
              g_oPrefabLoader.loadRes(
                g_tAsset.UserControlPrefab,
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
              control: cc.Node,
              subControl: cc.Node,
              nodePlayer: [cc.Node],
              ctrlBox: cc.Node,
            },
            Awake: function () {
              (this.updateAllNodeLayout(),
                this.onCustomEvent(),
                this.onMessageEvent(),
                (this._aBlockInfos = []),
                (this._aDanBlockInfos = []));
            },
            deleteTingBlockShow: function () {
              for (var e = !1, t = -1, i = 0; i < this._aBlockInfos.length; i++) {
                var a = this._aBlockInfos[i].eBlockType;
                a === g_tConst.BlockCfgs.BlockTing.BlockType
                  ? (t = i)
                  : (a !== g_tConst.BlockCfgs.BlockExposedKong.BlockType &&
                      a !== g_tConst.BlockCfgs.BlockConcealedKong.BlockType &&
                      a !== g_tConst.BlockCfgs.BlockPatchedKong.BlockType) ||
                    (e = !0);
              }
              (e && t >= 0 && this._aBlockInfos.splice(t, 1),
                this.control.getComponent("chooseCtrl").setCtrl(this._aBlockInfos));
            },
            onMessageEvent: function () {
              var e = this;
              this.autoDispose(
                g_oEvent.addEventListener(g_tEvent.UPDATE_COUNTDOWN_STYLE, function () {
                  e.initUIPos();
                }).this,
              );
            },
            onCustomEvent: function () {
              (this.node.on(
                "RESET_CTRL",
                function () {
                  ((this.control.active = !1),
                    (this.subControl.active = !1),
                    (this._aBlockInfos = []),
                    (this._aDanBlockInfos = []));
                },
                this,
              ),
                this.node.on(
                  "HIDE_CTRL",
                  function () {
                    ((this.control.active = !1), (this.subControl.active = !1));
                  },
                  this,
                ),
                this.node.on(
                  "SHOW_TILE_CTRL",
                  function () {
                    (this.control.getComponent("chooseCtrl").setCtrl(this._aBlockInfos),
                      (this.control.active = !0),
                      (this.subControl.active = !1),
                      this.initUIPos());
                  },
                  this,
                ),
                this.node.on(
                  "SHOW_TILE_CTRL_UPDATE",
                  function (e) {
                    var t = this.control.getComponent("chooseCtrl");
                    t && t.showCardInfo(e);
                  },
                  this,
                ),
                this.node.on(
                  "SHOW_BLOCK_CHOOSE_FINGER",
                  function (e) {
                    var t = this.control.getComponent("chooseCtrl");
                    t && t.showFinger(e.nBlockType);
                  },
                  this,
                ),
                this.node.on(
                  "SHOW_TING_CANCEL",
                  function () {
                    (this.deleteTingBlockShow(),
                      (this.control.active = !0),
                      (this.subControl.active = !1));
                  },
                  this,
                ),
                this.node.on(
                  "SHOW_SUB_ITEM_TING",
                  function (e) {
                    var t = e.detail.aSubCtrlInfos;
                    ((this.control.active = !1),
                      (this.subControl.active = !0),
                      this.subControl.getComponent("subChooseCtrl").setTingCancelInfo(t));
                  },
                  this,
                ),
                this.node.on(
                  "SHOW_SUB_ITEM",
                  function (e) {
                    var t = e.detail.aSubCtrlInfos;
                    ((this.control.active = !1),
                      (this.subControl.active = !0),
                      this.subControl.getComponent("subChooseCtrl").setSubCtrl(t));
                  },
                  this,
                ),
                this.node.on(
                  "ADD_CTRL",
                  function (e) {
                    (Log.info("ADD_CTRL:" + JSON.stringify(e), e), this._aBlockInfos.push(e));
                  },
                  this,
                ),
                this.node.on(
                  "ADD_DAN_SUB_ITEM",
                  function (e) {
                    this._aDanBlockInfos.push(e);
                  },
                  this,
                ),
                this.node.on(
                  "SHOW_DAN_SUB_ITEM",
                  function (e) {
                    var t = e.detail.nBtnType;
                    g_oLayerManager.emitEvent2Dlg(
                      g_tConst.GameLayerCfg.DanChooseLayer.id,
                      "SHOW_DAN_ITEMS",
                      { aDanBlockInfos: this._aDanBlockInfos, nBtnType: t },
                    );
                  },
                  this,
                ),
                this.node.on(
                  "RESTORE_TILE_CTRL",
                  function () {
                    ((this.control.active = !0), (this.subControl.active = !1));
                  },
                  this,
                ),
                this.node.on(
                  "RESTORE_SUB_CTRL",
                  function () {
                    this.control.getComponent("chooseCtrl").closeShowInfo();
                  },
                  this,
                ));
            },
            updateAllNodeLayout: function () {
              g_oData.get(g_tData.LiveGameModel).isLivePlayer()
                ? ((this.control.position = cc.v2(333, -158)),
                  (this.subControl.position = cc.v2(386.5, -90)))
                : ((this.control.position = cc.v2(333, -230)),
                  (this.subControl.position = cc.v2(386.5, -162)));
            },
            initUIPos: function () {
              if (this.ctrlBox) {
                var e = this.ctrlBox.position;
                if (((e.y = 0), MJ && MJ.GameViewHandler._handOffsets)) {
                  var t = (MJ.GameViewHandler._handOffsets[0] || {}).y || 0;
                  e.y = t || 0;
                }
                this.ctrlBox.setPosition(e);
              }
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
