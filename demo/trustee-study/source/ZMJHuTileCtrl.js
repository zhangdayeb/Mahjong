    ZMJHuTileCtrl: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "a5cedIEoCZMqZlf/I1z5mlA", "ZMJHuTileCtrl");
        var i = e("Direction"),
          a = e("tileLogicHelper");
        (cc.Class({
          extends: cc.Component,
          properties: {
            offsetPosNode: cc.Node,
            direction: { type: i, default: 1 },
            tileScale: 1,
            tilePrefab: cc.Prefab,
            tileTexture: cc.SpriteFrame,
            tileStep: cc.Vec2,
            rowZorderStart: 0,
            rowZorderStep: 0,
            tileZorderStep: 0,
            rowStep: cc.Vec2,
            colorPos: cc.Vec2,
            colorSkew: cc.Vec2,
            colorScale: cc.Vec2,
            colorRotation: 0,
            nRowTileCount: 5,
          },
          start: function () {},
          onLoad: function () {
            ((this._curPos = cc.v2(0, 0)),
              (this._nTileIndex = 0),
              (this._nZorder = this.rowZorderStart),
              (this._oHuTiles = []),
              (this._mHuaTiles = []),
              (this._rascalKongTiles = []));
          },
          addHandTableOffset: function (e) {
            if (cc.isValid(this.offsetPosNode)) {
              var t = this.offsetPosNode.position;
              ((t.x += e.x || 0), (t.y += e.y || 0), (this.offsetPosNode.position = t));
            }
          },
          resetTile: function () {
            (this.node.removeAllChildren(),
              (this._curPos = cc.v2(0, 0)),
              (this._nTileIndex = 0),
              (this._nZorder = this.rowZorderStart),
              (this._oHuTiles = []),
              (this._mHuaTiles = []),
              (this._rascalKongTiles = []));
          },
          pushFlowerTile: function (e) {
            for (var t = 0; t < e.length; t++) {
              var i = e[t];
              if (a.isFlower(i)) {
                var o = cc.instantiate(this.tilePrefab);
                (this.node.addChild(o),
                  o
                    .getComponent("ZMJTile")
                    .init(this.tileTexture, i, !0, {
                      position: this.colorPos,
                      scale: this.colorScale,
                      skew: this.colorSkew,
                      rotation: this.colorRotation,
                    }),
                  (o.position = this._curPos),
                  (o.zIndex = this._nZorder),
                  (o.scale = this.tileScale),
                  this._nTileIndex++,
                  (this._nZorder = this._nZorder + this.tileZorderStep),
                  this._nTileIndex > 0 && this._nTileIndex % this.nRowTileCount == 0
                    ? (this.resetRowPos(),
                      (this._nZorder = this._nZorder + this.rowZorderStep),
                      (this._curPos = this._curPos.add(this.rowStep)))
                    : (this._curPos = this._curPos.add(this.tileStep)),
                  this._mHuaTiles.push(o));
              }
            }
            var n = new cc.Event.EventCustom("ON_BU_FLOWER_FINISHED", !0);
            (n.setUserData({ nViewSeatId: this.direction }), this.node.dispatchEvent(n));
          },
          pushHuTile: function (e, t, i) {
            var a = cc.instantiate(this.tilePrefab);
            this.node.addChild(a);
            var o = a.getComponent("ZMJTile");
            if (
              (o.init(this.tileTexture, e, !0, {
                position: this.colorPos,
                scale: this.colorScale,
                skew: this.colorSkew,
                rotation: this.colorRotation,
              }),
              (a.position = this._curPos),
              (a.zIndex = this._nZorder),
              (a.scale = this.tileScale),
              t && o.showHuDian(i),
              this._nTileIndex++,
              (this._nZorder = this._nZorder + this.tileZorderStep),
              this._nTileIndex > 0 && this._nTileIndex % this.nRowTileCount == 0)
            ) {
              (this.resetRowPos(), (this._nZorder = this._nZorder + this.rowZorderStep));
              var n = this._nTileIndex / this.nRowTileCount;
              this._curPos = this._curPos.add(cc.v2(this.rowStep.x * n, this.rowStep.y * n));
            } else this._curPos = this._curPos.add(this.tileStep);
            return (this._oHuTiles.push(a), a);
          },
          resetRowPos: function () {
            ((this._curPos.x = 0), (this._curPos.y = 0));
          },
          showChooseTileHint: function (e) {
            this._oHuTiles.forEach(function (t) {
              var i = t.getComponent("ZMJTile");
              i.setChooseTileHint(i.tileValue === e);
            });
          },
          setHuTileTag: function (e, t) {
            this._oHuTiles.forEach(function (i) {
              var a = i.getComponent("ZMJTile").tileValue[0];
              if (t && t(a)) {
                var o = e;
                i.emit("SET_TILE_TAG", { nTagType: o });
              }
            });
          },
          pushRascalKongTile: function (e) {
            var t = cc.instantiate(this.tilePrefab);
            (this.node.addChild(t),
              t
                .getComponent("ZMJTile")
                .init(this.tileTexture, e, !0, {
                  position: this.colorPos,
                  scale: this.colorScale,
                  skew: this.colorSkew,
                  rotation: this.colorRotation,
                }));
            var a = this.getRascalKongTileNextPos();
            return (
              (t.position = a),
              (t.scale = this.tileScale),
              this.direction === i.Right &&
                (t.zIndex = 3 * this.rowZorderStart + this._rascalKongTiles.length),
              this._rascalKongTiles.push(t),
              t
            );
          },
          getLastRascalKongTile: function () {
            var e = this._rascalKongTiles;
            return e.length > 0 ? e[e.length - 1] : null;
          },
          getRascalKongTileNextPos: function () {
            var e = cc.v2(0, 0),
              t = this.getLastRascalKongTile();
            if (cc.isValid(t)) e = t.position.add(this.rowStep);
            else
              switch (this.direction) {
                case i.Mine:
                  e = cc.v2(-70, 0);
                  break;
                case i.Left:
                  e = cc.v2(0, 70);
                  break;
                case i.Front:
                  e = cc.v2(120, 0);
                  break;
                case i.Right:
                  e = cc.v2(-8, -55);
              }
            return e;
          },
          getAllHuTiles: function () {
            return this._oHuTiles;
          },
        }),
          cc._RF.pop());
      },
      { Direction: "Direction", tileLogicHelper: "tileLogicHelper" },
    ],
