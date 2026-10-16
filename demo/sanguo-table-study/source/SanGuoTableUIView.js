    SanGuoTableUIView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "6adc2IWy9JFj4XW5TY5zPRU", "SanGuoTableUIView");
        var i = "prefabs/3dgame/table3DBox/table2DUI/sanguo/",
          a = e("AlertDlgBaseView");
        (cc.Class({
          extends: a,
          properties: {},
          onDestroy: function () {
            (this._super(), this.closeReleaseRes());
          },
          Awake: function () {
            MJ &&
              MJ.GameViewHandler &&
              MJ.GameViewHandler.nodeDeskBaseInfo.emit("SET_TABLE_COLOR_SANGUO");
          },
          onClose: function () {},
          initAdapt: function () {
            var e = this;
            ((this._startWidth = this.bg.width),
              (this._startHeight = this.bg.height),
              this.resetAdapt(),
              this.bg.on("size-changed", function () {
                e.resetAdapt();
              }),
              cc.view.on("design-resolution-changed", this.resetAdapt, this));
          },
          resetAdapt: function () {
            var e = cc.view.getVisibleSize(),
              t = Math.max(e.width, this._startWidth * this.bg.scale.x),
              i = Math.max(e.height, this._startHeight * this.bg.scale.y);
            (t && this.bg.width != t / this.bg.scale.x && (this.bg.width = t / this.bg.scale.x),
              i && this.bg.height != i / this.bg.scale.y && (this.bg.height = i / this.bg.scale.y));
          },
          reset: function () {
            (this.loadCtrl++,
              (this.lightEffect = new Map()),
              (this.contryNode = new Map()),
              this.tableEffectRoot.children.forEach(function (e) {
                e.destroy();
              }),
              this.contryLine.forEach(function (e) {
                e.active = !0;
              }));
          },
          onMessageEvent: function () {},
          start: function () {},
          upAnimation: function (e) {
            this.liangNode[e] && (this.downAnimation(), (this.liangNode[e].active = !0));
          },
          downAnimation: function () {
            this.liangNode.forEach(function (e) {
              e.active = !1;
            });
          },
          showGetHero: function (e, t) {
            if (e && t) {
              var i = e[0],
                a = t && t[0];
              this.showTableEffect(i, a, !0);
            }
          },
          resume: function (e, t) {
            var i = this;
            (Array.isArray(t) &&
              t.length > 0 &&
              t.forEach(function (e) {
                (i
                  .getContryNode(e)
                  .then(function (e) {
                    ((e.position = new cc.v3(0, 0, 0)), (e.opacity = 255));
                  })
                  .catch(function (e) {
                    e && Log.error("SanGuoTableUIView resume ", e);
                  }),
                  i.contryLine[e] && (i.contryLine[e].active = !1));
              }),
              Array.isArray(e) &&
                e.length > 0 &&
                e.forEach(function (e) {
                  i.showTableEffect(e, null, !1);
                }));
          },
          showTableEffect: function (e, t, i) {
            var a = this;
            if (!isNull(e)) {
              var o = [this.getLightEffect(e)];
              (i && o.push(this.getWaveEffect()),
                Promise.all(o)
                  .then(function (o) {
                    if (cc.isValid(a.node)) {
                      var n = o[0];
                      n.active = !0;
                      var s = n.getComponent(cc.Animation),
                        r = s.getState(s.defaultClip.name) || {};
                      (i
                        ? isNull(t) || (a.showContryEffect(t), (r.speed = 1.5))
                        : (r.playbackRange = { min: r.duration - 0.01, max: r.duration }),
                        s.play());
                      var c = o[1];
                      i &&
                        ((c.active = !0),
                        c.getComponent("SanGuoTableWave").showWave(a.getWaveData(e), function () {
                          c.destroy();
                        }));
                    }
                  })
                  .then(function () {
                    var t = a.neibor.get(e);
                    Array.isArray(t) &&
                      t.forEach(function (t) {
                        var i = a.lightEffect.get(t);
                        if ((a.hideNeiborLine(i, e), i)) {
                          var o = a.lightEffect.get(e);
                          a.hideNeiborLine(o, t);
                        }
                      });
                  })
                  .catch(function (e) {
                    e && Log.error("SanGuoTableUIView showLightEffect ", e);
                  }));
            }
          },
          getLightEffect: function (e) {
            var t = this;
            return new Promise(function (a, o) {
              if (t.lightEffect.has(e)) a(t.lightEffect.get(e));
              else {
                var n = i + e;
                t.loadPrefab(n, t.tableEffectRoot).then(function (i) {
                  i && cc.isValid(t.node) ? ((i.active = !1), t.lightEffect.set(e, i), a(i)) : o();
                });
              }
            });
          },
          hideNeiborLine: function (e, t) {
            if (e) {
              var i = e.getChildByPath("bk/xian").getChildByName(String(t));
              cc.isValid(i) &&
                cc
                  .tween(i)
                  .delay(1)
                  .to(0.2, { opacity: 0 }, { easing: cc.easing.sineOut })
                  .call(function () {
                    i.active = !1;
                  })
                  .start();
            }
          },
          getWaveEffect: function () {
            var e = this;
            return new Promise(function (t, i) {
              e.loadPrefab(
                "prefabs/3dgame/table3DBox/table2DUI/sanguo/SanGuoTableWave",
                e.tableEffectRoot,
              ).then(function (a) {
                a && cc.isValid(e.tableEffectRoot) ? ((a.active = !1), t(a)) : i();
              });
            });
          },
          getWaveData: function (e) {
            if (!this.waveData) {
              var t = new cc.Color().fromHEX("#FFF7C0"),
                i = new cc.Color().fromHEX("#2566F0"),
                a = new cc.Color().fromHEX("#00DC3E"),
                o = new cc.Color().fromHEX("#F73B3B"),
                n = new Map();
              (n.set(113, {
                spIdx: 0,
                color: t,
                pos: new cc.v2(-280, 245),
                size: new cc.Size(403, 259),
              }),
                n.set(114, {
                  spIdx: 1,
                  color: t,
                  pos: new cc.v2(-410, -240),
                  size: new cc.Size(444, 220),
                }),
                n.set(115, { spIdx: 2, color: t, pos: new cc.v2(470, -200) }),
                n.set(129, {
                  spIdx: 3,
                  color: i,
                  pos: new cc.v2(96, 126),
                  size: new cc.Size(363, 242),
                }),
                n.set(130, {
                  spIdx: 4,
                  color: i,
                  pos: new cc.v2(332, 261),
                  size: new cc.Size(348, 197),
                }),
                n.set(131, {
                  spIdx: 5,
                  color: i,
                  pos: new cc.v2(28, 291),
                  size: new cc.Size(353, 140),
                }),
                n.set(145, {
                  spIdx: 6,
                  color: a,
                  pos: new cc.v2(-156, 10),
                  size: new cc.Size(294, 407),
                }),
                n.set(146, {
                  spIdx: 7,
                  color: a,
                  pos: new cc.v2(-78, -247),
                  size: new cc.Size(279, 227),
                }),
                n.set(147, {
                  spIdx: 8,
                  color: a,
                  pos: new cc.v2(-389, -15),
                  size: new cc.Size(381, 309),
                }),
                n.set(161, {
                  spIdx: 9,
                  color: o,
                  pos: new cc.v2(161, -92),
                  size: new cc.Size(494, 245),
                }),
                n.set(162, {
                  spIdx: 10,
                  color: o,
                  pos: new cc.v2(178, -249),
                  size: new cc.Size(271, 224),
                }),
                n.set(163, {
                  spIdx: 11,
                  color: o,
                  pos: new cc.v2(365, 42),
                  size: new cc.Size(429, 295),
                }),
                (this.waveData = n));
            }
            return this.waveData.get(e);
          },
          showContryEffect: function (e) {
            var t = this,
              i = function (e) {
                var i = e.getComponent(cc.Animation);
                (i.on(
                  "finished",
                  function () {
                    o.destroy();
                  },
                  t,
                ),
                  i.play());
              },
              a = function (i) {
                cc.tween(i)
                  .delay(0.2)
                  .call(function () {
                    (t.contryMap.get(e).forEach(function (e) {
                      var i = t.lightEffect.get(e);
                      (cc.isValid(i) && i.destroy(), t.lightEffect.delete(e));
                    }),
                      t.contryLine[e] && (t.contryLine[e].active = !1),
                      (i.opacity = 255));
                  })
                  .delay(0.1)
                  .to(0.4, { position: new cc.v3(0, 0, 0) }, { easing: cc.easing.sineIn })
                  .start();
              },
              o = new cc.Node("ContryEffect");
            (this.tableEffectRoot.addChild(o),
              Promise.all([this.getContryEffect(o, e), this.getContryNode(e)])
                .then(function (e) {
                  if (cc.isValid(t.node)) {
                    var o = e[0];
                    i(o);
                    var n = e[1];
                    a(n);
                  }
                })
                .catch(function (e) {
                  e && Log.error("SanGuoTableUIView showContryEffect ", e);
                }));
          },
          getContryEffect: function (e, t) {
            var a = this;
            return new Promise(function (o, n) {
              if (cc.isValid(e)) {
                var s = i + "contryEffect" + t;
                a.loadPrefab(s, e).then(function (t) {
                  t && cc.isValid(e) ? o(t) : n();
                });
              }
            });
          },
          getContryNode: function (e) {
            var t = this;
            return new Promise(function (a, o) {
              if (t.contryNode.has(e)) a(t.contryNode.get(e));
              else {
                var n = i + "Contry" + e;
                t.loadPrefab(n, t.tableEffectRoot).then(function (i) {
                  if (i && cc.isValid(t.tableEffectRoot)) {
                    (t.contryNode.set(e, i), (i.opacity = 0));
                    var n = i.getChildByName("shuguo_cuxian");
                    (n &&
                      cc
                        .tween(n)
                        .to(2, { opacity: 255 })
                        .to(2, { opacity: 150 })
                        .union()
                        .repeatForever()
                        .start(),
                      a(i));
                  } else o();
                });
              }
            });
          },
          loadHeLiu: function () {
            g_oMgrRelease
              .getReleaseComp(this.node)
              .loadPrefab(
                "prefabs/3dgame/table3DBox/table2DUI/sanguo/heliu_tx",
                this.table,
                function () {},
              );
          },
          loadPrefab: function (e, t) {
            var i = this;
            return new Promise(function (a) {
              var o = i.loadCtrl;
              g_oMgrRelease.getReleaseComp(i.node).loadPrefab(e, t, function (e) {
                o === i.loadCtrl ? a(e) : (e.destroy(), a(null));
              });
            });
          },
        }),
          cc._RF.pop());
      },
      { AlertDlgBaseView: "AlertDlgBaseView" },
    ],
