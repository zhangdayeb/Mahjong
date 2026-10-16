    gameHandAnimBase: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "ebeaenEFTJJ9IPU8pHQkHzQ", "gameHandAnimBase"),
          e("Direction"),
          cc.Class({
            extends: cc.Component,
            properties: { skeletonAnimation: cc.SkeletonAnimation },
            offListener: function () {
              this.skeletonAnimation.off("finished");
            },
          }),
          cc._RF.pop());
      },
      { Direction: "Direction" },
    ],
