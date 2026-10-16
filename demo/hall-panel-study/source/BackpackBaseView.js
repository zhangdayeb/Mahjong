    BackpackBaseView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "9b554Vdk5ZBMrFwau9CLQ88", "BackpackBaseView");
        var i = e("DlgBaseView");
        (cc.Class({
          extends: i,
          properties: {
            content: cc.Node,
            itemPrefab: cc.Prefab,
            _itemArr: null,
            _lastChooseItemCtrl: null,
            _lastDownItemCtrl: null,
            _lastUseItemCtrl: null,
            _isFoundUsed: null,
            _loadFirst: null,
          },
          Awake: function () {
            ((this._itemArr = []),
              (this._mShowNewItemCfg = null),
              (this._mShowType = null),
              this.refreshBackpackView());
          },
          refreshBackpackView: function () {
            this._refreshBackpackView();
          },
          _refreshBackpackView: function () {
            this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.REFRESH_BACKPACK_VIEW,
                function () {
                  if (null != this._mShowType && this._mShowNewItemCfg) {
                    var e = this.getNewItemCfg(this._mShowType);
                    this._mShowNewItemCfg.length !== e.length &&
                      ((this._lastGetVideoReward = null),
                      (this._lastChooseItemCtrl = null),
                      (this._lastUseItemCtrl = null),
                      (this._isFoundUsed = null),
                      (this._loadFirst = null),
                      (this._itemArr = []),
                      this.content.destroyAllChildren(),
                      this.start());
                  }
                },
                this,
              ),
            );
          },
          _refreshAllBackpackView2: function () {
            this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.REFRESH_BACKPACK_VIEW,
                function () {
                  ((this._lastChooseItemCtrl = null),
                    (this._lastUseItemCtrl = null),
                    (this._isFoundUsed = null),
                    (this._loadFirst = null),
                    (this._itemArr = []),
                    this.content.destroyAllChildren(),
                    this.start());
                },
                this,
              ),
            );
          },
          onUseGoodSuc: function (e, t, i) {
            var a = !1;
            if (Array.isArray(this._itemArr)) {
              var o = e.types.indexOf(t);
              if (o >= 0) {
                for (var n = e.ids[o], s = 0; s < this._itemArr.length; s++) {
                  var r = this._itemArr[s].getComponent(i);
                  r && r.getData().id == n && (this.switchUseItem(r), (a = !0));
                }
                t == g_tConst.ServerBagType.CardTable &&
                  g_oData.get(g_tData.mod_Bag).preloadCardTable(n);
              }
            }
            return a;
          },
          getNewItemCfg: function (e) {
            var t = g_oData.get(g_tData.mod_Bag).getBagItemsByType(e);
            e == g_tConst.ServerBagType.Emoji &&
              (t = g_oData.get(g_tData.mod_Bag).getAllEmojiCfg());
            var i = null,
              a = null,
              o = [],
              n = null;
            (e == g_tConst.ServerBagType.CardTable &&
              (n = g_oData.get(g_tData.mod_Bag).getTableShowCfg()),
              4 == e && (i = g_oData.get(g_tData.SwitchModel).getBackPackDeskCfg()),
              e == g_tConst.ServerBagType.daoJu &&
                (a = g_oData.get(g_tData.SwitchModel).getBackPackPropCfg()));
            for (var s = 0; s < t.length; s++) {
              var r = t[s];
              if (
                (e != g_tConst.ServerBagType.CardTable || this.checkTableShow(r, n)) &&
                !(r.status == g_tConst.BagGoodStatus.None && i && !i[r.id] && r.id > 0)
              ) {
                if (e == g_tConst.ServerBagType.daoJu && a) {
                  var c = !1;
                  if (
                    (a.resident && a.resident.indexOf(r.id) >= 0
                      ? (c = !0)
                      : a.nonresident &&
                        a.nonresident.indexOf(r.id) >= 0 &&
                        this.checkPropShow(r) &&
                        (c = !0),
                    !c)
                  )
                    continue;
                }
                o.push(r);
              }
            }
            return o;
          },
          onInitItems: function (e) {
            var t = this.getNewItemCfg(e);
            ((this._mShowNewItemCfg = t), (this._mShowType = e));
            var i = t.length;
            if (i > 0) {
              i > 1 && e !== g_tConst.ServerBagType.Emoji && (t = this.sortItems(t));
              for (var a = 0; a < i; a++) {
                var o = null,
                  n = !1;
                if (
                  (this._itemArr[a]
                    ? ((o = this._itemArr[a]), (n = !0))
                    : ((o = g_oPrefabLoader.instantiate(this.itemPrefab, this.content)), (n = !1)),
                  o)
                ) {
                  if (o.activeInHierarchy)
                    o.emit("onInit", { itemCfg: t[a], viewCtrl: this, index: a });
                  else {
                    var s = o.getComponent(cc.Component);
                    s && s.onInit && s.onInit({ itemCfg: t[a], viewCtrl: this, index: a });
                  }
                  n || this._itemArr.push(o);
                }
              }
            }
          },
          checkTableShow: function (e, t) {
            return null != t && t.get(e.id + "");
          },
          checkPropShow: function (e) {
            return e.status == g_tConst.BagGoodStatus.Own && e.serverCfg.num > 0;
          },
          sortItems: function (e) {
            for (var t = [], i = [], a = [], o = 0; o < e.length; o++) {
              var n = e[o];
              n.id == n.curUseId
                ? t.push(n)
                : n.status == g_tConst.BagGoodStatus.Own
                  ? i.push(n)
                  : n.status == g_tConst.BagGoodStatus.None && a.push(n);
            }
            return (
              i.sort(function (e, t) {
                return t.localCfg.showWeight - e.localCfg.showWeight;
              }),
              a.sort(function (e, t) {
                return t.localCfg.showWeight - e.localCfg.showWeight;
              }),
              t.concat(i).concat(a)
            );
          },
          setIsFoundUsed: function (e) {
            this._isFoundUsed = e;
          },
          setFirstLoad: function (e) {
            this._loadFirst = e;
          },
          setLastUseItemCtrl: function (e) {
            this._lastUseItemCtrl = e;
          },
          getLastUseItemCtrl: function () {
            return this._lastUseItemCtrl;
          },
          setLastChooseItemCtrl: function (e) {
            this._lastChooseItemCtrl = e;
          },
          getLastChooseItemCtrl: function () {
            return this._lastChooseItemCtrl;
          },
          setLastDownItemCtrl: function (e) {
            this._lastDownItemCtrl = e;
          },
          switchUseItem: function (e) {
            (this._lastUseItemCtrl &&
              (this._lastUseItemCtrl.doReset(), this._lastUseItemCtrl.showAsNotUsed()),
              this._lastDownItemCtrl && this._lastDownItemCtrl.doReset(),
              e.doReset(),
              e.showAsUsed(),
              (this._lastChooseItemCtrl = e),
              (this._lastUseItemCtrl = e));
          },
        }),
          cc._RF.pop());
      },
      { DlgBaseView: "DlgBaseView" },
    ],
