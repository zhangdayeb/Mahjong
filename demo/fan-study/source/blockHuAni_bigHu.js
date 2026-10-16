    blockHuAni_bigHu: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "400b70Zfh9Hoo149droNv2z", "blockHuAni_bigHu");
        var i = e("blockHuAniBase");
        (cc.Class({
          extends: i,
          properties: { sgFnt: cc.Font },
          onLoad: function () {
            if (MJ.GameLogic.TableModel.isSGMJ())
              for (var e = 0, t = this.fanxingLabel.length; e < t; e++)
                this.fanxingLabel[e].font = this.sgFnt;
          },
        }),
          cc._RF.pop());
      },
      { blockHuAniBase: "blockHuAniBase" },
    ],
