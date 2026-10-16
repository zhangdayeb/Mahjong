    ZMJTileInterface: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "7886137kt9Fkq7DK5lrfVch", "ZMJTileInterface");
        var i = e("Direction"),
          a = e("tileLogicHelper"),
          o = cc.Class({
            name: "tiles",
            properties: {
              direction: { type: i, default: 1 },
              handtile: cc.Node,
              opentile: cc.Node,
              outtile: cc.Node,
              cpgtile: cc.Node,
              hutile: cc.Node,
            },
          });
        (cc.Class({
          extends: Cls_BaseView,
          properties: { oTiles: [o], tileAnim: cc.Node, AllPlayerTiles: [cc.Node] },
          Awake: function () {
            ((this._handTileStartPos = [null, null, null, null]),
              (this._lastOutTiles = []),
              (this._lastOutTileViewSeatId = 0),
              (this._outTileAnimIdx = 0),
              this._onCustomEvent(),
              (this._resumeDanStack = !1),
              this.updateAllPlayerNodeLayout());
          },
          resetAllTiles: function () {
            for (var e = 0; e < 4; e++) {
              var t = this.getHandTileCtrl(e);
              t && t.resetTile();
              var i = this.getCPGTileCtrl(e);
              i && i.resetTile();
              var a = this.getOutTileCtrl(e);
              a && a.resetTile();
              var o = this.getOpenTileCtrl(e);
              o && o.resetTile();
              var n = this.getHuTileCtrl(e);
              n && n.resetTile();
            }
            g_oEvent.dispatchEvent(g_tEvent.ZMJTILE_INTERFACE.RESET_ALL_TILES);
          },
          setHandTiles: function (e, t) {
            for (var i in (g_oMJNetManger.pauseGameLoop("\u8bbe\u7f6e\u624b\u724c"),
            this.scheduleOnce(function () {
              g_oMJNetManger.resumeGameLoop("\u8bbe\u7f6e\u624b\u724c");
            }, 1.5),
            e))
              if (e.hasOwnProperty(i)) {
                var a = this.getOpenTileCtrl(i),
                  o = e[i],
                  n = this.getHandTileCtrl(i);
                n && n.sendHandTiles(o, t, a);
              }
            g_oEvent.dispatchEvent(g_tEvent.ZMJTILE_INTERFACE.SET_HAND_TILES, {
              mHandTileValues: e,
              isNeedAnim: t,
            });
          },
          delHandTiles: function (e, t, i) {
            (this.getHandTileCtrl(e).delHandTiles(t, i),
              g_oEvent.dispatchEvent(g_tEvent.ZMJTILE_INTERFACE.DEL_HAND_TILES, {
                nViewSeatId: e,
                aDelTileValues: t,
                isNeedAnim: i,
              }));
          },
          delHandTilesUnExcute: function (e, t) {
            MJ.GameLogic._tileModel.onDrawTile(e, t, !1);
          },
          drawTiles: function (e, t, i, a, o) {
            var n = this,
              s = this.getHandTileCtrl(e),
              r = this.getOpenTileCtrl(e);
            (s.drawTiles(t, r, i, a, o),
              e === g_tConst.GameConfig.ViewSeat.SeatMine &&
                t.forEach(function (e) {
                  n.showChooseTileHint(e);
                }),
              g_oEvent.dispatchEvent(g_tEvent.ZMJTILE_INTERFACE.DRAW_TILES, {
                nViewSeatId: e,
                aDrawTileValues: t,
                bHaoPai: a,
              }));
          },
          drawTilesMultiple: function (e, t) {
            var i = this.getHandTileCtrl(e);
            (this.getOpenTileCtrl(e),
              MJ.GameLogic.TileModel.setCanSetLeftDrawTile(e, !0),
              MJ.GameLogic.TileModel.setLeftDrawTilesNum(e, t.length),
              i.drawHandTilesMultiple(t, !0),
              g_tConst.GameConfig.ViewSeat.SeatMine);
          },
          drawTilesUnExcute: function (e, t) {
            this.delHandTiles(e, t, !1);
          },
          chowTiles: function (e, t, i) {
            (this.getCPGTileCtrl(e).getComponent("ZMJCPGTileCtrl").setChowTiles(t, i),
              g_oEvent.dispatchEvent(g_tEvent.ZMJTILE_INTERFACE.CHOW_TILES, {
                nViewSeatId: e,
                aChowTileValues: t,
                nLastViewSeatId: i,
              }));
          },
          chowTilesUnExcute: function (e, t, i) {
            this.getCPGTileCtrl(e).getComponent("ZMJCPGTileCtrl").setChowTilesUnExcute(t, i);
          },
          pengTiles: function (e, t, i) {
            (console.log("Roy_peng", e, t, i),
              this.getCPGTileCtrl(e).getComponent("ZMJCPGTileCtrl").setPengTiles(t, i),
              g_oEvent.dispatchEvent(g_tEvent.ZMJTILE_INTERFACE.PENG_TILES, {
                nViewSeatId: e,
                aPengTileValues: t,
                nLastViewSeatId: i,
              }));
          },
          pengTilesUnExcute: function (e, t, i) {
            this.getCPGTileCtrl(e).getComponent("ZMJCPGTileCtrl").setPengTilesUnExcute(t, i);
          },
          gangTiles: function (e, t, i, a, o) {
            var n = this.getCPGTileCtrl(e);
            (i === g_tConst.BlockCfgs.BlockExposedKong.BlockType
              ? n.getComponent("ZMJCPGTileCtrl").setMGangTiles(t, a, o)
              : i === g_tConst.BlockCfgs.BlockConcealedKong.BlockType ||
                  i === g_tConst.BlockCfgs.BlockConcealedKongForCrazy.BlockType
                ? (MJ.GameLogic.TileModel.setLeftDrawTilesNum(e, -1),
                  n.getComponent("ZMJCPGTileCtrl").setAGangTiles(t))
                : i === g_tConst.BlockCfgs.BlockPatchedKong.BlockType &&
                  (MJ.GameLogic.TileModel.setLeftDrawTilesNum(e, -1),
                  n.getComponent("ZMJCPGTileCtrl").setWGangTiles(t, a)),
              g_oEvent.dispatchEvent(g_tEvent.ZMJTILE_INTERFACE.GAME_TILES, {
                nViewSeatId: e,
                aGangTileValues: t,
                BlockType: i,
                nLastViewSeatId: a,
              }));
          },
          gangTilesUnExcute: function (e, t, i, a) {
            var o = this.getCPGTileCtrl(e);
            i === g_tConst.BlockCfgs.BlockExposedKong.BlockType
              ? o.getComponent("ZMJCPGTileCtrl").setMGangTilesUnExcute(t, a)
              : i === g_tConst.BlockCfgs.BlockConcealedKong.BlockType
                ? o.getComponent("ZMJCPGTileCtrl").setAGangTilesUnExcute(t)
                : i === g_tConst.BlockCfgs.BlockPatchedKong.BlockType &&
                  o.getComponent("ZMJCPGTileCtrl").setWGangTilesUnExcute(t, a);
          },
          danTiles: function (e, t, i, a) {
            var o = this.getCPGTileCtrl(e).getComponent("ZMJCPGTileCtrl");
            t
              ? MJ.GameLogic._returnGame && !this._resumeDanStack
                ? o.resumeDanStack(e, i, a)
                : o.setGuoDanTiles(t, i, a)
              : o.setMingDanTiles(e, i, a);
          },
          outTile: function (e, t, i, a) {
            (void 0 === a && (a = !0), this.hideAllDiamond());
            var o = this.getOutTileCtrl(e);
            (o && o.addOutTile(t, i, a),
              e === g_tConst.GameConfig.ViewSeat.SeatMine && this.showChooseTileHint(-1));
          },
          outTileMultiple: function (e, t, i, a) {
            (void 0 === a && (a = !0), this.hideAllDiamond());
            var o = this.getOutTileCtrl(e);
            if (o) for (var n = 0; n < t.length; n++) o.addOutTile(t[n], n == i, a);
            e === g_tConst.GameConfig.ViewSeat.SeatMine && this.showChooseTileHint(-1);
          },
          outTileUnExcute: function (e, t, i, a) {
            void 0 === a && (a = !0);
            var o = this.getOutTileCtrl(e);
            o && o.popOutTile(t);
          },
          setJiPaiFlag: function (e) {
            var t = e.nViewSeatId,
              i = this.getOutTileCtrl(t);
            i && i.setJiPaiFlag(e);
          },
          setCPGTileFlag: function (e) {
            var t = e.nViewSeatId,
              i = this.getCPGTileCtrl(t);
            i && i.setCPGTileFlag(e);
          },
          popOutTile: function (e, t, i) {
            (void 0 === t && (t = null), void 0 === i && (i = 0));
            var a = this.getOutTileCtrl(e);
            a && null != t && a.popOutTileAutoLayout(t, i);
          },
          openTile: function (e, t) {
            var i = this.getOpenTileCtrl(e),
              a = this.getCPGTileCtrl(e);
            if (a) {
              var o = a.getEdgeWorldPos();
              i.setOpenTileValues(t, o, e);
            }
          },
          huTile: function (e, t, i, a) {
            return this.getHuTileCtrl(e).pushHuTile(t, i, a);
          },
          pushFlowerTile: function (e, t, i) {
            (this.getHuTileCtrl(e).pushFlowerTile(t),
              i && t.length > 0 && g_oEvent.dispatchEvent(g_tEvent.PLAY_BU_HUA_SOUND, t[0], e));
          },
          showHuTip: function (e) {
            this.getHandTileCtrl(g_tConst.GameConfig.ViewSeat.SeatMine).showHuTip(e);
          },
          setHandTileTingFlag: function (e) {
            this.getHandTileCtrl(g_tConst.GameConfig.ViewSeat.SeatMine).setIsTingAct(e);
          },
          hideHuTip: function () {
            this.getHandTileCtrl(g_tConst.GameConfig.ViewSeat.SeatMine).hideHuTip();
          },
          delAllHandTiles: function (e) {
            var t = this.getHandTileCtrl(e);
            t && t.resetTile();
          },
          delOpenTiles: function (e, t) {
            var i = this.getOpenTileCtrl(e);
            (i && i.delOpenTiles(t),
              g_oEvent.dispatchEvent(g_tEvent.ZMJTILE_INTERFACE.DEL_OPEN_TILES, {
                nViewSeatId: e,
                aDelOpenTiles: t,
              }));
          },
          hideAllDiamond: function () {
            for (var e = 0; e < 4; e++) {
              var t = this.getOutTileCtrl(e);
              t && t.hideAllDiamond();
            }
          },
          playHszAnim: function (e, t, i) {
            (void 0 === i && (i = null),
              this.getHandTileCtrl(e).playHszAnim(t, i),
              g_oEvent.dispatchEvent(g_tEvent.ZMJTILE_INTERFACE.PLAY_HSZ_ANIM, {
                nViewSeatID: e,
                tChangeAftTiles: t,
                oOpenTileCtrl: i,
              }));
          },
          getHuTileCtrl: function (e) {
            var t = this.oTiles[e];
            if (void 0 !== t) {
              var i = t.hutile.getComponent("ZMJHuTileCtrl");
              return ((t.hutile.active = !0), i);
            }
            Log.error("Error:getHuTileCtrl Is Undefine", e);
          },
          getOpenTileCtrl: function (e) {
            var t = this.oTiles[e];
            if (void 0 !== t) {
              var i = t.opentile.getComponent("ZMJOpenTileCtrl");
              return ((t.opentile.active = !0), i);
            }
            Log.error("Error:getOpenTileCtrl Is Undefine", e);
          },
          getOutTileCtrl: function (e) {
            var t = this.oTiles[e];
            if (void 0 !== t) {
              var i = t.outtile.getComponent("ZMJOutTileCtrl");
              return ((t.outtile.active = !0), i);
            }
            Log.error("Error:getOutTileCtrl is Undefine", e);
          },
          getCPGTileCtrl: function (e) {
            var t = this.oTiles[e];
            if (void 0 !== t) {
              var i = t.cpgtile.getComponent("ZMJCPGTileCtrl");
              return ((t.cpgtile.active = !0), i);
            }
            Log.error("Error:getCPGCtrl is Undefine", e);
          },
          getHandTileCtrl: function (e) {
            var t = this.oTiles[e];
            if (void 0 !== t) {
              var i = t.handtile.getComponent("ZMJHandTileCtrl");
              return ((t.handtile.active = !0), i);
            }
            Log.error("Error:getHandTileCtrl is Undefine", e);
          },
          getOffSetPadding: function () {
            return new cc.Vec3(0, 0, 0);
          },
          showChooseTileHint: function (e) {
            var t = MJ.GameLogic.PlayerModel.playersInfo;
            for (var i in t)
              if (t.hasOwnProperty(i)) {
                var a = t[i].viewSeatID,
                  o = this.getCPGTileCtrl(a);
                o && o.showChooseTileHint(e);
                var n = this.getOutTileCtrl(a);
                n && n.showChooseTileHint(e);
                var s = this.getOpenTileCtrl(a);
                s && s.showChooseTileHint(e);
                var r = this.getHuTileCtrl(a);
                r && r.showChooseTileHint(e);
              }
          },
          layoutHandTileRoot: function (e) {
            var t = e.nViewSeatId,
              i = e.needAnim,
              a = (e.resumeGame, this.getHandTileCtrl(t));
            if (a) {
              var o = cc.view.getVisibleSize();
              if (a.getAllHandTiles().length > 0) {
                var n = a.getSideHandTile();
                if (n.last) {
                  var s = n.last.getContentSize();
                  if (t == g_tConst.GameConfig.ViewSeat.SeatMine) {
                    var r = a.node,
                      c = r.position.clone();
                    r.position = new cc.v2(0, 0);
                    var l = s.width / 5,
                      g = n.last.convertToWorldSpaceAR(cc.v2(0, 0)),
                      d = Math.max(0, g.x + s.width / 2 - o.width);
                    if (((r.position = c), d > 0)) {
                      var h = new cc.Vec3(-1, 0, 0).multiplyScalar(d + l);
                      i
                        ? cc
                            .tween(r)
                            .to(
                              g_tConst.CrazyModeCfg.HandTileMoveTime,
                              { position: h },
                              { easing: "cubicOut" },
                            )
                            .start()
                        : (r.position = h);
                    } else {
                      var u = new cc.Vec3(0, 0, 0);
                      i
                        ? cc
                            .tween(r)
                            .to(
                              g_tConst.CrazyModeCfg.HandTileMoveTime,
                              { position: u },
                              { easing: "cubicOut" },
                            )
                            .start()
                        : (r.position = u);
                    }
                    return;
                  }
                }
              }
            }
          },
          getTmpHandTileWidth: function () {
            var e = g_oData.get(g_tData.table3dData).getTile3dContentSize().x;
            return e - 0.1 * e;
          },
          getPerfectRight: function (e) {
            var t = Math.abs(e.x),
              i = Math.abs(e.y),
              a = Math.abs(e.z),
              o = Math.max(a, Math.max(t, i));
            return o == t
              ? new cc.Vec3(t / e.x, 0, 0)
              : o == i
                ? new cc.Vec3(0, i / e.y, 0)
                : o == a
                  ? new cc.Vec3(0, 0, a / e.z)
                  : new cc.Vec3(1, 0, 0);
          },
          onOutTileEnd: function (e) {
            this._lastOutTiles.length > 1 && this.onOutTileMultipleEnd(e);
          },
          onOutTileMultipleEnd: function (e) {
            var t = e.detail.nViewSeatId,
              i = this.getOutTileCtrl(t);
            if (i) {
              var a = this._lastOutTiles.length;
              i.getLastOutTile(a).forEach(function (e) {
                e.active = !0;
              });
            }
          },
          onChupaiHandAnimStart: function () {
            this._lastOutTiles.length;
          },
          generateOutTilePartI: function (e) {
            var t = e.handAnimType,
              i = e.playArgs.handTileTempNode;
            if (cc.isValid(i) && t > 0 && t < 3) {
              i.active = !0;
              for (
                var a = this._lastOutTileViewSeatId,
                  o = this._lastOutTiles.length - 1,
                  n = this._outTileAnimIdx,
                  s = this.getTmpHandTileWidth(),
                  r = new cc.Vec3(1, 0, 0),
                  c = [],
                  l = 0;
                l < o;
                l++
              ) {
                var g = cc.instantiate(i);
                c.push(g);
              }
              for (var d = 0; d < o + 1; d++)
                if (d != n) {
                  var h = d > n ? d - 1 : d,
                    u = r.clone(),
                    _ = c[h],
                    m = Math.abs(d - n),
                    f = d < n ? 1 : -1;
                  if (cc.isValid(_)) {
                    var p = u.multiplyScalar(m * s * f),
                      C = this._lastOutTiles[d];
                    (_.getComponent("ZMJTile").init3D(C, table3dTypeEnum.outtile, a, !1, !0),
                      (_.parent = i),
                      (_.scale = new cc.Vec3(1, 1, 1)),
                      (_.position = p),
                      _.children.length > 0 && (_.children[0].eulerAngles = new cc.Vec3(0, 0, 0)));
                  }
                }
              this.ajustOutTiles(i, t, a, e.playArgs.sex);
            }
          },
          ajustOutTiles: function (e, t, i, a) {
            if (
              (1 == t &&
                0 == a &&
                (e.eulerAngles.add(new cc.Vec3(0, -45, 0)),
                cc
                  .tween(e)
                  .by(g_tConst.eAnimTime.DiscardResult1.ChuPai1, {
                    eulerAngles: new cc.Vec3(0, 45, 0),
                  })
                  .start()),
              2 == t)
            ) {
              var o = e.position.clone();
              (o.add(new cc.Vec3(0, -5e-5, -22e-5)),
                cc.tween(e).to(g_tConst.eAnimTime.DiscardResult1.ChuPai2, { position: o }).start());
            }
          },
          generateOutTilePartII: function (e) {
            var t = e.handAnimType,
              i = e.playArgs.outTileNode;
            if (cc.isValid(i) && t > 0 && t < 3) {
              var a = this._lastOutTileViewSeatId,
                o = MJ.GameViewHandler.tileModule.getComponent(cc.Component).getOutTileCtrl(a);
              if (o) {
                var n = this.getTmpHandTileWidth(),
                  s = this.getPerfectRight(i.children[0].right).multiplyScalar(-1),
                  r = this._lastOutTiles.length,
                  c = o.getLastOutTile(r),
                  l = r - 1 - this._outTileAnimIdx,
                  g = c[l];
                if (cc.isValid(g) && g.uuid == i.uuid) {
                  for (var d = [], h = this._lastOutTiles.length - 1, u = 0; u < h; u++) {
                    var _ = cc.instantiate(i);
                    d.push(_);
                  }
                  for (var m = h; m >= 0; m--)
                    if (m != l) {
                      var f = m > l ? m - 1 : m,
                        p = s.clone(),
                        C = Math.abs(m - l),
                        v = m < l ? 1 : -1,
                        y = d[f];
                      if (cc.isValid(y)) {
                        var S = this._lastOutTiles[m],
                          D = p.multiplyScalar(C * n * v);
                        (y.getComponent("ZMJTile").init3D(S, table3dTypeEnum.outtile, a, !1, !0),
                          (y.parent = i),
                          (y.position = D),
                          (y.scale = new cc.Vec3(1, 1, 1)),
                          (y.active = !0));
                      }
                    }
                  i.eulerAngles.add(new cc.Vec3(0, 180, 0));
                }
              }
            }
          },
          _onCustomEvent: function () {
            var e = this;
            (this.node.on(
              "SET_JIPAI_FLAG",
              function (e) {
                this.setJiPaiFlag(e);
              },
              this,
            ),
              this.node.on(
                "SET_CPGTILE_FLAG",
                function (e) {
                  this.setCPGTileFlag(e);
                },
                this,
              ),
              this.node.on(
                "RESET_TILES",
                function () {
                  this.resetAllTiles();
                },
                this,
              ),
              this.node.on(
                "SET_HAND_TILES",
                function (e) {
                  var t = e.data;
                  this.setHandTiles(t, !0);
                },
                this,
              ),
              this.node.on(
                "PLAY_CUOPAI_ANIM",
                function (e) {
                  var t = e.detail;
                  this.tileAnim.emit("PLAY_CUOPAI_ANIM", t);
                },
                this,
              ),
              this.node.on(
                "DRAW_TILES",
                function (e) {
                  for (
                    var t = this, i = e.data, o = e.nViewSeatId, n = e.bHaoPai, s = !1, r = 0;
                    r < i.length;
                    r++
                  )
                    a.isFlower(i[r]) && (s = !0);
                  var c = !1;
                  if (o == g_tConst.GameConfig.ViewSeat.SeatMine && !s) {
                    var l = i[0],
                      g = g_oData.get(g_tData.ZMJDrawTileAnimData).isPlayDrawTileByTileValue(l);
                    c = g;
                  }
                  MJ.GameAnimMgr.orderedPlayAnim(
                    function () {
                      t.drawTiles(o, i, c, n, s);
                    },
                    {
                      playDesc: "\u6478\u724c",
                      pauseGameLoop: g_tConst.OutTileAnimTime.BeforeOutTile,
                    },
                  );
                },
                this,
              ),
              this.node.on(
                "DRAW_TILES_MULTIPLE",
                function (e) {
                  var t = this,
                    i = e.data,
                    a = e.nViewSeatId;
                  (e.bHaoPai,
                    MJ.GameAnimMgr.orderedPlayAnim(
                      function () {
                        t.drawTilesMultiple(a, i);
                      },
                      {
                        playDesc: "\u6478\u724c",
                        pauseGameLoop: g_tConst.OutTileAnimTime.BeforeOutTile,
                      },
                    ));
                },
                this,
              ),
              this.node.on(
                "DRAW_TILES_UNEXCUTE",
                function (e) {
                  var t = e.data,
                    i = e.nViewSeatId,
                    a = e.bHaoPai;
                  this.drawTilesUnExcute(i, t, a);
                },
                this,
              ),
              this.node.on(
                "OUT_TILE",
                function (e) {
                  var t = e.data,
                    i = e.nViewSeatId;
                  ((this._lastOutTiles = [t]),
                    (this._lastOutTileViewSeatId = i),
                    MJ.GameLogic.TileModel.setLeftDrawTilesNum(i, -1),
                    this.outTile(i, t, !0),
                    this.delHandTiles(i, [t], !0));
                },
                this,
              ),
              this.node.on(
                "OUT_TILE_TEACH",
                function (e) {
                  var t = e.data,
                    i = e.nViewSeatId;
                  this.outTile(i, t, !1);
                },
                this,
              ),
              this.node.on(
                "OUT_TILE_MULTIPLE",
                function (e) {
                  var t = e.data,
                    i = e.nViewSeatId,
                    a = t.length,
                    o = a > 2 ? Math.trunc(a / 2) : 0;
                  ((this._lastOutTiles = t.slice(0, t.length)),
                    (this._lastOutTileViewSeatId = i),
                    (this._outTileAnimIdx = o),
                    MJ.GameLogic.TileModel.setLeftDrawTilesNum(i, -1 * a),
                    this.outTileMultiple(i, t, o),
                    this.delHandTiles(i, t, !0));
                  var n = this.getOutTileCtrl(i);
                  if (n) for (var s = n.getLastOutTile(a), r = 0; r < a; r++) s[r].active = !1;
                },
                this,
              ),
              this.node.on(
                "OUT_TILES_FINISHED",
                function (e) {
                  this.onOutTileEnd(e);
                },
                this,
              ),
              this.node.on(
                "ON_CHUPAI_ANIM_START",
                function (e) {
                  this.onChupaiHandAnimStart(e);
                },
                this,
              ),
              this.node.on(
                "OUT_TILE_UNEXCUTE",
                function (e) {
                  var t = e.data,
                    i = e.nViewSeatId;
                  (this.outTileUnExcute(i, t, !0), this.delHandTilesUnExcute(i, [t], !0));
                },
                this,
              ),
              this.node.on(
                "OUT_SERIES_TILES",
                function (e) {
                  var t = this,
                    i = e.aOutTiles instanceof Array ? e.aOutTiles : [],
                    a = e.nViewSeatId,
                    o = e.isAnime;
                  (this.delHandTiles(a, i, o),
                    i.forEach(function (e) {
                      (fSET_HAND_TILES_Teach, t.outTile(a, e, o, !1));
                    }));
                },
                this,
              ),
              this.node.on(
                "OUT_LAI_GEN",
                function (e) {
                  var t = e.aLaiGen[0],
                    i = e.nBankerViewId;
                  this.outTile(i, t, !1, !1);
                },
                this,
              ),
              this.node.on(
                "CHOW_TILE",
                function (e) {
                  var t = e.aShowTileValues,
                    i = e.aDeleteTileValues,
                    a = e.nViewSeatId,
                    o = e.nLastViewSeatId;
                  (this.chowTiles(a, t, o),
                    this.delHandTiles(a, i),
                    this.delOpenTiles(a, i),
                    this.popOutTile(o, t[1]),
                    this.hideOutTileAnimOnDesk());
                },
                this,
              ),
              this.node.on(
                "CHOW_TILE_UNEXCUTE",
                function (e) {
                  var t = e.aShowTileValues,
                    i = e.aDeleteTileValues,
                    a = e.nViewSeatId,
                    o = e.nLastViewSeatId,
                    n = e.iTriggerCard;
                  (this.chowTilesUnExcute(a, t, o), this.delHandTilesUnExcute(a, i));
                  var s = this.getOutTileCtrl(o);
                  s && s.addOutTile(n, !1, !1);
                },
                this,
              ),
              this.node.on(
                "PENG_TILE",
                function (e) {
                  var t = e.aShowTileValues,
                    i = e.aDeleteTileValues,
                    a = e.nViewSeatId,
                    o = e.nLastViewSeatId;
                  (this.pengTiles(a, t, o),
                    this.delHandTiles(a, i),
                    this.delOpenTiles(a, i),
                    this.popOutTile(o, t[0]),
                    this.hideOutTileAnimOnDesk());
                },
                this,
              ),
              this.node.on(
                "PENG_TILE_UNEXCUTE",
                function (e) {
                  var t = e.aShowTileValues,
                    i = e.aDeleteTileValues,
                    a = e.nViewSeatId,
                    o = e.nLastViewSeatId,
                    n = e.iTriggerCard;
                  (this.pengTilesUnExcute(a, t, o), this.delHandTilesUnExcute(a, i));
                  var s = this.getOutTileCtrl(o);
                  s && s.addOutTile(n, !1, !1);
                },
                this,
              ),
              this.node.on(
                "SHOW_TING_CANCEL",
                function () {
                  (MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_MASK", {
                    bMask: !1,
                    nViewSeatId: g_tConst.GameConfig.ViewSeat.SeatMine,
                    enbleCtrlTile: function () {
                      return !0;
                    },
                  }),
                    this.setHandTileTingFlag(!1));
                },
                this,
              ),
              this.node.on(
                "TING_ACTION",
                function (e) {
                  var t = e.aBlockInfos[0].stBlockCard;
                  (MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_MASK", {
                    bMask: !1,
                    nViewSeatId: g_tConst.GameConfig.ViewSeat.SeatMine,
                    enbleCtrlTile: function (e) {
                      for (var i = 0; i < t.length; i++) if (t[i].iCards[0] === e) return !0;
                      return !1;
                    },
                  }),
                    this.setHandTileTingFlag(!0));
                },
                this,
              ),
              this.node.on(
                "DAN_TILE",
                function (e) {
                  var t = e.aShowTileValues,
                    i = e.aDeleteTileValues,
                    a = e.nViewSeatId,
                    o = e.nDanType,
                    n = e.iTriggerCard;
                  (this.danTiles(a, n, t, o),
                    this.delHandTiles(a, i),
                    this.delOpenTiles(a, i),
                    this.hideOutTileAnimOnDesk());
                },
                this,
              ),
              this.node.on(
                "GANG_TILE",
                function (e) {
                  var t = e.aShowTileValues,
                    i = e.aDeleteTileValues,
                    a = e.nBlockTile,
                    o = e.nViewSeatId,
                    n = e.nGangType,
                    s = e.nLastViewSeatId;
                  (this.gangTiles(o, t, n, s, a),
                    this.delHandTiles(o, i),
                    this.delOpenTiles(o, i),
                    this.hideOutTileAnimOnDesk(),
                    n === g_tConst.BlockCfgs.BlockExposedKong.BlockType
                      ? this.popOutTile(s, a)
                      : n === g_tConst.BlockCfgs.BlockConcealedKong.BlockType ||
                        n === g_tConst.BlockCfgs.BlockConcealedKongForCrazy.BlockType ||
                        g_tConst.BlockCfgs.BlockPatchedKong.BlockType);
                },
                this,
              ),
              this.node.on(
                "GANG_TILE_UNEXCUTE",
                function (e) {
                  var t = e.aShowTileValues,
                    i = e.aDeleteTileValues,
                    a = (e.nBlockTile, e.nViewSeatId),
                    o = e.nGangType,
                    n = e.nLastViewSeatId,
                    s = e.iTriggerCard;
                  if (
                    (this.gangTilesUnExcute(a, t, o, n),
                    this.delHandTilesUnExcute(a, i),
                    o === g_tConst.BlockCfgs.BlockExposedKong.BlockType)
                  ) {
                    var r = this.getOutTileCtrl(n);
                    r && r.addOutTile(s, !1, !1);
                  } else
                    o === g_tConst.BlockCfgs.BlockConcealedKong.BlockType ||
                      g_tConst.BlockCfgs.BlockPatchedKong.BlockType;
                },
                this,
              ),
              this.node.on(
                "HU_TILE",
                function (e) {
                  var t = e,
                    i = t.nViewSeatId,
                    a = t.nHuTileValue,
                    o = t.bIsZiMo,
                    n = t.nLastViewSeatId,
                    s = t.isTransparent,
                    r = t.iHuCardVirtualStatus,
                    c = t.isYiPaoDuoXiang,
                    l = e.isUniversalCard || !1,
                    g = "number" == typeof e.huDelIndex ? e.huDelIndex : -1,
                    d = this.getHandTileCtrl(i);
                  (this.hideOutTileAnimOnDesk(),
                    o
                      ? (MJ.GameLogic.TileModel.setLeftDrawTilesNum(i, -1),
                        d && d.setHuDelIndex(g),
                        this.delHandTiles(i, [a]),
                        d && d.setHuDelIndex(-1))
                      : this.popOutTile(n, a, r));
                  var h = this.huTile(i, a, !0, !1);
                  cc.isValid(h) &&
                    (c && s && (h.opacity = 200),
                    l && h.emit("SHOW_AS_UNIVERSAL_CARD", { nViewSeatId: i, showMode: 2 }));
                },
                this,
              ),
              this.node.on(
                "SET_LAI_OR_PI",
                function (e) {
                  var t = e,
                    i = t.nTileValue,
                    a = t.nViewSeatId;
                  (this.hideOutTileAnimOnDesk(), this.popOutTile(a, i), this.huTile(a, i, !0, !1));
                },
                this,
              ),
              this.node.on(
                "BU_HUA_TILE",
                function (e) {
                  var t = e.nViewSeatId,
                    i = e.aFlowerTiles;
                  (MJ.GameLogic.TileModel.setLeftDrawTilesNum(t, -i.length),
                    this.delHandTiles(t, i, !1),
                    this.pushFlowerTile(t, i, !0));
                },
                this,
              ),
              this.node.on(
                "RESUME_ALL_TILES",
                function (e) {
                  var t = this;
                  (Log.warn("ZMJTileInterface.js RESUME_ALL_TILES >"),
                    (MJ.GameLogic.TableModel.tileResuming = !0));
                  var i = e;
                  (console.log("roy___RESUME_ALL_TILES", i),
                    this.hideAllDiamond(),
                    this.setHandTiles(i.mHandTileValues, !1));
                  var a = i.mChowTileValues;
                  for (var o in a)
                    if (a.hasOwnProperty(o)) {
                      var n = a[o];
                      if (n)
                        for (var s = 0; s < n.length; s++) {
                          var r = n[s].iCard,
                            c = n[s].iTriggerCard;
                          if (-1 !== r.indexOf(c)) {
                            var l = r.indexOf(c),
                              g = r[1];
                            ((r[1] = r[l]), (r[l] = g));
                          }
                          var d = n[s].iSrcSeatID,
                            h = MJ.GameLogic.PlayerModel.getViewSeatId(d);
                          this.chowTiles(o, r, h);
                        }
                    }
                  var u = i.mPengTileValues;
                  for (var _ in u)
                    if (u.hasOwnProperty(_)) {
                      var m = u[_];
                      if (m)
                        for (var f = 0; f < m.length; f++) {
                          var p = m[f].iCard,
                            C = m[f].iSrcSeatID,
                            v = MJ.GameLogic.PlayerModel.getViewSeatId(C);
                          this.pengTiles(_, p, v);
                        }
                    }
                  var y = i.mDanTileValues;
                  for (var S in y)
                    if (y.hasOwnProperty(S)) {
                      var D = y[S];
                      if (D)
                        for (var T = 0; T < D.length; ++T) {
                          var I = D[T].iCard,
                            E = D[T].eBlockType,
                            M = D[T].iTriggerCard;
                          this.danTiles(S, M, I, E);
                        }
                    }
                  this._resumeDanStack = !0;
                  var L = i.mGangTileValues;
                  for (var A in L)
                    if (L.hasOwnProperty(A))
                      for (var P = L[A], N = 0; N < P.length; N++) {
                        var w = P[N],
                          R = w.iCard,
                          b = w.eBlockType,
                          G = w.iSrcSeatID,
                          k = MJ.GameLogic.PlayerModel.getViewSeatId(G);
                        this.gangTiles(A, R, b, k);
                      }
                  var B = i.mOutTileValues;
                  for (var F in B)
                    if (B.hasOwnProperty(F))
                      for (var x = B[F], O = 0; O < x.length; O++) {
                        var H = x[O];
                        this.outTile(F, H, !1);
                      }
                  var U = i.mHuTileValues,
                    V = i.mHuTileVirtualStatus;
                  for (var J in U)
                    if (U.hasOwnProperty(J))
                      for (var W = U[J], Z = V[J], K = 0; K < W.length; K++) {
                        var Y = W[K],
                          q = this.huTile(J, Y, !1);
                        q && 1 == Z[K] && (q.opacity = 200);
                      }
                  var z = i.mHuaTileValues;
                  for (var j in z)
                    if (z.hasOwnProperty(j)) {
                      var X = z[j];
                      this.pushFlowerTile(j, X, !1);
                    }
                  (this.scheduleOnce(function () {
                    console.log("lqr...", "\u52a0\u724c", ".......");
                    var e = i.mExtraHandTileValues;
                    for (var a in e)
                      if (e.hasOwnProperty(a)) {
                        var o = t.getHandTileCtrl(a);
                        if (o) {
                          var n = e[a],
                            s = n.iExtraHandCard,
                            r = n.iUniversal;
                          if (0 == s.length && 1 == r.length)
                            (console.log("lqr...", "\u52a0\u724c", 1),
                              MJ.GameLogic.TileModel.setLeftDrawTilesNum(a, 1),
                              t.layoutHandTileRoot({
                                nViewSeatId: a,
                                needAnim: !1,
                                resumeGame: !0,
                              }));
                          else if (s.length > 0) {
                            (console.log("lqr...", "\u52a0\u724c", s.length),
                              MJ.GameLogic.TileModel.setCanSetLeftDrawTile(a, !0),
                              MJ.GameLogic.TileModel.setLeftDrawTilesNum(a, s.length));
                            for (var c = 0; c < s.length; c++) {
                              var l = s[c];
                              MJ.GameLogic.TileModel.mHandTileValues.arrayPush(a, l);
                            }
                            (o.drawHandTilesMultiple(s, !1),
                              t.layoutHandTileRoot({
                                nViewSeatId: a,
                                needAnim: !1,
                                resumeGame: !0,
                              }));
                          }
                        }
                      }
                    e && e.clear();
                  }, 0),
                    (MJ.GameLogic.TableModel.tileResuming = !1));
                },
                this,
              ),
              this.node.on(
                "RESUME_ALL_TILES_TEACH",
                function (e) {
                  (Log.warn("ZMJTileInterface.js RESUME_ALL_TILES >"),
                    (MJ.GameLogic.TableModel.tileResuming = !0));
                  var t = e;
                  (console.log("roy___RESUME_ALL_TILES", t),
                    this.hideAllDiamond(),
                    this.setHandTiles(t.mHandTileValues, !1));
                  var i = t.mChowTileValues;
                  for (var a in i)
                    if (i.hasOwnProperty(a)) {
                      var o = i[a];
                      if (o)
                        for (var n = 0; n < o.length; n++) {
                          var s = o[n].iCard,
                            r = o[n].iTriggerCard;
                          if (-1 !== s.indexOf(r)) {
                            var c = s.indexOf(r),
                              l = s[1];
                            ((s[1] = s[c]), (s[c] = l));
                          }
                          var g = t.iSrcSeatID;
                          this.chowTiles(a, s, g);
                        }
                    }
                  var d = t.mPengTileValues;
                  for (var h in d)
                    if (d.hasOwnProperty(h)) {
                      var u = d[h];
                      if (u)
                        for (var _ = 0; _ < u.length; _++) {
                          var m = u[_].iCard,
                            f = u[_].iSrcSeatID;
                          this.pengTiles(h, m, f);
                        }
                    }
                  var p = t.mDanTileValues;
                  for (var C in p)
                    if (p.hasOwnProperty(C)) {
                      var v = p[C];
                      if (v)
                        for (var y = 0; y < v.length; ++y) {
                          var S = v[y].iCard,
                            D = v[y].eBlockType,
                            T = v[y].iTriggerCard;
                          this.danTiles(C, T, S, D);
                        }
                    }
                  this._resumeDanStack = !0;
                  var I = t.mGangTileValues;
                  for (var E in I)
                    if (I.hasOwnProperty(E))
                      for (var M = I[E], L = 0; L < M.length; L++) {
                        var A = M[L],
                          P = A.iCard,
                          N = A.eBlockType,
                          w = t.iSrcSeatID;
                        this.gangTiles(E, P, N, w);
                      }
                  var R = t.mOutTileValues;
                  for (var b in R)
                    if (R.hasOwnProperty(b))
                      for (var G = R[b], k = 0; k < G.length; k++) {
                        var B = G[k];
                        this.outTile(b, B, !1, !1);
                      }
                  var F = t.mHuTileValues,
                    x = t.mTransparentHuTile;
                  for (var O in F)
                    if (F.hasOwnProperty(O))
                      for (var H = F[O], U = x[O], V = 0; V < H.length; V++) {
                        var J = H[V],
                          W = this.huTile(O, J, !1);
                        W && 1 == U[V] && (W.opacity = 200);
                      }
                  var Z = t.mHuaTileValues;
                  for (var K in Z)
                    if (Z.hasOwnProperty(K)) {
                      var Y = Z[K];
                      this.pushFlowerTile(K, Y, !1);
                    }
                  var q = t.mExtraHandTileValues;
                  for (var z in q)
                    if (q.hasOwnProperty(z)) {
                      var j = this.getHandTileCtrl(z);
                      if (j) {
                        var X = q[z],
                          Q = X.iExtraHandCard,
                          $ = X.iUniversal;
                        if (0 == Q.length && 1 == $.length)
                          (MJ.GameLogic.TileModel.setLeftDrawTilesNum(z, 1),
                            this.layoutHandTileRoot({
                              nViewSeatId: z,
                              needAnim: !1,
                              resumeGame: !0,
                            }));
                        else if (Q.length > 0) {
                          MJ.GameLogic.TileModel.setLeftDrawTilesNum(z, Q.length);
                          for (var ee = 0; ee < Q.length; ee++) {
                            var te = Q[ee];
                            MJ.GameLogic.TileModel.mHandTileValues.arrayPush(z, te);
                          }
                          (j.drawHandTilesMultiple(Q, !1),
                            0 == z &&
                              this.layoutHandTileRoot({
                                nViewSeatId: z,
                                needAnim: !1,
                                resumeGame: !0,
                              }));
                        }
                      }
                    }
                  (q && q.clear(), (MJ.GameLogic.TableModel.tileResuming = !1));
                },
                this,
              ),
              this.node.on(
                "TING_TIP",
                function (e) {
                  var t = e.tTingInfos;
                  this.showHuTip(t);
                },
                this,
              ),
              this.node.on(
                "HIDE_TING_TIP",
                function () {
                  this.hideHuTip();
                },
                this,
              ),
              this.node.on(
                "CPG_UPDATE",
                function (e) {
                  var t = e.detail,
                    i = t.direction;
                  (t.edgeWorldPos, t.stackCont, this.getOpenTileCtrl(i).updateStartPos(t));
                },
                this,
              ),
              this.node.on(
                "OPEN_UPDATE",
                function (e) {
                  var t = e.detail,
                    i = t.direction;
                  (t.edgeWorldPos, t.stackCont, this.getHandTileCtrl(i).updateStartPos(t));
                },
                this,
              ),
              this.node.on(
                "OUT_TILE_ANIM",
                function (e) {
                  var t = e.detail.nViewSeatId,
                    i = this.getOutTileCtrl(t);
                  (i && ((e.detail.rowLen = i.getRowLen()), (e.detail.floorLen = i.getFloorLen())),
                    this.tileAnim.emit("PLAY_OUT_ANIM", e.detail));
                },
                this,
              ),
              this.node.on(
                "CPG_HAND_ANIM",
                function (t) {
                  var i = t.detail;
                  e.tileAnim.emit("CPG_HAND_ANIM", i);
                },
                this,
              ),
              this.node.on(
                "HSZ_HAND_ANIM",
                function (t) {
                  var i = t.detail;
                  e.tileAnim.emit("HSZ_HAND_ANIM", i);
                },
                this,
              ),
              this.node.on("HIDE_OUT_TILE_ON_DESK", function () {
                e.hideOutTileAnimOnDesk();
              }),
              this.node.on(
                "SEND_TILE_ANIM",
                function (e) {
                  this.tileAnim.emit("PLAY_SEND_ANIM", e.detail);
                },
                this,
              ),
              this.node.on(
                "SET_OPEN_TILE",
                function (e) {
                  for (var t = e, i = 0; i < t.length; i++) {
                    var a = t[i],
                      o = MJ.GameLogic.PlayerModel.getViewSeatIdByUserID(a.userID);
                    if (o && o >= 0) {
                      var n = a.iHandsCards;
                      (this.delAllHandTiles(o), this.openTile(o, n));
                    }
                  }
                },
                this,
              ),
              this.node.on(
                "SET_OPEN_TILE_TEACH",
                function (e) {
                  for (var t = e, i = 0; i < t.length; i++) {
                    var a = t[i],
                      o = i;
                    if (o && o >= 0) {
                      var n = a.iHandsCards;
                      (this.delAllHandTiles(o), this.openTile(o, n));
                    }
                  }
                },
                this,
              ),
              this.node.on(
                "DEL_OPEN_TILES",
                function (e) {
                  var t = e.nViewSeatId,
                    i = e.aDelOpenTiles;
                  this.delOpenTiles(t, i);
                },
                this,
              ),
              this.node.on(
                "INIT_TILE_HANDOFFSETS",
                function (e) {
                  if (!this._hadOffest)
                    for (var t = 0; t < e.length; t++)
                      if (e[t]) {
                        (0 == e[t].x && 0 == e[t].y) || (this._hadOffest = !0);
                        var i = e[t] || { x: 0, y: 0 },
                          a = t;
                        (this.getHandTileCtrl(a).addHandTableOffset(i),
                          this.getHuTileCtrl(a).addHandTableOffset(i));
                      }
                },
                this,
              ),
              this.node.on(
                "CHECK_TILE",
                function () {
                  var e = this.getHandTileCtrl(
                    g_tConst.GameConfig.ViewSeat.SeatMine,
                  ).getAllHandTiles().length;
                  if (e > 14 || e % 3 != 1) {
                    var t = new cc.Event.EventCustom("TILE_ERROR", !0);
                    this.node.dispatchEvent(t);
                  }
                },
                this,
              ),
              this.node.on(
                "ON_QGH",
                function (e) {
                  var t = e.nQiangTileValue,
                    i = e.nLastViewSeatId,
                    a = this.getHandTileCtrl(i),
                    o = !1;
                  if (
                    a &&
                    0 != a.direction &&
                    MJ.GameLogic.PlayerModel.getPlayerInfoByViewID(a.direction).isMingPai
                  ) {
                    var n = this.getOpenTileCtrl(i);
                    n && null == a.openTileCtrl && ((a.openTileCtrl = n), (o = !0));
                  }
                  (this.delHandTiles(i, [t], !1), o && (a.openTileCtrl = null));
                },
                this,
              ),
              this.node.on(
                "HSZ_TRY_CONFIRM",
                function () {
                  var e = this.getHandTileCtrl(
                    g_tConst.GameConfig.ViewSeat.SeatMine,
                  ).getAllSelectTileValue();
                  if (3 === e.length) {
                    var t = new cc.Event.EventCustom("HSZ_REQ_PLAYER", !0);
                    (t.setUserData(e), this.node.dispatchEvent(t));
                  } else
                    g_oPlatform.doAction(
                      g_tConst.tPlatActionId.actionShowToast,
                      "\u8bf7\u9009\u62e9\u8981\u66f4\u6362\u7684\u4e09\u5f20\u724c",
                    );
                },
                this,
              ),
              this.node.on(
                "ONLY_SELECT_ONE_TILE",
                function (e) {
                  var t = e.nlastSelectIndex;
                  this.getHandTileCtrl(
                    g_tConst.GameConfig.ViewSeat.SeatMine,
                  ).otherTileUnSelectByIndex(t);
                },
                this,
              ),
              this.node.on(
                "SET_HAND_TILE_SELECT",
                function (e) {
                  var t = e.nViewSeatId,
                    i = e.isSelectTile;
                  this.getHandTileCtrl(t).setTilesSelect(i);
                },
                this,
              ),
              this.node.on(
                "SET_HAND_TILE_RULELAIZI_SORT",
                function (e) {
                  var t = e.nViewSeatId,
                    i = e.isSortRuleLaiziLeftFun;
                  this.getHandTileCtrl(t).setHandRuleLaiziSort(i);
                },
                this,
              ),
              this.node.on(
                "SET_HAND_TILE_SORT",
                function (e) {
                  var t = e.nViewSeatId,
                    i = e.isSortLeftFun,
                    a = e.isSortRightFun,
                    o = e.otherSortFun;
                  (this.getHandTileCtrl(t).setHandSort(i, a, o),
                    g_oEvent.dispatchEvent(g_tEvent.ZMJTILE_INTERFACE.SORT_HAND_TILES, e));
                },
                this,
              ),
              this.node.on(
                "SET_HAND_TILE_ENBLE_MUL_SELECT",
                function (e) {
                  this.getHandTileCtrl(
                    g_tConst.GameConfig.ViewSeat.SeatMine,
                  ).setEnbleMulChoiceTiles(e.enbleMulSelect);
                },
                this,
              ),
              this.node.on(
                "ON_HSZ_ACTION",
                function (e) {
                  this.delHandTiles(g_tConst.GameConfig.ViewSeat.SeatMine, e.iChangeCards, !1);
                },
                this,
              ),
              this.node.on(
                "ON_NOTIFY_HSZ_RESULT",
                function (e) {
                  var t = e,
                    i = t.playBackDataList;
                  if (i)
                    for (var a = 0; a < i.length; a++) {
                      var o = MJ.GameLogic.PlayerModel.getViewSeatId(i[a].seatID),
                        n = null,
                        s = i[a].iAfterChangeCard,
                        r = i[a].iChangeCard,
                        c = this.getHandTileCtrl(o);
                      (o === g_tConst.GameConfig.ViewSeat.SeatMine
                        ? c.getAllHandTiles().length >= 13 && this.delHandTiles(o, r, !1)
                        : ((n = this.getOpenTileCtrl(o)),
                          this.delHandTiles(o, r, !1),
                          this.delOpenTiles(o, r)),
                        this.playHszAnim(o, s, n));
                    }
                  else {
                    var l = this.getHandTileCtrl(g_tConst.GameConfig.ViewSeat.SeatMine),
                      g = t.iAfterChangeCard,
                      d = t.iChangeCard,
                      h = g_tConst.GameConfig.ViewSeat,
                      u = MJ.GameLogic.PlayerModel.playersInfo;
                    for (var _ in u)
                      if (u.hasOwnProperty(_)) {
                        var m = u[_];
                        if (m.viewSeatID === h.SeatMine)
                          (l.getAllHandTiles().length >= 13 &&
                            this.delHandTiles(m.viewSeatID, d, !1),
                            this.playHszAnim(m.viewSeatID, g));
                        else {
                          var f = isNull(t.other) ? {} : t.other[m.viewSeatID] || {};
                          (this.delHandTiles(m.viewSeatID, f.iChangeCard || d, !1),
                            this.playHszAnim(m.viewSeatID, f.iAfterChangeCard || g));
                        }
                      }
                  }
                },
                this,
              ),
              this.node.on(
                "ON_NOTIFY_HSZ_RESULT_TEACH",
                function (e) {
                  var t = e,
                    i = this.getHandTileCtrl(g_tConst.GameConfig.ViewSeat.SeatMine),
                    a = t.iAfterChangeCard,
                    o = t.iChangeCard,
                    n = g_tConst.GameConfig.ViewSeat,
                    s = t.playerInfos;
                  for (var r in s)
                    if (s.hasOwnProperty(r)) {
                      var c = s[r];
                      if (c.viewSeatID === n.SeatMine)
                        (i.getAllHandTiles().length >= 13 && this.delHandTiles(c.viewSeatID, o, !1),
                          this.playHszAnim(c.viewSeatID, a));
                      else {
                        var l = isNull(t.other) ? {} : t.other[c.viewSeatID] || {};
                        (this.delHandTiles(c.viewSeatID, l.iChangeCard || o, !1),
                          this.playHszAnim(c.viewSeatID, l.iAfterChangeCard || a));
                      }
                    }
                },
                this,
              ),
              this.node.on(
                "SET_HAND_TILE_MASK",
                function (e) {
                  MJ.GameLogic.isPlayBack ||
                    this.getHandTileCtrl(e.nViewSeatId).setHandTileMask(e.enbleCtrlTile, e.bMask);
                },
                this,
              ),
              this.node.on(
                "CLEAR_HAND_TILE_MASK",
                function (e) {
                  Log.info(
                    "BIRD >>>",
                    "ZMJTileInterface.js",
                    "\u6e05\u9664\u624b\u724c\u906e\u7f69",
                  );
                  var t = {
                    bMask: !1,
                    nViewSeatId: e.nViewSeatId,
                    enbleCtrlTile: function () {
                      return !0;
                    },
                  };
                  this.node.emit("SET_HAND_TILE_MASK", t);
                },
                this,
              ),
              this.node.on(
                "SET_HAND_TILE_TAG",
                function (e) {
                  (this.getHandTileCtrl(e.nViewSeatId).setHandTileTag(e.nTagType, e.enbleTileTag),
                    g_oEvent.dispatchEvent(g_tEvent.ZMJTILE_INTERFACE.SET_HAND_TILE_TAG, e));
                },
                this,
              ),
              this.node.on(
                "SET_OPEN_TILE_TAG",
                function (e) {
                  this.getOpenTileCtrl(e.nViewSeatId).setOpenTileTag(e.nTagType, e.enbleTileTag);
                },
                this,
              ),
              this.node.on(
                "SET_HU_TILE_TAG",
                function (e) {
                  this.getHuTileCtrl(e.nViewSeatId).setHuTileTag(e.nTagType, e.enbleTileTag);
                },
                this,
              ),
              this.node.on("CHOOSE_TILE", function (t) {
                var i = t.detail.tileValue;
                e.showChooseTileHint(i);
              }),
              this.node.on("UPDATE_CARD_NUM", function () {
                for (var t = MJ.GameLogic.PlayerModel.viewSeatIDPool, i = 0; i < t.length; i++) {
                  var a = t[i];
                  e.getHandTileCtrl(a).updateOffsetCount();
                }
              }),
              this.node.on(
                "MY_DRAW_TILE",
                function (e) {
                  e.callback &&
                    e.callback(
                      this.getHandTileCtrl(g_tConst.GameConfig.ViewSeat.SeatMine)._oDrawTile,
                    );
                },
                this,
              ),
              this.node.on(
                "SET_TRIGGER_BLOCK",
                function (e) {
                  this.getHandTileCtrl(g_tConst.GameConfig.ViewSeat.SeatMine).setTriggerBlcok(
                    !!e.isTrigger,
                    e.blockType,
                  );
                },
                this,
              ),
              this.node.on(
                "RASCAL_KONG",
                function (e) {
                  var t = e.nViewSeatId,
                    i = e.nTileValue,
                    a = e.isResume;
                  (this.getHuTileCtrl(t).pushRascalKongTile(i), a || this.delHandTiles(t, [i], !1));
                },
                this,
              ),
              this.node.on(
                "SET_HAND_TILE_FIRE",
                function (e) {
                  if (e.nViewSeatId === g_tConst.GameConfig.ViewSeat.SeatMine) {
                    var t = this.getHandTileCtrl(e.nViewSeatId);
                    t && t.setHandTileActiveHot(e.isFire);
                  } else {
                    var i = this.getOpenTileCtrl(e.nViewSeatId);
                    i && i.setOpenTileActiveHot(e.isFire);
                  }
                },
                this,
              ),
              this.node.on("UPDATE_BLOCK_CARD", function (t) {
                var i = e.getHandTileCtrl(t.nViewSeatId);
                i && i.checkBlockCard(t.blockCard);
              }),
              this.node.on(
                "SHOW_UNIVERSAL_CARD_IN_HAND",
                function (e) {
                  var t = e.nViewSeatId,
                    i = e.lastDrawTiles,
                    a = e.universalCardIndex,
                    o = this.getHandTileCtrl(t);
                  if (o) {
                    var n = o.getAllHandTiles();
                    if (n.length > 0)
                      for (
                        var s = Math.max(0, n.length - i.length), r = 0;
                        s < n.length;
                        s++, r++
                      ) {
                        var c = n[s];
                        if (c) {
                          var l = c.getComponent("ZMJTile");
                          l.tileValue == i[r] && !0 === a[r] && l.showAsUniversalCard(0, !1, t);
                        }
                      }
                  }
                },
                this,
              ),
              this.node.on(
                "RESTORE_UNIVERSAL_CARD_IN_HAND",
                function (e) {
                  var t = e.nViewSeatId,
                    i = e.iExtraHandCard,
                    a = e.iUniversal,
                    o = this.getHandTileCtrl(t);
                  if (o) {
                    var n = o.getAllHandTiles();
                    if (n.length > 0)
                      if (0 == i.length && 1 == a.length) {
                        var s = n[n.length - 1];
                        cc.isValid(s) &&
                          1 == s.active &&
                          s.getComponent("ZMJTile").showAsUniversalCard(1, !1, t);
                      } else if (i.length > 0 && a.length == i.length)
                        for (
                          var r = n.length - i.length, c = 0;
                          r < n.length && c < i.length;
                          r++, c++
                        ) {
                          var l = n[r];
                          cc.isValid(l) &&
                            1 == l.active &&
                            1 == a[c] &&
                            l.getComponent("ZMJTile").showAsUniversalCard(1, !1, t);
                        }
                  }
                },
                this,
              ),
              this.node.on(
                "RESTORE_UNIVERSAL_CARD_IN_HU_AREA",
                function (e) {
                  var t = e.nViewSeatId,
                    i = e.universalIndex,
                    a = this.getHuTileCtrl(t);
                  if (a) {
                    var o = a.getAllHuTiles();
                    o.length > 0 &&
                      i.forEach(function (e) {
                        var i = o[e];
                        cc.isValid(i) && i.getComponent("ZMJTile").showAsUniversalCard(2, !1, t);
                      });
                  }
                },
                this,
              ),
              this.node.on(
                "LAYOUT_HANDTILE_ROOT",
                function (e) {
                  this.layoutHandTileRoot(e);
                },
                this,
              ),
              this.node.on(
                "SET_ALL_UNSELECT",
                function (e) {
                  var t = e.nViewSeatId,
                    i = this.getHandTileCtrl(t);
                  i && i.setAllUnSelect();
                },
                this,
              ),
              this.node.on(
                "LAYOUT_HAND_TILES",
                function (e) {
                  var t = e.nViewSeatId,
                    i = this.getHandTileCtrl(t);
                  i && i.layoutTiles();
                },
                this,
              ),
              this.node.on(
                "RESTORE_HAND_ROOT",
                function () {
                  var e = this.getHandTileCtrl(g_tConst.GameConfig.ViewSeat.SeatMine);
                  e && (e.node.position = cc.v3(0, e.node.position.y, 0));
                },
                this,
              ));
          },
          hideOutTileAnimOnDesk: function () {
            this.tileAnim.emit("HIDE_OUT_TILE_ON_DESK");
          },
          updateMineNodeLayout: function (e) {
            void 0 === e && (e = !1);
            var t = this.oTiles[0],
              i = t.handtile.getComponent(cc.Widget),
              a = t.hutile.getComponent(cc.Widget),
              o = t.opentile.getComponent(cc.Widget),
              n = t.cpgtile.getComponent(cc.Widget);
            e
              ? ((i.bottom = 68),
                (a.bottom = 230),
                (o.bottom = 110),
                (n.bottom = 110),
                (t.outtile.position = cc.v2(490, 350)))
              : ((i.bottom = 0),
                (a.bottom = 160),
                (o.bottom = 52),
                (n.bottom = 50),
                (t.outtile.position = cc.v2(490, 300)));
          },
          updateFrontNodeLayout: function (e) {
            void 0 === e && (e = !1);
            var t = this.oTiles[2],
              i = t.handtile.getComponent(cc.Widget),
              a = t.hutile.getComponent(cc.Widget),
              o = t.opentile.getComponent(cc.Widget),
              n = t.cpgtile.getComponent(cc.Widget);
            e
              ? ((i.top = 35),
                (a.top = 80),
                (o.top = 35),
                (n.top = 35),
                (t.outtile.position = cc.v2(775, 560)))
              : ((i.top = 50),
                (a.top = 100),
                (o.top = 45),
                (n.top = 45),
                (t.outtile.position = cc.v2(775, 525)));
          },
          updateLeftNodeLayout: function (e) {
            (void 0 === e && (e = !1),
              (this.AllPlayerTiles[1].position = e ? cc.v2(0, 0) : cc.v2(0, -42)));
          },
          updateRightNodeLayout: function (e) {
            (void 0 === e && (e = !1),
              (this.AllPlayerTiles[3].position = e ? cc.v2(0, 0) : cc.v2(0, -40)));
          },
          updateAllPlayerNodeLayout: function () {
            var e = g_oData.get(g_tData.LiveGameModel).isLivePlayer();
            (this.updateMineNodeLayout(e),
              this.updateFrontNodeLayout(e),
              this.updateLeftNodeLayout(e),
              this.updateRightNodeLayout(e));
          },
        }),
          cc._RF.pop());
      },
      { Direction: "Direction", tileLogicHelper: "tileLogicHelper" },
    ],
