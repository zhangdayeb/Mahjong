    ZMJOutTileRow: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "5937bbnyDRBpIOcMVi/USoQ", "ZMJOutTileRow"), e("ZMJTile"));
        var i = e("Direction"),
          a = cc.Class({
            name: "OUT_TILE_FRONT",
            properties: {
              tileTextures: cc.SpriteFrame,
              colorPos: cc.Vec2,
              colorRotation: 0,
              colorScale: cc.Vec2,
              colorSkew: cc.Vec2,
              tileStep: cc.Vec2,
            },
          });
        (cc.Class({
          extends: cc.Component,
          properties: {
            tileRowIndex: 1,
            direction: { type: i, default: 0 },
            FrontParam: [a],
            tileSideTexture: cc.SpriteFrame,
            tileStep: cc.Vec2,
            tileStepSide: cc.Vec2,
            colorPos: cc.Vec2,
            colorRotation: 0,
            colorScale: cc.Vec2,
            colorSkew: cc.Vec2,
            tilePrefab: cc.Prefab,
            curTileCount: {
              get: function () {
                return this._nTileIndex;
              },
            },
            bigTileDelta: cc.Vec2,
            bigTexture: cc.SpriteFrame,
          },
          getDirection: function () {
            return this.direction;
          },
          onLoad: function () {
            ((this._nTileIndex = 0),
              (this.colorSkewStep = 1),
              (this._curPos = cc.v2(0, 0)),
              (this._cur3DPos = cc.v3(0, 0, 0)),
              (this._LastPos = cc.v2(0, 0)),
              (this._oTiles = []));
          },
          removeTile: function (e) {
            MJ.GameViewHandler.removeTile(e);
          },
          resetTile: function () {
            for (var e = 0; e < this._oTiles.length; e++) this.removeTile(this._oTiles[e]);
            this._oTiles = [];
          },
          addOutTile: function (e, t, i, a) {
            return (
              (this.direction = e),
              !(
                this._nTileIndex > this.FrontParam.length - 1 ||
                (this.addOutTileFront(t, i), a && this.showDiamond(), 0)
              )
            );
          },
          setJiPaiFlag: function (e) {
            for (var t = e.nJiTagType, i = e.nJiTileValue, a = 0; a < this._oTiles.length; a++) {
              var o = this._oTiles[a],
                n = o.getComponent("ZMJTile").tileValue,
                s = g_tConst.eTileTag.None;
              if (n === i) {
                ((s = t), o.emit("SET_TILE_TAG", { nTagType: s }));
                break;
              }
            }
          },
          popOutTile: function (e) {
            void 0 === e && (e = null);
            var t = this._oTiles[this._oTiles.length - 1];
            return isNull(t)
              ? 1
              : e != t.getComponent("ZMJTile").tileValue
                ? 3
                : (this._oTiles.pop(),
                  this._nTileIndex--,
                  (this._cur3DPos = this._cur3DPos.sub(this.getSubSize())),
                  (this._curPos = this._curPos.sub(this.FrontParam[this._nTileIndex].tileStep)),
                  this.removeTile(t),
                  2);
          },
          popOutTileFromBack: function (e) {
            var t = !1;
            if (this._oTiles.length > 0) {
              for (var i = -1, a = this._oTiles.length - 1; a >= 0; a--) {
                var o = this._oTiles[a];
                if (cc.isValid(o)) {
                  var n = o.getComponent("ZMJTile");
                  if (n && n.tileValue == e) {
                    ((i = a), (t = !0));
                    break;
                  }
                }
              }
              if (i >= 0) {
                var s = this._oTiles[i];
                (this._oTiles.splice(i, 1),
                  this._nTileIndex--,
                  (this._cur3DPos = this._cur3DPos.sub(this.getSubSize())),
                  (this._curPos = this._curPos.sub(this.FrontParam[this._nTileIndex].tileStep)),
                  this.removeTile(s));
              }
            }
            return t;
          },
          dispatchAnimEvent: function (e, t, i, a, o) {
            var n = MJ.GameViewHandler.tileModule.getComponent("ZMJTileInterface"),
              s = function () {
                (cc.isValid(e) && (e.active = !0), o && this.showDiamond());
              }.bind(this),
              r = new cc.Event.EventCustom("OUT_TILE_ANIM", !0);
            (r.setUserData({
              nViewSeatId: this.direction,
              tileNode: e,
              nOutTileValue: t,
              endPos: i,
              offSetPadding: n.getOffSetPadding(this.direction, "OUT"),
              chupaiActionEnd: s,
            }),
              this.node.dispatchEvent(r),
              a.playSound());
          },
          getSubSize: function () {
            var e = g_oData.get(g_tData.table3dData).getTile3dContentSize(),
              t = this.getDirection(),
              a = e.x,
              o = new cc.Vec3(1, 0, 0);
            return (
              t == i.Front && (o = new cc.Vec3(-1, 0, 0)),
              t == i.Left && (o = new cc.Vec3(0, 0, 1)),
              t == i.Right && (o = new cc.Vec3(0, 0, -1)),
              t == i.Mine && (o = new cc.Vec3(1, 0, 0)),
              o.scale(new cc.Vec3(a, a, a))
            );
          },
          addOutTileFront: function (e, t) {
            var i = cc.instantiate(this.tilePrefab),
              a = i.getComponent("ZMJTile");
            (this.node.addChild(i), (i.position = this._curPos));
            var o = this.getZStep(this._nTileIndex, this.FrontParam.length);
            ((i.zIndex = o),
              (this.colorSkew = cc.v2(
                Math.pow(this.colorSkew.x, this.colorSkewStep),
                this.colorSkew.y,
              )),
              a.init(this.FrontParam[this._nTileIndex].tileTextures, e, !0, {
                scale: this.FrontParam[this._nTileIndex].colorScale,
                skew: this.FrontParam[this._nTileIndex].colorSkew,
                position: this.FrontParam[this._nTileIndex].colorPos,
                rotation: this.FrontParam[this._nTileIndex].colorRotation,
              }),
              this.layout3DPos());
            var n = this._cur3DPos;
            (t && ((i.active = !1), this.dispatchAnimEvent(i, e, n, a)),
              (this._LastPos = cc.v2(0, 0).add(this._curPos)),
              (this._curPos = this._curPos.add(this.FrontParam[this._nTileIndex].tileStep)),
              this._oTiles.push(i),
              this._nTileIndex++);
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
          layout3DPos: function () {
            for (var e = cc.v3(0, 0, 0), t = 0; t < this._oTiles.length; t++)
              e = e.add(this.getSubSize());
            ((this._cur3DPos = e),
              2 == this.tileRowIndex && (this._cur3DPos = e.sub(this.getSubSize())));
          },
          showDiamond: function () {
            this._oTiles[this._oTiles.length - 1].getComponent("ZMJTile").showDiamond(!0);
          },
          hideDiamond: function () {
            for (var e = 0; e < this._oTiles.length; e++)
              this._oTiles[e].getComponent("ZMJTile").showDiamond(!1);
          },
          getAllTiles: function () {
            return this._oTiles;
          },
          layoutTiles: function () {
            for (
              var e = cc.v3(0, 0, 0), t = cc.v2(0, 0), i = 0, a = 0;
              a < this._oTiles.length;
              a++
            ) {
              i++;
              var o = this._oTiles[a];
              (cc.isValid(o) && (o.position = t),
                (e = e.add(this.getSubSize())),
                i >= this.FrontParam.length &&
                  (console.error(
                    "\u9519\u8bef:ZMJOutTileRow",
                    this.direction,
                    i,
                    this.tileRowIndex,
                    this._nTileIndex,
                    this._oTiles.length,
                    this.FrontParam.length,
                  ),
                  (i = this.FrontParam.length - 1)),
                (t = t.add(this.FrontParam[i].tileStep)));
            }
            ((this._nTileIndex = i),
              (this._curPos = t),
              (this._cur3DPos = e),
              2 == this.tileRowIndex && (this._cur3DPos = e.sub(this.getSubSize())));
          },
        }),
          cc._RF.pop());
      },
      { Direction: "Direction", ZMJTile: "ZMJTile" },
    ],
