    DlgAnimation: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "3ec78m/sW1JjIOZPaNTdoTH", "DlgAnimation"),
          cc.Class({
            extends: cc.Component,
            properties: {
              nodeAni: cc.Node,
              _nScaleBig: 1.1,
              _nScaleSmall: 1,
              _nShowTime: 0.2,
              _nHideTime: 0.1,
              _CloseHideTime: 0.2,
              PopViewName: "",
            },
            start: function () {},
            onLoad: function () {
              (this.onMessageEvent(), this.nodeAni && this.setPopAnimation(this.nodeAni));
            },
            setPopAnimation: function (e) {
              e.stopAllActions();
              var t = this._nShowTime;
              e.setScale(0.1);
              var i = cc.scaleTo(t, this._nScaleBig),
                a = cc.fadeIn(t),
                o = cc.spawn(i, a),
                n = cc.scaleTo(this._nHideTime, this._nScaleSmall);
              ((this.popAction = cc.sequence(o, n)), this.pop(e));
            },
            pop: function (e) {
              (e.setScale(0.1), e.runAction(this.popAction));
            },
            onMessageEvent: function () {
              cc.director.on("CLOSE_POP_VIEW_ANI", this.setClosePopAnimation, this);
            },
            onDestroy: function () {
              cc.director.off("CLOSE_POP_VIEW_ANI", this.setClosePopAnimation, this);
            },
            setClosePopAnimation: function (e) {
              var t = e.posNode || null,
                i = e.cbFunc || null,
                a = e.aniNode || null,
                o = e.popViewName || null;
              if (null != o && this.PopViewName == o)
                if (null == t && i) i();
                else if (null != a || null != (a = this.nodeAni)) {
                  (a.stopAllActions(), (this.popAction = null));
                  var n = this._CloseHideTime;
                  a.setScale(this._nScaleSmall);
                  var s = cc.scaleTo(n, 0.1),
                    r = null;
                  if (t) {
                    var c = t.convertToWorldSpaceAR(cc.v2(0, 0)),
                      l = a.convertToWorldSpaceAR(cc.v2(0, 0)),
                      g = c.sub(l),
                      d = cc.moveBy(n, g);
                    r = cc.spawn(s, d);
                  } else r = cc.spawn(s);
                  var h = cc.callFunc(
                    function () {
                      i && ((a.active = !1), i());
                    }.bind(this),
                  );
                  ((this.popAction = cc.sequence(r, h)), this.closePop(a));
                } else i();
            },
            closePop: function (e) {
              null != e && e.runAction(this.popAction);
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
