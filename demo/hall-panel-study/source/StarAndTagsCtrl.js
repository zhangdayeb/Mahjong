    StarAndTagsCtrl: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "c06e2NSB09L04MgBOKoPKwc", "StarAndTagsCtrl");
        var i = e("CommonUtils"),
          a = e("CommonView");
        (cc.Class({
          extends: cc.Component,
          properties: {
            starsBox: {
              default: null,
              type: cc.Node,
              tooltip: "\u88c5\u661f\u661f\u7684\u5bb9\u5668",
            },
            lab_starDesc: { default: null, type: cc.Label, tooltip: "\u661f\u7ea7\u63cf\u8ff0" },
            sv_tagScrollView: {
              default: null,
              type: cc.ScrollView,
              tooltip: "\u6807\u7b7e\u7684\u6eda\u52a8\u7ec4\u4ef6",
            },
            tplt_tagBg: {
              default: null,
              type: cc.Node,
              tooltip: "\u6807\u7b7e\u80cc\u666f\u6a21\u677f",
            },
            n_tagBgRoot: {
              default: null,
              type: cc.Node,
              tooltip: "\u6807\u7b7e\u80cc\u666f\u7684\u7236\u8282\u70b9",
            },
            tplt_tagLab: {
              default: null,
              type: cc.Node,
              tooltip: "\u6807\u7b7e\u5b57\u6a21\u677f",
            },
            n_tagLabRoot: {
              default: null,
              type: cc.Node,
              tooltip: "\u6807\u7b7e\u5b57\u7684\u7236\u8282\u70b9",
            },
            spf_tagSelect: {
              default: null,
              type: cc.SpriteFrame,
              tooltip: "\u9009\u4e2d\u7684\u6807\u7b7e\u7684\u80cc\u666f",
            },
            spf_tagNormal: {
              default: null,
              type: cc.SpriteFrame,
              tooltip: "\u672a\u9009\u4e2d\u7684\u6807\u7b7e\u7684\u80cc\u666f",
            },
          },
          _initData: function () {
            ((this._stars = this.starsBox.children),
              (this._starLevelCfg = {
                levelDesc: [
                  "\u975e\u5e38\u4e0d\u6ee1\u610f\uff0c\u5404\u65b9\u9762\u90fd\u5f88\u5dee",
                  "\u4e0d\u6ee1\u610f\uff0c\u5f88\u5dee",
                  "\u4e00\u822c\uff0c\u4e0d\u592a\u6ee1\u610f",
                  "\u6ee1\u610f\uff0c\u4ecd\u6709\u4f18\u5316\u7a7a\u95f4",
                  "\u975e\u5e38\u6ee1\u610f\uff0c\u7ee7\u7eed\u52a0\u6cb9",
                  "\u975e\u5e38\u5b8c\u7f8e\uff0c\u592a\u68d2\u4e86",
                ],
              }),
              (this._curStarLevel = 0),
              (this._tagGroup = {}),
              (this._curTagGroups = []));
          },
          init: function (e) {
            var t = this;
            (this._initData(),
              isNull(e) || isNull(e.tag) || isNull(e.tag.tagGroup)
                ? Log.error(
                    "BIRD\ud83d\ude21>>>",
                    "StarAndTagsCtrl.js",
                    "init",
                    "switchConfig not suit!",
                  )
                : ((this._starLevelCfg.tag = e.tag),
                  this._starLevelCfg.tag.tagGroup.forEach(function (e) {
                    t._tagGroup[e.id] = e.tags;
                  }),
                  this._updateTags()));
          },
          getSelect: function () {
            return {
              starLevel: this._curStarLevel,
              tags: this.n_tagLabRoot.children
                .map(function (e) {
                  return e.__isSelect__ ? e.__tag__ : null;
                })
                .filter(function (e) {
                  return !isNull(e);
                }),
            };
          },
          ajustTagNodes: function (e) {
            if (e > 0)
              for (var t = 0; t < e; t++) {
                var i = g_oItemPoolManager.get("tagBgPoolKey");
                (isNull(i) &&
                  ((i = cc.instantiate(this.tplt_tagBg)),
                  g_oItemPoolManager.bindPoolUUID(i, "tagBgPoolKey")),
                  this.n_tagBgRoot.addChild(i));
                var a = g_oItemPoolManager.get("tagLabPoolKey");
                (isNull(a) &&
                  ((a = cc.instantiate(this.tplt_tagLab)),
                  g_oItemPoolManager.bindPoolUUID(a, "tagLabPoolKey")),
                  this.n_tagLabRoot.addChild(a));
              }
            else if (e < 0)
              for (var o = 0; o < Math.abs(e); o++)
                (this.n_tagBgRoot.children[0] &&
                  g_oItemPoolManager.set(this.n_tagBgRoot.children[0]),
                  this.n_tagLabRoot.children[0] &&
                    g_oItemPoolManager.set(this.n_tagLabRoot.children[0]));
          },
          _updateTags: function () {
            var e = this,
              t = this._starLevelCfg.tag,
              o = t.starTags[this._curStarLevel];
            if (JSON.stringify(this._curTagGroups) !== JSON.stringify(o)) {
              var n = [];
              if (
                (o.forEach(function (t) {
                  n = n.concat(e._tagGroup[t]);
                }),
                n.length > 0)
              ) {
                var s = this.spf_tagSelect,
                  r = this.spf_tagNormal;
                t.isRandom && i.randomSoftArr(n);
                var c = n.length - this.n_tagBgRoot.children.length;
                (a.ajustChildrenNumber(
                  c,
                  this.tplt_tagBg,
                  this.n_tagBgRoot,
                  g_tConst.ITEM_POOL_KEY_FEEDBACK_STARTTAGS_TAGBG,
                ),
                  a.ajustChildrenNumber(
                    c,
                    this.tplt_tagLab,
                    this.n_tagLabRoot,
                    g_tConst.ITEM_POOL_KEY_FEEDBACK_STARTTAGS_TAGLAB,
                  ),
                  n.forEach(function (t, i) {
                    var a = e.n_tagBgRoot.children[i];
                    ((a.active = !0), (a.getComponent(cc.Sprite).spriteFrame = r));
                    var o = e.n_tagLabRoot.children[i];
                    ((o.active = !0),
                      (o.__tag__ = o.getComponentInChildren(cc.Label).string = t),
                      (o.__isSelect__ = !1),
                      o.targetOff(e),
                      o.on(
                        "click",
                        function () {
                          ((o.__isSelect__ = !o.__isSelect__),
                            (a.getComponent(cc.Sprite).spriteFrame = o.__isSelect__ ? s : r));
                        },
                        e,
                      ));
                  }));
              }
              ((this._curTagGroups = o),
                setTimeout(function () {
                  e.sv_tagScrollView.scrollToTop();
                }, 0));
            }
          },
          onClickStar: function (e, t) {
            var i = Number(t);
            if (this._curStarLevel !== i) {
              this._curStarLevel = i;
              for (var a = 0; a < this._stars.length; a++)
                this._stars[a].opacity = a + 1 <= i ? 255 : 0;
              ((this.lab_starDesc.string = this._starLevelCfg.levelDesc[t]), this._updateTags());
            }
          },
          onClickClose: function () {
            this._setsTagPoolNode_();
          },
          _setsTagPoolNode_: function () {
            for (; this.n_tagBgRoot.children[0] && cc.isValid(this.n_tagBgRoot.children[0]); )
              g_oItemPoolManager.set(this.n_tagBgRoot.children[0]);
            for (; this.n_tagLabRoot.children[0] && cc.isValid(this.n_tagLabRoot.children[0]); )
              g_oItemPoolManager.set(this.n_tagLabRoot.children[0]);
          },
        }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils", CommonView: "CommonView" },
    ],
