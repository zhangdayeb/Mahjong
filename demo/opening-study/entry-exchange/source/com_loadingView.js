    com_loadingView: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "4811e+AALhOwLK7sNjsnLG6", "com_loadingView"),
          cc.Class({
            extends: Cls_BaseView,
            properties: {
              loadRoot: cc.Node,
              loadInfoNode: cc.Node,
              loadInfoValue: cc.Label,
              loadingIcon: cc.Node,
              _progress: 0,
              _DT: 0.1,
              _allProgress: 0,
              _showScene: !1,
              _addProgress: 0,
              _flowProgress: 0,
              _addFlowProgress: 0,
              _allFlowProgress: 0,
              _showFlow: !1,
              _flowDT: 0.1,
              _delay: 0,
              _frame: 0,
            },
            Awake: function () {
              (this.setValueLabel(0),
                this.node.on("show", this.showLoading, this),
                this.node.on("hide", this.hideLoading, this),
                this.node.on("showScene", this.showSceneLoading, this),
                this.node.on("hideScene", this.hideSceneLoading, this),
                this.node.on("showFlow", this.showFlowLoading, this),
                this.node.on("hideFlow", this.hideFlowLoading, this));
            },
            update: function () {
              this.loadRoot.active && ((this.loadingIcon.angle += 5), this.updataValue());
            },
            updataValue: function () {
              if (this._showFlow) {
                var e = this._allFlowProgress - this._flowProgress;
                if (e > 0) {
                  var t = Math.abs(e);
                  this._flowDT = t;
                }
                return (
                  this._flowDT <= 0.02 && (this._flowDT = 0.02),
                  (this._flowProgress = this._flowProgress + this._flowDT),
                  this._flowProgress >= 99.9
                    ? ((this._flowProgress = 99.9), (this.loadInfoNode.active = !1))
                    : (this.loadInfoNode.active = !0),
                  void this.setValueLabel(this._flowProgress)
                );
              }
              if (this._showScene) {
                this._progress = this._progress + this._DT;
                var i = this._allProgress - this._progress;
                if (i > 0) {
                  var a = (Math.abs(i) / 30 / 5) * (100 / (this._addProgress + i));
                  this._flowDT = a;
                }
                return (
                  this._flowDT <= 0.02 && (this._flowDT = 0.02),
                  (this._progress = this._progress + this._flowDT),
                  this._progress >= 99.9
                    ? ((this._progress = 99.9), (this.loadInfoNode.active = !1))
                    : (this.loadInfoNode.active = !0),
                  void this.setValueLabel(this._progress)
                );
              }
            },
            setValueLabel: function (e) {
              this.loadInfoValue.string = e.toFixed(1) + "%";
            },
            showLoading: function () {
              ((this.loadInfoNode.active = !0), (this.loadRoot.active = !0));
            },
            hideLoading: function () {
              ((this._allFlowProgress = 0),
                (this._flowProgress = 0),
                (this.loadInfoValue.string = "0.0%"),
                (this.loadRoot.active = !1));
            },
            showSceneLoading: function (e) {
              ((this._showScene = !0),
                (this.loadInfoNode.active = !0),
                (e *= 100) >= 100 && (e = 99.9),
                (this._addProgress = Math.abs(e - this._allProgress)),
                (this._allProgress = e),
                (this.loadRoot.active = !0));
            },
            hideSceneLoading: function () {
              ((this._showScene = !1),
                (this._progress = 0),
                (this.loadRoot.active = !1),
                Log.warn(">>>>>>>>>>hideSceneLoading"));
            },
            showFlowLoading: function (e, t) {
              ((this.loadInfoNode.active = !0),
                this._flowProgress < e && (this._flowProgress = e),
                t >= 100 && (t = 99.9),
                (this._addFlowProgress = Math.abs(t - this._allFlowProgress)),
                (this._allFlowProgress = t),
                (this._showFlow = !0),
                (this.loadRoot.active = !0));
            },
            hideFlowLoading: function () {
              ((this._showFlow = !1),
                (this._flowProgress = 0),
                this.setValueLabel(0),
                (this.loadRoot.active = !1),
                Log.warn(">>>>>>>>>>hideFlowLoading"));
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
