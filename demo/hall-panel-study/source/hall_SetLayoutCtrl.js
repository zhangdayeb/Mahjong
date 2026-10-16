    hall_SetLayoutCtrl: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "6bb22HHN+VGTK/l73KQ9YPF", "hall_SetLayoutCtrl"),
          cc.Class({
            extends: cc.Component,
            properties: {
              layoutLeft: {
                default: null,
                type: cc.Layout,
                tooltip: "\u5de6\u677f\u5757\u5e03\u5c40",
              },
              layoutRight: {
                default: null,
                type: cc.Layout,
                tooltip: "\u53f3\u677f\u5757\u5e03\u5c40",
              },
              layoutBottom: {
                default: null,
                type: cc.Layout,
                tooltip: "\u5e95\u90e8\u6309\u94ae\u5e03\u5c40",
              },
              nodeSilence: cc.Node,
            },
            onLoad: function () {
              (this.adjustLayout(),
                this.layoutLeft.node.on(cc.Node.EventType.SIZE_CHANGED, this.adjustLayout, this),
                this.layoutRight.node.on(cc.Node.EventType.SIZE_CHANGED, this.adjustLayout, this));
            },
            adjustLayout: function () {
              var e = 0;
              (this.layoutLeft.node.children.forEach(function (t) {
                e = t.active ? ++e : e;
              }),
                this.layoutRight.node.children.forEach(function (t) {
                  e = t.active ? ++e : e;
                }),
                e <= 4 ? this.onFourItemLayout() : this.onFiveItemLayout());
            },
            onFourItemLayout: function () {
              ((this.layoutRight.node.y = this.layoutLeft.node.y = 100),
                (this.layoutRight.spacingY = this.layoutLeft.spacingY = 70),
                (this.layoutBottom.node.y = -132));
            },
            onFiveItemLayout: function () {
              ((this.layoutRight.node.y = this.layoutLeft.node.y = 100),
                (this.layoutRight.spacingY = this.layoutLeft.spacingY = 36),
                (this.layoutBottom.node.y = -132));
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
