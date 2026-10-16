    MatchPlayType: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "0f937xxQFZG/rJ8QUAokdAh", "MatchPlayType");
        var i = e("PopDlgBaseView"),
          a = (e("CommonUtils"), e("CommonPlat"), e("PopDlgCtrl")),
          o = e("hall_TileDefine").HallGameTypeName;
        (cc.Class({
          extends: i,
          properties: {
            ScreenMask: cc.Node,
            AllNode: cc.Node,
            TopNode: cc.Node,
            MainNode: cc.Node,
            CommNodeRoot2: cc.Node,
            CommNodeRoot3: cc.Node,
            MatchShopNode: cc.Node,
            NiuRankEnter: cc.Node,
            LeagueRewardEnter: cc.Node,
            PlayItemPre: cc.Prefab,
            ContentLayout: cc.Layout,
            typeBgSF: [cc.SpriteFrame],
            typeBgIconSF: [cc.SpriteFrame],
            TagSpArr: [cc.SpriteFrame],
            lab_Title: cc.Label,
            lab_spellTitle: cc.Label,
            GuidePre: cc.Prefab,
            SectionSp: [cc.SpriteFrame],
            Comcontent: cc.Node,
            _ShowTime: 0.3,
            wgt_close: cc.Widget,
            _isYULE: !1,
          },
          Awake: function () {
            ((this.lab_TitleArr = [
              "\u6bd4\u8d5b\u573a",
              "\u8d5b\u4e8b\u4e2d\u5fc3",
              "\u5a31\u4e50",
            ]),
              (this.lab_spellTitleArr = ["BISAICHANG", "SAISHIZHONGXIN", "YULE"]),
              (this.ScreenMask.active = !0),
              (this.NiuRankEnter.active = !1),
              (this.LeagueRewardEnter.active = !1),
              (this._IsNeedGuide = !1),
              this.onMessageEvent(),
              this.onCustomEvent(),
              this.initLeagueReward());
          },
          start: function () {
            (this._super(), this.setNodeAnimation(), this.setBtnPos());
          },
          onCustomEvent: function () {
            (this.node.on("MatchPlayType_Init", this.onInit, this),
              this.node.on("MatchPlayType_Init_Match", this.onInitMatch, this),
              this.node.on("MatchPlayType_Init_YuLe", this.onInitYuLe, this));
          },
          onMessageEvent: function () {
            this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.START_OTHER_LIST_ANIMATION,
                function () {
                  this.setNodeAnimation();
                },
                this,
              ),
            );
          },
          onInit: function (e) {
            void 0 === e && (e = null);
          },
          initLeagueReward: function () {
            g_oData.get(g_tData.SwitchModel).getLeagueRewardEntry() &&
              (this.LeagueRewardEnter.active = !0);
          },
          onInitMatch: function (e) {
            (void 0 === e && (e = {}),
              Log.info("max147999 MatchPlayType_Init_Match onInitMatch data = ", e),
              (this.lab_Title.string = this.lab_TitleArr[1]),
              (this.lab_spellTitle.string = this.lab_spellTitleArr[1]));
            var t = [1, 5];
            if (
              (g_oData.get(g_tData.SwitchModel).isCheckHandle() && (t = [1]),
              !isNull(e) && !isNull(e.enterArr))
            ) {
              var i = e.enterArr.split("|") || [];
              i.length > 0 && (t = i);
            }
            var a = [];
            if (!isNull(e) && !isNull(e.tagArr)) {
              var o = e.tagArr.split("|") || [];
              o.length > 0 && (a = o);
            }
            (this.__showListEnterInfo(t, a), this.closeComNode());
          },
          onInitYuLe: function (e) {
            (void 0 === e && (e = {}),
              (this._isYULE = !0),
              Log.info("max147999 MatchPlayType_Init_YuLe onInitYuLe data = ", e),
              (this.NiuRankEnter.active = !1),
              (this.LeagueRewardEnter.active = !1),
              (this.lab_Title.string = this.lab_TitleArr[2]),
              (this.lab_spellTitle.string = this.lab_spellTitleArr[2]));
            var t = [2, 3];
            if (!isNull(e) && !isNull(e.enterArr)) {
              var i = e.enterArr.split("|") || [];
              i.length > 0 && (t = i);
            }
            var a = [];
            if (!isNull(e) && !isNull(e.tagArr)) {
              var o = e.tagArr.split("|") || [];
              o.length > 0 && (a = o);
            }
            (this.__showListEnterInfo(t, a), this.closeComNode());
          },
          __showListEnterInfo: function (e, t) {
            var i = this;
            (void 0 === e && (e = []),
              void 0 === t && (t = []),
              this.ContentLayout.node.removeAllChildren(),
              1 == e.length
                ? ((this.ContentLayout.spacingX = 0), (this.ContentLayout.paddingLeft = 450))
                : 2 == e.length
                  ? ((this.ContentLayout.spacingX = 185),
                    (this.ContentLayout.paddingLeft = 150),
                    (this.ContentLayout.paddingRight = 120))
                  : e.length > 2 &&
                    ((this.ContentLayout.spacingX = 35),
                    (this.ContentLayout.paddingLeft = 15),
                    (this.ContentLayout.paddingRight = 15)));
            var a = this.ContentLayout.node;
            (console.log("max1479999 __showListEnterInfo enterArr = ", e),
              e.forEach(function (e, n) {
                if (!isNull(e)) {
                  var s = parseInt(e),
                    r = g_oPrefabLoader.instantiate(i.PlayItemPre, a);
                  if (s >= 0 && s != o.Match.id) {
                    var c = r.getComponent("MatchPlayTypeItemView"),
                      l = { TileIdx: s },
                      g = parseInt(t[n]),
                      d = n % i.typeBgSF.length,
                      h = (s % 100) % i.typeBgIconSF.length,
                      u = i.typeBgSF[d],
                      _ = !1;
                    14 == e
                      ? ((u = i.SectionSp[0]), (_ = !0))
                      : 1 == e
                        ? (u = i.SectionSp[1])
                        : (4 != e && 5 != e) ||
                          ((i.NiuRankEnter.active = !0), (u = i.SectionSp[2]));
                    var m = {
                      typeBg: u,
                      typeBgIcon: i.typeBgIconSF[h],
                      TagIcon: g > 0 ? i.TagSpArr[g - 1] : null,
                      isLeagueMatch: _,
                      ele: e,
                      isYULE: i._isYULE,
                    };
                    c.onInitItem(l, m);
                  } else r.destroy();
                }
              }));
          },
          initTopMatch: function () {
            (g_oData.get(g_tData.SwitchModel).isCheckHandle() ||
              (g_oPrefabLoader.loadRes(g_tAsset.GoldEggNumPrefab, this.CommNodeRoot2, function (e) {
                e.emit("SHOW_ADD_COIN_BTN", !0);
              }),
              g_oPrefabLoader.loadRes(g_tAsset.FuCardNumPrefab, this.CommNodeRoot3, function (e) {
                e.emit("SHOW_ADD_COIN_BTN", !0);
              })),
              (this.MatchShopNode.active = !1));
          },
          initTopYuLe: function () {
            (g_oPrefabLoader.loadRes(g_tAsset.DiamondNumPrefab, this.CommNodeRoot2, function (e) {
              e.emit("SHOW_ADD_COIN_BTN", !0);
            }),
              (this.MatchShopNode.active = !1));
          },
          setNodeAnimation: function () {
            var e = this;
            if (1 != this._ShowAnimation) {
              ((this._ShowAnimation = !0), (this.ScreenMask.active = !0));
              var t = cc.view.getDesignResolutionSize(),
                i = 0.5 * t.height,
                a = 0.5 * t.width,
                o = cc.v2(0, i),
                n = this.TopNode.height + i + 20;
              this.TopNode.y = n;
              var s = cc.v2(0, 0),
                r = 0.5 * this.MainNode.width + a + 20;
              this.MainNode.x = r;
              var c = this._ShowTime;
              (this.setNodeShowAnimation(
                this.TopNode,
                o,
                function () {
                  ((e.ScreenMask.active = !1), (e._ShowAnimation = !1));
                },
                c,
                0.01,
                !1,
              ),
                this.setNodeShowAnimation(
                  this.MainNode,
                  s,
                  function () {
                    ((e.ScreenMask.active = !1), (e._ShowAnimation = !1));
                  },
                  c,
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
          setBtnPos: function () {
            cc.winSize.width >= 1380 &&
              ((this.wgt_close.left = (cc.winSize.width - 1380) / 2),
              this.wgt_close.updateAlignment());
          },
          onClickMatchShopBtn: function () {
            g_oLayerManager.emitEvent2Dlg(
              g_tConst.GameLayerCfg.MatchShop.id,
              "MatchShop_Init",
              null,
            );
          },
          onClickCloseView: function () {
            ((this._ShowAnimation = !1),
              g_oData.get(g_tData.HistoryMod).dismiss(g_tConst.HistoryRecordLayer.MatchPlayType),
              this.close(),
              a.getPopList().length > 0 ||
                g_oEvent.dispatchEvent(g_tEvent.START_MAIN_LIST_ANIMATION));
          },
          onClickOnePlayItem: function () {
            (g_oLayerManager.emitEvent2Dlg(
              g_tConst.GameLayerCfg.MatchSelect.id,
              "MatchSelect_Init",
              { matchSingleType: g_tConst.MatchSingleType.XZDD },
            ),
              g_oData
                .get(g_tData.gameReportData)
                .reportClickAction(
                  g_tConst.ReportCfg.ClickActionReport.ClickMatchPlayTypeOneEnter,
                ));
          },
          onClickOnePlayXlhzItem: function () {
            (g_oLayerManager.emitEvent2Dlg(
              g_tConst.GameLayerCfg.MatchSelect.id,
              "MatchSelect_Init",
              { matchSingleType: g_tConst.MatchSingleType.XLHZ },
            ),
              g_oData
                .get(g_tData.gameReportData)
                .reportClickAction(
                  g_tConst.ReportCfg.ClickActionReport.ClickMatchPlayTypeXlhzEnter,
                ));
          },
          onClick2v2PlayItem: function () {
            (g_oData.get(g_tData.mod_TwoFight).setPlayTypeInfo(g_tConst.GameTypeCfgs.MATCHXL2V2),
              g_oLayerManager.emitEvent2Dlg(
                g_tConst.GameLayerCfg.MatchTwoFight.id,
                "MatchTwoFight_Init",
                null,
              ),
              g_oData
                .get(g_tData.gameReportData)
                .reportClickAction(
                  g_tConst.ReportCfg.ClickActionReport.ClickMatchPlayType2v2Enter,
                ));
          },
          onClickFreeTablePlayItem: function () {
            (g_oLayerManager.emitEvent2Dlg(
              g_tConst.GameLayerCfg.MatchFreeTable.id,
              "MatchFreeTable_Init",
              null,
            ),
              g_oData
                .get(g_tData.gameReportData)
                .reportClickAction(
                  g_tConst.ReportCfg.ClickActionReport.ClickMatchPlayTypeFreeTableEnter,
                ));
          },
          onClickNiuRankEnter: function () {
            (g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.MatchNiuRank.id, "SHOW"),
              g_oData
                .get(g_tData.gameReportData)
                .reportClickAction(g_tConst.ReportCfg.ClickActionReport.ClickMatchNiuRankEnter));
          },
          closeComNode: function () {
            (this.CommNodeRoot2.children.length <= 0 && (this.CommNodeRoot2.active = !1),
              this.CommNodeRoot3.children.length <= 0 && (this.CommNodeRoot3.active = !1));
          },
          close: function () {
            this._super();
          },
        }),
          cc._RF.pop());
      },
      {
        CommonPlat: "CommonPlat",
        CommonUtils: "CommonUtils",
        PopDlgBaseView: "PopDlgBaseView",
        PopDlgCtrl: "PopDlgCtrl",
        hall_TileDefine: "hall_TileDefine",
      },
    ],
