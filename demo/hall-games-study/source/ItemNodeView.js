    ItemNodeView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "95fc469EsJE35/Es9agFVho", "ItemNodeView");
        var i = e("ItemNodeEnum"),
          a = e("ItemNodeEnum2"),
          o = e("ZJItemNodeView"),
          n = e("CommonPlat"),
          s = [i.ComFareNum, i.VideoBtn];
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            NODE_TYPE: { default: i.None, type: i },
            NODE_TYPE2: { default: a.None, type: a },
            msg: "",
          },
          Awake: function () {
            this.NODE_TYPE != i.None ? this.oldUse() : this.NODE_TYPE2 != a.None && this.newUse();
          },
          newUse: function () {
            var e = null,
              t = null;
            (this.NODE_TYPE2 == a.FanXingResearchEntry &&
              ((e = g_tAsset.FanXingResearchEntry), (t = "FanXingResearchEntry")),
              this.NODE_TYPE2 == a.SXChgTileFront && (e = g_tAsset.SXChgTileFrontBtn),
              this.NODE_TYPE2 == a.GodHelpEntry && (e = g_tAsset.GodHelpEntry),
              this.NODE_TYPE2 == a.MjGodLuckBagEntry && (e = g_tAsset.MjGodLuckBagEntry),
              this.NODE_TYPE2 == a.FlopThroughEntry && (e = g_tAsset.FlopThroughEntry),
              this.NODE_TYPE2 == a.MoneyBoxEntry &&
                ((e = g_tAsset.MoneyBoxEntry), (t = "MoneyBoxEntry")),
              this.NODE_TYPE2 == a.FanGatherEntry &&
                ((e = g_tAsset.FanGatherEntry), (t = "FanGatherEntry")),
              this.NODE_TYPE2 == a.LoginLuckyAward && (e = g_tAsset.LoginLuckyAward),
              this.NODE_TYPE2 == a.GameTeachEntry && (e = g_tAsset.GameTeachEntry),
              this.NODE_TYPE2 == a.TreasureAttic && (e = g_tAsset.TreasureAtticEntry),
              this.NODE_TYPE2 == a.MJMasterPathRankEntry && (e = g_tAsset.MJMasterPathRankEntry),
              this.NODE_TYPE2 == a.PassCheckEnter && (e = g_tAsset.PassCheckEnter),
              this.NODE_TYPE2 == a.RegressionAct && (e = g_tAsset.RegressionActEnter),
              this.NODE_TYPE2 == a.CustomeLotteryEntry && (e = g_tAsset.CustomeLotteryEntry),
              e ? this._loadRes(e, t) : (this.node.active = !1));
          },
          oldUse: function () {
            var e = n.canPay();
            if (s.includes(this.NODE_TYPE))
              (this.node.addComponent(o).setNodeType(this.NODE_TYPE),
                this.node.removeComponent(this));
            else {
              var t = null,
                a = null;
              if (
                (this.NODE_TYPE == i.SectionLevel && (t = g_tAsset.SectionLevelPrefab),
                this.NODE_TYPE == i.ComCoinNum && (t = g_tAsset.ComCoinNumPrefab),
                this.NODE_TYPE == i.CustomTreasureEntry && (t = g_tAsset.CustomTreasureEntry),
                this.NODE_TYPE == i.LuckyBoxBtn && e && (t = g_tAsset.LuckyBoxBtnPrefab),
                this.NODE_TYPE == i.GoldEggNum && e && (t = g_tAsset.GoldEggNumPrefab),
                this.NODE_TYPE == i.FuCardNum && e && (t = g_tAsset.FuCardNumPrefab),
                this.NODE_TYPE == i.PeacockFeatherNum && (t = g_tAsset.PeacockFeatherNumPrefab),
                this.NODE_TYPE == i.LeagueMatchNum && (t = g_tAsset.LeagueMatchNumPrefab),
                this.NODE_TYPE == i.ZhuBoCode && (t = g_tAsset.ZhuBoCodePrefab),
                this.NODE_TYPE == i.ZhuBoCodeGame && (t = g_tAsset.ZhuBoCodeGamePrefab),
                this.NODE_TYPE == i.ZhuBoCodeGame2 && (t = g_tAsset.ZhuBoCodeGamePrefab2),
                this.NODE_TYPE == i.BigLuckyBoxBtn && (t = g_tAsset.BigLuckyBoxBtnPrefab),
                this.NODE_TYPE == i.ComDiamondNum && (t = g_tAsset.DiamondNumPrefab),
                this.NODE_TYPE == i.LuckyBagExchange && (t = g_tAsset.LuckyBagExchangeEntry),
                this.NODE_TYPE == i.ComZCoinNum && (t = g_tAsset.ZCoinNumPrefab),
                this.NODE_TYPE == i.TigerBack)
              ) {
                var r = !g_oData.get(g_tData.HonorPrivilegeMod).isAct();
                g_oData.get(g_tData.TigerBackBtnMod).canShowTigerBack() &&
                  r &&
                  (t = g_tAsset.TigerBackEntry);
              }
              (this.NODE_TYPE == i.QuickFan && (t = g_tAsset.QuickFanEnter),
                this.NODE_TYPE == i.CumulateZF && (t = g_tAsset.CumulateZFEnterPrefab),
                this.NODE_TYPE == i.HonorPirvilege && (t = g_tAsset.HonorPirvilegeEntry),
                this.NODE_TYPE == i.ShakeActivityBtnPrefab && (t = g_tAsset.ShakeActivityBtnPrefab),
                this.NODE_TYPE == i.ShopBtn && (t = g_tAsset.ShopBtn),
                this.NODE_TYPE == i.FuCoinNum && (t = g_tAsset.FuCoinNumPrefab),
                this.NODE_TYPE == i.HappyBumpEntry && (t = g_tAsset.HappyBumpEntry),
                this.NODE_TYPE == i.PrivilegeCardNum &&
                  ((t = g_tAsset.PrivilegeCardNumPrefab), (a = "PrivilegeCardNum")),
                this.NODE_TYPE == i.RoundToyIcon && (t = g_tAsset.RoundToyIcon),
                this.NODE_TYPE == i.QuickFanNew && (t = g_tAsset.QuickFanEnterNew),
                t ? this._loadRes(t, a) : (this.node.active = !1));
            }
          },
          _loadRes: function (e, t) {
            this.node.active = !0;
            var i = this;
            g_oPrefabLoader.loadRes(e, this.node, function (e) {
              if (((i._itemNode = e), cc.isValid(i.node) && cc.isValid(e) && !isNull(t))) {
                var a = e.getComponent(t);
                if (a) {
                  var o = {};
                  if ("string" == typeof i.msg && i.msg.length > 0)
                    if ("{" == i.msg[0] && "}" == i.msg[i.msg.length - 1])
                      try {
                        o = JSON.parse(i.msg);
                      } catch (n) {
                        Log.warn("Edwin", n);
                      }
                    else o = i.msg;
                  a.onInit && a.onInit(o);
                }
              }
            });
          },
          sendMsg: function (e, t) {
            this._itemNode && cc.isValid(this._itemNode) && this._itemNode.emit(e, t);
          },
        }),
          cc._RF.pop());
      },
      {
        CommonPlat: "CommonPlat",
        ItemNodeEnum: "ItemNodeEnum",
        ItemNodeEnum2: "ItemNodeEnum2",
        ZJItemNodeView: "ZJItemNodeView",
      },
    ],
