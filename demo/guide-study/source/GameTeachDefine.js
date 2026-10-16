    GameTeachDefine: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "501bcV7iYVLrZ1f3lRT2f3b", "GameTeachDefine");
        var i = cc.Class({ extends: Cls_BaseDefine });
        ((i.prototype.tEvent = {
          NO_TABLE_TOOWN_CHAT: "NO_TABLE_TOOWN_CHAT",
          TEACH_CLICK: "TEACH_CLICK",
          TEACH_CHAGE_MASK: "TEACH_CHAGE_MASK",
          TEACH_CLICK_MASK: "TEACH_CLICK_MASK",
          NO_TABLE_TOOWN_FACE: "NO_TABLE_TOOWN_FACE",
          TEACH_CHAGE_BACK_MASK: "TEACH_CHAGE_BACK_MASK",
          TEACH_CHAGE_MASK_HSZ: "TEACH_CHAGE_MASK_HSZ",
          TEACH_REQ_OUT: "TEACH_REQ_OUT",
          INIT_GAME_TEACH: "INIT_GAME_TEACH",
          CLOSE_GAME_TEACH: "CLOSE_GAME_TEACH",
        }),
          (i.prototype.tConst = {
            teach_Players: [
              {
                userID: -1,
                nickName: "\u96c0\u795e\u4e36\u671b",
                viewSeatID: 1,
                headUrl: "1",
                isMingPai: !1,
                isReady: !0,
              },
              {
                userID: -2,
                nickName: "\u5931\u4e50\u56ed",
                viewSeatID: 2,
                headUrl: "2",
                isMingPai: !1,
                isReady: !0,
              },
              {
                userID: -3,
                nickName: "\u865a\u4f2a\u7684\u8868\u60c5",
                viewSeatID: 3,
                headUrl: "3",
                isMingPai: !1,
                isReady: !0,
              },
            ],
            teach_mHandTileValues: [
              [81, 81, 17, 17, 17, 18, 18, 18, 19, 19, 49, 51, 53, 56],
              [20, 20, 22, 22, 24, 24, 25, 25, 25, 51, 56, 56, 41],
              [21, 22, 24, 51, 52, 52, 53, 53, 55, 55, 56, 37, 38],
              [20, 21, 21, 21, 23, 24, 24, 51, 53, 53, 37, 37, 39],
            ],
            teach_showPai: [
              [17, 18, 19, 20, 21, 22, 23, 24, 25],
              [33, 34, 35, 36, 37, 38, 39, 40, 41],
              [49, 50, 51, 52, 53, 54, 55, 56, 57],
              [81, 81, 81, 81],
            ],
            teach_MjPathLv: { 1: 10, 2: 20, 3: 30 },
          }),
          (i.prototype.tCtrl = {}),
          (i.prototype.tAsset = {
            GameTeachView: "prefabs/game/GameTeach/GameTeachView",
            GameTeachPb: "static/proto/mjhj/PlayGuide.proto",
            GameTeachResult: "prefabs/game/GameTeach/GameTeachResult",
          }),
          (i.prototype.tData = { GameTeachMod: "GameTeachMod" }),
          cc._RF.pop());
      },
      {},
    ],
