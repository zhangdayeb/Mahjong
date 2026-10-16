    TreasureAtticView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "5d255YADCNBCZdeuxfE6ZGi", "TreasureAtticView");
        var i = e("AlertDlgBaseView"),
          a = e("CommonUtils"),
          o = new Map();
        (o.set(1002001, 0),
          o.set(100920, 1),
          cc.Class({
            extends: i,
            properties: {
              animMask: cc.Node,
              lab_actTime: cc.Label,
              node_record: cc.Node,
              lab_record: cc.Label,
              node_faq: cc.Node,
              lab_faq: cc.Label,
              lab_consume: cc.Label,
              lab_guard: cc.Label,
              guardAwardIcon: cc.Sprite,
              lab_progress: { default: null, type: cc.Label },
              lab_TCoinNum: { default: null, type: cc.Label },
              node_skipAnim: { default: null, type: cc.Node },
              goodsContent: { default: null, type: cc.Node },
              goodsItem: { default: null, type: cc.Prefab },
              progressBar: { default: null, type: cc.ProgressBar },
              progressContent: { default: null, type: cc.Node },
              progressItem: { default: null, type: cc.Prefab },
              goodsDetail: { default: null, type: cc.Node },
              goodsIcon: { default: [], type: [cc.SpriteFrame] },
              redPoint: { default: null, type: cc.Node },
              ATGetAwardView: { default: null, type: cc.Prefab },
              alert: { default: null, type: cc.Node },
              lab_alertTip: { default: null, type: cc.Label },
              node_check: { default: null, type: cc.Node },
            },
            Awake: function () {
              ((this._closeReleaseRes = !0),
                (this._mod = null),
                (this._goodsItemComp = []),
                (this._progressItemComp = []),
                (this._animNode = null),
                (this._animing = !1),
                (this._mod = g_oData.get(g_tData.TreasureAtticMod)),
                this.onMessageEvent());
            },
            onMessageEvent: function () {
              ((this._updateBackpack = !1),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.ON_SHOW_BAG_NEW_GOOD,
                    function () {
                      this._updateBackpack = !0;
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.NOTIFY_TREASURE_ATTIC_DATA,
                    function () {
                      (this.updateLotConsume(), this.updateProgress(), this.showGuardAwarad());
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.PLAT_EVENT_GAME_GOODS_ITEM_UPDATE,
                    function () {
                      this.updateTCoinNum();
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.TA_EXCHANGE_COIN_SUCC,
                    function () {
                      this._mod.reqDoLot(!1);
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.TREASURE_ATTIC_LOT_SUCC,
                    function (e) {
                      var t = !this.node_skipAnim.active;
                      this.showLotResult(t, e);
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.TREASURE_ATTIC_GET_AWARD,
                    function (e) {
                      var t = g_oPrefabLoader.instantiate(this.ATGetAwardView, this.node);
                      t &&
                        t.emit("onInit", {
                          data: e.awardCfg.goodsInfo,
                          canReLot: !1,
                          grade: e.awardCfg.grade,
                        });
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.TREASURE_PROGRESS_ATTIC_GET_AWARD,
                    function (e) {
                      var t = g_oPrefabLoader.instantiate(this.ATGetAwardView, this.node);
                      t && t.emit("onInit", { data: e, canReLot: !1, grade: e.awardCfg.grade });
                    },
                    this,
                  ),
                ));
            },
            start: function () {
              (this._super(),
                this.showGoods(),
                this.updateTCoinNum(),
                this.showActTime(),
                this.showGuardAwarad(),
                this.updateLotConsume(),
                this.updateProgress(),
                g_oData
                  .get(g_tData.gameReportData)
                  .reportAction(g_tConst.ReportCfg.TreasureAttic.Show));
            },
            showActTime: function () {
              if (this._mod.isInActTime()) {
                var e = 1e3 * this._mod.getStartTime(),
                  t = 1e3 * this._mod.getEndTime();
                this.lab_actTime.string =
                  "\u6bcf\u65e5\u767b\u5f55\u514d\u8d39\u62bd  " +
                  a.getDateByStamp2(e) +
                  "-" +
                  a.getDateByStamp2(t);
              } else this.lab_actTime.string = "\u6d3b\u52a8\u5df2\u7ed3\u675f";
            },
            showGuardAwarad: function () {
              var e = this._mod.getGuardProgressTimes(),
                t = this._mod.getAwardGuard(),
                i = "",
                a = "";
              if (!isNull(t)) {
                a = "\u5f53\u524d\u8fdb\u5ea6(" + e + "/" + t.lotTimes + ")";
                var o = this._mod.getAwardById(t.awardId),
                  n = this.getGoodsDisplayData(this._mod.getShowAward(o.goodsInfo));
                i = "\u6bcf" + t.lotTimes + "\u62bd\u5fc5\u51fa" + (null == n ? void 0 : n.name);
              }
              ((this.lab_guard.string = i), (this.lab_progress.string = a));
            },
            updateLotConsume: function () {
              var e,
                t = this._mod.getTodayFreeTimes() > 0;
              ((e = t
                ? "\u6bcf\u65e5\u767b\u5f55\u8d60\u90011\u6b21\u62bd\u5956"
                : "\u6d88\u80171\u4e2a\u5947\u73cd\u5e01"),
                (this.lab_consume.string = e),
                (this.redPoint.active = t));
            },
            updateTCoinNum: function () {
              this.lab_TCoinNum.string = this._mod.getTCoinNum();
            },
            showLotResult: function (e, t) {
              var i = this,
                a = t.awardCfg,
                o = function () {
                  var e = g_oPrefabLoader.instantiate(i.ATGetAwardView, i.node);
                  e &&
                    e.emit("onInit", {
                      data: a.goodsInfo,
                      canReLot: t.canReLot || !1,
                      grade: a.grade,
                    });
                };
              this._goodsItemComp.forEach(function (e) {
                e.setShowType(0);
              });
              var n = this._goodsItemComp.findIndex(function (e) {
                return e.getAwardId() === a.awardId;
              });
              if (e) {
                var s = 0,
                  r = 3.2,
                  c = this._goodsItemComp.length;
                if (-1 !== n) {
                  var l = -1,
                    g = function (e) {
                      ((e %= c),
                        l >= 0 && i._goodsItemComp[l].setShowType(0),
                        i._goodsItemComp[e].setShowType(1),
                        (l = e));
                    },
                    d = 2 * c + n,
                    h = r / (3 * c);
                  r = Math.max(r, h * d);
                  var u = function () {
                    (cc.isValid(i._animNode) && i._animNode.destroy(),
                      (i._animNode = null),
                      (i._animing = !1),
                      (i.animMask.active = !1));
                  };
                  (g_oAudioManager.play(g_tAsset.EffectSound.TreasureAttic),
                    u(),
                    (i._animing = !0),
                    (i._animNode = new cc.Node("animNode")),
                    i.node.addChild(i._animNode),
                    (i.animMask.active = !0),
                    cc
                      .tween(this._animNode)
                      .to(
                        r,
                        { position: new cc.Vec3(0, 0, 0) },
                        {
                          easing: function (e) {
                            return e < 0.9
                              ? 1 - Math.pow(1 - e, 3)
                              : 1 === e
                                ? 1
                                : 1 - Math.pow(2, -10 * e);
                          },
                          progress: function (e, t, i, a) {
                            return ((s = parseInt(a * d)), g(s), e + (t - e) * a);
                          },
                        },
                      )
                      .delay(0.5)
                      .call(function () {
                        (u(), o());
                      })
                      .start());
                }
              } else (this._goodsItemComp[n].setShowType(1), o());
            },
            onClickLot: function () {
              var e = this,
                t = this._mod.getTCoinNum(),
                i = this._mod.getTodayFreeTimes() > 0;
              if (i || t > 0) this._mod.reqDoLot(i);
              else {
                var a = this._mod.getTCoinNeedGold();
                g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Alert.id, "ON_INIT", {
                  data: {
                    value:
                      "\u662f\u5426\u4f7f\u7528" +
                      a +
                      "\u4e2a\u94bb\u77f3\u5151\u63621\u4e2a\u5947\u73cd\u5e01\u8fdb\u884c\u62bd\u5956\uff1f",
                    type: 0,
                    hideClose: !0,
                    ok: function () {
                      e._mod.reqExchangeGoldToTCoin(1);
                    },
                  },
                });
              }
            },
            openAlert: function () {
              this.alert.active = !0;
              var e = this._mod.getTCoinNeedGold();
              this.lab_alertTip.string =
                "\u662f\u5426\u4f7f\u7528" +
                e +
                "\u4e2a\u94bb\u77f3\u5151\u63621\u4e2a\u5947\u73cd\u5e01\u8fdb\u884c\u62bd\u5956\uff1f";
            },
            onClickAlertChange: function () {
              (this._mod.reqExchangeGoldToTCoin(1), this.closeAlert());
            },
            closeAlert: function () {
              this.alert.active = !1;
            },
            onClickNotPopToday: function () {
              var e = !this.node_check.active;
              this.node_check.active = e;
              var t = g_oData.get(g_tData.sdkLogin).serverTime;
              g_oData.get(g_tData.UserLocalModel).setData("TA_Alert_NotPop", e ? t : 0);
            },
            isNotPopAlert: function () {
              var e = g_oData.get(g_tData.UserLocalModel).getData("TA_Alert_NotPop", 0);
              return g_oData.get(g_tData.sdkLogin).serverTime - e >= 3600;
            },
            onClickClose: function () {
              (this._updateBackpack && g_oData.get(g_tData.TreasureAtticMod).updateBackpack(),
                this.close());
            },
            onToggleFAQ: function () {
              if (
                ((this.node_faq.active = !this.node_faq.active), 0 === this.lab_faq.string.length)
              ) {
                var e = [
                  "1.\u73a9\u5bb6\u901a\u8fc7\u83b7\u53d6\u201c\u5947\u73cd\u5e01\u201d\u9053\u5177\u53ef\u53c2\u4e0e\u5947\u73cd\u9601\u5956\u6c60\u62bd\u5956\uff0c\u6bcf\u65e5\u767b\u5f55\u6e38\u620f\u83b7\u5f971\u6b21\u514d\u8d39\u62bd\u5956\u673a\u4f1a\u3002",
                  "2\u3001\u5b9e\u9645\u4e2d\u5956\u6982\u7387\u53c2\u8003\u53ef\u67e5\u770b\u516c\u544a",
                  "3\u3001\u5947\u73cd\u9601\u4e3a\u9650\u65f6\u5f00\u542f\u6d3b\u52a8\uff0c\u6d3b\u52a8\u65f6\u95f4\u5230\u671f\u540e\u83b7\u5f97\u7684 \u201c\u5947\u73cd\u5e01\u201d\u540e\u7eed\u7531\u5b98\u65b9\u8fdb\u884c\u56de\u6536\u30021\u5947\u73cd\u5e01=" +
                    g_oCommonUtils.translateCoinStr(g_oCommonUtils.initProCoin(6e6)) +
                    "\u6307\u5c16\u5e01\uff0c\u4ee5\u90ae\u4ef6\u5f62\u5f0f\u53d1\u653e\u3002",
                  "4\u3001\u62bd\u5956\u8fdb\u5ea6\u5956\u52b1\u5237\u65b0\u65f6\u95f4\u4e3a\u6bcf\u5468\u4e000\u70b9.",
                  "5\u3001\u5982\u6709\u53d1\u73b0\u6076\u610f\u76d7\u5237\u7b49\u4e0d\u6b63\u5f53\u624b\u6bb5\u83b7\u53d6\u6536\u76ca\uff0c\u8fd0\u8425\u65b9\u4f1a\u4e88\u4ee5\u5c01\u505c\u6216\u8005\u6e05\u9664\u8fdd\u6cd5\u8d26\u53f7\u3002",
                ].join("\n");
                this.lab_faq.string = e;
              }
            },
            onToggleSkipAnim: function () {
              this.node_skipAnim.active = !this.node_skipAnim.active;
            },
            showGoods: function () {
              var e = this,
                t = this._mod.getAwardCfg();
              ((this._goodsItemComp = []),
                this.goodsContent.children.forEach(function (i, a) {
                  var o = t[a];
                  if (!isNull(o)) {
                    var n = g_oPrefabLoader.instantiate(e.goodsItem, i).getComponent("TAGoodsItem");
                    e._goodsItemComp.push(n);
                    var s = e.getGoodsDisplayData(e._mod.getShowAward(o.goodsInfo));
                    n.initItem(o.awardId, o.grade, s, e.showGoodsDetail.bind(e));
                  }
                }));
            },
            hideGoodsDeatil: function () {
              this.goodsDetail.active = !1;
            },
            showGoodsDetail: function (e, t, i) {
              if (!isNull(e)) {
                this.goodsDetail.active = !0;
                var a = this.goodsDetail.getChildByName("view"),
                  o = a.parent.convertToNodeSpaceAR(t);
                a.position = o;
                var n = a.getChildByName("awardNode"),
                  s = n.getChildByName("icon").getComponent(cc.Sprite),
                  r = e.spriteData,
                  c = e.goodsData;
                if (r instanceof cc.SpriteFrame) s.spriteFrame = r;
                else if ("string" == typeof r)
                  switch (c.type) {
                    case g_tConst.GameConfig.ItemType.CSFare:
                      switch (c.goodsID) {
                        case g_tConst.GameConfig.ItemID.MakaGoodsID:
                          ((r =
                            g_tConst.GameConfig.ItemType.CSFare +
                            "_" +
                            g_tConst.GameConfig.ItemID.MakaGoodsID),
                            g_oSpriteFrameLoader.load_in_bundle(
                              g_tConst.GameConfig.BundleName.Common,
                              "GoodsIcon/",
                              r,
                              s,
                            ));
                          break;
                        default:
                          var l = g_oGoodsManger.getGoodByGoodsId(c.goodsID),
                            g = c.subEffectID;
                          (l && (g = l.propId),
                            g_oData.get(g_tData.mod_Bag).loadLocalCfgById(g, function (e) {
                              if (e) {
                                var t = e.iconBig ? e.iconBig : e.iconSmall;
                                g_oSpriteFrameLoader.load_in_bundle(
                                  g_tAsset.BACKPACK_ITEM_BUNDLE[e.type],
                                  g_tAsset.BACKPACK_ITEM_PATH[e.type],
                                  t,
                                  s,
                                );
                              }
                            }));
                      }
                      break;
                    default:
                      g_oSpriteFrameLoader.load_in_bundle(
                        g_tConst.GameConfig.BundleName.Common,
                        "GoodsIcon/",
                        r,
                        s,
                      );
                  }
                var d = n.getChildByName("name").getComponent(cc.Label),
                  h = e.name,
                  u = g_oData.get(g_tData.SwitchModel).getBackPackPropCfg();
                u.propName &&
                  u.propName[e.goodsData.subEffectID] &&
                  (h = u.propName[e.goodsData.subEffectID]);
                var _ = e.num;
                d.string = h + "*" + _;
                var m = a.getChildByName("timeTip"),
                  f = this._mod.getAwardDesc(i);
                f && f.length > 0
                  ? ((m.getComponent(cc.Label).string = f), (m.active = !0))
                  : (m.active = !1);
              }
            },
            getGoodsDisplayData: function (e) {
              var t = this;
              if (isNull(e)) return null;
              var i,
                n,
                s,
                r = e.type,
                c = e.num,
                l = e.goodsID,
                g = (e.effectID, e.subEffectID);
              switch (((c = a.Long2Number(c)), r)) {
                case g_tConst.GameConfig.ItemType.CSFare:
                  switch (l) {
                    case g_tConst.TCoinGoodsId:
                      ((s = (function (e) {
                        var i;
                        if (o.has(l)) {
                          var a = o.get(l);
                          i = t.goodsIcon[a];
                        } else i = e;
                        return i;
                      })(g_tAsset.TCoinGoodsIcon)),
                        (n = c),
                        (i = "\u5947\u73cd\u5e01"));
                      break;
                    case g_tConst.GameConfig.ItemID.MakaGoodsID:
                      ((s =
                        g_tConst.GameConfig.ItemType.CSFare +
                        "_" +
                        g_tConst.GameConfig.ItemID.MakaGoodsID),
                        (n = c + "\u5929"),
                        (i = "\u739b\u5361\u5df4\u5361"));
                      break;
                    default:
                      var d = g_oGoodsManger.getGoodByGoodsId(l),
                        h = g;
                      (d && (h = d.propId),
                        g_oData.get(g_tData.mod_Bag).loadLocalCfgById(h, function (e) {
                          if (e) {
                            var t = e.iconBig ? e.iconBig : e.iconSmall;
                            s = t;
                            var a = {
                                id: e.id,
                                expireTime: g_oData.get(g_tData.sdkLogin).serverTime + 86400 * c,
                              },
                              o = g_oData.get(g_tData.mod_Bag).getLimitTimeStr(a);
                            ((n = e.type == g_tConst.ServerBagType.daoJu ? c + "\u4e2a" : o),
                              (i = e.name));
                            var r = g_oData.get(g_tData.SwitchModel).getBackPackPropCfg();
                            r.propName && r.propName[e.id] && (i = r.propName[e.id]);
                          }
                        }));
                  }
                  break;
                case g_tConst.GameConfig.ItemType.GoldCard:
                  ((s = "2_2"),
                    (n = a.translateCoinStr(a.initProCoin(c))),
                    (i = "\u6e38\u620f\u8c46"));
                  break;
                case g_tConst.GameConfig.ItemType.Diamond:
                  ((s = "zuanshi"), (n = c), (i = "\u94bb\u77f3"));
                  break;
                case g_tConst.GameConfig.ItemType.ZCoin:
                  ((s = "25_2"),
                    (n = a.translateCoinStr(a.initProCoin(c))),
                    (i = "\u6307\u5c16\u5e01"));
              }
              return { name: i, num: n, spriteData: s, goodsData: e };
            },
            updateProgress: function () {
              var e = this,
                t = this._mod.getProgressAward();
              if (t.length > 0) {
                var i = this._mod.getWeekLotTimes(),
                  a = this._mod.getRevProgress(),
                  o = this.progressContent.width,
                  n = t[t.length - 1].lotTimes;
                (t.forEach(function (t, s) {
                  var r = e._progressItemComp[s];
                  cc.isValid(r) ||
                    ((r = g_oPrefabLoader
                      .instantiate(e.progressItem, e.progressContent)
                      .getComponent("TAProgressItem")),
                    e._progressItemComp.push(r));
                  var c = e.getGoodsDisplayData(e._mod.getShowAward(t.award));
                  (r.onData(t.lotTimes, i >= t.lotTimes, a.includes(t.lotTimes), c),
                    r.node.setPosition((t.lotTimes / n) * o, 36));
                }),
                  n > 0 && (this.progressBar.progress = i / n));
              }
            },
            onToggleShowRecord: function () {
              var e = this;
              if (((this.node_record.active = !this.node_record.active), this.node_record.active)) {
                var t = this._mod.getRecord().concat();
                t.sort(function (e, t) {
                  return t.time - e.time;
                });
                var i = [];
                (t.forEach(function (t) {
                  var a = e.getGoodsDisplayData(e._mod.getShowAward(t.goodsInfo));
                  i.push(e.getTimeDesc(t.time) + "     \u5956\u54c1: " + a.name + "x" + a.num);
                }),
                  (this.lab_record.string = i.join("\n")));
              }
            },
            getTimeDesc: function (e) {
              var t = new Date(1e3 * e),
                i = t.getFullYear(),
                a = t.getMonth(),
                o = t.getDate();
              ((a = (a += 1) < 10 ? "0" + a : a), (o = o < 10 ? "0" + o : o));
              var n = t.getHours();
              n = n < 10 ? "0" + n : n;
              var s = t.getMinutes();
              return i + "/" + a + "/" + o + " " + (n + ":") + (s < 10 ? "0" + s : s);
            },
          }),
          cc._RF.pop());
      },
      { AlertDlgBaseView: "AlertDlgBaseView", CommonUtils: "CommonUtils" },
    ],
