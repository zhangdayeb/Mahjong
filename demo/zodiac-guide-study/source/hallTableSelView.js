    hallTableSelView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "4fb01dzewdCbqHAjZA2PT0j", "hallTableSelView");
        var i = e("AlertDlgBaseView"),
          a = e("QuikStart"),
          o = e("CommonGT"),
          n = e("PopDlgCtrl"),
          s = e("CommonUtils");
        (cc.Class({
          extends: i,
          properties: {
            node_Root: { default: null, type: cc.Node, tooltip: "\u6839\u8282\u70b9" },
            GameTypeToggle: {
              default: null,
              type: cc.Node,
              tooltip: "\u591a\u9009\u62e9\u8282\u70b9",
            },
            TableSelItem: {
              default: null,
              type: cc.Prefab,
              displayName: "TableSelItem",
              tooltip: "\u573a\u6b21\u6309\u94ae\u9884\u5236",
            },
            nodeTableSelContainer: {
              default: null,
              type: cc.Node,
              tooltip: "\u573a\u6b21\u6309\u94ae\u5bb9\u5668",
            },
            playAniNode: {
              default: null,
              type: cc.Node,
              tooltip: "\u64ad\u653e\u52a8\u753b\u5bb9\u5668",
            },
            labGameType: { default: null, type: cc.Label },
            labSpellGT: { default: null, type: cc.Label },
            labSectionPoint: {
              default: null,
              type: cc.Label,
              tooltip: "\u6bb5\u4f4d\u8d5b\u5e95\u5206",
            },
            labEnterSceneDesc: {
              default: null,
              type: cc.Label,
              tooltip: "\u8fdb\u573a\u63cf\u8ff0",
            },
            btnRuleNode: { default: null, type: cc.Node, tooltip: "\u89c4\u5219\u6309\u94ae" },
            n_createRoom: {
              default: null,
              type: cc.Node,
              tooltip: "\u521b\u5efa\u623f\u95f4\u6309\u94ae",
            },
            n_joinRoom: {
              default: null,
              type: cc.Node,
              tooltip: "\u52a0\u5165\u623f\u95f4\u6309\u94ae",
            },
            btn_quickStart: {
              default: null,
              type: cc.Node,
              tooltip: "\u52a0\u5165\u623f\u95f4\u6309\u94ae",
            },
            ZCoinRoot: cc.Node,
            wgt_close: cc.Widget,
            TopNode: cc.Node,
            FooterNode: cc.Node,
            ScreenMask: cc.Node,
            btnFksjccbxpGuide: cc.Node,
            btnSESXGuide: cc.Node,
            btnSGMJGuide: cc.Node,
            btnFanGather: cc.Node,
            btnGameTeach: cc.Node,
            _ShowTime: 0.3,
            _IsHallCome: !1,
            _canShowFksjccGuideBtn: !1,
            btn_leftIcon: {
              default: null,
              type: cc.Node,
              tooltip: "\u5de6\u8fb9\u6309\u94ae\u5165\u53e3",
            },
          },
          update: function () {
            for (var e = 0, t = null, i = 0; i < this.btn_leftIcon.children.length; i++) {
              var a = this.btn_leftIcon.children[i];
              a.active &&
                (t &&
                  "FanXingResearchEntry" == t.name &&
                  "MJMasterPathRankEntry" == a.name &&
                  (e += 50),
                (t = a),
                (a.x = a.width / 2 + e),
                (e += a.width));
            }
          },
          Awake: function () {
            ((this.n_createRoom.active = this.n_joinRoom.active = !1),
              (this.ScreenMask.active = !1),
              (this._ShowAnimation = !1),
              (this._ShowTbAnimation = !1),
              (this._talbeSelItemArr = []),
              this.initBottomUI(),
              this.onMessageEvent(),
              this.onCustomEvent(),
              (this.rightNodePos = this.playAniNode.getPosition()));
          },
          initBottomUI: function () {
            this.initDiyRoomBtns();
          },
          onMessageEvent: function () {
            var e = this;
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.SCMJ_REQ_GAME_CONFIG_FINISH,
                this.initDiyRoomBtns,
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.HALL_TABLE_SEL_SHOW_AS_GAMETYPE,
                  this.showAsGameType,
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.SHOW_EXCHANGE_ZJB,
                  function () {
                    if (o.isZCoinGameType(e._nGameType)) {
                      var t = a.getRecommendSceneCfg(e._nGameType);
                      g_oData.get(g_tData.mod_ExchangeZjb).popExchangeZJBView(t.typeID);
                    } else
                      g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_Shop.id, "ON_INIT", {
                        showType: 5,
                      });
                  },
                  this,
                ),
              ));
          },
          onCustomEvent: function () {
            var e = this;
            e.node.on(
              "onInit",
              function (t) {
                (g_oData
                  .get(g_tData.HistoryMod)
                  .record(
                    g_tConst.HistoryRecordLayer.TabelSel,
                    g_tConst.GameLayerCfg.Hall_TabelSel.id,
                    "onInit",
                    t,
                  ),
                  (this._IsHallCome = t.isHallCome || !1),
                  (this._IsMost = t.isMost || !1),
                  1 == this._IsMost
                    ? ((this.btn_leftIcon.x = -300), e.checkMostShow(t))
                    : ((this.btn_leftIcon.x = -490), e.checkShow(t)));
              }.bind(e),
            );
          },
          onInit: function (e, t) {
            ((g_oData.get(g_tData.mod_DataCom).selectGame = e || -1),
              (this._nGameType = e),
              (this._sGameName = t),
              a.pushTempForceGametype(e),
              g_oData.get(g_tData.RoomMod).reqOnlinePlayerNumbers());
            var i = g_oData.get(g_tData.mod_gamecfg).getGameTypeSceneCfgs(e);
            this.addSceneCfg(i, e);
            var n = a.getRecommendSceneCfg(e);
            this._talbeSelItemArr.forEach(function (e) {
              e.active = !1;
            });
            var s = i,
              r = g_oData.get(g_tData.SwitchModel).getTableItemSelCfg();
            if (r)
              for (var c = 0; c < s.length; c++)
                r[s[c].typeID] &&
                  (s[c] = g_oData
                    .get(g_tData.mod_gamecfg)
                    .getSceneCfgBySceneID(Number(r[s[c].typeID])));
            console.log("max1472222 \u66f4\u65b0\u6392\u5e8f nArrSceneCfg = ", s);
            for (var l = 0, g = 0; g < s.length; g++) {
              if (isNull(this._talbeSelItemArr[l])) {
                var d = g_oPrefabLoader.instantiate(this.TableSelItem);
                ((d.parent = this.nodeTableSelContainer), (this._talbeSelItemArr[l] = d));
              }
              var h = this._talbeSelItemArr[l],
                u = h.getComponent("TableSelItem");
              (u.setHookGameType(e),
                u.setIndex(l, e),
                u.init(s[g]),
                u.setRecommendScene(s[g] === n),
                (h.active = !0),
                (l += 1));
            }
            (this._initGameTypeDesc(t),
              this._initSectionPoint(e),
              this.initQuickStartBtn(e),
              this._initRuleBtn(),
              this.playUIShowAnimation(),
              this.initFanGatherBtn(e),
              this.initFksjccGuideBtn(e),
              this.initSESXGuideBtn(e),
              this.initSGMJGuideBtn(e),
              this.initGameTeachBtn(e),
              o.isZCoinGameType(e)
                ? g_oEvent.dispatchEvent(g_tEvent.SET_NEW_WEEKLY_CARD_TOGGLE, "zCoin")
                : g_oEvent.dispatchEvent(g_tEvent.SET_NEW_WEEKLY_CARD_TOGGLE, "coin"),
              this.labSectionPoint.node.active
                ? g_oEvent.dispatchEvent(g_tEvent.SET_NEW_WEEKLY_CARD_SHOW, !1)
                : g_oEvent.dispatchEvent(g_tEvent.SET_NEW_WEEKLY_CARD_SHOW, !0));
          },
          setBtnPos: function () {
            cc.winSize.width >= 1380 &&
              ((this.wgt_close.left = (cc.winSize.width - 1380) / 2),
              this.wgt_close.updateAlignment());
          },
          initQuickStartBtn: function (e) {
            var t = a.getRecommendSceneCfg(e);
            this.labEnterSceneDesc.string = t.fullDesc;
          },
          initDiyRoomBtns: function () {},
          playUIShowAnimation: function () {
            var e = this;
            if (1 != this._ShowAnimation) {
              ((this._ShowAnimation = !0), (this.ScreenMask.active = !0));
              var t = cc.v2(this.rightNodePos.x + 1600, this.rightNodePos.y),
                i = this._ShowTime;
              (this.playAniNode.setPosition(t), this.playAniNode.setScale(0.8));
              var a = cc
                  .moveTo(i, cc.v2(this.rightNodePos.x - 20, this.rightNodePos.y))
                  .easing(cc.easeQuarticActionOut(0.15)),
                o = cc
                  .moveTo(0.15, cc.v2(this.rightNodePos.x, this.rightNodePos.y))
                  .easing(cc.easeQuarticActionOut(0.15)),
                n = cc.scaleTo(0.15, 1, 1),
                s = cc.spawn(a, n),
                r = cc.sequence(
                  s,
                  o,
                  cc.callFunc(function () {
                    ((e.ScreenMask.active = !1), (e._ShowAnimation = !1));
                  }),
                );
              (this.playAniNode.runAction(r), this.setNodeAnimation());
            }
          },
          setNodeAnimation: function () {
            var e = this;
            if (1 != this._ShowTbAnimation) {
              this._ShowTbAnimation = !0;
              var t = 0.5 * cc.view.getDesignResolutionSize().height,
                i = cc.v2(this.FooterNode.x, -t),
                a = this.FooterNode.width + t + 20;
              this.FooterNode.y = -a;
              var o = cc.v2(0, t),
                n = this.TopNode.height + t + 20;
              this.TopNode.y = n;
              var s = this._ShowTime;
              (this.setNodeShowAnimation(
                this.FooterNode,
                i,
                function () {
                  ((e.ScreenMask.active = !1), (e._ShowAnimation = !1));
                },
                s,
                0.01,
                !1,
              ),
                this.setNodeShowAnimation(
                  this.TopNode,
                  o,
                  function () {
                    ((e.ScreenMask.active = !1), (e._ShowAnimation = !1));
                  },
                  s,
                  0.01,
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
          onClickRule: function () {
            g_oLayerManager.emitEvent2Dlg(
              g_tConst.GameLayerCfg.GametypeRule.id,
              "INIT_RULE",
              this._nGameType,
            );
          },
          onClickBack: function () {
            (g_oData.get(g_tData.HistoryMod).dismiss(g_tConst.HistoryRecordLayer.TabelSel),
              this.close(),
              n.getPopList().length > 0
                ? g_oEvent.dispatchEvent(g_tEvent.START_OTHER_LIST_ANIMATION)
                : g_oEvent.dispatchEvent(g_tEvent.START_MAIN_LIST_ANIMATION));
          },
          close: function () {
            ((this._ShowAnimation = !1), (this._ShowTbAnimation = !1), this._super());
          },
          onClose: function () {
            (this._super(), a.popTempForceGametype());
          },
          onClickQuick: function () {
            a.quickStart(!0, this._nGameType);
          },
          onClickProvince: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.ProvinceChoose.id, "ON_INIT", {
              FromName: "\u6e38\u620f\u5927\u5385",
              FromSceneId: 1,
            });
          },
          onClickCreateRoom: function () {
            if (isNull(this._nGameType))
              Log.error("BIRD >>>", "hallTableSelView.js", "this._nGameType\u4e3a\u7a7a");
            else {
              var e = o.coin2diy(this._nGameType);
              isNull(e)
                ? (Log.error(
                    "BIRD >>>",
                    "hallTableSelView.js",
                    "gametype \u4e3a ",
                    this._nGameType,
                    "\u6ca1\u6709\u914d\u7f6e\u5bf9\u5e94\u7684\u81ea\u5efa\u623f\u73a9\u6cd5",
                  ),
                  g_oLayerManager.emitEvent2Dlg(
                    g_tConst.GameLayerCfg.Hall_DiyRoomCreate.id,
                    "ON_INIT",
                  ))
                : (g_oData.get(g_tData.DiyRoomGameTypeMod).settop(e),
                  g_oLayerManager.emitEvent2Dlg(
                    g_tConst.GameLayerCfg.Hall_DiyRoomCreate.id,
                    "ON_INIT",
                    { focusOnGametype: e },
                  ));
            }
          },
          onClickJoinRoom: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_JoinRoom.id, "ON_INIT");
          },
          _updateTopLayout: function () {
            var e = g_oData.get(g_tData.SectionMatchMod).isSectionMatchState,
              t = this.labGameType.string.length;
            e ||
              (this.labGameType.node.parent.getComponent(cc.Layout),
              t <= 6
                ? (this.labGameType.overflow = cc.Label.Overflow.NONE)
                : (this.labGameType.node.width -= this.labGameType.fontSize));
          },
          _initRuleBtn: function () {
            var e = g_oData.get(g_tData.SectionMatchMod).isSectionMatchState;
            this.btnRuleNode.active = !e;
          },
          _initGameTypeDesc: function (e) {
            var t = g_oData.get(g_tData.SectionMatchMod).isSectionMatchState ? "\u6392\u4f4d." : "";
            ((this.labGameType.string = t + e),
              (this.labSpellGT.string = s.getSpellName(this._nGameType)));
          },
          _initSectionPoint: function (e) {
            ((this.labSectionPoint.node.active = g_oData.get(
              g_tData.SectionMatchMod,
            ).isSectionMatchState),
              (this.labSectionPoint.string =
                "\u6bb5\u4f4d\u5e95\u5206" +
                  g_oData.get(g_tData.PrivateMsgModel).getSectionCfgByGameType(e).iPointBet || 0));
          },
          showStaticAd: function () {
            var e = {
              Scene: g_tConst.ShareConfig.ShareScene.hall,
              Module: g_tConst.ShareConfig.ShareModule.SeeVideo,
              SubModule: g_tConst.ShareConfig.ShareSubModule.SeeVideo,
              AdScene: g_tConst.InterstitialStaticPID.TabelSel,
              cbSuc: function () {
                g_oData
                  .get(g_tData.mod_Share)
                  .getShareCntByLinkID(g_tConst.ShareConfig.ShareLinkId.TableSelStaticAd) > 0 &&
                  g_oData
                    .get(g_tData.mod_Share)
                    .reqGPShareSuc(
                      g_tConst.ShareConfig.ShareLinkId.TableSelStaticAd,
                      void 0,
                      void 0,
                      e.type,
                    );
              },
            };
            g_oAdManager.doSeeAd(g_tConst.eADType.InterstitialStaticAd, e.AdScene, e);
          },
          getGameTypeCfg: function (e, t) {
            for (var i in g_tConst.GameTypeCfgs)
              if (g_tConst.GameTypeCfgs.hasOwnProperty(i)) {
                var a = g_tConst.GameTypeCfgs[i];
                if (a.TYPEID === e) return void (t && t(a));
              }
          },
          checkMostShow: function (e) {
            var t = e.mostArr || [],
              i = e.tagArr.split("|") || [],
              o = a.getRecommendSceneCfg();
            console.log(" mostArr RecommendSceneCfg = ", t, o);
            var n = null,
              s = null,
              r = !1;
            if (!isNull(o) && o.gameType > 0) {
              var c = o.gameType;
              (t.includes(String(c)) &&
                ((n = o.fullDesc.split(".")[0]), (s = parseInt(c)), (r = !0)),
                console.log(
                  " \u5feb\u901f\u5f00\u59cb gameName gameType RecommendSceneCfg = ",
                  n,
                  s,
                  o,
                ));
            }
            if (!r) {
              var l = t[0];
              s = parseInt(l);
              var g = null;
              (this.getGameTypeCfg(s, function (e) {
                g = e;
              }),
                console.log(" gameTypeCfg = ", g),
                (n =
                  g_tConst.GameTypeCfgs.SGMJ2.TYPEID == s
                    ? g.Name
                    : g.Name.replace("\u9ebb\u5c06", "")));
            }
            var d = 650,
              h = cc.view.getVisibleSize(),
              u = 0.5 * h.width,
              _ = 250;
            cc.winSize.width > 1380 && (_ += cc.winSize.width - 1380);
            var m = -u + _;
            ((this.rightNodePos.x = m + 0.5 * this.playAniNode.width),
              (this.rightNodePos.x -= (u - 640) / 4),
              h.height > d + 85 && (d -= 85),
              g_oPrefabLoader.loadRes(
                g_tAsset.GameTypeTogglePrefab,
                this.GameTypeToggle,
                function (e) {
                  ((e.y -= 40),
                    (e.x = m),
                    (e.height = d),
                    e.emit("onInit", { selectGameType: s, listData: t, tagData: i }));
                },
                g_oEnvMgr.Env,
              ),
              this.showAsGameType({ gameType: s, gameName: n }),
              (this.TopNode.zIndex = 11),
              (this.GameTypeToggle.zIndex = 10),
              this.setBtnPos(),
              (this.nodeTableSelContainer.scale = 1),
              (this.btn_quickStart.x -= 50));
          },
          checkShow: function (e) {
            var t = this,
              i = e.nGameType,
              a = e.sGameName;
            if (i == g_tConst.GameTypeCfgs.XLHZMJ3.TYPEID) {
              var o = g_oData.get(g_tData.SwitchModel).getXl6hzCfg(),
                n = g_oData.get(g_tData.UserLocalModel).getData("QuickStartGameType", null);
              (void 0 !== e.forceShowGameType && (n = e.forceShowGameType),
                n == g_tConst.GameTypeCfgs.XLHZMJ2.TYPEID && (o.showToggleFirst = 1),
                n == g_tConst.GameTypeCfgs.XLHZMJ3.TYPEID && (o.showToggleFirst = 2));
              var s = o.showToggleFirst;
              ((t.rightNodePos.x += 53.5),
                (o.gameTypes = [g_tConst.GameTypeCfgs.XLHZMJ2.TYPEID, e.nGameType]),
                g_oPrefabLoader.loadRes(
                  g_tAsset.SixHzTogglePrefab,
                  this.node_Root,
                  function (e) {
                    ((e.x = -t.playAniNode.width / 2), (e.y -= 25), e.emit("onInit", o));
                  },
                  g_oEnvMgr.Env,
                ),
                (s < 0 || 2 != s) &&
                  ((i = g_tConst.GameTypeCfgs.XLHZMJ2.TYPEID),
                  (a = g_tConst.GameTypeCfgs.XLHZMJ2.Name.replace("\u9ebb\u5c06", ""))));
            }
            (this.onInit(i, a), this.setBtnPos());
          },
          showAsGameType: function (e) {
            a.popTempForceGametype();
            var t = e.gameType,
              i = e.gameName;
            this.onInit(t, i);
          },
          initZCoinRoot: function (e) {
            var t = o.isZCoinGameType(e);
            g_oPrefabLoader.loadRes(g_tAsset.ZCoinNumPrefab, this.ZCoinRoot, function (e) {
              e.emit("SHOW_ZCOIN_SHOP", t);
            });
          },
          onDestroy: function () {
            (this._super(), (g_oData.get(g_tData.mod_DataCom).selectGame = -1));
          },
          onClickFksjccbxpGuide: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.FksjccbxpGuide.id, "ON_INIT", {
              btnEntry: this.btnFksjccbxpGuide,
            });
          },
          addSceneCfg: function (e, t) {
            if (((this._canShowFksjccGuideBtn = !1), t == g_tConst.GameTypeCfgs.SJCCBXP.TYPEID)) {
              var i = g_oData.get(g_tData.SwitchModel).getCrazySjccbxpCfg().showScene;
              if (i > 0) {
                var a = g_oData.get(g_tData.mod_gamecfg).getSceneCfgBySceneID(i);
                if (a) {
                  var o = a.extra.match(/sceneIndex:([+-]?\d+)/);
                  (o && (a.sceneIndex = parseInt(o[1])),
                    e.push(a),
                    (this._canShowFksjccGuideBtn = !0));
                }
              }
            }
          },
          initFanGatherBtn: function (e) {
            if (this.btnFanGather.children.length <= 0)
              this.btnFanGather.on(
                cc.Node.EventType.CHILD_ADDED,
                function () {
                  this.initFanGatherBtn(e);
                }.bind(this),
                this,
              );
            else if (
              e == g_tConst.GameTypeCfgs.SJCCBXP.TYPEID ||
              e == g_tConst.GameTypeCfgs.SESXMJ.TYPEID ||
              e == g_tConst.GameTypeCfgs.FKSJCCBXP.TYPEID ||
              e == g_tConst.GameTypeCfgs.XLHZMJ2.TYPEID ||
              e == g_tConst.GameTypeCfgs.SGMJ2.TYPEID
            ) {
              e == g_tConst.GameTypeCfgs.FKSJCCBXP.TYPEID &&
                (e = g_tConst.GameTypeCfgs.SJCCBXP.TYPEID);
              var t = g_tConst.FanGatherGameTypeMap[e],
                i = g_oData.get(g_tData.mod_gamecfg).getPlatCfgByName("fanGatherCfg");
              i &&
              i.playFanGatherCfg &&
              i.playFanGatherCfg.find(function (e) {
                return e.playType === t;
              })
                ? this.btnFanGather.children[0].emit("refreshShow", { show: !0, nGameType: e })
                : this.btnFanGather.children[0].emit("refreshShow", { show: !1, nGameType: e });
            } else this.btnFanGather.children[0].emit("refreshShow", { show: !1, nGameType: e });
          },
          initFksjccGuideBtn: function (e) {
            if (e == g_tConst.GameTypeCfgs.FKSJCCBXP.TYPEID || this._canShowFksjccGuideBtn) {
              this.btnFksjccbxpGuide.active = !0;
              var t = g_oData.get(g_tData.SwitchModel).getCrazySjccbxpCfg(),
                i = g_oCommonUtils.isLogin2Hall(),
                a = g_oCommonUtils.isTodayFirstLogin(),
                o = g_oData.get(g_tData.UserLocalModel).getData("FKSJCC_GUIDE_POPED", !1),
                n = g_oPlatform.isNewUser();
              ((t.showGuide && i && a && !g_tConst.FksjccbxpGuideCfg.isPoped) || (n && !o)) &&
                (g_oData.get(g_tData.UserLocalModel).setData("FKSJCC_GUIDE_POPED", !0),
                (g_tConst.FksjccbxpGuideCfg.isPoped = !0),
                g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.FksjccbxpGuide.id, "ON_INIT", {
                  btnEntry: this.btnFksjccbxpGuide,
                }));
            } else this.btnFksjccbxpGuide.active = !1;
          },
          initSESXGuideBtn: function (e) {
            if (e == g_tConst.GameTypeCfgs.SESXMJ.TYPEID) {
              this.btnSESXGuide.active = !0;
              var t = g_oData.get(g_tData.SwitchModel).getSESXCfg(),
                i = g_oCommonUtils.isLogin2Hall(),
                a =
                  g_oCommonUtils.getTodayStr() !==
                  g_oData.get(g_tData.UserLocalModel).getData("SESXGuide", "000"),
                o = g_oData.get(g_tData.UserLocalModel).getData("SESX_GUIDE_POPED", !1),
                n = g_oPlatform.isNewUser();
              ((t.showGuide && i && a) || (n && !o)) &&
                (g_oData
                  .get(g_tData.UserLocalModel)
                  .setData("SESXGuide", g_oCommonUtils.getTodayStr()),
                g_oData.get(g_tData.UserLocalModel).setData("SESX_GUIDE_POPED", !0),
                g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.SESXGuide.id, "ON_INIT", {
                  btnEntryWorldPos: this.btnSESXGuide.worldPosition,
                }));
            } else this.btnSESXGuide.active = !1;
          },
          initSGMJGuideBtn: function (e) {
            if (e == g_tConst.GameTypeCfgs.SGMJ2.TYPEID) {
              this.btnSGMJGuide.active = !0;
              var t = g_oCommonUtils.isLogin2Hall(),
                i =
                  g_oCommonUtils.getTodayStr() !==
                  g_oData.get(g_tData.UserLocalModel).getData("SGMJGuide", "000"),
                a = g_oData.get(g_tData.UserLocalModel).getData("SGMJ_GUIDE_POPED", !1),
                o = g_oPlatform.isNewUser();
              ((t && i) || (o && !a)) &&
                (g_oData
                  .get(g_tData.UserLocalModel)
                  .setData("SGMJGuide", g_oCommonUtils.getTodayStr()),
                g_oData.get(g_tData.UserLocalModel).setData("SGMJ_GUIDE_POPED", !0),
                g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.SGMJGuide.id, "ON_INIT", {
                  btnEntryWorldPos: this.btnSGMJGuide.worldPosition,
                }));
            } else this.btnSGMJGuide.active = !1;
          },
          initGameTeachBtn: function (e) {
            var t = g_oData.get(g_tData.SwitchModel).getNewPlayerShow();
            this.btnGameTeach.active = t && t.GameType && -1 != t.GameType.indexOf(e);
          },
          onClickSESXGuide: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.SESXGuide.id, "ON_INIT", {
              btnEntryWorldPos: this.btnSESXGuide.worldPosition,
            });
          },
          onClickSGMJGuide: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.SGMJGuide.id, "ON_INIT", {
              btnEntryWorldPos: this.btnSGMJGuide.worldPosition,
            });
          },
        }),
          cc._RF.pop());
      },
      {
        AlertDlgBaseView: "AlertDlgBaseView",
        CommonGT: "CommonGT",
        CommonUtils: "CommonUtils",
        PopDlgCtrl: "PopDlgCtrl",
        QuikStart: "QuikStart",
      },
    ],
