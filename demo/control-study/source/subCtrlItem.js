    subCtrlItem: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "7360dTaHe9PP7v4GbVOvYwQ", "subCtrlItem");
        var i = cc.Class({
          name: "SubItemFrame",
          properties: {
            btnType: { tooltip: "\u6309\u94ae\u7c7b\u578b", default: 0 },
            fontFrames: {
              tooltip: "\u6309\u94ae\u5b57\u4f53\u7eb9\u7406",
              type: cc.SpriteFrame,
              default: null,
            },
          },
        });
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            ctrlFontFrames: [i],
            typeFontBody: cc.Sprite,
            nodeMj: cc.Node,
            tilePrefab: cc.Prefab,
            tileTexture: cc.SpriteFrame,
            tileScale: 0,
            colorScale: cc.Vec2,
            colorPos: cc.Vec2,
            _nType: -1,
            _aTileValues: [],
            _voiceOrderHandle: null,
          },
          Awake: function () {},
          setBtn: function (e, t, i) {
            (this.initBtn(i),
              (this._nType = e),
              (this._aTileValues = t),
              (this._nBtnType = i),
              i === g_tConst.BlockBtnType.Gang
                ? this.initGangTile()
                : i === g_tConst.BlockBtnType.Chow
                  ? this.initChowTile()
                  : i === g_tConst.BlockBtnType.Dan && this.initDanTile());
          },
          initBtn: function (e) {
            for (var t = 0; t < this.ctrlFontFrames.length; t++) {
              var i = this.ctrlFontFrames[t],
                a = i.btnType,
                o = i.fontFrames;
              if (e === a) {
                this.typeFontBody.spriteFrame = o;
                break;
              }
            }
          },
          initChowTile: function () {
            for (var e = this, t = this._aTileValues.length, i = 0; i < t; i++) {
              var a = cc.instantiate(this.tilePrefab),
                o = a.getComponent("ZMJTile");
              (this.nodeMj.addChild(a),
                o.init(this.tileTexture, this._aTileValues[i], !0, {
                  position: this.colorPos,
                  scale: this.colorScale,
                }));
            }
            this._voiceOrderHandle = g_oEvent.addEventListener(
              g_tEvent.MOD_VOICEORDER_ORDER_CHI_CHOOSE,
              function (t) {
                (Log.info(
                  "BIRD >>>",
                  "subCtrlItem.js",
                  "MOD_VOICEORDER_ORDER_GANG",
                  "chiChooseCards & this._aTileValues",
                ),
                  Log.info(e._aTileValues),
                  Log.info(t),
                  t
                    .map(function (t) {
                      return e._aTileValues.includes(t);
                    })
                    .reduce(function (e, t) {
                      return e && t;
                    }) && e.onClicked());
              },
              this,
            );
          },
          initGangTile: function () {
            var e = this,
              t = cc.instantiate(this.tilePrefab),
              i = t.getComponent("ZMJTile");
            (this.nodeMj.addChild(t),
              i.init(this.tileTexture, this._aTileValues[0], !0, {
                position: this.colorPos,
                scale: this.colorScale,
              }),
              (this._voiceOrderHandle = g_oEvent.addEventListener(
                g_tEvent.MOD_VOICEORDER_ORDER_GANG,
                function (t) {
                  (Log.info(
                    "BIRD >>>",
                    "subCtrlItem.js",
                    "MOD_VOICEORDER_ORDER_GANG",
                    "gangCardVal is " + t,
                    "this._aTileValues[0] is " + e._aTileValues[0],
                  ),
                    t === e._aTileValues[0] && e.onClicked());
                },
                this,
              )));
          },
          initDanTile: function () {
            this.typeFontBody.node.active = !1;
            var e = this.node.getComponent(cc.Layout),
              t = this.nodeMj.getComponent(cc.Layout);
            ((e.enabled = !1), (t.enabled = !1), (this.nodeMj.anchorX = 0));
            for (var i = this._aTileValues.length, a = 0; a < i; a++) {
              var o = cc.instantiate(this.tilePrefab);
              o.anchorX = 0;
              var n = o.width + 5;
              ((o.x = a * n), (this.nodeMj.width = (a + 1) * n));
              var s = o.getComponent("ZMJTile");
              (this.nodeMj.addChild(o),
                (this.colorPos.x = n / 2),
                s.init(this.tileTexture, this._aTileValues[a], !0, {
                  position: this.colorPos,
                  scale: this.colorScale,
                }));
            }
            ((this.nodeMj.width -= 5),
              (this.nodeMj.x = (-this.nodeMj.width / 2) * this.nodeMj.scaleX),
              (this.node.width = this.nodeMj.width * this.nodeMj.scaleX + 10));
          },
          onClicked: function () {
            this.reqBlock(this._nType, this._aTileValues);
          },
          reqBlock: function (e, t) {
            var i = new cc.Event.EventCustom("REQ_BLOCK", !0);
            (i.setUserData({ nType: e, aTileValues: t }), this.node.dispatchEvent(i));
          },
          onDisable: function () {
            this._voiceOrderHandle &&
              (g_oEvent.removeEventListener(this._voiceOrderHandle),
              (this._voiceOrderHandle = null));
          },
        }),
          cc._RF.pop());
      },
      {},
    ],
