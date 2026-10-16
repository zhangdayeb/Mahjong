    SGMJGuideView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "9b98f9DWqhMcoPF2KGlK1G7", "SGMJGuideView");
        var i = e("AlertDlgBaseView");
        (cc.Class({
          extends: i,
          properties: {
            btnLeft: { default: null, type: cc.Node },
            btnRight: { default: null, type: cc.Node },
            showPic: { default: null, type: cc.Sprite },
            title: { default: null, type: cc.Sprite },
            btnClose: { default: null, type: cc.Node },
            root: { default: null, type: cc.Node },
            mask: { default: null, type: cc.Node },
            pageTitle: { default: [], type: [cc.SpriteFrame] },
            pageImg: { default: [], type: [cc.SpriteFrame] },
          },
          Awake: function () {
            ((this._closeReleaseRes = !0),
              (this.curPage = 0),
              (this.clickToEnd = !1),
              (this.btnEntry = null),
              (this.pageData = []),
              this.onCustomEvent(),
              this.onMessageEvent(),
              (this.pageData = [
                { title: this.pageTitle[0], pageImg: this.pageImg[0] },
                { title: this.pageTitle[1], pageImg: this.pageImg[1] },
                { title: this.pageTitle[2], pageImg: this.pageImg[2] },
                { title: this.pageTitle[3], pageImg: this.pageImg[3] },
              ]));
          },
          onCustomEvent: function () {
            this.node.on("ON_INIT", this.onInit, this);
          },
          onMessageEvent: function () {},
          onInit: function (e) {
            (e && (this.btnEntryWorldPos = e.btnEntryWorldPos), this.loadPage(0));
          },
          loadPage: function (e) {
            ((this.btnLeft.active = !0),
              (this.btnRight.active = !0),
              (this.title.spriteFrame = this.pageData[e].title),
              (this.showPic.spriteFrame = this.pageData[e].pageImg),
              0 == e && (this.btnLeft.active = !1),
              e == this.pageData.length - 1 &&
                ((this.btnRight.active = !1), (this.clickToEnd = !0)),
              this.clickToEnd && (this.btnClose.active = !0));
          },
          onClickLeft: function () {
            var e = Math.max(0, this.curPage - 1);
            e != this.curPage && ((this.curPage = e), this.loadPage(this.curPage));
          },
          onClickRight: function () {
            var e = Math.max(0, this.curPage + 1);
            e != this.curPage && ((this.curPage = e), this.loadPage(this.curPage));
          },
          onClickClose: function () {
            var e = this;
            this.mask.opacity = 0;
            var t = cc.tween;
            if (this.btnEntryWorldPos) {
              var i = this.btnEntryWorldPos,
                a = this.root.convertToWorldSpaceAR(cc.v3(0, 0, 0)),
                o = i.subClone(a);
              cc.tween(this.root)
                .by(0.15, { scale: new cc.Vec3(0.15, 0.15, 0) }, { easing: "cubicOut" })
                .parallel(
                  t().to(0.2, { position: o }),
                  t().to(0.2, { scale: new cc.Vec3(0.05, 0.05, 0) }, { easing: "cubicOut" }),
                  t().to(0.2, { opacity: 0 }),
                )
                .call(function () {
                  e.close();
                })
                .start();
            } else this.close();
          },
        }),
          cc._RF.pop());
      },
      { AlertDlgBaseView: "AlertDlgBaseView" },
    ],
