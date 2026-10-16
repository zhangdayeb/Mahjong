    WelfareTypeItem: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "584b76zQKVM0LSw/Bdru9NO", "WelfareTypeItem");
        var i = e("CommonUtils");
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            TitleIcon: cc.Sprite,
            WelfareTypeList: cc.Node,
            WelfareItem: cc.Prefab,
            _ItemInfo: null,
            _MaCfg: null,
            _ItemIdx: -1,
          },
          start: function () {},
          initItem: function (e, t, i, a) {
            (void 0 === e && (e = null),
              void 0 === t && (t = null),
              void 0 === i && (i = null),
              void 0 === a && (a = -1),
              isNull(e)
                ? (this.node.active = !1)
                : ((this._ItemInfo = e.infoItem),
                  (this._MaCfg = e.nCfg || null),
                  this.__updateTitleIcon(t),
                  this.onInitTypeList(i)));
          },
          __updateTitleIcon: function (e) {
            (void 0 === e && (e = null), isNull(e) || (this.TitleIcon.spriteFrame = e));
          },
          onInitTypeList: function (e) {
            this.WelfareTypeList.removeAllChildren();
            var t = this._ItemInfo.ListInfoArr || [],
              a = t.length;
            if (a > 0) {
              this.WelfareTypeList.active = !0;
              for (
                var o = g_oData.get(g_tData.SwitchModel).getMakabakaCfg(),
                  n = o.isAllOpen,
                  s = o.kickOutTable,
                  r = n && s,
                  c = g_oData.get(g_tData.MakabakaMod).isShowAdIcon(),
                  l = 0,
                  g = 0;
                g < a;
                g++
              ) {
                var d = t[g];
                if ((5 != d.IconNum || r) && (1 != d.IconNum || c)) {
                  var h = g_oPrefabLoader
                      .instantiate(this.WelfareItem, this.WelfareTypeList)
                      .getComponent("WelfareItem"),
                    u = d.SubStr;
                  if (!isNull(this._MaCfg))
                    if (isNull(d.ItemKey2)) {
                      if (!isNull(d.ItemKey)) {
                        var _ = d.ItemKey;
                        (console.log("max147222 infoItem.ItemKey = ", _),
                          isNull(this._MaCfg[_]) ||
                            (console.log(
                              "max147222 0000000 this._MaCfg[nItemKey] = ",
                              this._MaCfg[_],
                            ),
                            (u = i.replaceSpecialStrBySymbol(u, "*", this._MaCfg[_])).indexOf(
                              "*",
                            ) >= 0 && (u = i.replaceSpecialStrBySymbol(u, "*", this._MaCfg[_]))));
                      }
                    } else {
                      var m = d.ItemKey2;
                      if ("Special_Roulette" == m) {
                        var f = this.getRouletteNum(this._MaCfg.shareConvert);
                        ((u = i.replaceSpecialStrBySymbol(u, "*", f)),
                          console.log("max1470000 000000000 nSubStr = ", u));
                      } else "Coin_GET" == m && (u = this._formatCoinGet(u));
                    }
                  var p = d.IconNum;
                  (h.initItem(d.TitleStr, u, e[p - 1]), l++);
                }
              }
              this.WelfareTypeList.getComponent(cc.Layout).spacingX = l >= 5 ? 0 : l >= 4 ? 45 : 85;
            }
          },
          getRouletteNum: function (e) {
            var t = 13;
            g_oData.get(g_tData.SwitchModel).sub.exchange.isZJ && (t = 32);
            var i = -1 * (t + e),
              a = g_oData.get(g_tData.mod_Share).getShareCgtInfoByLinkID(t),
              o = a.used + a.times,
              n = g_oData.get(g_tData.mod_Share).getShareCgtInfoByLinkID(i),
              s = n.used + n.times;
            return (
              (s -= o),
              console.log("max1470000 getRouletteNum nLinkId = ", i, t, a, n),
              s > 0 ? s : 1
            );
          },
          _formatCoinGet: function (e) {
            if ("string" == typeof e) {
              var t = g_oGoodsManger.getMaCardInfoListCfg() || [],
                a = "",
                o = "";
              (t.forEach(function (e, n) {
                a += e.goodsSubDesc;
                var s = i.translateCoinStr(i.initProCoin((e.price / 10) * 1e4));
                ((o += s), n != t.length - 1 && ((a += "/"), (o += "/")));
              }),
                (e = format(e, a, o)));
            }
            return e;
          },
        }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils" },
    ],
