    CustomTreasureMain: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "4190aZaZhNDcbYS/dtkEDU/", "CustomTreasureMain");
        var i = e("AlertDlgBaseView");
        (cc.Class({
          extends: i,
          properties: { leftItems: cc.Node, rightItems: cc.Node, itemPrefab: cc.Prefab },
          Awake: function () {
            ((this._closeReleaseRes = !0), this.onCustomEvent(), this.onMessageEvent());
          },
          start: function () {
            (this._super(), g_oData.get(g_tData.CustomTreasureMod).reportShowView(0));
          },
          onCustomEvent: function () {
            this.node.on("ON_INIT", this.onInit, this);
          },
          onMessageEvent: function () {},
          onInit: function () {
            var e = g_oData.get(g_tData.CustomTreasureMod).getMainShowCfg();
            if (Array.isArray(e) && e.length > 0) {
              for (var t = e.length, i = t / 2, a = 0; a < i; a++)
                this.loadItem(a, e[a], this.leftItems);
              for (var o = i; o < t; o++) this.loadItem(o, e[o], this.rightItems);
            }
          },
          loadItem: function (e, t, i) {
            var a = g_oPrefabLoader.instantiate(this.itemPrefab, i);
            if (a) {
              var o = a.getComponent("CustomTreasureMainItem");
              o && o.onInit && o.onInit(e, t, this);
            }
          },
          onClickStartChoose: function () {
            (g_oLayerManager.emitEvent2Dlg(
              g_tConst.GameLayerCfg.CustomTreasureChoose.id,
              "ON_INIT",
            ),
              this.close());
          },
          onClickClose: function () {
            this.close();
          },
        }),
          cc._RF.pop());
      },
      { AlertDlgBaseView: "AlertDlgBaseView" },
    ],
