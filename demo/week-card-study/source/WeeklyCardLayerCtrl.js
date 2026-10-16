    WeeklyCardLayerCtrl: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "78651YsC4FHIbIvLCkfMn3M", "WeeklyCardLayerCtrl"),
          (t.exports = {
            createDlg: function (e, t) {
              g_oData.get(g_tData.SwitchModel).getWeekCard().showNewWeeklyCard
                ? g_oPrefabLoader.loadResWithLoading(
                    g_tAsset.SlyderWeeklyCardPrefab,
                    t,
                    function (t) {
                      void 0 !== e && e(t);
                    },
                    g_oEnvMgr.Env,
                  )
                : g_oPrefabLoader.loadResWithLoading(
                    g_tAsset.WeeklyCardLayerPrefab,
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
            properties: {},
            Awake: function () {},
            start: function () {},
          }),
          cc._RF.pop());
      },
      {},
    ],
