    blockHuAniBase: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "55603VQmwtCMYtcjrbHPIjb", "blockHuAniBase");
        var i = e("MjHuAnimationEnum");
        (cc.Class({
          extends: cc.Component,
          properties: {
            aniCom: { default: null, type: cc.Animation },
            fanXingSprite: { default: [], type: cc.Sprite },
            fanxingLabel: { default: [], type: cc.Label },
            changeNodePos: { default: [], type: cc.Node },
          },
          play: function (e, t, a, o, n) {
            var s = this,
              r = i.PlayAniCfg[a],
              c = r.achType,
              l = r.fontUrl;
            this.aniCom.node.opacity = 0;
            var g = function () {
              if (cc.isValid(s.node)) {
                s.scheduleOnce(function () {
                  s.aniCom.node.opacity = 255;
                }, 0);
                var i = s.aniCom;
                if (
                  (i.on(
                    "finished",
                    function () {
                      (g_oEvent.dispatchEvent(g_tEvent.FANXING_EFFECT_END),
                        n && n(),
                        this.node.destroy());
                    },
                    s,
                  ),
                  (i.play().wrapMode = cc.WrapMode.Normal),
                  MJ.GameLogic)
                ) {
                  MJ.GameLogic.TableModel.getPlayFanxingSound() &&
                    g_oEvent.dispatchEvent(g_tEvent.PLAY_FANXING_SOUND, e);
                  var a = MJ.GameLogic.TableModel.isShowDaoCameraVFX("shake", t);
                  a &&
                    g_oData
                      .get(g_tData.CameraActionMod)
                      .doCameraShakeForVFX(g_tConst.CameraShakeCfg[a]);
                  var o = MJ.GameLogic.TableModel.isShowDaoCameraVFX("zoom", t);
                  o &&
                    g_oData
                      .get(g_tData.CameraActionMod)
                      .doCameraZoomForVFX(g_tConst.CameraZoomCfg[o]);
                }
              }
            };
            c == i.AchieveType.TotalPic
              ? this.playTotalPicAni(l, t, g)
              : c == i.AchieveType.SigleStr
                ? this.playSigleStrAni(l, e, t, g)
                : c == i.AchieveType.TwoPic
                  ? this.playTwoPicAni(l, e, g)
                  : c == i.AchieveType.JustPlay
                    ? this.playJustPlay(l, e, g)
                    : c == i.AchieveType.OneLabOnePic && this.playOneLabOnePic(l, e, t, g);
          },
          playOneLabOnePic: function (e, t, i, a) {
            for (var o = this, n = e, s = 0, r = this.fanxingLabel.length; s < r; s++)
              this.fanxingLabel[s].string = i;
            for (
              var c = function (e, i) {
                  var s = o.fanXingSprite[e];
                  g_oSpriteFrameLoader.loadRes(
                    n + t,
                    e == i - 1
                      ? function (e) {
                          ((s.spriteFrame = e), a && a());
                        }
                      : function (e) {
                          s.spriteFrame = e;
                        },
                    !1,
                    !1,
                    function () {
                      o.node && o.node.destroy();
                    },
                  );
                },
                l = 0,
                g = this.fanXingSprite.length;
              l < g;
              l++
            )
              c(l, g);
          },
          playJustPlay: function (e, t, i) {
            i && i();
          },
          playTotalPicAni: function (e, t, i) {
            for (var a = 0; a < this.fanxingLabel.length; a++) this.fanxingLabel[a].string = t;
            i && i();
          },
          playSigleStrAni: function (e, t, i, a) {
            var o = this,
              n = e,
              s = i.split(""),
              r = s.length;
            if (r > 4)
              return (
                console.log(
                  "\u756a\u578b\u540d\u5b57\u957f\u5ea6\u5927\u4e8e\u7279\u6548\u8282\u70b9\u957f\u5ea6",
                ),
                void this.node.destroy()
              );
            for (var c = 0, l = this.fanxingLabel.length; c < l; c++)
              s[c]
                ? ((this.fanxingLabel[c].node.active = !0), (this.fanxingLabel[c].string = s[c]))
                : (this.fanxingLabel[c].node.active = !1);
            var g = cc.v2(277, 182.5);
            switch (r) {
              case 4:
                g = cc.v2(277, 182.5);
                break;
              case 3:
                g = cc.v2(357, 182.5);
                break;
              case 2:
                g = cc.v2(417, 182.5);
            }
            for (var d = 0; d < this.changeNodePos.length; d++) this.changeNodePos[d].position = g;
            for (
              var h = function (e, i) {
                  var s = o.fanXingSprite[e],
                    r = o.checkSigleStrMap(t + "_" + (e + 1));
                  g_oSpriteFrameLoader.loadRes(
                    n + r,
                    e == i - 1
                      ? function (e) {
                          ((s.spriteFrame = e), a && a());
                        }
                      : function (e) {
                          s.spriteFrame = e;
                        },
                    !1,
                    !1,
                    function () {
                      o.node && o.node.destroy();
                    },
                  );
                },
                u = 0,
                _ = r;
              u < _;
              u++
            )
              h(u, _);
          },
          checkSigleStrMap: function (e) {
            var t = i.SigleStrMap;
            for (var a in t) if (-1 != t[a].indexOf(e)) return a;
            return e;
          },
          playTwoPicAni: function (e, t, a) {
            for (
              var o = this,
                n = MJ.RuleMgr.getFanGroupID(),
                s = i.FanxingPicSuffix[n + "_" + t] || "",
                r = e,
                c = function (e, i) {
                  var n = o.fanXingSprite[e];
                  g_oSpriteFrameLoader.loadRes(
                    r + t + s + "_" + (e % 2),
                    e == i - 1
                      ? function (e) {
                          ((n.spriteFrame = e), a && a());
                        }
                      : function (e) {
                          n.spriteFrame = e;
                        },
                    !1,
                    !1,
                    function () {
                      ((n.spriteFrame = null), a && a());
                    },
                  );
                },
                l = 0,
                g = this.fanXingSprite.length;
              l < g;
              l++
            )
              c(l, g);
          },
          playTwoStrAni: function (e, t, i, a) {
            for (
              var o = this,
                n = function (n) {
                  var s = o.fanXingSprite[n],
                    r = o.fanXingSprite[n + t];
                  1 == n || 2 == n
                    ? ((s.node.active = !0),
                      (r.node.active = !0),
                      g_oSpriteFrameLoader.loadRes(
                        e + i + "_" + n + "1",
                        function (e) {
                          r.spriteFrame = e;
                        },
                        !1,
                        !1,
                        function () {
                          o.node && o.node.destroy();
                        },
                      ),
                      g_oSpriteFrameLoader.loadRes(
                        e + i + "_" + n,
                        2 == n
                          ? function (e) {
                              ((s.spriteFrame = e), a && a());
                            }
                          : function (e) {
                              s.spriteFrame = e;
                            },
                        !1,
                        !1,
                        function () {
                          o.node && o.node.destroy();
                        },
                      ))
                    : ((s.node.active = !1), (r.node.active = !1));
                },
                s = 0;
              s < t;
              s++
            )
              n(s);
          },
          playFourStrAni: function (e, t, i, a) {
            for (
              var o = this,
                n = function (n, s) {
                  var r = o.fanXingSprite[n],
                    c = o.fanXingSprite[n + t];
                  (g_oSpriteFrameLoader.loadRes(
                    e + i + "_" + (n + 1) + "1",
                    function (e) {
                      c.spriteFrame = e;
                    },
                    !1,
                    !1,
                    function () {
                      o.node && o.node.destroy();
                    },
                  ),
                    g_oSpriteFrameLoader.loadRes(
                      e + i + "_" + (n + 1),
                      n == s - 1
                        ? function (e) {
                            ((r.spriteFrame = e), a && a());
                          }
                        : function (e) {
                            r.spriteFrame = e;
                          },
                      !1,
                      !1,
                      function () {
                        o.node && o.node.destroy();
                      },
                    ));
                },
                s = 0,
                r = t;
              s < t;
              s++
            )
              n(s, r);
          },
        }),
          cc._RF.pop());
      },
      { MjHuAnimationEnum: "MjHuAnimationEnum" },
    ],
