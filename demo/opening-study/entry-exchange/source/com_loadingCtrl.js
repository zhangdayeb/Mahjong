    com_loadingCtrl: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "7a15ckK5flOu7FvCxA88QA/", "com_loadingCtrl"),
          cc.Class({
            extends: Cls_BaseCtrl,
            properties: {
              _showNet: !1,
              _showLoadRes: !1,
              _showSceneLoadRes: !1,
              _openFlow: !1,
              _initProgressValue: 0,
              _progressData: null,
            },
            Awake: function () {
              (this.init(), this.onMessageEvnet());
            },
            init: function () {
              ((this._showNet = !1),
                (this._showLoadRes = !1),
                (this._showSceneLoadRes = !1),
                (this._progressData = new Map()),
                (this._openFlow = !1),
                this.__hideLoading());
            },
            HIDE: function () {
              this.node.active = !1;
            },
            SHOW: function () {
              this.node.active = !0;
            },
            show: function () {
              ((this._showNet = !0), this.__showLoading());
            },
            hidden: function () {
              ((this._showNet = !1), this.__hideLoading());
            },
            showLoadRes: function () {
              ((this._showLoadRes = !0), this.__showLoading());
            },
            hideLoadRes: function () {
              ((this._showLoadRes = !1), this.__hideLoading());
            },
            __showLoading: function () {
              (this.node.emit("show"), this.___log());
            },
            __hideLoading: function () {
              this.isAthorShow() || (this.node.emit("hide"), this.___log());
            },
            showSceneLoadRes: function (e) {
              ((this._showSceneLoadRes = !0), this.__showSceneLoading(e));
            },
            hideSceneLoadRes: function () {
              ((this._showSceneLoadRes = !1), this.__hideSceneLoading());
            },
            __showSceneLoading: function (e) {
              (this.node.emit("showScene", e), this.___log());
            },
            __hideSceneLoading: function () {
              (this.___log(), this.isAthorShow() || this.node.emit("hideScene"));
            },
            openFlowLoading: function (e) {
              ((this._initProgressValue = e),
                this._progressData.clear(),
                (this._openFlow = !0),
                this.__showFlowLoading());
            },
            updataFlowLoading: function (e, t, i) {
              (void 0 === i && (i = 1),
                this._progressData.get(e) && this._progressData.remove(e),
                this._progressData.set(e, t * i),
                this.__showFlowLoading());
            },
            closeFlowLoading: function () {
              ((this._initProgressValue = 0),
                this._progressData.clear(),
                (this._openFlow = !1),
                this.node.emit("hideFlow"),
                this.___log());
            },
            __showFlowLoading: function () {
              var e = this,
                t = 0;
              (this._progressData.forEach(function (i, a) {
                var o = e._progressData[a];
                t += o;
              }),
                t >= 100 && (t = 99.9),
                this.___log(),
                this.node.emit("showFlow", this._initProgressValue, t));
            },
            ___log: function () {},
            isAthorShow: function () {
              return (
                !!this._openFlow ||
                !!(this._showNet || this._showLoadRes || this._showSceneLoadRes) ||
                (!!(this._showNet || this._showLoadRes || this._showSceneLoadRes) && void 0)
              );
            },
            doReconnect: function () {
              this.init();
            },
            onMessageEvnet: function () {
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.gameSvrEventLogin,
                  function (e) {
                    e && this.doReconnect();
                  }.bind(this),
                ),
              );
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
