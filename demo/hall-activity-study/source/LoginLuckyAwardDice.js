    LoginLuckyAwardDice: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "fad72wRFWNBb5yKhvMTfniq", "LoginLuckyAwardDice");
        var i = e("DlgBaseView");
        (cc.Class({
          extends: i,
          properties: {
            mask: { default: null, type: cc.Node, tooltip: "" },
            animBg: { default: null, type: cc.Node, tooltip: "" },
            bottomUI: { default: null, type: cc.Node, tooltip: "" },
            basicNum: { default: null, type: cc.RichText, tooltip: "" },
            multipleNum: { default: null, type: cc.RichText, tooltip: "" },
            scrollFinalNum: { default: null, type: cc.Node, tooltip: "" },
            progressItem: { default: null, type: cc.Node, tooltip: "" },
            yanhua: { default: [], type: [cc.Node], tooltip: "" },
            luckyWordBig: { default: [], type: [cc.Node], tooltip: "" },
            luckyWordSmall: { default: [], type: [cc.Node], tooltip: "" },
            glowRoot: { default: null, type: cc.Node, tooltip: "" },
          },
          Awake: function () {
            ((this._data = null),
              (this._subHeight = 0),
              (this._canGet = !1),
              (this._scrollNodeRoot = null),
              (this._yanhuaTimes = 0.25),
              this.onCustomEvent(),
              this.onMessageEvent());
          },
          start: function () {
            this.hideBottomUI();
          },
          onCustomEvent: function () {
            this.node.on("ON_INIT", this.onInit, this);
          },
          onMessageEvent: function () {
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.ON_SCALE_DICE_ANIM_BG,
                function () {
                  (g_tConst.LoginLuckyAwardCfg.CamZoomTime,
                    g_tConst.LoginLuckyAwardCfg.CamOldFov,
                    g_tConst.LoginLuckyAwardCfg.CamFovTo,
                    g_tConst.LoginLuckyAwardCfg.AnimBgMoveWithDice);
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.LLA_SHOW_LUCKY_WORD,
                  function () {
                    var e = this.getLuckyWordIdx();
                    if (e >= 0) {
                      var t = this.luckyWordBig[e];
                      if (cc.isValid(t)) {
                        ((t.active = !0), (t.scale = cc.v3(0, 0, 1)), (t.opacity = 0));
                        var i = g_tConst.LoginLuckyAwardCfg.ShowLuckyWordTime - 0.5;
                        cc.tween(t)
                          .to(
                            0.2,
                            { scale: cc.v3(1.1, 1.1, 1), opacity: 255 },
                            { easing: "cubicOut" },
                          )
                          .to(0.1, { scale: cc.v3(1, 1, 1) })
                          .delay(i)
                          .to(0.2, { scale: cc.v3(0, 0, 1) })
                          .start();
                      }
                    }
                  },
                  this,
                ),
              ));
          },
          setIBL: function () {
            var e = g_oSceneMgr.getRunningScene();
            e &&
              ((e.globals.skybox.useHDR = !1),
              (e.globals.skybox.envmap = this.iblTexture),
              (e.globals.ambient.skyLightingColor = g_oCommonUtils.getColorFromHex("F58DE6")),
              (e.globals.ambient.groundLightingColor = g_oCommonUtils.getColorFromHex("953241")),
              (e.globals.ambient.skyIllum = 3),
              this.scheduleOnce(function () {
                e.globals.skybox.useIBL = !0;
              }));
          },
          closeIBL: function () {
            var e = g_oSceneMgr.getRunningScene();
            e &&
              ((e.globals.skybox.useIBL = !1),
              (e.globals.skybox.useHDR = !0),
              (e.globals.skybox.envmap = null),
              (e.globals.ambient.skyLightingColor = g_oCommonUtils.getColorFromHex("F3EFC1")),
              (e.globals.ambient.groundLightingColor = g_oCommonUtils.getColorFromHex("8293AC")),
              (e.globals.ambient.skyIllum = 15e3));
          },
          onInit: function (e) {
            ((this._data = e), this.bgFadeIn());
          },
          onInitPrivProgress: function () {
            var e = g_tConst.LoginLuckyAwardCfg.ELuckyAwardType.Dice,
              t = g_oData.get(g_tData.LoginLuckyAwardMod).getAwardCfgByType(e),
              i = g_oData.get(g_tData.LoginLuckyAwardMod).getAwardInfoByType(e);
            if (this.progressItem && t && i) {
              var a = g_oData.get(g_tData.HonorPrivilegeMod).curLevel,
                o = 0,
                n = g_oData.get(g_tData.LoginLuckyAwardMod).getFilterPrivAddCfg(t.fingerVipAddCfg);
              (n.forEach(function (e) {
                a >= e.level && o++;
              }),
                this.progressItem.emit("ON_INIT", {
                  curProgress: o,
                  totalProgress: n.length,
                  fingerVipAddCfg: n,
                  needScaleItem: !0,
                  minSpacingX: g_tConst.LoginLuckyAwardCfg.MinSpacingX,
                }));
            }
          },
          getLuckyWordIdx: function () {
            var e = -1;
            switch (this._data.luckyMultiple) {
              case 5:
              case 6:
                e = 0;
                break;
              case 10:
                e = 1;
            }
            return e;
          },
          bgFadeIn: function () {
            var e = this,
              t = g_tConst.LoginLuckyAwardCfg.DiceBgFadeInTime;
            cc.tween(this.node)
              .call(function () {
                (cc.tween(e.mask).to(t, { opacity: 255 }).start(),
                  cc.tween(e.animBg).to(t, { opacity: 255 }).start());
              })
              .delay(t)
              .call(function () {
                e.showTouziAnim();
              })
              .start();
          },
          hideBottomUI: function () {
            this.bottomUI.active = !1;
            var e =
              this.node.convertToWorldSpaceAR(this.bottomUI.position).y + this.bottomUI.height / 2;
            ((this._subHeight = e), (this.bottomUI.y -= e));
          },
          showBottomUI: function () {
            var e = this;
            this.bottomUI.active = !0;
            var t = g_oCommonUtils.Long2Number(this._data.baseFingerCoin),
              i =
                (g_oCommonUtils.Long2Number(this._data.LuckyAddFingerCoin),
                g_oCommonUtils.Long2Number(this._data.fingerVipAddFingerCoin),
                t * this._data.luckyMultiple);
            ((this.basicNum.string =
              "<color=#ffffff>\u57fa\u7840\u5956\u52b1\uff1a</color><color=#fff690>" +
              g_oCommonUtils.translateCoinStr(g_oCommonUtils.initProCoin(t)) +
              "\u6307\u5c16\u5e01</color>"),
              (this.multipleNum.string =
                "<color=#ffffff>\u9ab0\u5b50\u70b9\u6570\uff1a</color><color=#fff690>" +
                this._data.luckyMultiple +
                "</color>"),
              this.scheduleOnce(function () {
                e.onInitPrivProgress();
              }, 0),
              g_tConst.LoginLuckyAwardCfg.BottomUIShowSpeed);
            var a = this._subHeight,
              o = g_tConst.LoginLuckyAwardCfg.CamZoomTime;
            (cc
              .tween(this.bottomUI)
              .by(o, { position: new cc.Vec3(0, a, 0) }, { easing: "cubicOut" })
              .call(function () {
                if (e.getLuckyWordIdx() >= 0) {
                  var t = g_tConst.LoginLuckyAwardCfg.LuckyGlowInterval;
                  cc.tween(e.glowRoot)
                    .to(t, { opacity: 255 })
                    .to(t, { opacity: 0 })
                    .union()
                    .repeatForever()
                    .start();
                }
                e.showYanHua();
              })
              .start(),
              this.initTotalNum(i, o + this._yanhuaTimes * this.yanhua.length));
          },
          initTotalNum: function (e, t) {
            void 0 === t && (t = 0);
            var i = this,
              a = g_tConst.LoginLuckyAwardCfg.ScrollAnimTime;
            this.scrollFinalNum.emit("ON_INIT_SCROLL_NUM", {
              oLabelNode: this.scrollFinalNum,
              curNum: "0",
              finalNum: g_oCommonUtils.formatNumWithThousand(
                g_oCommonUtils.initProCoin(e),
                "\uff0c",
              ),
              animTime: a,
              delayTime: t,
              finishCB: function (e) {
                cc.isValid(e) &&
                  ((e.y += 5),
                  (i._scrollNodeRoot = e),
                  (i._scrollNodeRoot.opacity = 0),
                  i.scheduleOnce(function () {
                    if (((i._canGet = !0), cc.isValid(i.glowRoot))) {
                      i.glowRoot.stopAllActions();
                      var e = g_tConst.LoginLuckyAwardCfg.LuckyGlowInterval;
                      cc.tween(i.glowRoot)
                        .to(e, { opacity: 255 })
                        .delay(0.5)
                        .to(e, { opacity: 0 })
                        .start();
                    }
                  }, a + t));
              },
              useCubicOut: !0,
            });
          },
          showYanHua: function () {
            var e = this;
            Array.isArray(this.yanhua) &&
              this.yanhua.length > 0 &&
              (function () {
                for (
                  var t = e.yanhua.length,
                    i = e._yanhuaTimes,
                    a = 0,
                    o = [0.15, 0.15, 0.1],
                    n = 0,
                    s = 0,
                    r = 0;
                  r < t;
                  r++
                )
                  (e.scheduleOnce(function () {
                    ((e.yanhua[n].active = !0), n++);
                  }, a),
                    e.scheduleOnce(function () {
                      if ((0 == s && (e.basicNum.node.active = !0), 1 == s)) {
                        e.multipleNum.node.active = !0;
                        var t = e.getLuckyWordIdx();
                        if (t >= 0) {
                          var i = e.luckyWordSmall[t];
                          cc.isValid(i) &&
                            ((i.active = !0),
                            (i.scale = cc.v3(0, 0, 1)),
                            cc
                              .tween(i)
                              .to(
                                0.2,
                                { scale: cc.v3(1.1, 1.1, 1), opacity: 255 },
                                { easing: "cubicOut" },
                              )
                              .to(0.1, { scale: cc.v3(1, 1, 1) })
                              .start());
                        }
                      }
                      (2 == s && e._scrollNodeRoot && (e._scrollNodeRoot.opacity = 255), s++);
                    }, a + o[r]),
                    (a += i));
              })();
          },
          showTouziAnim: function () {
            var e = this,
              t = this;
            g_oPrefabLoader.loadRes(g_tAsset.LoginLuckyAwardDice3DPrefab, this.node, function (i) {
              cc.isValid(t.node) &&
                i.emit("ON_INIT", {
                  luckyMultiple: e._data.luckyMultiple,
                  showBottomUI: t.showBottomUI.bind(t),
                });
            });
          },
          showAward: function () {
            if (this._data) {
              var e = g_oCommonUtils.Long2Number(this._data.baseFingerCoin),
                t =
                  (g_oCommonUtils.Long2Number(this._data.LuckyAddFingerCoin),
                  g_oCommonUtils.Long2Number(this._data.fingerVipAddFingerCoin),
                  e * this._data.luckyMultiple),
                i = { type: g_tConst.GameConfig.ItemType.ZCoin, num: t, goodsID: -1 };
              g_oEvent.dispatchEvent(g_tEvent.BASEHALL_SHARE_EVNET_NORMAL_AWARD_GET, {
                allAward: [i],
              });
            }
            this.close();
          },
          onClickCollectAll: function () {
            this._canGet && this.showAward();
          },
          onClickClose: function () {
            this.close();
          },
          onDestroy: function () {
            this._super();
          },
        }),
          cc._RF.pop());
      },
      { DlgBaseView: "DlgBaseView" },
    ],
