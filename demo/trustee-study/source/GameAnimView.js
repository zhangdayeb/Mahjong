    GameAnimView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "33fd25+w+VDy5+PxODemfxF", "GameAnimView");
        var i = e("CommonUtils");
        (cc.Class({
          extends: Cls_BaseView,
          properties: { piaofenAnim: cc.Node, playAnim: cc.Node, continuosWinLossTipAnim: cc.Node },
          Awake: function () {
            this.onCustomEvent();
          },
          start: function () {
            var e = this;
            this.scheduleOnce(function () {
              e.preLoadGuardPowerEffect();
            });
          },
          _addUpWinFailInfo_: function (e) {
            var t = [],
              i = Object.create(null);
            for (var a in (e.forEach(function (e) {
              (isNull(i[e.iSeatID]) && (i[e.iSeatID] = []), i[e.iSeatID].push(e));
            }),
            i))
              t.push(
                Object.assign({}, i[a][0], {
                  iCoin: i[a]
                    .map(function (e) {
                      return e.iCoin;
                    })
                    .reduce(function (e, t) {
                      return e + t;
                    }),
                  iPoint: i[a]
                    .map(function (e) {
                      return e.iPoint;
                    })
                    .reduce(function (e, t) {
                      return e + t;
                    }),
                  iLossSeatID: Array.from(
                    new Set(
                      i[a]
                        .map(function (e) {
                          return e.iLossSeatID;
                        })
                        .reduce(function (e, t) {
                          return e.concat(t);
                        }),
                    ),
                  ),
                }),
              );
            return t;
          },
          _classifyWinFailInfo_: function (e) {
            var t = [],
              i = [],
              a = [],
              o = [],
              n = g_tConst.GameConfig.FanType;
            return (
              e.forEach(function (e) {
                var s = t;
                if (!isNull(e.stFanGroup) && !isNull(e.stFanGroup.eFanType))
                  switch (e.stFanGroup.eFanType) {
                    case n.ChaDaJiao:
                      s = i;
                      break;
                    case n.ChaHuaZhu:
                      s = a;
                      break;
                    case n.TuiShui:
                      s = o;
                  }
                s.push(e);
              }),
              {
                normal: t,
                ChaDaJiao: this._addUpWinFailInfo_(i),
                ChaHuaZhu: this._addUpWinFailInfo_(a),
                TuiShui: this._addUpWinFailInfo_(o),
              }
            );
          },
          _piaofen_: function (e, t, i, a) {
            var o = this.piaofenAnim.getComponent("PiaoFen"),
              n = e.eBalanceLimit,
              s = e.iCoin,
              r = e.iVipMoreWin,
              c = e.iVipWillMoreWin,
              l = MJ.GameLogic.PlayerModel.getViewSeatId(e.iSeatID),
              g = e.iQualifyingPoint ? e.iQualifyingPoint : 0,
              d = e.iMKBKMoreWin,
              h = (e.stFanGroup && e.stFanGroup.iTotalFanCount) || 0;
            if (MJ.GameLogic.TableModel.IsDiyRoom())
              o.playPiaoFenAnim({
                nViewSeatId: l,
                nQualifyingPoint: 0,
                nDiyPoint: s,
                nScore: 0,
                nShareMoreWin: -1,
                vipMoreWin: -1,
                vipWillMoreWin: -1,
                nSign: n,
                showTime: t,
                iMKBKMoreWin: d,
                totalFan: h,
                seatIdx: i,
                seatMaxNum: a,
              });
            else if (MJ.GameLogic.TableModel.IsBattleRoom()) {
              var u = s;
              (MJ.GameLogic.TableModel.isXLHZ2V2() &&
                (u *= MJ.GameLogic.TableModel.getTableCfg().blind),
                o.playPiaoFenAnim({
                  nViewSeatId: l,
                  nQualifyingPoint: u,
                  nDiyPoint: 0,
                  nScore: 0,
                  nShareMoreWin: -1,
                  vipMoreWin: r,
                  vipWillMoreWin: c,
                  nSign: n,
                  showTime: t,
                  iMKBKMoreWin: d,
                  totalFan: h,
                  seatIdx: i,
                  seatMaxNum: a,
                }));
            } else if (MJ.GameLogic.TableModel.IsMatchRoom())
              o.playPiaoFenAnim({
                nViewSeatId: l,
                nQualifyingPoint: 0,
                nDiyPoint: e.iPoint,
                nScore: 0,
                nShareMoreWin: -1,
                vipMoreWin: -1,
                vipWillMoreWin: -1,
                nSign: n,
                showTime: t,
                iMKBKMoreWin: d,
                totalFan: h,
                seatIdx: i,
                seatMaxNum: a,
              });
            else if (MJ.GameLogic.TableModel.IsCounterPlay())
              o.playPiaoFenAnim({
                nViewSeatId: l,
                nQualifyingPoint: 0,
                nDiyPoint: e.iCoin,
                nScore: 0,
                nShareMoreWin: -1,
                vipMoreWin: -1,
                vipWillMoreWin: -1,
                nSign: n,
                showTime: t,
                iMKBKMoreWin: d,
                totalFan: h,
                seatIdx: i,
                seatMaxNum: a,
              });
            else if (MJ.GameLogic.TableModel.isZCoinRoom()) {
              var _ = s,
                m = d;
              if (MJ.GameLogic.TableModel.isDCoinRoom()) {
                var f = g_oData.get(g_tData.DianFengSaiMod).getDianFengSaiRatio();
                ((_ = Math.floor(_ / f)), (m = Math.floor(m / f)));
              }
              o.playPiaoFenAnim({
                nViewSeatId: l,
                nQualifyingPoint: 0,
                nDiyPoint: 0,
                nScore: 0,
                nShareMoreWin: -1,
                vipMoreWin: -1,
                vipWillMoreWin: -1,
                nSign: n,
                showTime: t,
                iMKBKMoreWin: m,
                nZCoin: _,
                totalFan: h,
                seatIdx: i,
                seatMaxNum: a,
              });
            } else
              ((g_oData.get(g_tData.SectionMatchMod).isSectionMatchState &&
                l === g_tConst.GameConfig.ViewSeat.SeatMine) ||
                (g = 0),
                o.playPiaoFenAnim({
                  nViewSeatId: l,
                  nQualifyingPoint: g,
                  nDiyPoint: 0,
                  nScore: s,
                  nShareMoreWin: -1,
                  vipMoreWin: r,
                  vipWillMoreWin: c,
                  nSign: n,
                  showTime: t,
                  iMKBKMoreWin: d,
                  totalFan: h,
                  seatIdx: i,
                  seatMaxNum: a,
                }));
          },
          _piaofenText_: function (e, t, i, a) {
            var o = this.piaofenAnim.getComponent("PiaoFen"),
              n = e.eBalanceLimit,
              s = e.iCoin,
              r = e.iVipMoreWin,
              c = e.iVipWillMoreWin,
              l = e.iSeatID,
              g = e.iQualifyingPoint ? e.iQualifyingPoint : 0,
              d = e.iMKBKMoreWin,
              h = (e.stFanGroup && e.stFanGroup.iTotalFanCount) || 0;
            o.playPiaoFenAnim({
              nViewSeatId: l,
              nQualifyingPoint: g,
              nDiyPoint: 0,
              nScore: s,
              nShareMoreWin: -1,
              vipMoreWin: r,
              vipWillMoreWin: c,
              nSign: n,
              showTime: t,
              iMKBKMoreWin: d,
              totalFan: h,
              seatIdx: i,
              seatMaxNum: a,
            });
          },
          onCustomEvent: function () {
            var e = this;
            (this.node.on("ANI_GUARD_POWER", this.onGuardPowerEffect, this),
              this.node.on("PROTECT_GIFT_EFFECT", this.onProtectGiftEffect, this),
              this.node.on(
                "GAMEEND_PIAO_FEN",
                function (t) {
                  MJ.GameAnimMgr.orderedPlayAnim(
                    function () {
                      e.onGameEndPiaoFen(t);
                    },
                    {
                      playDesc: "HuDebug:\u6e38\u620f\u7ed3\u675f\u98d8\u5206",
                      dontSubCountdown: !0,
                    },
                  );
                },
                this,
              ),
              this.node.on(
                "PIAO_FEN",
                function (e) {
                  var t = this;
                  MJ.GameAnimMgr.orderedPlayAnim(
                    function () {
                      t.onGamingPiaoFen(e);
                    },
                    { playDesc: "HuDebug:\u5bf9\u5c40\u4e2d\u98d8\u5206", dontSubCountdown: !0 },
                  );
                },
                this,
              ),
              this.node.on(
                "PIAO_FEN_TEACH",
                function (e) {
                  this.onTeachPiaoFen(e);
                },
                this,
              ),
              this.node.on(
                "ANIM_LIU_JU",
                function (e) {
                  var t = this.playAnim.getComponent("CPGHAnim");
                  (g_oMJNetManger.pauseGameLoop("\u6d41\u5c40\u52a8\u753b"),
                    t.playLiuJu(function () {
                      (g_oMJNetManger.resumeGameLoop("\u6d41\u5c40\u52a8\u753b"),
                        e.cb_liujuAnimEnd && e.cb_liujuAnimEnd());
                    }));
                },
                this,
              ),
              this.node.on(
                "ANIM_PENG",
                function (e) {
                  var t = e;
                  this.playAnim.getComponent("CPGHAnim").playPeng(t.nViewSeatId);
                },
                this,
              ),
              this.node.on(
                "ANIM_TING",
                function (e) {
                  var t = e;
                  this.playAnim.getComponent("CPGHAnim").playTing(t.nViewSeatId);
                },
                this,
              ),
              this.node.on(
                "ANIM_CHOW",
                function (e) {
                  var t = e;
                  this.playAnim.getComponent("CPGHAnim").playChow(t.nViewSeatId);
                },
                this,
              ),
              this.node.on(
                "ANIM_GANG",
                function (e) {
                  var t = e,
                    i = this.playAnim.getComponent("CPGHAnim");
                  t.nGangType === g_tConst.BlockCfgs.BlockConcealedKong.BlockType
                    ? i.playAnGang(t.nViewSeatId)
                    : i.playGang(t.nViewSeatId);
                },
                this,
              ),
              this.node.on(
                "ANIM_DAN",
                function (e) {
                  var t = e,
                    i = (t.aShowTileValues, t.iTriggerCard),
                    a = this.playAnim.getComponent("CPGHAnim");
                  (t.nDanType && (i ? a.playGuoDan(t.nViewSeatId) : a.playMingDan(t.nViewSeatId)),
                    t.nGangType &&
                      (t.nGangType === g_tConst.BlockCfgs.BlockConcealedKong.BlockType
                        ? a.playAnDan(t.nViewSeatId)
                        : t.nGangType === g_tConst.BlockCfgs.BlockPatchedKong.BlockType
                          ? a.playGuoDan(t.nViewSeatId)
                          : a.playMingDan(t.nViewSeatId)));
                },
                this,
              ),
              this.node.on(
                "ANIM_CONTINUOS_WIN_LOSS_TIP",
                function () {
                  if (MJ.GameLogic.TableModel.getGameType() != g_tConst.GameTypeCfgs.LS6HZ.TYPEID) {
                    var e = g_oData.get(g_tData.SwitchModel).getContinuosWinLossShowCfg();
                    if (e.isAllOpen) {
                      var t = g_oData
                          .get(g_tData.UserLocalModel)
                          .getData("myContinuosWinCount", "0"),
                        a = g_oData
                          .get(g_tData.UserLocalModel)
                          .getData("myContinuosLossCount", "0");
                      if (
                        ((t = parseInt(t)),
                        (a = parseInt(a)),
                        t > 1 && (0 === e.showMode || 2 === e.showMode))
                      ) {
                        var o = e.continuosWinCount.indexOf(t);
                        if (o >= 0) {
                          var n = e.continuosWinShowTip[o] || [],
                            s = n[i.getRandomNum(0, Math.max(n.length - 1, 0))] || "";
                          this.continuosWinLossTipAnim
                            .getComponent("ContinuosWinLossTip")
                            .showMessage({
                              showType: 0,
                              continuosCount: t,
                              message: s,
                              title: t + "\u8fde\u80dc\u5566\uff01",
                            });
                        }
                      }
                      if (a > 1 && (1 === e.showMode || 2 === e.showMode)) {
                        var r = e.continuosLossCount.indexOf(a);
                        if (r >= 0) {
                          var c = e.continuosLossShowTip[r] || [],
                            l = c[i.getRandomNum(0, Math.max(c.length - 1, 0))] || "";
                          this.continuosWinLossTipAnim
                            .getComponent("ContinuosWinLossTip")
                            .showMessage({
                              showType: 1,
                              continuosCount: a,
                              message: l,
                              title: a + "\u8fde\u8d25\u5566\uff01",
                            });
                        }
                      }
                    }
                  }
                },
                this,
              ),
              this.node.on(
                "ANIM_CHA",
                function (e) {
                  var t = e;
                  this.playAnim.getComponent("CPGHAnim").playCha(t.nViewSeatId);
                },
                this,
              ),
              this.node.on(
                "ANIM_TONG_BAO",
                function (e) {
                  var t = e;
                  this.playAnim.getComponent("CPGHAnim").playTongBao(t.nViewSeatId);
                },
                this,
              ),
              this.node.on(
                "ANIM_DUI_BAO",
                function (e) {
                  var t = e;
                  this.playAnim.getComponent("CPGHAnim").playDuiBao(t.nViewSeatId);
                },
                this,
              ),
              this.node.on(
                "ANIM_MO_BAO",
                function (e) {
                  var t = e;
                  this.playAnim.getComponent("CPGHAnim").playMoBao(t.nViewSeatId);
                },
                this,
              ),
              this.node.on(
                "ANIM_HU",
                function (e) {
                  var t = e;
                  this.playAnim.getComponent("CPGHAnim").playHu(t.nViewSeatId, t);
                },
                this,
              ),
              this.node.on(
                "ANIM_HU_DIAN",
                function (e) {
                  var t = e;
                  this.playAnim.getComponent("CPGHAnim").playHuDian(t.worldPosition);
                },
                this,
              ),
              this.node.on(
                "ANIM_QGH",
                function (e) {
                  var t = e;
                  this.playAnim.getComponent("CPGHAnim").playQGH(t.nViewSeatId, t);
                },
                this,
              ),
              this.node.on(
                "ANIM_ZIMO",
                function (e) {
                  var t = e;
                  this.playAnim.getComponent("CPGHAnim").playZIMO(t.nViewSeatId, t);
                },
                this,
              ),
              this.node.on(
                "ANIM_ZIMO_LIGHT",
                function (e) {
                  var t = e;
                  this.playAnim.getComponent("CPGHAnim").playZiMoLight(t.worldPosition);
                },
                this,
              ),
              this.node.on(
                "ANIM_GAME_START",
                function (e) {
                  var t = this.playAnim.getComponent("CPGHAnim");
                  (g_oMJNetManger.pauseGameLoop("\u5f00\u5c40\u52a8\u753b"),
                    t.playPJKS(function () {
                      (g_oMJNetManger.resumeGameLoop("\u5f00\u5c40\u52a8\u753b"),
                        e.cb_gameStarAnimEnd && e.cb_gameStarAnimEnd());
                    }));
                },
                this,
              ),
              this.node.on(
                "ANIM_MATCH_GAME_START",
                function (e) {
                  var t = this.playAnim.getComponent("CPGHAnim");
                  (g_oMJNetManger.pauseGameLoop("\u5f00\u5c40\u52a8\u753b"),
                    t.playMatchPJKS(e.isFinal, function () {
                      (g_oMJNetManger.resumeGameLoop("\u5f00\u5c40\u52a8\u753b"),
                        e.cb_gameStarAnimEnd && e.cb_gameStarAnimEnd());
                    }));
                },
                this,
              ),
              this.node.on(
                "ANIM_DEAL_TILES",
                function () {
                  this.playAnim.getComponent("CPGHAnim").playShaiZi();
                },
                this,
              ),
              this.node.on(
                "ANIM_HU_BY_FANXING",
                function (e) {
                  var t = e;
                  (console.log("Roy_bigHu", e),
                    this.playAnim
                      .getComponent("CPGHAnim")
                      .playHuAniByFanXing(
                        t.nViewSeatId,
                        t.fanxingID,
                        t.fanxingName,
                        t.aniName,
                        t.fFanAniTime,
                      ));
                },
                this,
              ),
              this.node.on(
                "ANIM_MING_PAI",
                function (e) {
                  var t = e;
                  this.playAnim.getComponent("CPGHAnim").playMingPai(t.nViewSeatId);
                },
                this,
              ));
          },
          onGameEndPiaoFen: function (e) {
            var t = this,
              i = e.stPlayerEnv,
              a = e.cb_gameEndPiaoFen,
              o = this._classifyWinFailInfo_(
                i
                  .map(function (e) {
                    return e.stPlayerBalance;
                  })
                  .reduce(function (e, t) {
                    return e.concat(t);
                  }),
              ),
              n = o.ChaDaJiao,
              s = o.ChaHuaZhu,
              r = o.TuiShui,
              c = [],
              l = 0,
              g = function (e, i) {
                c.push(function () {
                  return new Promise(function (a, o) {
                    try {
                      (e(),
                        t.scheduleOnce(function () {
                          a();
                        }, i));
                    } catch (err) {
                      o(err);
                    }
                  });
                });
              },
              d = function (e, i, a) {
                return (
                  e.length > 0 &&
                    (g(function () {
                      for (var a in i) {
                        a = Number(a);
                        var o = t.piaofenAnim.getComponent("PiaoFen"),
                          n = MJ.GameLogic.PlayerModel.getViewSeatId(a);
                        o.playDescAnim(n, i[a]);
                      }
                      t.scheduleOnce(function () {
                        e.forEach(function (e) {
                          t._piaofen_(e, 1.2, 0, 0);
                        });
                      }, 1.8);
                    }, 3.2),
                    (a += 3.2)),
                  a
                );
              };
            function h(e, t) {
              var i = Object.create(null),
                a = new Set();
              return (
                e.forEach(function (e) {
                  return e.iLossSeatID.forEach(function (e) {
                    return a.add(e);
                  });
                }),
                a.forEach(function (e) {
                  i[e] = t;
                }),
                i
              );
            }
            ((l = d(
              this._addUpWinFailInfo_(n.concat(s)),
              Object.assign(
                {},
                h(n, g_tConst.ePiaoFenDesc.ChaDaJiao),
                h(s, g_tConst.ePiaoFenDesc.ChaHuaZhu),
              ),
              l,
            )),
              (l = d(r, h(r, g_tConst.ePiaoFenDesc.TuiShui), l)),
              g(function () {
                a && a();
              }, 0),
              l > 0
                ? setTimeout(function () {
                    MJ.GameAnimMgr.playNext();
                  }, 1e3 * l)
                : MJ.GameAnimMgr.playNext(),
              c
                .reduce(function (e, t) {
                  return e.then(t);
                }, Promise.resolve())
                .catch(function (e) {
                  console.error(e);
                }),
              0 !=
                [s, n, r]
                  .map(function (e) {
                    return e.length;
                  })
                  .reduce(function (e, t) {
                    return e + t;
                  }) &&
                l > 0 &&
                ((l += 0.5),
                g_oMJNetManger.pauseGameLoop("GAMEEND_PIAO_FEN"),
                g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.DelayGameResult.id, "ON_INIT"),
                this.scheduleOnce(function () {
                  g_oMJNetManger.resumeGameLoop("GAMEEND_PIAO_FEN");
                  var e = g_oCtrl.get(g_tCtrl.DelayGameResultCtrl);
                  e && e.closeView();
                }, l)));
          },
          onGamingPiaoFen: function (e) {
            var t = this,
              i = this._classifyWinFailInfo_(e).normal,
              a = 0;
            if (i.length > 0) {
              var o = [0, 0, 0, 0],
                n = [0, 0, 0, 0];
              (i.forEach(function (e) {
                var t = MJ.GameLogic.PlayerModel.getViewSeatId(e.iSeatID);
                o[t] += 1;
              }),
                i.forEach(function (e) {
                  var i = MJ.GameLogic.PlayerModel.getViewSeatId(e.iSeatID),
                    a = n[i]++,
                    s = o[i];
                  t._piaofen_(e, 0.82, a, s);
                }),
                (a += 1));
            }
            a > 0
              ? (g_oMJNetManger.pauseGameLoop("PIAO_FEN"),
                this.scheduleOnce(function () {
                  (g_oMJNetManger.resumeGameLoop("PIAO_FEN"), MJ.GameAnimMgr.playNext());
                }, a))
              : MJ.GameAnimMgr.playNext();
          },
          onTeachPiaoFen: function (e) {
            var t = this,
              i = this._classifyWinFailInfo_(e).normal;
            if (i.length > 0) {
              var a = [0, 0, 0, 0],
                o = [0, 0, 0, 0];
              (i.forEach(function (e) {
                var t = e.iSeatID;
                a[t] += 1;
              }),
                i.forEach(function (e) {
                  var i = e.iSeatID,
                    n = o[i]++,
                    s = a[i];
                  t._piaofenText_(e, 0.82, n, s);
                }));
            }
          },
          onProtectGiftEffect: function (e) {
            var t = this,
              i = e;
            cc.tween(MJ.GameViewHandler.node)
              .call(function () {
                i.forEach(function (e) {
                  var t = MJ.GameLogic.PlayerModel.getViewSeatId(e.iSeatID);
                  (t == g_tConst.GameConfig.ViewSeat.SeatMine &&
                    g_oExLayerManager.emitEvent2GameLayer(
                      g_tConst.GameExLayerCfg.GameAnim.id,
                      "ANIM_HU_BY_FANXING",
                      {
                        nViewSeatId: g_tConst.GameConfig.ViewSeat.SeatMine,
                        fanxingID: 666666,
                        fanxingName: "\u5b88\u62a4\u793c\u5305",
                        aniName: "ex_protectGift",
                        fFanAniTime: 0,
                      },
                    ),
                    g_oExLayerManager.emitEvent2GameLayer(
                      g_tConst.GameExLayerCfg.UserInfoLayer.id,
                      "ANIM_HU_PROTECTGIFT",
                      { nViewSeatId: t },
                    ));
                });
              })
              .delay(0.3)
              .call(function () {
                var e = 0;
                (i.length > 0 && (e += 1),
                  i.forEach(function (e) {
                    var i = MJ.GameLogic.PlayerModel.getViewSeatId(e.iSeatID);
                    t.piaofenAnim
                      .getComponent("PiaoFen")
                      .playPiaoFenAnim({
                        nViewSeatId: i,
                        nQualifyingPoint: 0,
                        nDiyPoint: 0,
                        nScore: e.addCoin,
                        nShareMoreWin: -1,
                        vipMoreWin: -1,
                        vipWillMoreWin: -1,
                        nSign: 0,
                        showTime: 0.82,
                        iMKBKMoreWin: 0,
                      });
                  }),
                  e > 0
                    ? (g_oMJNetManger.pauseGameLoop("PROTECT_GIFT_EFFECT"),
                      t.scheduleOnce(function () {
                        (g_oEvent.dispatchEvent(g_tEvent.PROTECTGIFT_EFFECT_END),
                          g_oMJNetManger.resumeGameLoop("PROTECT_GIFT_EFFECT"),
                          MJ.GameAnimMgr.playNext());
                      }, e))
                    : MJ.GameAnimMgr.playNext());
              })
              .start();
          },
          preLoadGuardPowerEffect: function () {
            var e = this,
              t = g_tAsset.newGameAnimPrefabMap.ex_jinzhongzhao,
              i = this;
            g_oPrefabLoader.loadRes(t, null, function (t) {
              cc.isValid(e.node) && !i.jzzAni2 && (i.jzzAni2 = t);
            });
          },
          onGuardPowerEffect: function (e) {
            var t = this,
              i = e,
              a = this,
              o = i.nViewSeatIdList || [],
              n = 0,
              s = function (e) {
                for (var t = this, i = 0; i < 4; i++) cc.find("root" + i, e).active = !1;
                for (var a = 0; a < o.length; a++) {
                  var s = o[a].viewSeatID;
                  null != s &&
                    (function () {
                      var i = cc.find("root" + s + "/longRootNode", e),
                        a = cc.find("root" + s, e);
                      ((a.active = !0),
                        a.stopAllActions(),
                        (a.position = cc.v3(a.x, 200, a.z)),
                        cc
                          .tween(a)
                          .call(function () {
                            i.active = !1;
                          })
                          .to(0.2, { position: cc.v3(a.x, 0, a.z) }, { easing: "sineOut" })
                          .call(function () {
                            ((i.active = !0),
                              i.getComponent(cc.SkeletonAnimation).setCurrentTime(0));
                          })
                          .delay(1.3)
                          .call(function () {
                            a.active = !1;
                          })
                          .start());
                      var o = "root" + s + "/rot",
                        r = cc.find(o, e);
                      (r.stopAllActions(),
                        r.runAction(
                          cc.repeatForever(
                            cc.sequence(
                              cc.callFunc(
                                function () {
                                  ((n += 3), (r.eulerAngles = cc.v3(0, n, 0)));
                                }.bind(t),
                              ),
                              cc.delayTime(0.1),
                            ),
                          ),
                        ));
                    })();
                }
              };
            cc.tween(MJ.GameViewHandler.node)
              .call(function () {
                cc.find("jzz_mask", cc.director.getScene()) &&
                  (cc.find("jzz_mask", cc.director.getScene()).active = !0);
                var e = g_tAsset.newGameAnimPrefabMap.ex_jinzhongzhao;
                a.jzzAni2
                  ? (a.jzzAni2.parent || (a.jzzAni2.parent = cc.director.getScene()), s(a.jzzAni2))
                  : g_oPrefabLoader.loadRes(e, null, function (e) {
                      cc.isValid(t.node) &&
                        !a.jzzAni2 &&
                        ((a.jzzAni2 = e),
                        (e.parent = cc.director.getScene()),
                        (e.x = 720),
                        (e.y = 360),
                        s(a.jzzAni2));
                    });
              })
              .delay(i.animationTimer - 0.1)
              .call(function () {
                (a.jzzAni2 && (a.jzzAni2.parent = null),
                  cc.find("jzz_mask", cc.director.getScene()) &&
                    (cc.find("jzz_mask", cc.director.getScene()).active = !1));
                var e = i.nViewSeatIdList;
                if (e)
                  for (var o = 0; o < e.length; o++) {
                    var n = e[o];
                    t.piaofenAnim
                      .getComponent("PiaoFen")
                      .playPiaoFenAnim({
                        nViewSeatId: n.viewSeatID,
                        nQualifyingPoint: 0,
                        nDiyPoint: 0,
                        nScore: n.info.addCoin,
                        nShareMoreWin: 0,
                        vipMoreWin: 0,
                        vipWillMoreWin: 0,
                        nSign: 0,
                        showTime: 0.82,
                        iMKBKMoreWin: 0,
                      });
                  }
              })
              .start();
          },
        }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils" },
    ],
