    PassCheckRuleView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "da98clVn+BB7KJ8AnWBG0dc", "PassCheckRuleView");
        var i = e("../../../../../common/component/scrollview/ScrollVCompEEX"),
          a = e("CommonUtils");
        (cc.Class({
          extends: cc.Component,
          properties: {
            rule: cc.Node,
            awardLog: cc.Node,
            ruleLbl: cc.Label,
            nullAwardLbl: cc.Node,
            awardLogList: i,
          },
          initRule: function () {
            ((this.rule.active = !0), (this.awardLog.active = !1));
            for (
              var e =
                  "\u3010\u6bcf\u65e5\u60ac\u8d4f\u3011\n\u5b8c\u6210\u6bcf\u65e5/\u6bcf\u5468\u60ac\u8d4f\u4efb\u52a1\uff0c\u53ef\u4ee5\u83b7\u5f97\u60ac\u8d4f\u4ee4\u4ee5\u53ca\u60ac\u8d4f\u6218\u4ee4\u7ecf\u9a8c\u3002\u6d88\u8017\u60ac\u8d4f\u4ee4\u53ef\u4ee5\u8fdb\u884c\u60ac\u8d4f\u62bd\u5956\uff0c\u83b7\u5f97\u5956\u52b1\u3002\n\u3010\u60ac\u8d4f\u6b21\u6570\u3011\n\u60ac\u8d4f1\u6b21\uff1a\u8fdb\u884c1\u6b21\u60ac\u8d4f\u540e\u5237\u65b0\u5956\u6c60\u3002\n\u60ac\u8d4f5\u6b21\uff1a\u8fdb\u884c5\u6b21\u60ac\u8d4f\u540e\u5237\u65b0\u5956\u6c60\u3002\n\u3010\u6d3b\u52a8\u5237\u65b0\u3011\n\u6d3b\u52a8\u9650\u65f6\u5f00\u542f\uff0c\u6bcf\u5468\u5237\u65b0\u3002\u5237\u65b0\u65f6\u6216\u6d3b\u52a8\u7ed3\u675f\u65f6\uff0c\u672a\u4f7f\u7528\u7684\u9053\u5177\u4f1a\u6309\u71671\uff1a" +
                  a.initProCoin(1e4) +
                  "\u8f6c\u5316\u4e3a\u6e38\u620f\u8c46\u3002\n\u3010\u6982\u7387\u3011\n\u8be6\u7ec6\u6982\u7387\u8bf7\u524d\u5f80\u5927\u5385-\u516c\u544a\u67e5\u770b",
                t = g_oData
                  .get(g_tData.PassCheckMod)
                  .getPassCheckActCfg(g_tConst.PassCheckType.DailyAwardRank),
                i = 0;
              i < t.awardInfo.length;
              i++
            ) {
              var o = t.awardInfo[i],
                n = "award" + (i + 1);
              e = e.replace(n, o.awardName);
            }
            this.ruleLbl.string = e;
          },
          initRuleCard: function () {
            ((this.rule.active = !0),
              (this.awardLog.active = !1),
              (this.ruleLbl.string =
                "\u60ac\u8d4f\u6218\u4ee4\u89c4\u5219\n\u3010\u60ac\u8d4f\u6218\u4ee4\u3011\n\u901a\u8fc7\u5b8c\u6210\u60ac\u8d4f\u4efb\u52a1\uff0c\u53ef\u4ee5\u5347\u7ea7\u60ac\u8d4f\u6218\u4ee4\u7b49\u7ea7\uff0c\u83b7\u53d6\u5bf9\u5e94\u5956\u52b1\u3002\n\u6218\u4ee4\u6bcf\u5468\u91cd\u7f6e\uff0c\u91cd\u7f6e\u540e\u9700\u8981\u91cd\u65b0\u5347\u7ea7\u548c\u8d2d\u4e70\n\u3010\u8be6\u7ec6\u8bf4\u660e\u3011\n1\u3001\u6240\u6709\u7528\u6237\u90fd\u53ef\u4ee5\u9886\u53d6\u666e\u901a\u5956\u52b1\n2\u3001\u8d2d\u4e70\u9ad8\u7ea7\u6218\u4ee4\u53ef\u4ee5\u89e3\u9501\u9ad8\u7ea7\u5956\u52b1"));
          },
          initAwardLog: function () {
            var e;
            ((this.rule.active = !1),
              (this.awardLog.active = !0),
              0 ==
              g_oData
                .get(g_tData.PassCheckMod)
                .getAwardLogPage(g_tConst.PassCheckType.DailyAwardRank)
                ? (g_oData
                    .get(g_tData.PassCheckMod)
                    .reqUserAwardLog(g_tConst.PassCheckType.DailyAwardRank),
                  (this.awardLogList.numItems = 0))
                : ((this._allLog =
                    null !=
                    (e = g_oData
                      .get(g_tData.PassCheckMod)
                      .getAwardLog(g_tConst.PassCheckType.DailyAwardRank))
                      ? e
                      : []),
                  (this.awardLogList.numItems = this._allLog.length)),
              (this.nullAwardLbl.active = 0 == this.awardLogList.numItems));
          },
          onUpdateItem: function (e, t) {
            var i = this._allLog[t],
              a = new Date(1e3 * i.awardDate);
            e.getChildByName("dateLbl").getComponent(cc.Label).string =
              a.getFullYear() + "/" + (a.getMonth() + 1) + "/" + a.getDate();
            var o = i.awardName;
            (o.includes("\u6307\u5c16\u5e01")
              ? (e.getChildByName("LogLbl").getComponent(cc.Label).string =
                  "\u5956\u54c1 \uff1a " + g_oCommonUtils.getBigNum(i.num) + "\u6307\u5c16\u5e01")
              : o.includes("\u6e38\u620f\u8c46")
                ? (e.getChildByName("LogLbl").getComponent(cc.Label).string =
                    "\u5956\u54c1 \uff1a " + g_oCommonUtils.getBigNum(i.num) + "\u6e38\u620f\u8c46")
                : (e.getChildByName("LogLbl").getComponent(cc.Label).string =
                    "\u5956\u54c1 \uff1a " + i.awardName),
              t >= this._allLog.length - 5 &&
                g_oData
                  .get(g_tData.PassCheckMod)
                  .reqUserAwardLog(g_tConst.PassCheckType.DailyAwardRank));
          },
          onClickClose: function () {
            ((this.node.active = !1), g_oData.get(g_tData.PassCheckMod).clearAwardLogPage());
          },
        }),
          cc._RF.pop());
      },
      {
        "../../../../../common/component/scrollview/ScrollVCompEEX": "ScrollVCompEEX",
        CommonUtils: "CommonUtils",
      },
    ],
