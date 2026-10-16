    MJMasterPathResult: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "707422q/ZJKBJSk6D2L8atI", "MJMasterPathResult"),
          cc.Class({
            extends: Cls_BaseView,
            properties: {
              icon_grade: {
                default: null,
                type: cc.Sprite,
                tooltip: "\u7b49\u7ea7\u7684icon\u56fe",
              },
              sp_rank: { default: null, type: cc.Sprite, tooltip: "ranklab\u80cc\u666f\u56fe" },
              progress: { default: null, type: cc.ProgressBar, tooltip: "\u8fdb\u5ea6\u6761" },
              mask_progress: {
                default: null,
                type: cc.Node,
                tooltip: "\u8fdb\u5ea6\u6761\u52a8\u753b\u906e\u7f69",
              },
              img_prgressBg: {
                default: [],
                type: [cc.SpriteFrame],
                tooltip: "\u8fdb\u5ea6\u6761\u80cc\u666f",
              },
              lab_pro: { default: null, type: cc.Label, tooltip: "\u8fdb\u5ea6\u6587\u5b57" },
              lab_rank: { default: null, type: cc.Label, tooltip: "rank\u7b49\u7ea7" },
              sp_award: { default: null, type: cc.Sprite, tooltip: "\u5956\u52b1iocn" },
              lab_awardNum: { default: null, type: cc.Label, tooltip: "\u5956\u52b1\u6570\u91cf" },
              lab_awardName: { default: null, type: cc.Label, tooltip: "\u5956\u52b1\u540d\u5b57" },
              award: { default: null, type: cc.Node, tooltip: "\u5956\u52b1\u8282\u70b9" },
              img_mk: { default: null, type: cc.SpriteFrame, tooltip: "\u9ebb\u5361\u5956\u52b1" },
            },
            Awake: function () {
              ((this.mod = g_oData.get(g_tData.MJMasterPathMod)),
                (this.MJMasterPathCfg = this.mod.mjMasterPathCfg),
                (this.MJMasterPathData = this.mod.mjMasterPathData),
                this.onCustomEvent(),
                this.onMessageEvent());
            },
            onCustomEvent: function () {},
            onMessageEvent: function () {
              var e = this;
              (this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.GET_MJ_PATH_DATA,
                  function () {
                    ((e.MJMasterPathData = e.mod.mjMasterPathData), e.onInit());
                  },
                  this,
                ),
              ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.UP_LV_MJ_PATH,
                    function (t) {
                      e.setProgress(t, !0);
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.MJ_PATH_WIN_LOSE,
                    function (t) {
                      e.progress.getComponent(cc.Sprite).spriteFrame =
                        t >= 0 ? e.img_prgressBg[0] : e.img_prgressBg[1];
                    },
                    this,
                  ),
                ));
            },
            start: function () {
              this.onInit();
            },
            onInit: function () {
              if (
                g_oData.get(g_tData.SwitchModel).isCheckReferral() ||
                !g_oData.get(g_tData.MJMasterPathMod).mjMasterPathData ||
                !g_oData.get(g_tData.MJMasterPathMod).mjMasterPathData.isOpen
              )
                return (
                  this.mod.loadSp("b_7", this.icon_grade),
                  (this.progress.node.active = !1),
                  void (this.sp_rank.node.active = !1)
                );
              this.setRankSp();
              var e = this.mod.getResultProgress();
              this.setProgress(e.data, e.up);
            },
            setRankSp: function () {
              var e,
                t = this.MJMasterPathData.lv || 0;
              this.lab_rank.string = t;
              for (
                var i = g_oData.get(g_tData.MJMasterPathMod).getRankConfigs(), a = 0;
                a < i.length;
                a++
              ) {
                var o = i[a];
                if (t <= o.maxLv) {
                  e = o;
                  break;
                }
              }
              e &&
                ((this.lab_rank.node.getComponent(cc.LabelOutline).color = new cc.Color().fromHEX(
                  e.outcolor,
                )),
                this.mod.loadSp("r_" + e.rankIndex, this.icon_grade),
                this.mod.loadSp("s_" + e.rankIndex, this.sp_rank));
              var n = t;
              this.MJMasterPathCfg.mjMasterPathLvCfg.length == t
                ? ((this.award.parent.active = !1), (n = t))
                : ((this.award.parent.active = !0), (n = t + 1));
              var s = g_oData.get(g_tData.MJMasterPathMod).getAwardInfo(n),
                r = s.mName,
                c = s.awardLab,
                l = s.num,
                g = this.MJMasterPathCfg.mjMasterPathLvCfg[n - 1].goodsInfo[0];
              if (g.type == g_tConst.GameConfig.ItemType.CSFare)
                if (11104 == g.goodsID);
                else {
                  var d = g_oData.get(g_tData.mod_Bag).getLocalCfgById(r);
                  ((d && d.name) || console.error("Roy__bagCfg", r, g),
                    (c = d.name),
                    0 == d.showType && "3" == d.name[2] && (c = c.replace("3", "")));
                }
              if (
                ((this.lab_awardName.string = c),
                (this.lab_awardNum.string = l),
                g.type == g_tConst.GameConfig.ItemType.CSFare)
              )
                if (11104 == g.goodsID) this.sp_award.spriteFrame = this.img_mk;
                else {
                  var h = g_oData.get(g_tData.mod_Bag).getLocalCfgById(r),
                    u = h.iconSmall;
                  0 == h.showType
                    ? (g_oSpriteFrameLoader.load_in_bundle(
                        g_tConst.GameConfig.BundleName.Common,
                        g_tAsset.BACKPACK_ITEM_PATH[1],
                        u,
                        this.sp_award,
                      ),
                      (this.sp_award.node.scale *= 0.8))
                    : 3 == h.showType &&
                      g_oSpriteFrameLoader.load_in_bundle(
                        g_tConst.GameConfig.BundleName.Lobby,
                        "GameDeskIcon/",
                        u,
                        this.sp_award,
                      );
                }
              else
                g_oSpriteFrameLoader.load_in_bundle(
                  g_tConst.GameConfig.BundleName.Common,
                  g_tAsset.AWARD_PATH,
                  r,
                  this.sp_award,
                );
            },
            setProgress: function (e, t) {
              var i = this;
              if ((void 0 === t && (t = !1), !this._isUpProgress)) {
                var a,
                  o = e.lv || 0,
                  n = this.MJMasterPathCfg.mjMasterPathLvCfg,
                  s = !1;
                n.length == o ? ((s = !0), (a = 1)) : (a = n[o].exp - (0 == o ? 0 : n[o - 1].exp));
                var r = e.exp || 0;
                ((r -= 0 == o ? 0 : n[o - 1].exp), s && (r = e.exp));
                var c = this.mod.newData;
                if (t)
                  if (s) {
                    if (this.lab_pro.string == c.exp - (0 == o ? 0 : n[o - 1].exp) + "") return;
                  } else if (this.lab_pro.string == c.exp - (0 == o ? 0 : n[o - 1].exp) + "/" + a)
                    return;
                ((this.progress.progress = r / a),
                  (this.lab_pro.string = r + "/" + a),
                  (this.mask_progress.width = this.progress.totalLength * (Number(r) / Number(a))),
                  s && (this.lab_pro.string = e.exp),
                  t &&
                    (this.mod.setResultData(),
                    this.scheduleOnce(function () {
                      var e = c.exp - r - (0 == o ? 0 : n[o - 1].exp);
                      s
                        ? i.upDataProgress(r, c.exp, a, c.exp - r, s)
                        : i.upDataProgress(r, c.exp - (0 == o ? 0 : n[o - 1].exp), a, e, s);
                    }, 1)));
              }
            },
            upDataProgress: function (e, t, i, a, o) {
              var n = this;
              if (t == e)
                return (
                  (this._isUpProgress = !1),
                  this.mod.jumpToRankData(),
                  void this.mod.reqGetMJMasterPathUserData()
                );
              ((this._isUpProgress = !0),
                e++,
                (this.progress.progress = e / i),
                (this.lab_pro.string = e + "/" + i),
                o && (this.lab_pro.string = e),
                (this.mask_progress.width = this.progress.totalLength * (Number(e) / Number(i))),
                this.scheduleOnce(function () {
                  n.upDataProgress(e, t, i, a, o);
                }, 0.5 / a));
            },
            initMjMPath: function () {
              !g_oData.get(g_tData.SwitchModel).isCheckReferral() &&
                g_oData.get(g_tData.MJMasterPathMod).mjMasterPathData &&
                g_oData.get(g_tData.MJMasterPathMod).mjMasterPathData.isOpen &&
                g_oLayerManager.emitEvent2Dlg(
                  g_tConst.GameLayerCfg.MJMasterPathMain.id,
                  "ON_INIT",
                  "End",
                );
            },
            onClickAward: function () {
              var e = this.MJMasterPathData.lv || 0;
              this.MJMasterPathCfg.mjMasterPathLvCfg.length != e &&
                (this.award.active = !this.award.active);
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
