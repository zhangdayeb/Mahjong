    RuleViewCtrl: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "26a751tDjlF573hkXFGauAg", "RuleViewCtrl"),
          (t.exports = {
            createDlg: function (e, t) {
              g_oPrefabLoader.loadResWithLoading(
                g_tAsset.prefabRule,
                t,
                function (t) {
                  void 0 !== e && e(t);
                },
                g_oEnvMgr.Env,
              );
            },
          }),
          cc.Class({ extends: Cls_BaseCtrl, properties: {}, start: function () {} }),
          cc._RF.pop());
      },
      {},
    ],
