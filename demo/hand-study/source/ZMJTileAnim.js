    ZMJTileAnim: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "cdfe3WacEBJR7L/4gK5UYiF", "ZMJTileAnim");
        var i = e("gameHandAnim"),
          a = e("CommonUtils"),
          o = e("playerStatusEnum"),
          n = e("table3dTypeEnum");
        (cc.Class({
          extends: cc.Component,
          properties: {
            outTileAnchor: [cc.Node],
            nodeAnchor: [cc.Node],
            cpgSlideOffset: [cc.Vec2],
            tilePrefab: cc.Prefab,
            tile3DPrefab: cc.Prefab,
            tileTexture: cc.SpriteFrame,
            tileLightSf: cc.SpriteFrame,
            _tileNodeArr: [],
            gameHandAnim: i,
            handAnimNode: cc.Node,
            cuopaiHandAnimNode: cc.Node,
          },
          onLoad: function () {
            var e = this;
            (this.node.on(
              "PLAY_OUT_ANIM",
              function (e) {
                this.playOutAnim(e);
              },
              this,
            ),
              this.node.on(
                "HSZ_HAND_ANIM",
                function (t) {
                  var i = t,
                    a = i.nViewSeatId,
                    o = i.playActionEnd,
                    n = e.get3DTile(57),
                    s = g_tConst.handAnimConstList.huansanzhang;
                  ((i.handParentNode = e.handAnimNode),
                    (i.handTileTempNode = n),
                    e.gameHandAnim.play(s, a, i, function () {
                      (Log.info(">>>> PLAY_OUT_ANIM gameHandAnim h3z end"), o && o());
                    }));
                },
                this,
              ),
              this.node.on(
                "CPG_HAND_ANIM",
                function (e) {
                  var t = e.nViewSeatId,
                    i = e.playCallback,
                    a = g_tConst.handAnimConstList.cpg;
                  ((e.tileSlideOffset = this.cpgSlideOffset[t]),
                    (e.handParentNode = this.handAnimNode),
                    this.gameHandAnim.play(a, t, e, function () {
                      (Log.info("Play3DHandAnim End: CPG"), i && i());
                    }));
                },
                this,
              ),
              this.node.on(
                "PLAY_CUOPAI_ANIM",
                function (e) {
                  var t = e,
                    i = t.nViewSeatId,
                    a = t.nTileValue,
                    s = this.get3DTile(a),
                    r = g_oData.get(g_tData.table3dData).getDirectionTileTypeRotation(i, n.outtile);
                  s.getComponent("tile3dView").setRotation(r);
                  var c = g_tConst.handAnimConstList.cuopai;
                  ((t.handParentNode = this.cuopaiHandAnimNode), (t.handTileTempNode = s));
                  var l = MJ.GameLogic.PlayerModel.getCurGamingStatus(i);
                  if (l != o.HUTRUSTEE && l != o.TINGTRUSTEE && l != o.NORMALTRUSTEE)
                    this.gameHandAnim.play(c, i, t, function () {
                      Log.info("Play3DHandAnim End: CuoPai");
                    });
                  else {
                    var g = t.playActionEnd;
                    g && g();
                  }
                },
                this,
              ),
              this.node.on(
                "PLAY_SEND_ANIM",
                function (e) {
                  for (
                    var t = this,
                      i = e,
                      a = i.nViewSeatId,
                      o = i.tileNodes,
                      n = i.callBack,
                      s = i.target,
                      r = 0;
                    r < o.length;
                    r++
                  )
                    o[r].opacity = 0;
                  if (a === g_tConst.GameConfig.ViewSeat.SeatMine) {
                    g_oMJNetManger.pauseGameLoop("\u53d1\u9001\u52a8\u753b");
                    var c = { nViewSeatId: g_tConst.GameConfig.ViewSeat.SeatMine, isCanTouch: !1 };
                    cc.director.emit("MINE_CARD_ANI_COMP", c);
                  }
                  var l = cc.callFunc(function () {
                    t.playSendAnim(a, o, function () {
                      if (a === g_tConst.GameConfig.ViewSeat.SeatMine) {
                        g_oMJNetManger.resumeGameLoop("\u53d1\u9001\u52a8\u753b");
                        var e = {
                          nViewSeatId: g_tConst.GameConfig.ViewSeat.SeatMine,
                          isCanTouch: !0,
                        };
                        cc.director.emit("MINE_CARD_ANI_COMP", e);
                      }
                      n.apply(s);
                    });
                  }, this);
                  this.node.runAction(cc.sequence(cc.delayTime(1.2), l));
                },
                this,
              ),
              this.node.on("HIDE_OUT_TILE_ON_DESK", function () {
                e.hideOutTileOnDesk();
              }));
          },
          start: function () {},
          playSendAnim: function (e, t, i) {
            for (
              var a = this,
                o = t.length,
                n = function (n) {
                  var s = t[n];
                  if (cc.isValid(s)) {
                    var r = s.getPosition(),
                      c = r.add(cc.v2(0, 100)),
                      l = Math.floor(n / 4),
                      g = n % 4 == 0;
                    ((s.position = c),
                      (s.opacity = 0),
                      cc
                        .tween(s)
                        .delay(0.5 * l)
                        .parallel(
                          cc.tween(s).to(0.5, { opacity: 255 }, { easing: "easeSineInOut" }),
                          cc.tween(s).to(0.5, { position: r }, { easing: "easeSineInOut" }),
                        )
                        .call(function () {
                          if (
                            cc.isValid(s) &&
                            (e === g_tConst.GameConfig.ViewSeat.SeatMine &&
                              g &&
                              g_oAudioManager.play(g_tAsset.EffectSound.draw),
                            n == o - 1)
                          ) {
                            i();
                            var r = new cc.Event.EventCustom("SEND_TILE_ANIM_END", !0);
                            (r.setUserData({ tTileNodes: t, nViewSeatId: e }),
                              a.node.dispatchEvent(r));
                          }
                        })
                        .start());
                  }
                },
                s = 0;
              s < o;
              s++
            )
              n(s);
          },
          get3DTile: function (e) {
            var t = cc.instantiate(this.tile3DPrefab);
            return (t.getComponent("tile3dView").setTileValue(e), t);
          },
          playOutAnim: function (e) {
            var t,
              i = this,
              o = e,
              n = o.nViewSeatId,
              s = o.nOutTileValue,
              r = o.tileNode,
              c = o.endPos,
              l = o.rowLen,
              g = o.floorLen,
              d = o.offSetPadding,
              h = o.chupaiActionEnd,
              u = function () {
                h && h();
                var e = new cc.Event.EventCustom("OUT_TILES_FINISHED", !0);
                (e.setUserData({ nViewSeatId: n, nOutTileValue: s }), i.node.dispatchEvent(e));
              };
            (a.getRandom(0.5), (t = g_tConst.handAnimConstList.chupai));
            var _ = this.get3DTile(s);
            this.gameHandAnim.play(
              t,
              n,
              {
                handParentNode: this.handAnimNode,
                outTileNode: r,
                handTileTempNode: _,
                offSetPadding: d,
                tEndPos: c,
                rowLen: l,
                floorLen: g,
                chupaiActionEnd: u,
              },
              function () {
                (Log.info("Play3DHandAnim End: ChuPai"), u());
              },
            );
          },
          showOutTileOnDesk: function (e, t) {
            var i = this;
            if (
              (this.hideOutTileOnDesk(),
              e !== g_tConst.GameConfig.ViewSeat.SeatMine && MJ.GameLogic.isGameStart())
            ) {
              if (isNull(this._tileNodeArr[e])) {
                var a = cc.instantiate(this.tilePrefab);
                (this.node.addChild(a),
                  (this._tileNodeArr[e] = a),
                  (a.position = this.nodeAnchor[e]),
                  (a.active = !1));
              }
              var o = this._tileNodeArr[e];
              (o.emit("INIT_TILE_INFO", {
                tileProp: {
                  tileValue: t,
                  tileSf: this.tileTexture,
                  tileColorTrans: { colorPos: cc.v2(0, 0) },
                },
                tileLightProp: { lightSf: this.tileLightSf, position: cc.v2(0, 4), isShow: !0 },
                nIndex: 0,
                isCanClick: !1,
              }),
                (o.scaleX = o.scaleY = 0),
                (o.active = !0),
                o.emit("SHOW_TILE_SELECT_LIGHT"));
              var n = cc.sequence(
                cc.scaleTo(0.15, 1.2, 1.1),
                cc.callFunc(function () {
                  i.scheduleOnce(i.hideOutTileOnDesk, 0.8);
                }),
              );
              o.runAction(n.easing(cc.easeSineInOut()));
            }
          },
          hideOutTileOnDesk: function () {
            (this.unschedule(this.hideOutTileOnDesk),
              this._tileNodeArr.forEach(function (e) {
                cc.isValid(e) && (e.active = !1);
              }));
          },
          updateAllPlayerNodeLayout: function () {
            var e = g_oData.get(g_tData.LiveGameModel).isLivePlayer();
            this.nodeAnchor[2].position = e ? cc.v2(643, 602) : cc.v2(643, 565);
          },
        }),
          cc._RF.pop());
      },
      {
        CommonUtils: "CommonUtils",
        gameHandAnim: "gameHandAnim",
        playerStatusEnum: "playerStatusEnum",
        table3dTypeEnum: "table3dTypeEnum",
      },
    ],
