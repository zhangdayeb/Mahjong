    BackpackView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "b6b33UfAaFBqKKa7W1jHqzJ", "BackpackView");
        var i = e("AlertDlgBaseView");
        (cc.Class({
          extends: i,
          properties: {
            content: cc.Node,
            title: cc.Label,
            toggleRoot: cc.Node,
            toggles: [cc.Toggle],
            views: [cc.Node],
            wgt_left: cc.Widget,
          },
          Awake: function () {
            (this._super(),
              (this._lastShowIndex = -1),
              this.onCustomEvent(),
              this.onMessageEvent());
          },
          start: function () {
            var e = g_oData.get(g_tData.UserLocalModel).getData("BACKPACK_GOOD_CHANGE", !1);
            (g_oData.get(g_tData.UserLocalModel).setData("BACKPACK_GOOD_CHANGE", !1),
              e && g_oData.get(g_tData.mod_Bag).reqBackpackGoods(),
              g_oEvent.dispatchEvent(g_tEvent.ON_SHOW_BAG_NEW_GOOD),
              this.updateReds());
          },
          onCustomEvent: function () {
            this.node.on("ON_INIT", this.onInit, this);
          },
          onMessageEvent: function () {
            var e = this;
            this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.ON_BACKPACK_UPDATE_TYPES,
                function () {
                  e.updateReds();
                },
                this,
              ),
            );
          },
          onInit: function (e) {
            (void 0 === e && (e = null),
              (this.content.active = !0),
              this.initViews(e),
              this.setLeftPos());
          },
          setLeftPos: function () {
            cc.winSize.width >= 1380 &&
              ((this.wgt_left.left = (cc.winSize.width - 1380) / 2 + 45),
              this.wgt_left.updateAlignment());
          },
          onClickClose: function () {
            this.close();
          },
          initViews: function (e) {
            var t = g_oData.get(g_tData.SwitchModel).getBackpackCfgH5(),
              i = t.toggles,
              a = t.toggleShows,
              o = t.showFirst;
            if (!isNull(e) && void 0 !== e.forceShowToggle) {
              var n = i.indexOf(e.forceShowToggle);
              n >= 0 && (o = n);
            }
            if (0 == a[o]) for (var s = 0; s < a.length; s++) 1 == a[s] && (o = s);
            for (var r = 0; r < this.toggles.length; r++) {
              var c = this.toggles[r].node;
              c &&
                cc.isValid(c) &&
                ((c.active = !1),
                (c.toggleIndex = r),
                (this.views[r].active = !1),
                (this.views[r].isViewInit = !1));
            }
            for (var l = 0; l < i.length; l++) {
              var g = i[l];
              if (this.toggles[g]) {
                var d = this.toggles[g].node;
                g < this.toggles.length &&
                  d &&
                  cc.isValid(d) &&
                  ((d.active = 1 == a[l]),
                  g == i[o] && ((this.toggles[g].isChecked = !0), this.showView(i[o])));
              }
            }
            for (var h = this.toggleRoot.children, u = 0; u < h.length; u++)
              this.toggles[i[u]] && (h[u] = this.toggles[i[u]].node);
          },
          onClickToggle: function (e) {
            var t = e.target.toggleIndex;
            (this.hideLastView(), this.showView(t));
          },
          hideLastView: function () {
            this._lastShowIndex >= 0 && (this.views[this._lastShowIndex].active = !1);
          },
          showView: function (e) {
            this._lastShowIndex = e;
            var t = this.views[e];
            ((t.active = !0),
              t.isViewInit ||
                (Log.info("Edwin Backpack initView " + g_tConst.BagToggleName[e]),
                (t.isViewInit = !0)));
          },
          updateReds: function () {
            for (
              var e = [
                  g_tConst.ServerBagType.CardTable,
                  g_tConst.ServerBagType.HeadFrame,
                  g_tConst.ServerBagType.passCard,
                  g_tConst.ServerBagType.daoJu,
                  g_tConst.ServerBagType.Emoji,
                ],
                t = g_oData.get(g_tData.mod_Bag).getUpdateTypes(),
                i = 0;
              i < this.toggles.length;
              i++
            ) {
              var a = this.toggles[i].node.getChildByName("red"),
                o = e[i];
              a.active = t.includes(o);
            }
          },
        }),
          cc._RF.pop());
      },
      { AlertDlgBaseView: "AlertDlgBaseView" },
    ],
