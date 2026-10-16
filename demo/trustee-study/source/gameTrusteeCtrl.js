    gameTrusteeCtrl: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "ee34bZqDIxA5oLIicCMq2E0", "gameTrusteeCtrl"),
          (t.exports = {
            createLayer: function (e, t) {
              g_oPrefabLoader.loadRes(
                g_tAsset.TrusteePrefab,
                t,
                function (t) {
                  void 0 !== e && e(t);
                },
                g_oEnvMgr.Env,
              );
            },
          }),
          cc.Class({
            extends: Cls_BaseCtrl,
            properties: { nodeTrustee: cc.Node },
            Awake: function () {
              (this.node.on(
                "TRUSTEE_CHANGE",
                function (e) {
                  var t = e,
                    i = t.nViewSeatId,
                    a = t.isTrustee;
                  i === g_tConst.GameConfig.ViewSeat.SeatMine &&
                    ((this.nodeTrustee.active = a), this.showStaticAd());
                },
                this,
              ),
                this.node.on(
                  "TRUSTEE_RESET",
                  function () {
                    this.nodeTrustee.active = !1;
                  },
                  this,
                ));
            },
            start: function () {},
            onClickCancle: function () {
              var e = new cc.Event.EventCustom("REQ_TRUSTEE_CHANGE", !0);
              this.node.dispatchEvent(e);
            },
            showStaticAd: function () {
              if (
                this.nodeTrustee.active &&
                (g_oSceneMgr.canvas.name !== g_tConst.SceneCfgs.game ||
                  !MJ.GameLogic.TableModel.IsDiyRoom())
              ) {
                var e = {
                  Scene: g_tConst.ShareConfig.ShareScene.game,
                  Module: g_tConst.ShareConfig.ShareModule.SeeVideo,
                  SubModule: g_tConst.ShareConfig.ShareSubModule.SeeVideo,
                  AdScene: g_tConst.InterstitialStaticPID.Trustee,
                  cbSuc: function () {
                    g_oData
                      .get(g_tData.mod_Share)
                      .getShareCntByLinkID(g_tConst.ShareConfig.ShareLinkId.TrusteeStaticAd) > 0 &&
                      g_oData
                        .get(g_tData.mod_Share)
                        .reqGPShareSuc(
                          g_tConst.ShareConfig.ShareLinkId.TrusteeStaticAd,
                          void 0,
                          void 0,
                          e.type,
                        );
                  },
                };
                g_oAdManager.doSeeAd(g_tConst.eADType.InterstitialStaticAd, e.AdScene, e);
              }
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
