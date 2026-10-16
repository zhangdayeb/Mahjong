    gameHandAnim: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "1a9f3blhi5JN6WRiDE8eeBm", "gameHandAnim"), new Map());
        var i,
          a = cc.Class({
            name: "gameHandAnim",
            properties: {},
            ctor: function () {
              i = Object.create(null);
            },
            init: function () {},
            clear: function () {
              i = Object.create(null);
            },
            getSexByViewSeatId: function (e) {
              return MJ.GameLogic.PlayerModel.getPlayerInfoByViewID(e).sex || 0;
            },
            playendHandRes: function (e, t) {
              t.active = !1;
            },
            getHandPrefabRes: function (e, t, a) {
              i[a] = i[a] || Object.create(null);
              var o = this.getSexByViewSeatId(a);
              if (null != i[a].sex && i[a].sex != o)
                for (var n in (delete i[a].sex, i[a])) {
                  var s = i[a][n];
                  (cc.isValid(s) && s.destroy(), delete i[a][n]);
                }
              i[a].sex = o;
              var r = i[a][e];
              isNull(r) || !cc.isValid(r)
                ? g_oPrefabLoader.loadRes(
                    e,
                    null,
                    function (o, n) {
                      (t && t(!0, o, n), (i[a][e] = o));
                    },
                    function () {
                      return (t && t(null, null, 0), null);
                    },
                  )
                : ((r.active = !0), t && t(!0, r, 0));
            },
            goBackNoAnim: function (e, t, i) {
              var a = t.playActionEnd,
                o = t.chupaiActionEnd;
              (setTimeout(function () {
                o && o(0);
              }, 0),
                setTimeout(function () {
                  a && a();
                }, 0),
                setTimeout(function () {
                  i(!1);
                }, 0));
            },
            play: function (e, t, i, a) {
              var o = this;
              if (g_oData.get(g_tData.UserLocalModel).isOpenHand()) {
                var n = 1;
                (MJ.GameLogic.networkQueuelen > 3 &&
                  MJ.GameLogic.isGameStart() &&
                  MJ.GameLogicUtils.ctrlOrderPlayIng &&
                  (n = MJ.GameLogic.networkQueuelen > 6 ? 1.4 : 1.2),
                  1 == n &&
                    cc.director._scheduler.setTimeScale(
                      e.defaultTimeScale ? e.defaultTimeScale : 1,
                    ));
                var s = function () {
                  (cc.director._scheduler.setTimeScale(1), a && a());
                };
                i.sex = i.sex || this.getSexByViewSeatId(t);
                var r = g_tConst.playAnimSpeedValue || 1;
                ((i.playAnimSpeedValue = i.playAnimSpeedValue || r),
                  (i.editorHandStartFun = function () {}),
                  (i.editorHandEndFun = function () {}));
                var c = g_tConst.handAnimConstList,
                  l = e.asset[i.sex],
                  g = function (a) {
                    var n = c[a];
                    if (n.id == e.id)
                      return (
                        o.getHandPrefabRes(
                          l,
                          function (e, a) {
                            e && a
                              ? n.funcName && o[n.funcName] && o[n.funcName](l, a, t, i, s)
                              : o.goBackNoAnim(t, i, s);
                          },
                          t,
                        ),
                        { v: void 0 }
                      );
                  };
                for (var d in c) {
                  var h = g(d);
                  if ("object" == typeof h) return h.v;
                }
              } else this.goBackNoAnim(t, i, a);
            },
            _playChupai: function (e, t, i, a, o) {
              var n = this,
                s = a.handParentNode,
                r = a.outTileNode,
                c = a.rowLen,
                l = a.floorLen,
                g = a.editorHandStartFun,
                d = a.editorHandEndFun;
              ((r.active = !1),
                (function () {
                  var r = t;
                  r.parent = s;
                  var h = r.getComponent("gameHandAnimChupai");
                  (h.play(
                    i,
                    a,
                    function () {
                      (o(), d(), n.playendHandRes(e, r, i));
                    },
                    c,
                    l,
                  ),
                    g(h),
                    MJ.GameViewHandler.node.emit("CHUPAI_HAND_ANIM_START", {
                      playArgs: a,
                      handAnimType: 1,
                    }));
                })());
            },
            _playChupai2: function (e, t, i, a, o) {
              var n = this,
                s = a.handParentNode,
                r = a.rowLen,
                c = a.floorLen,
                l = a.editorHandStartFun,
                g = a.editorHandEndFun;
              (function () {
                var d = t;
                d.parent = s;
                var h = d.getComponent("gameHandAnimChupai2");
                if (!h) return (o(), g(), void n.playendHandRes(e, d, i));
                (h.play(
                  i,
                  a,
                  function () {
                    (o(), g(), n.playendHandRes(e, d, i));
                  },
                  r,
                  c,
                ),
                  l(h),
                  MJ.GameViewHandler.node.emit("CHUPAI_HAND_ANIM_START", {
                    playArgs: a,
                    handAnimType: 2,
                  }));
              })();
            },
            _playCuopai: function (e, t, i, a, o) {
              var n = this,
                s = a.editorHandStartFun,
                r = a.editorHandEndFun,
                c = a.handParentNode;
              (function () {
                var l = t;
                l.parent = c;
                var g = l.getComponent("gameHandAnimCuopai");
                (g.play(i, a, function () {
                  (o(), r(), n.playendHandRes(e, l, i));
                }),
                  s(g));
              })();
            },
            _playCPG: function (e, t, i, a, o) {
              var n = this,
                s = a.handParentNode,
                r = a.editorHandStartFun,
                c = a.editorHandEndFun;
              (function () {
                var l = t;
                l.parent = s;
                var g = l.getComponent("gameHandAnimCPG");
                (g.play(i, a, function () {
                  (o(), c(), n.playendHandRes(e, l, i));
                }),
                  r(g));
              })();
            },
            _playHuansanzhang: function (e, t, i, a, o) {
              var n = this,
                s = a.editorHandStartFun,
                r = a.editorHandEndFun,
                c = a.handParentNode;
              (function () {
                var l = t;
                l.parent = c;
                var g = l.getComponent("gameHandAnimHuansanzhang");
                (g.play(i, a, function () {
                  (o(), r(), n.playendHandRes(e, l, i));
                }),
                  s(g));
              })();
            },
          });
        ((t.exports = a), cc._RF.pop());
      },
      {},
    ],
