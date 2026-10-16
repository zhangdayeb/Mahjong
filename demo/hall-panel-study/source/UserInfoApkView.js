    UserInfoApkView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "1b9adOkyKtAQrQVkWp+B0+x", "UserInfoApkView");
        var i = e("AlertDlgBaseView"),
          a = e("CommonUtils"),
          o = e("GameHelp");
        (cc.Class({
          extends: i,
          properties: {
            nodeMainPannel: cc.Node,
            lab_coin: cc.Label,
            lab_name: cc.Label,
            lab_id: cc.Label,
            lab_gameCount: cc.Label,
            lab_winRate: cc.Label,
            head_node: cc.Node,
            img_HeadFrame: cc.Sprite,
            MaCardHeadFrame: cc.Sprite,
            MJMPath_progress: cc.ProgressBar,
            lab_pro: cc.Label,
            lab_rank: cc.Label,
            img_MJPath: cc.Sprite,
            genderToggleContainer: cc.ToggleContainer,
            SectionInfoPrefab: cc.Prefab,
            SectionInfoPlaceholder: cc.Node,
          },
          Awake: function () {
            ((this.MaCardHeadFrame.node.active = !1), this.onCustomEvent(), this.onMessageEvent());
          },
          start: function () {
            (this._super(), this.initUI());
          },
          initUI: function () {
            var e = g_oData.get(g_tData.sdkUser);
            ((this.lab_coin.string = a.translateCoinStr(a.initProCoin(a.Long2Number(e.coin)))),
              (this.lab_name.string = e.nickName),
              (this.lab_id.string = e.userId),
              this.refreshGender());
            var t = e.gameInfo.win + e.gameInfo.equal + e.gameInfo.loss,
              i = 0;
            (0 !== t && (i = parseFloat((e.gameInfo.win / t) * 100).toFixed(2)),
              (this.lab_gameCount.string = t.toString()),
              (this.lab_winRate.string = i.toString() + "%"),
              g_oData
                .get(g_tData.comHead)
                .loadHead(g_oPlatform.getHeadUrl(), this.head_node.getComponent(cc.Sprite)));
            var o = g_oPrefabLoader.instantiate(
              this.SectionInfoPrefab,
              this.SectionInfoPlaceholder,
            );
            if (
              ((o.position = cc.v2(0, 0)),
              o.emit("INIT_USER_SECTION_ICON", {
                sectionInfo: g_oData.get(g_tData.SectionMatchMod).getMySectionInfo(),
              }),
              this.initPlayerHeadFrame(),
              g_oData.get(g_tData.SwitchModel).isCheckReferral() ||
                !g_oData.get(g_tData.MJMasterPathMod).mjMasterPathData ||
                !g_oData.get(g_tData.MJMasterPathMod).mjMasterPathData.isOpen)
            )
              return (
                (this.img_MJPath.node.active = !1),
                (this.lab_rank.node.active = !1),
                void (this.MJMPath_progress.node.active = !1)
              );
            ((this.img_MJPath.node.active = !0),
              (this.lab_rank.node.active = !0),
              (this.MJMPath_progress.node.active = !0),
              this.setRankSp(),
              this.setProgress());
          },
          setRankSp: function () {
            var e,
              t = g_oData.get(g_tData.MJMasterPathMod).mjMasterPathData.lv || 0;
            this.lab_rank.string = t;
            for (
              var i = g_oData.get(g_tData.MJMasterPathMod).getRankConfigs(), a = 0;
              a < i.length;
              a++
            ) {
              var o = i[a];
              if (((e = o), t <= o.maxLv)) break;
            }
            e &&
              ((this.lab_rank.node.getComponent(cc.LabelOutline).color = new cc.Color().fromHEX(
                e.outcolor,
              )),
              g_oData.get(g_tData.MJMasterPathMod).loadSp("s_" + e.rankIndex, this.img_MJPath));
          },
          setProgress: function () {
            var e,
              t = g_oData.get(g_tData.MJMasterPathMod).mjMasterPathData,
              i = g_oData.get(g_tData.MJMasterPathMod).mjMasterPathCfg,
              a = t.lv || 0,
              o = i.mjMasterPathLvCfg;
            e = o.length == a ? 1 : o[a].exp - (0 == a ? 0 : o[a - 1].exp);
            var n = t.exp || 0;
            ((n -= 0 == a ? 0 : o[a - 1].exp),
              (this.MJMPath_progress.progress = n / e),
              (this.lab_pro.string = n + "/" + e),
              o.length == a &&
                ((this.lab_pro.string = t.exp), (this.MJMPath_progress.progress = 1)));
          },
          initMjMPath: function () {
            g_oLayerManager.emitEvent2Dlg(
              g_tConst.GameLayerCfg.MJMasterPathMain.id,
              "ON_INIT",
              "Head",
            );
          },
          refreshGender: function () {
            var e = g_oData.get(g_tData.sdkUser),
              t = this.genderToggleContainer.toggleItems,
              i = 1 === e.gameGender ? 1 : 0;
            this.gender_index = i;
            for (var a = 0; a < t.length; a++) t[a].isChecked = i == a;
          },
          onClickGenderToggleContainer: function (e) {
            ("toggle_man" == e.node.name && 0 == this.gender_index) ||
              ("toggle_woman" == e.node.name && 1 == this.gender_index) ||
              (1 == this.gender_index ? this.onClickSetGenderWoMan() : this.onClickSetGenderMan());
          },
          onClickSetGenderMan: function () {
            var e = this;
            g_oData.get(g_tData.sdkUser).reqGameModifyGender(1, function (t) {
              t && e.refreshGender();
            });
          },
          onClickSetGenderWoMan: function () {
            var e = this;
            g_oData.get(g_tData.sdkUser).reqGameModifyGender(0, function (t) {
              t && e.refreshGender();
            });
          },
          initPlayerHeadFrame: function () {
            this.img_HeadFrame.node.active = !1;
            var e = g_oData.get(g_tData.mod_Bag).getCurUseId(g_tConst.ServerBagType.HeadFrame);
            g_oData.get(g_tData.comHeadFrame).loadHeadFrameWithCurUse(this.img_HeadFrame, e);
          },
          onClickClose: function () {
            (this.close(), this.showInterstitialStaticAd());
          },
          onDestroy: function () {
            (o.offHelp(), this._super());
          },
          onClickExchange: function () {
            (cc.sys.localStorage.setItem("login", ""),
              g_oPlatform.switchAccount(),
              g_oSceneMgr.loadScene("login_" + g_tConst.MJ_BODY_TYPE[g_oMjProject.MjBodyType]));
          },
          showInterstitialStaticAd: function () {
            var e = {
              Scene: g_tConst.ShareConfig.ShareScene.hall,
              Module: g_tConst.ShareConfig.ShareModule.SeeVideo,
              SubModule: g_tConst.ShareConfig.ShareSubModule.SeeVideo,
              AdScene: g_tConst.InterstitialStaticPID.ClosePannel,
            };
            g_oAdManager.doSeeAd(g_tConst.eADType.InterstitialStaticAd, e.AdScene, e);
          },
          onCustomEvent: function () {},
          onMessageEvent: function () {
            (this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.SDK_USER_INFO_CHG,
                function () {
                  (g_oData.get(g_tData.sdkUser), this.initUI());
                },
                this,
              ),
            ),
              this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.SDK_NOTIFY_USER_INFO,
                  function () {
                    (g_oData.get(g_tData.sdkUser), this.initUI());
                  },
                  this,
                ),
              ));
          },
        }),
          cc._RF.pop());
      },
      { AlertDlgBaseView: "AlertDlgBaseView", CommonUtils: "CommonUtils", GameHelp: "GameHelp" },
    ],
