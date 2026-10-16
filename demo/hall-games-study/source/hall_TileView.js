    hall_TileView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "8b17alW2SZDFYVeEVqX8kRe", "hall_TileView");
        var i = e("CommonUtils"),
          a = (e("QuikStart"), e("CommonPlat"), e("hall_TileDefine")),
          o = a.HallTileType,
          n = a.HallTagType,
          s = a.HallGameTypeName;
        (e("RecommendScene"),
          cc.Class({
            extends: Cls_BaseView,
            properties: {
              skin: cc.Sprite,
              DetailSkin: {
                default: null,
                type: cc.SpriteFrame,
                tooltip: "\u9ed8\u8ba4\u76ae\u80a4",
              },
              RegularSkin: {
                default: null,
                type: cc.SpriteFrame,
                tooltip: "\u7279\u6b8a\u73a9\u6cd5\u76ae\u80a4",
              },
              mainLayer: { default: null, type: cc.Node, tooltip: "\u4e3b\u5c42" },
              tag: cc.Node,
              tagLabel: cc.Label,
              tagOffset: [cc.Vec2],
              title: cc.Label,
              tileType: { default: o.NONE, type: o },
              egName: cc.Sprite,
              newEgName: cc.SpriteFrame,
              SanGuoSp: cc.SpriteFrame,
              _data: null,
              _clickFunc: null,
              gameType: null,
              gameTypes: [],
            },
            Awake: function () {
              ((this._isDelBuXiPai = !1), this.onCustomEvent(), this.onMessageEvent());
            },
            onCustomEvent: function () {
              (this.node.on("INIT_STYLE", this.initStyle, this),
                this.node.on("INIT_STYLE_TYPE", this.setGts, this));
            },
            onMessageEvent: function () {
              this.tileType == o.RECOMMEND_TWO &&
                (this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.DIANFENGSAI_REFRESH_ACTON,
                    function () {
                      this.setTile(this._data);
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.DIANFENGSAI_CFG_SUCCESS,
                    function () {
                      this.setTile(this._data);
                    },
                    this,
                  ),
                ));
            },
            initStyle: function (e) {
              ((this._data = e), this.setTile(e), this.setTag(e));
            },
            setTile: function (e) {
              if (!(this.tileType >= o.NONE)) {
                this.title.string = "";
                var t = e.layoutDict || {};
                switch (this.tileType) {
                  case o.RECOMMEND_ONE:
                    this.initRecommendNewOne(t, e);
                    break;
                  case o.RECOMMEND_TWO:
                    this.initRecommendNewTwo(t, e);
                    break;
                  case o.RECOMMEND_THREE:
                    this.initRecommendNewThree(t, e);
                    break;
                  case o.RECOMMEND_FOUR:
                    ((this._isDelBuXiPai = !0), this.initRecommendNewFour(t, e));
                    break;
                  case o.RECOMMEND_FIVE:
                    this.initRecommendNewFive(t, e);
                    break;
                  case o.RECOMMEND_SIX:
                    this.initRecommendNewSix(t, e);
                    break;
                  case o.LOCAL_GAME_SET:
                    this.title.string = "\u73a9\u6cd5\u5408\u96c6";
                    break;
                  case o.EXPORT_ONE:
                  case o.EXPORT_TWO:
                }
                this.title.string = this.ajustTitle(this.title.string);
              }
            },
            setTag: function (e) {
              if (!(this.tileType >= o.NONE)) {
                var t = e.tagCfg[this.tileType],
                  i = -1;
                (!isNull(t) && (t = parseInt(t)),
                  0 != t && (i = t - 1),
                  i >= 0 && this.tag && ((this.tag.active = !0), (this.tagLabel.string = n[t])));
              }
            },
            ajustTitle: function (e) {
              var t = new RegExp("\u91d1\u8c46\u573a|\u91d1\u5e01\u573a");
              return e.replace(t, "");
            },
            getPlayerLastPlay: function () {
              return g_oData.get(g_tData.UserLocalModel).getData("LastGameType", null);
            },
            getGameTypeCfg: function (e, t) {
              for (var i in g_tConst.GameTypeCfgs)
                if (g_tConst.GameTypeCfgs.hasOwnProperty(i)) {
                  var a = g_tConst.GameTypeCfgs[i];
                  if (a.TYPEID === e) return void (t && t(a));
                }
            },
            setGts: function (e) {
              this.gameTypes.push(e);
            },
            isRepeat: function (e) {
              for (var t = 0; t < this.gameTypes.length; ++t) if (e == this.gameTypes[t]) return !0;
              return !1;
            },
            setGToFour: function (e) {
              this.node.parentCode.tileNodes[3].emit("INIT_STYLE_TYPE", e);
            },
            initRecommendNewOne: function (e, t) {
              void 0 === e && (e = {});
              var a = (t.enterLayout || [])[o.RECOMMEND_ONE] || null,
                n = null;
              isNull(a) || (n = e[a] || null);
              var s = !1;
              if ((g_oData.get(g_tData.SwitchModel).isCheckHandle() && (n = "866"), isNull(n)))
                s = !0;
              else {
                var r = n.split("|") || [],
                  c = "";
                (isNull(t.subTagDict) || (c = t.subTagDict[a] || ""),
                  1 === r.length
                    ? (this.showAsRegular(parseInt(r[0])), this.setGToFour(parseInt(r[0])))
                    : r.length >= 2
                      ? (this.setTileString(parseInt(r[0])),
                        (this._clickFunc = function () {
                          g_oLayerManager.emitEvent2Dlg(
                            g_tConst.GameLayerCfg.Hall_TabelSel.id,
                            "onInit",
                            { mostArr: r, tagArr: c, isMost: !0, isHallCome: !0 },
                          );
                        }))
                      : (s = !0),
                  parseInt(r[0]) == g_tConst.GameTypeCfgs.SGMJ2.TYPEID &&
                    this.SanGuoSp &&
                    (this.skin.spriteFrame = this.SanGuoSp));
              }
              if (1 == s) {
                var l = g_oData.get(g_tData.AreaMod).sub.areaHotGT.hot1;
                if (!l) return;
                var g = isNull(l) ? "..." : i.ajustGTName(l.sName);
                (this.showAsRegular(l.iID, { TYPEID: l.iID, Name: g }), this.setGToFour(l.iID));
              }
            },
            initRecommendNewTwo: function (e, t) {
              (void 0 === e && (e = {}), (this.title.node.active = !0));
              var a = (t.enterLayout || [])[o.RECOMMEND_TWO] || null,
                n = null;
              isNull(a) || (n = e[a] || null);
              var r = !1;
              if ((g_oData.get(g_tData.SwitchModel).isCheckHandle() && (n = "895"), isNull(n)))
                r = !0;
              else {
                var c = n.split("|") || [],
                  l = "";
                if ((isNull(t.subTagDict) || (l = t.subTagDict[a] || ""), 1 === c.length)) {
                  var g = parseInt(c[0]);
                  if ((this.setGToFour(g), g === s.Zjroom.id))
                    ((this.title.string = s.Zjroom.Name),
                      (this._clickFunc = function () {
                        g_oLayerManager.emitEvent2Dlg(
                          g_tConst.GameLayerCfg.Hall_DiyRoomSel.id,
                          "ON_INIT",
                        );
                      }));
                  else if (
                    (this.showAsRegular(parseInt(c[0])),
                    g_oData.get(g_tData.DianFengSaiMod).canSupportMatch() &&
                      g_oData.get(g_tData.DianFengSaiMod).canSupportGame(g))
                  )
                    this.showAsDianFeng();
                  else {
                    var d = this.node.getChildByName("glow");
                    d && (d.active = !1);
                  }
                } else
                  c.length >= 2
                    ? (this.setTileString(parseInt(c[0])),
                      (this._clickFunc = function () {
                        g_oLayerManager.emitEvent2Dlg(
                          g_tConst.GameLayerCfg.Hall_TabelSel.id,
                          "onInit",
                          { mostArr: c, tagArr: l, isMost: !0, isHallCome: !0 },
                        );
                      }))
                    : (r = !0);
                parseInt(c[0]) == g_tConst.GameTypeCfgs.SGMJ2.TYPEID &&
                  this.SanGuoSp &&
                  (this.skin.spriteFrame = this.SanGuoSp);
              }
              if (1 == r) {
                var h = g_oData.get(g_tData.AreaMod).sub.areaHotGT.hot2;
                if (!h) return;
                var u = isNull(h) ? "..." : i.ajustGTName(h.sName);
                (this.showAsRegular(h.iID, { TYPEID: h.iID, Name: u }), this.setGToFour(h.iID));
              }
            },
            initRecommendNewThree: function (e, t) {
              if ((void 0 === e && (e = {}), g_oData.get(g_tData.SwitchModel).isCheckHandle()))
                this.node.active = !1;
              else {
                this.title.node.active = !0;
                var a = (t.enterLayout || [])[o.RECOMMEND_THREE] || null,
                  n = null;
                isNull(a) || (n = e[a] || null);
                var r = !1;
                if (isNull(n)) r = !0;
                else {
                  var c = n.split("|") || [],
                    l = "";
                  if ((isNull(t.subTagDict) || (l = t.subTagDict[a] || ""), 1 === c.length)) {
                    var g = parseInt(c[0]);
                    if ((this.setGToFour(g), g === s.Zjroom.id))
                      ((this.title.string = s.Zjroom.Name),
                        (this._clickFunc = function () {
                          g_oLayerManager.emitEvent2Dlg(
                            g_tConst.GameLayerCfg.Hall_DiyRoomSel.id,
                            "ON_INIT",
                          );
                        }));
                    else if (
                      (this.showAsRegular(g),
                      [
                        g_tConst.GameTypeCfgs.SJCCMJ.TYPEID,
                        g_tConst.GameTypeCfgs.SJCCBXP.TYPEID,
                      ].includes(g)
                        ? (this.skin.spriteFrame = this.DetailSkin)
                        : (this.skin.spriteFrame = this.RegularSkin),
                      g_oData.get(g_tData.DianFengSaiMod).canSupportMatch() &&
                        g_oData.get(g_tData.DianFengSaiMod).canSupportGame(g))
                    )
                      this.showAsDianFeng();
                    else {
                      var d = this.node.getChildByName("glow");
                      d && (d.active = !1);
                    }
                  } else
                    c.length >= 2
                      ? (this.setTileString(parseInt(c[0])),
                        (this._clickFunc = function () {
                          g_oLayerManager.emitEvent2Dlg(
                            g_tConst.GameLayerCfg.Hall_TabelSel.id,
                            "onInit",
                            { mostArr: c, tagArr: l, isMost: !0, isHallCome: !0 },
                          );
                        }))
                      : (r = !0);
                }
                if (1 == r) {
                  var h = g_oData.get(g_tData.AreaMod).sub.areaHotGT.hot3;
                  if (!h) return;
                  var u = isNull(h) ? "..." : i.ajustGTName(h.sName);
                  (this.showAsRegular(h.iID, { TYPEID: h.iID, Name: u }), this.setGToFour(h.iID));
                }
              }
            },
            __setYuLeDetailInfo: function () {
              ((this.title.string = "\u5a31\u4e50"),
                (this._clickFunc = function () {
                  g_oLayerManager.emitEvent2Dlg(
                    g_tConst.GameLayerCfg.MatchPlayType.id,
                    "MatchPlayType_Init_YuLe",
                  );
                }));
            },
            __setMatchDetailInfo: function () {
              ((this.title.string = "\u8d5b\u4e8b\u4e2d\u5fc3"),
                (this._clickFunc = function () {
                  g_oLayerManager.emitEvent2Dlg(
                    g_tConst.GameLayerCfg.MatchPlayType.id,
                    "MatchPlayType_Init_Match",
                  );
                }));
            },
            initRecommendNewFour: function (e, t) {
              if ((void 0 === e && (e = {}), g_oData.get(g_tData.SwitchModel).isCheckHandle()))
                this.node.active = !1;
              else {
                var a = (t.enterLayout || [])[o.RECOMMEND_FOUR] || null,
                  n = null,
                  s = null,
                  r = !1;
                isNull(a) || (n = e[a] || null);
                var c = this.getPlayerLastPlay();
                if (c && !this.isRepeat(c)) ((s = c), this.showAsRegular(parseInt(s)));
                else if (isNull(n)) r = !0;
                else {
                  var l = n.split("|") || [],
                    g = "";
                  (isNull(t.subTagDict) || (g = t.subTagDict[a] || ""),
                    1 === l.length
                      ? ((s = parseInt(l[0])),
                        this.isRepeat(s) ? (r = !0) : this.showAsRegular(parseInt(s)))
                      : l.length >= 2
                        ? (this._clickFunc = function () {
                            g_oLayerManager.emitEvent2Dlg(
                              g_tConst.GameLayerCfg.Hall_TabelSel.id,
                              "onInit",
                              { mostArr: l, tagArr: g, isMost: !0, isHallCome: !0 },
                            );
                          })
                        : (r = !0));
                }
                if (r) {
                  var d = g_oData.get(g_tData.AreaMod).sub.areaHotGT.finalUseHot4;
                  if (!d) return;
                  for (var h = null, u = 0; u < d.length; ++u)
                    if (!this.isRepeat(d[u].iID)) {
                      h = d[u];
                      break;
                    }
                  if (!h) return;
                  var _ = isNull(h) ? "..." : i.ajustGTName(h.sName);
                  this.showAsRegular(h.iID, { TYPEID: h.iID, Name: _ });
                }
              }
            },
            initRecommendNewFive: function (e, t) {
              (void 0 === e && (e = {}), console.log(" initRecommendNewThree oData = ", t));
              var i = (t.enterLayout || [])[o.RECOMMEND_FIVE] || null,
                a = null;
              if (
                (isNull(i) || (a = e[i] || null),
                console.log(" initRecommendNewThree dictKey rInfo3 = ", i, a),
                isNull(a))
              )
                this.__setMatchDetailInfo();
              else {
                var n = "";
                (isNull(t.subTagDict) || (n = t.subTagDict[i] || ""),
                  "R6" === i
                    ? ((this.title.string = "\u5a31\u4e50"),
                      (this._clickFunc = function () {
                        g_oLayerManager.emitEvent2Dlg(
                          g_tConst.GameLayerCfg.MatchPlayType.id,
                          "MatchPlayType_Init_YuLe",
                          { enterArr: a, tagArr: n },
                        );
                      }))
                    : ((this.title.string = "\u8d5b\u4e8b\u4e2d\u5fc3"),
                      (this._clickFunc = function () {
                        g_oLayerManager.emitEvent2Dlg(
                          g_tConst.GameLayerCfg.MatchPlayType.id,
                          "MatchPlayType_Init_Match",
                          { enterArr: a, tagArr: n },
                        );
                      })));
              }
            },
            initRecommendNewSix: function (e, t) {
              (void 0 === e && (e = {}), console.log(" initRecommendNewFour oData = ", t));
              var i = (t.enterLayout || [])[o.RECOMMEND_SIX] || null,
                a = null;
              if (
                (isNull(i) || (a = e[i] || null),
                console.log(" initRecommendNewSix dictKey rInfo4 = ", i, a),
                isNull(a))
              )
                this.__setYuLeDetailInfo();
              else {
                var n = "";
                (isNull(t.subTagDict) || (n = t.subTagDict[i] || ""),
                  "R5" === i
                    ? ((this.title.string = "\u8d5b\u4e8b\u4e2d\u5fc3"),
                      (this._clickFunc = function () {
                        g_oLayerManager.emitEvent2Dlg(
                          g_tConst.GameLayerCfg.MatchPlayType.id,
                          "MatchPlayType_Init_Match",
                          { enterArr: a, tagArr: n },
                        );
                      }))
                    : ((this.title.string = "\u5a31\u4e50"),
                      (this._clickFunc = function () {
                        g_oLayerManager.emitEvent2Dlg(
                          g_tConst.GameLayerCfg.MatchPlayType.id,
                          "MatchPlayType_Init_YuLe",
                          { enterArr: a, tagArr: n },
                        );
                      })));
              }
            },
            checkGameType: function (e) {
              var t = !0;
              switch (e) {
                case g_tConst.GameTypeCfgs.XLHZMJ.TYPEID:
                  this.showAsXlhz(g_tConst.GameTypeCfgs.XLHZMJ);
                  break;
                case g_tConst.GameTypeCfgs.XLHZMJ2.TYPEID:
                  this.showAsXlhz(g_tConst.GameTypeCfgs.XLHZMJ2);
                  break;
                case g_tConst.GameTypeCfgs.XLHZMJ3.TYPEID:
                  this.showAsXlhz(g_tConst.GameTypeCfgs.XLHZMJ3);
                  break;
                case g_tConst.GameTypeCfgs.XLHZMJ4.TYPEID:
                  this.showAsXlhz(
                    g_tConst.GameTypeCfgs.XLHZMJ4,
                    g_tConst.GameTypeCfgs.XLHZMJ4.Name,
                  );
                  break;
                case g_tConst.GameTypeCfgs.LS6HZ.TYPEID:
                  this.showAsXlhz(g_tConst.GameTypeCfgs.LS6HZ, g_tConst.GameTypeCfgs.LS6HZ.Name);
                  break;
                case g_tConst.GameTypeCfgs.XLHZMJ5.TYPEID:
                  this.showAsXlhz(
                    g_tConst.GameTypeCfgs.XLHZMJ5,
                    g_tConst.GameTypeCfgs.XLHZMJ5.Name,
                  );
                  break;
                case g_tConst.GameTypeCfgs.XL8HZBXP.TYPEID:
                  this.showAsXlhz(
                    g_tConst.GameTypeCfgs.XL8HZBXP,
                    g_tConst.GameTypeCfgs.XL8HZBXP.Name,
                  );
                  break;
                case g_tConst.GameTypeCfgs.FKBHZMJ.TYPEID:
                  this.showAsXlhz(
                    g_tConst.GameTypeCfgs.FKBHZMJ,
                    g_tConst.GameTypeCfgs.FKBHZMJ.Name,
                  );
                  break;
                case g_tConst.GameTypeCfgs.ZSXL8HZBXP.TYPEID:
                  this.showAsXlhz(
                    g_tConst.GameTypeCfgs.ZSXL8HZBXP,
                    g_tConst.GameTypeCfgs.ZSXL8HZBXP.Name,
                  );
                  break;
                case g_tConst.GameTypeCfgs.LZXLMJ.TYPEID:
                  this.showAsLzxl();
                  break;
                default:
                  t = !1;
              }
              return t;
            },
            checkGameTypeExisted: function (e) {
              var t = !1,
                i = this.mainLayer.getComponent("hall_LobbyMain").tileNodes;
              if (i && Array.isArray(i))
                for (var a = 0; a < i.length; ++a) {
                  var o = i[a].getComponent("hall_TileView"),
                    n = o.title,
                    s = new RegExp("^" + n.string + ".?"),
                    r = "" !== n.string && s.test(e.Name),
                    c = o.gameType && o.gameType == e.TYPEID;
                  if (r || c) {
                    t = !0;
                    break;
                  }
                }
              return t;
            },
            showAsXlhz: function (e, t) {
              (void 0 === e && (e = null),
                void 0 === t && (t = null),
                (this.title.string = t || s.Xlhz.Name));
              var i = this;
              (e || (e = g_tConst.GameTypeCfgs.XLHZMJ2),
                (this.gameType = e.TYPEID),
                (this._clickFunc = function () {
                  i.onClickXLHZMJ(e, t);
                }));
            },
            showAsLzxl: function () {
              this.title.string = s.Lzxl.Name;
              var e = this;
              this._clickFunc = function () {
                e.onClickLZXLMJ();
              };
            },
            setTileString: function (e) {
              var t = "\u8840\u6d41\u9ebb\u5c06";
              (898 == e
                ? (t = "\u5341\u4e8c\u751f\u8096")
                : 893 == e || 901 == e
                  ? (t = "\u56db\u5b63\u5e38\u6625")
                  : 911 == e && (t = "\u4e09\u56fd\u9ebb\u5c06"),
                (this.title.string = this.checkGTName(t)));
            },
            showAsRegular: function (e, t) {
              (void 0 === t && (t = null), (this.skin.spriteFrame = this.DetailSkin));
              var i = t;
              if (
                (isNull(i) &&
                  this.getGameTypeCfg(e, function (e) {
                    i = e;
                  }),
                isNull(i))
              )
                console.error(
                  "hall_TileView showAsRegular \u73a9\u6cd5\u914d\u7f6e\u6709\u95ee\u9898\uff0c\u8bf7\u68c0\u67e5\u5f00\u5173\u914d\u7f6e gameType=",
                  e,
                );
              else {
                if (this.checkGameType(i.TYPEID)) return;
                (this._isDelBuXiPai
                  ? (this.title.string = i.Name)
                  : (this.title.string = this.checkGTName(i.Name)),
                  (this.gameType = i.TYPEID));
                var a = this;
                this._clickFunc = function () {
                  a.enterTableSelByGameInfo(i);
                };
              }
            },
            checkGTName: function (e) {
              for (var t = 0; t < e.length; t++)
                if (
                  "\u4e0d" == e[t] &&
                  e[t + 1] &&
                  "\u6d17" == e[t + 1] &&
                  e[t + 2] &&
                  "\u724c" == e[t + 2]
                )
                  return e.split("\u4e0d")[0];
              return e;
            },
            showAsDianFeng: function () {
              var e = this.node.getChildByName("glow");
              (e && (e.active = !0),
                (this.skin.spriteFrame = this.RegularSkin),
                (this.egName.spriteFrame = this.newEgName),
                (this.title.string = "\u56db\u5b63\u5e38\u6625\u5dc5\u5cf0\u8d5b"));
            },
            onClickTile: function () {
              this._clickFunc && this._clickFunc();
            },
            enterTableSelByGameInfo: function (e) {
              g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Hall_TabelSel.id, "onInit", {
                nGameType: e.TYPEID,
                sGameName: e.Name,
                isHallCome: !0,
              });
            },
            onClickXLHZMJ: function (e, t) {
              (void 0 === t && (t = null),
                this.enterTableSelByGameInfo({ TYPEID: e.TYPEID, Name: t || s.Xlhz.Name }));
            },
            onClickLocalMJ: function () {
              g_oData
                .get(g_tData.gameReportData)
                .recordStartAction(g_tConst.ReportCfg.QuickStart.Area4);
              var e = g_oData.get(g_tData.AreaMod).getCurAreaCode();
              e
                ? g_oLayerManager.emitEvent2Dlg(
                    g_tConst.GameLayerCfg.Hall_ProvinceGameType.id,
                    "ON_INIT",
                    { AreaCode: e, FromSceneId: 1 },
                  )
                : Log.warn(
                    "edwin >>>",
                    "hall_TileView.js",
                    "\u6682\u65f6\u672a\u80fd\u4ece AreaMod \u4e2d\u83b7\u5f97 curAreaCode",
                  );
            },
            onClickLZXLMJ: function () {
              this.enterTableSelByGameInfo({
                TYPEID: g_tConst.GameTypeCfgs.LZXLMJ.TYPEID,
                Name: s.Lzxl.Name,
              });
            },
          }),
          cc._RF.pop());
      },
      {
        CommonPlat: "CommonPlat",
        CommonUtils: "CommonUtils",
        QuikStart: "QuikStart",
        RecommendScene: "RecommendScene",
        hall_TileDefine: "hall_TileDefine",
      },
    ],
