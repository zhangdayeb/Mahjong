    SGMJGuideCtrl: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "dbfbekqeUlGLo8OsiA3Kdxr", "SGMJGuideCtrl"),
          (t.exports = {
            createDlg: function (e, t) {
              g_oPrefabLoader.loadResWithLoading(
                g_tAsset.SGMJGuidePrefab,
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
