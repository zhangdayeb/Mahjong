    SlyderView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "1e09cmH+ZtI+4WbjVImNL22", "SlyderView");
        var i = e("CommonUtils"),
          a = cc.Enum({ Static: 0, Rotating: 1, SlowDown: 2, Awarding: 3 }),
          o = (cc.Enum({ LoginFree: 1, ShareAdFree: 2, PlayFree: 3, NoFree: 4 }), 0),
          n = e("AlertDlgBaseView");
        (cc.Class({
          extends: n,
          properties: {
            SlyderNode: { default: null, type: cc.Node, tooltip: "\u8f6c\u76d8\u8282\u70b9" },
            nItemNode: { default: null, type: cc.Node, tooltip: "\u8f6c\u76d8\u8282\u70b9" },
            newItem: { default: null, type: cc.Node, tooltip: "\u8f6c\u76d8\u8282\u70b9" },
            SlyderItemPrefab: {
              default: null,
              type: cc.Prefab,
              tooltip: "\u8f6c\u76d8\u5956\u52b1\u5355\u5143\u9884\u5236",
            },
            SlyderAwardPrefab: {
              default: null,
              type: cc.Prefab,
              tooltip: "\u8f6c\u76d8\u5956\u52b1\u9762\u677f",
            },
            labelSlyderTimes: {
              default: null,
              type: cc.Label,
              tooltip: "\u5269\u4f59\u62bd\u5956\u6b21\u6570",
            },
            nodeRedPoint: { default: null, type: cc.Node, tooltip: "\u6309\u94ae\u7ea2\u70b9" },
            nodeLotteryTipBg: {
              default: null,
              type: cc.Node,
              tooltip: "\u62bd\u5956\u63d0\u793a\u6587\u672c\u5e95\u56fe",
            },
            labelLotteryTip: {
              default: null,
              type: cc.Label,
              tooltip: "\u62bd\u5956\u63d0\u793a\u6587\u672c",
            },
            prefabLead2Game: {
              default: null,
              type: cc.Prefab,
              tooltip: "\u5f15\u5bfc\u53bb\u5bf9\u5c40\u9884\u5236",
            },
            maxSpeed: {
              default: 5,
              type: cc.Float,
              tooltip: "\u8f6c\u76d8\u6700\u5927\u8f6c\u901f\u8bbe\u7f6e",
            },
            duration: {
              default: 3,
              type: cc.Float,
              tooltip: "\u51cf\u901f\u524d\u65cb\u8f6c\u65f6\u95f4\u8bbe\u7f6e",
            },
            acc: { default: 0.1, type: cc.Float, tooltip: "\u52a0\u901f\u5ea6\u8bbe\u7f6e" },
            decGroup: {
              default: 1,
              type: cc.Integer,
              tooltip: "\u51cf\u901f\u65cb\u8f6c\u5708\u6570\u8bbe\u7f6e",
            },
            targetID: {
              default: 0,
              type: cc.Integer,
              tooltip: "\u6307\u9488\u4f4d\u7f6e\u6807\u8bb0\u8bbe\u7f6e",
            },
            MesTextBg: {
              default: null,
              type: cc.Node,
              tooltip: "\u6309\u94ae\u53f3\u4fa7\u6587\u6848\u7236\u8282\u70b9",
            },
            MesLabel: {
              default: null,
              type: cc.Label,
              tooltip: "\u6309\u94ae\u53f3\u4fa7\u6587\u6848",
            },
            BtnUsePrivCard: {
              default: null,
              type: cc.Button,
              tooltip: "\u4f7f\u7528\u5c0a\u4eab\u5361\u6309\u94ae",
            },
            PrivCardNumRoot: {
              default: null,
              type: cc.Node,
              tooltip: "\u5c0a\u4eab\u5361\u6570\u91cf\u663e\u793a",
            },
            _backPosNode: null,
          },
          Awake: function () {
            ((this.MesTextBg.active = !1),
              (this._prefabLead2Game = null),
              this.onCustomEvent(),
              this.onMessageEvent());
          },
          onEnable: function () {
            this._Init();
          },
          onCustomEvent: function () {
            this.node.on("ON_INIT", this.initCommonData, this);
          },
          onMessageEvent: function () {
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.GAMEPLAT_SLYDER_LOTTERY_RESULT,
                this.onSlyderLottery,
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GAMEPLAT_SLYDER_RECEIVE_RESULT,
                  this.onSlyderReceive,
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GAMEPLAT_SLYDER_QUERY_LOTTERY_COUNT,
                  this.onQueryLotteryCount,
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GAMEPLAT_SHARE_EVENT_NORMAL_SUCESS,
                  this.onAdSucess,
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GAME_AGAIN_PLAY_CLOSE_POP_VIEW,
                  this.needCloseView,
                  this,
                ),
              ));
          },
          needCloseView: function () {
            this.close();
          },
          initCommonData: function (e) {
            if ((void 0 === e && (e = null), (this._backPosNode = null), null != e)) {
              var t = e.posNode || null;
              this._backPosNode = t;
            }
          },
          _Init: function () {
            (this._doSomeDefinition(),
              (this.slyderType = g_oData.get(g_tData.SwitchModel).sub.exchange.isZJ
                ? g_tConst.SlyderType.getMoneySlyder
                : g_tConst.SlyderType.scmjSlyder));
            var e = g_oData.get(g_tData.mod_Share).getSlyderCfg();
            (this._initSlyderItems(e),
              this.setLotteryCount(),
              this.initLotteryTip(),
              this.initDuiJuCount(),
              this.checkFreeGet());
          },
          _doSomeDefinition: function () {
            ((this.targetID = o),
              (this._status = a.Static),
              (this._curSpeed = 0),
              (this._spinTime = 0),
              (this._gearNum = 8),
              (this._defaultAngle = 360 / this._gearNum / 2),
              (this._gearAngle = 360 / this._gearNum),
              (this._effectFlag = 0),
              (this._finalAngle = this._caculateFinalAngle(this.targetID)),
              (this._decAngle = 360 * this.decGroup),
              this._setRotation(this._finalAngle));
          },
          _setRotation: function (e) {
            this.SlyderNode.angle = e;
          },
          _addRotation: function (e) {
            this.SlyderNode.angle += e;
          },
          _caculateFinalAngle: function (e) {
            return 360 - e * this._gearAngle + this._defaultAngle;
          },
          _finishRotation: function () {
            var e = this._tAwardInfos,
              t = this._nReceiveCode,
              i = this._nMultiple;
            g_oData.get(g_tData.SwitchModel).sub.exchange.isZJ
              ? g_oData.get(g_tData.mod_Share).reqReceive(g_tConst.SlyderType.getMoneySlyder, 3)
              : g_oPrefabLoader
                  .instantiate(this.SlyderAwardPrefab, this.node)
                  .emit("ON_INIT", { GoodsCfgs: e, nReceiveCode: t, nMultiple: i, isReceived: !1 });
          },
          _initSlyderItems: function (e) {
            if (e && this.SlyderNode.active) {
              (e.cfg.sort(function (e, t) {
                return e.index - t.index;
              }),
                this.nItemNode.removeAllChildren(),
                this.newItem.removeAllChildren());
              for (var t = 0; t < e.cfg.length; t++)
                (g_oPrefabLoader
                  .instantiate(this.SlyderItemPrefab, this.nItemNode)
                  .emit("ON_INIT", { GoodsCfg: e.cfg[t], gearNum: this._gearNum, open: !1 }),
                  g_oPrefabLoader
                    .instantiate(this.SlyderItemPrefab, this.newItem)
                    .emit("ON_INIT", { GoodsCfg: e.cfg[t], gearNum: this._gearNum, open: !0 }));
            }
          },
          setLotteryCount: function () {
            var e,
              t = g_oData.get(g_tData.mod_Share).getSlyderCfg(),
              i = isNull(t) || isNull(t.remainTimes) ? 0 : t.remainTimes;
            ((e =
              i > 0 ? "\u514d\u8d39\u62bd\u5956\uff08" + i + "\uff09" : "\u514d\u8d39\u62bd\u5956"),
              (this.labelSlyderTimes.string = e),
              (this.nodeRedPoint.active = i > 0),
              this.initPrivCardView(i > 0));
          },
          initDuiJuCount: function () {
            g_oData.get(g_tData.mod_Share).getShareCntByLinkID(this.getSlyderLinkId()) <= 0 &&
              g_oData.get(g_tData.mod_Share).reqQueryRemainTimes(this.slyderType);
          },
          initLotteryTip: function () {
            var e = g_oData.get(g_tData.mod_Share).getSlyderCfg(),
              t = e.remainTimes || 0,
              i = g_oData.get(g_tData.mod_Share).getShareCntByLinkID(this.getSlyderLinkId()),
              a = !this.checkFreeGet();
            if (t >= 1 && i > 0)
              ((this.nodeRedPoint.active = !0),
                1 == a && this._InvokeAdType(),
                (this.nodeLotteryTipBg.active = !0),
                (this.labelLotteryTip.string =
                  "\u5269\u4f59\u514d\u8d39\u62bd\u5956\u6b21\u6570\uff1a" + t));
            else if (i > 0)
              switch (((this.nodeRedPoint.active = !0), this._InvokeAdType(), this._invokeType)) {
                case g_tConst.InvokeType.Video:
                  this.initAdView();
                  break;
                case g_tConst.InvokeType.Share:
                  this.initShareView();
              }
            else if (e.maxTimes === e.turntablePlayTimes)
              ((this.nodeLotteryTipBg.active = !0),
                (this.labelLotteryTip.string =
                  "\u4eca\u65e5\u62bd\u5956\u6b21\u6570\u5df2\u7528\u5b8c\uff0c\u8bf7\u660e\u5929\u518d\u6765!"));
            else {
              var o = e.gameCanGetTimes - (e.maxTimes - e.turntablePlayTimes) || 0;
              ((o = o > 0 ? o : 0),
                (this.nodeRedPoint.active = !!o),
                (this.nodeLotteryTipBg.active = !0),
                (this.labelLotteryTip.string =
                  "\u6bcf\u73a9\u724c" +
                  e.gameTimes +
                  "\u5c40\u53ef\u83b7\u5f971\u6b21\u989d\u5916\u62bd\u5956\u673a\u4f1a\uff0c\u6bcf\u5929\u6700\u591a" +
                  e.gameCanGetTimes +
                  "\u6b21\uff0c\u5df2\u62bd\u5956" +
                  o));
            }
            this.nodeLotteryTipBg.active = a;
          },
          onSlyderLottery: function (e) {
            1 === e.code
              ? (this.setLotteryCount(),
                this.initLotteryTip(),
                this._RunSlyderAction(e.index, e.infos, e.receiveCode, e.multiple))
              : 2 === e.code &&
                (g_oPlatform.doAction(
                  g_tConst.tPlatActionId.actionShowToast,
                  "\u62bd\u5956\u5931\u8d25\uff0c\u6ca1\u6709\u6b21\u6570\u4e86\uff01",
                ),
                g_oData.get(g_tData.mod_Share).reqQueryRemainTimes(this.slyderType));
          },
          onSlyderReceive: function (e) {
            if (1 === e.code)
              if (g_oData.get(g_tData.SwitchModel).sub.exchange.isZJ) {
                var t = this._tAwardInfos,
                  i = this._nReceiveCode;
                g_oPrefabLoader
                  .instantiate(this.SlyderAwardPrefab, this.node)
                  .emit("ON_INIT", { GoodsCfgs: t, nReceiveCode: i, isReceived: !0 });
              } else {
                for (var a = 0, o = 0; o < e.infos.length; o++) {
                  var n = e.infos[o];
                  n.type == g_tConst.GameConfig.ItemType.Diamond && (a += n.num);
                }
                if (a > 0) {
                  var s = g_tConst.ReportCfg.ShopModule,
                    r = "Slyder" + s.Event_GetDiamond + a;
                  g_oData.get(g_tData.gameReportData).sendCustomEvent(s.Module, r, s.Ok);
                }
                g_oEvent.dispatchEvent(g_tEvent.BASEHALL_SHARE_EVNET_NORMAL_AWARD_GET, {
                  allAward: e.infos,
                });
              }
            else
              2 === e.code &&
                g_oPlatform.doAction(
                  g_tConst.tPlatActionId.actionShowToast,
                  "\u9886\u53d6\u5931\u8d25\uff01",
                );
          },
          onQueryLotteryCount: function (e) {
            e.times > 0 && (this.setLotteryCount(), this.initLotteryTip());
          },
          onAdSucess: function (e) {
            this.getNormalSlyderLinkId() === e && this.onClickLottery();
          },
          checkFreeGet: function () {
            var e = !1,
              t = g_oData.get(g_tData.mod_Share).getShareCgtInfoByLinkID(this.getSlyderLinkId()),
              i = g_oData
                .get(g_tData.SwitchModel)
                .getNewUserFreeGetAwardInfo(g_tConst.AwardAdPID.Slyder),
              a = g_oData
                .get(g_tData.mod_DataCom)
                .getKeyFreeGetAwardInfoItem(g_tConst.AwardAdPID.Slyder),
              o = t.used ? t.used : 0;
            return (i > 0 && i > a + o && (e = !0), e);
          },
          onClickLottery: function (e) {
            var t = e && (e.usePrivCard || !1),
              i = this;
            if (a.Static === this._status) {
              var o = g_oData.get(g_tData.mod_Share).getSlyderCfg(),
                n = o.remainTimes,
                s = g_oData.get(g_tData.mod_Share).getShareCntByLinkID(this.getSlyderLinkId());
              if (n > 0) this.slyderLottery();
              else if (s > 0) {
                var r = this.checkFreeGet(),
                  c = {
                    Scene: g_tConst.ShareConfig.ShareScene.hall,
                    Module: g_tConst.ShareConfig.ShareModule.Slyder,
                    SubModule: g_tConst.ShareConfig.ShareSubModule.Slyder,
                    ShareType: g_tConst.ShareConfig.ShareType.Slyder,
                    AdScene: g_tConst.AwardAdPID.Slyder,
                    enbleSubGuide: !0,
                    cbSuc: function () {
                      (r ||
                        g_oData
                          .get(g_tData.gameReportData)
                          .reportClickFirstAdAwardAction(
                            i._invokeType,
                            g_tConst.ShareConfig.ShareSubModule.Slyder,
                          ),
                        g_oData
                          .get(g_tData.mod_Share)
                          .reqGPShareSuc(i.getSlyderLinkId(), void 0, void 0, c.type));
                    },
                  };
                if (1 == r || t) {
                  var l = g_oData
                    .get(g_tData.mod_DataCom)
                    .getKeyFreeGetAwardInfoItem(g_tConst.AwardAdPID.Slyder);
                  (g_oData
                    .get(g_tData.mod_DataCom)
                    .upDateFreeGetAwardInfo(g_tConst.AwardAdPID.Slyder, ++l),
                    c.cbSuc(),
                    t &&
                      (g_oData.get(g_tData.PrivCardMod).reqUsePrivilegeCard(1),
                      g_oData
                        .get(g_tData.PrivCardMod)
                        .reportUseCard(g_tConst.PrivCardActModule.Slyder)));
                } else i.invokeAD(c);
              } else
                o.maxTimes === o.turntablePlayTimes
                  ? g_oPlatform.doAction(
                      g_tConst.tPlatActionId.actionShowToast,
                      "\u4eca\u65e5\u6b21\u6570\u5df2\u7528\u5b8c,\u8bf7\u660e\u65e5\u518d\u6765!",
                    )
                  : cc.isValid(this._prefabLead2Game) ||
                    (this._prefabLead2Game = g_oPrefabLoader.instantiate(
                      this.prefabLead2Game,
                      this.node,
                    ));
            }
          },
          onClickClose: function () {
            a.Static === this._status &&
              (this._backPosNode ||
                (this._backPosNode =
                  g_oData.get(g_tData.mod_DataCom).getKeyPopNodeDictItem("RotaryNode") || null),
              null != this._backPosNode && i.isOnLobbyScene()
                ? this.closeAnimationAction(
                    this._backPosNode,
                    function () {
                      this.close();
                    }.bind(this),
                  )
                : this.close(),
              this.reportWXStrategyClose());
          },
          closeAnimationAction: function (e, t) {
            (void 0 === e && (e = null), void 0 === t && (t = null));
            var i = {
              posNode: this.node,
              cbFunc: t,
              aniNode: this.CenterBg,
              popViewName: "SlyderEntry",
            };
            cc.director.emit("CLOSE_POP_VIEW_ANI", i);
          },
          getSlyderLinkId: function () {
            var e = null,
              t = g_oData.get(g_tData.MakabakaMod).isMKBK;
            return (
              g_oData.get(g_tData.SwitchModel).sub.exchange.isZJ
                ? ((e = g_tConst.ShareConfig.ShareLinkId.GetMoneySlyder),
                  t && (e = g_tConst.ShareConfig.ShareLinkId.MKGetMoneySlyder))
                : ((e = g_tConst.ShareConfig.ShareLinkId.Slyder),
                  t && (e = g_tConst.ShareConfig.ShareLinkId.MKSlyder)),
              e
            );
          },
          getNormalSlyderLinkId: function () {
            return g_oData.get(g_tData.SwitchModel).sub.exchange.isZJ
              ? g_tConst.ShareConfig.ShareLinkId.GetMoneySlyder
              : g_tConst.ShareConfig.ShareLinkId.Slyder;
          },
          slyderLottery: function () {
            g_oData.get(g_tData.SwitchModel).sub.exchange.isZJ
              ? g_oData.get(g_tData.mod_Share).reqSlyderLottery(g_tConst.SlyderType.getMoneySlyder)
              : g_oData.get(g_tData.mod_Share).reqSlyderLottery(g_tConst.SlyderType.scmjSlyder);
          },
          _RunSlyderAction: function (e, t, i, n) {
            a.Static === this._status &&
              ((this._tAwardInfos = t),
              (this._nReceiveCode = i),
              (this._nMultiple = n),
              (this.targetID = o = e),
              (this._status = a.Rotating),
              (this._curSpeed = 0),
              (this._spinTime = 0));
          },
          _InvokeAdType: function () {
            ((this._invokeType = g_oData.get(g_tData.mod_Share).getInvokeType()),
              e("CommonPlat").isQQGame() && (this._invokeType = g_tConst.InvokeType.Video),
              this.reportWXStrategyShow());
          },
          initAdView: function () {
            g_oData.get(g_tData.mod_Share).getSlyderCfg();
            var e = g_oData.get(g_tData.mod_Share).getShareCntByLinkID(this.getSlyderLinkId());
            ((this.nodeLotteryTipBg.active = !0),
              (this.labelLotteryTip.string =
                "\u770b\u5b8c\u89c6\u9891\u5373\u53ef\u514d\u8d39\u62bd\u5956\uff0c\u5269\u4f59\u6b21\u6570\uff1a" +
                e));
          },
          initShareView: function () {
            g_oData.get(g_tData.mod_Share).getSlyderCfg();
            var e = g_oData.get(g_tData.mod_Share).getShareCntByLinkID(this.getSlyderLinkId());
            ((this.nodeLotteryTipBg.active = !0),
              (this.labelLotteryTip.string =
                "\u5206\u4eab\u5230\u7fa4\u5373\u53ef\u514d\u8d39\u62bd\u5956\uff0c\u5269\u4f59\u6b21\u6570\uff1a" +
                e));
          },
          update: function (e) {
            if (this.nItemNode.children.length > 0)
              for (var t = 0; t < this.nItemNode.children.length; t++) {
                var i = this.nItemNode.children[t],
                  o = this.newItem.children[t],
                  n = i.convertToWorldSpaceAR(i.children[0].getPosition()),
                  s = o.convertToNodeSpaceAR(n);
                o.children[0].setPosition(s);
              }
            if (a.Static !== this._status)
              if (a.Rotating === this._status)
                ((this._spinTime += e),
                  this._addRotation(this._curSpeed),
                  this._curSpeed <= this.maxSpeed
                    ? (this._curSpeed += this.acc)
                    : this._spinTime >= this.duration &&
                      ((this._finalAngle = this._caculateFinalAngle(this.targetID)),
                      (this.maxSpeed = this._curSpeed),
                      this._setRotation(this._finalAngle),
                      (this._status = a.SlowDown)));
              else if (a.SlowDown === this._status) {
                var r = this.SlyderNode.angle - this._finalAngle;
                ((this._curSpeed = this.maxSpeed * ((this._decAngle - r) / this._decAngle) + 0.2),
                  this._addRotation(this._curSpeed),
                  this._decAngle - r <= 0 &&
                    ((this._status = a.Static),
                    this.node.runAction(
                      cc.sequence(
                        cc.delayTime(this.awardDuration / 1e3),
                        cc.callFunc(this._finishRotation, this),
                      ),
                    )));
              }
          },
          setInvokeType: function () {
            var e = g_oData.get(g_tData.SwitchModel).getWXStrategyADCfg();
            ((this._useWXStrategy = e.adScene.includes(g_tConst.AwardAdPID.Slyder)),
              (this._module = g_tConst.ShareConfig.ShareModule.Slyder),
              this._super());
          },
          initPrivCardView: function (e) {
            var t =
              g_oData.get(g_tData.PrivCardMod).isModuleAct(g_tConst.PrivCardActModule.Slyder) && !e;
            ((this.BtnUsePrivCard.node.active = t), (this.PrivCardNumRoot.active = t));
          },
          onClickUsePrivCard: function () {
            g_oData.get(g_tData.PrivCardMod).checkCardNum() &&
              this.onClickLottery({ usePrivCard: !0 });
          },
          onClick2PublicNotice: function () {
            g_oData.get(g_tData.PublicNoticeMod).popPublicNotice(!0);
          },
        }),
          cc._RF.pop());
      },
      {
        AlertDlgBaseView: "AlertDlgBaseView",
        CommonPlat: "CommonPlat",
        CommonUtils: "CommonUtils",
      },
    ],
