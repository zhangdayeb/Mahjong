    hall_SetView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "d1c84ZRWQlBtpmDy8Q04wRs", "hall_SetView");
        var i = e("SoundLanguages"),
          a = e("AlertDlgBaseView"),
          o = e("CommonUtils"),
          n = e("CommonPlat"),
          s =
            (e("GameDeskDefine"),
            {
              enable: new cc.Color().fromHEX("#A15F38"),
              disable: new cc.Color().fromHEX("#A3A3A3"),
            });
        (cc.Class({
          extends: a,
          properties: {
            nodeMusic: cc.Node,
            nodeSound: cc.Node,
            nodeLocal: cc.Node,
            nodeVibrate: cc.Node,
            nodeDelCount: cc.Node,
            nodeVFX: cc.Node,
            nodeHighPower: cc.Node,
            nodeLocalDisableButton: cc.Node,
            nodeVibrateDisableButton: cc.Node,
            spfCheckOn: cc.SpriteFrame,
            spfCheckOff: cc.SpriteFrame,
            lab_version: cc.Label,
            nodeHand: cc.Node,
            sanGuoTable: cc.Node,
            policy: cc.Node,
          },
          Awake: function () {
            this.onMessageEvent();
          },
          start: function () {
            (this._super(),
              g_oSceneMgr.canvas.name === g_tConst.SceneCfgs.game && (this.policy.active = !1));
            var t = g_oPlatform.getGameVersion();
            ((t = format("{0}.{1}.{2}", t.substr(0, 1), t.substr(1, 2), t.substr(3, 3))),
              (this.lab_version.string = "v." + t),
              (this._tUserSetInfo = {}),
              (this._tUserSetInfo.isOpenLocal = !0),
              (this._tUserSetInfo.isOpenMusic = !0),
              (this._tUserSetInfo.isOpenSound = !0),
              (this._tUserSetInfo.isVibrate = !0),
              (this._tUserSetInfo.isVoiceOrder = !0),
              (this._tUserSetInfo.isHighPower = !0),
              (this._tUserSetInfo.isOpenVFX = !1),
              (this._tUserSetInfo.curGameDesk = 0),
              (this._tUserSetInfo.isOpenHand = !0),
              (this._tUserSetInfo.isSanGuoTable = g_tConst.Set_SGLocalDefine));
            var a = cc.sys.localStorage.getItem("USER_SET_INFO"),
              o = {};
            ("" != a && null != a && null != a && (o = JSON.parse(a)),
              o && this.sysByConfg(this._tUserSetInfo, o),
              g_oSceneMgr.canvas.name === g_tConst.SceneCfgs.game
                ? (e(g_tCtrl.LanguageSoundCtrl).getLanguageCfg()[1] === i.StandradChinese &&
                    this.disableLocal(),
                  MJ.GameLogic.TableModel.IsDiyRoom() || this.disableVibrate())
                : this.disableVibrate(),
              this.initSetLayer());
          },
          onMessageEvent: function () {
            this.autoDispose(
              g_oEvent.addEventListener(
                g_tEvent.CURR_RESULT_STATE,
                function () {
                  this.close();
                },
                this,
              ),
            );
          },
          disableLocal: function () {
            ((this.nodeLocal.getComponentInChildren(cc.Button).interactable = !1),
              (this.nodeLocal.getComponentInChildren(cc.Label).node.color = s.disable),
              (this.nodeLocal.getComponentInChildren("ui_ButtonSound").enable = !1),
              (this.nodeLocalDisableButton.active = !0));
          },
          disableVibrate: function () {
            ((this.nodeVibrate.getComponentInChildren(cc.Button).interactable = !1),
              (this.nodeVibrate.getComponentInChildren(cc.Label).node.color = s.disable),
              (this.nodeVibrate.getComponentInChildren("ui_ButtonSound").enable = !1),
              (this.nodeVibrateDisableButton.active = !0));
          },
          onClickClose: function () {
            this.close();
          },
          sysByConfg: function (e, t) {
            ((null == t.isOpenSound && null == t.isOpenSound) || (e.isOpenSound = t.isOpenSound),
              (null == t.isOpenMusic && null == t.isOpenMusic) || (e.isOpenMusic = t.isOpenMusic),
              (null == t.isOpenLocal && null == t.isOpenLocal) || (e.isOpenLocal = t.isOpenLocal),
              (null == t.isVibrate && null == t.isVibrate) || (e.isVibrate = t.isVibrate),
              (null == t.isVoiceOrder && null == t.isVoiceOrder) ||
                (e.isVoiceOrder = t.isVoiceOrder),
              (null == t.isHighPower && null == t.isHighPower) || (e.isHighPower = t.isHighPower),
              (null == t.isOpenVFX && null == t.isOpenVFX) || (e.isOpenVFX = t.isOpenVFX),
              (null == t.curGameDesk && null == t.curGameDesk) || (e.curGameDesk = t.curGameDesk),
              (null == t.isOpenHand && null == t.isOpenHand) || (e.isOpenHand = t.isOpenHand),
              (null == t.isSanGuoTable && null == t.isSanGuoTable) ||
                (e.isSanGuoTable = t.isSanGuoTable));
          },
          onClickedSound: function () {
            ((this._tUserSetInfo.isOpenSound = !this._tUserSetInfo.isOpenSound),
              g_oAudioMgr.setVoiceVolume(
                this._tUserSetInfo.isOpenSound ? g_tConst.maxVoiceVolume : 0,
              ),
              this.updateCheckBox(
                this.nodeSound.getComponentInChildren(cc.Button).node,
                this._tUserSetInfo.isOpenSound,
              ),
              cc.sys.localStorage.setItem("USER_SET_INFO", JSON.stringify(this._tUserSetInfo)));
          },
          onClickedMusic: function () {
            ((this._tUserSetInfo.isOpenMusic = !this._tUserSetInfo.isOpenMusic),
              g_oAudioMgr.setBgVolume(this._tUserSetInfo.isOpenMusic ? g_tConst.maxBgVolume : 0),
              this.updateCheckBox(
                this.nodeMusic.getComponentInChildren(cc.Button).node,
                this._tUserSetInfo.isOpenMusic,
              ),
              cc.sys.localStorage.setItem("USER_SET_INFO", JSON.stringify(this._tUserSetInfo)));
          },
          onClickedLocal: function () {
            ((this._tUserSetInfo.isOpenLocal = !this._tUserSetInfo.isOpenLocal),
              this.updateCheckBox(
                this.nodeLocal.getComponentInChildren(cc.Button).node,
                this._tUserSetInfo.isOpenLocal,
              ),
              cc.sys.localStorage.setItem("USER_SET_INFO", JSON.stringify(this._tUserSetInfo)),
              g_oEvent.dispatchEvent(g_tEvent.SET_SWITCH_LAN),
              this._tUserSetInfo.isOpenLocal &&
                g_oPlatform.doAction(
                  g_tConst.tPlatActionId.actionShowToast,
                  "\u76ee\u524d\u4ec5\u652f\u6301\u56db\u5ddd\u53ca\u676d\u5dde\u73a9\u6cd5\u7684\u65b9\u8a00",
                ));
          },
          onClickedVibrate: function () {
            ((this._tUserSetInfo.isVibrate = !this._tUserSetInfo.isVibrate),
              this.updateCheckBox(
                this.nodeVibrate.getComponentInChildren(cc.Button).node,
                this._tUserSetInfo.isVibrate,
              ),
              cc.sys.localStorage.setItem("USER_SET_INFO", JSON.stringify(this._tUserSetInfo)));
            var e = new cc.Event.EventCustom("SET_VIBRATE_CHANGE", !0);
            this.node.dispatchEvent(e);
          },
          onClickedHand: function () {
            var e = this,
              t = function (t) {
                ((e._tUserSetInfo.isOpenHand = t),
                  e.nodeHand &&
                    e.updateCheckBox(
                      e.nodeHand.getComponentInChildren(cc.Button).node,
                      e._tUserSetInfo.isOpenHand,
                    ),
                  cc.sys.localStorage.setItem("USER_SET_INFO", JSON.stringify(e._tUserSetInfo)));
              };
            this._tUserSetInfo.isOpenHand
              ? t(!1)
              : g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Alert.id, "ON_INIT", {
                  data: {
                    title: "\u63d0\u793a",
                    value:
                      "\u624b\u52bf\u7279\u6548\u975e\u5e38\u70ab\u9177\uff0c\u56e0\u6b64\u5bf9\u624b\u673a\u6027\u80fd\u8981\u6c42\u8f83\u9ad8\u3002\u5982\u679c\u60a8\u7684\u624b\u673a\u8f83\u4e3a\u5361\u987f\uff0c\u53ef\u80fd\u4f1a\u5bfc\u81f4\u6e38\u620f\u4f53\u9a8c\u53d7\u5230\u5f71\u54cd\uff0c\u8bf7\u914c\u60c5\u9009\u62e9\u3002",
                    type: 0,
                    ok: function () {
                      (t(!0),
                        g_oPlatform.doAction(
                          g_tConst.tPlatActionId.actionShowToast,
                          "\u60a8\u5df2\u6253\u5f00\u624b\u52bf\u7279\u6548\uff0c\u5feb\u53bb\u5bf9\u5c40\u4f53\u9a8c\u5427",
                        ));
                    },
                    okText: "\u5f00\u542f\u7279\u6548",
                    cancel: function () {},
                    cancelText: "\u4e0d\u5f00\u542f",
                  },
                });
          },
          onClickedSanGuoTable: function () {
            var e = this,
              t = function (t) {
                ((e._tUserSetInfo.isSanGuoTable = t),
                  e.sanGuoTable &&
                    e.updateCheckBox(
                      e.sanGuoTable.getComponentInChildren(cc.Button).node,
                      e._tUserSetInfo.isSanGuoTable,
                    ),
                  cc.sys.localStorage.setItem("USER_SET_INFO", JSON.stringify(e._tUserSetInfo)));
              };
            (this._tUserSetInfo.isSanGuoTable ? t(!1) : t(!0),
              g_oEvent.dispatchEvent(g_tEvent.USE_SANGUO_TABLE));
          },
          onClickSwitchVFX: function () {
            var e = this,
              t = this,
              i = function (e) {
                ((t._tUserSetInfo.isOpenVFX = e),
                  t.updateCheckBox(
                    t.nodeVFX.getComponentInChildren(cc.Button).node,
                    t._tUserSetInfo.isOpenVFX,
                  ),
                  cc.sys.localStorage.setItem("USER_SET_INFO", JSON.stringify(t._tUserSetInfo)));
              };
            this._tUserSetInfo.isOpenVFX
              ? (i(!1), this._report("CloseVFX"))
              : g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Alert.id, "ON_INIT", {
                  data: {
                    title: "\u63d0\u793a",
                    value:
                      "\u80e1\u724c\u7279\u6548\u975e\u5e38\u70ab\u9177\uff0c\u56e0\u6b64\u5bf9\u624b\u673a\u6027\u80fd\u8981\u6c42\u8f83\u9ad8\u3002\u5982\u679c\u60a8\u7684\u624b\u673a\u8f83\u4e3a\u5361\u987f\uff0c\u53ef\u80fd\u4f1a\u5bfc\u81f4\u6e38\u620f\u4f53\u9a8c\u53d7\u5230\u5f71\u54cd\uff0c\u8bf7\u914c\u60c5\u9009\u62e9\u3002",
                    type: 0,
                    ok: function () {
                      (i(!0),
                        g_oPlatform.doAction(
                          g_tConst.tPlatActionId.actionShowToast,
                          "\u60a8\u5df2\u6253\u5f00\u80e1\u724c\u7279\u6548\uff0c\u5feb\u53bb\u5bf9\u5c40\u4f53\u9a8c\u5427",
                        ),
                        e._report("OpenVFX"));
                    },
                    okText: "\u5f00\u542f\u7279\u6548",
                    cancel: function () {},
                    cancelText: "\u4e0d\u5f00\u542f",
                  },
                });
          },
          onClickedHighPower: function () {
            ((this._tUserSetInfo.isHighPower = !this._tUserSetInfo.isHighPower),
              this.updateCheckBox(
                this.nodeHighPower.getComponentInChildren(cc.Button).node,
                !this._tUserSetInfo.isHighPower,
              ),
              cc.sys.localStorage.setItem("USER_SET_INFO", JSON.stringify(this._tUserSetInfo)),
              cc.game.setFrameRate(this._tUserSetInfo.isHighPower ? 60 : 30));
          },
          onClickedDisabled: function () {
            g_oPlatform.doAction(
              g_tConst.tPlatActionId.actionShowToast,
              "\u8be5\u5f00\u5173\u5728\u672c\u60c5\u666f\u4e2d\u65e0\u6548",
            );
          },
          onClickedPrivacyPolicy: function () {
            (ZGSDK.showPrivacyAgreement(), this.onClickClose());
          },
          onClickedUserContract: function () {
            (ZGSDK.showUserAgreement(), this.onClickClose());
          },
          onClickedChildProtect: function () {
            (ZGSDK.showAgreement(3), this.onClickClose());
          },
          onClickZhuxiao: function () {
            var e = this;
            g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Alert.id, "ON_INIT", {
              data: {
                value:
                  "\u6ce8\u9500\u8d26\u53f7\u5c06\u9500\u6bc1\u8d26\u53f7\u4e14\u65e0\u6cd5\u8fd8\u539f\uff0c\u786e\u8ba4\u662f\u5426\u6ce8\u9500\uff1f",
                okText: "\u786e\u8ba4\u6ce8\u9500",
                cancelText: "\u8fd4\u56de\u6e38\u620f",
                type: 0,
                ok: function () {
                  setTimeout(function () {
                    g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.Alert.id, "ON_INIT", {
                      data: {
                        value:
                          "\u8bf7\u77e5\u6089\uff1a\u6b64\u529f\u80fd\u65e0\u6cd5\u5207\u6362\u8d26\u53f7\uff0c\u6ce8\u9500\u540e\u4e0d\u53ef\u6e38\u620f\u3002\n<color=#FF0000>\u8bf7\u8c28\u614e\u786e\u8ba4\uff0c\u540e\u679c\u81ea\u8d1f\uff01\uff01\uff01</c>",
                        okText: "\u786e\u8ba4\u6ce8\u9500",
                        cancelText: "\u8fd4\u56de\u6e38\u620f",
                        type: 0,
                        ok: function () {
                          g_oPlatHelp.accountLogout();
                        },
                        cancel: function () {
                          e.close();
                        },
                      },
                    });
                  }, 100);
                },
                cancel: function () {
                  e.close();
                },
                okDontClose: !0,
              },
            });
          },
          updateCheckBox: function (e, t) {
            e.getComponent(cc.Sprite).spriteFrame = t ? this.spfCheckOn : this.spfCheckOff;
          },
          initSetLayer: function () {
            (this.updateCheckBox(
              this.nodeSound.getComponentInChildren(cc.Button).node,
              this._tUserSetInfo.isOpenSound,
            ),
              g_oAudioMgr.setVoiceVolume(
                this._tUserSetInfo.isOpenSound ? g_tConst.maxVoiceVolume : 0,
              ),
              this.updateCheckBox(
                this.nodeMusic.getComponentInChildren(cc.Button).node,
                this._tUserSetInfo.isOpenMusic,
              ),
              g_oAudioMgr.setBgVolume(this._tUserSetInfo.isOpenMusic ? g_tConst.maxBgVolume : 0),
              this.updateCheckBox(
                this.nodeLocal.getComponentInChildren(cc.Button).node,
                this._tUserSetInfo.isOpenLocal,
              ),
              this.updateCheckBox(
                this.nodeVibrate.getComponentInChildren(cc.Button).node,
                this._tUserSetInfo.isVibrate,
              ),
              this.updateCheckBox(
                this.nodeVFX.getComponentInChildren(cc.Button).node,
                this._tUserSetInfo.isOpenVFX,
              ),
              (this.nodeDelCount.active = n.canDelCount() && !o.isOnGameScene()),
              this.updateCheckBox(
                this.nodeHighPower.getComponentInChildren(cc.Button).node,
                !this._tUserSetInfo.isHighPower,
              ),
              this.nodeHand &&
                this.updateCheckBox(
                  this.nodeHand.getComponentInChildren(cc.Button).node,
                  this._tUserSetInfo.isOpenHand,
                ),
              this.sanGuoTable &&
                (o.isOnGameScene()
                  ? (this.sanGuoTable.active = !1)
                  : (this.sanGuoTable.active = !0),
                this.updateCheckBox(
                  this.sanGuoTable.getComponentInChildren(cc.Button).node,
                  this._tUserSetInfo.isSanGuoTable,
                )));
          },
          _report: function (e, t) {
            g_oData.get(g_tData.gameReportData).sendCustomEvent("Setting", e, t);
          },
        }),
          cc._RF.pop());
      },
      {
        AlertDlgBaseView: "AlertDlgBaseView",
        CommonPlat: "CommonPlat",
        CommonUtils: "CommonUtils",
        GameDeskDefine: "GameDeskDefine",
        SoundLanguages: "SoundLanguages",
      },
    ],
