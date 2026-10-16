    FanGatherEntry: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "080caJW76hLELxHRuBHVOoo", "FanGatherEntry"),
          cc.Class({
            extends: Cls_BaseView,
            properties: { redNode: cc.Node, _entry: "", _nGameType: 0 },
            Awake: function () {
              var e = this;
              (this.node.on("refreshShow", this.onRefreshShow, this),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.REFRESH_FAN_GATHER_VIEW,
                    function () {
                      e.init();
                    },
                    this,
                  ),
                ));
            },
            onInit: function (e) {
              ((this._entry = e), this.init());
            },
            onRefreshShow: function (e) {
              ((this._nGameType = e.nGameType),
                e.show
                  ? ((this.node.active = !0), (this.node.parent.active = !0), this.init())
                  : ((this.node.active = !1), (this.node.parent.active = !1)));
            },
            init: function () {
              if (!g_oData.get(g_tData.FanGatherMod).checkShowFanGatherEntry())
                return ((this.node.active = !1), void (this.node.parent.active = !1));
              var e = 0;
              ("tableSelf" == this._entry &&
                0 != this._nGameType &&
                (e =
                  this._nGameType == g_tConst.GameTypeCfgs.SESXMJ.TYPEID
                    ? 2
                    : this._nGameType == g_tConst.GameTypeCfgs.XLHZMJ2.TYPEID
                      ? 4
                      : this._nGameType == g_tConst.GameTypeCfgs.SGMJ2.TYPEID
                        ? 5
                        : 1),
                (this.redNode.active = g_oData.get(g_tData.FanGatherMod).checkShowEntryRed(e)));
            },
            onClickEntry: function () {
              (g_oData.get(g_tData.FanGatherMod).reportShowView(),
                0 != this._nGameType &&
                  g_oData.get(g_tData.FanGatherMod).reportShowViewGameType(this._nGameType),
                g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.FanGather.id, "ON_INIT", {
                  entry: this._entry,
                  nGameType: this._nGameType,
                }));
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
