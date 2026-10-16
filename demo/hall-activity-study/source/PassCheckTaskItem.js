    PassCheckTaskItem: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "b9400AthsREN4M5LSef2E9G", "PassCheckTaskItem"),
          cc.Class({
            extends: cc.Component,
            properties: {
              btnGet: cc.Node,
              btnUn: cc.Node,
              btnFinish: cc.Node,
              layout: cc.Node,
              taskName: cc.Label,
              progressLbl: cc.Label,
              progress: cc.ProgressBar,
              _callCb: null,
            },
            init: function (e, t) {
              ((this.taskName.string = e.desc.replace("\u6bcf\u65e5\u60ac\u8d4f-", "")),
                (this.taskName.string = this.taskName.string.replace(
                  "\u6bcf\u5468\u60ac\u8d4f-",
                  "",
                )));
              var i = t.counter,
                a = e.neednum;
              ((this.progress.progress = i / a),
                (this.progressLbl.string = i + "/" + a),
                (this.btnGet.active = 2 == t.status),
                (this.btnUn.active = 0 == t.status),
                (this.btnFinish.active = 1 == t.status || 3 == t.status));
              for (
                var o = this.layout, n = o.getChildByName("icon"), s = 0;
                s < Math.max(e.package.length, o.children.length);
                s++
              ) {
                var r,
                  c = e.package[s],
                  l = null != (r = o.children[s]) ? r : cc.instantiate(n),
                  g = l.getChildByName("iconNum").getComponent(cc.Label),
                  d = l.getChildByName("iconSpr").getComponent(cc.Sprite);
                if (((l.parent = o), c)) {
                  ((l.active = !0),
                    (c.subType = String(c.subType)),
                    (c.subEffectID = c.subType.slice(3, c.subType.length)));
                  var h = g_oData.get(g_tData.PassCheckMod).initItemCfg(c);
                  ((g.string = "" + h.itemNum),
                    d._loadResUrl != h.itemPath + h.itemPathName &&
                      ((d._loadResUrl = h.itemPath + h.itemPathName),
                      (d.spriteFrame = null),
                      g_oSpriteFrameLoader.load_in_bundle(
                        h.itemBundle,
                        h.itemPath,
                        h.itemPathName,
                        d,
                      )));
                } else
                  ((l.active = !0),
                    (g.string = "" + e.achieveValue),
                    d._loadResUrl != g_tAsset.BACKPACK_ITEM_PATH[10] + "dailyCardJingYan" &&
                      ((d._loadResUrl = g_tAsset.BACKPACK_ITEM_PATH[10] + "dailyCardJingYan"),
                      (d.spriteFrame = null),
                      g_oSpriteFrameLoader.load_in_bundle(
                        g_tAsset.BACKPACK_ITEM_BUNDLE[1],
                        g_tAsset.BACKPACK_ITEM_PATH[10],
                        "dailyCardJingYan",
                        d,
                      )));
              }
            },
            initCb: function (e) {
              this._callCb = e;
            },
            onClickGet: function () {
              var e;
              null == (e = this._callCb) || e.call(this);
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
