    gameHandAnimChupai: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "ac764ZtkYJLAKvRrOZ3lI3A", "gameHandAnimChupai");
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
          getDirectionStartPos: function (e, t, a, o) {
            (void 0 === a && (a = 1), void 0 === o && (o = 1));
            var n = g_oData.get(g_tData.table3dData).getTile3dContentSize(),
              s = e,
              r = t.x,
              c = t.y,
              l = t.z;
            ((c += (o - 1) * n.y), (l += (a - 1) * n.z));
            var g = new cc.Vec3(r, c, l);
            return (
              s == i.Front && (g = new cc.Vec3(-r, c, -l)),
              s == i.Left && (g = new cc.Vec3(-l, c, r)),
              s == i.Right && (g = new cc.Vec3(l, c, -r)),
              s == i.Mine && (g = new cc.Vec3(r, c, l)),
              g
            );
          },
          play: function (e, t, i, a, o) {
            (void 0 === a && (a = 1), void 0 === o && (o = 1), this.offListener());
            var n = t.sex,
              s = t.outTileNode,
              r = t.handTileTempNode,
              c = t.tEndPos,
              l = t.chupaiActionEnd,
              g = t.playAnimSpeedValue || 1,
              d = t.offSetPadding || cc.v3(0, 0, 0),
              h = e,
              u = this.node;
            s.active = !1;
            var _ = r,
              m = g_tConst.handAnimAssetList.chupai.cfg[n],
              f = m.events || [],
              p = m.speed.value || 1;
            p *= g;
            var C = m.startPos.value[h] || m.startPos.value[0];
            g_oData.get(g_tData.LiveGameModel).isLivePlayer() &&
              (C = m.startPos.zbValue[h] || m.startPos.zbValue[0]);
            var v = m.tileRot.value,
              y = m.tilePos.value,
              S = m.tileScale.value;
            _.setScale(S);
            var D = _.getComponent("tile3dView");
            (D.setRotation(v), D.setPosition(y));
            var T = this.getRotation(h);
            u.eulerAngles = T;
            var I = u.getComponent("hand3dView");
            (I.pointNode.removeAllChildren(), I.pointNode.addChild(_));
            var E = (C = this.getDirectionStartPos(h, cc.v3(C.x, C.y, C.z), a, o))
              .add(this.getDirectionStartPos(h, d))
              .add(c);
            u.setPosition(E);
            var M = this.skeletonAnimation,
              L = M.play();
            ((L.wrapMode = cc.WrapMode.Normal),
              (L.speed = p),
              M.on(
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
                    a =
                      (u.getComponent("hand3dView"),
                      function (e) {
                        var a = f[e].time.value * (i / t);
                        MJ.GameViewHandler.scheduleOnce(function () {
                          ((s.active = !0),
                            (_.active = !1),
                            g_oAudioManager.play(g_tAsset.EffectSound.outtile),
                            _.destroy(),
                            l());
                        }, a);
                      }),
                    o = 0;
                  o < f.length;
                  o++
                )
                  a(o);
              })(L));
          },
        }),
          cc._RF.pop());
      },
      { Direction: "Direction", gameHandAnimBase: "gameHandAnimBase" },
    ],
