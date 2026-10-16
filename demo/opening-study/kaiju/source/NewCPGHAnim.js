    NewCPGHAnim: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "8175fsJHVtIs4caOlRHDkDE", "NewCPGHAnim");
        var i = e("MjHuAnimationEnum"),
          a = e("HuAniLoadImageCtrl");
        (cc.Class({
          extends: cc.Component,
          properties: { spShaiZiDian: [cc.SpriteFrame], content: cc.Node },
          onLoad: function () {
            ((this._ani_cache = {}),
              (this._curTingViewId = -1),
              (this._forceOpenVFXAnim = ["ex_protectGift", "ex_jinzhongzhao"]),
              (this._nextPlayHuTime = [new Map(), new Map(), new Map(), new Map()]));
          },
          playTing: function (e, t) {
            var i = this;
            this._curTingViewId = t;
            var a = function (t) {
                i.playAnimation(t, e, null, function () {});
              },
              o = g_tAsset.GameAnimPrefabMap.ting;
            g_oPrefabLoader.loadRes(o, null, function (e) {
              a(e);
            });
          },
          playPeng: function (e) {
            var t = this,
              i = function (i) {
                t.playAnimation(i, e, null, function () {});
              },
              a = g_tAsset.GameAnimPrefabMap.peng2;
            g_oPrefabLoader.loadRes(a, null, function (e) {
              i(e);
            });
          },
          playChow: function (e) {
            var t = this,
              i = function (i) {
                t.playAnimation(i, e, null, function () {});
              },
              a = g_tAsset.GameAnimPrefabMap.chi2;
            g_oPrefabLoader.loadRes(a, null, function (e) {
              i(e);
            });
          },
          playGang: function (e) {
            var t = this,
              i = function (i) {
                t.playAnimation(i, e, null, function () {});
              },
              a = g_tAsset.GameAnimPrefabMap.gang2;
            g_oPrefabLoader.loadRes(a, null, function (e) {
              i(e);
            });
          },
          playAnGang: function (e) {
            var t = this,
              i = function (i) {
                t.playAnimation(i, e, null, function () {});
              },
              a = g_tAsset.GameAnimPrefabMap.gang2;
            g_oPrefabLoader.loadRes(a, null, function (e) {
              i(e);
            });
          },
          playMingDan: function (e) {
            var t = this,
              i = function (i) {
                t.playAnimation(i, e, null, function () {});
              },
              a = g_tAsset.GameAnimPrefabMap.mingDan;
            g_oPrefabLoader.loadRes(a, null, function (e) {
              i(e);
            });
          },
          playAnDan: function (e) {
            var t = this,
              i = function (i) {
                t.playAnimation(i, e, null, function () {});
              },
              a = g_tAsset.GameAnimPrefabMap.anDan;
            g_oPrefabLoader.loadRes(a, null, function (e) {
              i(e);
            });
          },
          playGuoDan: function (e) {
            var t = this,
              i = function (i) {
                t.playAnimation(i, e, null, function () {});
              },
              a = g_tAsset.GameAnimPrefabMap.guoDan;
            g_oPrefabLoader.loadRes(a, null, function (e) {
              i(e);
            });
          },
          playCha: function (e) {
            var t = this,
              i = function (i) {
                t.playAnimation(i, e, null, function () {});
              },
              a = g_tAsset.GameAnimPrefabMap.cha;
            g_oPrefabLoader.loadRes(a, null, function (e) {
              i(e);
            });
          },
          playTongBao: function (e) {
            var t = this,
              i = function (i) {
                t.playAnimation(i, e, null, function () {});
              },
              a = g_tAsset.GameAnimPrefabMap.tongBao;
            g_oPrefabLoader.loadRes(a, null, function (e) {
              i(e);
            });
          },
          playDuiBao: function (e) {
            var t = this,
              i = function (i) {
                t.playAnimation(i, e, null, function () {});
              },
              a = g_tAsset.GameAnimPrefabMap.duiBao;
            g_oPrefabLoader.loadRes(a, null, function (e) {
              i(e);
            });
          },
          playMoBao: function (e) {
            var t = this,
              i = function (i) {
                t.playAnimation(i, e, null, function () {});
              },
              a = g_tAsset.GameAnimPrefabMap.moBao;
            g_oPrefabLoader.loadRes(a, null, function (e) {
              i(e);
            });
          },
          playHu: function (e, t) {
            (void 0 === t && (t = {}), this.playHuBase(e, g_tAsset.GameAnimPrefabMap.hu2, t));
          },
          playZIMO: function (e, t) {
            (void 0 === t && (t = {}), this.playHuBase(e, g_tAsset.GameAnimPrefabMap.ziMo2, t));
          },
          playQGH: function (e, t) {
            (void 0 === t && (t = {}), this.playHuBase(e, g_tAsset.GameAnimPrefabMap.QGH, t));
          },
          playHuBase: function (e, t, i) {
            var a = this;
            void 0 === i && (i = {});
            var o = function (t) {
                a.playAnimation(t, e, null, function () {});
              },
              n = i.nViewSeatId,
              s = i.nBlockType,
              r = new Date().getTime();
            r > (this._nextPlayHuTime[n].get(s) || 0) &&
              (this._nextPlayHuTime[n].set(s, r + 500),
              g_oPrefabLoader.loadRes(t, null, function (e) {
                o(e);
              }));
          },
          playShaiZi: function () {
            var e = this,
              t = 0;
            MJ && MJ.GameViewHandler && (t = MJ.GameViewHandler.getRemainTileOffset());
            var i = cc.v2(3, -1.5);
            (g_oData.get(g_tData.LiveGameModel).isLivePlayer() && (i = cc.v2(3, 35)),
              (i.y += t / 2));
            var a = function (t) {
                ((t.position = i), (t.scale = 0.6), e.content.addChild(t));
                var a = t.getComponent(cc.Animation);
                (a.on(
                  "finished",
                  function () {
                    for (
                      var e = MJ.GameLogic.TileModel.getDiceNum(), i = e[0], a = e[1], o = 0;
                      o < t.children.length;
                      o++
                    )
                      t.children[o].active = !1;
                    var n = new cc.Node();
                    ((n.addComponent(cc.Sprite).spriteFrame = this.spShaiZiDian[i - 1]),
                      (n.scale = 0.3));
                    var s = t.children[2].getPosition();
                    ((n.position = s), t.addChild(n));
                    var r = new cc.Node();
                    ((r.addComponent(cc.Sprite).spriteFrame = this.spShaiZiDian[a - 1]),
                      (r.scale = 0.3));
                    var c = t.children[3].getPosition();
                    ((r.position = c),
                      t.addChild(r),
                      setTimeout(
                        function () {
                          t.destroy();
                        }.bind(this),
                        800,
                      ));
                  },
                  e,
                ),
                  (a.node.active = !0),
                  a.play(),
                  g_oAudioManager.play(g_tAsset.EffectSound.saizi));
              },
              o = g_tAsset.GameAnimPrefabMap.shaizi;
            g_oPrefabLoader.loadRes(o, null, function (e) {
              a(e);
            });
          },
          playPJKS: function (e, t) {
            var i = this,
              a = function (a) {
                ((a.position = e), i.content.addChild(a));
                var o = a.getComponent(cc.Animation);
                (o.on(
                  "finished",
                  function () {
                    ((o.node.active = !1), a.destroy(), t());
                  },
                  i,
                ),
                  (o.node.active = !0),
                  o.play());
              },
              o = g_tAsset.GameAnimPrefabMap.kaiju;
            g_oPrefabLoader.loadRes(
              o,
              null,
              function (e) {
                a(e);
              },
              function () {
                t();
              },
            );
          },
          playMatchPJKS: function (e, t, i) {
            var a = this,
              o = function (t) {
                ((t.position = e), a.content.addChild(t));
                var o = t.getComponent(cc.Animation);
                (o.on(
                  "finished",
                  function () {
                    ((o.node.active = !1), t.destroy(), i());
                  },
                  a,
                ),
                  (o.node.active = !0),
                  o.play());
              },
              n = t
                ? g_tAsset.GameAnimPrefabMap.Matchkaiju2
                : g_tAsset.GameAnimPrefabMap.Matchkaiju1;
            g_oPrefabLoader.loadRes(
              n,
              null,
              function (e) {
                o(e);
              },
              function () {
                i();
              },
            );
          },
          playXiaYu: function (e) {
            var t = this,
              i = function (i) {
                (t.playAnimation(i, e, null, function () {}),
                  g_oAudioManager.play(g_tAsset.EffectSound.rain));
              },
              a = g_tAsset.GameAnimPrefabMap.xiayu;
            g_oPrefabLoader.loadRes(a, null, function (e) {
              i(e);
            });
          },
          playLiuJu: function (e, t) {
            var i = this,
              a = function (a) {
                i.playAnimation(a, e, null, function () {
                  t && t();
                });
              },
              o = g_tAsset.GameAnimPrefabMap.liuJu;
            g_oPrefabLoader.loadRes(
              o,
              null,
              function (e) {
                a(e);
              },
              function () {
                t && t();
              },
            );
          },
          playWind: function (e) {
            var t = this,
              i = function (i) {
                (t.playAnimation(i, e, 3, function () {}),
                  g_oAudioManager.play(g_tAsset.EffectSound.wind));
              },
              a = g_tAsset.GameAnimPrefabMap.guafeng;
            g_oPrefabLoader.loadRes(a, null, function (e) {
              i(e);
            });
          },
          playHuDian: function (e) {
            var t = this,
              i = this.node.convertToNodeSpaceAR(e),
              a = function (e) {
                t.playAnimation(e, i, 1, function () {});
              },
              o = g_tAsset.GameAnimPrefabMap.huDian;
            g_oPrefabLoader.loadRes(o, null, function (e) {
              a(e);
            });
          },
          playZiMoLight: function (e) {
            var t = this,
              i = this.node.convertToNodeSpaceAR(e),
              a = function (e) {
                t.playAnimation(e, i, 1, function () {});
              },
              o = g_tAsset.GameAnimPrefabMap.ZiMoLight;
            g_oPrefabLoader.loadRes(o, null, function (e) {
              a(e);
            });
          },
          playMingPai: function (e) {
            var t = this,
              i = function (i) {
                t.playAnimation(i, e, null, function () {});
              },
              a = g_tAsset.GameAnimPrefabMap.MingPai;
            g_oPrefabLoader.loadRes(a, null, function (e) {
              i(e);
            });
          },
          playAnimation: function (e, t, i, a) {
            ((e.position = t), i && (e.scale = i), this.content.addChild(e));
            var o = e.getComponent(cc.Animation);
            (o.on(
              "finished",
              function () {
                ((o.node.active = !1),
                  e.destroy(),
                  a && a(),
                  this._curTingViewId > -1 &&
                    (g_oExLayerManager.emitEvent2GameLayer(
                      g_tConst.GameExLayerCfg.UserInfoLayer.id,
                      "ADD_USER_TAG",
                      {
                        nViewSeatId: this._curTingViewId,
                        nUserTag: g_tConst.eUserTag.Ting.id,
                        isNeedAnim: !0,
                      },
                    ),
                    (this._curTingViewId = -1)));
              },
              this,
            ),
              (o.node.active = !0),
              o.play());
          },
          playHuAniByFanXing: function (e, t, o, n, s, r) {
            var c = this,
              l = g_oData.get(g_tData.UserLocalModel).isOpenBigFanVFX(),
              g = g_tAsset.newGameAnimPrefabMap[n],
              d = this._forceOpenVFXAnim.indexOf(n) >= 0;
            (((g && l) || d) && -1 == [].indexOf(g)) ||
              ((n = "ex_bigHu"), (g = g_tAsset.newGameAnimPrefabMap[n]));
            var h = i.PlayAniCfg[n],
              u = r || 0;
            u <= 0 && h && (u = h.time * (h.timeScale || 1));
            var _ = { url: g, fanxingID: t, fanxingName: o, aniName: n, fFanAniTime: r, info: h };
            (a.preLoad(g),
              MJ.GameAnimMgr.orderedPlayAnim(
                function () {
                  c.loadFanXingAnim(_);
                },
                {
                  playDesc:
                    "\u64ad\u653e\u5927\u80e1\u756a\u578b\u7279\u6548: anim:" +
                    _.aniName +
                    " name:" +
                    _.fanxingName +
                    " id:" +
                    _.fanxingID +
                    " lock:" +
                    u,
                  pauseGameLoop: u,
                },
              ));
          },
          loadFanXingAnim: function (e) {
            var t = this;
            a.getRes(e.url, function (i, o) {
              if (!i && cc.isValid(t.content)) {
                var n = cc.instantiate(o);
                (t.content.addChild(n),
                  g_oEvent.dispatchEvent(g_tEvent.FANXING_EFFECT_START),
                  n
                    .getComponent(cc.Component)
                    .play(e.fanxingID, e.fanxingName, e.aniName, e.fFanAniTime, null, e),
                  (n.getComponent(cc.Component).onDisable = function () {
                    a.releaseRes(e.url);
                  }));
              }
            });
          },
        }),
          cc._RF.pop());
      },
      { HuAniLoadImageCtrl: "HuAniLoadImageCtrl", MjHuAnimationEnum: "MjHuAnimationEnum" },
    ],
