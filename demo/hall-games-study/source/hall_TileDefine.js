    hall_TileDefine: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "367f2DMqN9A7qF1BjT2IZMp", "hall_TileDefine");
        var i = cc.Enum({
            1: "\u70ed\u95e8\u73a9\u6cd5",
            2: "\u4e0d\u6d17\u724c",
            3: "\u65b0\u73a9\u6cd5",
            4: "\u70ed\u95e8\u5408\u96c6",
          }),
          a = cc.Enum({
            RECOMMEND_ONE: -1,
            RECOMMEND_TWO: -1,
            RECOMMEND_THREE: -1,
            RECOMMEND_FOUR: -1,
            RECOMMEND_FIVE: -1,
            RECOMMEND_SIX: -1,
            LOCAL_GAME_SET: -1,
            EXPORT_ONE: -1,
            EXPORT_TWO: -1,
            NONE: -1,
          });
        ((t.exports = {
          HallGameTypeName: {
            Common: { id: 0, Name: "", spellName: "" },
            Section: { id: 1, Name: "\u6392\u4f4d\u8d5b", spellName: "PAIWEISAI" },
            TwoVsTwo: { id: 2, Name: "\u8840\u6d412V2", spellName: "XUELIU2VS2" },
            XLhzTwoVsTwo: {
              id: 3,
              Name: "\u8840\u6d41\u7ea2\u4e2d2V2",
              spellName: "XUELIUHONGZHONG",
            },
            Match: { id: 4, Name: "\u9526\u6807\u8d5b", spellName: "JINGBIAOSAI" },
            MatchXzdd: { id: 5, Name: "\u9526\u6807\u8d5b", spellName: "JINGBIAOSAI" },
            MatchTwoVsTwo: { id: 6, Name: "2V2\u7ec4\u961f\u8d5b", spellName: "2VS2ZUDUISAI" },
            MatchFreeTable: { id: 7, Name: "\u81ea\u7531\u684c", spellName: "ZIYOUZHUO" },
            MatchXlhz: {
              id: 8,
              Name: "\u4ebf\u8c46\u4e89\u9738\u8d5b",
              spellName: "YIDOUZHENGBASAI",
            },
            Zjroom: { id: 9, Name: "\u597d\u53cb\u7ea6\u5c40", spellName: "HAOYOUYUEJU" },
            Xlhz: { id: 10, Name: "\u8840\u6d41\u7ea2\u4e2d", spellName: "XUELIUHONGZHONG" },
            Lzxl: { id: 11, Name: "\u765e\u5b50\u8840\u6d41", spellName: "LAIZIXUELIU" },
            LeagueMatch: { id: 14, Name: "\u96c0\u7fbd\u8054\u8d5b", spellName: "QUEYULIANSAI" },
          },
          HallTagType: i,
          HallTileType: a,
        }),
          cc._RF.pop());
      },
      {},
    ],
