    WelfareItem: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "4e29ei5ZiZE46K0IgMccXDH", "WelfareItem"),
          cc.Class({
            extends: Cls_BaseView,
            properties: { ShowIcon: cc.Sprite, TitleLabel: cc.Label, SubLabel: cc.Label },
            initItem: function (e, t, i) {
              (void 0 === e && (e = ""),
                void 0 === t && (t = ""),
                void 0 === i && (i = null),
                (this.TitleLabel.string = e),
                (this.SubLabel.string = t),
                this.__updateShowIcon(i));
            },
            __updateShowIcon: function (e) {
              (void 0 === e && (e = null), isNull(e) || (this.ShowIcon.spriteFrame = e));
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
