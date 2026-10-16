    SanGuoTableUICtrl: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "f84ac7ComhCiLXCTouyiP1B", "SanGuoTableUICtrl"),
          (t.exports = {
            createLayer: function (e, t) {
              var i = cc.sys.localStorage.getItem("USER_SET_INFO"),
                a = {};
              ("" != i && null != i && null != i && (a = JSON.parse(i)),
                (null != a.isSanGuoTable && null != a.isSanGuoTable) ||
                  (a.isSanGuoTable = g_tConst.Set_SGLocalDefine),
                a.isSanGuoTable
                  ? g_oPrefabLoader.loadRes(
                      g_tAsset.Table2DUI_SanGuo,
                      t,
                      function (t) {
                        void 0 !== e && e(t);
                      },
                      g_oEnvMgr.Env,
                    )
                  : void 0 !== e && e(null));
            },
          }),
          cc.Class({ extends: Cls_BaseCtrl, properties: {}, start: function () {} }),
          cc._RF.pop());
      },
      {},
    ],
