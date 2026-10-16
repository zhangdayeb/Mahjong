    FanGatherView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "a8648KdqORHtY1uckDGJGgU", "FanGatherView");
        var i = e("AlertDlgBaseView"),
          a = e("MgrBundle"),
          o = e("FanGatherPreView"),
          n = cc.Class({
            name: "levelModel",
            properties: { tileTexture: cc.Color, img_bg: cc.SpriteFrame },
          });
        (cc.Class({
          extends: i,
          properties: {
            toggleContainer: cc.ToggleContainer,
            pieceEffect: cc.EffectAsset,
            fanGatherPreView: o,
            scrollContent: cc.Node,
            mainBagLayer: cc.Node,
            mainBagBtn: cc.Node,
            mainBagRed: cc.Node,
            mainBagLab: cc.Label,
            mainBagProgress: cc.ProgressBar,
            levelInfo: [n],
            ruleNode: cc.Node,
            _nGameType: 0,
            _getAwardItem: null,
            mainBagPreview: cc.Node,
            mainBagPreviewParent: cc.Node,
            sfIcon: [cc.SpriteFrame],
            wgt_close: cc.Widget,
          },
          Awake: function () {
            ((this._closeReleaseRes = !0),
              this.onMessageEvent(),
              this.onCustomEvent(),
              (this.fanGatherPreView.node.active = !1),
              (this.fanGatherPreView.levelInfo = this.levelInfo),
              this.setBtnPos(),
              (this.toggleContainer.node.getChildByName("898").zIndex = 1),
              (this.toggleContainer.node.getChildByName("898").playType = 2),
              (this.toggleContainer.node.getChildByName("893").zIndex = 2),
              (this.toggleContainer.node.getChildByName("893").playType = 1),
              (this.toggleContainer.node.getChildByName("866").zIndex = 4),
              (this.toggleContainer.node.getChildByName("866").playType = 4),
              (this.toggleContainer.node.getChildByName("911").zIndex = 5),
              (this.toggleContainer.node.getChildByName("911").playType = 5));
          },
          setBtnPos: function () {
            cc.winSize.width >= 1380 &&
              ((this.wgt_close.left = (cc.winSize.width - 1380) / 2),
              this.wgt_close.updateAlignment());
          },
          onMessageEvent: function () {
            var e = this;
            this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.REFRESH_FAN_GATHER_VIEW,
                function () {
                  e.onClickToggleContainer();
                },
                this,
              ),
            );
          },
          onCustomEvent: function () {
            var e = g_tConst.FanGatherGameTypeMap;
            this.node.on(
              "ON_INIT",
              function (t) {
                var i = this,
                  a = g_oData
                    .get(g_tData.mod_gamecfg)
                    .getPlatCfgByName("fanGatherCfg").playFanGatherCfg,
                  o = t.entry,
                  n = t.nGameType;
                if (
                  (n == g_tConst.GameTypeCfgs.FKSJCCBXP.TYPEID &&
                    (n = g_tConst.GameTypeCfgs.SJCCBXP.TYPEID),
                  "lobby" == o)
                ) {
                  var s = function (t) {
                    Object.hasOwnProperty.call(e, t) &&
                      (a.find(function (e) {
                        return e.playType === i.toggleContainer.node.getChildByName(t).playType;
                      })
                        ? (i.toggleContainer.node.getChildByName(t).active = !0)
                        : (i.toggleContainer.node.getChildByName(t).active = !1));
                  };
                  for (var r in e) s(r);
                } else
                  for (var c in e)
                    Object.hasOwnProperty.call(e, c) &&
                      ((this.toggleContainer.node.getChildByName(c).active = c == n),
                      c == n &&
                        (this.toggleContainer.node
                          .getChildByName(c)
                          .getComponent(cc.Toggle).isChecked = !0));
                this.init();
              }.bind(this),
            );
          },
          start: function () {},
          init: function () {
            this.onClickToggleContainer();
          },
          onClickToggleContainer: function () {
            for (
              var e = this,
                t = g_oData
                  .get(g_tData.mod_gamecfg)
                  .getPlatCfgByName("fanGatherCfg").playFanGatherCfg,
                i = 0,
                a = function (a) {
                  var o = e.toggleContainer.node.children[a];
                  (o.getComponent(cc.Toggle).isChecked &&
                    ((i = o.playType), (e._nGameType = Number(o.name))),
                    t.find(function (e) {
                      return e.playType === o.playType;
                    })
                      ? (o.getChildByName("red_icon").active = g_oData
                          .get(g_tData.FanGatherMod)
                          .checkPlayTypeRedIcon(Number(o.name), o.playType))
                      : (o.getChildByName("red_icon").active = !1));
                },
                o = 0;
              o < this.toggleContainer.node.children.length;
              o++
            )
              a(o);
            var n = g_oData.get(g_tData.FanGatherMod).FanGatherInfo;
            if (n) {
              var s = [],
                r = i;
              this.__playType = r;
              for (var c, l = [], g = 0; g < n.playGatherInfo.length; g++)
                n.playGatherInfo[g].playType == r && (l = n.playGatherInfo[g].progressAwardRev);
              for (var d = 0; d < t.length; d++) t[d].playType == r && (c = t[d]);
              s = s.concat(c.fanCardCfg);
              var h = c.gatherProgressAward;
              this.gatherProgressAward = h;
              for (var u = 0, _ = 0; _ < s.length; _++) {
                var m = s[_],
                  f = g_oData.get(g_tData.FanGatherMod).getFanGatherInfo(m.fanType, r);
                f && (u += f.achieveRound);
              }
              for (var p = null, C = null, v = null, y = 0; y < h.length; y++) {
                var S = h[y];
                if (1 == S.gatherType) {
                  var D = S.progressAward;
                  D.sort(function (e, t) {
                    return e.needProgress - t.needProgress;
                  });
                  for (var T = 0; T < D.length; T++) {
                    var I = D[T];
                    if (!p && u >= I.needProgress) {
                      for (var E = !1, M = 0; M < l.length; M++) {
                        var L = l[M];
                        if (L.gatherType == S.gatherType)
                          for (var A = 0; A < L.receivedProgress.length; A++)
                            L.receivedProgress[A] == I.needProgress && (E = !0);
                      }
                      E || ((p = I), (v = S));
                    }
                    !C && u < I.needProgress && (C = I);
                  }
                }
              }
              ((this.mainBagLayer.active = !0),
                (this._awardInfo = p),
                (this._progressAward = v),
                (this._playFanGatherCfg = c),
                (this.mainBagRed.active = null != p),
                this.mainBagRed.active
                  ? this.mainBagBtn.emit("playAnim")
                  : this.mainBagBtn.emit("stopAnim"),
                p
                  ? ((this.mainBagLab.string = p.needProgress + "/" + p.needProgress),
                    (this.mainBagProgress.progress = 1))
                  : C
                    ? ((this.mainBagLab.string = u + "/" + C.needProgress),
                      (this.mainBagProgress.progress = u / C.needProgress))
                    : (this.mainBagLayer.active = !1),
                (this._nextAwardInfo = C),
                (this.mainBagPreview.active = !1),
                this.refreshScrollView(s),
                this.fanGatherPreView.init(s, n, this.__playType, this._nGameType));
            }
          },
          refreshScrollView: function (e) {
            for (var t = 0; t < this.scrollContent.children.length; t++)
              this.scrollContent.children[t].active = !1;
            for (var i = 0; i < e.length; i++) {
              var a = e[i],
                o = void 0;
              (this.scrollContent.children[i]
                ? (o = this.scrollContent.children[i])
                : ((o = cc.instantiate(this.scrollContent.children[0])).parent =
                    this.scrollContent),
                (o.active = !0),
                this.refreshItemNode(o, a));
            }
          },
          refreshItemNode: function (t, i) {
            var o = t.getChildByName("img_fan"),
              n = t.getChildByName("img_normal_fan"),
              s = (t.getChildByName("img_bg"), t.getChildByName("img_frame")),
              r = t.getChildByName("mask_progress"),
              c = t.getChildByName("title_new"),
              l = t.getChildByName("btn_bag"),
              g = l.getChildByName("btn_bag_red"),
              d = t.getChildByName("lab_progress"),
              h = t.getChildByName("lab_name"),
              u = g_oData.get(g_tData.FanGatherMod).getFanGatherInfo(i.fanType, this.__playType);
            if (((t._info = u), (t._cfg = i), (l._info = u), (l._cfg = i), u)) {
              ((o.active = !0),
                (n.active = !0),
                a.getBundle(a.eBundle.lobby).then(function (t) {
                  t.load("FanGather/load/" + i.fanType, cc.SpriteFrame, function (t, a) {
                    (!t && a && e("FanGatherCtrl").saveResCache(i.fanType, a),
                      !t && cc.isValid(o)
                        ? ((o.getComponent(cc.Sprite).spriteFrame = a),
                          (n.getComponent(cc.Sprite).spriteFrame = a))
                        : cc.isValid(o) &&
                          ((o.getComponent(cc.Sprite).spriteFrame = null),
                          (n.getComponent(cc.Sprite).spriteFrame = null)));
                  });
                }),
                (h.getComponent(cc.Label).string = i.fanName),
                (s.active = !0),
                (r.active = !0),
                (d.active = !0),
                u.achieveRound > 0 && u.achieveRound < i.gatherAwardCfg[1].needAchieveRound
                  ? ((s.getComponent(cc.Sprite).spriteFrame = this.levelInfo[1].img_bg),
                    (h.color = this.levelInfo[1].tileTexture))
                  : u.achieveRound >= i.gatherAwardCfg[1].needAchieveRound &&
                    ((s.getComponent(cc.Sprite).spriteFrame = this.levelInfo[2].img_bg),
                    (h.color = this.levelInfo[2].tileTexture),
                    (h.getComponent(cc.Label).string = i.fanName + "-\u6781")),
                u.achieveRound >= 9
                  ? (o.active = !1)
                  : ((n.active = !1),
                    t
                      .getChildByName("img_fan")
                      .getComponent(cc.Sprite)
                      .getMaterial(0)
                      .setProperty("curNum", u.achieveRound)),
                (l.active = !1),
                (g.active = !1),
                (d.active = !0));
              var _ = u.achieveRound,
                m = i.gatherAwardCfg[0].needAchieveRound;
              if (u.achieveRound >= i.gatherAwardCfg[0].needAchieveRound) {
                for (var f = !0, p = 0; p < u.receivedAwardType.length; p++)
                  u.receivedAwardType[p] == i.gatherAwardCfg[0].awardType && (f = !1);
                (f &&
                  ((g.active = !0),
                  (l.active = !0),
                  (l.awardType = 1),
                  (l.playType = this._playFanGatherCfg.playType),
                  (l.fanType = i.fanType)),
                  (m = i.gatherAwardCfg[1].needAchieveRound));
              }
              if (!l.active && u.achieveRound >= i.gatherAwardCfg[1].needAchieveRound) {
                for (var C = !0, v = 0; v < u.receivedAwardType.length; v++)
                  u.receivedAwardType[v] == i.gatherAwardCfg[1].awardType && (C = !1);
                (C &&
                  ((g.active = !0),
                  (l.active = !0),
                  (l.awardType = 2),
                  (l.playType = this._playFanGatherCfg.playType),
                  (l.fanType = i.fanType)),
                  (d.active = !1),
                  (r.active = !1));
              }
              ((d.getComponent(cc.Label).string = _ + "/" + m), (c.active = l.active && g.active));
            } else
              ((s.active = !1),
                (o.active = !1),
                (n.active = !1),
                (r.active = !1),
                (c.active = !1),
                (l.active = !1),
                (d.active = !1),
                (h.getComponent(cc.Label).string = "???"),
                (h.color = this.levelInfo[0].tileTexture));
            l.active && g.active ? l.emit("playAnim") : l.emit("stopAnim");
          },
          onClickMainBag: function () {
            if (this._awardInfo && this._progressAward)
              g_oData
                .get(g_tData.FanGatherMod)
                .reqReceiveFanGatherProgressAward(
                  this._playFanGatherCfg.playType,
                  this._progressAward.gatherType,
                  this._awardInfo.needProgress,
                );
            else {
              if (!this._nextAwardInfo)
                return (
                  (this.mainBagPreview.active = !1),
                  g_oPlatform.doAction(
                    g_tConst.tPlatActionId.actionShowToast,
                    "\u5956\u52b1\u5df2\u7ecf\u5168\u90e8\u9886\u53d6\u5b8c\uff01",
                  )
                );
              if (
                ((this.mainBagPreview.active = !this.mainBagPreview.active),
                !this.mainBagPreview.active)
              )
                return;
              this.showMainBagPreView();
            }
          },
          onClickItemPreView: function (e) {
            var t = e.currentTarget.getChildByName("btn_bag");
            if (t.active)
              this.onClickItemBag({
                currentTarget: { awardType: t.awardType, fanType: t.fanType, playType: t.playType },
              });
            else {
              var i = e.currentTarget._info,
                a = e.currentTarget._cfg;
              i
                ? this.fanGatherPreView.showView(i, a)
                : g_oPlatform.doAction(
                    g_tConst.tPlatActionId.actionShowToast,
                    "\u524d\u5f80\u5bf9\u5c40\u83b7\u53d6\u788e\u7247\u5427\uff01",
                  );
            }
          },
          onClickItemBag: function (e) {
            var t = e.currentTarget.awardType,
              i = e.currentTarget.fanType,
              a = e.currentTarget.playType;
            g_oData.get(g_tData.FanGatherMod).reqReceiveFanGatherAward(a, i, t);
          },
          showMainBagPreView: function () {
            this.mainBagPreview.active = !0;
            for (var e = 0; e < this.mainBagPreviewParent.children.length; e++)
              this.mainBagPreviewParent.children[e].active = !1;
            for (var t = 0; t < this._nextAwardInfo.award.length; t++) {
              var i = this._nextAwardInfo.award[t],
                a = void 0;
              (this.mainBagPreviewParent.children[t]
                ? ((a = this.mainBagPreviewParent.children[t]).active = !0)
                : ((a = cc.instantiate(this.mainBagPreviewParent.children[0])).parent =
                    this.mainBagPreviewParent),
                this.refreshGoodsItem(a, i));
            }
          },
          refreshGoodsItem: function (t, i) {
            var a = i.type,
              o = t.getChildByName("kuang").getChildByName("img_douzi"),
              n = t.getChildByName("lab_award"),
              s = "",
              r = e("CommonUtils");
            switch (a) {
              case g_tConst.GameConfig.ItemType.GoldCard:
                ((o.getComponent(cc.Sprite).spriteFrame = this.sfIcon[0]),
                  (s = r.translateCoinStr(r.initProCoin(parseInt(i.num))) + "\u6e38\u620f\u8c46"));
                break;
              case g_tConst.GameConfig.ItemType.Diamond:
                ((o.getComponent(cc.Sprite).spriteFrame = this.sfIcon[1]),
                  (s = i.num + "\u94bb\u77f3"));
                break;
              case g_tConst.GameConfig.ItemType.ZCoin:
                ((o.getComponent(cc.Sprite).spriteFrame = this.sfIcon[2]),
                  (s = r.translateCoinStr(r.initProCoin(parseInt(i.num))) + "\u6307\u5c16\u5e01"));
            }
            n.getComponent(cc.Label).string = s;
          },
          onClickClose: function () {
            (g_oData.get(g_tData.FanGatherMod).resetNewIconInfo(),
              e("HuAniLoadImageCtrl").releaseAllRes(),
              this.close());
          },
          onClickShowHelp: function () {
            this.ruleNode.active = !0;
          },
          onClickCloseHelp: function () {
            this.ruleNode.active = !1;
          },
        }),
          cc._RF.pop());
      },
      {
        AlertDlgBaseView: "AlertDlgBaseView",
        CommonUtils: "CommonUtils",
        FanGatherCtrl: "FanGatherCtrl",
        FanGatherPreView: "FanGatherPreView",
        HuAniLoadImageCtrl: "HuAniLoadImageCtrl",
        MgrBundle: void 0,
      },
    ],
