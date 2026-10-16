    ZMJCPGTileCtrl: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "d2a717W/UxKz5Jn2Mt5Z0D9", "ZMJCPGTileCtrl"), e("ZMJTile"));
        var i = e("Direction"),
          a = (e("table3dTypeEnum"), e("tileLogicHelper")),
          o = cc.Enum({ Flat: 0, Stack: -1 }),
          n = cc.Class({
            name: "CPG",
            properties: {
              tileZOderStart: 1,
              tileTexture: [cc.SpriteFrame],
              tileBackTexture: [cc.SpriteFrame],
              colorRotation: 0,
              colorSkew: cc.Vec2,
              colorPos: cc.Vec2,
              colorScale: cc.Vec2,
              tileInterval: cc.Vec2,
              tileCount: -1,
              _type: -1,
              _tileValue: -1,
              GangSkewPos: cc.Vec2,
              CardTipTagPos: cc.Vec2,
            },
          });
        (cc.Class({
          extends: cc.Component,
          properties: {
            direction: { type: i, default: 0 },
            stacks: [n],
            gap: cc.Vec2,
            tilePrefab: cc.Prefab,
            tileScale: 1,
            backTileOffset: cc.Vec2,
            yanWuPrefab: cc.Prefab,
            GangLayoutType: {
              default: o.Stack,
              type: o,
              tooltip: "\u6760\u724c\u7684\u5c55\u793a\u7c7b\u578b",
            },
            CPGTexture: [cc.SpriteFrame],
            CardTipTagScale_G: 1,
            _isTeamMate: !1,
          },
          onLoad: function () {
            ((this._groupIndex = 0),
              (this.curPos = cc.v2(0, 0)),
              (this._aTiles = []),
              (this._edgePos = cc.v2(0, 0)),
              (this._lastEdgePos = cc.v2(0, 0)),
              (this._nodePos = this.node.position),
              (this._showYanWu = !0));
          },
          resetTile: function () {
            for (var e = 0; e < this.stacks.length; e++) {
              var t = this.stacks[e];
              ((t._type = -1), (t._tileValue = -1));
            }
            (this.node.removeAllChildren(!0),
              (this._groupIndex = 0),
              (this.curPos = cc.v2(0, 0)),
              (this._aTiles = []),
              (this._edgePos = cc.v2(0, 0)),
              (this.node.position = this._nodePos));
          },
          setChowTiles: function (e, t) {
            this.addCPG(e, g_tConst.BlockCfgs.BlockChow.BlockType, t);
          },
          setChowTilesUnExcute: function (e, t) {
            this.addCPGUnExcute(e, g_tConst.BlockCfgs.BlockChow.BlockType, t);
          },
          setPengTiles: function (e, t) {
            ((e = this.sortPongTile(e)), this.addCPG(e, g_tConst.BlockCfgs.BlockPong.BlockType, t));
          },
          setPengTilesUnExcute: function (e, t) {
            this.addCPGUnExcute(e, g_tConst.BlockCfgs.BlockPong.BlockType, t);
          },
          setMingDanTiles: function (e, t, i) {
            this.addDan(e, t, i);
          },
          resumeDanStack: function (e, t, i) {
            var a = t.slice(0, 3),
              o = t.slice(3);
            this.setMingDanTiles(e, a.slice(0), i);
            for (var n = 0; n < o.length; ++n) (this.setGuoDanTiles(o[n], a, i), a.push(o[n]));
          },
          setGuoDanTiles: function (e, t) {
            function i(e, t) {
              for (var i = [], a = 0; a < t.length; a++)
                for (var o = 0; o < e.length; o++) e[o] === t[a] && i.push(e[o]);
              return i;
            }
            for (var a = -1, o = 0; o < this.stacks.length; ++o) {
              var n = this.stacks[o]._aTileValues;
              n && i(t, n).length >= 3 && (a = o);
            }
            var s = this.stacks[a];
            if (s) {
              var r = e,
                c = s._specialDisplay,
                l = s._aTileValues.indexOf(r);
              if (c)
                if (l >= 0) {
                  33 === r &&
                    (l = (function (e) {
                      for (var t = e._aTileValues, i = 0, a = -1, o = 0; o < t.length; ++o)
                        if (33 === t[o]) {
                          var n = e._tileCountMap.get(o);
                          if (0 === i) {
                            ((a = o), (i = n));
                            continue;
                          }
                          n < i && ((a = o), (i = n));
                        }
                      return a;
                    })(s));
                  var g = s._tileCountMap.get(l) + 1;
                  s._tileCountMap.set(l, g);
                } else
                  (s._aTileValues.push(r),
                    s._tileCountMap.set(s._aTileValues.length - 1, 1),
                    s._anyDanType
                      ? (s._anyDanType = !1)
                      : ((function (e) {
                          for (
                            var t = [], i = 0, a = new Map(), o = 0;
                            o < e._aTileValues.length;
                            ++o
                          ) {
                            var n = e._aTileValues[o];
                            33 === n
                              ? (i += e._tileCountMap.get(o))
                              : (t.push(n), a.set(t.length - 1, e._tileCountMap.get(o)));
                          }
                          (t.push(33),
                            a.set(t.length - 1, i),
                            (e._aTileValues = t),
                            (e._tileCountMap = a));
                        })(s),
                        (s._specialDisplay = !1)));
              else if (l >= 0) {
                var d = s._tileCountMap.get(l) + 1;
                s._tileCountMap.set(l, d);
              } else (s._aTileValues.push(r), s._tileCountMap.set(s._aTileValues.length - 1, 1));
              var h = r;
              (33 === r && (h <<= 15), (s._stackId += h), (this._showYanWu = !1), this.layoutCPG());
            } else console.error("lqr...\u672a\u627e\u5230\u5bf9\u5e94\u7684\u724c\u5806");
          },
          setMGangTiles: function (e, t) {
            var i = this.sortGangTile(e);
            this.addCPG(i, g_tConst.BlockCfgs.BlockExposedKong.BlockType, t);
          },
          setMGangTilesUnExcute: function (e, t) {
            this.addCPGUnExcute(e, g_tConst.BlockCfgs.BlockExposedKong.BlockType, t);
          },
          setAGangTiles: function (e) {
            this.addCPG(this.sortGangTile(e), g_tConst.BlockCfgs.BlockConcealedKong.BlockType);
          },
          setAGangTilesUnExcute: function (e) {
            this.addCPGUnExcute(e, g_tConst.BlockCfgs.BlockConcealedKong.BlockType);
          },
          setWGangTiles: function (e, t) {
            for (var i = !1, o = a.toTileValue(e[0]), n = 0; n < this.stacks.length; n++) {
              var s = this.stacks[n];
              if (s._type === g_tConst.BlockCfgs.BlockPong.BlockType)
                for (var r = s._aTileValues, c = 0; c < r.length; c++)
                  a.toTileValue(r[c]) === o &&
                    0 === c &&
                    ((i = !0),
                    (s._type = g_tConst.BlockCfgs.BlockPatchedKong.BlockType),
                    s._aTileValues.push(e[0]),
                    (s._aTileValues = this.sortGangTile(s._aTileValues)));
            }
            (i ||
              this.addCPG(this.sortGangTile(e), g_tConst.BlockCfgs.BlockPatchedKong.BlockType, t),
              this.layoutCPG());
          },
          setWGangTilesUnExcute: function (e, t) {
            for (var i = !1, a = 0; a < this.stacks.length; a++) {
              var o = this.stacks[a];
              o._type === g_tConst.BlockCfgs.BlockPatchedKong.BlockType &&
                o._aTileValues[0] == e[0] &&
                ((i = !0),
                (o._type = g_tConst.BlockCfgs.BlockPong.BlockType),
                (o._aTileValues = o._aTileValues.slice(0, 3)));
            }
            (i || this.addCPG(e.slice(0, 3), g_tConst.BlockCfgs.BlockPong.BlockType, t),
              this.layoutCPG());
          },
          addCPG: function (e, t, i) {
            if ((void 0 === i && (i = -1), !(this._groupIndex > this.stacks.length - 1))) {
              var a = this.stacks[this._groupIndex];
              ((a._type = t),
                (a._aTileValues = e.slice()),
                (a._nSourceSeatId = i),
                this._groupIndex++);
              var o = this._groupIndex > 0 ? this._groupIndex - 1 : 0,
                n = !MJ.GameLogic.TableModel.tileResuming && !this._isTeamMate;
              this.layoutCPG({ isShow3DHandAnim: n, handleStackIdx: o });
            }
          },
          addDan: function (e, t, i) {
            if (!(this._groupIndex > this.stacks.length - 1)) {
              var a = this.stacks[this._groupIndex];
              ((a._viewSeatId = e),
                (a._type = i),
                (a._aTileValues = t),
                (a._tileCountMap = new Map()));
              for (var o = 0, n = 0, s = 0; s < a._aTileValues.length; ++s) {
                a._tileCountMap.set(s, 1);
                var r = a._aTileValues[s];
                (33 === a._aTileValues[s] && (o++, (r <<= 15)), (n += r));
              }
              ((a._stackId = n),
                (a._specialDisplay = !1),
                o > 1 && ((a._specialDisplay = !0), (a._anyDanType = o > 2)),
                this._groupIndex++,
                this.layoutCPG());
            }
          },
          addCPGUnExcute: function (e, t, i) {
            (void 0 === i && (i = -1), this._groupIndex--);
            var a = this.stacks[this._groupIndex];
            ((a._type = -1), (a._aTileValues = []), this.layoutCPG());
          },
          layoutCPG: function (e) {
            (void 0 === e && (e = null),
              (this._lastEdgePos = JSON.parse(JSON.stringify(this._edgePos))));
            var t = this;
            ((t._aTiles = []), t.node.removeAllChildren());
            var i = cc.v2(0, 0);
            function a(e, t, i, a, o) {
              a.init(i, t, o, {
                position: e.colorPos,
                scale: e.colorScale,
                rotation: e.colorRotation,
                skew: e.colorSkew,
              });
            }
            function n(n) {
              var s = n._aTileValues.length,
                r = n._nSourceSeatId;
              if (t._isDan(n._type))
                i = t.layoutDan({ self: t, stack: n, curPos: i, initTileProp: a });
              else {
                for (var c = null, l = 0; l < s; l++) {
                  var g = n._aTileValues[l],
                    d = cc.instantiate(t.tilePrefab),
                    h = d.getComponent("ZMJTile");
                  t.node.addChild(d);
                  var u = (l + 1) * n.tileZOderStart,
                    _ = cc.v2(i.x, i.y);
                  if (t._isGang(n._type) && (1 == l && (c = d), l == s - 1)) {
                    if (c && t.GangLayoutType === o.Stack) {
                      var m = c.position,
                        f = n.GangSkewPos;
                      ((_ = cc.v2(m.x, m.y).add(f)), (u = 4));
                    }
                    var p = -1;
                    if (
                      (n._type === g_tConst.BlockCfgs.BlockExposedKong.BlockType
                        ? 0 === r
                          ? (p = 0)
                          : 1 === r
                            ? (p = 2)
                            : 2 === r
                              ? (p = 3)
                              : 3 === r && (p = 1)
                        : n._type === g_tConst.BlockCfgs.BlockPatchedKong.BlockType && (p = 4),
                      p >= 0)
                    ) {
                      var C = new cc.Node("TipNode");
                      ((C.addComponent(cc.Sprite).spriteFrame = t.CPGTexture[p]),
                        (C.position = n.CardTipTagPos),
                        (C.scale = t.CardTipTagScale_G),
                        d.addChild(C));
                    }
                  }
                  ((d.position = _), (d.zIndex = u), (d.scale = t.tileScale));
                  var v = MJ.GameLogic.TableModel.getGameType();
                  if (
                    (g_tConst.ShowBlockSourceHint.includes(v) &&
                      -1 !== r &&
                      1 === l &&
                      d.emit("SHOW_SOURCE", { sourceSeatId: r }),
                    n._type === g_tConst.BlockCfgs.BlockConcealedKong.BlockType
                      ? 3 == l
                        ? a(n, g, n.tileTexture[1], h, !0)
                        : ((d.position = d.position.add(t.backTileOffset)),
                          a(n, g, n.tileBackTexture[l], h, !1))
                      : a(n, g, n.tileTexture[l], h, !0),
                    (i =
                      t._isGang(n._type) && t.GangLayoutType === o.Stack && 3 === l
                        ? i
                        : i.add(n.tileInterval)),
                    t._aTiles.push(d),
                    e && e.isShow3DHandAnim && null != n._stackId)
                  ) {
                    e.stackNodes || (e.stackNodes = []);
                    var y = e.handleStackIdx;
                    n._stackId === y && ((d.active = !1), e.stackNodes.push(d));
                  }
                }
                i = i.add(t.gap);
              }
            }
            for (var s = 0, r = 0; r < this.stacks.length; r++) {
              var c = this.stacks[r];
              ((c._stackId = r), -1 != c._type && ((s += 1), n(c)));
            }
            this._edgePos = i.add(t.gap);
            var l = new cc.Event.EventCustom("CPG_UPDATE", !0);
            (l.setUserData({
              stackCont: s,
              direction: this.direction,
              edgeWorldPos: this.node.convertToWorldSpaceAR(this._edgePos),
            }),
              this.node.dispatchEvent(l),
              this.showAnimAfterUpdateCPG(e));
          },
          showAnimAfterUpdateCPG: function (e) {
            e && e.isShow3DHandAnim ? this.showCPGHandAnim(e) : this.showYanWuAnim(this._showYanWu);
          },
          showCPGHandAnim: function (e) {
            var t = this,
              i = e.handleStackIdx,
              a = this.stacks[i],
              o = this.getHand3DEndPos(),
              n = this.getStackBoxNode(a);
            this.dispatchHandAnimEvent(
              n,
              o,
              a,
              function (i) {
                if ((void 0 === i && (i = null), e.stackNodes))
                  for (var a = 0; a < e.stackNodes.length; a++) {
                    var o = e.stackNodes[a];
                    if (((o.active = !0), i)) {
                      ((o.x += i.x), (o.y += i.y));
                      var n = cc.moveBy(0.15, cc.v2(-i.x, -i.y)).easing(cc.easeCubicActionOut()),
                        s = cc.callFunc(function () {
                          t.showYanWuAnim(!0);
                        });
                      o.runAction(cc.sequence(n, s));
                    }
                  }
              },
              this,
            );
          },
          getHand3DEndPos: function () {
            var e = this.direction,
              t = null;
            return (
              e == i.Front && (t = new cc.Vec3(this._edgePos.x, 0, 0)),
              e == i.Left && (t = new cc.Vec3(this._edgePos.y, -this._edgePos.x, 0)),
              e == i.Right && (t = new cc.Vec3(-this._edgePos.y, -this._edgePos.x, 0)),
              e == i.Mine && (t = new cc.Vec3(-this._edgePos.x, 0, 0)),
              t
            );
          },
          dispatchHandAnimEvent: function (e, t, i, a) {
            var o = new cc.Event.EventCustom("CPG_HAND_ANIM", !0),
              n = this.direction,
              s = new cc.Vec3(0, 0, 0);
            (o.setUserData({
              stack: i,
              nViewSeatId: n,
              handTileNode: e,
              tEndPos: t,
              offSetPadding: s,
              playYanback: function () {},
              playCallback: function () {},
              playActionEnd: function (e) {
                (void 0 === e && (e = null), a(e));
              },
            }),
              MJ.GameViewHandler.tileModule.dispatchEvent(o));
          },
          getStackBoxNode: function () {
            return null;
          },
          showYanWuAnim: function (e) {
            if (e) {
              var t = g_oPrefabLoader.instantiate(this.yanWuPrefab),
                i = 0,
                a = 0;
              0 === this.direction
                ? ((i = -180), (a = 20))
                : 1 === this.direction
                  ? ((i = 30), (a = 120))
                  : 2 === this.direction
                    ? ((i = 180), (a = -20))
                    : 3 === this.direction && ((i = -30), (a = -120));
              var o = cc.v2(this._edgePos.x + i, this._edgePos.y + a);
              (t.setPosition(o), (t.scale = 1.6), this.node.addChild(t));
              var n = t.getComponent(cc.Animation);
              (n.play(),
                n.on(
                  "finished",
                  function () {
                    t.destroy();
                  },
                  this,
                ));
            }
            this._showYanWu = !0;
          },
          getEdgeWorldPos: function () {
            return this._aTiles.length > 0 && this.node.convertToWorldSpaceAR(this._edgePos);
          },
          getAllCpg: function () {
            return this.stacks;
          },
          setCPGTileFlag: function (e) {
            for (var t = e.nJiTagType, i = e.nJiTileValue, a = 0; a < this._aTiles.length; a++) {
              var o = this._aTiles[a],
                n = o.getComponent("ZMJTile").tileValue,
                s = g_tConst.eTileTag.None;
              if (n === i) {
                ((s = t), o.emit("SET_TILE_TAG", { nTagType: s }));
                break;
              }
            }
          },
          showChooseTileHint: function (e) {
            this._aTiles.forEach(function (t) {
              var i = t.getComponent("ZMJTile");
              i.setChooseTileHint(i.tileValue === e);
            });
          },
          _isGang: function (e) {
            return [
              g_tConst.BlockCfgs.BlockExposedKong.BlockType,
              g_tConst.BlockCfgs.BlockConcealedKong.BlockType,
              g_tConst.BlockCfgs.BlockPatchedKong.BlockType,
            ].includes(e);
          },
          _isDan: function (e) {
            return [
              g_tConst.BlockCfgs.BlockXuanFengDan.BlockType,
              g_tConst.BlockCfgs.BlockSiFengDan.BlockType,
              g_tConst.BlockCfgs.BlockYaoDan.BlockType,
              g_tConst.BlockCfgs.BlockJiuDan.BlockType,
              g_tConst.BlockCfgs.BlockXiaoJiFeiDan.BlockType,
            ].includes(e);
          },
          layoutDan: function (e) {
            for (
              var t = e.self,
                i = e.stack,
                a = e.curPos,
                o = e.initTileProp,
                n = i._aTileValues,
                s = 0;
              s < n.length;
              ++s
            ) {
              var r = i._tileCountMap.get(s),
                c = s,
                l = n[s],
                g = cc.instantiate(t.tilePrefab),
                d = g.getComponent("ZMJTile");
              t.node.addChild(g);
              var h = (s + 1) * i.tileZOderStart,
                u = cc.v2(a.x, a.y);
              ((g.position = u),
                (g.zIndex = h),
                (g.scale = t.tileScale),
                c > 3 && (c = 3),
                o(i, l, i.tileTexture[c], d, !0),
                g.emit("SHOW_TILE_COUNT_TAG", { tileCount: r }),
                (a = a.add(i.tileInterval)));
              var _ =
                MJ.GameLogic.TileModel.mHandTileValues[g_tConst.GameConfig.ViewSeat.SeatMine]
                  .length;
              if (
                5 === n.length &&
                i._viewSeatId === g_tConst.GameConfig.ViewSeat.SeatMine &&
                10 === _
              ) {
                var m = 0.8 * i.tileInterval.x;
                a = a.add(new cc.Vec2(-i.tileInterval.x, 0));
                var f = g.height;
                ((g.width *= 0.8),
                  (g.height *= 0.8),
                  (d.oTileColor.node.width *= 0.8),
                  (d.oTileColor.node.height *= 0.8));
                var p = (f - g.height) / 2;
                ((g.y -= p), (a = a.add(new cc.Vec2(m, 0))));
              }
              t._aTiles.push(g);
            }
            return a.add(t.gap);
          },
          sortGangTile: function (e) {
            var t = [],
              i = [];
            return (
              e.forEach(function (e) {
                a.isBao(e) || a.isZuan(e) ? i.push(e) : t.push(e);
              }),
              i.length > 1 ? [t[0], i[0], t[1], i[1]] : t.concat(i)
            );
          },
          sortPongTile: function (e) {
            var t = [],
              i = [];
            e.forEach(function (e) {
              a.isBao(e) || a.isZuan(e) ? i.push(e) : t.push(e);
            });
            var o = t;
            return (
              2 === i.length
                ? (i.splice(1, 0, t[0]), (o = i))
                : 1 === i.length && (t.splice(1, 0, i[0]), (o = t)),
              o
            );
          },
        }),
          cc._RF.pop());
      },
      {
        Direction: "Direction",
        ZMJTile: "ZMJTile",
        table3dTypeEnum: "table3dTypeEnum",
        tileLogicHelper: "tileLogicHelper",
      },
    ],
