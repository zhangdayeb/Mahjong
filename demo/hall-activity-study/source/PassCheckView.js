    PassCheckView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "497a38L6LlEW7svTLtgU3Z1", "PassCheckView");
        var i = e("../../../../common/component/BaseDlg/AlertDlgBaseView"),
          a = e("../../../../common/component/scrollview/ScrollVCompEEX"),
          o = e("./popDlg/PassCheckTaskItem");
        (cc.Class({
          extends: i,
          properties: {
            taskList: { default: null, type: a },
            actTime: { default: null, type: cc.Label },
            nowMissile: { default: null, type: cc.Label },
            ToggleArr: { default: [], type: [cc.Node] },
            allAward: { default: null, type: cc.Node },
            skipNode: { default: null, type: cc.Node },
            boomsmall: { default: null, type: cc.Node },
            boombig: { default: null, type: cc.Node },
            ruleNode: { default: null, type: cc.Node },
            PassCheckRuleView: { default: null, type: cc.Prefab },
            PassCheckPackView: { default: null, type: cc.Prefab },
            shen_xuanyuan: { default: null, type: cc.SpriteFrame },
            _taskEvent: 0,
            awardIndexToNodes: [],
          },
          Awake: function () {
            ((this._closeReleaseRes = !0),
              g_oData
                .get(g_tData.PassCheckMod)
                .reqRefreshUser(g_tConst.PassCheckType.DailyAwardRank));
            var e = new Date(1e3 * g_oData.get(g_tData.sdkLogin).serverTime);
            ((this._todayEndTime = e.setHours(24, 0, 0, 0) / 1e3),
              this.onCustomEvent(),
              this.onMessageEvent());
            for (var t = 0; t < this.allAward.children.length; t++) {
              var i = this.allAward.children[t];
              this.awardIndexToNodes[t] = i;
            }
            var a = g_oData
              .get(g_tData.UserLocalModel)
              .getData(g_tConst.PassCheckCheckSkipType, "1");
            this.skipNode.getChildByName("checkmark").active = "2" == a;
          },
          onCustomEvent: function () {
            this.node.on("ON_INIT", this.onInitView, this);
          },
          onMessageEvent: function () {
            var e = this;
            (this.autoDispose(
              g_oEvent.addEventListener(g_tEvent.PASSCHECK_INFO_UPDATE, this.onInit, this),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.PASSCHECK_AWARDLOG_UPDATE,
                  this.onClickAwardLog,
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.PASSCHECK_OPENBOX_AWARD,
                  function (t) {
                    e.skipNode.getChildByName("checkmark").active
                      ? g_oEvent.dispatchEvent(g_tEvent.BASEHALL_SHARE_EVNET_NORMAL_AWARD_GET, t)
                      : e.tweenToAward(t);
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.PLAT_EVENT_GAME_GOODS_ITEM_UPDATE,
                  function (t) {
                    if (t && t.length)
                      for (var i = 0; i < t.length; i++) {
                        var a = t[i];
                        a.itemID === g_tConst.GameConfig.ItemID.PassCheckToken &&
                          (e.nowMissile.string = "" + a.amount);
                      }
                  },
                  this,
                ),
              ));
          },
          onInitView: function () {
            this.onInit();
          },
          onInit: function () {
            var e, t, i;
            this.updateTime();
            var a = g_oData
                .get(g_tData.PassCheckMod)
                .getPassCheckActCfg(g_tConst.PassCheckType.DailyAwardRank),
              o = g_oData
                .get(g_tData.PassCheckMod)
                .getPassCheckUserInfo(g_tConst.PassCheckType.DailyAwardRank),
              n =
                null != (e = g_tConst.PassCheckTaskType[g_tConst.PassCheckType.DailyAwardRank])
                  ? e
                  : [];
            ((this._taskCfg = null != (t = a.taskInfo[n[this._taskEvent]]) ? t : []),
              this._taskCfg.sort(function (e, t) {
                var i,
                  a,
                  n =
                    null !=
                    (i = o.rows.find(function (t) {
                      return t.id == e.id;
                    }))
                      ? i
                      : { counter: 0, status: 0 },
                  s =
                    null !=
                    (a = o.rows.find(function (e) {
                      return e.id == t.id;
                    }))
                      ? a
                      : { counter: 0, status: 0 },
                  r = 2 == n.status ? 3 : 0 == n.status ? 2 : 1,
                  c = 2 == s.status ? 3 : 0 == s.status ? 2 : 1;
                return c - r != 0 ? c - r : e.id - t.id;
              }),
              (this.taskList.numItems = this._taskCfg.length));
            for (var s = 0; s < a.awardInfo.length; s++) {
              var r = this.allAward.getChildByName("award" + a.awardInfo[s].id),
                c = a.awardInfo[s].goods[0];
              c.awardName = a.awardInfo[s].awardName;
              var l = g_oData.get(g_tData.PassCheckMod).initItemCfg(c),
                g = r.getChildByName("iconName").getComponent(cc.Label),
                d = r.getChildByName("iconNum").getComponent(cc.Label),
                h = r.getChildByName("iconSpr").getComponent(cc.Sprite);
              ((g.string = "" + l.itemName),
                (d.string = "" + ("" != l.itemNum ? l.itemNum : "1\u4e2a")),
                "\u5934\u50cf\u6846" === l.itemType && (h.node.scale = 0.3),
                "\u724c\u684c" === l.itemType && (h.node.scale = 0.47),
                g_oSpriteFrameLoader.load_in_bundle(l.itemBundle, l.itemPath, l.itemPathName, h));
            }
            this.nowMissile.string = "" + (null != (i = o.nowMissile) ? i : 0);
          },
          onUpdateItem: function (e, t) {
            var i,
              a = this._taskCfg[t],
              n =
                null !=
                (i = g_oData
                  .get(g_tData.PassCheckMod)
                  .getPassCheckUserInfo(g_tConst.PassCheckType.DailyAwardRank)
                  .rows.find(function (e) {
                    return e.id == a.id;
                  }))
                  ? i
                  : { counter: 0, status: 0 };
            (e.getComponent(o).init(a, n),
              e.getComponent(o).initCb(this.onClickTaskItem.bind(this, t)));
          },
          onClickTaskItem: function (e) {
            if (!this._isAni) {
              var t = this._taskCfg[e];
              g_oData
                .get(g_tData.PassCheckMod)
                .reqGetTaskAward(t.id, g_tConst.PassCheckType.DailyAwardRank);
            }
          },
          onClickToggle: function (e, t) {
            this._isAni ||
              (this._taskEvent != Number(t) &&
                ((this._taskEvent = Number(t)),
                this.ToggleArr.forEach(function (e, i) {
                  e.active = i == Number(t);
                }),
                this.onInit()));
          },
          onClickUseMissile: function (e, t) {
            if ((void 0 === t && (t = "1"), !this._isAni)) {
              var i = "1" == t ? 1 : 5;
              g_oData
                .get(g_tData.PassCheckMod)
                .getPassCheckUserInfo(g_tConst.PassCheckType.DailyAwardRank).nowMissile >= i
                ? ("1" == t
                    ? g_oData
                        .get(g_tData.gameReportData)
                        .reportAction(g_tConst.ReportCfg.PassCheck.ClickOne)
                    : g_oData
                        .get(g_tData.gameReportData)
                        .reportAction(g_tConst.ReportCfg.PassCheck.ClickFive),
                  g_oData
                    .get(g_tData.PassCheckMod)
                    .reqUserMissile(i, 1, g_tConst.PassCheckType.DailyAwardRank))
                : g_oPlatform.doAction(
                    g_tConst.tPlatActionId.actionShowToast,
                    "\u60ac\u8d4f\u4ee4\u6570\u91cf\u4e0d\u8db3~",
                  );
            }
          },
          onCheckSkip: function () {
            if (!this._isAni) {
              var e = g_oData
                .get(g_tData.UserLocalModel)
                .getData(g_tConst.PassCheckCheckSkipType, "1");
              ((e = "1" == e ? "2" : "1"),
                (this.skipNode.getChildByName("checkmark").active = "2" == e),
                g_oData.get(g_tData.UserLocalModel).setData(g_tConst.PassCheckCheckSkipType, e));
            }
          },
          onClickAwardLog: function () {
            var e;
            if (!this._isAni) {
              var t =
                null != (e = this.ruleNode.getChildByName("PassCheckRuleView"))
                  ? e
                  : cc.instantiate(this.PassCheckRuleView);
              ((t.parent = this.ruleNode),
                (t.active = !0),
                (t.name = "PassCheckRuleView"),
                t.getComponent("PassCheckRuleView").initAwardLog());
            }
          },
          onClickRule: function () {
            var e;
            if (!this._isAni) {
              var t =
                null != (e = this.ruleNode.getChildByName("PassCheckRuleView"))
                  ? e
                  : cc.instantiate(this.PassCheckRuleView);
              ((t.parent = this.ruleNode),
                (t.active = !0),
                (t.name = "PassCheckRuleView"),
                t.getComponent("PassCheckRuleView").initRule());
            }
          },
          onClickZF: function () {
            var e;
            if (!this._isAni) {
              var t =
                null != (e = this.ruleNode.getChildByName("PassCheckPackView"))
                  ? e
                  : cc.instantiate(this.PassCheckPackView);
              ((t.parent = this.ruleNode),
                (t.active = !0),
                (t.name = "PassCheckPackView"),
                t.getComponent("PassCheckPackView").init());
            }
          },
          onClickCard: function () {
            this._isAni ||
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.PassCheckCard.id, "ON_INIT");
          },
          updateTime: function () {
            this.unschedule(this._updateTimeFun);
            var e =
              g_oData
                .get(g_tData.PassCheckMod)
                .getPassCheckActCfg(g_tConst.PassCheckType.DailyAwardRank).endTimeInt -
              g_oData.get(g_tData.sdkLogin).serverTime;
            if (this._todayEndTime < g_oData.get(g_tData.sdkLogin).serverTime) {
              g_oData
                .get(g_tData.PassCheckMod)
                .reqRefreshUser(g_tConst.PassCheckType.DailyAwardRank);
              var t = new Date(1e3 * g_oData.get(g_tData.sdkLogin).serverTime);
              this._todayEndTime = t.setHours(24, 0, 0, 0) / 1e3;
            }
            if (e > 0) {
              var i = Math.floor(e / 86400),
                a = Math.floor((e / 3600) % 24),
                o = Math.floor((e / 60) % 60),
                n = Math.floor(e % 60);
              ((a = a >= 10 ? a : "0" + a),
                (o = o >= 10 ? o : "0" + o),
                (n = n >= 10 ? n : "0" + n),
                (this.actTime.string =
                  "\u5269\u4f59\u65f6\u95f4\uff1a" +
                  (i > 0 ? i + "\u5929" : "") +
                  a +
                  "\u5c0f\u65f6" +
                  o +
                  "\u5206" +
                  n +
                  "\u79d2"),
                (this._updateTimeFun = this.updateTime.bind(this)),
                this.scheduleOnce(this._updateTimeFun, 1));
            } else
              ((this.actTime.string = "\u672c\u5468\u6d3b\u52a8\u5df2\u7ed3\u675f"),
                (this._updateTimeFun = function () {
                  g_oData
                    .get(g_tData.PassCheckMod)
                    .reqPassCheckActCfg(g_tConst.PassCheckType.DailyAwardRank);
                }),
                this.scheduleOnce(this._updateTimeFun, 1));
          },
          onClickClose: function () {
            this._isAni || this.close();
          },
          tweenToAward: function (e) {
            var t = this;
            this._isAni = !0;
            var i = e.drawId,
              a = 0,
              o = 0,
              n = null,
              s = null,
              r = null,
              c = null,
              l = function () {
                var a = t.awardIndexToNodes[r];
                (delete t.awardIndexToNodes[r],
                  cc
                    .tween(a)
                    .call(function () {
                      var e = 0 == r || 6 == r ? t.boombig : t.boomsmall;
                      ((a.getChildByName("mask").active = !1),
                        e.setPosition(
                          e.parent.convertToNodeSpaceAR(a.convertToWorldSpaceAR(cc.v3(0, 0, 0))),
                        ),
                        (e.active = !0),
                        e.getComponent(cc.Animation).play(),
                        e.getComponent(cc.Animation).off(cc.Animation.EventType.FINISHED),
                        e.getComponent(cc.Animation).on(
                          cc.Animation.EventType.FINISHED,
                          function () {
                            e.active = !1;
                          },
                          t,
                        ),
                        g_oAudioManager.play(g_tAsset.EffectSound.passcheckstop));
                    })
                    .delay(0.6)
                    .call(function () {
                      if (++o >= i.length) {
                        for (var a = 0; a < t.allAward.children.length; a++) {
                          var n = t.allAward.children[a];
                          ((t.awardIndexToNodes[a] = n), (n.getChildByName("mask").active = !1));
                        }
                        (g_oEvent.dispatchEvent(g_tEvent.BASEHALL_SHARE_EVNET_NORMAL_AWARD_GET, e),
                          (t._isAni = !1));
                      } else d();
                    })
                    .start());
              },
              g = function e() {
                if (n >= 150) t.scheduleOnce(l.bind(t), 0.002 * n);
                else {
                  (g_oAudioManager.play(g_tAsset.EffectSound.passcheckrun),
                    cc
                      .tween(t.awardIndexToNodes[a].getChildByName("mask"))
                      .set({ opacity: 0 })
                      .to(0.003 * n, { opacity: 50 })
                      .to(0.002 * n, { opacity: 140 })
                      .start());
                  do {
                    a = (a + 1) % 12;
                  } while (!t.awardIndexToNodes[a]);
                  (0 == --c && ((c = 1), (n += 15)),
                    o >= 4
                      ? t.scheduleOnce(e.bind(t), 0.0016 * n)
                      : o >= 2
                        ? t.scheduleOnce(e.bind(t), 0.0013 * n)
                        : t.scheduleOnce(e.bind(t), 0.001 * n));
                }
              },
              d = function () {
                ((n = 30),
                  (s = i[o]),
                  (r = t.allAward.getChildByName("award" + s).getSiblingIndex()));
                var e = Object.keys(t.awardIndexToNodes),
                  l = e.indexOf("" + r) - e.indexOf("" + a);
                for (var d in ((c = 3 * e.length + (l >= 0 ? l : l + e.length) - 6),
                t.awardIndexToNodes))
                  if (t.awardIndexToNodes.hasOwnProperty(d)) {
                    var h = t.awardIndexToNodes[d];
                    ((h.getChildByName("mask").active = !0),
                      (h.getChildByName("mask").opacity = 140));
                  }
                g();
              };
            d();
          },
        }),
          cc._RF.pop());
      },
      {
        "../../../../common/component/BaseDlg/AlertDlgBaseView": "AlertDlgBaseView",
        "../../../../common/component/scrollview/ScrollVCompEEX": "ScrollVCompEEX",
        "./popDlg/PassCheckTaskItem": "PassCheckTaskItem",
      },
    ],
