    SESXGuideView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "aa9c5g4FLpMEYJ/iippjCVT", "SESXGuideView");
        var i = e("AlertDlgBaseView");
        (cc.Class({
          extends: i,
          properties: {
            btnLeft: cc.Node,
            btnRight: cc.Node,
            showPic: cc.Sprite,
            title: cc.Sprite,
            info: cc.Label,
            shouzhi: cc.Animation,
            btnClose: cc.Node,
            root: cc.Node,
            mask: cc.Node,
            pageTitle: [cc.SpriteFrame],
            pageImg: [cc.SpriteFrame],
          },
          Awake: function () {
            ((this._closeReleaseRes = !0),
              (this.curPage = 0),
              (this.clickToEnd = !1),
              (this.btnEntry = null),
              (this.pageData = []),
              (this.shouzhi.node.opacity = 0),
              this.onCustomEvent(),
              this.onMessageEvent(),
              (this.pageData = [
                {
                  title: this.pageTitle[0],
                  pageImg: this.pageImg[0],
                  pageInfo:
                    "\u751f\u8096\u724c\uff1a\u9f20\u3001\u725b\u3001\u864e\u3001\u5154\u3001\u9f99\u3001\u86c7\u3001\u9a6c\u3001\u7f8a\u3001\u7334\u3001\u9e21\u3001\u72d7\u3001\u732a    \u5409\u661f\u724c\uff1a\u798f\u3001\u7984\u3001\u5bff",
                },
                {
                  title: this.pageTitle[1],
                  pageImg: this.pageImg[1],
                  pageInfo:
                    "\u73a9\u5bb6\u6bcf\u6478\u5230\u4e00\u5f20\u672c\u6b21\u5bf9\u5c40\u672a\u6478\u5230\u8fc7\u7684\u751f\u8096\u724c\uff0c\u5373\u53ef\u6536\u96c6\u5230\u751f\u8096\u56fe\u4e2d\u589e\u52a0\u500d\u6570\u3002",
                },
                {
                  title: this.pageTitle[2],
                  pageImg: this.pageImg[2],
                  pageInfo:
                    "\u6253\u51fa\u5409\u661f\u724c\u540e\uff0c\u4f1a\u968f\u673a\u70b9\u4eae\u4e00\u5f20\u751f\u8096\u56fe\u4e2d\u672a\u70b9\u4eae\u7684\u751f\u8096\u724c\u3002",
                },
                {
                  title: this.pageTitle[3],
                  pageImg: this.pageImg[3],
                  pageInfo:
                    "\u6839\u636e\u6536\u96c6\u5230\u7684\u751f\u8096\u724c\u7ec4\u6210\u7684\u4e0d\u540c\u5f62\u72b6\uff0c\u53ef\u4ee5\u83b7\u5f97\u500d\u6570\u52a0\u6210\u3002",
                },
              ]));
          },
          onCustomEvent: function () {
            this.node.on("ON_INIT", this.onInit, this);
          },
          onMessageEvent: function () {},
          onInit: function (e) {
            var t = this;
            (e && (this.btnEntryWorldPos = e.btnEntryWorldPos),
              this.loadPage(0),
              this.scheduleOnce(function () {
                t.shouzhi.node.opacity = 255;
              }, 0.3));
          },
          loadPage: function (e) {
            ((this.btnLeft.active = !0),
              (this.btnRight.active = !0),
              (this.title.spriteFrame = this.pageData[e].title),
              (this.showPic.spriteFrame = this.pageData[e].pageImg),
              (this.info.string = this.pageData[e].pageInfo),
              0 == e && (this.btnLeft.active = !1),
              e == this.pageData.length - 1 &&
                ((this.btnRight.active = !1), (this.clickToEnd = !0)),
              this.clickToEnd && ((this.shouzhi.node.active = !1), (this.btnClose.active = !0)));
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
