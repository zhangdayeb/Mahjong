    CoinGameResultPageMod: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "54fc7R94FhDvq9B6MPdKtXL", "CoinGameResultPageMod"),
          cc.Class({
            extends: Cls_BaseModel,
            properties: {
              PlayerInfo: {
                get: function () {
                  return this._PlayerMsg;
                },
                visible: !1,
              },
            },
            Awake: function () {
              ((this._GameResultMsg = void 0),
                (this._PlayerMsg = []),
                this.onCustomEvent(),
                this.onMessageEvent());
            },
            onCustomEvent: function () {
              var e = this;
              e.node.on(
                "ON_INIT_NEWCOMMON_MOD",
                function (t) {
                  ((e.mapPlayerInfo = t.AllPlayerInfo), e.setGameResultMsg(t));
                },
                e,
              );
            },
            onMessageEvent: function () {
              var e = this;
              this.autoDispose(
                g_oEvent.addEventListener(
                  "GET_RULE_FAN_DETAIL_SUCCESS",
                  function (t) {
                    ((e.mapPlayerInfo = t.AllPlayerInfo), e.node.emit("SET_RULE_FAN_DETAIL", t));
                  },
                  this,
                ),
              );
            },
            getGameResultMsg: function () {
              return this._GameResultMsg;
            },
            setGameResultMsg: function (e) {
              var t = this;
              (Log.info("ComGameResultMod\u7ed3\u7b97\u6570\u636e= ", e),
                (t._GameResultMsg = e.resultMsg));
              for (
                var i = e.resultMsg,
                  a = e.nShowMode,
                  o =
                    (MJ.GameLogic.PlayerModel,
                    MJ.GameLogic.TileModel,
                    g_tConst.CommonFanType,
                    MJ.RuleMgr.getFanCfgs(),
                    g_tConst.CommonFanType),
                  n = MJ.GameLogic.PlayerModel.getBankViewId(),
                  s = 0,
                  r = 0;
                r < i.stPlayerEnv.length;
                r++
              ) {
                var c = i.stPlayerEnv[r];
                if (((c.bigWinMan = 0), c.iTotalLossWin > s)) {
                  ((s = c.iTotalLossWin), (c.bigWinMan = 1));
                  for (var l = 0; l < r; l++) i.stPlayerEnv[l].bigWinMan = 0;
                }
              }
              for (var g = 0; g < i.stPlayerEnv.length; g++) {
                var d = i.stPlayerEnv[g],
                  h = d.userID,
                  u = t.mapPlayerInfo.get(d.seatID);
                u &&
                  (function () {
                    var i = u.viewSeatID,
                      s = g_oData
                        .get(g_tData.mod_GameItem)
                        .getEffectListByEffectID(g_tConst.EffectItem.GameEffectID, u.tEffectInfos),
                      r = 0,
                      c = [],
                      l = [],
                      g = [],
                      _ = "",
                      m = 0,
                      f = 0,
                      p = !1;
                    (i == n && (p = !0),
                      d.stPlayerBalance.forEach(function (e) {
                        ((r += e.iVipMoreWin || 0),
                          e.stFanGroup &&
                            ((f = e.stFanGroup.eFanType),
                            (_ += o[f] + " "),
                            (m = e.stFanGroup.iTotalFanCount)));
                      }),
                      null != d.stOtherBalance && (r += d.stOtherBalance.iVipMoreWin || 0));
                    for (var C = 0; C < d.stSetCard.length; C++) {
                      var v = d.stSetCard[C],
                        y = v.eBlockType,
                        S = v.iCard;
                      switch (y) {
                        case g_tConst.BlockCfgs.BlockChow.BlockType:
                          c.push(S);
                          break;
                        case g_tConst.BlockCfgs.BlockPong.BlockType:
                          l.push(S);
                          break;
                        case g_tConst.BlockCfgs.BlockExposedKong.BlockType:
                          g.push(S);
                          break;
                        case g_tConst.BlockCfgs.BlockConcealedKong.BlockType:
                          g.push([S[0], 0, 0, 0]);
                          break;
                        case g_tConst.BlockCfgs.BlockPatchedKong.BlockType:
                          g.push(S);
                      }
                    }
                    var D = {
                      nUserID: h,
                      isSvip: !1,
                      arrSubEffectID: s,
                      nSeatView: i,
                      isBanker: p,
                      nWinCoin: d.iTotalLossWin,
                      nSvipMoreWin: r,
                      sHeadUrl: u.picUrl2 || u.headUrl,
                      sNickName: u.nickName,
                      nHandTiles: d.iHandsCards,
                      nHuTiles: d.iHuCard,
                      aChowTile: c,
                      aPongTile: l,
                      aKongTile: g,
                      nPiao: d.stTurnStatus.iDefaultFixedPiao,
                      sFanDesc: _,
                      nFanSum: m,
                      huType: 0,
                      GameResultInfo: d,
                      bigWinMan: d.bigWinMan,
                    };
                    t._PlayerMsg.push(D);
                    var T = {
                      stPlayerResultInfo: D,
                      nShowMode: a,
                      ruleFanDetailInfos: e.ruleFanDetailInfos,
                    };
                    t.addPlayerItem(T);
                  })();
              }
            },
            addPlayerItem: function (e) {
              this.node.emit("SET_PLAYERINFO_COMMON", e);
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
