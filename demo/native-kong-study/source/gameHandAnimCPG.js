    gameHandAnimCPG: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "1e69fdMmclNt5HRb40navQ6", "gameHandAnimCPG");
        var i = e("Direction"),
          a = e("gameHandAnimBase");
        (cc.Class({
          extends: a,
          properties: {},
          init: function () {},
          getRotation: function (e) {
            var t = e,
              a = new cc.Vec3(0, 90, 0);
            return (
              t == i.Front && (a = new cc.Vec3(0, 270, 0)),
              t == i.Left && (a = new cc.Vec3(0, 0, 0)),
              t == i.Right && (a = new cc.Vec3(0, 180, 0)),
              t == i.Mine && (a = new cc.Vec3(0, 90, 0)),
              a
            );
          },
          getDirectionStartPos: function (e, t) {
            g_oData.get(g_tData.table3dData).getTile3dContentSize();
            var a = e,
              o = t.x,
              n = t.y,
              s = t.z,
              r = new cc.Vec3(o, n, s);
            return (
              a == i.Front && (r = new cc.Vec3(-o, n, -s)),
              a == i.Left && (r = new cc.Vec3(-s, n, o)),
              a == i.Right && (r = new cc.Vec3(s, n, -o)),
              a == i.Mine && (r = new cc.Vec3(o, n, s)),
              r
            );
          },
          getTileBox: function (e, t) {
            var i = new cc.Node();
            ((i.is3DNode = !0), (i.active = !0));
            var a = g_oData.get(g_tData.table3dData).getTile3dContentSize();
            i.addChild(t);
            var o = new cc.Vec3(0, 0, 0),
              n = g_tConst.BlockCfgs.BlockExposedKong.BlockType,
              s = g_tConst.BlockCfgs.BlockConcealedKong.BlockType;
            return ((e != n && e != s) || (o.x = -a.x), t.setPosition(o), i);
          },
          play: function (e, t, i) {
            this.offListener();
            var a = t.sex,
              o = t.tEndPos,
              n = (t.stack, t.playActionEnd),
              s = t.playYanback,
              r = t.tileSlideOffset,
              c = t.offSetPadding,
              l = g_tConst.handAnimAssetList.cpg.cfg[a],
              g = (l.tileRot.value, l.tilePos.value, l.startPos.value[e]);
            g_oData.get(g_tData.LiveGameModel).isLivePlayer() && (g = l.startPos.zbvalue[e]);
            var d = l.endPosScale.value[e],
              h = l.speed.value || 1;
            ((h *= t.playAnimSpeedValue || 1), l.tileScale.value);
            var u = e,
              _ = this.node,
              m = this.skeletonAnimation,
              f = this.getDirectionStartPos(
                u,
                cc.v3(g.x - o.x / d.x + c.x, g.y - o.y / d.y + c.y, g.z - o.z / d.z + c.z),
              );
            _.setPosition(f);
            var p = function (e, t) {
                switch (t.id) {
                  case 1:
                    _.getComponent("hand3dView");
                    var i = t.tweenTime.value,
                      a = e.speed,
                      o = (e.time, i * (e.duration / a));
                    MJ.GameViewHandler.scheduleOnce(function () {
                      (s && s(), n(r));
                    }, o);
                }
              },
              C = this.getRotation(u);
            ((_.eulerAngles = C), _.getComponent("hand3dView").pointNode.removeAllChildren());
            var v = m.play();
            ((v.wrapMode = cc.WrapMode.Normal),
              (v.speed = h),
              m.on(
                "finished",
                function () {
                  i && i();
                },
                this,
              ),
              (function (e) {
                for (
                  var t = e.speed,
                    i = (e.time, e.duration),
                    a = l.events || [],
                    o =
                      (_.getComponent("hand3dView"),
                      function (o) {
                        var n = a[o],
                          s = n.time.value * (i / t);
                        MJ.GameViewHandler.scheduleOnce(function () {
                          p(e, n);
                        }, s);
                      }),
                    n = 0;
                  n < a.length;
                  n++
                )
                  o(n);
              })(v));
          },
        }),
          cc._RF.pop());
      },
      { Direction: "Direction", gameHandAnimBase: "gameHandAnimBase" },
    ],
