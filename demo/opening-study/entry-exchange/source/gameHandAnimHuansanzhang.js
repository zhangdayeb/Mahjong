    gameHandAnimHuansanzhang: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "373a4SKQxpHb5Rw8jZKYfj+", "gameHandAnimHuansanzhang");
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
          getHSZTileBox: function (e) {
            var t = new cc.Node();
            ((t.is3DNode = !0), (t.active = !0));
            for (
              var i = g_oData.get(g_tData.table3dData).getTile3dContentSize(), a = 0;
              a < 3;
              a++
            ) {
              var o = cc.instantiate(e);
              (t.addChild(o), (o.position = new cc.Vec3(0, 0, i.x * a)));
            }
            return t;
          },
          play: function (e, t, i) {
            (this.offListener(), g_oAudioManager.play(g_tAsset.EffectSound.outtile));
            var a = t.sex,
              o = this.getHSZTileBox(t.handTileTempNode),
              n = t.playActionEnd,
              s = g_tConst.handAnimAssetList.huansanzhang.cfg[a],
              r = s.tileRot.value,
              c = s.tilePos.value,
              l = s.startPos.value[e],
              g = s.speed.value || 1;
            g *= t.playAnimSpeedValue || 1;
            var d = s.tileScale.value;
            o.setScale(d);
            var h = e,
              u = this.node,
              _ = this.skeletonAnimation;
            g_oData.get(g_tData.LiveGameModel).isLivePlayer() && (l = s.startPos.zbvalue[e]);
            var m = this.getDirectionStartPos(h, cc.v3(l.x, l.y, l.z));
            u.setPosition(m);
            var f = function (e, t) {
                switch (t.id) {
                  case 1:
                    ((o.active = !1), o.destroy(), n());
                }
              },
              p = this.getRotation(h);
            u.eulerAngles = p;
            var C = u.getComponent("hand3dView");
            (C.pointNode.removeAllChildren(),
              C.pointNode.addChild(o),
              (o.eulerAngles = r),
              (o.position = c));
            var v = _.play();
            ((v.wrapMode = cc.WrapMode.Normal),
              (v.speed = g),
              _.on(
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
                    a = s.events || [],
                    o =
                      (u.getComponent("hand3dView"),
                      function (e) {
                        var o = a[e],
                          n = o.time.value * (i / t);
                        MJ.GameViewHandler.scheduleOnce(function () {
                          f(0, o);
                        }, n);
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
