    MJMasterPathDefine: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "10ff1mRCLpPsqjvfSuxL+BB", "MJMasterPathDefine");
        var i = cc.Class({ extends: Cls_BaseDefine });
        ((i.prototype.tEvent = {
          UP_LV_MJ_PATH: "UP_LV_MJ_PATH",
          GET_MJ_PATH_DATA: "GET_MJ_PATH_DATA",
          MJ_PATH_WIN_LOSE: "MJ_PATH_WIN_LOSE",
          REFRESH_MJ_MASTER_PATH_RANK: "REFRESH_MJ_MASTER_PATH_RANK",
          CLOSE_MJ_MASTER_PATH_RANK: "CLOSE_MJ_MASTER_PATH_RANK",
        }),
          (i.prototype.tConst = {
            MJMPath_rankConfigs: [
              {
                maxLv: 5,
                rankIndex: 1,
                label: "\u521d\u9636\u96c0\u5c0a",
                color: "#8e4d1e",
                outcolor: "#a73b15",
              },
              {
                maxLv: 10,
                rankIndex: 2,
                label: "\u8d85\u51e1\u96c0\u5c0a",
                color: "#4B568C",
                outcolor: "#46506a",
              },
              {
                maxLv: 15,
                rankIndex: 3,
                label: "\u96c0\u738b",
                color: "#37469A",
                outcolor: "#3656a8",
              },
              {
                maxLv: 20,
                rankIndex: 4,
                label: "\u8d85\u51e1\u96c0\u738b",
                color: "#51259a",
                outcolor: "#956e12",
              },
              {
                maxLv: 25,
                rankIndex: 5,
                label: "\u96c0\u795e",
                color: "#936c12",
                outcolor: "#7622ac",
              },
              {
                maxLv: 30,
                rankIndex: 6,
                label: "\u8d85\u51e1\u96c0\u795e",
                color: "#8e591e",
                outcolor: "#bc7700",
              },
              {
                maxLv: 36,
                rankIndex: 7,
                label: "\u6700\u5f3a\u96c0\u795e",
                color: "#8e591e",
                outcolor: "#b41000",
              },
            ],
          }),
          (i.prototype.tCtrl = {}),
          (i.prototype.tAsset = {
            MJMasterPathPb: "static/proto/mjhj/MJMasterPath.proto",
            MJMasterPathMain: "prefabs/hall/modules/MJMasterPath/MJMasterPathMain",
            MJMasterPathRank: "prefabs/hall/modules/MJMasterPath/MJMasterPathRank",
            MJMasterPathShow: "prefabs/hall/modules/MJMasterPath/MJMasterPathShow",
            MJMasterPathRankEntry: "prefabs/hall/modules/MJMasterPath/MJMasterPathRankEntry",
            MJMASTER_PATH_ICON_PATH: "MJMasterPath/",
            AWARD_PATH: "awardIcon/",
          }),
          (i.prototype.tData = { MJMasterPathMod: "MJMasterPathMod" }),
          cc._RF.pop());
      },
      {},
    ],
