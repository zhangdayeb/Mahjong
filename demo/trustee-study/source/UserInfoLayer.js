    UserInfoLayer: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "542e9To7UJEIbprJL4sjhrv", "UserInfoLayer");
        var i = e("CommonUtils"),
          a = e("UserInfoYuyinManger");
        (e("gameYuyinAudioMgr"),
          (t.exports = {
            createLayer: function (e, t) {
              g_oPrefabLoader.loadRes(
                g_tAsset.UserInfoLayer,
                t,
                function (t) {
                  void 0 !== e && e(t);
                },
                g_oEnvMgr.Env,
              );
            },
          }),
          cc.Class({
            extends: Cls_BaseCtrl,
            properties: {
              Debug: { default: !1, tooltip: "\u662f\u5426\u8c03\u8bd5" },
              prefabUserNode: {
                default: null,
                type: cc.Prefab,
                tooltip: "\u73a9\u5bb6\u5934\u50cf\u9884\u5236",
              },
              UserInfoAtlas: {
                default: null,
                type: cc.SpriteAtlas,
                toolTip: "\u73a9\u5bb6\u8282\u70b9\u56fe\u96c6",
              },
              nodeUserView: {
                default: [],
                type: [cc.Node],
                tooltip: "\u73a9\u5bb6\u5934\u50cf\u4f4d\u7f6e",
              },
              spriteDisplayBigTag: {
                default: [],
                type: [cc.Sprite],
                tooltip: "\u73a9\u5bb6\u6807\u8bc6\u52a8\u753b\u663e\u793a\u7684\u5927\u56fe",
              },
              nodeBigTagBg: {
                default: null,
                type: cc.Node,
                tootip: "\u5927\u6807\u8bc6\u7684\u663e\u793a\u53ca\u52a8\u753b\u5c42",
              },
              yuyinAnims: cc.Prefab,
              prefabAuthorize: cc.Prefab,
              protectGiftEffect: [cc.Node],
              userInfoLeagueMatchNode: cc.Node,
              userNode: cc.Node,
              leagueUserNode: {
                default: [],
                type: [cc.Node],
                tooltip: "\u8054\u8d5b\u73a9\u5bb6\u5934\u50cf\u4f4d\u7f6e",
              },
            },
            Awake: function () {
              (this.updateBigTagLayout(),
                this.updateNodeUserViewLayout(),
                this.onCustomEvent(),
                this.onMessageEvent(),
                this.Debug && this.testShowUser(),
                (this._tUserNodes = []),
                MJ.GameLogic.TableModel.IsDiyRoom() || (this.node.opacity = 255),
                (this.userInfoLeagueMatchNodeComponent =
                  this.userInfoLeagueMatchNode.getComponent("UserInfoLeagueMatchNode")),
                (this.userInfoLeagueMatchNode.active = !1));
            },
            start: function () {
              var e = this;
              a.setPlay(function (t, i, a, o) {
                e._tUserNodes[t]
                  ? (console.warn("\u6536\u5230\u8bed\u97f3"),
                    e._tUserNodes[t].emit("PLAY_USER_YUYIN", {
                      sMsgData: i,
                      nViewSeatId: t,
                      msgCont: a,
                      endCallback: o,
                    }))
                  : (Log.warn("\u8bed\u97f3\u8be5\u4f4d\u7f6e\u4e0a\u6ca1\u6709\u4eba"),
                    console.warn("\u8bed\u97f3\u8be5\u4f4d\u7f6e\u4e0a\u6ca1\u6709\u4eba"));
              });
            },
            onCustomEvent: function () {
              (this.node.on(
                "USERINFO_RESET",
                function () {
                  MJ.GameLogic.TableModel.getGameType() == g_tConst.GameTypeCfgs.LS6HZ.TYPEID
                    ? ((this.userInfoLeagueMatchNode.active = !0), (this.userNode.active = !1))
                    : ((this.userInfoLeagueMatchNode.active = !1), (this.userNode.active = !0));
                  for (var e = 0; e < 4; e++) this.__resetNode(e);
                },
                this,
              ),
                this.node.on(
                  "UPDATE_PLAYER_INFO",
                  function (e) {
                    this._updatePlayerInfo(e.data);
                  },
                  this,
                ),
                this.node.on("ON_USER_MODIFY_INFO", this._onUserModifyInfo, this),
                this.node.on("UPDATE_BANKER", this._updateBanker, this),
                this.node.on("UPDATE_TEAMMATE", this._updateTeammate, this),
                this.node.on("ADD_USER_TAG", this._addUserTag, this),
                this.node.on("UPDATE_USER_TAG", this._updateUserTag, this),
                this.node.on(
                  "PLAYER_LEAVE",
                  function (e) {
                    var t = this,
                      i = e;
                    MJ.GameAnimMgr.orderedPlayAnim(
                      function () {
                        if (i.nViewSeatId === g_tConst.GameConfig.ViewSeat.SeatMine)
                          for (var e = 0; e < 4; e++) t._delPayerNode(e);
                        else t._delPayerNode(i.nViewSeatId);
                      },
                      {
                        playDesc:
                          "\u5220\u9664\u73a9\u5bb6\u684c\u9762\u8282\u70b9, \u73a9\u5bb6: " +
                          i.nViewSeatId,
                        pauseGameLoop: 0.1,
                      },
                    );
                  },
                  this,
                ),
                this.node.on(
                  "SET_PLAYER_SCORE",
                  function () {
                    var e = g_tConst.GameConfig.ViewSeat,
                      t = MJ.GameLogic.TableModel.isZCoinRoom();
                    for (var a in e) {
                      var o = MJ.GameLogic.PlayerModel.getPlayerInfoByViewID(e[a]);
                      if (o) {
                        var n;
                        if (null != (n = t ? o.fingerCoin : o.coin)) {
                          var s = i.Long2Number(n);
                          this._setPlayerScore(o.viewSeatID, s);
                        }
                      }
                    }
                  },
                  this,
                ),
                this.node.on(
                  "SET_PLAYER_MJ_PATH",
                  function () {
                    this._setMJMPath();
                  },
                  this,
                ),
                this.node.on(
                  "SET_PLAYER_FAKE_MJPATH_LV",
                  function (e) {
                    var t = g_tConst.GameConfig.ViewSeat;
                    for (var i in t) {
                      var a = e[i];
                      this._setPlayerMjPathFakeLv(g_tConst.GameConfig.ViewSeat[i], a);
                    }
                  },
                  this,
                ),
                this.node.on(
                  "SET_PLAYER_SCORE_TEACH",
                  function (e) {
                    var t = g_tConst.GameConfig.ViewSeat;
                    for (var i in t) this._setPlayerScore(t[i], e[i]);
                  },
                  this,
                ),
                this.node.on(
                  "SET_MATCH_SCORE",
                  function () {
                    var e = g_tConst.GameConfig.ViewSeat;
                    for (var t in e) {
                      var i = MJ.GameLogic.MatchModel.getMatchScoreByViewSeat(e[t]);
                      (this._setMatchScore(e[t], i),
                        parseInt(e[t]) === g_tConst.GameConfig.ViewSeat.SeatMine &&
                          g_oEvent.dispatchEvent(g_tEvent.UPDATE_WX_GAME_BEAN_DATA_PLAY, {
                            showNum: i,
                          }));
                    }
                  },
                  this,
                ),
                this.node.on(
                  "SET_COUNTER_NUM",
                  function () {
                    var e = g_tConst.GameConfig.ViewSeat;
                    for (var t in e) {
                      var i = MJ.GameLogic.CounterModel.getCounterNumByViewSeat(e[t]);
                      (this._setCounterNum(e[t], i),
                        parseInt(e[t]) === g_tConst.GameConfig.ViewSeat.SeatMine &&
                          g_oEvent.dispatchEvent(g_tEvent.UPDATE_WX_GAME_BEAN_DATA_PLAY, {
                            showNum: i,
                          }));
                    }
                  },
                  this,
                ),
                this.node.on(
                  "SET_BATTLE_POINT",
                  function () {
                    var e = g_tConst.GameConfig.ViewSeat;
                    for (var t in e) {
                      var i = MJ.GameLogic.BattleModel.getBattlePointByVId(e[t]);
                      isNull(i) || this._setPlayerBattlePoint(e[t], i);
                    }
                  },
                  this,
                ),
                this.node.on(
                  "SET_PLAYER_ZCOIN",
                  function () {
                    var e = g_tConst.GameConfig.ViewSeat;
                    for (var t in e) {
                      var i = MJ.GameLogic.ZCoinModel.getZCoinByViewId(e[t]);
                      this._setZCoinNum(e[t], i);
                    }
                  },
                  this,
                ),
                this.node.on("INIT_MINE_SECTION_POINT", this._setMineSectionPoint, this),
                this.node.on(
                  "SET_DIY_POINTS",
                  function () {
                    var e = MJ.GameLogic.DiyModel,
                      t = e.diyInfos;
                    if (t.stBalanceInfo)
                      for (var i = 0; i < t.stBalanceInfo.length; i++) {
                        var a = t.stBalanceInfo[i],
                          o = a.iUserID,
                          n = a.iPoint + t.iDaPianPoint,
                          s = MJ.GameLogic.PlayerModel.getViewSeatIdByUserID(o);
                        this._setMatchPoints(s, n);
                      }
                    else {
                      var r = 0;
                      e.isUsingRules([g_tConst.RuleCfgs.RuleDa40Pian.id])
                        ? (r = 40)
                        : e.isUsingRules([g_tConst.RuleCfgs.RuleDa50Pian.id])
                          ? (r = 50)
                          : e.isUsingRules([g_tConst.RuleCfgs.RuleDa60Pian.id]) && (r = 60);
                      for (
                        var c = g_tConst.GameConfig.ViewSeat.SeatMine;
                        c <= g_tConst.GameConfig.ViewSeat.SeatRight;
                        c++
                      )
                        this._setMatchPoints(c, r);
                    }
                  },
                  this,
                ),
                this.node.on(
                  "TRUSTEE_CHANGE",
                  function (e) {
                    var t = e,
                      i = t.nViewSeatId,
                      a = t.isTrustee;
                    this._setTrustee(i, a);
                  },
                  this,
                ),
                this.node.on(
                  "NET_ERROR_CHANGE",
                  function (e) {
                    var t = e,
                      i = t.nViewSeatId,
                      a = t.isNetError;
                    this._setNetError(i, a);
                  },
                  this,
                ),
                this.node.on(
                  "HIDE_USER_NICKNAME",
                  function () {
                    var e = g_tConst.GameConfig.ViewSeat;
                    for (var t in e) this._hideUserNickName(e[t]);
                  },
                  this,
                ),
                this.node.on("CHAT_FACE_SHOW", this.showFaceAnim, this),
                this.node.on("SHOW_USER_CHAT_YUYIN_BUBLE", this.showYuyinBubble, this),
                this.node.on("CLEAR_USER_CHAT_YUYIN_BUBLE", this.clearYuyinBubble, this),
                this.node.on("INTERACTIVE_ANIM_SHOW", this.showInteractiveAnim, this),
                this.node.on("SHOW_USERINOF_LAYER_AUTHORIZE", this.showAuthorize, this),
                this.node.on("SHOW_BASE_INFO_LAYER", this.showBaseInfoLayer, this),
                this.node.on("ANIM_HU_PROTECTGIFT", this.showProtectGiftAnim, this),
                this.node.on("UPDATE_HEAD_PROTECTEFFECT", this.updateProtectEffect, this),
                this.node.on("INIT_HEAD_PROTECTEFFECT", this.initProtectEffect, this),
                this.node.on("SET_USERINFO_FIRE", this.setUserInfoFire, this),
                this.node.on("SHOW_GROW_FAN_NUM", this.showGrowFanNum, this),
                this.node.on("HIDE_GROW_FAN_NUM", this.hideGrowFanNum, this),
                this.node.on("HIDE_ALL_GROW_FAN_NUM", this.hideAllGrowFanNum, this));
            },
            showBaseInfoLayer: function (e) {
              ((this.node.opacity = e ? 255 : 0),
                g_oExLayerManager.emitEvent2GameLayer(
                  g_tConst.GameExLayerCfg.chatTxtShow.id,
                  "SHOW_CHAT_LAYER",
                  e,
                ));
            },
            onMessageEvent: function () {
              var e = this;
              (this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.PLAT_EVENT_NOTIFY_MY_SECTION_INFO,
                  function () {
                    if (g_oData.get(g_tData.SectionMatchMod).isSectionMatchState) {
                      var t = g_oData.get(g_tData.SectionMatchMod).getMySectionInfo();
                      e._setMineSectionPoint(t.star);
                    }
                  },
                  this,
                ),
              ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.PLAT_EVENT_SECTION_UPDATE_POINT,
                    this._setMineSectionPoint,
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.USER_UPDATE_HEAD_FRAME,
                    function () {
                      this._updateGuardTimes();
                    },
                    this,
                  ),
                ));
            },
            _updateGuardTimes: function () {
              var e = this,
                t = MJ.GameLogic.PlayerModel.getPlayerAllOtherInfo();
              t &&
                t.forEach(function (t) {
                  if (null != t.seatID) {
                    var i = MJ.GameLogic.PlayerModel.getViewSeatId(t.seatID);
                    e._tUserNodes[i] && e._tUserNodes[i].emit("SET_GUARD_TIMES", t);
                  }
                });
            },
            _updateBanker: function (e) {
              var t = this;
              this.userInfoLeagueMatchNodeComponent.updateBanker(e);
              var i = function (e, i, a) {
                  t._tUserNodes[e] && t._tUserNodes[e].emit(i, a);
                },
                a = e.data;
              isNull(e.typeId)
                ? i(a, "SET_BANKER_TAG")
                : i(a, "SET_BANKER_TAG", { typeId: e.typeId });
            },
            _setMJMPath: function () {
              var e = g_tConst.GameConfig.ViewSeat;
              for (var t in e) {
                var i = MJ.GameLogic.PlayerModel.getPlayerInfoByViewID(e[t]);
                if (i) {
                  var a = MJ.GameLogic.PlayerModel.getPlayerOtherInfoByUserId(i.userID);
                  if (a) {
                    var o = a.userMJMasterPathLv;
                    this._setPlayerMjPathLv(i.viewSeatID, o);
                  }
                }
              }
            },
            _updateTeammate: function (e) {
              var t, i;
              ((t = e.data),
                (i = { isShow: !0 }),
                this._tUserNodes[t] && this._tUserNodes[t].emit("SET_TEAMMATE_TAG", i));
            },
            _addUserTag: function (e) {
              this.userInfoLeagueMatchNodeComponent.addUserTag(e);
              var t = e.nViewSeatId,
                i = e.nUserTag;
              e.isNeedAnim
                ? this._playUserTagAnim(t, i)
                : this._tUserNodes[t] && this._tUserNodes[t].emit("ADD_USER_TAG", e);
            },
            _updateUserTag: function (e) {
              this.userInfoLeagueMatchNodeComponent.updateUserTag(e);
              var t = e.nViewSeatId;
              this._tUserNodes[t] && this._tUserNodes[t].emit("UPDATE_USER_TAG", e);
            },
            _getUserTagPostion: function (e, t) {
              return this._tUserNodes[e]
                ? this._tUserNodes[e].getComponent("UserInfoNode").getUserTagPosition(t)
                : cc.v2(0, 0);
            },
            _playUserTagAnim: function (e, t) {
              ((this.spriteDisplayBigTag[e].node.active = !0),
                (this.spriteDisplayBigTag[e].spriteFrame = this._getDisplaySF(t)));
              var i = this.spriteDisplayBigTag[e].node.position,
                a = this.spriteDisplayBigTag[e].node.scale,
                o = this._getUserTagPostion(e, t);
              (MJ.GameLogic.TableModel.IsLeagueRoom() &&
                (o = this.node.convertToWorldSpaceAR(this.leagueUserNode[e].position)),
                Log.info(
                  "UserInfoLayer _playUserTagAnim start anime " +
                    e +
                    " " +
                    t +
                    " " +
                    this.spriteDisplayBigTag[e].node.uuid,
                ),
                g_oAudioManager.play(g_tAsset.EffectSound.dingque));
              var n = cc.sequence(
                cc.scaleTo(0.2, 1.2),
                cc.scaleTo(0.2, 1),
                cc.delayTime(0.5),
                cc.spawn(
                  cc.moveTo(0.5, this.nodeBigTagBg.convertToNodeSpaceAR(o)),
                  cc.scaleTo(0.5, 0.3),
                ),
                cc.callFunc(function () {
                  (Log.info(
                    "UserInfoLayer _playUserTagAnim end anime " +
                      e +
                      " " +
                      t +
                      " " +
                      this.spriteDisplayBigTag[e].node.uuid,
                  ),
                    (this.spriteDisplayBigTag[e].node.active = !1),
                    (this.spriteDisplayBigTag[e].node.scale = a),
                    (this.spriteDisplayBigTag[e].node.position = i),
                    this._tUserNodes[e] &&
                      this._tUserNodes[e].emit("ADD_USER_TAG", { nUserTag: t }));
                }, this),
              );
              (this.spriteDisplayBigTag[e].node.stopAllActions(),
                this.spriteDisplayBigTag[e].node.runAction(n.easing(cc.easeSineInOut())));
            },
            _getDisplaySF: function (e) {
              return this.UserInfoAtlas.getSpriteFrame("img_Display_" + e);
            },
            _setMatchPoints: function (e, t) {
              var i = this._tUserNodes[e];
              i && i.emit("SET_PLAYER_POINT", { sPoint: "\u79ef\u5206:" + t });
            },
            _setPlayerBattlePoint: function (e, t) {
              var i = this._tUserNodes[e];
              i && i.emit("SET_PLAYER_BATTLE_POINT", { sBattlePoint: t });
            },
            _setPlayerScore: function (e, t) {
              var a = MJ.GameLogic.TableModel.isZCoinRoom(),
                o = this._tUserNodes[e];
              if (o) {
                var n = "",
                  s = g_oData.get(g_tData.DianFengSaiMod).getDianFengSaiRatio(),
                  r =
                    t >= 0
                      ? i.translateCoinStr(i.initProCoin(i.Long2Number(t)), {
                          special: !0,
                          unitRange: g_tConst.GameUnit.UserIconNormal,
                        })
                      : "0",
                  c =
                    t >= 0
                      ? i.translateCoinStr(i.initProCoin(Math.floor(i.Long2Number(t) / s)), {
                          special: !0,
                          unitRange: g_tConst.GameUnit.UserIconNormal,
                        })
                      : "0",
                  l = {};
                (a
                  ? ((n = "SET_PLAYER_ZCOIN"), (l.sZCoin = r), (l.sDCoin = c))
                  : ((n = "SET_PLAYER_COIN"), (l.sCoin = r)),
                  o.emit(n, l));
              }
            },
            _setPlayerMjPathLv: function (e, t) {
              var i = this._tUserNodes[e];
              i && i.emit("SET_MJ_PATH_LV", t);
            },
            _setPlayerMjPathFakeLv: function (e, t) {
              var i = this._tUserNodes[e];
              i && i.emit("SET_MJ_PATH_LV_FAKE", t);
            },
            _closePlayerMjPathLv: function (e) {
              var t = this._tUserNodes[e];
              t && t.emit("CLOSE_MJ_PATH_LV");
            },
            _setMatchScore: function (e, t) {
              var a = this._tUserNodes[e];
              a &&
                a.emit("SET_PLAYER_MATCH_POINT", {
                  sMatchScore: (t >= 0 ? "" : "-") + i.translateCoinStr(Math.abs(t)),
                });
            },
            _setCounterNum: function (e, t) {
              var i = this._tUserNodes[e];
              i && i.emit("SET_PLAYER_COUNTER_NUM", { sCounterNum: t });
            },
            _setZCoinNum: function (e, t) {
              this.userInfoLeagueMatchNodeComponent.setZCoinNum(e, t);
              var a = this._tUserNodes[e];
              if (a) {
                var o = g_oData.get(g_tData.DianFengSaiMod).getDianFengSaiRatio();
                a.emit("SET_PLAYER_ZCOIN", {
                  sZCoin:
                    t >= 0
                      ? i.translateCoinStr(i.initProCoin(i.Long2Number(t)), {
                          special: !0,
                          unitRange: g_tConst.GameUnit.UserIconNormal,
                        })
                      : "0",
                  sDCoin:
                    t >= 0
                      ? i.translateCoinStr(i.initProCoin(Math.floor(i.Long2Number(t) / o)), {
                          special: !0,
                          unitRange: g_tConst.GameUnit.UserIconNormal,
                        })
                      : "0",
                });
              }
            },
            _hideUserNickName: function (e) {
              var t = this._tUserNodes[e];
              t && t.emit("HIDE_PLAYER_NICKNAME");
            },
            _setMineSectionPoint: function (e) {
              var t = this._tUserNodes[g_tConst.GameConfig.ViewSeat.SeatMine];
              t && t.emit("SET_PLAYER_SECTION_POINT", { nPoint: i.translateCoinStr(e) });
            },
            _updatePlayerInfo: function (e) {
              if (MJ.GameLogic.TableModel.IsLeagueRoom()) {
                var t = 0,
                  i = [];
                for (var a in e)
                  if (e.hasOwnProperty(a)) {
                    var o = { iSeatID: e[a].seatID, iUserID: a };
                    (i.push(o), (t += 1));
                  }
                if (4 == t) {
                  (MJ.GameLogic.PlayerModel.changeSeat(i),
                    this.userInfoLeagueMatchNodeComponent.leagueChangeSeat());
                  var n = { stUserSeat: i };
                  MJ.GameViewHandler.nodeCountDown.emit(g_tEvent.LEAGUE_CHANGE_SEAT, n);
                }
              }
              for (var s in e)
                if (e.hasOwnProperty(s)) {
                  var r = e[s],
                    c = r.viewSeatID;
                  ("number" != typeof c && (c = MJ.GameLogic.PlayerModel.getViewSeatId(r.seatID)),
                    this._tUserNodes[c] || this._addPlayerNode(c));
                  var l = this._tUserNodes[c];
                  (l.emit("SET_PLAYER_HEAD", {
                    sHeadUrl: r.picUrl2 || r.headUrl,
                    userID: r.userID,
                  }),
                    l.emit("SET_PLAYER_NICKNAME", { Nickname: r.nickName }),
                    l.emit("SET_VIEW_SEAT_ID", { nViewSeatId: c, nUserId: s }),
                    MJ.GameLogic.TableModel.IsBattleRoom() &&
                      c === MJ.GameLogic.PlayerModel.memberVSeatId &&
                      l.emit("SET_TEAMMATE_TAG", { isShow: !0 }),
                    r.userID >= 0 && l.emit("SET_HEAD_FRAME", { useIds: r.useIds }));
                }
            },
            _onUserModifyInfo: function (e) {
              var t = e.iSeatID,
                i = e.nickName,
                a = e.picUrl,
                o = e.picUrl2,
                n = MJ.GameLogic.PlayerModel.getViewSeatId(t),
                s = this._tUserNodes[n];
              s
                ? ((o || a) && s.emit("SET_PLAYER_HEAD", { sHeadUrl: o || a }),
                  i && s.emit("SET_PLAYER_NICKNAME", { Nickname: i }))
                : Log.error(
                    "BIRD\ud83d\ude21>>>",
                    "UserInfoLayer.js",
                    "iSeatID " + t + " \u7684\u7528\u6237\u4e0d\u5b58\u5728",
                  );
            },
            _addPlayerNode: function (e) {
              var t = g_oPrefabLoader.instantiate(this.prefabUserNode, this.node);
              if ((t.emit("SET_DIRECTION", { direction: e }), cc.isValid(this.nodeUserView[e]))) {
                var i = this.nodeUserView[e];
                ((t.position = cc.v2(0, 0)), (t.parent = i), (i.active = !0));
              }
              this._tUserNodes[e] = t;
            },
            _delPayerNode: function (e) {
              (this.userInfoLeagueMatchNodeComponent.delPayerNode(e),
                this._tUserNodes[e] &&
                  (this._tUserNodes[e].destroy(), (this._tUserNodes[e] = void 0)));
            },
            __resetNode: function (e) {
              this._tUserNodes[e] && this._tUserNodes[e].emit("RESET_USERNODE");
            },
            _setTrustee: function (e, t) {
              this._tUserNodes[e] && this._tUserNodes[e].emit("SET_TRUSTEE", { isTrustee: t });
            },
            _setNetError: function (e, t) {
              this._tUserNodes[e] && this._tUserNodes[e].emit("SET_NET_ERROR", { isNetError: t });
            },
            testShowUser: function () {
              for (var e = 0; e < this.nodeUserView.length; e++) {
                var t = g_oPrefabLoader.instantiate(this.prefabUserNode, this.node);
                (t.emit("SET_DIRECTION", { direction: e }),
                  (t.position = this.nodeUserView[e].position));
              }
            },
            showFaceAnim: function (e) {
              var t = e.nViewSeatId,
                i = e.sMsgStr.split(g_tConst.ChatConfig.STR_CHAT_FACE)[1],
                a = (Number(i) + 1) / 2 - 1;
              this.loadAnim(a, t);
            },
            showYuyinBubble: function (e) {
              var t = e.time,
                i = e.VSid,
                a = this._tUserNodes[i];
              a && a.emit("SHOW_YUYIN_BUBBLE", { time: t });
            },
            clearYuyinBubble: function (e) {
              var t = e.VSid,
                i = this._tUserNodes[t];
              i && i.emit("CLEAR_YUYIN_BUBBLE");
            },
            showInteractiveAnim: function (e) {
              var t = this,
                i = (e.nFromUserId, e.nInteractiveAnimId),
                a = (e.sFromNickName, e.nPubToUserID, e.nFromViewSeatId),
                o = e.nPubViewSeatId,
                n = this._tUserNodes[a].position,
                s = this._tUserNodes[o].position;
              (g_tConst.GameConfig.InteractiveAnimId,
                (n = this.node.convertToWorldSpaceAR(this.nodeUserView[a].position)),
                (n = this.node.convertToNodeSpaceAR(n)),
                (s = this.node.convertToWorldSpaceAR(this.nodeUserView[o].position)),
                (s = this.node.convertToNodeSpaceAR(s)),
                i === g_tConst.Exp.Normal[0]
                  ? this.playLengShuiAnim(n, s, a, o)
                  : i === g_tConst.Exp.Normal[1]
                    ? this.playFangQieAnim(n, s, a, o)
                    : i === g_tConst.Exp.Normal[2]
                      ? this.playChaShuiAnim(n, s, a, o)
                      : i === g_tConst.Exp.Normal[3]
                        ? this.playMeiGuiAnim(n, s, a, o)
                        : i === g_tConst.Exp.Normal[4]
                          ? this.playZuanShiAnim(n, s, a, o)
                          : i === g_tConst.Exp.Normal[5]
                            ? this.playBeiKe(n, s, a, o)
                            : i === g_tConst.Exp.Normal[6]
                              ? this.playZhangYu(n, s, a, o)
                              : i === g_tConst.Exp.Normal[7]
                                ? this.playSiShen(n, s, a, o)
                                : i === g_tConst.Exp.Normal[8]
                                  ? this.playAiShen(n, s, a, o)
                                  : -1 != g_tConst.Exp.Normal.indexOf(i)
                                    ? this.playEmojiAnim(
                                        n,
                                        s,
                                        a,
                                        o,
                                        null,
                                        g_tConst.Exp.Normal.indexOf(i),
                                      )
                                    : i === g_tConst.Exp.Makabaka[0]
                                      ? this.schedule(
                                          function () {
                                            t.playLengShuiAnim(n, s, a, o, { isMakabaka: !0 });
                                          },
                                          g_tConst.MakabakaConfig.ExpInterval,
                                          g_tConst.MakabakaConfig.ExpRepeatTime,
                                          g_tConst.MakabakaConfig.ExpStartDelay,
                                        )
                                      : i === g_tConst.Exp.Makabaka[1]
                                        ? this.schedule(
                                            function () {
                                              t.playFangQieAnim(n, s, a, o, { isMakabaka: !0 });
                                            },
                                            g_tConst.MakabakaConfig.ExpInterval,
                                            g_tConst.MakabakaConfig.ExpRepeatTime,
                                            g_tConst.MakabakaConfig.ExpStartDelay,
                                          )
                                        : i === g_tConst.Exp.Makabaka[2]
                                          ? this.schedule(
                                              function () {
                                                t.playChaShuiAnim(n, s, a, o, { isMakabaka: !0 });
                                              },
                                              g_tConst.MakabakaConfig.ExpInterval,
                                              g_tConst.MakabakaConfig.ExpRepeatTime,
                                              g_tConst.MakabakaConfig.ExpStartDelay,
                                            )
                                          : i === g_tConst.Exp.Makabaka[3]
                                            ? this.schedule(
                                                function () {
                                                  t.playMeiGuiAnim(n, s, a, o, { isMakabaka: !0 });
                                                },
                                                g_tConst.MakabakaConfig.ExpInterval,
                                                g_tConst.MakabakaConfig.ExpRepeatTime,
                                                g_tConst.MakabakaConfig.ExpStartDelay,
                                              )
                                            : i === g_tConst.Exp.Makabaka[4]
                                              ? this.schedule(
                                                  function () {
                                                    t.playZuanShiAnim(n, s, a, o, {
                                                      isMakabaka: !0,
                                                    });
                                                  },
                                                  g_tConst.MakabakaConfig.ExpInterval,
                                                  g_tConst.MakabakaConfig.ExpRepeatTime,
                                                  g_tConst.MakabakaConfig.ExpStartDelay,
                                                )
                                              : i === g_tConst.Exp.Makabaka[5]
                                                ? this.schedule(
                                                    function () {
                                                      t.playBeiKe(n, s, a, o, { isMakabaka: !0 });
                                                    },
                                                    g_tConst.MakabakaConfig.ExpInterval,
                                                    g_tConst.MakabakaConfig.ExpRepeatTime,
                                                    g_tConst.MakabakaConfig.ExpStartDelay,
                                                  )
                                                : i === g_tConst.Exp.Makabaka[6]
                                                  ? this.schedule(
                                                      function () {
                                                        t.playZhangYu(n, s, a, o, {
                                                          isMakabaka: !0,
                                                        });
                                                      },
                                                      g_tConst.MakabakaConfig.ExpInterval,
                                                      g_tConst.MakabakaConfig.ExpRepeatTime,
                                                      g_tConst.MakabakaConfig.ExpStartDelay,
                                                    )
                                                  : i === g_tConst.Exp.Makabaka[7]
                                                    ? this.schedule(
                                                        function () {
                                                          t.playSiShen(n, s, a, o, {
                                                            isMakabaka: !0,
                                                          });
                                                        },
                                                        g_tConst.MakabakaConfig.ExpInterval,
                                                        g_tConst.MakabakaConfig.ExpRepeatTime,
                                                        g_tConst.MakabakaConfig.ExpStartDelay,
                                                      )
                                                    : i === g_tConst.Exp.Makabaka[8]
                                                      ? this.schedule(
                                                          function () {
                                                            t.playAiShen(n, s, a, o, {
                                                              isMakabaka: !0,
                                                            });
                                                          },
                                                          g_tConst.MakabakaConfig.ExpInterval,
                                                          g_tConst.MakabakaConfig.ExpRepeatTime,
                                                          g_tConst.MakabakaConfig.ExpStartDelay,
                                                        )
                                                      : -1 != g_tConst.Exp.Makabaka.indexOf(i) &&
                                                        this.playEmojiAnim(
                                                          n,
                                                          s,
                                                          a,
                                                          o,
                                                          { initCount: 10 },
                                                          g_tConst.Exp.Makabaka.indexOf(i),
                                                        ));
            },
            playLengShuiAnim: function (e, t, i, a, o) {
              var n = this;
              void 0 === o && (o = null);
              var s = function (i) {
                  var s = i;
                  ((s.scale = 0.7), (s.position = cc.v2(e.x, e.y + 17)), n.node.addChild(s));
                  var r = s.getComponent(cc.Animation);
                  r.on("stop", function () {
                    s.destroy();
                  });
                  var c = cc.callFunc(function () {
                    var e = r.play("lengshui_animation");
                    ((e.wrapMode = cc.WrapMode.Normal),
                      (e.speed = 1),
                      g_oAudioManager.play(g_tAsset.interactiveAudioList[0]));
                  }, n);
                  (null !== o && void 0 !== o.isMakabaka && o.isMakabaka,
                    a === g_tConst.GameConfig.ViewSeat.SeatRight && (s.scaleX = -s.scaleX),
                    s.runAction(
                      cc.sequence(
                        cc.delayTime(0.2),
                        cc.jumpTo(0.5, cc.v2(t.x, t.y - 10), 30, 1).easing(cc.easeIn(2.5)),
                        c,
                      ),
                    ));
                },
                r = g_tAsset.interactiveAnimList[0];
              g_oPrefabLoader.loadRes(r, null, function (e) {
                s(e);
              });
            },
            playFangQieAnim: function (e, t, i, a, o) {
              var n = this;
              void 0 === o && (o = null);
              var s = function (i) {
                  var a = i;
                  ((a.scale = 0.7), (a.position = cc.v2(e.x, e.y + 17)), n.node.addChild(a));
                  var o = a.getComponent(cc.Animation);
                  o.on("stop", function () {
                    a.destroy();
                  });
                  var s = cc.callFunc(function () {
                    ((o.play("fanqie_animation").wrapMode = cc.WrapMode.Normal),
                      g_oAudioManager.play(g_tAsset.interactiveAudioList[1]));
                  }, n);
                  a.runAction(
                    cc.sequence(
                      cc.delayTime(0.2),
                      cc.jumpTo(0.5, cc.v2(t.x, t.y + 15), 30, 1).easing(cc.easeIn(4)),
                      s,
                    ),
                  );
                },
                r = g_tAsset.interactiveAnimList[1];
              g_oPrefabLoader.loadRes(r, null, function (e) {
                s(e);
              });
            },
            playChaShuiAnim: function (e, t, i, a, o) {
              var n = this;
              void 0 === o && (o = null);
              var s = function (i) {
                  var s = i;
                  ((s.scale = 1), (s.position = cc.v2(e.x, e.y + 17)), n.node.addChild(s));
                  var r = s.getComponent(cc.Animation);
                  r.on("stop", function () {
                    s.destroy();
                  });
                  var c = cc.callFunc(function () {
                    var e = r.play("chahu_animation");
                    ((e.wrapMode = cc.WrapMode.Normal),
                      (e.speed = 1),
                      g_oAudioManager.play(g_tAsset.interactiveAudioList[2]));
                  }, n);
                  (a === g_tConst.GameConfig.ViewSeat.SeatRight && (s.scaleX = -s.scaleX),
                    null !== o && void 0 !== o.isMakabaka && o.isMakabaka,
                    s.runAction(
                      cc.sequence(
                        cc.delayTime(0.2),
                        cc.jumpTo(0.4, cc.v2(t.x, t.y + 0), 30, 1).easing(cc.easeIn(3)),
                        c,
                      ),
                    ));
                },
                r = g_tAsset.interactiveAnimList[2];
              g_oPrefabLoader.loadRes(r, null, function (e) {
                s(e);
              });
            },
            playMeiGuiAnim: function (e, t, i, a, o) {
              var n = this;
              void 0 === o && (o = null);
              var s = function (i) {
                  var a = i;
                  ((a.scale = 1), (a.position = cc.v2(e.x, e.y + 17)), n.node.addChild(a));
                  var s = a.getComponent(cc.Animation);
                  s.on("stop", function () {
                    a.destroy();
                  });
                  var r = cc.callFunc(function () {
                    ((s.play("meigui_animation").wrapMode = cc.WrapMode.Normal),
                      g_oAudioManager.play(g_tAsset.interactiveAudioList[3]));
                  }, n);
                  (null !== o && void 0 !== o.isMakabaka && o.isMakabaka,
                    a.runAction(
                      cc.sequence(
                        cc.delayTime(0.2),
                        cc.jumpTo(0.4, cc.v2(t.x, t.y + 25), 30, 1).easing(cc.easeIn(3)),
                        r,
                      ),
                    ));
                },
                r = g_tAsset.interactiveAnimList[3];
              g_oPrefabLoader.loadRes(r, null, function (e) {
                s(e);
              });
            },
            playZuanShiAnim: function (e, t, i, a, o) {
              var n = this;
              void 0 === o && (o = null);
              var s = function (i) {
                  var a = i;
                  ((a.scale = 1), (a.position = cc.v2(e.x, e.y + 17)), n.node.addChild(a));
                  var o = a.getComponent(cc.Animation);
                  o.on("stop", function () {
                    a.destroy();
                  });
                  var s = cc.callFunc(function () {
                    var e = o.play("zuanshi_animation");
                    ((e.wrapMode = cc.WrapMode.Normal),
                      (e.speed = 1),
                      g_oAudioManager.play(g_tAsset.interactiveAudioList[4]));
                  }, n);
                  a.runAction(
                    cc.sequence(
                      cc.delayTime(0.2),
                      cc.jumpTo(0.4, cc.v2(t.x, t.y - 20), 30, 1).easing(cc.easeIn(3)),
                      s,
                    ),
                  );
                },
                r = g_tAsset.interactiveAnimList[4];
              g_oPrefabLoader.loadRes(r, null, function (e) {
                s(e);
              });
            },
            playBeiKe: function (e, t, i, a, o) {
              var n = this;
              void 0 === o && (o = null);
              var s = function (i) {
                  var a = i.getChildByName("node_ani");
                  ((a.scale = 1),
                    (a.position = cc.v2(e.x, e.y + 10)),
                    n.node.addChild(i),
                    n.scheduleOnce(function () {
                      cc.tween(a)
                        .to(0.4, { x: t.x, y: t.y + 10 })
                        .call(function () {
                          (g_oAudioManager.play(g_tAsset.interactiveAudioList[5]),
                            a.getComponent(sp.Skeleton).setAnimation(0, "animation", !1));
                        })
                        .start();
                    }, 0),
                    a.getComponent(sp.Skeleton).setCompleteListener(function () {
                      i.destroy();
                    }));
                },
                r = g_tAsset.interactiveAnimList[5];
              g_oPrefabLoader.loadRes(r, null, function (e) {
                s(e);
              });
            },
            playZhangYu: function (e, t, i, a, o) {
              var n = this;
              void 0 === o && (o = null);
              var s = function (i) {
                  var o = i.getChildByName("node_ani");
                  i.setScale(1, 1, 1);
                  var s = {};
                  (a === g_tConst.GameConfig.ViewSeat.SeatRight
                    ? (i.setScale(-1, 1, 1), (s.x = t.x), (s.y = t.y + 17))
                    : ((s.x = t.x), (s.y = t.y + 17)),
                    (i.position = cc.v2(e.x, e.y + 17)),
                    n.node.addChild(i),
                    o.getComponent(sp.Skeleton).setToSetupPose(),
                    n.scheduleOnce(function () {
                      cc.tween(i)
                        .to(0.4, { x: s.x, y: s.y })
                        .call(function () {
                          (n.scheduleOnce(function () {
                            g_oAudioManager.play(g_tAsset.interactiveAudioList[6] + "1");
                          }, 0.3),
                            n.scheduleOnce(function () {
                              g_oAudioManager.play(g_tAsset.interactiveAudioList[6] + "2");
                            }, 0.85),
                            o.getComponent(sp.Skeleton).setAnimation(0, "animation", !1));
                        })
                        .start();
                    }, 0),
                    o.getComponent(sp.Skeleton).setCompleteListener(function () {
                      i.destroy();
                    }));
                },
                r = g_tAsset.interactiveAnimList[6];
              g_oPrefabLoader.loadRes(r, null, function (e) {
                s(e);
              });
            },
            playSiShen: function (e, t, i, a, o) {
              var n = this;
              void 0 === o && (o = null);
              var s = function (i) {
                  var o = i.getChildByName("node_ani");
                  i.setScale(1, 1, 1);
                  var s = {};
                  (a === g_tConst.GameConfig.ViewSeat.SeatRight
                    ? (i.setScale(-1, 1, 1), (s.x = t.x), (s.y = t.y + 17))
                    : ((s.x = t.x), (s.y = t.y + 17)),
                    (i.position = cc.v2(e.x, e.y + 17)),
                    n.node.addChild(i),
                    n.scheduleOnce(function () {
                      cc.tween(i)
                        .to(0.4, { x: s.x, y: s.y })
                        .call(function () {
                          (n.scheduleOnce(function () {
                            g_oAudioManager.play(g_tAsset.interactiveAudioList[7]);
                          }, 0.4),
                            o.getComponent(sp.Skeleton).setAnimation(0, "animation", !1));
                        })
                        .start();
                    }, 0),
                    o.getComponent(sp.Skeleton).setCompleteListener(function () {
                      i.destroy();
                    }));
                },
                r = g_tAsset.interactiveAnimList[7];
              g_oPrefabLoader.loadRes(r, null, function (e) {
                s(e);
              });
            },
            playAiShen: function (e, t, i, a, o) {
              var n = this;
              void 0 === o && (o = null);
              var s = function (i) {
                  var o = i.getChildByName("node_ani");
                  i.setScale(1, 1, 1);
                  var s = {};
                  (a === g_tConst.GameConfig.ViewSeat.SeatRight
                    ? (i.setScale(-1, 1, 1), (s.x = t.x), (s.y = t.y + 17))
                    : ((s.x = t.x), (s.y = t.y + 17)),
                    (i.position = cc.v2(e.x, e.y + 17)),
                    n.node.addChild(i),
                    n.scheduleOnce(function () {
                      cc.tween(i)
                        .to(0.4, { x: s.x, y: s.y })
                        .call(function () {
                          (n.scheduleOnce(function () {
                            g_oAudioManager.play(g_tAsset.interactiveAudioList[8] + "1");
                          }, 0.4),
                            n.scheduleOnce(function () {
                              g_oAudioManager.play(g_tAsset.interactiveAudioList[8] + "2");
                            }, 1.2),
                            o.getComponent(sp.Skeleton).setAnimation(0, "animation", !1));
                        })
                        .start();
                    }, 0),
                    o.getComponent(sp.Skeleton).setCompleteListener(function () {
                      i.destroy();
                    }));
                },
                r = g_tAsset.interactiveAnimList[8];
              g_oPrefabLoader.loadRes(r, null, function (e) {
                s(e);
              });
            },
            playEmojiAnim: function (e, t, i, a, o, n) {
              var s = this;
              void 0 === o && (o = null);
              var r = {
                  startPos: e,
                  endPos: t,
                  nFromViewSeatId: i,
                  nPubViewSeatId: a,
                  extraData: o,
                  audioUrl: g_tAsset.interactiveAudioList[n],
                  playEndCb: function (e) {
                    e.destroy();
                  },
                },
                c = g_tAsset.interactiveAnimList[n];
              g_oPrefabLoader.loadRes(c, null, function (e) {
                (s.node.addChild(e),
                  e.getComponent(cc.Component) &&
                    e.getComponent(cc.Component).play &&
                    e.getComponent(cc.Component).play(r));
              });
            },
            getnViewSeatIdOffset: function (e) {
              var t = 0;
              return (
                0 === e || 1 === e ? (t = 150) : 2 === e ? (t = -100) : 3 === e && (t = -140),
                cc.v2(t, 0)
              );
            },
            loadAnim: function (e, t) {
              var i = this,
                a = this.getnViewSeatIdOffset(t),
                o = a.x,
                n = a.y;
              Log.info("loadAnim", "chat_{0}".format(e), e);
              var s = g_tAsset.chatFaceAnimsList[e];
              g_oPrefabLoader.loadRes(s, null, function (e) {
                var a = e;
                ((a.position = cc.v2(o, n)),
                  i._tUserNodes[t].addChild(a),
                  a.getComponent(cc.Animation).play());
                var s = cc.sequence(cc.delayTime(2.5), cc.fadeOut(0.5));
                a.runAction(s);
              });
            },
            showAuthorize: function () {
              var e = g_oData.get(g_tData.UserLocalModel).getData("lastIsAuthorized", !1),
                t = g_oData.get(g_tData.UserLocalModel).getData("HasUserCancleAuthorize", !1);
              !MJ.GameLogic.TableModel.IsDiyRoom() ||
                e ||
                t ||
                MJ.GameLogic.isPlayBack ||
                g_oPrefabLoader.instantiate(this.prefabAuthorize, this.node);
            },
            updateNodeUserViewLayout: function () {
              var e = g_oData.get(g_tData.LiveGameModel).isLivePlayer(),
                t = this.nodeUserView[0].getComponent(cc.Widget),
                i = this.nodeUserView[1].getComponent(cc.Widget),
                a = this.nodeUserView[3].getComponent(cc.Widget);
              e
                ? ((t.bottom = 270), (i.top = 250), (a.top = 250))
                : ((t.bottom = 214), (i.top = 300), (a.top = 300));
            },
            updateBigTagLayout: function () {
              var e = g_oData.get(g_tData.LiveGameModel).isLivePlayer();
              this.spriteDisplayBigTag[0].node.position = e ? cc.v2(0, -92) : cc.v2(0, -152);
            },
            showProtectGiftAnim: function (e) {
              var t = e.nViewSeatId;
              cc.isValid(this.nodeUserView[t]) &&
                0 == this.protectGiftEffect[t].childrenCount &&
                g_oPrefabLoader.loadRes(
                  g_tAsset.ProtectGiftSmallAnglePrefab,
                  this.protectGiftEffect[t],
                  function (e) {
                    e &&
                      setTimeout(function () {
                        e.destroy();
                      }, 1e3 * g_tConst.OrderedAnimType.ProtectSmallAngle.time);
                  },
                );
            },
            updateProtectEffect: function (e) {
              var t = this,
                i = e.tMsg;
              MJ &&
                MJ.GameLogic &&
                MJ.GameLogic._playerModel &&
                i.forEach(function (e) {
                  var i = MJ.GameLogic._playerModel.getViewSeatIdByUserID(e.userId),
                    a = t._tUserNodes[i];
                  a && a.emit("SET_HEAD_PROTECT_EFFECT", { isShow: e.count > 0 });
                });
            },
            initProtectEffect: function () {
              MJ &&
                MJ.GameLogic &&
                MJ.GameLogic._playerModel &&
                this._tUserNodes.forEach(function (e) {
                  e && e.emit("SET_HEAD_PROTECT_EFFECT", { isShow: !1 });
                });
            },
            setUserInfoFire: function (e) {
              var t = e.nViewSeatId,
                i = this._tUserNodes[t];
              i && i.emit("SET_FIRE_ACTIVE", e.isActive);
            },
            showGrowFanNum: function (e) {
              var t = e.nViewSeatId;
              this._tUserNodes[t] && this._tUserNodes[t].emit("SHOW_GROW_FAN_NUM", e);
            },
            hideGrowFanNum: function (e) {
              var t = e.nViewSeatId;
              this._tUserNodes[t] &&
                cc.isValid(this._tUserNodes[t]) &&
                this._tUserNodes[t].emit("HIDE_GROW_FAN_NUM");
            },
            hideAllGrowFanNum: function () {
              this._tUserNodes.forEach(function (e) {
                cc.isValid(e) && e.emit("HIDE_GROW_FAN_NUM");
              });
            },
          }),
          cc._RF.pop());
      },
      {
        CommonUtils: "CommonUtils",
        UserInfoYuyinManger: "UserInfoYuyinManger",
        gameYuyinAudioMgr: "gameYuyinAudioMgr",
      },
    ],
