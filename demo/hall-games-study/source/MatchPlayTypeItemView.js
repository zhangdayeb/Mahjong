    MatchPlayTypeItemView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "d6aaaMJn9ZE/olroIEUiC0I", "MatchPlayTypeItemView");
        var i = e("hall_TileDefine").HallGameTypeName,
          a = e("CommonUtils");
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            TagIcon: cc.Sprite,
            ShowIcon: cc.Sprite,
            bgIcon: cc.Sprite,
            TextLabel: cc.Label,
            lab_spell: cc.Label,
            _ClickCb: null,
            _AllInfo: null,
          },
          Awake: function () {
            ((this._clickFunc = null),
              (this.TagIcon.node.active = !1),
              (this.TextLabel.string = ""),
              this.onCustomEvent());
          },
          onCustomEvent: function () {},
          onInitItem: function (e, t) {
            ((this.bgIcon.node.active = !0),
              (this.TagIcon.node.active = !0),
              (this.TextLabel.node.active = !0),
              (this._AllInfo = e),
              (this.TextLabel.string = ""),
              isNull(t.TagIcon)
                ? (this.TagIcon.node.active = !1)
                : ((this.TagIcon.spriteFrame = t.TagIcon), (this.TagIcon.node.active = !0)),
              isNull(t.typeBg) ||
                isNull(t.typeBgIcon) ||
                ((this.ShowIcon.spriteFrame = t.typeBg), (this.bgIcon.spriteFrame = t.typeBgIcon)),
              this.__setShowInfo(e),
              (14 != t.ele && 1 != t.ele && 4 != t.ele && 5 != t.ele) ||
                (this.bgIcon.node.active = !1),
              t.isYULE && (this.TextLabel.node.y += 15));
          },
          onClickItemAction: function () {
            isNull(this._clickFunc) || this._clickFunc();
          },
          __setShowInfo: function (e) {
            var t = this,
              a = e.TileIdx,
              o = null,
              n = null;
            switch (a) {
              case i.Section.id:
                ((o = i.Section.Name),
                  (n = i.Section.spellName),
                  (this._clickFunc = function () {
                    t.onClickSectionEntry();
                  }));
                break;
              case i.TwoVsTwo.id:
                ((o = i.TwoVsTwo.Name),
                  (n = i.TwoVsTwo.spellName),
                  (this._clickFunc = function () {
                    t.onClick2v2();
                  }));
                break;
              case i.XLhzTwoVsTwo.id:
                ((o = i.XLhzTwoVsTwo.Name),
                  (n = i.XLhzTwoVsTwo.spellName),
                  (this._clickFunc = function () {
                    t.onClickXlhz2v2();
                  }));
                break;
              case i.Match.id:
                ((o = i.Match.Name), (n = i.Match.spellName));
                break;
              case i.MatchXzdd.id:
                ((o = i.MatchXzdd.Name),
                  (n = i.MatchXzdd.spellName),
                  (this._clickFunc = function () {
                    t.onClickMatchOnePlay();
                  }));
                break;
              case i.MatchTwoVsTwo.id:
                ((o = i.MatchTwoVsTwo.Name),
                  (n = i.MatchTwoVsTwo.spellName),
                  (this._clickFunc = function () {
                    t.onClickMatch2v2Play();
                  }));
                break;
              case i.MatchFreeTable.id:
                ((o = i.MatchFreeTable.Name),
                  (n = i.MatchFreeTable.spellName),
                  (this._clickFunc = function () {
                    t.onClickFreeTablePlay();
                  }));
                break;
              case i.MatchXlhz.id:
                ((o = i.MatchXlhz.Name),
                  (n = i.MatchXlhz.spellName),
                  (this._clickFunc = function () {
                    t.onClickOnePlayXlhz();
                  }));
                break;
              case i.Zjroom.id:
                ((o = i.Zjroom.Name),
                  (n = i.Zjroom.spellName),
                  (this._clickFunc = function () {
                    g_oLayerManager.emitEvent2Dlg(
                      g_tConst.GameLayerCfg.Hall_DiyRoomSel.id,
                      "ON_INIT",
                    );
                  }));
                break;
              case i.LeagueMatch.id:
                ((o = i.LeagueMatch.Name),
                  (n = i.LeagueMatch.spellName),
                  (this._clickFunc = function () {
                    t.onClickLeagueMatch();
                  }));
                break;
              default:
                a >= 100 && this.showAsRegular(a);
            }
            (!isNull(o) && (this.TextLabel.string = o),
              !isNull(o) && (this.lab_spell.string = n),
              !isNull(o) && console.log("Roy", o));
          },
          onClickLeagueMatch: function () {
            (g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.LeagueMatchHall.id, "on_Init", {
              matchSingleType: g_tConst.MatchSingleType.LeagueMatch,
            }),
              g_oData
                .get(g_tData.gameReportData)
                .reportClickAction(
                  g_tConst.ReportCfg.ClickActionReport.ClickMatchPlayTypeLeagueMatch,
                ));
          },
          onClickLzxlMj: function () {
            this.enterCommonGameType({
              TYPEID: g_tConst.GameTypeCfgs.LZXLMJ.TYPEID,
              Name: i.Lzxl.Name,
            });
          },
          onClickXlhzMj: function () {
            this.enterCommonGameType({
              TYPEID: g_tConst.GameTypeCfgs.XLHZMJ2.TYPEID,
              Name: i.Xlhz.Name,
            });
          },
          onClickOnePlayXlhz: function () {
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
          onClickFreeTablePlay: function () {
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
          onClickMatch2v2Play: function () {
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
          onClickMatchOnePlay: function () {
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
          onClickXlhz2v2: function () {
            (g_oData
              .get(g_tData.gameReportData)
              .recordStartAction(g_tConst.ReportCfg.QuickStart.Area1),
              g_oData.get(g_tData.mod_TwoFight).setPlayTypeInfo(g_tConst.GameTypeCfgs.JBCXLHZ2V2),
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_TwoFight.id, "ON_INIT"));
          },
          onClick2v2: function () {
            (g_oData
              .get(g_tData.gameReportData)
              .recordStartAction(g_tConst.ReportCfg.QuickStart.Area1),
              g_oData.get(g_tData.mod_TwoFight).setPlayTypeInfo(g_tConst.GameTypeCfgs.JBCXL2V2),
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_TwoFight.id, "ON_INIT"));
          },
          onClickSectionEntry: function () {
            g_oData.get(g_tData.SectionMatchMod).isSectionOpen
              ? (g_oData
                  .get(g_tData.gameReportData)
                  .recordStartAction(g_tConst.ReportCfg.QuickStart.SectionMain),
                g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.SectionMatch.id, "ON_INIT"),
                g_oData
                  .get(g_tData.gameReportData)
                  .reportClickAction(g_tConst.ReportCfg.ClickActionReport.ClickHallSectionHotEnter))
              : g_oPlatform.doAction(
                  g_tConst.tPlatActionId.actionShowToast,
                  "\u6682\u672a\u5f00\u653e\uff0c\u656c\u8bf7\u671f\u5f85!",
                );
          },
          getGameTypeCfg: function (e, t) {
            for (var i in g_tConst.GameTypeCfgs)
              if (g_tConst.GameTypeCfgs.hasOwnProperty(i)) {
                var a = g_tConst.GameTypeCfgs[i];
                if (a.TYPEID === e) return void (t && t(a));
              }
          },
          checkGameType: function (e) {
            switch (e) {
              case g_tConst.GameTypeCfgs.XLHZMJ.TYPEID:
              case g_tConst.GameTypeCfgs.XLHZMJ2.TYPEID:
              case g_tConst.GameTypeCfgs.XLHZMJ3.TYPEID:
              case g_tConst.GameTypeCfgs.XLHZMJ4.TYPEID:
              case g_tConst.GameTypeCfgs.LZXLMJ.TYPEID:
              case g_tConst.GameTypeCfgs.LS6HZ.TYPEID:
            }
            return !1;
          },
          showAsRegular: function (e, t) {
            void 0 === t && (t = null);
            var i = t;
            if (
              (isNull(i) &&
                this.getGameTypeCfg(e, function (e) {
                  i = e;
                }),
              isNull(i))
            )
              console.error(
                "MatchPlayTypeItemView showAsRegular \u73a9\u6cd5\u914d\u7f6e\u6709\u95ee\u9898\uff0c\u8bf7\u68c0\u67e5\u5f00\u5173\u914d\u7f6e gameType=",
                e,
              );
            else {
              if (this.checkGameType(i.TYPEID)) return;
              ((this.TextLabel.string = i.Name.replace("\u9ebb\u5c06", "")),
                console.log("Roy", i.Name.replace("\u9ebb\u5c06", "")),
                (this.gameType = i.TYPEID),
                (this.lab_spell.string = a.getSpellName(i.TYPEID)));
              var o = this;
              this._clickFunc = function () {
                o.enterCommonGameType(i);
              };
            }
          },
          enterCommonGameType: function (e) {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_TabelSel.id, "onInit", {
              nGameType: e.TYPEID,
              sGameName: e.Name,
              isHallCome: !0,
            });
          },
        }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils", hall_TileDefine: "hall_TileDefine" },
    ],
