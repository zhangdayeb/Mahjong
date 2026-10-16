    KeepStayCtrl: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "3885bV0n1lEFKzoqbEU8MvT", "KeepStayCtrl"),
          (t.exports = {
            createDlg: function (e, t) {
              g_oPrefabLoader.loadResWithLoading(
                g_tAsset.KeepStayPrefab,
                t,
                function (t) {
                  void 0 !== e && e(t);
                },
                g_oEnvMgr.Env,
              );
            },
          }),
          cc.Class({ extends: Cls_BaseCtrl, properties: {} }),
          cc._RF.pop());
      },
      {},
    ],
