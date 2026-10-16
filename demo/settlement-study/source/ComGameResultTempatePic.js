    ComGameResultTempatePic: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "7c006oUamJJe7BZwNc19788", "ComGameResultTempatePic"),
          e("tileLogicHelper"),
          cc.Class({
            extends: Cls_BaseView,
            properties: {
              nNull: cc.Node,
              nFront: cc.Node,
              nBack: cc.Node,
              mjAtlas: cc.SpriteAtlas,
              picNode: cc.Node,
            },
            Awake: function () {},
            show: function (e) {
              var t = this;
              this.picNode.removeAllChildren();
              for (
                var i = 8,
                  a = !1,
                  o = function (e, o) {
                    var n,
                      r = e < 1e3;
                    n = (e %= 1e3) > 0 ? t.nFront : 0 == e ? t.nBack : t.nNull;
                    var c = cc.instantiate(n);
                    if (((c.active = !0), (c.parent = t.picNode), o)) {
                      var l = s.x - c.width;
                      ((c.position = cc.v2(l, 9)), (c.x += 8));
                    } else ((c.position = s), (s.x += c.width));
                    if (e > 0) {
                      c.getChildByName("spBg").getComponent(cc.Sprite).spriteFrame =
                        t.mjAtlas.getSpriteFrame(
                          r ? g_tConst.TemplatePicTileMap[301] : g_tConst.TemplatePicTileMap[302],
                        );
                      var g = c.getChildByName("spValue");
                      g.y = r ? 0 : 8;
                      var d;
                      ((d =
                        MJ.GameLogic.TableModel.isSGMJ() && g_tConst.SGMJ_TemplatePicTileMap[e]
                          ? g_tConst.SGMJ_TemplatePicTileMap[e]
                          : g_tConst.TemplatePicTileMap[e]),
                        (g.getComponent(cc.Sprite).spriteFrame = t.mjAtlas.getSpriteFrame(d)));
                    } else
                      0 == e &&
                        (c.getComponent(cc.Sprite).spriteFrame = t.mjAtlas.getSpriteFrame(
                          r ? g_tConst.TemplatePicTileMap[201] : g_tConst.TemplatePicTileMap[202],
                        ));
                    (a && ((c.x += 7), (a = !1)), o && (a = !0), (c.x -= i), (i += 8));
                  },
                  n = e.split("#"),
                  s = cc.v2(-this.node.width / 2, 0),
                  r = 0,
                  c = 0;
                c < n.length;
                c++
              ) {
                for (var l = n[c].split("|"), g = l.length, d = l.length - 1; d >= 0; d--)
                  "" == l[d] && l.splice(d, 1);
                for (
                  var h = function (e) {
                      if ("" == l[e]) return "continue";
                      var i = Number(l[e]),
                        a = 4 == g && 2 == e && 0 != c;
                      (t.scheduleOnce(function () {
                        o(i, a);
                      }, r),
                        (r += 0.02));
                    },
                    u = 0;
                  u < l.length;
                  u++
                )
                  h(u);
              }
            },
          }),
          cc._RF.pop());
      },
      { tileLogicHelper: "tileLogicHelper" },
    ],
