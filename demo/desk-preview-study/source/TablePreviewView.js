    TablePreviewView: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "63baaxS1XVMMJjGnxBgldB9", "TablePreviewView"),
          cc.Class({
            extends: Cls_BaseView,
            properties: {
              deskPreview: cc.Node,
              deskPreviewLoad: cc.Node,
              deskPreviewUI: cc.Node,
              deskPreviewCampassLoad: cc.Node,
              deskPreviewCampassDefault: cc.Node,
              _isLoadingDesk: !1,
              wgt_close: cc.Widget,
            },
            Awake: function () {
              (this.onCustomEvent(),
                this.onMessageEvent(),
                cc.winSize.width >= 1380 &&
                  ((this.wgt_close.left = (cc.winSize.width - 1380) / 2),
                  this.wgt_close.updateAlignment()));
            },
            onCustomEvent: function () {
              this.node.on("ON_INIT", this.onInit, this);
            },
            onMessageEvent: function () {},
            onInit: function (e) {
              ((this.deskPreview.active = !1),
                (this.deskPreviewUI.active = !1),
                (this._isLoadingDesk = !0),
                (this.deskPreviewCampassDefault.active = !0));
              var t = this;
              g_oPrefabLoader.loadRes(
                g_tAsset.GameDeskPrefabPath + e.PrefabName,
                this.deskPreviewLoad,
                function (e) {
                  (e && ((t._isLoadingDesk = !1), (t.deskPreviewUI.active = !0)),
                    (t.deskPreview.active = !0),
                    (t.deskPreviewUI.active = !0));
                },
              );
              var i = g_tConst.GameDeskCfg[e.id + ""];
              if (i && i.customCountdown) {
                var a = this,
                  o = g_tAsset.CountdownPrefabPath + i.customCountdown,
                  n = this.deskPreviewCampassLoad;
                g_oPrefabLoader.loadRes(o, null, function (e) {
                  e &&
                    (cc.isValid(n) && n.children.length > 0 && n.removeAllChildren(),
                    (e.parent = n),
                    (a.deskPreviewCampassDefault.active = !1));
                });
              }
            },
            onClickClose: function () {
              this.close();
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
