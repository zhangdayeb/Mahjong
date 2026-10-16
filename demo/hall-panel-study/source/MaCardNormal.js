    MaCardNormal: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "9b8b4AUtKdNjoXL4QX+quUz", "MaCardNormal"),
          cc.Class({
            extends: Cls_BaseView,
            properties: {
              ScrollContent: cc.Node,
              NoGetNode: cc.Node,
              TimeBgIcon: cc.Node,
              ShowNumTipLabel: cc.Label,
              AlreadyGetNode: cc.Node,
              DownTimeLabelArr: [cc.Label],
              RegressionAct: cc.Node,
              _ShowDataInfo: null,
            },
            start: function () {
              ((this._showTipsBool = g_oData.get(g_tData.RegressionActMod).getLeftTime() > 0),
                (this.NoGetNode.active = !0),
                (this.AlreadyGetNode.active = !1),
                this.updateGetNodeState());
            },
            onInitMaCardDetailInfo: function (e, t, i, a) {
              (void 0 === a && (a = null), this.ScrollContent.removeAllChildren());
              var o = this.getShowDataInfo(),
                n = o.length,
                s = g_oData
                  .get(g_tData.MakabakaMod)
                  .getPointMkbkCfgByMid(g_tConst.SubEffectItem.MaKaBaKaID);
              console.log("max147222 onInitMaCardDetailInfo nCfg = ", s);
              for (var r = 0; r < n; r++) {
                var c = o[r],
                  l = g_oPrefabLoader
                    .instantiate(e, this.ScrollContent)
                    .getComponent("WelfareTypeItem"),
                  g = c.TitleIcon - 1,
                  d = { infoItem: c, nCfg: s };
                l.initItem(d, t[g], i, r);
              }
            },
            getShowDataInfo: function () {
              isNull(this._ShowDataInfo) &&
                (this._ShowDataInfo = [
                  {
                    TitleIcon: 1,
                    TitleStr: "\u9876\u7ea7\u7279\u6743",
                    ListInfoArr: [
                      {
                        IconNum: 1,
                        TitleStr: "\u514d\u5e7f\u544a",
                        SubStr:
                          "\u6bcf\u65e5\u603b\u8ba1*\u6b21\u514d\u5e7f\u544a\u9886\u53d6\u5bf9\u5c40\u5956\u52b1",
                        ItemKey: "noAddTimes",
                      },
                      {
                        IconNum: 2,
                        TitleStr: "\u5341\u8fde\u53d1\u8868\u60c5",
                        SubStr: "\u5bf9\u5c40\u8868\u60c5\n\u53ef\u4ee510\u8fde\u53d1",
                      },
                      {
                        IconNum: 3,
                        TitleStr: "\u4e13\u5c5e\u5bf9\u8bdd",
                        SubStr: "\u4e13\u5c5e\u5bf9\u8bdd\u6846\u53ca\u5feb\u6377\u8bed",
                      },
                      {
                        IconNum: 4,
                        TitleStr: "\u9632\u9a9a\u6270",
                        SubStr:
                          "\u53ef\u5c4f\u853d\u522b\u4eba\u7684\u4e92\u52a8\u8868\u60c5\u548c\u804a\u5929",
                      },
                      {
                        IconNum: 5,
                        TitleStr: "\u8e22\u4eba\u9632\u8e22",
                        SubStr: "\u623f\u95f4\u53ef\u4ee5\u8e22\u4eba\u53ca\u9632\u8e22",
                      },
                    ],
                  },
                  {
                    TitleIcon: 2,
                    TitleStr: "\u798f\u5229\u653e\u9001",
                    ListInfoArr: [
                      {
                        IconNum: 6,
                        TitleStr: "\u6e38\u620f\u8c46\u83b7\u5f97",
                        SubStr:
                          "\u8d2d\u4e70{0}\u9ebb\u5361\u5df4\u5361\u7acb\u5f97{1}\u6e38\u620f\u8c46",
                        ItemKey2: "Coin_GET",
                      },
                      {
                        IconNum: 7,
                        TitleStr: "\u7279\u5b9a\u5934\u50cf\u6846",
                        SubStr: "\u4e13\u5c5e\u5934\u50cf\u6846\u4f7f\u7528\u6743",
                      },
                      {
                        IconNum: 8,
                        TitleStr: "\u767b\u9646\u798f\u5229",
                        SubStr:
                          "\u6bcf\u65e5\u9996\u6b21\u767b\u9646*\u500d\u9886\u53d6\u5956\u52b1",
                        ItemKey: "dailyAttTimes",
                      },
                      {
                        IconNum: 9,
                        TitleStr: "\u8d85\u5e78\u8fd0\u8f6c\u76d8",
                        SubStr: "\u989d\u5916\u62e5\u6709*\u6b21\u8f6c\u76d8\u673a\u4f1a",
                        ItemKey2: "Special_Roulette",
                      },
                    ],
                  },
                  {
                    TitleIcon: 3,
                    TitleStr: "\u91d1\u8c46\u591a\u591a",
                    ListInfoArr: [
                      {
                        IconNum: 10,
                        TitleStr: "\u7ffb\u76d8\u52a9\u529b",
                        SubStr: "\u7834\u4ea7\u4fdd\u62a4\u5956\u52b1\u52a0\u500d",
                      },
                      {
                        IconNum: 12,
                        TitleStr: "\u6d77\u91cf\u91d1\u8c46",
                        SubStr: "\u5bf9\u5c40\u83b7\u5f97\u91d1\u8c46\u52a0\u6210\u6700\u9ad8*%",
                        ItemKey: "buffCoinRoundRate",
                      },
                      {
                        IconNum: 13,
                        TitleStr: "2V2\u591a\u8d62\u5c11\u8f93",
                        SubStr: "\u8d62\u8c46\u589e\u52a0*%\n\u8f93\u8c46\u51cf\u5c11*%",
                        ItemKey: "buff2V2Rate",
                      },
                    ],
                  },
                  {
                    TitleIcon: 4,
                    TitleStr: "\u66f4\u591a\u7279\u6743",
                    ListInfoArr: [
                      {
                        IconNum: 14,
                        TitleStr: "\u65e0\u9650\u7545\u73a9",
                        SubStr: "\u8bb0\u724c\u5668\u65e0\u9650\u6b21\u4f7f\u7528",
                      },
                    ],
                  },
                ]);
              var e = !1;
              if (!g_oData.get(g_tData.SwitchModel).getRecorderCfg().show)
                for (var t = this._ShowDataInfo.length - 1; t >= 0 && !e; t--) {
                  for (var i = this._ShowDataInfo[t].ListInfoArr, a = 0; a < i.length; a++)
                    if (14 === i[a].IconNum) {
                      (1 === i.length ? this._ShowDataInfo.splice(t, 1) : i.splice(a, 1), (e = !0));
                      break;
                    }
                  if (e) break;
                }
              return this._ShowDataInfo;
            },
            updateGetNodeState: function () {
              var e = g_oData.get(g_tData.MakabakaMod).isMKBK;
              ((this.NoGetNode.active = !e),
                (this.AlreadyGetNode.active = e),
                this.settingDownTimeInfo(e),
                !e &&
                this._showTipsBool &&
                g_oData.get(g_tData.RegressionActMod).checkMKBKNeedShowTips()
                  ? ((this.RegressionAct.active = !0), (this.NoGetNode.active = !1))
                  : (this.RegressionAct.active = !1));
            },
            settingDownTimeInfo: function (e) {
              if ((void 0 === e && (e = !1), e)) {
                this.callback && this.unschedule(this.callback);
                var t = g_oData.get(g_tData.MakabakaMod).MKBKExpireTime,
                  i = new Date(parseInt(1e3 * t)),
                  a = new Date(1e3 * g_oData.get(g_tData.sdkLogin).serverTime),
                  o = Date.parse(new Date(a)),
                  n = Date.parse(new Date(i)) - o,
                  s = Math.floor(n / 864e5),
                  r = n % 864e5,
                  c = Math.floor(r / 36e5),
                  l = r % 36e5,
                  g = Math.floor(l / 6e4),
                  d = l % 6e4,
                  h = Math.floor(d / 1e3);
                ((this.callback = function () {
                  (0 == h &&
                    ((h = 60),
                    g > 0
                      ? (g -= 1)
                      : c > 0
                        ? ((c -= 1), (g = 59), (h = 60))
                        : s > 0
                          ? ((s -= 1), (c = 23), (g = 59), (h = 60))
                          : ((h = 0), this.unschedule(this.callback), this.updateGetNodeState())),
                    (h -= 1),
                    (this.DownTimeLabelArr[0].string = parseInt(s / 100)),
                    (this.DownTimeLabelArr[1].string = parseInt(s / 10) - 10 * parseInt(s / 100)),
                    (this.DownTimeLabelArr[2].string = parseInt(s % 10)),
                    (this.DownTimeLabelArr[3].string = parseInt(c / 10)),
                    (this.DownTimeLabelArr[4].string = parseInt(c % 10)),
                    (this.DownTimeLabelArr[5].string = parseInt(g / 10)),
                    (this.DownTimeLabelArr[6].string = parseInt(g % 10)));
                }),
                  this.callback(),
                  this.schedule(this.callback, 1));
              }
            },
            onDestroy: function () {
              cc.isValid(this.Node) && this.unschedule(this.callback);
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
