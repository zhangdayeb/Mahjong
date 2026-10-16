    TableSelItem: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "2c18dTci0xHCbgHy4gPmKia", "TableSelItem");
        var i = e("hallUtils"),
          a = e("CommonUtils"),
          o = e("QuikStart"),
          n = ["#015324", "#03515f", "#053e74", "#600aaf", "#4d22b2", "#7d0c07"],
          s = [
            { ruleId: 80401, desc: "\u4e24\u5339\u9a6c" },
            { ruleId: 40202, desc: "\u7ffb\u9b3c" },
            {
              ruleId: 40206,
              desc: function (e) {
                return [
                  g_tConst.GameTypeCfgs.DIYROOMHZMJ.TYPEID,
                  g_tConst.GameTypeCfgs.JBCROOMHZMJ.TYPEID,
                ].includes(e)
                  ? "\u767d\u677f\u8d22\u795e"
                  : "\u767d\u677f\u505a\u9b3c";
              },
            },
            {
              ruleId: 80607,
              desc: "\u4e03\u76ae\u56db\u765e \u5f00\u53e3\u756a 16\u500d\u8d77\u80e1 ",
            },
          ];
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            content: cc.Node,
            glow: cc.Node,
            labelEnterCondition: {
              default: null,
              type: cc.Label,
              tooltip: "\u8fdb\u5165\u6761\u4ef6",
            },
            labelOnLineCnt: { default: null, type: cc.Label, tooltip: "\u5728\u7ebf\u4eba\u6570" },
            labelDifen: { default: null, type: cc.Label, tooltip: "\u5e95\u5206" },
            nodeHSZSign: {
              default: null,
              type: cc.Node,
              tooltip: "\u6362\u4e09\u5f20\u6807\u8bc6",
            },
            nodeSixHzSign: {
              default: null,
              type: cc.Node,
              tooltip: "\u516d\u7ea2\u4e2d\u6807\u8bc6",
            },
            AnimRecommend: {
              default: null,
              type: cc.Animation,
              tooltip: "\u63a8\u8350\u573a\u6b21\u7684\u52a8\u753b",
            },
            SpriteSceneBg: {
              default: null,
              type: cc.Sprite,
              tooltip: "\u573a\u6b21\u6309\u94ae\u5e95\u56fe",
            },
            SpriteFrameScene: {
              default: [],
              type: cc.SpriteFrame,
              tooltip: "\u573a\u6b21\u80cc\u666f\u56fe\u6570\u7ec4",
            },
            nodeSectionPointSign: {
              default: null,
              type: cc.Node,
              tooltip: "\u6bb5\u4f4d\u5956\u52b1\u6807\u8bc6\u5e95\u56fe",
            },
            labelSectionAward: {
              default: null,
              type: cc.Label,
              tooltip: "\u6bb5\u4f4d\u5956\u52b1\u52a0\u6210",
            },
            labelRuleDesc: {
              default: null,
              type: cc.Label,
              tooltip: "\u7279\u6b8a\u89c4\u5219\u663e\u793a\u6587\u672c",
            },
            spBean: { default: null, type: cc.Sprite },
            spIcon: {
              default: [],
              type: cc.SpriteFrame,
              tooltip: "\u573a\u6b21\u80cc\u666f\u56fe\u6570\u7ec4",
            },
            fxsjccbxpBg: cc.Node,
            _hookGameType: 0,
          },
          Awake: function () {
            ((this.objSceneCfg = void 0), this.onMessageEvent());
          },
          onMessageEvent: function () {
            this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.UPDATE_ONLINE_PLAYER_NUMBERS,
                function () {
                  this.initOnLinePeople();
                }.bind(this),
              ),
            );
          },
          init: function (e) {
            (console.log(" init objSceneCfg = ", e),
              this.setRecommendScene(!1),
              (this.objSceneCfg = e),
              this.initEnterCondition(),
              this.initOnLinePeople(),
              this.initDiFen(),
              this.initHSZSign(),
              this.initSixHzSign(),
              this.initSceneSectionAward(),
              this.initRuleDesc(),
              this.showAsDianFeng(e.typeID),
              this.initFksjccbxpBtn(e));
          },
          setHookGameType: function (e) {
            this._hookGameType = e;
          },
          setIndex: function (e, t) {
            (e > 5 && (e = 5), (this._nIndex = e));
            var i = e,
              a = g_oData.get(g_tData.SwitchModel).getTableImgIndex();
            (a[t] && (i = a[t][e] - 1),
              (this.SpriteSceneBg.spriteFrame = this.SpriteFrameScene[i]));
          },
          initEnterCondition: function () {
            var e = this.objSceneCfg,
              t = 0,
              i = 0;
            0 !== e.enterCoinLower
              ? ((t = e.enterCoinLower),
                (i = e.enterCoinUpper),
                (this.spBean.spriteFrame = this.spIcon[0]))
              : ((t = e.enterFingerCoinLower),
                (i = e.enterFingerCoinUpper),
                (this.spBean.spriteFrame = this.spIcon[1]));
            var o =
                t >= 0
                  ? a.translateCoinStr(a.initProCoin(t), { unitRange: g_tConst.GameUnit.CrazyZF })
                  : "\u65e0\u9650\u5236",
              n =
                i >= 0
                  ? a.translateCoinStr(a.initProCoin(i), { unitRange: g_tConst.GameUnit.CrazyZF })
                  : "\u65e0\u9650\u5236";
            this.labelEnterCondition.string = o + "-" + n;
          },
          initOnLinePeople: function () {
            var e = g_oData.get(g_tData.RoomMod).getScenePlayerCount().get(this.objSceneCfg.typeID);
            this.labelOnLineCnt.string = String(e) + "\u4eba";
          },
          initRuleDesc: function () {
            var e = this;
            this.labelRuleDesc.node.active = !1;
            var t = g_oData
                .get(g_tData.PrivateMsgModel)
                .getMjPlayCfgByGameType(this.objSceneCfg.gameType),
              i = "";
            (s.forEach(function (a) {
              if (t.iRule.includes(a.ruleId)) {
                var o = a.desc;
                i += "function" == typeof o ? o(e.objSceneCfg.gameType) : o + "  ";
              }
            }),
              (this.labelDifen.node.y = -3.035),
              i.length > 0 &&
                ((this.labelRuleDesc.string = i.trim()),
                (this.labelRuleDesc.node.active = !0),
                (this.labelDifen.node.y += 8),
                (this.labelRuleDesc.node.color = new cc.Color().fromHEX(n[this._nIndex]))));
          },
          initDiFen: function () {
            this.labelDifen.string = a.translateCoinStr(a.initProCoin(this.objSceneCfg.blind), {
              unitRange: g_tConst.GameUnit.SceneSelect,
            });
          },
          initHSZSign: function () {
            this.nodeHSZSign.active = i.isGameTypeHSZ(this.objSceneCfg.gameType);
          },
          initSixHzSign: function () {
            var e = this.objSceneCfg.gameType == g_tConst.GameTypeCfgs.XLHZMJ3.TYPEID;
            ((this.nodeSixHzSign.active = e),
              !g_oData.get(g_tData.SwitchModel).getXl6hzCfg().showTagLHZ &&
                this.nodeSixHzSign.active &&
                (this.nodeSixHzSign.active = !1));
          },
          initSceneSectionAward: function () {
            var e = g_oData.get(g_tData.SectionMatchMod).isSectionMatchState,
              t = g_oData
                .get(g_tData.PrivateMsgModel)
                .getSceneAddBySceneID(this.objSceneCfg.gameType, this.objSceneCfg.typeID);
            ((this.labelSectionAward.node.active = this.nodeSectionPointSign.active = e && t > 0),
              (this.labelSectionAward.string = "\u6bb5\u4f4d\u5206+" + t + "%"));
          },
          setRecommendScene: function (e) {
            e
              ? ((this.AnimRecommend.node.active = !0), this.AnimRecommend.play())
              : ((this.AnimRecommend.node.active = !1), this.AnimRecommend.stop());
          },
          onClickedMatchItem: function () {
            (o.saveLastGameType(this.objSceneCfg.gameType),
              g_oData.get(g_tData.DianFengSaiMod).canSupportMatch() &&
              g_oData.get(g_tData.DianFengSaiMod).canSupportScene(this.objSceneCfg.typeID)
                ? (this.objSceneCfg && (this.objSceneCfg.showBMTips = !0),
                  g_oLayerManager.emitEvent2Dlg(
                    g_tConst.GameLayerCfg.DianFengSaiBM.id,
                    "ON_INIT",
                    this.objSceneCfg,
                  ))
                : o.enterTable(!0, this.objSceneCfg.typeID));
          },
          showAsDianFeng: function (e) {
            g_oData.get(g_tData.DianFengSaiMod).canSupportMatch() &&
            g_oData.get(g_tData.DianFengSaiMod).canSupportScene(e)
              ? ((this.content.active = !1),
                (this.glow.active = !0),
                (this.SpriteSceneBg.spriteFrame = this.SpriteFrameScene[6]),
                (this.SpriteSceneBg.node.scale = 0.93))
              : (this.SpriteSceneBg.node.scale = 1);
          },
          initFksjccbxpBtn: function (e) {
            var t = g_oData.get(g_tData.SwitchModel).getCrazySjccbxpCfg().showScene,
              i =
                t > 0 &&
                this._hookGameType == g_tConst.GameTypeCfgs.SJCCBXP.TYPEID &&
                e.typeID == t;
            ((this.fxsjccbxpBg.active = i), (this.SpriteSceneBg.node.active = !i));
          },
        }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils", QuikStart: "QuikStart", hallUtils: "hallUtils" },
    ],
