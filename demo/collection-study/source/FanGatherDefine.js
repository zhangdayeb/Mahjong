    FanGatherDefine: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "66851O/dSVD6L1BpFPjw1T1", "FanGatherDefine");
        var i = cc.Class({ extends: Cls_BaseDefine });
        ((i.prototype.tEvent = {
          REFRESH_FAN_GATHER_VIEW: "REFRESH_FAN_GATHER_VIEW",
          GET_FANXING_CARD_SET: "GET_FANXING_CARD_SET",
          DO_FANXING_CARD: "DO_FANXING_CARD",
          GET_TABLE_TYPES: "GET_TABLE_TYPES",
          NOTIFY_FANXING_CARD: "NOTIFY_FANXING_CARD",
          RECEIVE_AWARD: "RECEIVE_AWARD",
          RECEIVE_TIME: "RECEIVE_TIME",
          GET_CARD_INFO: "GET_CARD_INFO",
          SHOW_NEW_ICON: "SHOW_NEW_ICON",
        }),
          (i.prototype.tConst = {
            FanGatherCfg: {
              Debug: {
                lastAchieve: 8,
                curAchieve: 9,
                playAnimName: "ex_dasanyuan",
                previewNum: 15,
                maxParams: { fanTime: 999, fanWin: 100, maxFan: 999999999, maxGet: 99999999999999 },
              },
            },
            FanGatherGameTypeMap: { 893: 1, 898: 2, 866: 4, 911: 5 },
          }),
          (i.prototype.tCtrl = {}),
          (i.prototype.tAsset = {
            FanGatherEntry: "prefabs/hall/modules/FanGather/FanGatherEntry",
            FanGatherViewPrefab: "prefabs/hall/modules/FanGather/FanGatherView",
            FanGatherPb: "static/proto/mjhj/FanGather.proto",
          }),
          (i.prototype.tData = { FanGatherMod: "FanGatherMod" }),
          cc._RF.pop());
      },
      {},
    ],
