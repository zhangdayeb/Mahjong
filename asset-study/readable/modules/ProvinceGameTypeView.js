    ProvinceGameTypeView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "649e4+XE1lGEYP8fM9i/qLu", "ProvinceGameTypeView");
        var i = e("PopDlgBaseView"),
          a = e("QuikStart"),
          o = e("CommonGT"),
          n = e("PopDlgCtrl"),
          s = !0;
        (cc.Class({
          extends: i,
          properties: {
            GameTypeItem: {
              default: null,
              type: cc.Prefab,
              displayName: "GameTypeItem",
              tooltip: "\u73a9\u6cd5\u6309\u94ae\u9884\u5236",
            },
            containerLineOne: {
              default: null,
              type: cc.Node,
              tooltip: "\u73a9\u6cd5\u6309\u94ae\u5bb9\u5668\u7b2c\u4e00\u884c",
            },
            containerLineTwo: {
              default: null,
              type: cc.Node,
              tooltip: "\u73a9\u6cd5\u6309\u94ae\u5bb9\u5668\u7b2c\u4e8c\u884c",
            },
            playAniNode: {
              default: null,
              type: cc.Node,
              tooltip: "\u64ad\u653e\u52a8\u753b\u5bb9\u5668",
            },
            labProvince: { default: null, type: cc.Label, tooltip: "\u7701\u4efd\u6807\u7b7e " },
            lab_QuickGameType: {
              default: null,
              type: cc.Label,
              tooltip: "\u5feb\u901f\u5f00\u59cb\u73a9\u6cd5\u6807\u7b7e ",
            },
            wgt_close: cc.Widget,
            n_joinRoom: cc.Node,
            n_createRoom: cc.Node,
            TopNode: cc.Node,
            FooterNode: cc.Node,
            ScreenMask: cc.Node,
            _provinceCfg: null,
            _tileGTidTop2: [],
            _ShowTime: 0.25,
            _DataInfo: null,
            _xlhz866TileNode: null,
            _xlhz868TileNode: null,
          },
          Awake: function () {
            ((this.n_createRoom.active = this.n_joinRoom.active = !1),
              (this.ScreenMask.active = !1),
              (s = !0),
              this.onMessageEvent(),
              this.onCustomEvent(),
              (this.rightNodePos = this.playAniNode.getPosition()));
          },
          onMessageEvent: function () {
            var e = this;
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.SDK_NOTIFY_USER_INFO,
                function () {
                  this.initQuickstartBtn();
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.SDK_USER_INFO_CHG,
                  function () {
                    this.initQuickstartBtn();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.SCMJ_REQ_GAME_CONFIG_FINISH,
                  this.initDiyRoomBtns,
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.AREAMOD_ON_CURAREA_CHANGE,
                  function () {
                    e.clearAllGameTile();
                    var t = g_oData.get(g_tData.AreaMod).getCurAreaCode(),
                      i = g_oData.get(g_tData.PrivateMsgModel).getAreaCfgByAreaCode(t);
                    e.onInit(i);
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.START_OTHER_LIST_ANIMATION,
                  function () {
                    ((s = !0), this.playUIShowAnimation(!0));
                  },
                  this,
                ),
              ));
          },
          onCustomEvent: function () {
            var e = this;
            this.node.on("ON_INIT", function (t) {
              e._DataInfo = t;
              var i = t.AreaCode;
              g_oData
                .get(g_tData.HistoryMod)
                .record(
                  g_tConst.HistoryRecordLayer.ProvinceSel,
                  g_tConst.GameLayerCfg.Hall_ProvinceGameType.id,
                  "ON_INIT",
                  { AreaCode: i },
                );
              var a = g_oData.get(g_tData.PrivateMsgModel).getAreaCfgByAreaCode(i);
              e.onInit(a);
            });
          },
          onInit: function (e) {
            (e && (this._provinceCfg = e),
              this.initProvinceLabel(this._provinceCfg.sName),
              this.initProvinceGameTile(this._provinceCfg.PlayCfgs.CoinGame),
              this.initQuickstartBtn(),
              a.pushTempForceGametype(this.getCoinGameOne().iID),
              this.initDiyRoomBtns());
          },
          start: function () {
            (this._super(),
              this.playUIShowAnimation(!0),
              cc.winSize.width >= 1380 &&
                ((this.wgt_close.left = (cc.winSize.width - 1380) / 2),
                this.wgt_close.updateAlignment()));
          },
          getCoinGameOne: function () {
            if (this._provinceCfg) {
              var e = this._provinceCfg.PlayCfgs;
              if (e && e.CoinGame && e.CoinGame[0]) return e.CoinGame[0];
            }
            return null;
          },
          initQuickstartBtn: function () {
            var e = this.getCoinGameOne(),
              t = a.getRecommendSceneCfg();
            (e.iID && (t = a.getRecommendSceneCfg(e.iID)),
              (this.lab_QuickGameType.string = t.fullDesc));
          },
          initDiyRoomBtns: function () {},
          initProvinceLabel: function (e) {
            this.labProvince.string =
              (this.model.isSection() ? "\u6392\u4f4d." + e : e) + "\u9ebb\u5c06";
          },
          initProvinceGameTile: function (e) {
            var t = this;
            e.length < 8 && this.model.supplementGameTypes(e);
            for (var i = [], a = 0; a < e.length; a++) {
              var o = e[a];
              if (g_oData.get(g_tData.mod_gamecfg).isGameTypeExist(o.iID)) {
                var n = g_oPrefabLoader.instantiate(this.GameTypeItem);
                (n.getComponent("ProvinceGameTypeItem").init({
                  nGameType: o.iID,
                  sName: o.sName,
                  iTag: o.iTag,
                  index: a,
                  clickItemCb: function (e) {
                    t.sectionMatchNeedFunc(e);
                  },
                }),
                  i.push(n),
                  this.checkXlhzTile(o.iID, n));
              }
            }
            (i.forEach(function (e, i) {
              e.parent =
                i < 8
                  ? i < 4
                    ? t.containerLineOne
                    : t.containerLineTwo
                  : i % 2 == 0
                    ? t.containerLineOne
                    : t.containerLineTwo;
            }),
              (this._tileGTidTop2 = [e[0].iID, e[1].iID]),
              this.checkXlhzSavedTileNode());
          },
          playUIShowAnimation: function (e) {
            var t = this,
              i = cc.v2(this.rightNodePos.x + 1600, this.rightNodePos.y),
              a = this._ShowTime;
            if (e) {
              if (s) {
                ((this.ScreenMask.active = !0),
                  (s = !1),
                  this.playAniNode.setPosition(i),
                  this.playAniNode.setScale(0.8));
                var o = cc
                    .moveTo(a, cc.v2(this.rightNodePos.x - 25, this.rightNodePos.y))
                    .easing(cc.easeQuarticActionOut(0.15)),
                  n = cc
                    .moveTo(0.15, cc.v2(this.rightNodePos.x, this.rightNodePos.y))
                    .easing(cc.easeQuarticActionOut(0.15)),
                  r = cc.scaleTo(0.15, 1, 1),
                  c = cc.spawn(o, r),
                  l = cc.sequence(
                    c,
                    n,
                    cc.callFunc(function () {
                      ((t.ScreenMask.active = !1), (s = !0));
                    }),
                  );
                (this.playAniNode.runAction(l), this.setNodeAnimation());
              }
            } else {
              var g = cc.moveTo(0.1, i);
              this.playAniNode.runAction(g);
            }
          },
          onDisable: function () {
            s ||
              (this.playAniNode.stopAllActions(),
              this.FooterNode.stopAllActions(),
              this.TopNode.stopAllActions());
          },
          setNodeAnimation: function () {
            var e = this;
            if (1 != this._ShowAnimation) {
              ((this._ShowAnimation = !0), (this.ScreenMask.active = !0));
              var t = 0.5 * cc.view.getDesignResolutionSize().height,
                i = this._ShowTime,
                a = cc.v2(0, -t),
                o = this.FooterNode.width + t + 20;
              this.FooterNode.y = -o;
              var n = cc.v2(0, t),
                s = this.TopNode.height + t + 20;
              ((this.TopNode.y = s),
                this.setNodeShowAnimation(
                  this.FooterNode,
                  a,
                  function () {
                    ((e.ScreenMask.active = !1), (e._ShowAnimation = !1));
                  },
                  i,
                  0,
                  !1,
                ),
                this.setNodeShowAnimation(
                  this.TopNode,
                  n,
                  function () {
                    ((e.ScreenMask.active = !1), (e._ShowAnimation = !1));
                  },
                  i,
                  0,
                  !1,
                ));
            }
          },
          setNodeShowAnimation: function (e, t, i, a, o, n) {
            (void 0 === i && (i = null),
              void 0 === a && (a = 0.2),
              void 0 === o && (o = 0),
              void 0 === n && (n = !0),
              n && e.setScale(0.8));
            var s = cc.moveTo(a, t).easing(cc.easeQuarticActionOut(a)),
              r = cc.scaleTo(0.15, 1, 1),
              c = cc.spawn(s, r),
              l = cc.callFunc(
                function () {
                  i && i();
                }.bind(this),
              ),
              g = cc.sequence(c, l);
            o > 0
              ? this.scheduleOnce(function () {
                  e.runAction(g);
                }, o)
              : e.runAction(g);
          },
          onClickBack: function () {
            ((this._ShowAnimation = !1),
              g_oData.get(g_tData.HistoryMod).dismiss(g_tConst.HistoryRecordLayer.ProvinceSel),
              this.close(),
              n.getPopList().length > 0
                ? g_oEvent.dispatchEvent(g_tEvent.START_OTHER_LIST_ANIMATION)
                : g_oEvent.dispatchEvent(g_tEvent.START_MAIN_LIST_ANIMATION));
          },
          onClose: function () {
            (this._super(), a.popTempForceGametype());
          },
          onClickCreateRoom: function () {
            var e = function (e) {
              var t = o.coin2diy(e);
              isNull(t) || g_oData.get(g_tData.DiyRoomGameTypeMod).settop(t);
            };
            this._tileGTidTop2.length >= 2
              ? (e(this._tileGTidTop2[1]),
                e(this._tileGTidTop2[0]),
                g_oLayerManager.emitEvent2Dlg(
                  g_tConst.GameLayerCfg.Hall_DiyRoomCreate.id,
                  "ON_INIT",
                  { focusOnGametype: this._tileGTidTop2[0] },
                ))
              : Log.error("BIRD >>>", "hallTableSelView.js", "this._nGameType\u4e3a\u7a7a");
          },
          onClickJoinRoom: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_JoinRoom.id, "ON_INIT");
          },
          onClickQuick: function () {
            var e = this.getCoinGameOne();
            if (e.iID) {
              var t = e.iID;
              if (t) return void a.quickStart(!0, t);
            }
            a.quickStart(!0);
          },
          onClickProvince: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.ProvinceChoose.id, "ON_INIT", {
              FromName: "\u6e38\u620f\u5927\u5385",
              FromSceneId: 1,
            });
          },
          sectionMatchNeedFunc: function () {
            this._DataInfo && 2 == (this._DataInfo.FromSceneId || null) && this.onClickBack();
          },
          clearAllGameTile: function () {
            if (this.containerLineOne.children.length > 0)
              for (var e = this.containerLineOne.children.length - 1; e >= 0; --e) {
                var t = this.containerLineOne.children[e];
                (t.parent && (t.parent = null), t.destroy());
              }
            if (this.containerLineTwo.children.length > 0)
              for (var i = this.containerLineTwo.children.length - 1; i >= 0; --i) {
                var a = this.containerLineTwo.children[i];
                (a.parent && (a.parent = null), a.destroy());
              }
          },
          checkXlhzTile: function (e, t) {
            (e == g_tConst.GameTypeCfgs.XLHZMJ2.TYPEID && (this._xlhz866TileNode = t),
              e == g_tConst.GameTypeCfgs.XLHZMJ3.TYPEID && (this._xlhz868TileNode = t));
          },
          checkXlhzSavedTileNode: function () {
            this._xlhz866TileNode &&
              this._xlhz868TileNode &&
              ((this._xlhz866TileNode.active = !1),
              this.containerLineTwo.children[0] &&
                (this.containerLineTwo.children[0].parent = this.containerLineOne));
          },
        }),
          cc._RF.pop());
      },
      {
        CommonGT: "CommonGT",
        PopDlgBaseView: "PopDlgBaseView",
        PopDlgCtrl: "PopDlgCtrl",
        QuikStart: "QuikStart",
      },
    ],
