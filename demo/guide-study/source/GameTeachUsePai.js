    GameTeachUsePai: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "fcdfcuG+eVNcrtr5Ftg2u/m", "GameTeachUsePai"),
          cc.Class({
            extends: cc.Component,
            properties: {
              lab: cc.Label,
              picNode: { default: null, type: cc.Node, tooltip: "\u724c" },
              nFront: { default: null, type: cc.Node, tooltip: "\u6b63\u9762\u724c" },
              mjAtlas: cc.SpriteAtlas,
            },
            onInit: function (e, t) {
              switch (t) {
                case 0:
                  this.lab.string = "1-9\u4e07 \u5404\u56db\u5f20";
                  break;
                case 1:
                  this.lab.string = "1-9\u6761 \u5404\u56db\u5f20";
                  break;
                case 2:
                  this.lab.string = "1-9\u7b52 \u5404\u56db\u5f20";
                  break;
                case 3:
                  this.lab.string = "\u765e\u5b50\u4e07\u80fd\u724c \u5171\u56db\u5f20";
              }
              (this.picNode.removeAllChildren(), (this.position = cc.v2(0, 0)));
              for (var i = 0; i < e.length; i++) {
                var a = e[i];
                this.show(a);
              }
            },
            show: function (e) {
              var t;
              t = this.nFront;
              var i = cc.instantiate(t);
              ((i.active = !0),
                (i.parent = this.picNode),
                (i.position = this.position),
                (this.position.x += i.width + 5),
                (i.getChildByName("spBg").getComponent(cc.Sprite).spriteFrame =
                  this.mjAtlas.getSpriteFrame(g_tConst.TemplatePicTileMap[302])),
                (i.getChildByName("spValue").getComponent(cc.Sprite).spriteFrame =
                  this.mjAtlas.getSpriteFrame(g_tConst.TemplatePicTileMap[e])),
                (i.getChildByName("laizi").active = 81 == e));
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
