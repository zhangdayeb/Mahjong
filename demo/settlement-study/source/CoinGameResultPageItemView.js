    CoinGameResultPageItemView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "76ed619+BxN/ouL3e3lS7SK", "CoinGameResultPageItemView");
        var i = e("CommonUtils");
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            spriteHead: { default: null, type: cc.Sprite, tooltip: "\u73a9\u5bb6\u5934\u50cf" },
            labelNickName: { default: null, type: cc.Label, tooltip: "\u73a9\u5bb6\u6635\u79f0" },
            labelLoseCoin: {
              default: null,
              type: cc.Label,
              tooltip: "\u73a9\u5bb6\u7ed3\u7b97\u8f93\u7684\u79ef\u5206",
            },
            labelWinCoin: {
              default: null,
              type: cc.Label,
              tooltip: "\u73a9\u5bb6\u7ed3\u7b97\u8d62\u5f97\u79ef\u5206",
            },
            itemBgSp: { default: null, type: cc.Sprite, tooltip: "item\u5e95\u56fe" },
            itemBgSpFrame: {
              default: [],
              type: cc.SpriteFrame,
              tooltip: "item\u5e95\u56fe\u56fe\u7247,\u9ec4:0,\u84dd:1",
            },
            bankSp: { default: null, type: cc.Sprite, tooltip: "\u5e84\u5bb6\u6807\u8bc6" },
            spfBankers: {
              default: [],
              type: [cc.SpriteFrame],
              tooltip: "\u5e84\u4e00\u4e8c\u4e09\u6807\u8bc6\u56fe[\u676d\u5dde\u9ebb\u5c06]",
            },
            img_HeadFrame: {
              default: null,
              type: cc.Sprite,
              tooltip: "\u73a9\u5bb6\u5934\u50cf\u6846",
            },
            labelFanCount: {
              default: null,
              type: cc.Label,
              tooltip: "\u73a9\u5bb6\u7684\u603b\u756a\u6570/\u500d\u6570",
            },
            labelMaxFanCount: {
              default: null,
              type: cc.Label,
              tooltip: "\u5c01\u9876\u6807\u8bc6",
            },
            bankruptTag: { default: null, type: cc.Node, tooltip: "\u7834\u4ea7\u6807\u8bc6" },
            lab_Pos: { default: null, type: cc.Label, tooltip: "_\u5bb6" },
            n_bigWinMan: { default: null, type: cc.Node, tooltip: "\u5927\u8d62\u5bb6" },
          },
          Awake: function () {
            (this.onCustomEvent(), (this.bankSp.node.active = !1));
          },
          onCustomEvent: function () {
            var e = this;
            e.node.on(
              "SET_ITEMINFO_COMMON",
              function (t) {
                e.setPlayerInfo(t);
              },
              e,
            );
          },
          setPlayerInfo: function (e) {
            (this.setNickName(e.sNickName),
              this.setWinCoin(e.nWinCoin),
              this.setPlayerHead(e),
              this.setPlayerHeadFrame(e),
              this.setBankerFlag(e.isBanker),
              this.setPlayerFanCountTag(e.GameResultInfo.iMultiple),
              this.setPlayerMaxFanCountTag(e),
              this.setPlayerBankruptTag(e),
              this.setPlayerPos(e.nSeatView),
              this.bigWinMan(e.GameResultInfo));
          },
          bigWinMan: function (e) {
            this.n_bigWinMan.active = e.bigWinMan;
          },
          setPlayerPos: function (e) {
            1 == e
              ? (this.lab_Pos.string = "\u4e0a\u5bb6")
              : 2 == e
                ? (this.lab_Pos.string = "\u5bf9\u5bb6")
                : 3 == e && (this.lab_Pos.string = "\u4e0b\u5bb6");
          },
          setPlayerMaxFanCountTag: function (e) {
            if (
              [g_tConst.GameTypeCfgs.JBCROOMWHMJ.TYPEID].includes(
                MJ.GameLogic.TableModel.getGameType(),
              ) &&
              e.nWinCoin < 0
            ) {
              var t = e.GameResultInfo.stPlayerBalance[e.GameResultInfo.stPlayerBalance.length - 1];
              if (t && t.eBalanceLimit && 1 === t.eBalanceLimit) {
                var i =
                  t.stFanGroup.iTotalFanCount +
                  g_tConst.PluginCfgs[MJ.GameLogic.TableModel.getGameType()].FanUnit;
                this.labelMaxFanCount &&
                  ((this.labelMaxFanCount.string = i),
                  (this.labelMaxFanCount.node._parent.active = !0));
              }
            }
          },
          setPlayerBankruptTag: function (e) {
            if (
              [g_tConst.GameTypeCfgs.JBCROOMWHMJ.TYPEID].includes(
                MJ.GameLogic.TableModel.getGameType(),
              ) &&
              e.nWinCoin < 0
            ) {
              var t = e.GameResultInfo.stPlayerBalance[e.GameResultInfo.stPlayerBalance.length - 1];
              t &&
                t.eBalanceLimit &&
                2 === t.eBalanceLimit &&
                this.bankruptTag &&
                (this.bankruptTag.active = !0);
            }
          },
          setPlayerFanCountTag: function (e) {
            [g_tConst.GameTypeCfgs.JBCROOMWHMJ.TYPEID].includes(
              MJ.GameLogic.TableModel.getGameType(),
            )
              ? ((this.labelFanCount.string = "x" + e),
                (this.labelFanCount.node._parent.active = !0))
              : (this.labelFanCount.node._parent.active = !1);
          },
          setBankerFlag: function (e) {
            ((this.bankSp.node.active = e),
              -1 !== MJ.GameLogic.PlayerModel.getBankType() &&
                (this.bankSp.spriteFrame =
                  this.spfBankers[MJ.GameLogic.PlayerModel.getBankType() - 1]));
          },
          setNickName: function (e) {
            this.labelNickName.string = i.getFitSubStringByLen(String(e), 10);
          },
          setWinCoin: function (e) {
            var t = void 0;
            if (e >= 0) {
              var a = i.translateCoinStr(i.initProCoin(e));
              ((this.labelWinCoin.string = a),
                (this.labelWinCoin.node.active = !0),
                (this.labelLoseCoin.node.active = !1),
                (t = this.itemBgSpFrame[0]),
                (this.labelNickName.node.color = new cc.Color().fromHEX("#F02C18")));
            } else {
              var o = i.translateCoinStr(i.initProCoin(-e));
              ((this.labelLoseCoin.string = "-" + o),
                (this.labelWinCoin.node.active = !1),
                (this.labelLoseCoin.node.active = !0),
                (t = this.itemBgSpFrame[1]),
                (this.labelNickName.node.color = new cc.Color().fromHEX("#3832BD")));
            }
            this.itemBgSp.spriteFrame = t;
          },
          setPlayerHead: function (e) {
            var t = e.sHeadUrl,
              a = e.nUserID;
            (a != g_oPlatform.getUserId() &&
              (t = i.getLiveModeDefaultHead({ userID: a, headUrl: t })),
              g_oData.get(g_tData.comHead).loadHead(t, this.spriteHead));
          },
          setPlayerHeadFrame: function (e) {
            if (((this.img_HeadFrame.node.active = !1), e.nUserID >= 0)) {
              var t = MJ.GameLogic.PlayerModel.getPlayerInfoByUserId(e.nUserID);
              if (t) {
                var i = t.useIds;
                if (Array.isArray(i)) {
                  var a = i[g_tConst.ServerBagType.HeadFrame];
                  g_oData.get(g_tData.comHeadFrame).loadHeadFrameWithCurUse(this.img_HeadFrame, a);
                }
              }
            }
          },
        }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils" },
    ],
