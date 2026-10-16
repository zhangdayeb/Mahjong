    SESXGuideCtrl: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "98b496tLAJOnr5vtznBaCUJ", "SESXGuideCtrl"),
          (t.exports = {
            createDlg: function (e, t) {
              g_oPrefabLoader.loadResWithLoading(
                g_tAsset.SESXGuidePrefab,
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
