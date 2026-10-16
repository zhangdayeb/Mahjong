    UserInfoNode: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "49b95b8DQNLHqb89L00GfqU", "UserInfoNode");
        var i = e("Direction"),
          a = e("CommonUtils"),
          o = e("gameYuyinAudioMgr");
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            spriteHead: { default: null, type: cc.Sprite, tooltip: "\u73a9\u5bb6\u5934\u50cf" },
            spriteHeadFrame: {
              default: null,
              type: cc.Sprite,
              tooltip: "\u73a9\u5bb6\u5934\u6846",
            },
            MaCardHeadFrame: cc.Sprite,
            labelNickName: { default: null, type: cc.Label, tooltip: "\u73a9\u5bb6\u6635\u79f0" },
            labelCoin: { default: null, type: cc.Label, tooltip: "\u73a9\u5bb6\u91d1\u5e01\u6570" },
            labelSectionPoint: {
              default: null,
              type: cc.Label,
              tooltip: "\u73a9\u5bb6\u6bb5\u4f4d\u79ef\u5206",
            },
            labelDiyRoomScore: {
              default: null,
              type: cc.Label,
              tooltip: "\u73a9\u5bb6\u81ea\u5efa\u623f\u5206\u6570",
            },
            lab_battlePoint: {
              default: null,
              type: cc.Label,
              tooltip: "\u73a9\u5bb62v2\u5bf9\u6218\u5206\u6570",
            },
            lab_MatchScore: {
              default: null,
              type: cc.Label,
              tooltip: "\u73a9\u5bb6\u6bd4\u8d5b\u573a\u5206\u6570",
            },
            lab_CounterNum: {
              default: null,
              type: cc.Label,
              tooltip: "\u73a9\u5bb6\u7b79\u7801\u573a\u7b79\u7801\u6570",
            },
            labelZCoin: {
              default: null,
              type: cc.Label,
              tooltip: "\u73a9\u5bb6\u6307\u5c16\u5e01\u6570",
            },
            lab_DCoin: {
              default: null,
              type: cc.Label,
              tooltip: "\u73a9\u5bb6\u5dc5\u5cf0\u5e01\u6570",
            },
            direction: { default: 0, type: i, tooltip: "\u73a9\u5bb6ViewSeatId" },
            nodeTrustee: {
              default: null,
              type: cc.Node,
              tooltip: "\u6258\u7ba1\u663e\u793a\u8282\u70b9",
            },
            nodeNetError: {
              default: null,
              type: cc.Node,
              tooltip: "\u6389\u7ebf\u663e\u793a\u8282\u70b9",
            },
            nodeBankerTag: { default: null, type: cc.Node, tooltip: "\u5e84\u5bb6\u6807\u8bc6" },
            nodeTeammateTag: { default: null, type: cc.Node, tooltip: "\u961f\u53cb\u6807\u8bc6" },
            spfHZLaoZhuang: [cc.SpriteFrame],
            nodeUserTagLayout: {
              default: null,
              type: cc.Node,
              tooltip: "\u5e03\u5c40\u73a9\u5bb6\u6807\u8bc6\u8282\u70b9",
            },
            prefabTagGroup: {
              default: null,
              type: cc.Prefab,
              tooltip: "\u73a9\u5bb6\u6807\u8bc6\u7ec4\u9884\u5236",
            },
            yuyinBox: { default: null, type: cc.Node, tooltip: "\u804a\u5929\u8282\u70b9" },
            yuyinAnims: { default: null, type: cc.Prefab, tooltip: "\u8bed\u97f3\u9884\u5236" },
            protectEffect: {
              default: null,
              type: cc.Node,
              tooltip: "\u5b88\u62a4\u793c\u5305\u6548\u679c",
            },
            more: { default: null, type: cc.Node, tooltip: "\u5341\u4e8c\u751f\u8096\u4f4d\u7f6e" },
            img_MJPath: cc.Sprite,
            lab_rank: cc.Label,
            _userInfoFire: null,
          },
          Awake: function () {
            ((this._nViewSeatId = -1),
              (this._nUserId = null),
              (this._isLeftShow = !1),
              (this.labelCoin.node.parent.active = !1),
              (this.labelSectionPoint.node.parent.active = !1),
              (this.MaCardHeadFrame.node.active = !1),
              this.onCustomEvent(),
              this.onMessageEvent(),
              this.__activeLabsByRoomType());
          },
          initUI: function () {
            ((this.labelNickName.string = g_oPlatform.getNickName()),
              g_oData.get(g_tData.comHead).loadHead(g_oPlatform.getHeadUrl(), this.spriteHead));
          },
          openMJPath: function (e) {
            var t = MJ.GameLogic.PlayerModel.getPlayerOtherInfoByUserId(
              g_oData.get(g_tData.sdkUser).userId,
            );
            if (t) {
              var i = t.userMJMasterPathLv;
              if (-1 == i || (!i && 0 !== i))
                return ((this.img_MJPath.node.active = !1), void (this.lab_rank.node.active = !1));
            }
            (this._nViewSeatId,
              g_tConst.GameConfig.ViewSeat.SeatMine,
              this._nViewSeatId !== g_tConst.GameConfig.ViewSeat.SeatMine && -1 == e && (e = 0),
              this.setRankSp(e));
          },
          setRankSp: function (e) {
            var t,
              i = this,
              a = g_oData.get(g_tData.SwitchModel).isCheckReferral();
            if (e <= 0 || e > 31 || a)
              return ((this.img_MJPath.node.active = !1), void (this.lab_rank.node.active = !1));
            ((this.img_MJPath.node.active = !0),
              (this.lab_rank.node.active = !0),
              (this.lab_rank.string = e));
            for (
              var o = g_oData.get(g_tData.MJMasterPathMod).getRankConfigs(), n = 0;
              n < o.length;
              n++
            ) {
              var s = o[n];
              if (((t = s), e <= s.maxLv)) break;
            }
            t &&
              ((this.lab_rank.node.getComponent(cc.LabelOutline).color = new cc.Color().fromHEX(
                t.outcolor,
              )),
              this.scheduleOnce(function () {
                (console.log("roy \u5934\u50cf", e, "s_" + t.rankIndex),
                  g_oData.get(g_tData.MJMasterPathMod).loadSp("s_" + t.rankIndex, i.img_MJPath),
                  (i.loadPathTimes += 0.1));
              }, this.loadPathTimes || 0));
          },
          onMessageEvent: function () {
            (this.autoDispose(
              g_oEvent.addEventListener(
                "UPDATE_USERINFO_AFTER_AUTHORIZE",
                function () {
                  this._nUserId == g_oPlatform.getUserId() && this.initUI();
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.USER_CARD_WAITING,
                  function (e) {
                    this.headIconAniStart(e);
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.USER_CARD_RESULT,
                  function (e) {
                    this.headIconAniStop(e);
                  },
                  this,
                ),
              ));
          },
          onCustomEvent: function () {
            (this.node.on("RESET_USERNODE", this._resetNode, this),
              this.node.on("PLAY_USER_YUYIN", this._playYuyin, this),
              this.node.on("SHOW_YUYIN_BUBBLE", this.showYuyinBubble, this),
              this.node.on("CLEAR_YUYIN_BUBBLE", this.clearYuyinBubble, this),
              this.node.on("SET_VIEW_SEAT_ID", this._setViewSeatId, this),
              this.node.on("SET_DIRECTION", this._setDirection, this),
              this.node.on("SET_TRUSTEE", this._setTrustee, this),
              this.node.on("SET_NET_ERROR", this._setNetError, this),
              this.node.on("SET_BANKER_TAG", this._setBankerTag, this),
              this.node.on("SET_TEAMMATE_TAG", this._setTeamateTag, this),
              this.node.on("ADD_USER_TAG", this._addUserTag, this),
              this.node.on("UPDATE_USER_TAG", this._updateUserTag, this),
              this.node.on("HIDE_PLAYER_NICKNAME", this._hideNickName, this),
              this.node.on("SET_PLAYER_HEAD", this._setPlayerHead, this),
              this.node.on("SET_PLAYER_COIN", this._setPlayerCoin, this),
              this.node.on("SET_PLAYER_POINT", this._setPlayerPoint, this),
              this.node.on("SET_PLAYER_MATCH_POINT", this._setMatchScore, this),
              this.node.on("SET_PLAYER_COUNTER_NUM", this._setCounterNum, this),
              this.node.on("SET_PLAYER_BATTLE_POINT", this._setBattlePoint, this),
              this.node.on("SET_PLAYER_SECTION_POINT", this._setPlayerSectionPoint, this),
              this.node.on("SET_PLAYER_ZCOIN", this._setPlayerZCoin, this),
              this.node.on("SET_PLAYER_NICKNAME", this._setPlayerNickName, this),
              this.node.on("SET_HEAD_FRAME", this._setHeadFrame, this),
              this.node.on("SET_HEAD_PROTECT_EFFECT", this._setHeadProtectEffect, this),
              this.node.on("SET_FIRE_ACTIVE", this.setFireActive, this),
              this.node.on("SHOW_GROW_FAN_NUM", this.showGrowFanNum, this),
              this.node.on("HIDE_GROW_FAN_NUM", this.hideGrowFanNum, this),
              this.node.on("SET_GUARD_TIMES", this._setGuardTimes, this),
              this.node.on("SET_MJ_PATH_LV", this._openPlayerLv, this),
              this.node.on("SET_MJ_PATH_LV_FAKE", this.setRankSp, this),
              this.node.on("CLOSE_MJ_PATH_LV", this._closePlayerLv, this));
          },
          _resetNode: function () {
            ((this.nodeTrustee.active = !1),
              (this.nodeBankerTag.active = !1),
              (this.nodeTeammateTag.active = !1),
              this.nodeUserTagLayout.removeAllChildren());
          },
          update: function () {
            var e = this.more.convertToWorldSpaceAR(cc.v2(0, 0));
            e !== this._worldPos && ((this._worldPos = e), this._onViewSeatOrPosChg());
          },
          _setGuardTimes: function (e) {
            var t = cc.find("img_userinfo_bg/img_clock", this.node),
              i = cc.find("img_head_bg/HeadParent/clock_mask", this.node),
              a = this.node.getChildByName("jinzhognzhao");
            t &&
              a &&
              i &&
              (e && null != e.guardTimes && 0 != e.guardTimes
                ? ((t.active = !0),
                  (a.active = !0),
                  (i.active = !0),
                  (t.getChildByName("label_guardTimes").getComponent(cc.Label).string =
                    "x" + e.guardTimes))
                : ((t.active = !1), (a.active = !1), (i.active = !1)));
          },
          _playYuyin: function (e) {
            if (!MJ.GameLogic.TableModel.openYuyin)
              return (Log.warn("\u672a\u5f00\u542f\u8bed\u97f3"), !1);
            this.playYuyin(e);
          },
          getnViewSeatIdOffset: function (e) {
            var t = 0,
              i = 0;
            return (
              0 === e || 1 === e ? (t = 150) : 2 === e ? ((t = -140), (i = -90)) : (t = -140),
              cc.v2(t, i)
            );
          },
          playYuyin: function (e) {
            this.isNext = !1;
            var t = e.sMsgData,
              i = e.nViewSeatId,
              a = e.msgCont,
              n = e.endCallback,
              s = function (e) {
                n(e);
                var t;
                ((t = !!e || 0 != i),
                  a <= 0 && t
                    ? g_oExLayerManager.emitEvent2GameLayer(
                        g_tConst.GameExLayerCfg.GameMenu.id,
                        "CANTOUCH_YUYIN_BTN",
                        !0,
                      )
                    : g_oExLayerManager.emitEvent2GameLayer(
                        g_tConst.GameExLayerCfg.GameMenu.id,
                        "CANTOUCH_YUYIN_BTN",
                        !1,
                      ));
              },
              r = t.attribute.time,
              c = this.getnViewSeatIdOffset(i),
              l = cc.instantiate(this.yuyinAnims);
            l.position = cc.v2(c.x, c.y);
            var g = l.getComponent("UserInfoYuyin");
            g.onData(r, i);
            var d = { fileTag: t.fileTag, attribute: t.attribute };
            (g_oPlatform.reqGetFile(d, function (e, t) {
              if (e) {
                var i = {
                  src: t.filePath,
                  onErrorCb: function () {
                    (s(!0), o.resumeBgMusic(2));
                  },
                  onPlayCb: function () {
                    (s(!1), o.pauseBgMusic(2));
                  },
                  onEndedCb: function () {
                    (s(!0), o.resumeBgMusic(2));
                  },
                  onPauseCb: function () {},
                };
                g_oPlatform.playAudio(i);
              } else s(!0);
            }),
              this.yuyinBox.removeAllChildren(),
              this.yuyinBox.addChild(l),
              g.scheduleOnce(function () {
                (s(!0), o.resumeBgMusic(2), l.destroy());
              }, r),
              g_oEvent.dispatchEvent(g_tEvent.RANDOM_SEAT_SHOW_CHAT, {
                nType: 3,
                time: r,
                nViewSeatId: i,
              }));
          },
          showYuyinBubble: function (e) {
            var t = e.time,
              i = this.getnViewSeatIdOffset(this._nViewSeatId),
              a = cc.instantiate(this.yuyinAnims);
            ((a.position = cc.v2(i.x, i.y)),
              a.getComponent("UserInfoYuyin").setStyle({ time: t, index: this._nViewSeatId }),
              this.yuyinBox.removeAllChildren(),
              this.yuyinBox.addChild(a));
          },
          clearYuyinBubble: function () {
            (Log.info("BIRD >>>", "UserInfoNode.js", "clearYuyinBubble"),
              this.yuyinBox.removeAllChildren());
          },
          _setTrustee: function (e) {
            this.nodeTrustee.active = e.isTrustee;
          },
          _setNetError: function (e) {
            this.nodeNetError.active = e.isNetError;
          },
          _setBankerTag: function (e) {
            if (((this.nodeBankerTag.active = !0), !isNull(e) && !isNull(e.typeId)))
              switch (e.typeId) {
                case g_tConst.eUserTag.Zhuang1.id:
                  this.nodeBankerTag.getComponent(cc.Sprite).spriteFrame = this.spfHZLaoZhuang[0];
                  break;
                case g_tConst.eUserTag.Zhuang2.id:
                  this.nodeBankerTag.getComponent(cc.Sprite).spriteFrame = this.spfHZLaoZhuang[1];
                  break;
                case g_tConst.eUserTag.Zhuang3.id:
                  this.nodeBankerTag.getComponent(cc.Sprite).spriteFrame = this.spfHZLaoZhuang[2];
                  break;
                default:
                  Log.error("BIRD\ud83d\ude21>>>", "UserInfoLayer.js", "_updateBanker");
              }
          },
          _setTeamateTag: function (e) {
            this.nodeTeammateTag.active = e.isShow;
          },
          _setViewSeatId: function (e) {
            ((this._nViewSeatId = e.nViewSeatId),
              (this._nUserId = e.nUserId),
              this._onViewSeatOrPosChg());
          },
          updateUserHead: function () {},
          _setDirection: function (e) {
            if (((this.direction = e.direction), this.direction == i.Right)) {
              var t = this.nodeUserTagLayout.parent.width;
              ((this.nodeUserTagLayout.anchorX = 1),
                (this.nodeUserTagLayout.x -= t + 5),
                (this.nodeBankerTag.anchorX = 1),
                (this.nodeBankerTag.x -= t + 5),
                (this._isLeftShow = !0));
            }
            this._onViewSeatOrPosChg();
          },
          _setPlayerHead: function (e) {
            var t = g_oData.get(g_tData.WinLossModel).getInviteId();
            if (0 != this._nViewSeatId || t) {
              var i = this.spriteHead;
              i.node.active = !0;
              var o = e.userID,
                n = e.sHeadUrl;
              (o != g_oPlatform.getUserId() &&
                (n = a.getLiveModeDefaultHead({ userID: o, headUrl: n })),
                Log.info("Edwin setPlayerHead ", o, n),
                g_oData.get(g_tData.comHead).loadHead(n, i));
            } else this.initUI();
          },
          _setHeadFrame: function (e) {
            this.spriteHeadFrame.node.active = !1;
            var t = e.useIds;
            if (Array.isArray(t)) {
              var i = t[g_tConst.ServerBagType.HeadFrame];
              g_oData.get(g_tData.comHeadFrame).loadHeadFrameWithCurUse(this.spriteHeadFrame, i);
            }
          },
          _setHeadProtectEffect: function (e) {
            var t = this;
            if (this.protectEffect) {
              var i = e.isShow;
              if (((this.protectEffect.active = i), i)) {
                var a = this.protectEffect.getChildByName("point");
                1 != this._loadingProtectEffect &&
                  0 == a.childrenCount &&
                  ((this._loadingProtectEffect = !0),
                  g_oPrefabLoader.loadRes(g_tAsset.ProtectGiftTouxiangPrefab, null, function (e) {
                    cc.isValid(t) && ((e.parent = a), (t._loadingProtectEffect = !1));
                  }));
              }
            }
          },
          _setShowMaCardHeadFrame: function () {
            var e = this,
              t = !1;
            if (this._nUserId === g_oPlatform.getUserId() + "")
              t = g_oData.get(g_tData.MakabakaMod).isMKBK;
            else {
              var i = (
                (MJ.GameLogic.PlayerModel.getPlayerOtherInfoByUserId(parseInt(this._nUserId)) || {})
                  .mkbkBuff || []
              ).includes(g_tConst.SubEffectItem.MaKaBaKaID);
              !isNull(i) && i && (t = i);
            }
            if (t) {
              this.spriteHeadFrame.spriteFrame = null;
              var a = g_tConst.SubEffectItem.MaKaBaKaID;
              g_oData
                .get(g_tData.comHeadFrame)
                .loadMkbkHeadFrame(this.MaCardHeadFrame, a, function (t) {
                  isNull(t) || (e.MaCardHeadFrame.node.active = !0);
                });
            }
            return t;
          },
          __activeLabsByRoomType: function () {
            var e = MJ.GameLogic.TableModel.IsDiyRoom(),
              t = MJ.GameLogic.TableModel.IsMatchRoom(),
              i = MJ.GameLogic.TableModel.IsCoinRoom(),
              a = MJ.GameLogic.TableModel.IsSectionRoom(),
              o = MJ.GameLogic.TableModel.IsBattleRoom(),
              n = MJ.GameLogic.TableModel.IsCounterPlay(),
              s = MJ.GameLogic.TableModel.isZCoinRoom(),
              r = MJ.GameLogic.TableModel.isDCoinRoom();
            ((this.labelDiyRoomScore.node.active = e),
              (this.lab_MatchScore.node.active = t),
              (this.lab_CounterNum.node.active = n),
              (this.labelCoin.node.parent.active = i),
              (this.lab_battlePoint.node.parent.active = o),
              (this.labelZCoin.node.parent.active = s && !r),
              (this.lab_DCoin.node.parent.active = r),
              (this.labelSectionPoint.node.parent.active =
                a && this._nViewSeatId === g_tConst.GameConfig.ViewSeat.SeatMine));
          },
          _setPlayerCoin: function (e) {
            (void 0 === e && (e = {}),
              this.__activeLabsByRoomType(),
              (this.labelCoin.string = e.sCoin));
          },
          _openPlayerLv: function (e) {
            this.openMJPath(e);
          },
          _closePlayerLv: function () {
            ((this.img_MJPath.node.active = !1), (this.lab_rank.node.active = !1));
          },
          _setPlayerPoint: function (e) {
            (void 0 === e && (e = {}),
              this.__activeLabsByRoomType(),
              (this.labelDiyRoomScore.string = e.sPoint));
          },
          _setBattlePoint: function (e) {
            (void 0 === e && (e = {}),
              this.__activeLabsByRoomType(),
              (this.lab_battlePoint.string = e.sBattlePoint));
            var t = e.sBattlePoint;
            if (MJ.GameLogic.TableModel.isXLHZ2V2()) {
              var i = MJ.GameLogic.TableModel.getTableCfg();
              this.lab_battlePoint.string =
                (t < 0 ? "-" : "") + a.translateCoinStr(a.initProCoin(Math.abs(t * i.blind)));
            } else this.lab_battlePoint.string = e.sBattlePoint;
          },
          _setMatchScore: function (e) {
            (void 0 === e && (e = {}),
              this.__activeLabsByRoomType(),
              (this.lab_MatchScore.string = e.sMatchScore));
          },
          _setCounterNum: function (e) {
            (void 0 === e && (e = {}),
              this.__activeLabsByRoomType(),
              (this.lab_CounterNum.string = e.sCounterNum));
          },
          _setPlayerSectionPoint: function (e) {
            (void 0 === e && (e = {}),
              this.__activeLabsByRoomType(),
              (this.labelSectionPoint.string = String(e.nPoint)));
          },
          _setPlayerZCoin: function (e) {
            (void 0 === e && (e = {}),
              this.__activeLabsByRoomType(),
              (this.labelZCoin.string = e.sZCoin),
              (this.lab_DCoin.string = e.sDCoin));
          },
          _hideNickName: function () {
            this.labelNickName.node.active = !1;
          },
          _setPlayerNickName: function (e) {
            this.labelNickName.string = a.getFitSubStringByLen(e.Nickname, 8);
          },
          _getContainerByTagID: function (e) {
            var t = this.nodeUserTagLayout.children;
            for (var i in g_tConst.eUserTag)
              if (g_tConst.eUserTag.hasOwnProperty(i)) {
                var a = g_tConst.eUserTag[i];
                if (a.id === e) {
                  for (var o = null, n = 0; n < t.length; n++) {
                    var s = t[n];
                    if (s.getComponent("UserTagGroup").equalGroupID(a.groupID)) {
                      o = s;
                      break;
                    }
                  }
                  if (o) return o;
                  var r = g_oPrefabLoader.instantiate(this.prefabTagGroup, this.nodeUserTagLayout);
                  return (
                    this.nodeUserTagLayout.getComponent(cc.Layout).updateLayout(),
                    r.emit("INIT_USER_TAG_GROUP", {
                      nViewSeatId: this._nViewSeatId,
                      nGroupId: a.groupID,
                      isLeftShow: this._isLeftShow,
                    }),
                    r
                  );
                }
              }
          },
          _addUserTag: function (e) {
            var t = e.nUserTag;
            (this._getContainerByTagID(t).emit("ADD_TAG", e),
              Log.info("UserInfoNode _addUserTag nUserTag =", t, " viewSeat=", this._nViewSeatId));
          },
          _updateUserTag: function (e) {
            var t = e.nUserTag;
            this._getContainerByTagID(t).emit("UPDATE_TAG", e);
          },
          getUserTagPosition: function (e) {
            for (var t in g_tConst.eUserTag)
              if (g_tConst.eUserTag.hasOwnProperty(t) && g_tConst.eUserTag[t].id === e)
                return this._getContainerByTagID(e)
                  .getComponent("UserTagGroup")
                  .getUserTagPosition(e);
          },
          onClickHead: function () {
            var e = this;
            g_oPlatform.getUserId() == this._nUserId
              ? (Log.info(">>>>\u70b9\u51fb\u4e86\u6211\u7684\u5934\u50cf"),
                g_oData.get(g_tData.Login).authorize(function () {
                  g_oData.get(g_tData.sdkLogin).checkLogin(function () {
                    var t = new cc.Event.EventCustom("TOUCH_HEAD", !0);
                    (t.setUserData({ nViewSeatId: e._nViewSeatId }), e.node.dispatchEvent(t));
                  });
                }))
              : g_oData.get(g_tData.sdkLogin).checkLogin(function () {
                  var t = new cc.Event.EventCustom("TOUCH_HEAD", !0);
                  (t.setUserData({ nViewSeatId: e._nViewSeatId }), e.node.dispatchEvent(t));
                });
          },
          headIconAniStart: function (e) {
            if ((void 0 === e && (e = -1), !(e < 0) && this._nViewSeatId == e)) {
              var t = cc.delayTime(0.1),
                i = cc.callFunc(function () {}, this),
                a = cc.callFunc(function () {}, this),
                o = cc.sequence(t, cc.fadeOut(2), i, cc.fadeIn(2), a),
                n = cc.repeatForever(o);
              this.spriteHead.node.runAction(n);
            }
          },
          headIconAniStop: function (e) {
            (void 0 === e && (e = -1),
              e < 0 ||
                (this._nViewSeatId == e &&
                  (this.spriteHead.node.stopAllActions(), (this.spriteHead.node.opacity = 255))));
          },
          setFireActive: function (e) {
            var t = this,
              i = function () {
                t._userInfoFire.active = !!e;
              },
              a = g_tAsset.UserInfoFire;
            cc.isValid(this._userInfoFire)
              ? i()
              : g_oPrefabLoader.loadRes(a, this.node, function (e) {
                  ((e.position = cc.v2(0, 60)), (t._userInfoFire = e), i());
                });
          },
          showGrowFanNum: function (e) {
            this._growFanAnims || (this._growFanAnims = new Map());
            var t = e.fanType,
              i = this._growFanAnims.get(t);
            if (i) ((i.node.active = !0), i.updateUI(e));
            else {
              var a = this;
              g_oPrefabLoader.loadRes(e.prefabPath, this.node, function (i) {
                if (i) {
                  var o = i.getComponent("GrowFanBase");
                  o && (a._growFanAnims.set(t, o), (o.node.active = !0), o.updateUI(e));
                }
              });
            }
          },
          hideGrowFanNum: function () {
            var e = this;
            this._growFanAnims &&
              (this._growFanAnims.forEach(function (e) {
                cc.isValid(e) &&
                  e.node.runAction(
                    cc.sequence(
                      cc.scaleTo(0.2, 0.1),
                      cc.callFunc(function () {
                        e.node.destroy();
                      }),
                    ),
                  );
              }),
              this.scheduleOnce(function () {
                e._growFanAnims.clear();
              }, 0.5));
          },
          onDestroy: function () {
            (this._super(), this._onViewSeatOrPosChg(!0));
          },
          _onViewSeatOrPosChg: function (e) {
            if ((void 0 === e && (e = !1), this._nViewSeatId >= 0)) {
              var t = null;
              (!e && cc.isValid(this.more) && (t = this.more.convertToWorldSpaceAR(cc.v2(0, 0))),
                MJ.GameViewHandler.node.emit("USER_INFO_NODE_POS_CHG", {
                  nViewSeat: this._nViewSeatId,
                  worldPos: t,
                }),
                g_oEvent.dispatchEvent(g_tEvent.USER_INFO_NODE_POS_CHG, {
                  nViewSeat: this._nViewSeatId,
                }));
            }
          },
        }),
          cc._RF.pop());
      },
      {
        CommonUtils: "CommonUtils",
        Direction: "Direction",
        gameYuyinAudioMgr: "gameYuyinAudioMgr",
      },
    ],
