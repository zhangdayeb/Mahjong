    GameTeachView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "b6c35RYvXxOe6ndYktOFOSL", "GameTeachView");
        var i = e("CommonSDK"),
          a = e("tileLogicHelper"),
          o = e("AlertDlgBaseView"),
          n = e("ui_DiyMask"),
          s = e("QuikStart");
        (cc.Class({
          extends: o,
          properties: {
            root: { default: null, type: cc.Node, tooltip: "\u6240\u6709\u754c\u9762" },
            mask: { default: null, type: cc.Node, tooltip: "\u906e\u7f69" },
            huTiP: { default: null, type: cc.Node, tooltip: "\u80e1\u724c\u63d0\u793a" },
            huTiP2: { default: null, type: cc.Node, tooltip: "\u80e1\u724c\u63d0\u793a" },
            GameTeachUsePai: {
              default: null,
              type: cc.Prefab,
              tooltip: "\u7528\u724c\u8bf4\u660e\u9884\u5236\u4f53",
            },
            showPai: {
              default: null,
              type: cc.Node,
              tooltip: "\u7528\u724c\u8bf4\u660e\u9884\u5236\u4f53\u5bb9\u5668",
            },
            btn_ting: { default: null, type: cc.Node, tooltip: "\u542c\u724c\u63d0\u793a" },
            lab_explainTime: {
              default: null,
              type: cc.Label,
              tooltip: "\u7528\u724c\u754c\u9762\u7684\u8bfb\u79d2",
            },
            lab_endNum0: cc.Label,
            lab_endNum1: cc.Label,
            lab_endNum2: cc.Label,
            lab_endNum3: cc.Label,
            head_node: cc.Node,
            wgt_close: cc.Widget,
            myName: cc.Label,
            allMask: cc.Node,
            icon_grade: cc.Sprite,
            endGetBtn: cc.Node,
            endNextBtn: cc.Node,
            _playerInfos: null,
            _isClick: !1,
            _waitTimes: 5,
            _index: 0,
            _viewName: null,
            _clickTimes: null,
            _HandTileValues: null,
          },
          Awake: function () {
            ((this._clickedClose = !1), this.startGuide());
          },
          startGuide: function () {
            (g_oData.get(g_tData.UserLocalModel).setData("IS_GAME_TEACH", !0),
              g_oData.get(g_tData.UserLocalModel).setData("HAVE_ENTER_TEACH", !0),
              (this._clickTimes = {}),
              (this._playerInfos = new Map()),
              (this._HandTileValues = JSON.parse(JSON.stringify(g_tConst.teach_mHandTileValues))),
              this.onCustomEvent(),
              this.onMessageEvent(),
              this.setTableInfo(),
              this.initRule(),
              g_oEvent.dispatchEvent(g_tEvent.REMOVE_TEAMMATE_TILES),
              (this.mask.active = !0),
              this.closeMask(),
              this.setMaskInfo(),
              (this.userId = g_oData.get(g_tData.sdkUser).userId),
              (this.step = [
                "welcome",
                "explainPai",
                "HSZ",
                "dingQue",
                "doPai",
                "chuPai",
                "peng",
                "peng_out",
                "tingTip",
                "gang",
                "hu",
                "huOther",
                "end",
              ]),
              this.setStepInfo());
          },
          reStartGuide: function () {
            (g_oData.get(g_tData.UserLocalModel).setData("IS_GAME_TEACH", !0),
              (this._isZiMo = !1),
              (this._isClick = !1),
              (this._HandTileValues = g_tConst.teach_mHandTileValues),
              (this._waitTimes = 5),
              (this._index = 0),
              (this._clickTimes = {}),
              (this._viewName = null),
              (this._playerInfos = new Map()),
              this.initRule(),
              g_oEvent.dispatchEvent(g_tEvent.REMOVE_TEAMMATE_TILES),
              (this.mask.active = !0),
              this.closeMask(),
              g_oData.get(g_tData.UserLocalModel).setData("gameTeachStep", 0),
              this.setStepInfo());
          },
          onMessageEvent: function () {
            var e = this;
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.NO_TABLE_TOOWN_CHAT,
                function (e) {
                  g_oData
                    .get(g_tData.mod_ChatMsg)
                    ._showMsg({
                      sMsgStr: e.msgStr,
                      nType: e.type,
                      nUserID: g_oData.get(g_tData.sdkUser).userId,
                      nViewSeatId: 0,
                      sName: g_oPlatform.getNickName(),
                      bIsMan: 1 === parseInt(i.getGender()),
                    });
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.NO_TABLE_TOOWN_FACE,
                  function (e) {
                    g_oExLayerManager.emitEvent2GameLayer(
                      g_tConst.GameExLayerCfg.UserInfoLayer.id,
                      "INTERACTIVE_ANIM_SHOW",
                      {
                        nFromUserId: g_oData.get(g_tData.sdkUser).userId,
                        nInteractiveAnimId: e.detail.nFaceId,
                        sFromNickName: g_oPlatform.getNickName(),
                        nPubToUserID: e.detail.nUserId,
                        nFromViewSeatId: 0,
                        nPubViewSeatId: e.detail.nUserId,
                      },
                    );
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.TEACH_CLICK,
                  function () {
                    "HSZ" == e._viewName && e.onClick();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.TEACH_REQ_OUT,
                  function () {
                    ("peng_out" != e._viewName &&
                      "chuPai" != e._viewName &&
                      "gang" != e._viewName) ||
                      e.onClick();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.TEACH_CHAGE_MASK,
                  function (t) {
                    if ("HSZ" != e._viewName || e._isClick) {
                      if (
                        ("peng_out" == e._viewName ||
                          "chuPai" == e._viewName ||
                          "gang" == e._viewName) &&
                        (e._clickTimes[e._viewName] || (e._clickTimes[e._viewName] = 0),
                        e._clickTimes[e._viewName]++,
                        e._clickTimes[e._viewName] > 1)
                      )
                        e.onClick();
                      else if (
                        e.root &&
                        e.root.getChildByName(e._viewName) &&
                        e.root.getChildByName(e._viewName).getChildByName("mask")
                      ) {
                        var i = e.root
                          .getChildByName(e._viewName)
                          .getChildByName("mask")
                          .getComponent("ui_DiyMask");
                        if (i) {
                          for (var a = i.MaskDataList, o = n.Direction, s = 0; s < a.length; s++) {
                            var r = a[s];
                            if (r.type == o.Fect && r.canMove)
                              for (var c = r.points, l = 0; l < c.length; ++l) {
                                var g = c[l];
                                ((g.x += t.pos[0]), (g.y += t.pos[1]));
                              }
                          }
                          i.doRefresh = !0;
                        }
                      }
                    } else {
                      for (
                        var d = e.root
                            .getChildByName(e._viewName)
                            .getChildByName("mask")
                            .getComponent("ui_DiyMask"),
                          h = d.MaskDataList,
                          u = n.Direction,
                          _ = 0;
                        _ < h.length;
                        _++
                      ) {
                        var m = h[_];
                        if (m.type == u.Fect && t.nTileIndex - 11 == _)
                          for (var f = m.points, p = 0; p < f.length; ++p) {
                            var C = f[p];
                            ((C.x += t.pos[0]), (C.y += t.pos[1]));
                          }
                      }
                      d.doRefresh = !0;
                    }
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.TEACH_CHAGE_BACK_MASK,
                  function () {
                    if (
                      !(e._index < 5) &&
                      e.root.getChildByName(e._viewName).getChildByName("mask")
                    ) {
                      var t = e.root
                        .getChildByName(e._viewName)
                        .getChildByName("mask")
                        .getComponent("ui_DiyMask");
                      t &&
                        e._resetPos &&
                        e._resetPos[e._viewName] &&
                        ((t.MaskDataList = JSON.parse(JSON.stringify(e._resetPos[e._viewName]))),
                        (t.doRefresh = !0));
                    }
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.TEACH_CHAGE_MASK_HSZ,
                  function (t) {
                    if ("HSZ" === e._viewName && !e._isClick) {
                      for (
                        var i = e.root
                            .getChildByName(e._viewName)
                            .getChildByName("mask")
                            .getComponent("ui_DiyMask"),
                          a = i.MaskDataList,
                          o = n.Direction,
                          s = 0;
                        s < a.length;
                        s++
                      ) {
                        var r = a[s];
                        if (r.type == o.Fect && t.nTileIndex - 11 == s)
                          for (var c = r.points, l = 0; l < c.length; ++l) {
                            var g = c[l];
                            ((g.x += t.pos[0]), (g.y += t.pos[1]));
                          }
                      }
                      i.doRefresh = !0;
                    }
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.RECEIVE_AWARD_SUC,
                  function (t) {
                    t.type == g_tConst.ReceiveAwardType.PLAY_GUIDE && e._viewName;
                  },
                  this,
                ),
              ),
              cc.game.on(
                cc.game.EVENT_SHOW,
                function () {
                  setTimeout(function () {}, 0);
                },
                this,
              ),
              cc.game.on(
                cc.game.EVENT_HIDE,
                function () {
                  setTimeout(function () {}, 0);
                },
                this,
              ));
          },
          onCustomEvent: function () {
            this.node.on("ON_INIT", this.onInit, this);
          },
          start: function () {},
          setMaskInfo: function () {
            this._resetPos = {};
            for (var e = 0; e < this.root.children.length; e++) {
              var t = this.root.children[e];
              if (t.getChildByName("mask")) {
                var i = t.getChildByName("mask").getComponent("ui_DiyMask");
                i && (this._resetPos[t.name] = JSON.parse(JSON.stringify(i.MaskDataList)));
              }
            }
          },
          onInit: function () {},
          waiting: function (e) {
            g_oEvent.dispatchEvent(g_tEvent.USER_CARD_WAITING, e);
          },
          waitingEnd: function (e) {
            g_oEvent.dispatchEvent(g_tEvent.USER_CARD_RESULT, e);
          },
          closeAllTip: function () {
            (g_oExLayerManager.emitEvent2GameLayer(
              g_tConst.GameExLayerCfg.TingTip.id,
              "HIDE_TING_TIP",
            ),
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.chatChoose.id, "CLOSE_SHOW"),
              g_oEvent.dispatchEvent(g_tEvent.TEACH_CLICK_MASK));
          },
          showStep: function () {
            this.step[this._index]
              ? (this[this.step[this._index]](),
                console.log("roy teach click", this.step[this._index]))
              : this.end();
          },
          onClick: function () {
            this._isClick || (this.showStep(), this.closeAllTip());
          },
          setTableInfo: function () {
            (MJ.GameLogic.TableModel.setTableInfo({ gameType: 866 }),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.BaseInfo.id,
                "UPDATE_REMAIN_TILE",
                { nRemainTileCount: 52 },
              ),
              (MJ.GameLogic.TileModel.nRemainTileCount = 52));
          },
          initRule: function () {
            for (
              var e = {
                  iFanxingGroup: 54,
                  iPlayRuleID: [
                    10203, 20102, 30401, 30402, 30502, 40101, 50101, 80101, 80102, 80120, 50343,
                    40201, 40212, 40213,
                  ],
                  iCardLibrary: [],
                  stWinParam: { eWinGood: 1, eWinUnit: 2 },
                  ePlayMode: 2,
                  stTimeParam: {},
                },
                t = [
                  17, 18, 19, 20, 21, 22, 23, 24, 25, 33, 34, 35, 36, 37, 38, 39, 40, 41, 49, 50,
                  51, 52, 53, 54, 55, 56, 57, 81,
                ],
                i = 0;
              i < t.length;
              i++
            )
              for (var a = t[i], o = 0; o < 4; o++) e.iCardLibrary.push(a);
            (MJ.GameLogic._initRule(e), MJ.GameLogic._initParams(e));
          },
          changeView: function (e) {
            var t = this;
            this.scheduleOnce(function () {
              for (var i = 0; i < t.root.children.length; i++) {
                var a = t.root.children[i];
                if (a.name == e) {
                  ((a.active = !0),
                    (t._index = i),
                    g_oData.get(g_tData.UserLocalModel).setData("gameTeachStep", i));
                  for (var o = 0; o < a.children.length; o++) a.children[o].active = !0;
                } else a.active && (a.active = !1);
              }
              if (
                (t.closeAllTip(),
                t._viewName && g_oData.get(g_tData.GameTeachMod).reportFinshStep(t._viewName),
                (t._viewName = e),
                "end" == t._viewName
                  ? (g_oData.get(g_tData.GameTeachMod).reportFinshStep(t._viewName),
                    g_oData.get(g_tData.UserLocalModel).setData("IS_GAME_TEACH", !1),
                    g_oData.get(g_tData.UserLocalModel).setData("gameTeachStep", 0),
                    t.restGameInfo(),
                    (t.node.getChildByName("exit").active = !1),
                    g_oData.get(g_tData.GameTeachMod).isFinshGuide()
                      ? ((t.endNextBtn.active = !0), (t.endGetBtn.active = !1))
                      : (g_oData.get(g_tData.GameTeachMod).getGoodsInfo()
                          ? ((t.endNextBtn.active = !1), (t.endGetBtn.active = !0))
                          : ((t.endNextBtn.active = !0), (t.endGetBtn.active = !1)),
                        g_oData.get(g_tData.GameTeachMod).reqCompletePlayGuide()))
                  : (t.node.getChildByName("exit").active = !0),
                t.root.getChildByName(t._viewName).getChildByName("mask"))
              ) {
                var n = t.root
                  .getChildByName(t._viewName)
                  .getChildByName("mask")
                  .getComponent("ui_DiyMask");
                n &&
                  t._resetPos &&
                  t._resetPos[t._viewName] &&
                  ((n.MaskDataList = JSON.parse(JSON.stringify(t._resetPos[t._viewName]))),
                  (n.doRefresh = !0));
              }
              (t.openTouch(), (t.allMask.active = !1));
            }, 0);
          },
          toStatTeach: function () {
            var e = this;
            (g_oData.get(g_tData.GameTeachMod).reportNewOrOld(0),
              (this.allMask.active = !0),
              this.changeView("welcome"),
              (this._isClick = !0),
              this.scheduleOnce(function () {
                e._isClick = !1;
              }, 0.5));
          },
          setExplainTime: function () {
            var e = this._waitTimes;
            this.schedule(
              function t() {
                this.root.getChildByName("doPai").active
                  ? (e <= 0 && this.unschedule(t), e--)
                  : this.unschedule(t);
              },
              1,
              this._waitTimes,
              0,
            );
          },
          exit: function () {
            var e = this,
              t = "\u786e\u5b9a\u8df3\u8fc7\u5f15\u5bfc\u5417\uff1f";
            (g_oData.get(g_tData.GameTeachMod).isFinshGuide() ||
              (t =
                "\u672a\u5b8c\u6574\u5b66\u4e60\u5c06\u65e0\u6cd5\u9886\u53d6\u5956\u52b1\uff0c\u786e\u5b9a\u8df3\u8fc7\u5f15\u5bfc\u5417\uff1f"),
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Alert.id, "ON_INIT", {
                data: {
                  title: "\u63d0  \u793a",
                  value: t,
                  littleValue:
                    "\u518d\u6b21\u5b66\u4e60\u53ef\u5230\u573a\u6b21\u9009\u62e9\u9875\u8fdb\u5165  \u201c\u73a9\u6cd5\u6307\u5f15\u201d",
                  type: 0,
                  ok: function () {
                    (g_oData.get(g_tData.UserLocalModel).setData("IS_GAME_TEACH", !1),
                      g_oData.get(g_tData.UserLocalModel).setData("gameTeachStep", 0),
                      g_oData.get(g_tData.GameTeachMod).reportExitTeach(e._viewName),
                      g_oSceneLoader.gotoScene(g_tConst.SceneCfgs.lobby, null, function (e) {
                        e && e();
                      }));
                  },
                },
              }));
          },
          toStartGame: function () {
            ((this.allMask.active = !0),
              g_oData.get(g_tData.GameTeachMod).reportNewOrOld(1),
              g_oSceneLoader.gotoScene(g_tConst.SceneCfgs.lobby, null, function (e) {
                e && e();
              }));
          },
          closeMask: function () {
            for (var e = 0; e < this.root.children.length; e++) {
              var t = this.root.children[e];
              t.getChildByName("mask") &&
                t.getChildByName("mask").active &&
                (t.getChildByName("mask").active = !1);
            }
          },
          closeTouch: function () {
            for (var e = 0; e < this.root.children.length; e++) {
              var t = this.root.children[e];
              t.getChildByName("touch") &&
                t.getChildByName("touch").active &&
                (t.getChildByName("touch").active = !1);
            }
          },
          openMask: function (e) {
            (this.closeAllTip(),
              this.root.getChildByName(e).getChildByName("mask") &&
                (this.root.getChildByName(e).getChildByName("mask").active = !0));
          },
          openTouch: function () {
            this.root.getChildByName(this._viewName).getChildByName("touch") &&
              (this.root.getChildByName(this._viewName).getChildByName("touch").active = !0);
          },
          setLaizi: function () {
            var e = {
              nTagType: g_tConst.eTileTag.LaiZi,
              nViewSeatId: 0,
              enbleTileTag: function (e) {
                return 81 == e;
              },
            };
            MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_TAG", e);
          },
          playerEntry: function () {
            this.mask.active = !1;
            var e = {
              picUrl2: g_oPlatform.getHeadUrl(),
              userID: g_oData.get(g_tData.sdkUser).userId,
              nickName: g_oPlatform.getNickName(),
              viewSeatID: 0,
              headUrl: "6",
              isMingPai: !1,
              isReady: !0,
            };
            this._playerInfos[e.userID] = e;
            for (var t = 0; t < g_tConst.teach_Players.length; t++) {
              var i = g_tConst.teach_Players[t];
              this._playerInfos[i.userID] = i;
            }
            for (var a in this._playerInfos)
              if (this._playerInfos.hasOwnProperty(a)) {
                var o = this._playerInfos[a];
                MJ.GameLogic.PlayerModel.addPlayer(o, o.viewSeatID);
              }
            (g_oExLayerManager.emitEvent2GameLayer(
              g_tConst.GameExLayerCfg.UserInfoLayer.id,
              "UPDATE_PLAYER_INFO",
              { data: this._playerInfos },
            ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserInfoLayer.id,
                "SET_PLAYER_SCORE_TEACH",
                { SeatMine: 1e3, SeatLeft: 4e3, SeatFront: 5e3, SeatRight: 4e3 },
              ),
              g_oData.get(g_tData.GameTeachMod).setCoinNum({ 0: 1e3, 1: 4e3, 2: 5e3, 3: 4e3 }));
            var n = 1;
            (g_oData.get(g_tData.MJMasterPathMod).MJMasterPathData &&
              g_oData.get(g_tData.MJMasterPathMod).MJMasterPathData.lv &&
              (n = g_oData.get(g_tData.MJMasterPathMod).MJMasterPathData.lv),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserInfoLayer.id,
                "SET_PLAYER_FAKE_MJPATH_LV",
                {
                  SeatMine: n,
                  SeatLeft: g_tConst.teach_MjPathLv[g_tConst.GameConfig.ViewSeat.SeatLeft],
                  SeatFront: g_tConst.teach_MjPathLv[g_tConst.GameConfig.ViewSeat.SeatFront],
                  SeatRight: g_tConst.teach_MjPathLv[g_tConst.GameConfig.ViewSeat.SeatRight],
                },
              ));
          },
          statGame: function () {
            this.recursiveLoop(this._playerInfos, this.zhunbei);
            var e = function () {};
            (this.scheduleOnce(function () {
              (g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserState.id,
                "HIDE_ALL",
              ),
                g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.GameAnim.id,
                  "ANIM_GAME_START",
                  { cb_gameStarAnimEnd: e },
                ));
            }, 1),
              this.scheduleOnce(function () {
                g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.GameAnim.id,
                  "ANIM_DEAL_TILES",
                );
              }, 2),
              this.scheduleOnce(function () {
                g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.UserInfoLayer.id,
                  "UPDATE_BANKER",
                  { data: 0 },
                );
              }, 3));
          },
          recursiveLoop: function (e, t) {
            var i = Object.keys(e);
            (function a(o) {
              if (o !== i.length) {
                var n = i[o];
                (t(e[n]), a(o + 1));
              }
            })(0);
          },
          zhunbei: function (e) {
            ((e.isReady = !0),
              (e.nViewSeatId = e.viewSeatID),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserState.id,
                "SHOW_READY_STATE",
                e,
              ));
          },
          InitHandCards: function () {
            (MJ.GameViewHandler.tileModule.emit("SET_HAND_TILES", { data: this._HandTileValues }),
              this.scheduleOnce(function () {
                (this.setLaizi(), this.setTile());
              }, 4),
              this.scheduleOnce(function () {
                this.launchChangeCard();
              }, 5));
          },
          launchChangeCard: function () {
            var e = [51, 53, 56],
              t = { ActTime: 20, bAllColor: !0, eChangeMode: 2, isTeam: !1 };
            (g_oExLayerManager.emitEvent2GameLayer(
              g_tConst.GameExLayerCfg.GDHSZ.id,
              "ON_START_PLAYER_HSZ",
              t,
            ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.GDHSZ.id,
                "ON_START_PLAYER_HSZ",
                t,
              ),
              this.openMask("HSZ"));
            var i = this.root
              .getChildByName("HSZ")
              .getChildByName("mask")
              .getComponent("ui_DiyMask");
            (i &&
              this._resetPos &&
              this._resetPos.HSZ &&
              ((i.MaskDataList = JSON.parse(JSON.stringify(this._resetPos.HSZ))),
              (i.doRefresh = !0)),
              MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_ENBLE_MUL_SELECT", {
                enbleMulSelect: !0,
                MeUnSelectInfo: t.MeUnSelectInfo,
              }),
              MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_SELECT", {
                nViewSeatId: g_tConst.GameConfig.ViewSeat.SeatMine,
                isSelectTile: function (t) {
                  if (e.includes(t)) {
                    var i = e.indexOf(t);
                    return ((e[i] = -1), !0);
                  }
                  return !1;
                },
              }),
              (this._isClick = !1));
          },
          launchChangeCardRst: function () {
            this.closeMask();
            var e = {
              iAfterChangeCard: [49, 35, 41],
              iChangeCard: [51, 53, 56],
              iPlayerCard: [81, 81, 17, 17, 17, 18, 18, 18, 19, 19, 49, 49, 35, 41],
              playerInfos: this._playerInfos,
            };
            (MJ.GameViewHandler.tileModule.emit("ON_NOTIFY_HSZ_RESULT_TEACH", e),
              MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_ENBLE_MUL_SELECT", {
                enbleMulSelect: !1,
                MeUnSelectInfo: e.MeUnSelectInfo,
              }),
              this.scheduleOnce(function () {
                this.setTile();
              }, 3));
          },
          onNotifyDiscardResult: function (e, t) {
            (this.closeMask(),
              MJ.GameAnimMgr.orderedPlayAnim(function () {
                (MJ.GameLogic.TileModel.onNotifyDiscardResult(e, t, !1),
                  MJ.GameViewHandler.tileModule.emit("OUT_TILE", { nViewSeatId: e, data: t }));
              }),
              this.waitingEnd(e));
          },
          onNotifyDraw: function (e, t) {
            (MJ.GameLogic.TileModel.onDrawTile(e, t, !1),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.BaseInfo.id,
                "UPDATE_REMAIN_TILE",
                { nRemainTileCount: MJ.GameLogic.TileModel.nRemainTileCount },
              ),
              e != g_tConst.GameConfig.ViewSeat.SeatMine &&
                MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_MASK", {
                  bMask: !0,
                  nViewSeatId: g_tConst.GameConfig.ViewSeat.SeatMine,
                  enbleCtrlTile: function () {
                    return !1;
                  },
                }),
              this.waiting(e));
          },
          onNotifyConfirmQue: function () {
            var e = this;
            ((this._nDefaultColor = 2),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.ConfirmQue.id,
                "ON_START_DING_QUE",
                {
                  nDefaultColor: this._nDefaultColor,
                  NoticeLabel:
                    "\u8bf7\u9009\u62e9\u82b1\u8272\u6700\u5c11\u7684\u724c\u5b9a\u4e3a\u7f3a\u724c\uff0c\u6ca1\u6709\u8be5\u82b1\u8272\u624d\u80fd\u80e1\u724c",
                },
              ),
              g_oMJNetManger.autoGameLoop("ON_START_DING_QUE"),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.ConfirmQue.id,
                "UPDATE_DQ_COUNT_DOWN",
                {
                  nCountDownTime: MJ.GameLogic.GameParams.getActTime(
                    g_tConst.GameConfig.TimeParams.InitHandsCards,
                  ),
                  timeType: 1,
                },
              ),
              this.openMask("dingQue"),
              this.scheduleOnce(function () {
                e._isClick = !1;
              }, 1));
          },
          onConfirmQueResult: function (e) {
            var t = this;
            void 0 === e && (e = !0);
            for (
              var i = {
                  stFixedMissing: [
                    { color: 2, seatID: 0 },
                    { color: 1, seatID: 1 },
                    { color: 2, seatID: 2 },
                    { color: 3, seatID: 3 },
                  ],
                },
                o = 0;
              o < i.stFixedMissing.length;
              o++
            ) {
              var n = i.stFixedMissing[o],
                s = n.seatID,
                r = n.color;
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserInfoLayer.id,
                "ADD_USER_TAG",
                { nViewSeatId: s, nUserTag: r, isNeedAnim: e },
              );
            }
            (g_oExLayerManager.emitEvent2GameLayer(
              g_tConst.GameExLayerCfg.ConfirmQue.id,
              "ON_PLAYER_QUE_ALL",
              i,
            ),
              this.setTile(),
              MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_TAG", {
                nTagType: g_tConst.eTileTag.QueTile,
                nViewSeatId: 0,
                enbleTileTag: function (e) {
                  return (
                    !!(a.isCharacter(e) || a.isBamboo(e) || a.isDot(e)) && 2 === t.getTileColor(e)
                  );
                },
              }),
              this.closeMask(),
              this.scheduleOnce(function () {
                this.openMask("doPai");
              }, 2));
          },
          updataConfirmQueResult: function (e) {
            void 0 === e && (e = !0);
            for (
              var t = {
                  stFixedMissing: [
                    { color: 2, seatID: 0 },
                    { color: 1, seatID: 1 },
                    { color: 2, seatID: 2 },
                    { color: 3, seatID: 3 },
                  ],
                },
                i = 0;
              i < t.stFixedMissing.length;
              i++
            ) {
              var a = t.stFixedMissing[i],
                o = a.seatID,
                n = a.color;
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserInfoLayer.id,
                "UPDATE_USER_TAG",
                { nViewSeatId: o, nUserTag: n, isNeedAnim: e },
              );
            }
          },
          getTileColor: function (e) {
            return a.getTileColor(a.toTileValue(e));
          },
          pengUi: function () {
            (g_oExLayerManager.emitEvent2GameLayer(
              g_tConst.GameExLayerCfg.UserCtrl.id,
              "ADD_CTRL",
              { eBlockType: g_tConst.BlockCfgs.BlockPong.BlockType, stBlockCard: [18, 18] },
            ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserCtrl.id,
                "SHOW_TILE_CTRL",
              ),
              this.openMask("peng"));
          },
          playPeng: function () {
            (g_oAudioManager.playByType(0, MJ.GameLogic.PlayerModel.isMan(0), "peng"),
              this.closeMask());
            var e = {
              nViewSeatId: 0,
              aShowTileValues: [19, 19, 19],
              aDeleteTileValues: [19, 19],
              nLastViewSeatId: 2,
            };
            MJ.GameAnimMgr.orderedPlayAnim(
              function () {
                (MJ.GameViewHandler.tileModule.emit("PENG_TILE", e),
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.GameAnim.id,
                    "ANIM_PENG",
                    e,
                  ),
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.UserCtrl.id,
                    "HIDE_CTRL",
                  ));
              },
              {
                playDesc: "\u64ad\u653e\u78b0\u52a8\u753b",
                pauseGameLoop: g_tConst.OrderedAnimType.Peng.time,
              },
            );
          },
          gangUi: function () {
            (g_oExLayerManager.emitEvent2GameLayer(
              g_tConst.GameExLayerCfg.UserCtrl.id,
              "RESET_CTRL",
            ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserCtrl.id,
                "ADD_CTRL",
                {
                  eBlockType: g_tConst.BlockCfgs.BlockConcealedKong.BlockType,
                  stBlockCard: [17, 17, 17],
                },
              ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserCtrl.id,
                "SHOW_TILE_CTRL",
              ),
              this.openMask("gang"));
          },
          anGang: function () {
            (g_oAudioManager.playByType(0, MJ.GameLogic.PlayerModel.isMan(0), "gang"),
              this.closeMask());
            var e = {
              nViewSeatId: 0,
              aShowTileValues: [17, 17, 17, 17],
              aDeleteTileValues: [17, 17, 17, 17],
              nLastViewSeatId: 0,
              nGangType: 4,
              nBlockTile: 19,
            };
            MJ.GameAnimMgr.orderedPlayAnim(
              function () {
                (MJ.GameViewHandler.tileModule.emit("GANG_TILE", e),
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.UserCtrl.id,
                    "RESET_CTRL",
                  ),
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.GameAnim.id,
                    "ANIM_GANG",
                    e,
                  ));
              },
              {
                playDesc: "\u64ad\u653e\u6760\u52a8\u753b",
                pauseGameLoop: g_tConst.OrderedAnimType.Gang.time,
              },
            );
          },
          showTingTip: function () {
            (g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.chatChoose.id, "CLOSE_SHOW"),
              g_oEvent.dispatchEvent(g_tEvent.TEACH_CLICK_MASK),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.TingTip.id,
                "SHOW_TING_TIP_TEACH",
                {
                  iDiscard: 81,
                  stTingHu: [
                    {
                      iHuCard: 18,
                      iTotalFan: 36864,
                      iRemainCardsNum: 1,
                      stTileFan: [
                        { iFanType: 2033, iCount: 1, iTotalFan: 16 },
                        { iFanType: 2021, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2046, iCount: 1, iTotalFan: 24 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 19,
                      iTotalFan: 36864,
                      iRemainCardsNum: 1,
                      stTileFan: [
                        { iFanType: 2033, iCount: 1, iTotalFan: 16 },
                        { iFanType: 2021, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2046, iCount: 1, iTotalFan: 24 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 17,
                      iTotalFan: 13824,
                      iRemainCardsNum: 0,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2046, iCount: 1, iTotalFan: 24 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 49,
                      iTotalFan: 13824,
                      iRemainCardsNum: 2,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2046, iCount: 1, iTotalFan: 24 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 50,
                      iTotalFan: 13824,
                      iRemainCardsNum: 4,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2046, iCount: 1, iTotalFan: 24 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 51,
                      iTotalFan: 13824,
                      iRemainCardsNum: 4,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2046, iCount: 1, iTotalFan: 24 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 81,
                      iTotalFan: 9216,
                      iRemainCardsNum: 1,
                      stTileFan: [
                        { iFanType: 2033, iCount: 1, iTotalFan: 16 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2046, iCount: 1, iTotalFan: 24 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 20,
                      iTotalFan: 4608,
                      iRemainCardsNum: 3,
                      stTileFan: [
                        { iFanType: 2036, iCount: 1, iTotalFan: 24 },
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2056, iCount: 1, iTotalFan: 8 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 52,
                      iTotalFan: 4608,
                      iRemainCardsNum: 4,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2056, iCount: 1, iTotalFan: 8 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 21,
                      iTotalFan: 576,
                      iRemainCardsNum: 3,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 22,
                      iTotalFan: 576,
                      iRemainCardsNum: 4,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 23,
                      iTotalFan: 576,
                      iRemainCardsNum: 4,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 24,
                      iTotalFan: 576,
                      iRemainCardsNum: 4,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 25,
                      iTotalFan: 576,
                      iRemainCardsNum: 4,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 53,
                      iTotalFan: 576,
                      iRemainCardsNum: 4,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 54,
                      iTotalFan: 576,
                      iRemainCardsNum: 4,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 55,
                      iTotalFan: 576,
                      iRemainCardsNum: 4,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 56,
                      iTotalFan: 576,
                      iRemainCardsNum: 4,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                    {
                      iHuCard: 57,
                      iTotalFan: 576,
                      iRemainCardsNum: 4,
                      stTileFan: [
                        { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                        { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                        { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                        { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                      ],
                    },
                  ],
                  minFan: 0,
                  tHandTileMine: [81, 18, 18, 18, 19, 19, 19, 49, 49, 81, 18],
                },
              ));
          },
          zimoUi: function () {
            (g_oExLayerManager.emitEvent2GameLayer(
              g_tConst.GameExLayerCfg.UserCtrl.id,
              "RESET_CTRL",
            ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserCtrl.id,
                "ADD_CTRL",
                { eBlockType: g_tConst.BlockCfgs.BlockSelfDrawn.BlockType, stBlockCard: [23] },
              ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserCtrl.id,
                "SHOW_TILE_CTRL",
              ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserCtrl.id,
                "RESTORE_SUB_CTRL",
              ));
          },
          huUi: function () {
            (this.openMask("hu"),
              this.openMask("huOther"),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserCtrl.id,
                "RESET_CTRL",
              ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserCtrl.id,
                "ADD_CTRL",
                { eBlockType: g_tConst.BlockCfgs.BlockDiscardWin.BlockType, stBlockCard: [50] },
              ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserCtrl.id,
                "SHOW_TILE_CTRL",
              ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserCtrl.id,
                "RESTORE_SUB_CTRL",
              ));
          },
          playHu: function () {
            (g_oAudioManager.playByType(0, MJ.GameLogic.PlayerModel.isMan(0), "hu"),
              this.closeMask());
            var e = {
              nBlockType: 6,
              nViewSeatId: 0,
              nHuTileValue: 22,
              bIsZiMo: !1,
              nLastViewSeatId: 0,
              nBlockCount: 1,
              iHuCardVirtualStatus: 0,
              isYiPaoDuoXiang: !1,
              isUniversalCard: !1,
              huDelIndex: null,
            };
            MJ.GameAnimMgr.orderedPlayAnim(
              function () {
                (g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.GameAnim.id,
                  "ANIM_HU",
                  e,
                ),
                  MJ.GameViewHandler.tileModule.emit("HU_TILE", e),
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.UserCtrl.id,
                    "RESET_CTRL",
                  ));
              },
              {
                playDesc: "\u64ad\u653e\u80e1\u52a8\u753b",
                pauseGameLoop: g_tConst.OrderedAnimType.Hu.time,
              },
            );
          },
          playZimo: function (e) {
            (this.waitingEnd(0),
              g_oAudioManager.playByType(0, MJ.GameLogic.PlayerModel.isMan(0), "zimo"),
              this.closeMask());
            var t = {
              nBlockType: 6,
              nViewSeatId: 0,
              nHuTileValue: e,
              bIsZiMo: !0,
              nLastViewSeatId: 0,
              nBlockCount: 1,
              iHuCardVirtualStatus: 0,
              isYiPaoDuoXiang: !1,
              isUniversalCard: !1,
              huDelIndex: null,
            };
            MJ.GameAnimMgr.orderedPlayAnim(
              function () {
                (g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.GameAnim.id,
                  "ANIM_ZIMO",
                  t,
                ),
                  MJ.GameViewHandler.tileModule.emit("HU_TILE", t),
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.UserCtrl.id,
                    "RESET_CTRL",
                  ));
              },
              {
                playDesc: "\u64ad\u653e\u80e1\u52a8\u753b",
                pauseGameLoop: g_tConst.OrderedAnimType.Hu.time,
              },
            );
          },
          bigHu: function (e) {
            var t = {
              aniName: 0 !== e ? "ex_sanjieGao" : "ex_sijieGao",
              fFanAniTime: null,
              fanxingID: 0 !== e ? "2043" : "2036",
              fanxingName: 0 !== e ? "\u4e09\u8282\u9ad8" : "\u56db\u8282\u9ad8",
              nViewSeatId: 0,
            };
            g_oExLayerManager.emitEvent2GameLayer(
              g_tConst.GameExLayerCfg.GameAnim.id,
              "ANIM_HU_BY_FANXING",
              t,
            );
          },
          zimopiaofen: function (e) {
            var t = this;
            (this.bigHu(e),
              this.scheduleOnce(function () {
                (g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.GameAnim.id,
                  "PIAO_FEN_TEACH",
                  [
                    {
                      iSeatID: 0,
                      iCoin: 6e3,
                      iVipMoreWin: 0,
                      iVipWillMoreWin: 0,
                      eBalanceLimit: 0,
                      iQualifyingPoint: 0,
                    },
                    {
                      iSeatID: 1,
                      iCoin: -2e3,
                      iVipMoreWin: 0,
                      iVipWillMoreWin: 0,
                      eBalanceLimit: e,
                      iQualifyingPoint: 0,
                    },
                    {
                      iSeatID: 2,
                      iCoin: -2e3,
                      iVipMoreWin: 0,
                      iVipWillMoreWin: 0,
                      eBalanceLimit: e,
                      iQualifyingPoint: 0,
                    },
                    {
                      iSeatID: 3,
                      iCoin: -2e3,
                      iVipMoreWin: 0,
                      iVipWillMoreWin: 0,
                      eBalanceLimit: e,
                      iQualifyingPoint: 0,
                    },
                  ],
                ),
                  0 == e
                    ? (t.settWinFailList(1),
                      g_oExLayerManager.emitEvent2GameLayer(
                        g_tConst.GameExLayerCfg.UserInfoLayer.id,
                        "SET_PLAYER_SCORE_TEACH",
                        { SeatMine: 7e3, SeatLeft: 2e3, SeatFront: 3e3, SeatRight: 2e3 },
                      ),
                      g_oData
                        .get(g_tData.GameTeachMod)
                        .setCoinNum({ 0: 7e3, 1: 2e3, 2: 3e3, 3: 2e3 }))
                    : (t.settWinFailList(3),
                      g_oExLayerManager.emitEvent2GameLayer(
                        g_tConst.GameExLayerCfg.UserInfoLayer.id,
                        "SET_PLAYER_SCORE_TEACH",
                        { SeatMine: 14e3, SeatLeft: 0, SeatFront: 0, SeatRight: 0 },
                      ),
                      g_oData.get(g_tData.GameTeachMod).setCoinNum({ 0: 14e3, 1: 0, 2: 0, 3: 0 })));
              }, 1));
          },
          piaofen: function () {
            var e = this;
            (this.bigHu(1),
              this.scheduleOnce(function () {
                (g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.GameAnim.id,
                  "PIAO_FEN_TEACH",
                  [
                    {
                      iSeatID: 0,
                      iCoin: 1e3,
                      iVipMoreWin: 0,
                      iVipWillMoreWin: 0,
                      eBalanceLimit: 0,
                      iQualifyingPoint: 0,
                    },
                    {
                      iSeatID: 1,
                      iCoin: 0,
                      iVipMoreWin: 0,
                      iVipWillMoreWin: 0,
                      eBalanceLimit: 0,
                      iQualifyingPoint: 0,
                    },
                    {
                      iSeatID: 2,
                      iCoin: -1e3,
                      iVipMoreWin: 0,
                      iVipWillMoreWin: 0,
                      eBalanceLimit: 0,
                      iQualifyingPoint: 0,
                    },
                    {
                      iSeatID: 3,
                      iCoin: 0,
                      iVipMoreWin: 0,
                      iVipWillMoreWin: 0,
                      eBalanceLimit: 0,
                      iQualifyingPoint: 0,
                    },
                  ],
                ),
                  e.settWinFailList(2),
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.UserInfoLayer.id,
                    "SET_PLAYER_SCORE_TEACH",
                    { SeatMine: 8e3, SeatLeft: 2e3, SeatFront: 2e3, SeatRight: 2e3 },
                  ),
                  g_oData.get(g_tData.GameTeachMod).setCoinNum({ 0: 8e3, 1: 2e3, 2: 2e3, 3: 2e3 }));
              }, 1));
          },
          setTile: function () {
            var e = this,
              t = this;
            (MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_SORT", {
              nViewSeatId: g_tConst.GameConfig.ViewSeat.SeatMine,
              isSortLeftFun: function (e) {
                return 81 == e ? 1 : 0;
              },
              isSortRightFun: function (e) {
                if (a.isCharacter(e) || a.isBamboo(e) || a.isDot(e) || 81 !== e)
                  return 2 === t.getTileColor(e);
              },
              otherSortFun: null,
            }),
              this._index > 3 &&
                MJ.GameViewHandler.tileModule.emit("SET_HAND_TILE_TAG", {
                  nTagType: g_tConst.eTileTag.QueTile,
                  nViewSeatId: 0,
                  enbleTileTag: function (t) {
                    return (
                      !!(a.isCharacter(t) || a.isBamboo(t) || a.isDot(t)) && 2 === e.getTileColor(t)
                    );
                  },
                }));
          },
          loadPai: function () {
            var e = g_tConst.teach_showPai;
            this.showPai.removeAllChildren();
            for (var t = 0; t < e.length; t++) {
              var i = e[t],
                a = g_oPrefabLoader.instantiate(this.GameTeachUsePai, this.showPai);
              if (a) {
                var o = a.getComponent("GameTeachUsePai");
                o && o.onInit && o.onInit(i, t);
              }
            }
          },
          setStepInfo: function () {
            var e = this,
              t = g_oData.get(g_tData.UserLocalModel).getData("gameTeachStep", null) || 0;
            (t < 0 && (t = 0),
              MJ.GameViewHandler.tileModule.emit("RESET_TILES"),
              MJ.GameViewHandler.nodeDeskBaseInfo.emit("SET_TEACH_TABLE_INFO"),
              g_oExLayerManager.emitEvent2GameLayer(g_tConst.GameExLayerCfg.GDHSZ.id, "CLOSE_HSZ"),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserCtrl.id,
                "RESET_CTRL",
              ),
              (this._index = t - 1));
            var i = { iSrcSeatID: 0 };
            switch (
              (t > 1 &&
                (this.playerEntry(),
                g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.UserInfoLayer.id,
                  "UPDATE_BANKER",
                  { data: 0 },
                )),
              t >= 8 && (this.btn_ting.active = !0),
              t >= 4 && this.onConfirmQueResult(!1),
              (this.allMask.active = !0),
              t)
            ) {
              case 1:
                this.loadPai();
                break;
              case 2:
                ((i.mHandTileValues = this._HandTileValues),
                  this.scheduleOnce(function () {
                    e.launchChangeCard();
                  }, 1));
                break;
              case 3:
                ((i.mHandTileValues = this._HandTileValues),
                  (i.mHandTileValues[0] = [81, 81, 17, 17, 17, 18, 18, 18, 19, 19, 49, 49, 35, 41]),
                  this.onNotifyConfirmQue());
                break;
              case 4:
                (this.setExplainTime(),
                  (i.mHandTileValues = this._HandTileValues),
                  (i.mHandTileValues[0] = [
                    81, 81, 17, 17, 17, 18, 18, 18, 19, 19, 49, 49, 35, 41,
                  ]));
                break;
              case 5:
                ((i.mHandTileValues = this._HandTileValues),
                  (i.mHandTileValues[0] = [
                    81, 81, 17, 17, 17, 18, 18, 18, 19, 19, 49, 49, 35, 41,
                  ]));
                break;
              case 6:
                ((i.mHandTileValues = this._HandTileValues),
                  (i.mHandTileValues[0] = [81, 81, 17, 17, 17, 18, 18, 18, 19, 19, 49, 49, 35]),
                  (i.mOutTileValues = [[41], [], [], [41]]),
                  (i.newOutTile = [2, 19]),
                  this.scheduleOnce(function () {
                    e.pengUi();
                  }, 0.5));
                break;
              case 7:
                ((i.mHandTileValues = this._HandTileValues),
                  (i.mHandTileValues[0] = [81, 81, 17, 17, 17, 18, 18, 18, 49, 49, 35]),
                  (i.mPengTileValues = [[{ iCard: [19, 19, 19], iSrcSeatID: 2 }]]),
                  (i.mOutTileValues = [[41], [], [], [41]]));
                break;
              case 8:
                ((i.mHandTileValues = this._HandTileValues),
                  (i.mHandTileValues[0] = [81, 81, 17, 17, 17, 18, 18, 18, 49, 49]),
                  (i.mPengTileValues = [[{ iCard: [19, 19, 19], iSrcSeatID: 2 }]]),
                  (i.mOutTileValues = [[41], [], [], [41]]),
                  (i.newOutTile = [0, 35]));
                break;
              case 9:
                ((i.mHandTileValues = this._HandTileValues),
                  (i.mHandTileValues[0] = [81, 81, 17, 17, 17, 18, 18, 18, 49, 49, 17]),
                  (i.mPengTileValues = [[{ iCard: [19, 19, 19], iSrcSeatID: 2 }]]),
                  (i.mOutTileValues = [[41, 35], [34], [38], [41, 39]]),
                  this.scheduleOnce(function () {
                    e.gangUi();
                  }, 0.1));
                break;
              case 10:
                ((i.mHandTileValues = this._HandTileValues),
                  (i.mHandTileValues[0] = [81, 81, 18, 18, 18, 49, 49, 20]),
                  (i.mPengTileValues = [[{ iCard: [19, 19, 19], iSrcSeatID: 2 }]]),
                  (i.mOutTileValues = [[41, 35], [34], [38], [41, 39]]),
                  (i.mGangTileValues = [
                    [{ iCard: [17, 17, 17, 17], iSrcSeatID: 0, eBlockType: 4 }],
                  ]),
                  this.scheduleOnce(function () {
                    e.huUi();
                  }, 0.1));
                break;
              case 11:
                (g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.UserInfoLayer.id,
                  "SET_PLAYER_SCORE_TEACH",
                  { SeatMine: 7e3, SeatLeft: 2e3, SeatFront: 3e3, SeatRight: 2e3 },
                ),
                  g_oData.get(g_tData.GameTeachMod).setCoinNum({ 0: 7e3, 1: 2e3, 2: 3e3, 3: 2e3 }),
                  this.settWinFailList(1),
                  (i.mHandTileValues = this._HandTileValues),
                  (i.mHandTileValues[0] = [81, 81, 18, 18, 18, 49, 49]),
                  (i.mPengTileValues = [[{ iCard: [19, 19, 19], iSrcSeatID: 2 }]]),
                  (i.mOutTileValues = [[41, 35], [34], [38], [41, 39, 40]]),
                  (i.mGangTileValues = [
                    [{ iCard: [17, 17, 17, 17], iSrcSeatID: 0, eBlockType: 4 }],
                  ]),
                  (i.mTransparentHuTile = [[20], [], [], []]),
                  (i.newOutTile = [2, 22]),
                  this.scheduleOnce(function () {
                    e.huUi();
                  }, 0.1));
                break;
              case 12:
                (this.setEndInfo(),
                  this.openTile(),
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.UserInfoLayer.id,
                    "SET_PLAYER_SCORE_TEACH",
                    { SeatMine: 14e3, SeatLeft: 0, SeatFront: 0, SeatRight: 0 },
                  ),
                  g_oData.get(g_tData.GameTeachMod).setCoinNum({ 0: 14e3, 1: 0, 2: 0, 3: 0 }),
                  this.settWinFailList(2),
                  (i.mHandTileValues = this._HandTileValues),
                  (i.mHandTileValues[0] = [81, 81, 18, 18, 18, 49, 49]),
                  (i.mPengTileValues = [[{ iCard: [19, 19, 19], iSrcSeatID: 2 }]]),
                  (i.mOutTileValues = [
                    [41, 35],
                    [34, 33],
                    [38, 35],
                    [41, 39, 40, 35],
                  ]),
                  (i.mGangTileValues = [
                    [{ iCard: [17, 17, 17, 17], iSrcSeatID: 0, eBlockType: 4 }],
                  ]),
                  (i.mTransparentHuTile = [[20, 22, 23], [], [], []]),
                  this.openMask("end"));
                for (var a = 0; a < 3; a++) {
                  var o = { nViewSeatID: a + 1, isGiveUp: !0 };
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.UserState.id,
                    "SHOW_GIVEUP_STATE",
                    o,
                  );
                }
            }
            (MJ.GameViewHandler.tileModule.emit("RESUME_ALL_TILES_TEACH", i),
              i.newOutTile &&
                MJ.GameViewHandler.tileModule.emit("OUT_TILE_TEACH", {
                  nViewSeatId: i.newOutTile[0],
                  data: i.newOutTile[1],
                }),
              this.scheduleOnce(function () {
                (e.setTile(), t > 3 && e.setLaizi());
              }, 0.2));
            var n = 0 === t ? 0.5 : 2;
            this.scheduleOnce(function () {
              e.changeView(e.step[t]);
            }, n);
          },
          openTile: function () {
            var e = [
              { iHandsCards: [81, 81, 18, 18, 18, 49, 49] },
              { iHandsCards: this._HandTileValues[1] },
              { iHandsCards: this._HandTileValues[2] },
              { iHandsCards: this._HandTileValues[3] },
            ];
            MJ.GameViewHandler.tileModule.emit("SET_OPEN_TILE_TEACH", e);
          },
          settWinFailList: function (e) {
            var t = [];
            (e >= 1 &&
              t.push({
                stFanGroup: {
                  stTileFan: [
                    { iFanType: 2036, iCount: 1, iTotalFan: 24 },
                    { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                    { iFanType: 2056, iCount: 1, iTotalFan: 8 },
                    { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                    { iFanType: 3002, iCount: 1, iTotalFan: 2 },
                    { iFanType: 3005, iCount: 1, iTotalFan: 4 },
                    { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                  ],
                  iTotalFanCount: 36864,
                  eFanType: 5,
                  huPai: 20,
                },
                iSeatID: 0,
                eBalanceLimit: null,
                iWinSeatID: 0,
                iLossSeatID: [1, 2, 3],
                iCoin: 6e3,
                iPoint: 6e3,
                iVipMoreWin: null,
                iVipWillMoreWin: 0,
                iShareMoreWin: 0,
                stTFanExtraInfo: null,
                iQualifyingPoint: 0,
                iMKBKMoreWin: 0,
                lCoin: 6e3,
                useReviveGift: null,
                addCoin: null,
              }),
              e >= 2 &&
                t.unshift({
                  stFanGroup: {
                    stTileFan: [
                      { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                      { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                      { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                      { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                      { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                    ],
                    iTotalFanCount: 576,
                    eFanType: 2,
                    huPai: 22,
                  },
                  iSeatID: 0,
                  eBalanceLimit: null,
                  iWinSeatID: 0,
                  iLossSeatID: [2],
                  iCoin: 1e3,
                  iPoint: 1e3,
                  iVipMoreWin: null,
                  iVipWillMoreWin: 0,
                  iShareMoreWin: 0,
                  stTFanExtraInfo: null,
                  iQualifyingPoint: 0,
                  iMKBKMoreWin: 1e3,
                  lCoin: 1e3,
                  useReviveGift: null,
                  addCoin: null,
                }),
              e >= 3 &&
                t.unshift({
                  stFanGroup: {
                    stTileFan: [
                      { iFanType: 2052, iCount: 1, iTotalFan: 6 },
                      { iFanType: 2009, iCount: 1, iTotalFan: 2 },
                      { iFanType: 3002, iCount: 1, iTotalFan: 2 },
                      { iFanType: 2043, iCount: 1, iTotalFan: 12 },
                      { iFanType: 2077, iCount: 1, iTotalFan: 2 },
                      { iFanType: 2079, iCount: 1, iTotalFan: 2 },
                    ],
                    iTotalFanCount: 1152,
                    eFanType: 1,
                    huPai: 23,
                  },
                  iSeatID: 0,
                  eBalanceLimit: null,
                  iWinSeatID: 0,
                  iLossSeatID: [1, 2, 3],
                  iCoin: 6e3,
                  iPoint: 6e3,
                  iVipMoreWin: null,
                  iVipWillMoreWin: 0,
                  iShareMoreWin: 0,
                  stTFanExtraInfo: null,
                  iQualifyingPoint: 0,
                  iMKBKMoreWin: 0,
                  lCoin: 6e3,
                  useReviveGift: null,
                  addCoin: null,
                }),
              MJ.GameLogic.setWinFailList(t));
          },
          welcome: function () {
            var e = this;
            this._isClick ||
              ((this._isClick = !0),
              (this.allMask.active = !0),
              this.changeView("explainPai"),
              this.loadPai(),
              this.scheduleOnce(function () {
                e._isClick = !1;
              }, 3.5));
          },
          explainPai: function () {
            var e = this;
            this._isClick ||
              ((this._isClick = !0),
              (this.root.getChildByName("explainPai").active = !1),
              this.playerEntry(),
              this.scheduleOnce(function () {
                e.statGame();
              }, 0.1),
              (this.allMask.active = !0),
              this.scheduleOnce(function () {
                (e.closeMask(), e.InitHandCards());
              }, 3.5),
              this.scheduleOnce(function () {
                (e.openMask("HSZ"), e.changeView("HSZ"));
              }, 9));
          },
          HSZ: function () {
            this._isClick ||
              ((this._isClick = !0),
              (this.root.getChildByName("HSZ").getChildByName("tip").active = !1),
              this.launchChangeCardRst(),
              (this.allMask.active = !0),
              this.scheduleOnce(function () {
                (this.onNotifyConfirmQue(),
                  this.scheduleOnce(function () {
                    this.changeView("dingQue");
                  }, 0.6));
              }, 3));
          },
          dingQue: function () {
            this._isClick ||
              ((this._isClick = !0),
              (this.root.getChildByName("dingQue").getChildByName("finger").active = !1),
              this.onConfirmQueResult(),
              (this.allMask.active = !0),
              this.scheduleOnce(function () {
                (this.changeView("doPai"), this.setExplainTime());
              }, 2),
              this.scheduleOnce(function () {
                this._isClick = !1;
              }, 3));
          },
          doPai: function () {
            var e = this;
            this._isClick ||
              ((this._isClick = !0),
              (this.allMask.active = !0),
              this.changeView("chuPai"),
              this.openMask("chuPai"),
              this.scheduleOnce(function () {
                e._isClick = !1;
              }, 1.5));
          },
          chuPai: function () {
            var e = this;
            this._isClick ||
              ((this._isClick = !0),
              cc
                .tween(this.node)
                .call(function () {
                  ((e.root.getChildByName("chuPai").getChildByName("tip").active = !1),
                    e.onNotifyDiscardResult(0, 41));
                })
                .delay(0.5)
                .call(function () {
                  e.onNotifyDraw(3, [41]);
                })
                .delay(g_oCommonUtils.getRandomNum(1, 3))
                .call(function () {
                  e.onNotifyDiscardResult(3, 41);
                })
                .delay(0.5)
                .call(function () {
                  e.onNotifyDraw(2, [19]);
                })
                .delay(g_oCommonUtils.getRandomNum(1, 3))
                .call(function () {
                  e.onNotifyDiscardResult(2, 19);
                })
                .delay(1)
                .call(function () {
                  e.pengUi();
                })
                .delay(1.5)
                .call(function () {
                  e.changeView("peng");
                })
                .delay(1)
                .call(function () {
                  e._isClick = !1;
                })
                .start());
          },
          peng: function () {
            var e = this;
            this._isClick ||
              ((this._isClick = !0),
              cc
                .tween(this.node)
                .call(function () {
                  ((e.root.getChildByName("peng").getChildByName("tip").active = !1),
                    (e.root.getChildByName("peng").getChildByName("finger").active = !1),
                    e.playPeng());
                })
                .delay(g_tConst.OrderedAnimType.Peng.time)
                .call(function () {
                  (e.openMask("peng_out"), e.changeView("peng_out"));
                })
                .delay(1)
                .call(function () {
                  e._isClick = !1;
                })
                .start());
          },
          peng_out: function () {
            var e = this;
            this._isClick ||
              ((this._isClick = !0),
              cc
                .tween(this.node)
                .call(function () {
                  (e.onNotifyDiscardResult(0, 35),
                    (e.root.getChildByName("peng_out").getChildByName("tip").active = !1));
                })
                .delay(2)
                .call(function () {
                  (e.scheduleOnce(function () {
                    e._isClick = !1;
                  }, 0),
                    (e.btn_ting.active = !0),
                    e.changeView("tingTip"),
                    e.openMask("tingTip"));
                })
                .start());
          },
          tingTip: function () {
            var e = this;
            this._isClick ||
              ((this._isClick = !0),
              cc
                .tween(this.node)
                .call(function () {
                  (e.closeMask(),
                    e.onNotifyDraw(3, [39]),
                    (e.root.getChildByName("tingTip").getChildByName("tip").active = !1),
                    (e.root.getChildByName("tingTip").getChildByName("btn").active = !1),
                    (e.root.getChildByName("tingTip").getChildByName("finger").active = !1),
                    e.showTingTip());
                })
                .delay(1)
                .call(function () {
                  e.onNotifyDraw(3, [39]);
                })
                .delay(g_oCommonUtils.getRandomNum(1, 3))
                .call(function () {
                  e.onNotifyDiscardResult(3, 39);
                })
                .delay(1.5)
                .call(function () {
                  e.onNotifyDraw(2, [38]);
                })
                .delay(g_oCommonUtils.getRandomNum(1, 3))
                .call(function () {
                  e.onNotifyDiscardResult(2, 38);
                })
                .delay(1.5)
                .call(function () {
                  e.onNotifyDraw(1, [34]);
                })
                .delay(g_oCommonUtils.getRandomNum(1, 3))
                .call(function () {
                  e.onNotifyDiscardResult(1, 34);
                })
                .delay(1.5)
                .call(function () {
                  e.onNotifyDraw(0, [17]);
                })
                .delay(0.2)
                .call(function () {
                  e.gangUi();
                })
                .delay(0.2)
                .call(function () {
                  (e.changeView("gang"), (e._isClick = !1));
                })
                .start());
          },
          gang: function () {
            var e = this;
            this._isClick ||
              ((this._isClick = !0),
              cc
                .tween(this.node)
                .call(function () {
                  ((e.root.getChildByName("gang").getChildByName("tip").active = !1),
                    (e.root.getChildByName("gang").getChildByName("finger").active = !1),
                    e.anGang());
                })
                .delay(g_tConst.OrderedAnimType.Gang.time)
                .call(function () {
                  e.onNotifyDraw(0, [20]);
                })
                .delay(0.1)
                .call(function () {
                  e.huUi();
                })
                .delay(1)
                .call(function () {
                  (e.changeView("hu"),
                    e.scheduleOnce(function () {
                      e._isClick = !1;
                    }, 0));
                })
                .start());
          },
          hu: function () {
            var e = this;
            this._isClick ||
              ((this._isClick = !0),
              cc
                .tween(this.node)
                .call(function () {
                  ((e.root.getChildByName("hu").getChildByName("finger").active = !1),
                    (e.root.getChildByName("hu").getChildByName("tip").active = !1));
                })
                .delay(0.1)
                .call(function () {
                  (e.playZimo(20), e.closeTouch());
                })
                .delay(g_tConst.OrderedAnimType.Hu.time)
                .call(function () {
                  e.zimopiaofen(0);
                })
                .delay(3)
                .call(function () {
                  e.huTiP.active = !0;
                })
                .delay(8)
                .call(function () {
                  ((e.huTiP.active = !1), e.onNotifyDraw(3, [40]));
                })
                .delay(g_oCommonUtils.getRandomNum(1, 3))
                .call(function () {
                  e.onNotifyDiscardResult(3, 40);
                })
                .delay(1)
                .call(function () {
                  e.onNotifyDraw(2, [22]);
                })
                .delay(g_oCommonUtils.getRandomNum(1, 3))
                .call(function () {
                  (e.onNotifyDiscardResult(2, 22), e.openTouch());
                })
                .delay(0.5)
                .call(function () {
                  (e.huUi(), e.closeMask());
                })
                .delay(0.5)
                .call(function () {
                  (e.changeView("huOther"),
                    e.scheduleOnce(function () {
                      ((e._isClick = !1), e.closeAllTip(), e.openTouch());
                    }, 0.5));
                })
                .start());
          },
          huOther: function () {
            var e = this;
            this._isClick ||
              ((this._isClick = !0),
              cc
                .tween(this.node)
                .call(function () {
                  ((e.root.getChildByName("huOther").getChildByName("finger").active = !1),
                    (e.root.getChildByName("huOther").getChildByName("tip").active = !1),
                    e.closeTouch(),
                    e.closeMask(),
                    e.playHu(),
                    e.setEndInfo());
                })
                .delay(g_tConst.OrderedAnimType.Hu.time)
                .call(function () {
                  e.piaofen();
                })
                .delay(g_tConst.OrderedAnimType.GamingPiaoFen.time + 1)
                .delay(1)
                .call(function () {
                  ((e.huTiP.active = !1), (e.huTiP2.active = !0));
                })
                .delay(3)
                .call(function () {
                  ((e.huTiP2.active = !1), e.onNotifyDraw(3, [35]));
                })
                .delay(g_oCommonUtils.getRandomNum(1, 3))
                .call(function () {
                  e.onNotifyDiscardResult(3, 35);
                })
                .delay(1.5)
                .call(function () {
                  e.onNotifyDraw(2, [34]);
                })
                .delay(g_oCommonUtils.getRandomNum(1, 3))
                .call(function () {
                  e.onNotifyDiscardResult(2, 34);
                })
                .delay(1.5)
                .call(function () {
                  e.onNotifyDraw(1, [33]);
                })
                .delay(g_oCommonUtils.getRandomNum(1, 3))
                .call(function () {
                  e.onNotifyDiscardResult(1, 33);
                })
                .delay(1.5)
                .call(function () {
                  e.onNotifyDraw(0, [23]);
                })
                .delay(0.5)
                .call(function () {
                  ((e.root.getChildByName("huOther").getChildByName("btn").active = !1),
                    e.zimoUi());
                })
                .delay(3)
                .call(function () {
                  e._isZiMo ||
                    ((e._isZiMo = !0),
                    e.playZimo(23),
                    e.scheduleOnce(function () {
                      e.zimopiaofen(2);
                    }, 0.5));
                })
                .delay(3)
                .call(function () {
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.GameMenu.id,
                    "IS_SHOW_WAIT_CHARGE",
                    !0,
                  );
                })
                .delay(g_oCommonUtils.getRandomNum(1, 3))
                .call(function () {
                  (g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.UserState.id,
                    "SHOW_GIVEUP_STATE",
                    { nViewSeatID: 3, isGiveUp: !0 },
                  ),
                    g_oExLayerManager.emitEvent2GameLayer(
                      g_tConst.GameExLayerCfg.GameMenu.id,
                      "IS_SHOW_WAIT_CHARGE",
                      !0,
                    ));
                })
                .delay(g_oCommonUtils.getRandomNum(1, 3))
                .call(function () {
                  (g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.UserState.id,
                    "SHOW_GIVEUP_STATE",
                    { nViewSeatID: 1, isGiveUp: !0 },
                  ),
                    g_oExLayerManager.emitEvent2GameLayer(
                      g_tConst.GameExLayerCfg.GameMenu.id,
                      "IS_SHOW_WAIT_CHARGE",
                      !0,
                    ));
                })
                .delay(g_oCommonUtils.getRandomNum(1, 3))
                .call(function () {
                  g_oExLayerManager.emitEvent2GameLayer(
                    g_tConst.GameExLayerCfg.UserState.id,
                    "SHOW_GIVEUP_STATE",
                    { nViewSeatID: 2, isGiveUp: !0 },
                  );
                })
                .delay(1)
                .call(function () {
                  e.openTile();
                })
                .delay(1.5)
                .call(function () {
                  (e.changeView("end"),
                    e.openMask("end"),
                    e.scheduleOnce(function () {
                      e._isClick = !1;
                    }, 3));
                })
                .start());
          },
          end: function () {
            this._isClick ||
              ((this._isClick = !0),
              this._index++,
              g_oData.get(g_tData.UserLocalModel).setData("IS_GAME_TEACH", !1),
              g_oSceneLoader.gotoScene(g_tConst.SceneCfgs.lobby, null, function (e) {
                e && e();
              }));
          },
          showEndLab: function () {
            var e = this._waitTimes;
            this.schedule(
              function t() {
                this.root.getChildByName("end").active
                  ? (e <= 0 && this.unschedule(t),
                    e--,
                    (this.lab_endTime.string =
                      "\u70b9\u51fb\u5c4f\u5e55\u524d\u5f80\u9886\u53d6(" +
                      (e >= 0 ? e : 0) +
                      "s)"))
                  : this.unschedule(t);
              },
              1,
              this._waitTimes,
              0,
            );
          },
          setEndInfo: function () {
            (cc.winSize.width >= 1380 &&
              ((this.wgt_close.left = (cc.winSize.width - 1380) / 2),
              this.wgt_close.updateAlignment()),
              g_oData
                .get(g_tData.comHead)
                .loadHead(g_oPlatform.getHeadUrl(), this.head_node.getComponent(cc.Sprite)),
              (this.myName.string = g_oPlatform.getNickName()),
              (this.lab_endNum0.string = "+" + this.bigNum(13e3)),
              (this.lab_endNum1.string = this.bigNum(-4e3)),
              (this.lab_endNum2.string = this.bigNum(-5e3)),
              (this.lab_endNum3.string = this.bigNum(-4e3)),
              this.setRankSp());
          },
          setRankSp: function () {
            var e,
              t = 1;
            g_oData.get(g_tData.MJMasterPathMod).MJMasterPathData &&
              g_oData.get(g_tData.MJMasterPathMod).MJMasterPathData.lv &&
              (t = g_oData.get(g_tData.MJMasterPathMod).MJMasterPathData.lv);
            for (
              var i = g_oData.get(g_tData.MJMasterPathMod).getRankConfigs(), a = 0;
              a < i.length;
              a++
            ) {
              var o = i[a];
              if (t <= o.maxLv) {
                e = o;
                break;
              }
            }
            e && g_oData.get(g_tData.MJMasterPathMod).loadSp("r_" + e.rankIndex, this.icon_grade);
          },
          bigNum: function (e) {
            return g_oCommonUtils.translateCoinStr(
              g_oCommonUtils.initProCoin(g_oCommonUtils.Long2Number(e)),
              { special: !0, unitRange: g_tConst.GameUnit.Normal },
            );
          },
          restGameInfo: function () {
            (g_oExLayerManager.emitEvent2GameLayer(
              g_tConst.GameExLayerCfg.UserInfoLayer.id,
              "PLAYER_LEAVE",
              { nViewSeatId: 0 },
            ),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserState.id,
                "HIDE_ALL",
              ),
              MJ.GameViewHandler.tileModule.emit("RESET_TILES"),
              g_oExLayerManager.emitEvent2GameLayer(
                g_tConst.GameExLayerCfg.UserCtrl.id,
                "RESET_CTRL",
              ));
          },
          onClickZimo: function () {
            var e = this;
            this._isZiMo ||
              ((this._isZiMo = !0),
              this.playZimo(23),
              this.scheduleOnce(function () {
                e.zimopiaofen(2);
              }, 0.5));
          },
          onClickGetAward: function () {
            if (this.antiMultipleClick()) {
              var e = g_oData.get(g_tData.GameTeachMod).getGoodsInfo();
              g_oData.get(g_tData.GetAwardMod).showAward(e, null, this.end.bind(this));
            }
          },
          onClickStartGame: function () {
            (g_oData.get(g_tData.UserLocalModel).setData("IS_GAME_TEACH", !1),
              g_oEvent.dispatchEvent(g_tEvent.CLOSE_GAME_TEACH),
              this._index++,
              this.close(),
              s.quickStart(!0, 866));
          },
          onClickReplay: function () {
            if (this.antiMultipleClick()) {
              var e = this;
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Alert.id, "ON_INIT", {
                data: {
                  title: "\u63d0  \u793a",
                  value: "\u786e\u5b9a\u518d\u6b21\u5b66\u4e60\u73a9\u6cd5\u5417\uff1f",
                  type: 0,
                  ok: function () {
                    (g_oData.get(g_tData.GameTeachMod).reportTeachAgain(), e.reStartGuide());
                  },
                },
              });
            }
          },
          antiMultipleClick: function () {
            var e = this;
            return this._clickedClose
              ? (Log.info("CLick too many times please wait a second"), !1)
              : ((this._clickedClose = !0),
                this.scheduleOnce(function () {
                  e._clickedClose = !1;
                }, 2),
                !0);
          },
        }),
          cc._RF.pop());
      },
      {
        AlertDlgBaseView: "AlertDlgBaseView",
        CommonSDK: "CommonSDK",
        QuikStart: "QuikStart",
        tileLogicHelper: "tileLogicHelper",
        ui_DiyMask: "ui_DiyMask",
      },
    ],
