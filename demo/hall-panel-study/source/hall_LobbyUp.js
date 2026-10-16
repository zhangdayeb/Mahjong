    hall_LobbyUp: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "7f1bbcCMCBM/biJeSZUzc8z", "hall_LobbyUp");
        var i = e("CommonPlat"),
          a = e("hall_TileDefine").HallGameTypeName;
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            lab_name: cc.Label,
            nodeAuthorizeTip: cc.Node,
            head_node: cc.Node,
            img_HeadFrame: cc.Sprite,
            MaCardHeadFrame: cc.Sprite,
            img_MJPath: cc.Sprite,
            lab_rank: {
              default: null,
              type: cc.Label,
              tooltip: "\u96c0\u795e\u4e4b\u8def\u7b49\u7ea7",
            },
            lab_province: {
              default: null,
              type: cc.Label,
              tooltip: "\u5f53\u524d\u7701\u4efd\u7684\u6807\u7b7e",
            },
            img_province: cc.Node,
            SectionEntry: cc.Node,
            MatchEntry: cc.Node,
          },
          Awake: function () {
            ((this.MatchEntry.active = !1),
              (this.MaCardHeadFrame.node.active = !1),
              this.onCustomEvent(),
              this.onMessageEvent());
          },
          start: function () {
            this.initUI();
          },
          onCustomEvent: function () {},
          onMessageEvent: function () {
            var e = this;
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.SCMJ_REQ_GAME_CONFIG_FINISH,
                function () {
                  e.SectionEntry.active = !1;
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.SDK_USER_INFO_CHG,
                  function () {
                    this.updatePlayerHeadFrame();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.SDK_NOTIFY_USER_INFO,
                  function () {
                    this.updatePlayerHeadFrame();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.PLAT_EVENT_GAME_EFFECT_ITEM_UPDATE,
                  function () {
                    this.updatePlayerHeadFrame();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.ON_USEGOODS_SUC,
                  function (e) {
                    var t = g_tConst.ServerBagType.HeadFrame;
                    e.types.indexOf(t) >= 0 && this.updatePlayerHeadFrame();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.ON_GET_BACKPACKGOOD_SUC,
                  function () {
                    this.updatePlayerHeadFrame();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  "UPDATE_USERINFO_AFTER_AUTHORIZE",
                  function () {
                    (Log.info(
                      "authorize userInfo nickname = ",
                      g_oPlatform.getNickName(),
                      "head url=",
                      g_oPlatform.getHeadUrl(),
                    ),
                      (this.lab_name.string = g_oPlatform.getNickName()),
                      this.updateUserHead(),
                      this.isPopAuthorize());
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.AREAMOD_ON_CURAREA_CHANGE,
                  this.updateProvince,
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.PRIVATEMSG_ON_MJDATA_BUILD,
                  this.updateProvince,
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.MKBK_STATE_CHANGE,
                  function () {
                    this.updatePlayerHeadFrame();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.BACKPACK_GOOD_EXPIRED,
                  function (e) {
                    e.type == g_tConst.ServerBagType.HeadFrame && this.updatePlayerHeadFrame();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GET_MJ_PATH_DATA,
                  function () {
                    this.setMJMPath();
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.REFRESH_MJ_MASTER_PATH_RANK,
                  function () {
                    e.checkShowRankRedNode();
                  },
                  this,
                ),
              ));
          },
          initUI: function () {
            var e = this;
            ((this.lab_name.string = g_oPlatform.getNickName()),
              this.updatePlayerHeadFrame(),
              this.isPopAuthorize(),
              g_oData.get(g_tData.Login).getIsAuthorize(function () {
                e.isPopAuthorize();
              }),
              this.updateUserHead(),
              this.updateProvince(),
              this.checkHallEntranceLayout(),
              this.setMJMPath());
          },
          setMJMPath: function () {
            var e, t;
            if (
              g_oData.get(g_tData.SwitchModel).isCheckReferral() ||
              !g_oData.get(g_tData.MJMasterPathMod).mjMasterPathData ||
              !g_oData.get(g_tData.MJMasterPathMod).mjMasterPathData.isOpen
            )
              return (
                (this.img_MJPath.node.active = !1),
                (this.lab_rank.node.active = !1),
                (this.lab_province.node.active = !0),
                void (this.img_province.active = !0)
              );
            ((this.img_MJPath.node.active = !0),
              (this.lab_rank.node.active = !0),
              (this.lab_province.node.active = !1),
              (this.img_province.active = !1),
              (t = g_oData.get(g_tData.MJMasterPathMod).mjMasterPathData.lv || 0),
              (this.lab_rank.string = t));
            for (
              var i = g_oData.get(g_tData.MJMasterPathMod).getRankConfigs(), a = 0;
              a < i.length;
              a++
            ) {
              var o = i[a];
              if (((e = o), t <= o.maxLv)) break;
            }
            (e &&
              ((this.lab_rank.node.getComponent(cc.LabelOutline).color = new cc.Color().fromHEX(
                e.outcolor,
              )),
              g_oData.get(g_tData.MJMasterPathMod).loadSp("s_" + e.rankIndex, this.img_MJPath)),
              this.checkShowRankRedNode());
          },
          checkShowRankRedNode: function () {
            var e = this.img_MJPath.node.getChildByName("img_redBall"),
              t = g_oData.get(g_tData.MJMasterPathMod).DailyAwardReceiveTimes,
              i = g_oData.get(g_tData.MJMasterPathMod).IsRankOpen;
            0 === t &&
            i &&
            g_oData.get(g_tData.MJMasterPathMod).RankCfg &&
            g_oData.get(g_tData.MJMasterPathMod).RankCfg.length > 0
              ? (e.active = !0)
              : (e.active = !1);
          },
          initMjMPath: function () {
            g_oLayerManager.emitEvent2Dlg(
              g_tConst.GameLayerCfg.MJMasterPathMain.id,
              "ON_INIT",
              "Lobby",
            );
          },
          updateProvince: function () {
            var e = g_oData.get(g_tData.AreaMod).getCurAreaCode();
            if (e) {
              var t = g_oData.get(g_tData.PrivateMsgModel).getAreaCfgByAreaCode(e);
              this.lab_province.string = (t && t.sName) || "...";
            } else
              Log.warn(
                "BIRD >>>",
                "hall_LobbyUp.js",
                "\u6682\u65f6\u672a\u80fd\u4ece AreaMod \u4e2d\u83b7\u5f97 curAreaCode",
              );
          },
          updateUserHead: function () {
            g_oData
              .get(g_tData.comHead)
              .loadHead(g_oPlatform.getHeadUrl(), this.head_node.getComponent(cc.Sprite));
          },
          updatePlayerHeadFrame: function () {
            this.img_HeadFrame.node.active = !1;
            var e = g_oData.get(g_tData.mod_Bag).getCurUseId(g_tConst.ServerBagType.HeadFrame);
            g_oData.get(g_tData.comHeadFrame).loadHeadFrameWithCurUse(this.img_HeadFrame, e);
          },
          onClickInfoCenter: function () {
            var e = this;
            g_oData.get(g_tData.Login).authorize(function () {
              (e.isPopAuthorize(),
                g_oData.get(g_tData.sdkLogin).checkLogin(
                  function () {
                    g_oLayerManager.emitEvent2Dlg(
                      g_tConst.GameLayerCfg.Hall_UserInfoApk.id,
                      "ON_INIT",
                    );
                  }.bind(e),
                ),
                g_oData.get(g_tData.SwitchModel).printSwtich());
            });
          },
          onClickProvince: function () {
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.ProvinceChoose.id, "ON_INIT", {
              FromName: "\u6e38\u620f\u5927\u5385",
              FromSceneId: 1,
            });
          },
          onClickSectionEntry: function () {
            (g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.SectionMatch.id, "ON_INIT"),
              g_oData
                .get(g_tData.gameReportData)
                .reportClickAction(g_tConst.ReportCfg.ClickActionReport.ClickHallSectionTopEnter),
              g_oData
                .get(g_tData.gameReportData)
                .recordStartAction(g_tConst.ReportCfg.QuickStart.SectionEntry));
          },
          isPopAuthorize: function () {
            if (i.canAuth()) {
              var e = g_oData.get(g_tData.UserLocalModel).getData("lastIsAuthorized", !1);
              this.nodeAuthorizeTip.active = !e;
            }
          },
          onDestroy: function () {
            this._super();
          },
          onClickMatchEnterAction: function () {
            var e = g_oData.get(g_tData.SwitchModel).getCfgOfHallEntranceLayout().matchEnterCfg || [
                6,
              ],
              t = a.MatchXzdd.id;
            switch (
              (e.length > 1
                ? (t = a.Match.id)
                : e.includes(7)
                  ? (t = a.MatchTwoVsTwo.id)
                  : e.includes(6)
                    ? (t = a.MatchXzdd.id)
                    : e.includes(9)
                      ? (t = a.MatchFreeTable.id)
                      : e.includes(12) && (t = a.MatchXlhz.id),
              g_oData
                .get(g_tData.gameReportData)
                .reportClickAction(g_tConst.ReportCfg.ClickActionReport.ClickHallMatchTopEnterBtn),
              t)
            ) {
              case a.Match.id:
                (g_oLayerManager.emitEvent2Dlg(
                  g_tConst.GameLayerCfg.MatchPlayType.id,
                  "MatchPlayType_Init",
                  null,
                ),
                  g_oData
                    .get(g_tData.gameReportData)
                    .reportClickAction(g_tConst.ReportCfg.ClickActionReport.ClickHallMatchBtn));
                break;
              case a.MatchXzdd.id:
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
                break;
              case a.MatchTwoVsTwo.id:
                (g_oData
                  .get(g_tData.mod_TwoFight)
                  .setPlayTypeInfo(g_tConst.GameTypeCfgs.MATCHXL2V2),
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
                break;
              case a.MatchFreeTable.id:
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
                break;
              case a.MatchXlhz.id:
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
                break;
              default:
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
            }
          },
          checkHallEntranceLayout: function () {
            var e = g_oData.get(g_tData.SwitchModel).getCfgOfHallEntranceLayout(),
              t = e.isAllOpen || !1,
              i = e.topLayout || [];
            if (t && i && i.length > 0) {
              var a = i[0];
              a > 0
                ? 1 == a
                  ? this.topEnterChangeShow(1)
                  : 2 == a && this.topEnterChangeShow(2)
                : this.topEnterChangeShow(1);
            } else this.topEnterChangeShow(1);
          },
          topEnterChangeShow: function (e) {
            (void 0 === e && (e = 1),
              (this.MatchEntry.active = !1),
              (this.SectionEntry.active = !1));
          },
        }),
          cc._RF.pop());
      },
      { CommonPlat: "CommonPlat", hall_TileDefine: "hall_TileDefine" },
    ],
