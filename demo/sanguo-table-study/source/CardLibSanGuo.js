    CardLibSanGuo: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "01c0b3gc45PVrDQnOzsHl0N", "CardLibSanGuo");
        var i = e("CardLibBase");
        ((t.exports = (function (e) {
          var t, i;
          function a() {
            var t;
            return (
              ((t = e.call(this) || this)._colorMap = new Map()),
              (t._tileUVPosMap = new Map()),
              (t._tileSoundData = new Map()),
              t
            );
          }
          ((i = e),
            ((t = a).prototype = Object.create(i.prototype)),
            (t.prototype.constructor = t),
            (t.__proto__ = i));
          var o = a.prototype;
          return (
            (o.initData = function () {
              (this.initColorMap(), this.initTileUVPosMap(), this.initTileSoundMap());
            }),
            (o.initColorMap = function () {
              (this._colorMap.set(g_tConst.MJColor.SGOthers, 7),
                this._colorMap.set(g_tConst.MJColor.SGWei, 8),
                this._colorMap.set(g_tConst.MJColor.SGShu, 9),
                this._colorMap.set(g_tConst.MJColor.SGWu, 10),
                this._colorMap.set(g_tConst.MJColor.SGXi, 11),
                this._colorMap.set(g_tConst.MJColor.SGBao, 12));
            }),
            (o.initTileUVPosMap = function () {
              this._tileUVPosMap = new Map();
              for (var e = 113, t = 1; e <= 115; e++, t++)
                this._tileUVPosMap.set(e, { row: 3, col: t });
              for (var i = 129, a = 1; i <= 131; i++, a++)
                this._tileUVPosMap.set(i, { row: 4, col: a });
              for (var o = 145, n = 1; o <= 147; o++, n++)
                this._tileUVPosMap.set(o, { row: 5, col: n });
              for (var s = 161, r = 1; s <= 163; s++, r++)
                this._tileUVPosMap.set(s, { row: 6, col: r });
              for (var c = 177, l = 1; c <= 179; c++, l++)
                this._tileUVPosMap.set(c, { row: 7, col: l });
              this._tileUVPosMap.set(193, { row: 8, col: 1 });
            }),
            (o.initTileSoundMap = function () {
              var e = this;
              this._tileSoundData = new Map();
              for (
                var t = function (t) {
                    e._tileSoundData.set(t, {
                      tileValue: t,
                      Male: ["sg_" + t],
                      Female: ["sg_" + t],
                    });
                  },
                  i = 113;
                i <= 115;
                i++
              )
                t(i);
              for (var a = 129; a <= 131; a++) t(a);
              for (var o = 145; o <= 147; o++) t(o);
              for (var n = 161; n <= 163; n++) t(n);
            }),
            (o.getUVPosByTileValue = function (t) {
              return this._tileUVPosMap.get(t) || e.prototype.getUVPosByTileValue.call(this, t);
            }),
            (o.getTileUVAssetUrl = function () {
              return g_tAsset.tileSGUV;
            }),
            (o.getMJ2dPicName = function (t) {
              var i = e.prototype.getMJ2dPicName.call(this, t);
              return (
                (this.isColorOf(g_tConst.MJColor.SGOthers, t) ||
                  this.isColorOf(g_tConst.MJColor.SGWei, t) ||
                  this.isColorOf(g_tConst.MJColor.SGShu, t) ||
                  this.isColorOf(g_tConst.MJColor.SGWu, t) ||
                  this.isColorOf(g_tConst.MJColor.SGXi, t) ||
                  this.isColorOf(g_tConst.MJColor.SGBao, t)) &&
                  (i = g_tConst.GameTypeCfgs.SGMJ.TYPEID + "_" + i),
                i
              );
            }),
            (o.getTileSoundData = function (t) {
              return this._tileSoundData.get(t) || e.prototype.getTileSoundData.call(this, t);
            }),
            (o.getMjRecorderShowCfg = function () {
              return [1, 2, [7, 8, 9, 10], 11, 12];
            }),
            a
          );
        })(i)),
          cc._RF.pop());
      },
      { CardLibBase: "CardLibBase" },
    ],
