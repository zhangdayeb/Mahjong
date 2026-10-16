    MatchSelectItem: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "45660XBi51IC5gTIq7xKAD/", "MatchSelectItem"),
          cc.Class({
            extends: Cls_BaseView,
            properties: {
              TipLabelP: cc.Label,
              TipLabelQ: cc.Label,
              AwardLabel: cc.Label,
              RenNumLabel: cc.Label,
              ItemBg: cc.Sprite,
              tagSaveArchives: cc.Node,
              tagFree: cc.Node,
              tagTodayFirstFree: cc.Node,
              _ItemIdx: -1,
              _ClickCb: null,
              _ItemMatchID: -1,
            },
            Awake: function () {
              this.onCustomEvent();
            },
            start: function () {},
            onCustomEvent: function () {
              var e = this;
              this.node.on(
                "update_plyer_num",
                function (t) {
                  if (t && t.length > 0)
                    for (var i = 0; i < t.length; i++) {
                      var a = t[i];
                      if (-1 != e._ItemMatchID && a.matchID == e._ItemMatchID) {
                        var o = a.num;
                        e.RenNumLabel.string = o;
                        break;
                      }
                    }
                }.bind(this),
              );
            },
            initItemData: function (e, t, i, a) {
              (void 0 === t && (t = null),
                void 0 === i && (i = null),
                void 0 === a && (a = null),
                console.log(" MatchSelectItem ----------- data = ", e),
                (this._ItemIdx = e.itemIdx),
                this.updateItemInfo(e),
                this.updateShowIcon(t, i),
                a && (this._ClickCb = a));
            },
            updateItemInfo: function (e) {
              this._ItemInfo = e;
              var t = e.textCfg || {},
                i = e.itemCfg || {};
              ((this._ItemMatchID = i.matchID),
                isNull(t.tipP) || (this.TipLabelP.string = t.tipP),
                isNull(t.tipQ) || (this.TipLabelQ.string = t.tipQ),
                isNull(t.bText) || (this.AwardLabel.string = g_oCommonUtils.replaceRule(t.bText)),
                (this.tagSaveArchives.active = !isNull(
                  g_oData.get(g_tData.MatchMod).getUserNewArchivesInfoByMatchId(this._ItemMatchID),
                )));
              var a = i.applyGoods[0];
              ((this.tagFree.active = !(a && a.num > 0)),
                (this.tagTodayFirstFree.active = g_oData.get(g_tData.MatchMod).isTodayFirstFree(i)),
                this.tagTodayFirstFree.active && (this.tagFree.active = !1),
                (this.RenNumLabel.string = g_oData
                  .get(g_tData.MatchMod)
                  .getMatchItemPlayerLocNum(this._ItemIdx)));
            },
            onClickItem: function () {
              (this._ClickCb && this._ClickCb(this._ItemInfo),
                isNull(this._ItemInfo) ||
                  (this._ItemInfo.itemPlayType == g_tConst.MatchType.Normal
                    ? g_oData.get(g_tData.gameReportData).reportMatchSelItem(this._ItemInfo.itemIdx)
                    : this._ItemInfo.itemPlayType == g_tConst.MatchType.NormalXlhz
                      ? g_oData
                          .get(g_tData.gameReportData)
                          .reportMatchXlhzSelItem(this._ItemInfo.itemIdx)
                      : g_oData
                          .get(g_tData.gameReportData)
                          .reportMatchSelItem(this._ItemInfo.itemIdx)));
            },
            updateShowIcon: function (e, t) {
              (e && (this.ItemBg.spriteFrame = e),
                t && ((this.TipLabelP.font = t), (this.TipLabelQ.font = t)));
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
