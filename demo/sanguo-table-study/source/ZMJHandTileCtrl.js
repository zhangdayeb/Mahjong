    ZMJHandTileCtrl: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "504bawXrkZF+acIESkfiA7F", "ZMJHandTileCtrl");
        var i = e("Direction"),
          a = e("tileLogicHelper"),
          o = cc.Class({
            name: "Hand",
            properties: { tileTexture: cc.SpriteFrame, tileScale: { type: cc.Float, default: 1 } },
          });
        (cc.Class({
          extends: cc.Component,
          properties: {
            offsetPosNode: cc.Node,
            direction: { type: i, default: 0 },
            tileStartPos: cc.Vec2,
            tileTexture: cc.SpriteFrame,
            tileCount: 0,
            tileScale: { type: cc.Float, default: 1 },
            tilePrefab: cc.Prefab,
            titleStep: cc.Vec2,
            tileFront: [o],
            colorRotation: 0,
            colorSkew: cc.Vec2,
            colorPos: cc.Vec2,
            colorScale: cc.Vec2,
            TouchNode: cc.Node,
            isMember: { default: !1, tooltip: "\u662f\u5426\u662f\u961f\u53cb\u7684\u724c" },
            _offsetCount: 0,
            _onVoiceOrderChuHandle: null,
            _stackCPGCont: 0,
            _handleClose: null,
          },
          onLoad: function () {
            var e = this;
            ((this._stackCPGCont = 0),
              this.direction === i.Mine
                ? (this.initHandTouch(),
                  this.isMember ||
                    (this._onVoiceOrderChuHandle = g_oEvent.addEventListener(
                      g_tEvent.MOD_VOICEORDER_ORDER_CHU,
                      this.onVoiceOrderChu,
                      this,
                    )))
                : MJ.GameLogic.isPlayBack && (this.node.opacity = 1),
              (this.openTileCtrl = null),
              (this._aTiles = []),
              (this._oHitTile = null),
              (this._bHitTileMoveing = !1),
              (this._bPlayingAnim = !1),
              (this._bSendOver = !1),
              (this._OpenOffset = cc.v2(0, 0)),
              (this._huDelIndex = -1),
              (this._delIndexStatus = null),
              (this.bDKShowRecorder = !1),
              (this.timeoutRecorder = null),
              cc.game.on(
                cc.game.EVENT_HIDE,
                (this._handleClose = function () {
                  (g_oEvent.dispatchEvent(g_tEvent.HIDE_RECORDER),
                    (e.bDKShowRecorder = !1),
                    clearTimeout(e.timeoutRecorder));
                }),
                this,
              ));
          },
          onDestroy: function () {
            (cc.game.off(cc.game.EVENT_HIDE, this._handleClose, this),
              isNull(this._onVoiceOrderChuHandle) ||
                g_oEvent.removeEventListener(this._onVoiceOrderChuHandle));
          },
          addHandTableOffset: function (e) {
            if (cc.isValid(this.offsetPosNode)) {
              var t = this.offsetPosNode.position;
              ((t.x += e.x || 0), (t.y += e.y || 0), (this.offsetPosNode.position = t));
            }
          },
          updateOffsetCount: function () {
            var e = MJ.GameLogic.TableModel.pointNumCards;
            7 == e ? (this._offsetCount = 3) : 10 == e && (this._offsetCount = 1);
          },
          resetTile: function () {
            (this.removeAllTile(),
              (this._oHitTile = null),
              (this._bHitTileMoveing = !1),
              (this._OpenOffset = cc.v2(0, 0)),
              (this._enbleMulChoiceTiles = !1),
              (this._isSortLeftFun = null),
              (this._isSortRightFun = null),
              (this._otherSortFun = null));
          },
          removeTile: function (e) {
            MJ.GameViewHandler.removeTile(e);
          },
          removeAllTile: function () {
            for (var e = 0; e < this._aTiles.length; e++) {
              var t = this._aTiles[e];
              this.removeTile(t);
            }
            this._aTiles = [];
          },
          stopTileAction: function () {
            for (var e = 0; e < this._aTiles.length; e++) {
              var t = this._aTiles[e];
              (t.stopAllActions(), (t.opacity = 255));
            }
            (this.sortTile(), this.layoutTiles());
          },
          initHandTouch: function () {
            this.TouchNode &&
              (this.TouchNode.on(
                "touchstart",
                function (e) {
                  this.onHandTouchStart(e);
                },
                this,
              ),
              this.TouchNode.on(
                "touchmove",
                function (e) {
                  this.onHandTouchMoved(e);
                },
                this,
              ),
              this.TouchNode.on(
                "touchend",
                function (e) {
                  this.onHandTouchEnded(e);
                },
                this,
              ),
              this.TouchNode.on(
                "touchcancel",
                function (e) {
                  this.onHandTouchEnded(e);
                },
                this,
              ));
          },
          layoutTiles: function (e) {
            var t = this._aTiles.length,
              a = Math.max(14 - t, 0),
              o = cc.v2(this.titleStep.x * a, this.titleStep.y * a),
              n = this.tileStartPos.add(o);
            if (((n = this.tileStartPos.add(this._OpenOffset)), this._offsetCount > 0))
              for (var s = this._offsetCount, r = 0; r < s; r++) n = n.add(this.titleStep);
            for (var c = 0; c < t; c++) {
              var l = this._aTiles[c],
                g = this._aTiles[c].getComponent("ZMJTile");
              (this.checkCanDiv(t, c) &&
                (n = n.add(cc.v2(this.titleStep.x / 4, this.titleStep.y / 4))),
                e && this.direction === i.Mine
                  ? this.handTileAnim(l, l.getPosition(), n)
                  : g.setPos(n));
              var d = this.getZStep(c, this.tileFront.length);
              ((l.zIndex = d), (n = n.add(this.titleStep)));
            }
          },
          checkCanDiv: function (e, t) {
            var i = MJ.GameLogic.TileModel.getLeftDrawTilesNum(this.direction);
            return i > 0 ? t == e - i : e % 3 == 2 && t === e - 1;
          },
          handTileAnim: function (e, t, i) {
            e.stopAllActions();
            var a = e.getComponent("ZMJTile");
            this._bPlayingAnim = !0;
            var o = e.getContentSize(),
              n = null;
            if (Math.abs(i.x - t.x) > 1.5 * o.width) {
              var s = [];
              (s.push(t),
                s.push(cc.v2(t.x, t.y + o.height)),
                s.push(cc.v2(i.x, t.y + o.height)),
                s.push(cc.v2(i)),
                (n = cc.cardinalSplineTo(0.7, s, 1)));
            } else n = cc.moveTo(0.2, i);
            (e.runAction(n.easing(cc.easeSineInOut())),
              this.scheduleOnce(function () {
                ((this._bPlayingAnim = !1), a.setPos(i));
              }, 0.7));
          },
          getZStep: function (e, t) {
            return this.direction == i.Mine || this.direction == i.Front
              ? e <= t / 2
                ? e
                : -e
              : this.direction == i.Left
                ? e
                : -e;
          },
          onVoiceOrderChu: function (e) {
            try {
              var t = !1;
              Log.info("BIRD >>>", "ZMJHandTileCtrl.js onVoiceOrderChu", e);
              for (var i = 0; i < this._aTiles.length; i++) {
                var a = this._aTiles[i];
                if (a.getComponent("ZMJTile").tileValue === e) {
                  if (this._bPlayingAnim)
                    return void g_oPlatform.doAction(
                      g_tConst.tPlatActionId.actionShowToast,
                      "\u780c\u724c\u4e2d\uff0c\u8bf7\u52ff\u51fa\u724c\uff01",
                    );
                  ((this._oHitTile = a),
                    this._sendChooseTileEvent(this._oHitTile.getComponent("ZMJTile").tileValue),
                    this._oHitTile.emit("moveout"),
                    (this._bHitTileMoveing = !1),
                    (t = !0));
                  break;
                }
              }
              t ||
                g_oPlatform.doAction(
                  g_tConst.tPlatActionId.actionShowToast,
                  "\u8bed\u97f3\u51fa\u724c\u5931\u8d25",
                );
            } catch (err) {
              console.error(
                "ZMJHandTileCtrl.js onVoiceOrderChu occur error, chuTileVal is",
                e,
                "err is ",
                err,
              );
            }
          },
          onHandTouchStart: function (e) {
            var t = this;
            if (!this._bPlayingAnim) {
              if (
                ((this._oHitTile = this.getHitTile(
                  this.node.convertToNodeSpaceAR(e.touch.getLocation()),
                )),
                null === this._oHitTile)
              )
                return (
                  this.setAllUnSelect(),
                  (this.bDKShowRecorder = !0),
                  void (this.timeoutRecorder = setTimeout(function () {
                    t.timeoutRecorder = setTimeout(function () {
                      t.bDKShowRecorder && g_oEvent.dispatchEvent(g_tEvent.SHOW_RECORDER);
                    }, 0);
                  }, 400))
                );
              if (this._oHitTile) {
                var i = this._oHitTile.getComponent("ZMJTile").tileValue;
                this.checkIsCanSelect(i)
                  ? ((this._oHitTile.zIndex = 999), this._sendChooseTileEvent(i))
                  : (this._oHitTile = null);
              }
            }
          },
          onHandTouchMoved: function (e) {
            var t = Math.abs(e.touch.getDelta().x),
              i = Math.abs(e.touch.getDelta().y);
            (t > 10 || i > 10) && !this._bHitTileMoveing
              ? (this._bHitTileMoveing = !0)
              : this._bHitTileMoveing &&
                this._oHitTile &&
                ((this._oHitTile.zIndex = 999),
                this._oHitTile.emit("fllow", { pos: e.touch.getLocation() }));
          },
          onHandTouchEnded: function () {
            if (!this._oHitTile)
              return (
                this._sendChooseTileEvent(-1),
                this.calcSelectCount(),
                g_oEvent.dispatchEvent(g_tEvent.HIDE_RECORDER),
                (this.bDKShowRecorder = !1),
                clearTimeout(this.timeoutRecorder),
                void g_oEvent.dispatchEvent("TOUCH_END")
              );
            if (
              ((this._oHitTile.zIndex = 1),
              this._bHitTileMoveing &&
                this._oHitTile.position.y > 0.2 * cc.winSize.height &&
                this._aTiles.length % 3 == 2)
            )
              this._oHitTile.emit("moveout");
            else if (this._bHitTileMoveing)
              (this._oHitTile.emit("reset"), this._sendChooseTileEvent(-1));
            else {
              var e =
                this._oHitTile.getComponent("ZMJTile").bChoose && this._enbleMulChoiceTiles
                  ? "unchoose"
                  : "choose";
              (this._oHitTile.emit(e),
                this.otherTileUnSelect(this._oHitTile),
                this.calcSelectCount());
            }
            this._bHitTileMoveing = !1;
          },
          getHitTile: function (e) {
            for (var t = 0; t < this._aTiles.length; t++) {
              var i = this._aTiles[t];
              if (i.getBoundingBox().contains(e)) return i;
            }
            return null;
          },
          getAllSelectTileValue: function () {
            for (var e = [], t = 0; t < this._aTiles.length; t++) {
              var i = this._aTiles[t].getComponent("ZMJTile");
              i.bChoose && e.push(i.tileValue);
            }
            return e;
          },
          calcSelectCount: function () {
            var e = this.getAllSelectTileValue(),
              t = new cc.Event.EventCustom("SELECT_HAND_TILE", !0);
            (t.setUserData({
              selectTiles: e,
              lastHitTileIndex: this.getTileIndex(this._oHitTile),
              lastHitTileValue: isNull(this._oHitTile)
                ? null
                : this._oHitTile.getComponent("ZMJTile").tileValue,
            }),
              this.node.dispatchEvent(t));
          },
          setEnbleMulChoiceTiles: function (e) {
            this._enbleMulChoiceTiles = e;
          },
          setAllUnSelect: function () {
            for (var e = 0; e < this._aTiles.length; e++) this._aTiles[e].emit("unchoose");
            var t = new cc.Event.EventCustom("ALL_TILE_UNCHOOSE", !0);
            this.node.dispatchEvent(t);
          },
          otherTileUnSelect: function (e) {
            if (!this._enbleMulChoiceTiles)
              for (var t = 0; t < this._aTiles.length; t++) {
                var i = this._aTiles[t];
                i != e && i.emit("unchoose");
              }
          },
          otherTileUnSelectByIndex: function (e) {
            isNull(this._aTiles[e]) || (this.setAllUnSelect(), this._aTiles[e].emit("choose"));
          },
          setTilesSelect: function (e) {
            (this.setAllUnSelect(),
              this._aTiles.forEach(function (t) {
                var i = t.getComponent("ZMJTile");
                e && e(i.tileValue) && t.emit("choose");
              }),
              this.calcSelectCount());
          },
          _getCurrentSelectTile: function () {
            for (var e = 0; e < this._aTiles.length; e++)
              if (this._aTiles[e].getComponent("ZMJTile").bChoose) return this._aTiles[e];
            return null;
          },
          createTiles: function (e, t) {
            for (var i = e.length, a = this._aTiles.length, o = [], n = a; n < i + a; n++) {
              var s = e[n - a],
                r = cc.instantiate(this.tilePrefab);
              (r.setScale(this.tileScale), this.node.addChild(r));
              var c = r.getComponent("ZMJTile");
              c.tileIndex = n;
              var l = this.tileFront[n];
              l &&
                (c.init(l.tileTexture, s, t, {
                  position: this.colorPos,
                  scale: this.colorScale,
                  rotation: this.colorRotation,
                  skew: this.colorSkew,
                }),
                this._aTiles.push(r),
                o.push(r));
            }
            return o;
          },
          getInitUIPos: function () {
            return (
              (MJ &&
                MJ.GameViewHandler._handOffsets &&
                (MJ.GameViewHandler._handOffsets[0] || {}).y) ||
              0
            );
          },
          playCuopaiAnim: function (e, t, i) {
            (g_oMJNetManger.pauseGameLoop("\u6413\u724c\u52a8\u753b"),
              setTimeout(function () {
                g_oMJNetManger.resumeGameLoop("\u6413\u724c\u52a8\u753b");
              }, 1500));
            var a = this._offsetCount,
              o = this._stackCPGCont;
            (e ||
              (e = this._aTiles[this._aTiles.length - 1]) ||
              (e = this.createTiles([22], !0)[0]),
              (e.active = !1));
            var n = new cc.Event.EventCustom("PLAY_CUOPAI_ANIM", !0);
            (14 == this._aTiles.length && (a = 0),
              n.setUserData({
                nViewSeatId: this.direction,
                nTileValue: t,
                offsetY: this.getInitUIPos(),
                offsetTiles: this._aTiles.length - 1 - a,
                stackCPGCont: o,
                playActionEnd: function () {
                  (Log.info("\u6413\u724c\u52a8\u753b\u7ed3\u675f"), (e.active = !0), i && i());
                },
              }),
              MJ.GameViewHandler.tileModule.dispatchEvent(n));
          },
          drawTiles: function (e, t, a, o, n) {
            var s = this;
            (void 0 === t && (t = null),
              void 0 === a && (a = !1),
              void 0 === o && (o = null),
              void 0 === n && (n = !1));
            var r = this;
            if (
              (this.node.setPosition(this.node.position),
              cc.sys.os == cc.sys.OS_IOS && (a = !1),
              MJ.GameLogic.TileModel.isPlayerHu(this.direction) && (a = !1),
              a)
            ) {
              var c = this.createTiles(e, this.direction == i.Mine),
                l = null;
              (c && c[0] && (l = c[0]),
                this.playCuopaiAnim(l, e[0], function () {
                  (r.layoutTiles(),
                    r.onPlayBack(t),
                    r.scheduleOnce(function () {
                      r.onDrawEnd();
                    }, 0));
                }));
            } else
              (this.createTiles(e, this.direction == i.Mine),
                this.layoutTiles(),
                this.onPlayBack(t),
                this.scheduleOnce(function () {
                  s.onDrawEnd();
                }, 0));
          },
          drawHandTilesMultiple: function (e, t) {
            var a = this,
              o = this.createTiles(e, this.direction == i.Mine),
              n = 0,
              s = e.length;
            o.length > 0 && this.layoutTiles();
            for (var r = 0; r < o.length; r++) {
              var c = o[r];
              if (cc.isValid(c))
                if (t) {
                  var l = c.getContentSize(),
                    g = new cc.Vec2(0, -1 * l.height * 0.5),
                    d = c.position.add(g.clone().scale(cc.v2(-1, -1)));
                  ((c.position = d),
                    cc
                      .tween(c)
                      .by(0.2, { position: g })
                      .call(function () {
                        ++n == s && a.onDrawEnd();
                      })
                      .start());
                } else ++n == s && this.onDrawEnd();
            }
          },
          checkAddTiles: function (e, t) {
            (e.length, t.length);
            for (var i = 0; i < e.length; i++) (e[i].getComponent("ZMJTile").tileValue, t[i]);
          },
          onDrawEnd: function () {
            if (cc.isValid(this.node)) {
              var e = new cc.Event.EventCustom("DRAW_TILES_FINISHED", !0);
              (e.setUserData({ nViewSeatId: this.direction }), this.node.dispatchEvent(e));
            }
          },
          onPlayBack: function (e) {
            if (MJ.GameLogic.isPlayBack && this.direction !== i.Mine) {
              for (var t = [], a = 0; a < this._aTiles.length; a++) {
                var o = this._aTiles[a].getComponent("ZMJTile");
                t.push(o.tileValue);
              }
              (e && (this.openTileCtrl = e), this.openTileCtrl.setOpenTileValues(t, !1));
            }
          },
          sendHandTiles: function (e, t, a) {
            if (
              (void 0 === a && (a = null),
              (this._bSendOver = !1),
              this.node.setPosition(this.node.position),
              this.createTiles(e, this.direction == i.Mine),
              MJ.GameLogic.isPlayBack)
            ) {
              if ((this.SendTileEnd(this._aTiles, this.direction), this.direction !== i.Mine)) {
                for (var o = [], n = 0; n < this._aTiles.length; n++) {
                  var s = this._aTiles[n].getComponent("ZMJTile");
                  o.push(s.tileValue);
                }
                (a && (this.openTileCtrl = a), this.openTileCtrl.setOpenTileValues(o, !1));
              }
              t = !1;
            } else this.layoutTiles();
            if (t) {
              var r = new cc.Event.EventCustom("SEND_TILE_ANIM", !0);
              (r.setUserData({
                nViewSeatId: this.direction,
                tileNodes: this._aTiles,
                callBack: this.SendTileEnd,
                target: this,
              }),
                this.node.dispatchEvent(r));
            } else {
              var c = new cc.Event.EventCustom("DRAW_TILES_FINISHED", !0);
              (c.setUserData({ nViewSeatId: this.direction }),
                this.node.dispatchEvent(c),
                (this._bSendOver = !0));
            }
          },
          SendTileEnd: function (e, t) {
            if (
              (void 0 === e && (e = null),
              void 0 === t && (t = null),
              this.sortTile(),
              this.layoutTiles(),
              (this._bSendOver = !0),
              e && null != t)
            ) {
              var i = new cc.Event.EventCustom("SEND_TILE_ANIM_END", !0);
              (i.setUserData({ tTileNodes: e, nViewSeatId: t }), this.node.dispatchEvent(i));
            }
          },
          delHandTiles: function (e, t) {
            if (
              (this.direction == i.Mine || MJ.GameLogic.isPlayBack
                ? this.delHandTilesFront(e)
                : this.delHandTilesBack(e),
              0 == MJ.GameLogic.TileModel.getLeftDrawTilesNum(this.direction))
            )
              if ((this.sortTile(), this.layoutTiles(t), this.direction !== i.Mine)) {
                for (var a = [], o = 0; o < this._aTiles.length; o++) {
                  var n = this._aTiles[o].getComponent("ZMJTile");
                  a.push(n.tileValue);
                }
                this.openTileCtrl && this.openTileCtrl.setOpenTileValues(a, !1);
              } else
                MJ.GameViewHandler.tileModule.emit("LAYOUT_HANDTILE_ROOT", {
                  nViewSeatId: this.direction,
                  needAnim: !0,
                });
          },
          delHandTilesFront: function (e) {
            if (!(e.length < 0)) {
              var t = this,
                i = -1,
                a = MJ.GameLogic.TileModel.getLeftDrawTilesNum(this.direction);
              if (this._huDelIndex >= 0 && a > 0) {
                var o = this.getTargetDelIndex(this._huDelIndex);
                i = this._aTiles.length - (a + 1) + o;
              }
              for (var n = 0; n < e.length; n++) r(e[n]) || c(e[n]);
            }
            function s(e) {
              (e == t._oHitTile && (t._oHitTile = null),
                t._aTiles.removeByValue(e),
                t.removeTile(e));
            }
            function r(e) {
              var i = t._getCurrentSelectTile();
              return !(!i || e !== i.getComponent("ZMJTile").tileValue) && (s(i), !0);
            }
            function c(e) {
              for (var a = t._aTiles.length - 1; a >= 0; a--) {
                var o = t._aTiles[a],
                  n = o.getComponent("ZMJTile").tileValue;
                if (!(i >= 0 && a != i) && n == e) return (s(o), !0);
              }
              return !1;
            }
          },
          delHandTilesBack: function (e) {
            var t = MJ.GameLogic.PlayerModel.getPlayerInfoByViewID(this.direction).isMingPai || !1;
            if (!(e.length <= 0 || this._aTiles.length <= 0)) {
              var i = -1,
                a = MJ.GameLogic.TileModel.getLeftDrawTilesNum(this.direction);
              if (this._huDelIndex >= 0 && a > 0) {
                var o = this.getTargetDelIndex(this._huDelIndex);
                i = this._aTiles.length - (a + 1) + o;
              } else t && a > 0 && e.length > 1 && (e = [e[0]]);
              var n = e.length,
                s = n;
              (i >= 0 && (s = a + 1 - i), s <= 0 && e.length > 0 && (s = e.length));
              for (
                var r = this._aTiles.splice(this._aTiles.length - s, n), c = 0;
                c < r.length;
                c++
              ) {
                var l = r[c];
                this.removeTile(l);
              }
            }
          },
          setHandRuleLaiziSort: function (e) {
            ((this._isSortRuleLaiziLeftFun = e),
              this._bSendOver && (this.sortTile(), this.layoutTiles()));
          },
          setHandSort: function (e, t, i) {
            ((this._isSortLeftFun = e),
              (this._isSortRightFun = t),
              (this._otherSortFun = i),
              this._bSendOver && (this.sortTile(), this.layoutTiles()));
          },
          sortTile: function () {
            var e = MJ.GameLogic.TileModel.getLeftDrawTilesNum(this.direction),
              t = [],
              i = [],
              o = [],
              n = [];
            if (e > 0)
              this._aTiles
                .splice(this._aTiles.length - e, this._aTiles.length)
                .forEach(function (e) {
                  n.push(e);
                });
            else if (this._aTiles.length % 3 == 2) {
              var s = this._aTiles.splice(this._aTiles.length - 1, 1);
              n.push(s[0]);
            }
            this._aTiles.sort(function (e, t) {
              var i = e.getComponent("ZMJTile"),
                o = t.getComponent("ZMJTile"),
                n = a.toTileValue(i.tileValue) - a.toTileValue(o.tileValue);
              return 0 === n
                ? i.tileValue !== o.tileValue
                  ? o.tileValue - i.tileValue
                  : i.tileIndex - o.tileIndex
                : n;
            });
            for (var r = {}, c = 0; c < this._aTiles.length; c++) {
              var l = this._aTiles[c],
                g = l.getComponent("ZMJTile").tileValue;
              (this._isSortLeftFun && this._isSortLeftFun(g, r)) ||
              (this._isSortRuleLaiziLeftFun && this._isSortRuleLaiziLeftFun(g, r))
                ? t.push(l)
                : this._isSortRightFun && this._isSortRightFun(g, r)
                  ? i.push(l)
                  : o.push(l);
            }
            (this._otherSortFun && o.sort(this._otherSortFun, r),
              (this._aTiles = []),
              (this._aTiles = t.concat(o).concat(i).concat(n)));
            for (var d = 0; d < this._aTiles.length; d++)
              this._aTiles[d].getComponent("ZMJTile").tileIndex = d;
          },
          showHuTip: function (e) {
            var t = this,
              i = -1,
              o = -1;
            if (1 === e.length)
              for (
                var n = function (i) {
                    t._aTiles.forEach(function (t) {
                      var o = t.getComponent("ZMJTile");
                      a.toTileValue(o.tileValue) === a.toTileValue(e[i].iDiscard) &&
                        o.showHuHit(!0, !1, !1);
                    });
                  },
                  s = 0;
                s < e.length;
                s++
              )
                n(s);
            else
              (function () {
                var n,
                  s,
                  r = [],
                  c = [],
                  l = [];
                (e.forEach(function (e) {
                  var t = { iDiscard: e.iDiscard, nMaxFan: 0, nTotalTileCount: 0 };
                  (e.stTingHu.forEach(function (e) {
                    ((t.nMaxFan = e.iTotalFan > t.nMaxFan ? e.iTotalFan : t.nMaxFan),
                      (t.nTotalTileCount += e.iRemainCardsNum));
                  }),
                    l.push(t),
                    t.nTotalTileCount > o && ((o = t.nTotalTileCount), (c = [])),
                    t.nMaxFan > i && ((i = t.nMaxFan), (r = [])),
                    t.nTotalTileCount === o && c.push(t),
                    t.nMaxFan === i && r.push(t));
                }),
                  (n = 1 === r.length),
                  (s = 1 === c.length));
                for (
                  var g = function (e) {
                      var r = l[e];
                      t._aTiles.forEach(function (e) {
                        var t = e.getComponent("ZMJTile");
                        a.toTileValue(t.tileValue) === a.toTileValue(r.iDiscard) &&
                          t.showHuHit(!0, s && r.nTotalTileCount === o, n && r.nMaxFan === i);
                      });
                    },
                    d = 0;
                  d < l.length;
                  d++
                )
                  g(d);
              })();
          },
          hideHuTip: function () {
            this._aTiles.forEach(function (e) {
              e.getComponent("ZMJTile").showHuHit(!1);
            });
          },
          playHszAnim: function (e, t) {
            void 0 === t && (t = null);
            var a = this,
              o = 1.5;
            MJ.GameLogic.isPlayBack && (o = 0.5);
            var n = function (e) {
              (a.sendHandTiles(e, !1, t), a.sortTile(), a.layoutTiles(!1));
              for (var i = e.length, o = [], n = 0; n < i; n++)
                for (var s = e[n], r = 0; r < a._aTiles.length; r++) {
                  var c = a._aTiles[r];
                  if (a._aTiles[r].getComponent("ZMJTile").tileValue === s && -1 === o.indexOf(r)) {
                    var l = c.x,
                      g = c.y;
                    (o.push(r), (c.y += 50), c.runAction(cc.moveTo(0.5, cc.v2(l, g))));
                    break;
                  }
                }
              MJ &&
                MJ.GameLogic &&
                MJ.GameLogic.TileModel.aGuiPai.length > 0 &&
                MJ.GameViewHandler.node.emit("SET_LAI_ZI_TILE_TAG");
            };
            if (
              (a.node.runAction(
                cc.sequence(
                  cc.delayTime(o),
                  cc.callFunc(function () {
                    n(e);
                  }),
                ),
              ),
              this.direction === i.Mine && !this.isMemberHand)
            ) {
              var s = new cc.Event.EventCustom("PLAY_HSZ_ANIM", !0);
              (s.setUserData({ rotationDuration: o }), a.node.dispatchEvent(s));
            }
          },
          updateStartPos: function (e) {
            e.direction;
            var t = e.edgeWorldPos;
            this._stackCPGCont = e.stackCont;
            var a = this.node.y,
              o = this.node.convertToNodeSpaceAR(t);
            switch (this.direction) {
              case i.Mine:
                (((o = this.node.parent.convertToNodeSpaceAR(t)).y += this.node.y),
                  (o.y = a),
                  (this._OpenOffset = cc.v2(o.x + 20, 0).sub(cc.v2(this.tileStartPos.x, 0))));
                break;
              case i.Left:
              case i.Front:
              case i.Right:
                this._OpenOffset = o.sub(this.tileStartPos);
            }
            this.layoutTiles();
          },
          getOpenOffset: function () {
            return this._OpenOffset;
          },
          setIsTingAct: function (e) {
            this._aTiles.forEach(function (t) {
              t.getComponent("ZMJTile").setIsTingAct(e);
            });
          },
          setHandTileMask: function (e, t) {
            MJ.GameLogic.TileModel.isDrawDiscardMode()
              ? Log.error(
                  "BIRD\ud83d\ude21>>>",
                  "ZMJHandTileCtrl.js setHandTileMask",
                  "\u6293\u6253\u6a21\u5f0f\u4e0b\u5f3a\u5236\u4fdd\u8bc1\u6293\u6253\u5c1d\u8bd5\u6539\u53d8\u8499\u5c42\u5c06\u4e0d\u751f\u6548",
                )
              : this._aTiles.forEach(function (i, a, o) {
                  var n = i.getComponent("ZMJTile");
                  (n.setMask(!t), e && e(n.tileValue, a, o) && n.setMask(t));
                });
          },
          setHandTileTag: function (e, t) {
            this._aTiles.forEach(function (i) {
              var o = i.getComponent("ZMJTile"),
                n = a.toTileValue(o.tileValue),
                s = o.getTileTag() || g_tConst.eTileTag.None;
              (t && t(n) && (Log.info("!>setHandTileTag enbleTileTag", e), (s = e)),
                i.emit("SET_TILE_TAG", { nTagType: s }));
            });
          },
          setTriggerBlcok: function (e, t) {
            this._aTiles.forEach(function (i) {
              i.getComponent("ZMJTile").setTriggerBlock(e, t);
            });
          },
          getAllHandTiles: function () {
            return this._aTiles;
          },
          getTileIndex: function (e) {
            for (var t = 0; t < this._aTiles.length; t++) if (e == this._aTiles[t]) return t;
            return -1;
          },
          showChooseTileHint: function (e) {
            this._aTiles.forEach(function (t) {
              var i = t.getComponent("ZMJTile");
              i.setTileHint(i.tileValue === e);
            });
          },
          _sendChooseTileEvent: function (e) {
            var t = new cc.Event.EventCustom("CHOOSE_TILE", !0);
            (t.setUserData({ tileValue: e }), this.node.dispatchEvent(t));
          },
          setUnSelectTilesInfo: function (e) {
            this._unSelectTilesInfo = e;
          },
          checkIsCanSelect: function (e) {
            return (
              !this._unSelectTilesInfo ||
              !this._unSelectTilesInfo.tileValues ||
              -1 == this._unSelectTilesInfo.tileValues.indexOf(e) ||
              (this._unSelectTilesInfo.callBack && this._unSelectTilesInfo.callBack(e), !1)
            );
          },
          setHandTileActiveHot: function (e, t) {
            (void 0 === t && (t = !1), (t = this.direction === i.Mine));
            var a = 0;
            this._aTiles.forEach(function (i) {
              ((a += t ? 0.01 : 0),
                cc
                  .tween(i)
                  .delay(a)
                  .call(function () {
                    i.getComponent("ZMJTile").setActiveHot(e);
                  })
                  .start());
            });
          },
          checkBlockCard: function (e) {
            if (this._aTiles && this._aTiles.length > 0) {
              if (this._aTiles[this._aTiles.length - 1].getComponent("ZMJTile").tileValue != e) {
                for (var t = 0, i = 0; i < this._aTiles.length; i++)
                  if (this._aTiles[i].getComponent("ZMJTile").tileValue == e) {
                    t = i;
                    break;
                  }
                var a = this._aTiles.splice(t, 1);
                this._aTiles.push(a[0]);
              }
              this.layoutTiles();
            }
          },
          getTargetDelIndex: function (e) {
            var t = -1;
            if (Array.isArray(this._delIndexStatus) && "number" == typeof this._delIndexStatus[e]) {
              ((t = this._delIndexStatus[e]), (this._delIndexStatus[e] = -1));
              for (var i = 0, a = 0; a < this._delIndexStatus.length; a++)
                this._delIndexStatus[a] >= 0 && ((this._delIndexStatus[a] = i), i++);
            }
            return t;
          },
          initHuDelIndexStatus: function () {
            var e = MJ.GameLogic.TileModel.getLeftDrawTilesNum(this.direction);
            if (e > 0) {
              for (var t = [], i = 0; i < e; ) (t.push(i), i++);
              this._delIndexStatus = t;
            }
          },
          setHuDelIndex: function (e) {
            this._huDelIndex = e;
          },
          getSideHandTile: function () {
            var e = null,
              t = null,
              i = 0,
              a = 1 / 0;
            return (
              this._aTiles.length > 0 &&
                this._aTiles.forEach(function (o) {
                  (o.x > i && ((e = o), (i = o.x)), o.x < a && ((t = o), (a = o.x)));
                }),
              { first: t, last: e }
            );
          },
        }),
          cc._RF.pop());
      },
      { Direction: "Direction", tileLogicHelper: "tileLogicHelper" },
    ],
