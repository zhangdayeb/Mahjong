    CustomTreasureDraw: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "dc218WwiHxMoaAnkzmQ3SCs", "CustomTreasureDraw");
        var i = e("AlertDlgBaseView");
        (cc.Class({
          extends: i,
          properties: {
            countdownLbl: cc.Label,
            price: cc.Label,
            drawItem: cc.Prefab,
            buyPower: cc.Prefab,
            power: cc.Label,
            slots: { default: [], type: [cc.Node] },
            _onZf: !1,
          },
          Awake: function () {
            ((this._closeReleaseRes = !0),
              this._super(),
              (this._curIndex = 0),
              (this._drawItems = []),
              (this._drawRst = null),
              (this._drawRsts = null),
              (this._curPriceIdx = 0),
              (this._treasureIds = []),
              (this._showing = !1),
              (this._drawOK = !1),
              (this._zfOK = !1),
              this.reset(),
              this.onCustomEvent(),
              this.onMessageEvent());
          },
          start: function () {
            g_oData.get(g_tData.CustomTreasureMod).reportShowView(2);
          },
          reset: function () {
            ((this._lightUpTime = 0),
              this.setDrawing(!1),
              (this._leftTime = 0),
              (this._leftSteps = 0),
              (this._actionData = null));
          },
          setDrawing: function (e) {
            this._drawing = e;
          },
          update: function (e) {
            if (
              this._drawing &&
              cc.isValid(this.node) &&
              ((this._leftTime -= e), this._leftTime <= 0)
            ) {
              var t = this.lightNextAward();
              if (((this._leftSteps -= t), this._leftSteps <= 0))
                (this.reset(), this.runDrawEndCb());
              else {
                var i = this._actionData.totalSteps - this._leftSteps;
                this._leftTime = this._actionData.intervals[i];
              }
            }
          },
          onCustomEvent: function () {
            this.node.on("ON_INIT", this.onInit, this);
          },
          onMessageEvent: function () {
            var e = this;
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.DRAW_CUSTOM_TREASURE_SUC,
                function (e) {
                  (this.onDrawSuc(e), this.onZFSuc());
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GET_CUSTOM_TREASURE_SUC,
                  function () {
                    var e = this.checkIsGetNewTreasure();
                    e && (this.onDrawSuc({ treasure: e }), this.onZFSuc());
                  },
                  this,
                ),
              ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.PLAT_EVENT_GAME_GOODS_ITEM_UPDATE,
                  function () {
                    e.power.string = g_oData
                      .get(g_tData.mod_GameItem)
                      .getItemNum(g_tConst.GameConfig.ItemID.Power);
                  },
                  this,
                ),
              ),
              g_oEvent.addEventListener(
                g_tEvent.GAME_PLAT_NOTIFY_PAY_RST,
                function (e) {
                  if (
                    -1 !=
                      g_oData
                        .get(g_tData.SwitchModel)
                        .getCustomTreasureCfg()
                        .DrawGoodsId.indexOf(e.itemId) &&
                    this._onZf
                  ) {
                    var t = g_oData.get(g_tData.mod_Share).translatePayInfo(e.info);
                    (console.log("roy suc", t),
                      g_oData.get(g_tData.CustomTreasureMod).getAward(t),
                      (this._onZf = !1));
                  }
                },
                this,
              ));
          },
          onInit: function () {
            (this.onInitTreasure(),
              this.updateDrawBtn(),
              (this.power.string = g_oData
                .get(g_tData.mod_GameItem)
                .getItemNum(g_tConst.GameConfig.ItemID.Power)),
              g_oData.get(g_tData.CustomTreasureMod).getLeftTime() > 0
                ? (this.updateCountdown(),
                  this.unschedule(this.updateCountdown),
                  this.schedule(this.updateCountdown, 1, cc.REPEAT_FOREVER, 0))
                : this.onTimeOut());
          },
          onInitTreasure: function () {
            var e = g_oData.get(g_tData.CustomTreasureMod).selectedCfg.treasures;
            if (Array.isArray(e) && e.length > 0) {
              (this._treasureIds.splice(0, this._treasureIds.length),
                (this._curIndex = 0),
                (this._curPriceIdx = 0));
              for (var t = null, i = e.length, a = 0; a < i; a++) {
                var o = e[a],
                  n = o.goodsInfo[0];
                this._treasureIds.push(n.id);
                var s = g_oData.get(g_tData.CustomTreasureMod).getShowData(n, o.level);
                (0 == n.owned && null == t && ((t = n), (this._curIndex = a)),
                  1 == n.owned && this._curPriceIdx++);
                var r = this._drawItems[a] && this._drawItems[a].node;
                if ((r || (r = g_oPrefabLoader.instantiate(this.drawItem, this.slots[a])), r)) {
                  var c = r.getComponent("CustomTreasureDrawItem");
                  c && (c.onInit(a, s, this), this._drawItems[a] || this._drawItems.push(c));
                }
              }
              this.turnLightOrDark(this._curIndex, !0);
            }
          },
          updateDrawBtn: function () {
            var e = this._treasureIds.length;
            if (this._curPriceIdx >= e) g_oEvent.dispatchEvent(g_tEvent.CUSTOM_TREASURE_DONE_TODAY);
            else {
              var t = g_oData.get(g_tData.CustomTreasureMod).getLeftTime(),
                i = g_oData.get(g_tData.CustomTreasureMod).needPower;
              this.price.string =
                t <= 0
                  ? "\u5df2\u8fc7\u671f"
                  : "\u6d88\u8017" + i[this._curPriceIdx] + "\u4f53\u529b";
            }
          },
          onTimeOut: function () {
            ((this.price.string = "\u5df2\u8fc7\u671f"),
              (this.countdownLbl.string = "\u5df2\u8fc7\u671f"));
          },
          updateCountdown: function () {
            var e = g_oData.get(g_tData.CustomTreasureMod).getLeftTime();
            0 == e
              ? (this.unschedule(this.updateCountdown), this.onTimeOut())
              : (this.countdownLbl.string =
                  g_oCommonUtils.formatTime(e, -1, null) + "\u79d2\u540e\u8fc7\u671f");
          },
          onStartDraw: function (e) {
            if (e) {
              var t = e.id,
                i = this._treasureIds.indexOf(t),
                a = this._curPriceIdx,
                o = this._treasureIds.length;
              ((this._actionData = g_oCommonUtils.getTimeAndSteps(
                this._curIndex,
                i,
                this._treasureIds.length,
                2,
                { slowStepScale: Math.trunc((a / o) * 3), constStepScale: Math.trunc((a / o) * 2) },
              )),
                (this._leftSteps = this._actionData.totalSteps),
                (this._leftTime = this._actionData.intervals[0]),
                this.setDrawing(!0));
            }
          },
          lightNextAward: function () {
            this._lightUpTime++;
            var e = [0],
              t = this._drawItems;
            return (
              this.turnLightOrDark(this._curIndex, !1),
              (this._curIndex = this.getValidNextIdx(this._curIndex, t, e)),
              this.turnLightOrDark(this._curIndex, !0),
              e[0]
            );
          },
          getValidNextIdx: function (e, t, i) {
            for (var a = !1, o = e, n = 0; !a; )
              ((n += 1), (o += 1) >= t.length && (o = 0), (a = !t[o].getData().isOwned));
            return ((i[0] = n), o);
          },
          turnLightOrDark: function (e, t) {
            this._drawItems[e].showAsLight(t);
          },
          runDrawEndCb: function () {
            var e = this;
            ((this._showing = !0),
              this.scheduleOnce(function () {
                e.onShowAward();
              }, 0.8));
          },
          onDrawSuc: function (e) {
            ((g_oData.get(g_tData.mod_Bag).canUpdBagData = !1),
              (this._drawOK = !0),
              Log.info("Edwin \u62bd\u53d6\u6210\u529f"));
            var t = g_oData.get(g_tData.CustomTreasureMod).needPower[this._curPriceIdx];
            g_oData.get(g_tData.CustomTreasureMod).reportDrawTimes(t);
            var i = e.award;
            ((i.goodsInfo[0].id = i.awardId),
              (this._drawRst = i.goodsInfo[0]),
              (this._drawRsts =
                null == this._drawRsts ? i.goodsInfo : this._drawRsts.concat(i.goodsInfo)),
              this.updateCurPriceIndex(),
              this.updateDrawBtn(),
              this.showRollingAnim());
          },
          onZFSuc: function () {
            ((g_oData.get(g_tData.mod_Bag).canUpdBagData = !1),
              (this._zfOK = !0),
              Log.info("Edwin \u8fd4\u56de\u652f\u4ed8\u6210\u529f"),
              this.showRollingAnim());
          },
          showRollingAnim: function () {
            if (
              (Log.info("Edwin drawOK " + this._drawOK + " zfOK " + this._zfOK),
              this._drawOK && this._zfOK && this._drawRst && !this._drawing && !this._showing)
            ) {
              ((g_oData.get(g_tData.mod_Bag).canUpdBagData = !1),
                (this._drawOK = !1),
                (this._zfOK = !1));
              var e = this._treasureIds.length;
              this._curPriceIdx >= e ? this.runDrawEndCb() : this.onStartDraw(this._drawRst);
            }
          },
          updateCurPriceIndex: function () {
            var e = g_oData.get(g_tData.CustomTreasureMod).selectedCfg.treasures;
            if (Array.isArray(e) && e.length > 0) {
              var t = e.length;
              this._curPriceIdx = 0;
              for (var i = 0; i < t; i++) 1 == e[i].goodsInfo[0].owned && this._curPriceIdx++;
            }
          },
          onShowAward: function () {
            var e = this;
            if (this._drawRst) {
              ((this._drawOK = !1), (this._zfOK = !1));
              var t = [];
              if (Array.isArray(this._drawRsts) && this._drawRsts.length > 0)
                for (
                  var i = g_oData.get(g_tData.RegressionActMod).getLeftTime() > 0, a = 0;
                  a < this._drawRsts.length;
                  a++
                ) {
                  var o = this._drawRsts[a],
                    n = g_oData.get(g_tData.CustomTreasureMod).getShowData(o, -1, !0);
                  (t.push({
                    type: o.type,
                    num: g_oCommonUtils.Long2Number(o.num),
                    goodsID: o.goodsID,
                    itemPicPath: g_tAsset.ITEM_PROP_PATH + n.itemIcon,
                    name: n.itemDesc,
                    propId: o.subEffectID,
                    goodsInfo: { extra: n.extra, desc: n.itemDesc },
                  }),
                    !i ||
                      (o.type != g_tConst.GameConfig.ItemType.GoldCard &&
                        o.type != g_tConst.GameConfig.ItemType.Diamond &&
                        o.type != g_tConst.GameConfig.ItemType.ZCoin) ||
                      t.push({
                        type: o.type,
                        num: g_oCommonUtils.Long2Number(Math.floor(0.2 * o.num)),
                        goodsID: o.goodsID,
                        itemPicPath: g_tAsset.ITEM_PROP_PATH + n.itemIcon,
                        name: n.itemDesc,
                        propId: o.subEffectID,
                        goodsInfo: { extra: n.extra, desc: n.itemDesc, RegressionAct: !0 },
                      }));
                }
              for (var s = 0, r = 0; r < t.length; r++) {
                var c = t[r];
                c.type == g_tConst.GameConfig.ItemType.Diamond && (s += c.num);
              }
              if (s > 0) {
                var l = g_tConst.ReportCfg.ShopModule,
                  g = "customTreasure" + l.Event_GetDiamond + s;
                g_oData.get(g_tData.gameReportData).sendCustomEvent(l.Module, g, l.Ok);
              }
              (g_oEvent.dispatchEvent(g_tEvent.BASEHALL_SHARE_EVNET_NORMAL_AWARD_GET, {
                allAward: t,
              }),
                this.setItemOwned(this._drawRst.id),
                this.showItemAsOwned(),
                (this._drawRst = null),
                (this._drawRsts = null),
                this.scheduleOnce(function () {
                  ((g_oData.get(g_tData.mod_Bag).canUpdBagData = !0), (e._showing = !1));
                  var t = e._treasureIds.length;
                  e._curPriceIdx >= t && e.close();
                }, 1));
            }
          },
          showItemAsOwned: function () {
            for (var e = 0; e < this._drawItems.length; e++) {
              var t = this._drawItems[e],
                i = t.getData();
              t.showAsOwned(i.isOwned);
            }
          },
          setItemOwned: function (e) {
            for (var t = 0; t < this._drawItems.length; t++) {
              var i = this._drawItems[t].getData();
              if (i.id == e) {
                i.isOwned = !0;
                break;
              }
            }
          },
          checkIsGetNewTreasure: function () {
            var e = g_oData.get(g_tData.CustomTreasureMod).selectedCfg,
              t = g_oData.get(g_tData.CustomTreasureMod).lastSelectedCfg,
              i = null;
            if (e && t && e.refreshTime == t.refreshTime)
              for (var a = e.treasures, o = t.treasures, n = 0; n < a.length; n++) {
                var s = a[n].goodsInfo[0];
                if (1 == s.owned) {
                  for (var r = !1, c = 0; c < o.length; c++) {
                    var l = o[c].goodsInfo[0];
                    s.id == l.id && 1 == l.owned && (r = !0);
                  }
                  r || (i = a[n]);
                }
              }
            return i;
          },
          setZF: function (e) {
            this._onZf = e;
          },
          onClickDraw: function () {
            if (!this._drawing && !this._showing)
              if (g_tConst.CustomTreasureDrawCfg.DrawDebug) {
                var e = g_oData.get(g_tData.CustomTreasureMod).selectedCfg.treasures[5];
                g_oData.get(g_tData.CustomTreasureMod).onDrawCustomTreasure({ treasure: e });
              } else {
                var t = g_oData.get(g_tData.CustomTreasureMod).needPower,
                  i = g_oData
                    .get(g_tData.mod_GameItem)
                    .getItemNum(g_tConst.GameConfig.ItemID.Power);
                if (i < t[this._curPriceIdx]) {
                  console.log("Roy,\u4f53\u529b\u4e0d\u591f", i);
                  var a = g_oPrefabLoader.instantiate(this.buyPower, this.node);
                  if (a) {
                    var o = a.getComponent("CustomTreasureSimple");
                    o && o.buyPowerTip(t, this._curPriceIdx, this.setZF.bind(this));
                  }
                } else (this.tryStartDraw(), console.log("Roy,\u5f00\u62bd"));
              }
          },
          tryStartDraw: function () {
            var e = this._treasureIds.length,
              t = g_oData.get(g_tData.CustomTreasureMod).getLeftTime();
            t > 0 && this._curPriceIdx < e
              ? g_oData.get(g_tData.CustomTreasureMod).reqDoCustomTreasureLot()
              : this._curPriceIdx >= e
                ? g_oPlatform.doAction(
                    g_tConst.tPlatActionId.actionShowToast,
                    "\u4eca\u65e5\u5df2\u62bd\u5b8c",
                  )
                : t <= 0 &&
                  g_oPlatform.doAction(
                    g_tConst.tPlatActionId.actionShowToast,
                    "\u5b9d\u85cf\u5df2\u8fc7\u671f\uff0c\u8bf7\u91cd\u65b0\u9009\u62e9",
                  );
          },
          onClickHelp: function () {
            g_oPrefabLoader.loadRes(g_tAsset.CustomTreasureRulePrefab, this.node, function () {});
          },
          onClickRate: function () {
            g_oPrefabLoader.loadRes(
              g_tAsset.CustomTreasureShowRatePrefab,
              this.node,
              function () {},
            );
          },
          onClickClose: function () {
            (this._drawRst && this._drawing && this.onShowAward(), this.close());
          },
          onDestroy: function () {
            (this._super(), (g_oData.get(g_tData.mod_Bag).canUpdBagData = !0));
          },
        }),
          cc._RF.pop());
      },
      { AlertDlgBaseView: "AlertDlgBaseView" },
    ],
