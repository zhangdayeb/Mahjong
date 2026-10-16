    DeskBaseInfo: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "7d47ac2ZnhIMYhvPuBZSFMm", "DeskBaseInfo");
        var i = e("CommonUtils");
        (cc.Class({
          extends: Cls_BaseView,
          properties: { labGameType: cc.Label, labDiZhu: cc.Label },
          Awake: function () {
            ((this.labGameTypeColor = this.labGameType.node.color),
              (this.labDiZhuColor = this.labDiZhu.node.color),
              this.onCustomEvent());
          },
          onCustomEvent: function () {
            (this.node.on(
              "SET_TABLE_INFO",
              function () {
                var e = MJ.GameLogic.TableModel;
                console.log(" tableModel = ", e);
                var t = e.getTableCfg(),
                  a = e.getTableDesc();
                (console.log(" tableCfg = ", t),
                  console.log(" GameDesc = ", a),
                  (this.labGameType.string = a));
                var o = null;
                try {
                  o = parseInt(t.extra.match(/maxWinCoin:([+-]?\d+)/)[1]);
                } catch (err) {
                  (console.log("DeskBaseInfo.js fail to get FengDing"), (o = null));
                }
                var n = null;
                try {
                  n = parseInt(t.extra.match(/maxFan:([+-]?\d+)/)[1]);
                } catch (err) {
                  (console.log("DeskBaseInfo.js fail to get FengDing"), (n = null));
                }
                console.log(
                  " getGameType FengDing FengDingFan = ",
                  MJ.GameLogic.TableModel.getGameType(),
                  o,
                  n,
                );
                var s = MJ.GameLogic.GameParams.isFan() ? "\u756a" : "\u500d",
                  r = MJ.GameLogic.TableModel.IsLeagueRoom()
                    ? i.translateCoinStr(o)
                    : i.translateCoinStr(i.initProCoin(o)),
                  c = MJ.GameLogic.TableModel.IsLeagueRoom()
                    ? i.translateCoinStr(t.blind)
                    : i.translateCoinStr(i.initProCoin(t.blind));
                if (e.IsDiyRoom()) this.labDiZhu.node.active = !1;
                else if (e.IsMatchRoom())
                  ((this.labDiZhu.node.active = !1),
                    (this.labGameType.string = MJ.GameLogic.MatchModel.getMatchName()),
                    e.isMatchXLHZ() &&
                      ((this.labDiZhu.string = isNull(n)
                        ? ""
                        : n <= -1
                          ? " \u65e0\u5c01\u9876"
                          : " \u5c01\u9876:" + n + s),
                      (this.labDiZhu.node.active = !0)));
                else if (e.IsBattleRoom())
                  ((this.labDiZhu.string =
                    "\u5e95\u6ce8:" +
                    c +
                    (isNull(o) ? "" : o <= -1 ? " \u65e0\u5c01\u9876" : " \u5c01\u9876:" + r)),
                    (this.labDiZhu.node.active = !0));
                else if (e.IsCounterPlay())
                  ((this.labDiZhu.string =
                    "\u5e95\u6ce8:" +
                    t.blind +
                    (isNull(o) ? "" : o <= -1 ? " \u65e0\u5c01\u9876" : " \u5c01\u9876:" + o)),
                    (this.labDiZhu.node.active = !0));
                else {
                  var l;
                  ((l =
                    n > Math.pow(10, 11)
                      ? "1999\u4ebf+"
                      : n > 6 * Math.pow(10, 10)
                        ? "999\u4ebf+"
                        : n > 5 * Math.pow(10, 10)
                          ? "599\u4ebf+"
                          : n > Math.pow(10, 10)
                            ? "199\u4ebf+"
                            : n > Math.pow(10, 9)
                              ? "99\u4ebf+"
                              : n > Math.pow(10, 8)
                                ? "1\u4ebf+"
                                : "" + n + s),
                    (this.labDiZhu.string =
                      "\u5e95\u6ce8:" +
                      c +
                      (isNull(n) ? "" : n <= -1 ? " \u65e0\u5c01\u9876" : " \u5c01\u9876:" + l)),
                    (this.labDiZhu.node.active = !0));
                }
                MJ.GameLogic.TableModel.IsLeagueRoom() &&
                  ((this.labGameType.node.color = new cc.Color().fromHEX("#ff9f8e")),
                  (this.labDiZhu.node.color = new cc.Color().fromHEX("#ff9f8e")),
                  (this.labGameTypeColor = this.labGameType.node.color),
                  (this.labDiZhuColor = this.labDiZhu.node.color));
              },
              this,
            ),
              this.node.on(
                "SET_TABLE_INFO_COLOR",
                function (e) {
                  (e instanceof cc.Color &&
                    ((this.labGameType.node.color = e), (this.labDiZhu.node.color = e)),
                    MJ.GameLogic.TableModel.IsLeagueRoom() &&
                      ((this.labGameType.node.color = new cc.Color().fromHEX("#ff9f8e")),
                      (this.labDiZhu.node.color = new cc.Color().fromHEX("#ff9f8e"))),
                    (this.labGameTypeColor = this.labGameType.node.color),
                    (this.labDiZhuColor = this.labDiZhu.node.color));
                },
                this,
              ),
              this.node.on(
                "SET_TEACH_TABLE_INFO",
                function () {
                  ((this.labGameType.string = "\u8840\u6d41\u7ea2\u4e2d"),
                    (this.labDiZhu.node.active = !1));
                },
                this,
              ),
              this.node.on(
                "SET_TABLE_COLOR_SANGUO",
                function () {
                  MJ.GameLogic.TableModel.isSGMJ() &&
                    ((this.labGameType.node.color = new cc.Color().fromHEX("#4A3E35")),
                    (this.labDiZhu.node.color = new cc.Color().fromHEX("#4A3E35")));
                },
                this,
              ),
              this.node.on(
                "RESET_TABLE_COLOR_SANGUO",
                function () {
                  MJ.GameLogic.TableModel.isSGMJ() &&
                    ((this.labGameType.node.color = this.labGameTypeColor),
                    (this.labDiZhu.node.color = this.labDiZhuColor));
                },
                this,
              ));
          },
        }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils" },
    ],
