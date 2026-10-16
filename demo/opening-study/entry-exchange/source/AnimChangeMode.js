    AnimChangeMode: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "e44fb9PD79GC6fq1lXLd2MO", "AnimChangeMode");
        var i = e("CommonUtils");
        (cc.Class({
          extends: cc.Component,
          properties: {
            wordSprite: cc.Sprite,
            n_memberChange: cc.Node,
            wordSF: [cc.SpriteFrame],
            node_word: cc.Node,
            node_rotate: cc.Node,
            node_opposite: cc.Node,
          },
          onLoad: function () {
            var e = this;
            this.node.on(
              "PLAY_HSZ_CHANGE_ANIME",
              function (t) {
                var a;
                switch (
                  ((e.node_word.active = !0),
                  MJ.GameLogic.TableModel.IsBattleRoom()
                    ? ((e.n_memberChange.active = !0),
                      (e.wordSprite.node.active = !1),
                      (e.n_memberChange.getComponentInChildren(cc.Label).string = (a = [
                        "2V2\u6a21\u5f0f\u4e2d\uff0c\u961f\u53cb\u4e4b\u95f4\u76f8\u4e92\u660e\u724c",
                        "2V2\u5bf9\u5c40\u4e2d\u4ec5\u8ba1\u5206\uff0c\u7ed3\u7b97\u65f6\u5e73\u5206\u6e38\u620f\u8c46",
                        "\u961f\u53cb\u4e4b\u95f4\u76f8\u4e92\u7ed3\u7b97\u4e0d\u6539\u53d8\u961f\u4f0d\u79ef\u5206",
                        "\u8840\u6d41\u9ebb\u5c06\uff0c\u80e1\u4e86\u4e4b\u540e\u8fd8\u53ef\u4ee5\u518d\u80e1",
                        "\u9080\u8bf7\u597d\u53cb\u540c\u73a9\u53ef\u83b7\u5f97\u6700\u4f73\u6e38\u620f\u4f53\u9a8c~",
                      ])[i.getRandomNum(0, a.length - 1)]))
                    : (e.wordSprite.spriteFrame = e.wordSF[t.mode]),
                  t.mode)
                ) {
                  case g_tConst.EChangeMode.EChangeMode_CC:
                    ((e.node_rotate.active = !0), e.node_rotate.runAction(cc.rotateBy(1.5, -180)));
                    break;
                  case g_tConst.EChangeMode.EChangeMode_CCW:
                    ((e.node_rotate.active = !0),
                      (e.node_rotate.scaleX = -1),
                      e.node_rotate.runAction(cc.rotateBy(1.5, 180)));
                    break;
                  case g_tConst.EChangeMode.EChangeMode_OPPO:
                    ((e.node_opposite.active = !0),
                      e.node_opposite.getComponent(cc.Animation).play());
                    break;
                  default:
                    ((e.node_rotate.active = !0), e.node_rotate.runAction(cc.rotateBy(1.5, -180)));
                }
              },
              this,
            );
          },
        }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils" },
    ],
