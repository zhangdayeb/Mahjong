    MatchSelectView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "2aba2INPRhIQJOqwFEr0lQ5", "MatchSelectView");
        var i = e("PopDlgBaseView"),
          a = e("PopDlgCtrl"),
          o = e("CommonUtils");
        (e("CommonPlat"),
          cc.Class({
            extends: i,
            properties: {
              ScreenMask: cc.Node,
              TopNode: cc.Node,
              MainNode: cc.Node,
              GoldEggNumRoot: cc.Node,
              FuCardNumRoot: cc.Node,
              MatchShopNode: cc.Node,
              _ShowTime: 0.3,
              _useMatchCfgArr: [],
              _MatchItemList: [],
              ItemBgList: [cc.SpriteFrame],
              ItemBgList2: [cc.SpriteFrame],
              ItemTipListQ: [cc.Font],
              ListContent: cc.Node,
              BaseItemPrefab: cc.Prefab,
              SignUpInstructionPrefab: cc.Prefab,
              _isNeedLead: !1,
              _IsNeedReportActionFormMlv: !1,
              wgt_close: cc.Widget,
            },
            Awake: function () {
              ((this.ScreenMask.active = !0),
                (this.MatchShopNode.active = !1),
                (this._MatchInfoList = []),
                this.onMessageEvent(),
                this.onCustomEvent());
            },
            start: function () {
              (cc.winSize.width >= 1380 &&
                ((this.wgt_close.left = (cc.winSize.width - 1380) / 2),
                this.wgt_close.updateAlignment()),
                this._super(),
                this.initUi(),
                this.setNodeAnimation());
            },
            onCustomEvent: function () {
              var e = this;
              (this.node.on("MatchSelect_Init", this.onInit, this),
                this.node.on(
                  "SHOW_LEAD_FINGER",
                  function (t) {
                    var i = t.node;
                    (t instanceof cc.Event && ((i = t.detail.node), t.stopPropagation()),
                      e.showFinger(i));
                  },
                  this,
                ),
                this.node.on(
                  "SIGN_UP_DETAIL_VIEW_CLOSE",
                  function (t) {
                    t instanceof cc.Event && (t.stopPropagation(), e.showFingerFirstItem());
                  },
                  this,
                ));
            },
            onMessageEvent: function () {
              var e = this;
              (this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.MATCH_CHECK_PLAYER_NUM_UPDATE,
                  function () {
                    e.updatePlayerNumFunc();
                  },
                  this,
                ),
              ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.NOTIFY_MATCH_APPLY_RESULT,
                    function (t) {
                      if (
                        (console.log("NOTIFY_MATCH_APPLY_RESULT resultCode = ", t),
                        1 == t.hasArchives &&
                          t.resultCode == g_tConst.MatchApplyResultCode.APPLY_SUCCESS)
                      )
                        g_oLayerManager.emitEvent2Dlg(
                          g_tConst.GameLayerCfg.TipsLayer.id,
                          "SHOW_NORMAL_TIP",
                          {
                            tipMsg:
                              "\u6bd4\u8d5b\u6062\u590d\u6210\u529f\uff0c\u6b63\u5728\u52a0\u8f7d",
                            showTime: 2,
                          },
                        );
                      else if (t.resultCode == g_tConst.MatchApplyResultCode.APPLY_SUCCESS)
                        g_oLayerManager.emitEvent2Dlg(
                          g_tConst.GameLayerCfg.TipsLayer.id,
                          "SHOW_NORMAL_TIP",
                          { tipMsg: "\u62a5\u540d\u6210\u529f", showTime: 2 },
                        );
                      else if (
                        t.resultCode == g_tConst.MatchApplyResultCode.APPLY_GOODS_NOT_ENOUGH
                      ) {
                        var i = e.checkSignUpFailFunc(t.matchID);
                        console.log(" checkSignUpFailFunc goodInfo = ", i);
                        var a = i.needAddNum;
                        1 == i.goodType
                          ? g_oData
                              .get(g_tData.mod_ZFLogic)
                              .handleBalanceCoinStateOfMatch({ balanceCoin: a })
                          : 2 == i.goodType &&
                            (g_oLayerManager.emitEvent2Dlg(
                              g_tConst.GameLayerCfg.MatchGoodsBox.id,
                              "MatchGoodsBox_SpecialProps",
                              { addEggNum: a, payScene: g_tConst.PaySceneId.payMatchGoodsBoxType },
                            ),
                            g_oLayerManager.emitEvent2Dlg(
                              g_tConst.GameLayerCfg.TipsLayer.id,
                              "SHOW_NORMAL_TIP",
                              {
                                tipMsg:
                                  "\u91d1\u86cb\u4e0d\u8db3\uff0c\u8fdb\u573a\u5931\u8d25\uff0c\u8bf7\u8865\u5145\u91d1\u86cb",
                                showTime: 2,
                              },
                            ));
                      } else
                        t.resultCode == g_tConst.MatchApplyResultCode.APPLY_ERROR
                          ? g_oLayerManager.emitEvent2Dlg(
                              g_tConst.GameLayerCfg.TipsLayer.id,
                              "SHOW_NORMAL_TIP",
                              {
                                tipMsg:
                                  "\u62a5\u540d\u5931\u8d25\uff0c\u8bf7\u91cd\u65b0\u62a5\u540d",
                                showTime: 2,
                              },
                            )
                          : t.resultCode == g_tConst.MatchApplyResultCode.APPLY_REPEAT &&
                            g_oLayerManager.emitEvent2Dlg(
                              g_tConst.GameLayerCfg.TipsLayer.id,
                              "SHOW_NORMAL_TIP",
                              {
                                tipMsg:
                                  "\u91cd\u590d\u62a5\u540d\u4e86\uff0c\u8bf7\u7a0d\u7b49\u5339\u914d",
                                showTime: 2,
                              },
                            );
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.MATCH_ARCHIVES_INFO_CHECK_SUCCESS,
                    function () {
                      (e.setUseMatchCfg(), e.updateItemListInfo());
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.MATCH_RSP_SEND_JIN_DAN,
                    function (t) {
                      t && 1 === t.code && ((e._isNeedLead = !0), e.showFingerFirstItem());
                    },
                    this,
                  ),
                ));
            },
            onInit: function (e) {
              (g_oData.get(g_tData.MatchMod).reqSendJinDan(),
                e &&
                  e.needLead &&
                  ((this._isNeedLead = !0), (this._IsNeedReportActionFormMlv = !0)),
                e &&
                  e.matchSingleType &&
                  g_oData.get(g_tData.MatchMod).setMatchSingleType(e.matchSingleType),
                g_oData
                  .get(g_tData.HistoryMod)
                  .record(
                    g_tConst.HistoryRecordLayer.MatchSelect,
                    g_tConst.GameLayerCfg.MatchSelect.id,
                    "MatchSelect_Init",
                    e,
                  ),
                g_oData.get(g_tData.MatchMod).reqGetMatchPlayerNum(),
                g_oData.get(g_tData.MatchMod).reqUserMatchRecordInfo(),
                g_oData.get(g_tData.MatchMod).reqUserArchivesInfo(),
                this.setUseMatchCfg(),
                this.updateItemListInfo());
            },
            initUi: function () {
              (g_oPrefabLoader.loadRes(
                g_tAsset.GoldEggNumPrefab,
                this.GoldEggNumRoot,
                function (e) {
                  e.emit("SHOW_ADD_COIN_BTN", !0);
                },
              ),
                g_oPrefabLoader.loadRes(g_tAsset.FuCardNumPrefab, this.FuCardNumRoot, function (e) {
                  e.emit("SHOW_ADD_COIN_BTN", !0);
                }));
            },
            updateItemListInfo: function () {
              var e = this;
              if (this._MatchItemList.length === this._useMatchCfgArr.length)
                this._MatchItemList.forEach(function (t, i) {
                  t.getComponent("MatchSelectItem").updateItemInfo(e._useMatchCfgArr[i]);
                });
              else {
                ((this._MatchItemList = []), this.ListContent.removeAllChildren());
                var t = this.ItemTipListQ.length;
                t =
                  this.mPlayType == g_tConst.MatchType.Normal
                    ? this.ItemBgList.length >= this.ItemTipListQ.length
                      ? this.ItemBgList.length
                      : this.ItemTipListQ.length
                    : this.mPlayType == g_tConst.MatchType.NormalXlhz
                      ? this.ItemBgList2.length >= this.ItemTipListQ.length
                        ? this.ItemBgList2.length
                        : this.ItemTipListQ.length
                      : this.ItemBgList.length >= this.ItemTipListQ.length
                        ? this.ItemBgList.length
                        : this.ItemTipListQ.length;
                for (var i = 0; i < this._useMatchCfgArr.length; i++) {
                  var a = this._useMatchCfgArr[i],
                    o = g_oPrefabLoader.instantiate(this.BaseItemPrefab, this.ListContent);
                  this._MatchItemList.push(o);
                  var n = i % t,
                    s = this.ItemBgList[n];
                  s =
                    this.mPlayType == g_tConst.MatchType.Normal
                      ? this.ItemBgList[n] || null
                      : this.mPlayType == g_tConst.MatchType.NormalXlhz
                        ? this.ItemBgList2[n] || null
                        : this.ItemBgList[n] || null;
                  var r = this.ItemTipListQ[n] || null;
                  o.getComponent("MatchSelectItem").initItemData(a, s, r, function (t) {
                    e.clickSelectItem(t);
                  });
                }
              }
              this.updatePlayerNumFunc();
            },
            clickSelectItem: function (e) {
              console.log(" clickSelectItem nItemInfo = ", e);
              var t = cc.instantiate(this.SignUpInstructionPrefab);
              this.node.addChild(t);
              var i = t.getComponent("MatchSignUpDetailsView"),
                a = {
                  rafKey: this._IsNeedReportActionFormMlv,
                  ShowTypeEnum: g_tConst.MatchSignUpShowTypeEnum.SinglePlay,
                };
              i.onInit(e, a);
            },
            checkSignUpFailFunc: function (e) {
              var t = 0,
                i = null,
                a = ((
                  (
                    this._useMatchCfgArr.find(function (t) {
                      return !isNull(t.itemCfg) && t.itemCfg.matchID === e;
                    }) || {}
                  ).itemCfg || {}
                ).applyGoods || [])[0];
              if (a)
                if (a.type == g_tConst.GameConfig.ItemType.GoldCard) {
                  var n = o.Long2Number(g_oData.get(g_tData.sdkUser).coin),
                    s = isNull(a.bigNum) ? o.Long2Number(a.num) : o.Long2Number(a.bigNum);
                  ((t = s - n),
                    console.log(" checkSignUpFailFunc applyGoods myCoinNum = ", a, n, s, t),
                    (i = 1));
                } else if (
                  a.type == g_tConst.GameConfig.ItemType.CSFare &&
                  a.subType == g_tConst.MatchGoods.GoldEgg
                ) {
                  var r = a.num,
                    c = g_oData.get(g_tData.mod_GameItem).getItemNum(g_tConst.MatchGoods.GoldEgg);
                  ((t = r - c),
                    console.log(" checkSignUpFailFunc applyGoods myEggNum = ", a, c, r, t),
                    (i = 2));
                }
              return { needAddNum: t, goodType: i };
            },
            onClickCloseView: function () {
              ((this._ShowAnimation = !1),
                g_oData.get(g_tData.HistoryMod).dismiss(g_tConst.HistoryRecordLayer.MatchSelect),
                this.close());
            },
            onClickMatchShopBtn: function () {
              g_oLayerManager.emitEvent2Dlg(
                g_tConst.GameLayerCfg.MatchShop.id,
                "MatchShop_Init",
                null,
              );
            },
            setNodeAnimation: function () {
              var e = this;
              if (1 != this._ShowAnimation) {
                ((this._ShowAnimation = !0), (this.ScreenMask.active = !0));
                var t = cc.view.getDesignResolutionSize(),
                  i = 0.5 * t.height,
                  a = 0.5 * t.width,
                  o = cc.v2(0, i),
                  n = this.TopNode.height + i + 20;
                this.TopNode.y = n;
                var s = cc.v2(0, 0),
                  r = 0.5 * this.MainNode.width + a + 20;
                this.MainNode.x = r;
                var c = this._ShowTime;
                (this.setNodeShowAnimation(
                  this.TopNode,
                  o,
                  function () {
                    ((e.ScreenMask.active = !1), (e._ShowAnimation = !1));
                  },
                  c,
                  0.01,
                  !1,
                ),
                  this.setNodeShowAnimation(
                    this.MainNode,
                    s,
                    function () {
                      ((e.ScreenMask.active = !1),
                        (e._ShowAnimation = !1),
                        e.showFingerFirstItem());
                    },
                    c,
                    0.01,
                    !1,
                  ));
              }
            },
            setNodeShowAnimation: function (e, t, i, a, o, n) {
              (void 0 === i && (i = null),
                void 0 === a && (a = 0.2),
                void 0 === o && (o = 0),
                void 0 === n && (n = !0),
                n && e.setScale(0.8));
              var s = cc.moveTo(a, t).easing(cc.easeQuarticActionOut(a)),
                r = cc.scaleTo(0.15, 1, 1),
                c = cc.spawn(s, r),
                l = cc.callFunc(
                  function () {
                    i && i();
                  }.bind(this),
                ),
                g = cc.sequence(c, l);
              o > 0
                ? this.scheduleOnce(function () {
                    e.runAction(g);
                  }, o)
                : e.runAction(g);
            },
            updatePlayerNumFunc: function () {
              var e = g_oData.get(g_tData.MatchMod).getMatchPlayerNumArr();
              if (this._MatchItemList.length > 0 && e.length > 0) {
                console.log("updatePlayerNumFunc playerNumArr = ", e);
                for (var t = 0; t < this._MatchItemList.length; t++)
                  this._MatchItemList[t].emit("update_plyer_num", e);
              }
            },
            getMatchModType: function () {
              return (
                isNull(this.matchModType) &&
                  (this.matchModType = g_oData.get(g_tData.MatchMod).getMatchSingleType()),
                this.matchModType
              );
            },
            getMatchPlayType: function () {
              if (isNull(this.mPlayType)) {
                var e = this.getMatchModType();
                e == g_tConst.MatchSingleType.XZDD
                  ? ((this.mPlayType = g_tConst.MatchType.Normal), (this.MatchShopNode.active = !0))
                  : e == g_tConst.MatchSingleType.XLHZ &&
                    ((this.mPlayType = g_tConst.MatchType.NormalXlhz),
                    (this.MatchShopNode.active = !1));
              }
              return this.mPlayType;
            },
            setUseMatchCfg: function () {
              var e = this,
                t = [],
                i =
                  g_oData.get(g_tData.SwitchModel).getMjMatchTypeCfg(this.getMatchPlayType()) || [];
              (console.log(
                "max147222 this.matchModType this.mPlayType matchTypeCfg = ",
                this.matchModType,
                this.mPlayType,
                i,
              ),
                i.forEach(function (i, a) {
                  if (
                    (console.log("max147222 forEach index typeCfg = ", a, i),
                    !isNull(i.matchID) && i.matchID.length > 0)
                  ) {
                    for (var o = 0; o < i.matchID.length; ) {
                      var n = i.matchID[o];
                      if (!isNull(g_oData.get(g_tData.MatchMod).getUserNewArchivesInfoByMatchId(n)))
                        break;
                      o++;
                    }
                    var s = null,
                      r = null;
                    (o < i.matchID.length &&
                      ((s = i.matchID[o]),
                      (r = g_oData.get(g_tData.MatchMod).getMatchCfgByMatchID(s))),
                      isNull(r) &&
                        i.matchID.find(function (e, t) {
                          if (t != o)
                            return (
                              (r = g_oData.get(g_tData.MatchMod).getMatchCfgByMatchID(e)),
                              !isNull(r)
                            );
                        }),
                      isNull(r) ||
                        (console.log("max147222 forEach matchCfg = ", r),
                        t.push({ itemCfg: r, textCfg: i, itemIdx: a, itemPlayType: e.mPlayType })));
                  }
                }),
                console.log(" updateItemListInfo useMatchCfgArr = ", t),
                (this._useMatchCfgArr = t));
            },
            showFingerFirstItem: function () {
              this.showFinger(this._MatchItemList[0]);
            },
            showFinger: function (e) {
              var t = this;
              if (this._isNeedLead && cc.isValid(e)) {
                var i = function () {
                  var i = e.convertToWorldSpaceAR(cc.v2(0, 0)),
                    a = t.node.convertToNodeSpaceAR(i);
                  ((t._nodeFinger.position = a.add(cc.v2(15, -30))),
                    (t._nodeFinger.zIndex = Number.MAX_SAFE_INTEGER),
                    (t._nodeFinger.active = !0));
                };
                cc.isValid(this._nodeFinger)
                  ? i()
                  : g_oPrefabLoader.loadRes(
                      g_tAsset.MatchSelectLeadFinger,
                      this.node,
                      function (e) {
                        if (cc.isValid(t.node) && cc.isValid(e)) {
                          t._nodeFinger = e;
                          var a = e.getComponent(cc.Animation);
                          (cc.isValid(a) && a._clips[0] && a.play(a._clips[0].name), i());
                        }
                      },
                    );
              } else cc.isValid(this._nodeFinger) && (this._nodeFinger.active = !1);
            },
            close: function () {
              ((this._IsNeedReportActionFormMlv = !1),
                this._super(),
                a.getPopList().length > 0
                  ? g_oEvent.dispatchEvent(g_tEvent.START_OTHER_LIST_ANIMATION)
                  : g_oEvent.dispatchEvent(g_tEvent.START_MAIN_LIST_ANIMATION));
            },
          }),
          cc._RF.pop());
      },
      {
        CommonPlat: "CommonPlat",
        CommonUtils: "CommonUtils",
        PopDlgBaseView: "PopDlgBaseView",
        PopDlgCtrl: "PopDlgCtrl",
      },
    ],
