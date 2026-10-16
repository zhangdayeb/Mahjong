    ZMJTile: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "4c2e6bIji5CI6CqCVVOwD1o", "ZMJTile");
        var i = e("tileLogicHelper"),
          a = e("Direction");
        (e("CommonUtils"),
          cc.Class({
            extends: cc.Component,
            properties: {
              direction: { type: a, default: 0 },
              oTileBody: cc.Sprite,
              oTileColor: cc.Sprite,
              colorAtlas: cc.SpriteAtlas,
              oTileHuHit: cc.Sprite,
              oTileHuHitSF: [cc.SpriteFrame],
              oZhongMaFlag: cc.Sprite,
              maiMaResultFrame: [cc.SpriteFrame],
              oTileTag: cc.Sprite,
              lab_tileCountTag: cc.Label,
              oDiamond: cc.Node,
              spCPGSourceHint: cc.Sprite,
              spf_SourceHint_Left: cc.SpriteFrame,
              spf_SourceHint_Right: cc.SpriteFrame,
              spf_SourceHint_Mine: cc.SpriteFrame,
              spf_SourceHint_Front: cc.SpriteFrame,
              bChoose: {
                get: function () {
                  return this._bChoose;
                },
              },
              tilePoints: {
                get: function () {
                  return this._nTilePoints;
                },
              },
              tileColor: {
                get: function () {
                  return this._nTileColor;
                },
              },
              tileValue: {
                get: function () {
                  return this._nTileValue;
                },
              },
              tileIndex: {
                get: function () {
                  return this._nTileIndex;
                },
                set: function (e) {
                  this._nTileIndex = e;
                },
              },
              _tileHotNode: null,
              _blockType: 0,
              _bTriggerBlock: !1,
            },
            onLoad: function () {
              (this.onCustomEvent(),
                (this._OriginalPos = cc.v2(0, 0)),
                (this._bChoose = !1),
                (this._nTileValue = -1),
                (this._nTilePoints = -1),
                (this._nTileColor = -1),
                (this._bMask = !1),
                (this._nTileIndex = -1),
                (this._bTingAct = !1),
                (this.__arrnethandle__ = []));
            },
            onEnable: function () {
              var e = this;
              (this.onDisable(),
                (this.__arrnethandle__ = []),
                (this._tileType = 0),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.RESET_TILE_TYPE,
                    function () {
                      e.resetTileType(1);
                    },
                    this,
                  ),
                ));
            },
            autoDispose: function (e) {
              this.__arrnethandle__.push(e);
            },
            onDisable: function () {
              for (var e = 0; e < this.__arrnethandle__.length; e++) {
                var t = this.__arrnethandle__[e];
                g_oEvent.removeEventListener(t);
              }
            },
            start: function () {},
            setIsTingAct: function (e) {
              this._bTingAct = e;
            },
            setTriggerBlock: function (e, t) {
              ((this._bTriggerBlock = e), (this._blockType = t));
            },
            getMaskTouch: function () {
              return !MJ.GameLogic.TableModel.isXLHZMJ() && !0 === this._bMask;
            },
            onCustomEvent: function () {
              (this.node.on(
                "choose",
                function () {
                  if (!this.getMaskTouch()) {
                    (this._bChoose && this.reqOutTile(),
                      (this.node.position = this._OriginalPos.add(cc.v2(0, 35))),
                      g_oEvent.dispatchEvent(g_tEvent.TEACH_CHAGE_MASK, {
                        nTileIndex: this._nTileIndex,
                        pos: [0, 35],
                      }),
                      (this._bChoose = !0),
                      g_oAudioManager.play(g_tAsset.EffectSound.select));
                    var e = new cc.Event.EventCustom("TILE_CHOOSE", !0);
                    (e.setUserData({ nTileValue: this._nTileValue }), this.node.dispatchEvent(e));
                  }
                },
                this,
              ),
                this.node.on(
                  "unchoose",
                  function () {
                    ((this.node.position = this._OriginalPos),
                      g_oEvent.dispatchEvent(g_tEvent.TEACH_CHAGE_MASK_HSZ, {
                        nTileIndex: this._nTileIndex,
                        pos: [0, -35],
                      }),
                      (this._bChoose = !1));
                  },
                  this,
                ),
                this.node.on(
                  "fllow",
                  function (e) {
                    this.node.position = e.pos;
                  },
                  this,
                ),
                this.node.on(
                  "moveout",
                  function () {
                    if (this.getMaskTouch()) {
                      var e = cc.moveTo(0.5, this._OriginalPos);
                      return (
                        this.node.runAction(e.easing(cc.easeSineInOut())),
                        void (this._bChoose = !1)
                      );
                    }
                    (this._bChoose
                      ? (this.node.position = this._OriginalPos.add(cc.v2(0, 35)))
                      : (this.node.position = this._OriginalPos),
                      this.reqOutTile());
                  },
                  this,
                ),
                this.node.on(
                  "reset",
                  function () {
                    ((this.node.position = this._OriginalPos),
                      g_oEvent.dispatchEvent(g_tEvent.TEACH_CHAGE_BACK_MASK));
                  },
                  this,
                ),
                this.node.on(
                  "SET_TILE_TAG",
                  function (e) {
                    this.initTileTag(e.nTagType, e.tagTrans);
                  },
                  this,
                ),
                this.node.on("SHOW_SOURCE", this.onSetSource, this),
                this.node.on(
                  "SHOW_TILE_COUNT_TAG",
                  function (e) {
                    var t = e.tileCount;
                    t > 1
                      ? ((this.lab_tileCountTag.string = "x" + t),
                        (this.lab_tileCountTag.node.active = !0))
                      : (this.lab_tileCountTag.node.active = !1);
                  },
                  this,
                ),
                this.node.on(
                  "SHOW_AS_UNIVERSAL_CARD",
                  function (e) {
                    var t = e.showMode,
                      i = e.nViewSeatId;
                    this.showAsUniversalCard(t, !0, i);
                  },
                  this,
                ));
            },
            getTileTag: function () {
              return this._nTagType || g_tConst.eTileTag.None;
            },
            setTileTag: function (e) {
              this._nTagType = e;
              var t = g_tConst.eTileTag;
              ((this.oTileTag.node.active = !1),
                t.None === e
                  ? (this.oTileTag.node.active = !1)
                  : ((this.oTileTag.node.active = !0),
                    (this.oTileTag.spriteFrame = this.getTagSF(e))));
            },
            scaleTileTag: function (e) {
              if (this.oTileTag.node.active) {
                var t = this.oTileTag.node.width,
                  i = this.oTileTag.node.height;
                ((this.oTileTag.node.width *= e), (this.oTileTag.node.height *= e));
                var a = Math.abs(this.oTileTag.node.width - t) / 2,
                  o = Math.abs(this.oTileTag.node.height - i) / 2;
                e >= 1
                  ? ((this.oTileTag.node.x += a), (this.oTileTag.node.y -= o))
                  : ((this.oTileTag.node.x -= a), (this.oTileTag.node.y += o));
              }
            },
            setPos: function (e) {
              this.node &&
                cc.isValid(this.node) &&
                ((this.node.position = e), (this._OriginalPos = this.node.position));
            },
            reqOutTile: function () {
              if (g_oData.get(g_tData.GameTeachMod).CheckShowIsAutoLayer())
                g_oEvent.dispatchEvent(g_tEvent.TEACH_REQ_OUT);
              else if (!MJ.GameAnimMgr.isPlaying()) {
                if (this._bTingAct) {
                  var e = new cc.Event.EventCustom("REQ_BLOCK_TING", !0);
                  return (
                    e.setUserData({
                      nBlockType: g_tConst.BlockCfgs.BlockTing.BlockType,
                      aTileValues: [this._nTileValue],
                    }),
                    void this.node.dispatchEvent(e)
                  );
                }
                if (this._bTriggerBlock) {
                  var t = new cc.Event.EventCustom("REQ_BLOCK", !0);
                  return (
                    t.setUserData({ nType: this._blockType, aTileValues: [this._nTileValue] }),
                    void MJ.GameViewHandler.node.dispatchEvent(t)
                  );
                }
                var i = new cc.Event.EventCustom("REQ_OUT_TILE", !0);
                (i.setUserData({ nOutTileValue: this._nTileValue }), this.node.dispatchEvent(i));
              }
            },
            showDiamond: function (e) {
              this.oDiamond.active = e;
            },
            init: function (e, t, a, o) {
              (void 0 === o && (o = {}),
                e && (this.oTileBody.spriteFrame = e),
                (this._nTileValue = t),
                (this._nTilePoints = i.getTilePoints(t)),
                (this._nTileColor = i.getTileColor(t)),
                (this.oTileColor.node.active = !1),
                (this._bFront = a),
                this.resetTileType(0),
                a &&
                  ((this.oTileColor.node.active = !0),
                  (this.oTileColor.spriteFrame = this.getColorSF(
                    this._nTilePoints,
                    this._nTileColor,
                  ))),
                null != o.position && (this.oTileColor.node.position = o.position),
                null != o.scale &&
                  ((this.oTileColor.node.scaleX = o.scale.x),
                  (this.oTileColor.node.scaleY = o.scale.y)),
                null != o.angle && (this.oTileColor.node.angle = o.angle),
                null != o.skew &&
                  ((this.oTileColor.node.skewX = o.skew.x),
                  (this.oTileColor.node.skewY = o.skew.y)));
            },
            initTileTag: function (e, t) {
              ((this.oTileTag.node.position =
                t && null != t.position ? t.position : this.oTileColor.node.position),
                (this.oTileTag.node.angle =
                  t && null != t.angle ? t.angle : this.oTileColor.node.angle),
                (this.oTileTag.node.scaleX =
                  t && null != t.scale && null != t.skew.x ? t.scale : this.oTileColor.node.scaleX),
                (this.oTileTag.node.scaleY =
                  t && null != t.scale && null != t.skew.y ? t.scale : this.oTileColor.node.scaleY),
                (this.oTileTag.node.skewY =
                  t && t.skew && null != t.skew.y ? t.skew.y : this.oTileColor.node.skewY),
                (this.oTileTag.node.skewX =
                  t && t.skew && null != t.skew.x ? t.skew.x : this.oTileColor.node.skewX),
                this.setTileTag(e));
            },
            resetTileType: function () {
              MJ.GameViewHandler && MJ.GameViewHandler._resetTileType
                ? (this._tileType != MJ.GameViewHandler._zmjTileType &&
                    (this._tileType = MJ.GameViewHandler._zmjTileType),
                  this._nTilePoints >= 0 &&
                    this._nTileColor >= 0 &&
                    (this.oTileColor.spriteFrame = this.getColorSF(
                      this._nTilePoints,
                      this._nTileColor,
                    )))
                : (this._tileType = 0);
            },
            getColorSF: function (e, t) {
              var i, o;
              if (
                ((o =
                  this.direction === a.Right
                    ? "r_img_tile_" + t + "_" + e
                    : "img_tile_" + t + "_" + e),
                MJ.GameLogic.TableModel.isSGMJ())
              ) {
                var n = "sg_" + o;
                (i = this.colorAtlas.getSpriteFrame(n)) && (o = n);
              }
              if (0 == this._tileType) i = this.colorAtlas.getSpriteFrame(o);
              else {
                var s = o + "_" + this._tileType;
                i = this.colorAtlas.getSpriteFrame(s) || this.colorAtlas.getSpriteFrame(o);
              }
              return i;
            },
            getTagSF: function (e) {
              return this.direction === a.Right
                ? this.colorAtlas.getSpriteFrame("r_img_Tag_" + e)
                : this.colorAtlas.getSpriteFrame("img_Tag_" + e);
            },
            showHuHit: function (e, t, i) {
              ((this.oTileHuHit.node.active = e),
                (this.oTileHuHit.spriteFrame = this.oTileHuHitSF[0]),
                t && (this.oTileHuHit.spriteFrame = this.oTileHuHitSF[1]),
                i && (this.oTileHuHit.spriteFrame = this.oTileHuHitSF[2]));
            },
            showZhongMaFlag: function (e) {
              var t = e;
              ((this.oZhongMaFlag.node.active = !1),
                0 === t
                  ? (this.oZhongMaFlag.node.active = !1)
                  : 1 === t
                    ? ((this.oZhongMaFlag.spriteFrame = this.maiMaResultFrame[1]),
                      (this.oZhongMaFlag.node.active = !0))
                    : 2 === t &&
                      ((this.oZhongMaFlag.spriteFrame = this.maiMaResultFrame[0]),
                      (this.oZhongMaFlag.node.active = !0)));
            },
            showHuDian: function (e) {
              e
                ? (g_oMJNetManger.autoGameLoop("ANIM_ZIMO_LIGHT"),
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.GameAnim.id,
                    "ANIM_ZIMO_LIGHT",
                    { worldPosition: this.node.convertToWorldSpaceAR(cc.v2(0, 0)) },
                  ))
                : (g_oMJNetManger.autoGameLoop("ANIM_HU_DIAN"),
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.GameAnim.id,
                    "ANIM_HU_DIAN",
                    { worldPosition: this.node.convertToWorldSpaceAR(cc.v2(0, 0)) },
                  ));
            },
            playSound: function () {
              g_oEvent.dispatchEvent(g_tEvent.PLAY_TILE_SOUND, this._nTileValue);
            },
            setMask: function (e) {
              (e && !MJ.GameLogic.TableModel.isXLHZMJ()
                ? ((this.node.color = new cc.Color(120, 120, 120)),
                  (this.oTileColor.node.color = new cc.Color(120, 120, 120)),
                  (this.oTileTag.node.color = new cc.Color(120, 120, 120)))
                : ((this.node.color = new cc.Color(255, 255, 255)),
                  (this.oTileColor.node.color = new cc.Color(255, 255, 255)),
                  (this.oTileTag.node.color = new cc.Color(255, 255, 255))),
                (this._bMask = e));
            },
            setChooseTileHint: function (e) {
              e
                ? ((this.node.color = new cc.Color(120, 120, 120)),
                  (this.oTileColor.node.color = new cc.Color(120, 120, 120)),
                  (this.oTileTag.node.color = new cc.Color(120, 120, 120)))
                : ((this.node.color = new cc.Color(255, 255, 255)),
                  (this.oTileColor.node.color = new cc.Color(255, 255, 255)),
                  (this.oTileTag.node.color = new cc.Color(255, 255, 255)),
                  this._bMask && this.setMask(this._bMask));
            },
            onSetSource: function (e) {
              var t = e.sourceSeatId;
              switch (((this.spCPGSourceHint.node.active = !0), t)) {
                case g_tConst.GameConfig.ViewSeat.SeatMine:
                  this.spCPGSourceHint.spriteFrame = this.spf_SourceHint_Mine;
                  break;
                case g_tConst.GameConfig.ViewSeat.SeatLeft:
                  this.direction === a.Right
                    ? (this.spCPGSourceHint.spriteFrame = this.spf_SourceHint_Right)
                    : (this.spCPGSourceHint.spriteFrame = this.spf_SourceHint_Left);
                  break;
                case g_tConst.GameConfig.ViewSeat.SeatFront:
                  this.spCPGSourceHint.spriteFrame = this.spf_SourceHint_Front;
                  break;
                case g_tConst.GameConfig.ViewSeat.SeatRight:
                  this.direction === a.Right
                    ? (this.spCPGSourceHint.spriteFrame = this.spf_SourceHint_Left)
                    : (this.spCPGSourceHint.spriteFrame = this.spf_SourceHint_Right);
                  break;
                default:
                  ((this.spCPGSourceHint.node.active = !1),
                    Log.error(
                      "BIRD\ud83d\ude21>>>",
                      "ZMJTile.js onSetSource",
                      "\u4e0d\u5e94\u8be5\u8d70\u5230\u8fd9 sourceSeatId is",
                      t,
                    ));
              }
            },
            setActiveHot: function (e) {
              var t = this;
              if (cc.isValid(this._tileHotNode)) this._tileHotNode.active = e;
              else if (e) {
                var i = (
                  MJ.GameLogic.TableModel.getUserGoldFireIndexs().includes(this.tileValue)
                    ? g_tAsset.tileHotAnim_red
                    : g_tAsset.tileHotAnim
                )[this.direction];
                g_oPrefabLoader.loadRes(i, this.node, function (e) {
                  if (cc.isValid(t.node)) {
                    t._tileHotNode = e;
                    var i = t._tileHotNode.getComponent(cc.Animation),
                      a = g_oCommonUtils.getRandomNum(0, 75);
                    i.play(null, a / 100);
                  }
                });
              }
            },
            showAsUniversalCard: function (e, t, i) {
              (e < 2 &&
                i == g_tConst.GameConfig.ViewSeat.SeatMine &&
                this.showUniversalCardGlow(e, t, i),
                this.showAsUniversalCardSkin());
            },
            showUniversalCardGlow: function (e, t, i) {
              var a = this;
              g_oPrefabLoader.loadRes(g_tAsset.UniversalCardGlowPrefab, this.node, function (o) {
                if (cc.isValid(o) && cc.isValid(a.node) && ((o.active = a.node.active), o.active)) {
                  var n = o.getComponent("UniversalCardGlow");
                  n && n.playGlow(e, t, i);
                }
              });
            },
            showAsUniversalCardSkin: function () {
              var e = this,
                t = g_oEnvMgr.Env + "/" + g_tAsset.tileColor2dMat;
              cc.resources.load(t, cc.Material, function (i, a) {
                if (i) Log.error("load " + t, i);
                else if (e && cc.isValid(e.node)) {
                  var o = cc.MaterialVariant.create(a),
                    n = e.node.getComponent(cc.Sprite);
                  n &&
                    (o.setProperty("blendColor", new cc.Color(255, 148, 0, 255)),
                    o.setProperty("greenThreshold", 0.2),
                    o.setProperty("greenThresholdMax", 1),
                    n.setMaterial(0, o));
                }
              });
            },
          }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils", Direction: "Direction", tileLogicHelper: "tileLogicHelper" },
    ],
