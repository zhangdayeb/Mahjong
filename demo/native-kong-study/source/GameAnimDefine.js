    GameAnimDefine: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "259e6erMtxNKIdihv3vKXK5", "GameAnimDefine");
        var i = cc.Class({ extends: Cls_BaseDefine });
        ((i.prototype.tEvent = {
          FANXING_EFFECT_START: "FANXING_EFFECT_START",
          FANXING_EFFECT_END: "FANXING_EFFECT_END",
          PROTECTGIFT_EFFECT_START: "PROTECTGIFT_EFFECT_START",
        }),
          (i.prototype.tConst = {
            ePiaoFenDesc: { ChaDaJiao: 0, ChaHuaZhu: 1, TuiShui: 2 },
            OutTileAnimTime: { FlyTime: 0.26, BeforeOutTile: 0.5, FlyTimeDelay: 0.3 },
            eAnimTime: {
              GameEnd: { DelayShow: 1.2, KaiPai: 2, TotalTime: 2, LiuJu: 1.5 },
              TreasureDig: { Shou: 0.1, Result: 1.6, TotalTime: 1.9 },
            },
            OrderedAnimType: {
              Hu: { time: 1.03, haveFanXingEffect: 0.6 },
              ZiMo: { time: 1.12 },
              Ting: { time: 1.03 },
              Peng: { time: 1.13 },
              Chi: { time: 1.03 },
              Gang: { time: 1.03 },
              MingDan: { time: 1.13 },
              GuoDan: { time: 1.13 },
              Cha: { time: 1.03 },
              TongBao: { time: 1.13 },
              DuiBao: { time: 1.13 },
              MoBao: { time: 1.13 },
              GameEndPiaoFen: { time: 1 },
              GamingPiaoFen: { time: 0.82 },
              ProtectSmallAngle: { time: 1.75 },
              MingPai: { time: 1 },
              RascalKong: { time: 1.03 },
            },
            DaoEffectSceneCfg: {
              452: [{ fanNum: 9999, animName: "ex_yd999" }],
              453: [{ fanNum: 99999, animName: "ex_yd999" }],
              454: [{ fanNum: 999999, animName: "ex_yd999", shake: "ex_yd999", zoom: "ex_yd999" }],
              486: [{ fanNum: 29999, animName: "ex_hyz999" }],
              487: [{ fanNum: 499999, animName: "ex_hyz999" }],
              488: [
                { fanNum: 99999999, animName: "ex_hyz999", shake: "ex_yd999", zoom: "ex_yd999" },
              ],
              489: [{ fanNum: 1e8, animName: "ex_hyz999", shake: "ex_yd999", zoom: "ex_yd999" }],
              436: [{ fanNum: 29999, animName: "ex_hyz999" }],
              437: [{ fanNum: 499999, animName: "ex_hyz999" }],
              438: [{ fanNum: 9999999, animName: "ex_hyz999" }],
              439: [{ fanNum: 9999999, animName: "ex_hyz999" }],
              440: [{ fanNum: 1e8, animName: "ex_hyz999", shake: "ex_yd999", zoom: "ex_yd999" }],
            },
          }),
          (i.prototype.tCtrl = { DelayGameResultCtrl: "DelayGameResultCtrl" }),
          (i.prototype.tAsset = {
            GameAnimPrefab: "prefabs/game/GameAnimLayer/prefab/GameAnimLayer",
          }),
          (i.prototype.tData = {}),
          cc._RF.pop());
      },
      {},
    ],
