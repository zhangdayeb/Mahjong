    DirectionCtrl: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "faefbmMt0JEMJzkm5+h8pop", "DirectionCtrl");
        var i = cc.Enum({ EAST: 0, SOUTH: 1, WEST: 2, NORTH: 3 }),
          a = cc.Enum({ OLD: 0, NORMAL: 1, ROTATIONZ: 3 });
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            BaseType: { default: i.EAST, type: i },
            rotateType: { default: a.OLD, type: a },
            node_direction: { default: [], type: cc.Node },
            node_seatLiang: { default: [], type: cc.Node },
            node_seatAn: { default: [], type: cc.Node },
            labCountDown: { default: null, type: cc.Label },
          },
          Awake: function () {
            ((this._nBankerViewSeatId = 0),
              (this.tableID = null),
              this.initData(),
              this.upDataUI(),
              this.onMessageEvent());
          },
          onMessageEvent: function () {
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.SAN_GUO_UPDATE_COUNT_DOWN,
                function (e) {
                  var t = e.nCurViewSeatId,
                    i = e.nCountDownTime;
                  (i > 0 &&
                    MJ.GameAnimMgr.pauseGameLoopTime > 0 &&
                    ((i = Math.round(i - MJ.GameAnimMgr.pauseGameLoopTime)),
                    (MJ.GameAnimMgr.pauseGameLoopTime = 0)),
                    (this._time = i),
                    this.initClock(i),
                    this.updateCurSeat(t));
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.SAN_GUO_UPDATE_CURRENT_SEAT,
                  function (e) {
                    this.updateCurSeat(e.nCurViewSeatId);
                  },
                  this,
                ),
              ));
          },
          updateCurSeat: function (e) {
            for (
              var t = cc.repeatForever(cc.sequence(cc.fadeTo(0.8, 20), cc.fadeIn(0.8))), i = 0;
              i < this.node_seatLiang.length;
              i++
            ) {
              var a = this.node_seatLiang[i];
              i === e
                ? ((a.active = !0), a.stopAllActions(), a.runAction(t))
                : ((a.active = !1), a.stopAllActions());
            }
          },
          initClock: function (e) {
            this.unschedule(this._updateTime);
            var t = e - 1;
            ((t = (t > 0 && t) || 0) <= 0
              ? (this.labCountDown.node.active = !1)
              : ((this.labCountDown.node.active = !0),
                (this.labCountDown.string = this._time < 10 ? "0" + this._time : this._time)),
              (this._updateTime = this.updateTime.bind(this, e)),
              this.schedule(this._updateTime, 1, t));
          },
          updateTime: function () {
            ((this._time = this._time - 1),
              (this.labCountDown.string = this._time < 10 ? "0" + this._time : this._time));
          },
          initData: function () {
            if (MJ.GameLogic) {
              this._nBankerViewSeatId = MJ.GameLogic.PlayerModel.nBankerViewId;
              var e = MJ.GameLogic.PlayerModel.getPlayerInfoByViewID(0),
                t = null;
              (e && (t = e.useIds), t && (this.tableID = t[g_tConst.ServerBagType.CardTable]));
            }
          },
          _updateBanker: function (e) {
            var t = e.data;
            isNull(e.typeId) ? (this._nBankerViewSeatId = t) : (this._nBankerViewSeatId = e.typeId);
          },
          upDataUI: function () {
            if (null != this.tableID)
              switch (this.rotateType) {
                case a.OLD:
                  this.choiceOld();
                  break;
                case a.NORMAL:
                  this.choiceNormal();
                  break;
                case a.ROTATIONZ:
                  this.rotationZIndex();
              }
          },
          rotationZIndex: function () {
            for (var e = 90 * this.BaseType * -1, t = 0; t < this.node_direction.length; t++) {
              var i = 90 * this._nBankerViewSeatId * -1,
                a = new cc.Vec3(0, 0, e + i);
              ((this.node_direction[t].eulerAngles = a), console.log("Rick_RotalAngle:", a));
            }
          },
          choiceOld: function () {
            for (var e = 90 * this.BaseType * -1, t = 0; t < this.node_direction.length; t++) {
              var i = 90 * this._nBankerViewSeatId * -1,
                a = new cc.Vec3(0, e + i, 0);
              ((this.node_direction[t].eulerAngles = a), console.log("Rick_RotalAngle:", a));
            }
          },
          choiceNormal: function () {
            for (var e = 0; e < this.node_seatLiang.length; e++)
              for (
                var t = this.node_seatLiang[e],
                  i = (4 + e - this._nBankerViewSeatId) % 4,
                  a = t.getChildByName("dong"),
                  o = t.getChildByName("nan"),
                  n = t.getChildByName("xi"),
                  s = [a, t.getChildByName("bei"), n, o],
                  r = 0;
                r < s.length;
                r++
              )
                s[r].active = r == i;
            for (var c = 0; c < this.node_seatAn.length; c++)
              for (
                var l = this.node_seatAn[c],
                  g = (4 + c - this._nBankerViewSeatId) % 4,
                  d = l.getChildByName("dong"),
                  h = l.getChildByName("nan"),
                  u = l.getChildByName("xi"),
                  _ = [d, l.getChildByName("bei"), u, h],
                  m = 0;
                m < _.length;
                m++
              )
                _[m].active = m == g;
          },
          isOldMod: function () {
            return this.rotateType == a.OLD || this.rotateType == a.ROTATIONZ;
          },
          _setRotation: function () {},
        }),
          cc._RF.pop());
      },
      {},
    ],
