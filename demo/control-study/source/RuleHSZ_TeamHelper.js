    RuleHSZ_TeamHelper: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "1bd19LRs/9O74UtZBK2tXYj", "RuleHSZ_TeamHelper"),
          (t.exports = (function () {
            function e(e) {
              ((this.parent = e), this.reset());
            }
            var t = e.prototype;
            return (
              (t.reset = function () {
                ((this.onNotify_MeChangeCard = !1),
                  (this.onNotify_MemberChangeCard = !1),
                  (this.onNotify_MeChangeCardRst = !1),
                  (this.onNotify_MemberChangeCardRst = !1),
                  (this.isMeComfirm = !1),
                  (this.MeDefaultCards = []),
                  (this.MemberDefaultCards = []),
                  (this.MeChangeCardRstCardsData = {}));
              }),
              (t.onNotifyChangeCard = function (e, t) {
                var i = this;
                if (
                  (this._divert_(
                    e.seatID,
                    function () {
                      ((i.onNotify_MeChangeCard = !0),
                        (i.MeDefaultCards = e.iDefaultChangeCards.slice()),
                        (i.MeUnSelectInfo = MJ.GameLogic.TableModel.isXLHZMJ()
                          ? {
                              tileValues: [81],
                              callBack: function () {
                                g_oLayerManager.emitEvent2Dlg(
                                  g_tConst.GameLayerCfg.TipsLayer.id,
                                  "SHOW_NORMAL_TIP",
                                  { tipMsg: "\u7ea2\u4e2d\u4e0d\u53ef\u66f4\u6362", showTime: 1 },
                                );
                              },
                            }
                          : null));
                    },
                    function () {
                      ((i.onNotify_MemberChangeCard = !0),
                        (i.MemberDefaultCards = e.iDefaultChangeCards.slice()));
                    },
                  ),
                  this.onNotify_MeChangeCard && this.onNotify_MemberChangeCard)
                ) {
                  var a =
                      t ||
                      MJ.GameLogic.GameParams.getActTime(
                        g_tConst.GameConfig.TimeParams.BattleChangeCards,
                      ),
                    o = MJ.GameLogic.PlayerModel.memberSeatId;
                  this.parent.launchChangeCard(this.MeDefaultCards.slice(), a, {
                    eChangeMode: e.eChangeMode,
                    bAllColor: e.bAllColor,
                    MeDefaultCards: this.MeDefaultCards,
                    MemberDefaultCards: this.MemberDefaultCards,
                    MemberVSid: MJ.GameLogic.PlayerModel.getViewSeatId(o),
                    ActTime: a,
                    isTeam: !0,
                    MeUnSelectInfo: this.MeUnSelectInfo,
                  });
                }
              }),
              (t.onNotifyChangeCardRst = function (e) {
                var t,
                  i = this;
                (this._divert_(
                  e.seatID,
                  function () {
                    ((i.onNotify_MeChangeCardRst = !0),
                      (i.MeChangeCardRstCardsData = e),
                      (i.MeUnSelectInfo = null));
                  },
                  function () {
                    ((i.onNotify_MemberChangeCardRst = !0), (i.MemberChangeCardRstCardsData = e));
                  },
                ),
                  this.onNotify_MeChangeCardRst &&
                    this.onNotify_MemberChangeCardRst &&
                    this.parent.launchChangeCardRst(
                      Object.assign({}, this.MeChangeCardRstCardsData, {
                        other:
                          ((t = {}),
                          (t[MJ.GameLogic.PlayerModel.memberVSeatId] =
                            this.MemberChangeCardRstCardsData),
                          t),
                        MeUnSelectInfo: this.MeUnSelectInfo,
                      }),
                    ));
              }),
              (t.onNotifySelectChangeCard = function (e) {
                var t = e.iSeatID,
                  i = e.iSelectCards;
                this._divert_(
                  t,
                  function () {
                    g_oExLayerManager.emitEvent2GameLayer(
                      g_tConst.GameExLayerCfg.GDHSZ.id,
                      "ME_UPT_SELECT",
                      { cards: i },
                    );
                  },
                  function () {
                    g_oExLayerManager.emitEvent2GameLayer(
                      g_tConst.GameExLayerCfg.GDHSZ.id,
                      "MEMBER_UPT_SELECT",
                      { cards: i },
                    );
                  },
                );
              }),
              (t.onResponseChangeCard = function (e) {
                var t = this;
                this._divert_(
                  e.seatID,
                  function () {
                    ((t.isMeComfirm = !0),
                      g_oExLayerManager.emitEvent2GameLayer(
                        g_tConst.GameExLayerCfg.GDHSZ.id,
                        "ME_COMFIRM",
                        { cards: e.iChangeCards },
                      ));
                  },
                  function () {
                    g_oExLayerManager.emitEvent2GameLayer(
                      g_tConst.GameExLayerCfg.GDHSZ.id,
                      "MEMBER_COMFIM",
                      { cards: e.iChangeCards },
                    );
                  },
                  function () {
                    g_oExLayerManager.emitEvent2GameLayer(
                      g_tConst.GameExLayerCfg.GDHSZ.id,
                      "OTHERS_COMFIRM",
                    );
                  },
                );
              }),
              (t.onEnterGame = function (e) {
                if (e.iGameStatus != g_tConst.GameConfig.TableStatus.Free) {
                  var t = MJ.GameLogic.PlayerModel.mySeatID,
                    i = MJ.GameLogic.PlayerModel.memberSeatId;
                  if (e.iGameStatus === g_tConst.GameConfig.TableStatus.HSZ) {
                    var a = e.stPlayerEnv
                      .map(function (e) {
                        return e.stTurnStatus.eTurnStatus ===
                          g_tConst.GameConfig.TurnStatus.ChangeOff
                          ? 1
                          : 0;
                      })
                      .reduce(function (e, t) {
                        return e + t;
                      });
                    if ((Log.info("BIRD >>>", "completePlayerNum:", a), a < e.stPlayerEnv.length)) {
                      var o = e.stPlayerEnv[t].stTurnStatus.iDefaultChangeCard,
                        n =
                          g_oData.get(g_tData.sdkLogin).serverTime -
                          e.stPlayerEnv[t].stTurnStatus.iStartTime,
                        s =
                          MJ.GameLogic.GameParams.getActTime(
                            g_tConst.GameConfig.TimeParams.BattleChangeCards,
                          ) - n,
                        r = e.stPlayerEnv[i].stTurnStatus.iDefaultChangeCard;
                      (this.parent.onNotifyChangeCard(
                        {
                          iDefaultChangeCards: o,
                          eChangeMode: e.reEnterInfo.eChangeMode,
                          seatID: t,
                          bAllColor: e.reEnterInfo.bAllColor,
                        },
                        s,
                      ),
                        this.parent.onNotifyChangeCard(
                          {
                            iDefaultChangeCards: r,
                            eChangeMode: e.reEnterInfo.eChangeMode,
                            seatID: i,
                            bAllColor: e.reEnterInfo.bAllColor,
                          },
                          s,
                        ));
                      for (var c = 0; c < e.stPlayerEnv.length; c++)
                        e.stPlayerEnv[c].stTurnStatus.eTurnStatus ===
                          g_tConst.GameConfig.TurnStatus.ChangeOff &&
                          (c === t
                            ? this.parent.onResponseChangeCard({ seatID: t, iChangeCards: o })
                            : c === i
                              ? this.parent.onResponseChangeCard({ seatID: i, iChangeCards: r })
                              : this.parent.onResponseChangeCard({ seatID: c }));
                    }
                  } else this.isMeComfirm = !0;
                }
              }),
              (t.reqSelectCard = function (e) {
                this.isMeComfirm ||
                  (this.parent.reqSelectCard(e.detail.selectCards),
                  this.onNotifySelectChangeCard({
                    iSeatID: MJ.GameLogic.PlayerModel.mySeatID,
                    iSelectCards: e.detail.selectCards,
                  }));
              }),
              (t._divert_ = function (e, t, i, a) {
                void 0 === a && (a = function () {});
                var o = MJ.GameLogic.PlayerModel.mySeatID,
                  n = MJ.GameLogic.PlayerModel.memberSeatId;
                e === o ? t() : e === n ? i() : a();
              }),
              e
            );
          })()),
          cc._RF.pop());
      },
      {},
    ],
