    FanGatherPreView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "c11315ZSrhMOI5XBOumQ+mN", "FanGatherPreView");
        var i = e("MgrBundle");
        (cc.Class({
          extends: cc.Component,
          properties: {
            content: cc.Node,
            itemContent: cc.Node,
            itemParent: cc.Node,
            levelInfo: null,
            _checkPlayAnimFinish: !0,
            _playAnimTarget: null,
            scrollView: cc.Node,
            layoutNode: cc.Node,
            _nGameType: 0,
            testSliderNode: cc.Node,
          },
          onLoad: function () {
            ((this._gmCfg = g_oData.get(g_tData.SwitchModel).getFanGatherCfg()),
              (this.testSliderNode.active = this._gmCfg.bSlide));
          },
          onEnable: function () {},
          init: function (e, t, i, a) {
            ((this.fanGatherInfo = t),
              (this.allInfoList = e),
              (this.__playType = i),
              (this._nGameType = a));
          },
          showView: function (t, a, o) {
            (void 0 === o && (o = !0),
              (this._playInfo = t),
              (this._playCfg = a),
              (this.node.active = !0));
            var n = "ex_" + a.img,
              s = a.fanName;
            a.fanType < 1e3 && ((n = "ex_bigHu"), (s = "\u751f\u8096\u6760"));
            var r = g_tAsset.newGameAnimPrefabMap[n];
            if (
              (r ||
                (console.warn("\u51fa\u9519\u4e86", t, a),
                (n = "ex_bigHu"),
                (s = a.fanName),
                (r = g_tAsset.newGameAnimPrefabMap[n])),
              o)
            ) {
              this.allList = [];
              for (var c = 0; c < this.allInfoList.length; c++) {
                var l = this.allInfoList[c];
                l.fanType == this._playCfg.fanType ? this.allList.unshift(l) : this.allList.push(l);
              }
            }
            if (
              (g_oData.get(g_tData.FanGatherMod).reportFanGatherLook(s), this._checkPlayAnimFinish)
            ) {
              this._playAnimTarget ||
                ((this._playAnimTarget = new cc.Node("playAnimTarget")),
                this._playAnimTarget.addComponent(cc.Sprite),
                this.content.addChild(this._playAnimTarget));
              var g = this._playAnimTarget;
              i.getBundle(i.eBundle.lobby).then(function (t) {
                t.load("FanGather/load/max_" + a.fanType, cc.SpriteFrame, function (t, i) {
                  (!t && i && e("FanGatherCtrl").saveResCache(a.fanType, i),
                    !t && cc.isValid(g)
                      ? (g.getComponent(cc.Sprite).spriteFrame = i)
                      : cc.isValid(g) && (g.getComponent(cc.Sprite).spriteFrame = null));
                });
              });
            }
            for (var d = 0; d < this.itemParent.children.length; d++) {
              var h = this.itemParent.children[d],
                u = h.getChildByName("lab_fan"),
                _ = h.getChildByName("lab2"),
                m = this.getGameParams(),
                f = t.achieveRound,
                p = ((t.winRound || 0) / f) * 100,
                C = g_oCommonUtils.Long2Number(t.maxFan || 0),
                v = g_oCommonUtils.Long2Number(t.maxWin || 0),
                y = "";
              (0 == d
                ? (g_tConst.FanGatherCfg.Debug.maxParams.fanTime,
                  (u.getComponent(cc.Label).string =
                    "\u756a\u578b\u6b21\u6570\uff1a" + f + "\u6b21"),
                  (y = this.getNormcdf(f, m.fanTime)))
                : 1 == d
                  ? (g_tConst.FanGatherCfg.Debug.maxParams.fanWin,
                    (u.getComponent(cc.Label).string =
                      "\u5f53\u524d\u756a\u578b\u80dc\u7387\uff1a" +
                      p.toFixed(1).replace(".0", "") +
                      "%"),
                    (y = this.getNormcdf(p, m.fanWin)))
                  : 2 == d
                    ? (g_tConst.FanGatherCfg.Debug.maxParams.maxFan,
                      (u.getComponent(cc.Label).string =
                        "\u6700\u5927\u500d\u6570\uff1a" + g_oCommonUtils.formatFan(C) + "\u500d"),
                      (y = this.getNormcdf(C, m.maxFan)))
                    : 3 == d &&
                      (g_tConst.FanGatherCfg.Debug.maxParams.maxGet,
                      (u.getComponent(cc.Label).string =
                        "\u6700\u5927\u8d62\u53d6\uff1a" +
                        g_oCommonUtils.translateCoinStr(g_oCommonUtils.initProCoin(v))),
                      (y = this.getNormcdf(v, m.maxGet))),
                (_.getComponent(cc.Label).string = y + "%"));
            }
            this.refreshContent();
          },
          onClickClose: function () {
            this.node.active = !1;
          },
          onClickPlayAnim: function () {
            this.showView(this._playInfo, this._playCfg, !1);
          },
          refreshContent: function () {
            for (var e = [], t = 0; t < this.allList.length; t++) {
              var i = this.allList[t];
              g_oData.get(g_tData.FanGatherMod).getFanGatherInfo(i.fanType, this.__playType) &&
                e.push(i);
            }
            for (var a = 0; a < this.itemContent.children.length; a++)
              this.itemContent.children[a].active = !1;
            if (e.length <= 1) {
              ((this.layoutNode.active = !0), (this.scrollView.active = !1));
              for (var o = 0; o < e.length; o++) {
                var n = e[o],
                  s = void 0;
                (this.layoutNode.children[o]
                  ? (s = this.layoutNode.children[o])
                  : ((s = cc.instantiate(this.itemContent.children[0])).parent = this.layoutNode),
                  (s.active = !0),
                  this.refreshItemNode(s, n));
              }
            } else {
              ((this.layoutNode.active = !1), (this.scrollView.active = !0));
              for (var r = 0; r < e.length; r++) {
                var c = e[r],
                  l = void 0;
                (this.itemContent.children[r]
                  ? (l = this.itemContent.children[r])
                  : ((l = cc.instantiate(this.itemContent.children[0])).parent = this.itemContent),
                  (l.active = !0),
                  this.refreshItemNode(l, c));
              }
            }
          },
          refreshItemNode: function (t, i) {
            var a = g_oData.get(g_tData.FanGatherMod).getFanGatherInfo(i.fanType, this.__playType);
            if (a) {
              var o = t.getChildByName("root"),
                n = o.getChildByName("img_fan"),
                s = o.getChildByName("img_frame"),
                r = o.getChildByName("lab_name"),
                c = o.getChildByName("img_select");
              ((n._info = a), (n._cfg = i), (t._cfg = i));
              var l = e("MgrBundle");
              (l.getBundle(l.eBundle.lobby).then(function (t) {
                t.load("FanGather/load/" + i.fanType, cc.SpriteFrame, function (t, a) {
                  (!t && a && e("FanGatherCtrl").saveResCache(i.fanType, a),
                    !t && cc.isValid(n)
                      ? (n.getComponent(cc.Sprite).spriteFrame = a)
                      : cc.isValid(n) && (n.getComponent(cc.Sprite).spriteFrame = null));
                });
              }),
                a.achieveRound > 0 && a.achieveRound < i.gatherAwardCfg[1].needAchieveRound
                  ? ((s.getComponent(cc.Sprite).spriteFrame = this.levelInfo[1].img_bg),
                    (r.color = this.levelInfo[1].tileTexture))
                  : a.achieveRound >= i.gatherAwardCfg[1].needAchieveRound &&
                    ((s.getComponent(cc.Sprite).spriteFrame = this.levelInfo[2].img_bg),
                    (r.color = this.levelInfo[2].tileTexture)),
                i.fanType == this._playCfg.fanType
                  ? ((c.active = !0),
                    (s.getComponent(cc.Sprite).spriteFrame = this.levelInfo[2].img_bg),
                    (r.color = this.levelInfo[2].tileTexture))
                  : (c.active = !1),
                (r.getComponent(cc.Label).string = i.fanName));
            } else t.active = !1;
          },
          onClickItemPreView: function (e) {
            var t = e.currentTarget._info,
              i = e.currentTarget._cfg;
            i.fanType == this._playCfg.fanType || this.showView(t, i, !1);
          },
          getNormcdf: function (e, t) {
            if (0 == e) return 0;
            var i = Math.round((1e4 * g_oCommonUtils.normcdf(e, t[0], t[1])) / 100);
            return (i >= 100 && (i = 99), i);
          },
          getGameParams: function () {
            return this._gmCfg.params["" + this._nGameType] || null;
          },
          onMoveSliderFanTime: function (e) {
            var t = this.getGameParams(),
              i = g_tConst.FanGatherCfg.Debug.maxParams.fanTime,
              a = Math.floor(i * e.progress),
              o = this.itemParent.children[0],
              n = o.getChildByName("lab_fan"),
              s = o.getChildByName("lab2");
            ((n.getComponent(cc.Label).string = "\u756a\u578b\u6b21\u6570\uff1a" + a + "\u6b21"),
              (s.getComponent(cc.Label).string = this.getNormcdf(a, t.fanTime) + "%"));
          },
          onMoveSliderFanWin: function (e) {
            var t = this.getGameParams(),
              i = g_tConst.FanGatherCfg.Debug.maxParams.fanWin,
              a = Math.floor(i * e.progress),
              o = this.itemParent.children[1],
              n = o.getChildByName("lab_fan"),
              s = o.getChildByName("lab2");
            ((n.getComponent(cc.Label).string =
              "\u5f53\u524d\u756a\u578b\u80dc\u7387\uff1a" + a.toFixed(1).replace(".0", "") + "%"),
              (s.getComponent(cc.Label).string = this.getNormcdf(a, t.fanWin) + "%"));
          },
          onMoveSliderMaxFan: function (e) {
            var t = this.getGameParams(),
              i = g_tConst.FanGatherCfg.Debug.maxParams.maxFan,
              a = Math.floor(i * e.progress),
              o = this.itemParent.children[2],
              n = o.getChildByName("lab_fan"),
              s = o.getChildByName("lab2");
            ((n.getComponent(cc.Label).string =
              "\u6700\u5927\u500d\u6570\uff1a" + g_oCommonUtils.formatFan(a) + "\u500d"),
              (s.getComponent(cc.Label).string = this.getNormcdf(a, t.maxFan) + "%"));
          },
          onMoveSliderMaxGet: function (e) {
            var t = this.getGameParams(),
              i = g_tConst.FanGatherCfg.Debug.maxParams.maxGet,
              a = Math.floor(i * e.progress),
              o = this.itemParent.children[3],
              n = o.getChildByName("lab_fan"),
              s = o.getChildByName("lab2");
            ((n.getComponent(cc.Label).string =
              "\u6700\u5927\u8d62\u53d6\uff1a" +
              g_oCommonUtils.translateCoinStr(g_oCommonUtils.initProCoin(a))),
              (s.getComponent(cc.Label).string = this.getNormcdf(a, t.maxGet) + "%"));
          },
        }),
          cc._RF.pop());
      },
      { FanGatherCtrl: "FanGatherCtrl", MgrBundle: void 0 },
    ],
