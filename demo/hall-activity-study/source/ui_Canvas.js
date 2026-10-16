    ui_Canvas: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "13d99NhMV1GbpiwE2AObdoO", "ui_Canvas"),
          cc.Class({
            editor: { menu: "ui/ui_Canvas" },
            extends: cc.Component,
            properties: {},
            onLoad: function () {
              if (!this.node.getComponent(cc.Widget)) {
                var e = this.node.addComponent(cc.Widget);
                ((e.isAlignLeft = !0),
                  (e.isAlignRight = !0),
                  (e.isAlignTop = !0),
                  (e.isAlignBottom = !0),
                  (e.left = 0),
                  (e.right = 0),
                  (e.top = 0),
                  (e.bottom = 0),
                  (e.alignMode = cc.Widget.AlignMode.ON_WINDOW_RESIZE),
                  e.updateAlignment());
              }
            },
            start: function () {},
          }),
          cc._RF.pop());
      },
      {},
    ],
