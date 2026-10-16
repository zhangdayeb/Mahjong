    ZMJTileDefine: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "72ecdrF7iRK2IU2oZmLBrst", "ZMJTileDefine");
        var i = cc.Class({ extends: Cls_BaseDefine });
        ((i.prototype.tEvent = { RESET_TILE_TYPE: "RESET_TILE_TYPE" }),
          (i.prototype.tConst = {
            eTileTag: {
              None: 0,
              KouTile: 1,
              GuiTile: 2,
              ChongFengJi: 3,
              ZeRenJi: 4,
              LaiZi: 5,
              LaiZiPi: 6,
              HunZi: 7,
              QueTile: 8,
              CaiShen: 9,
              LaiZi_R: 10,
            },
            handAnimConstList: {
              chupai: {
                id: "chupai",
                asset: {
                  0: "prefabs/3d/game/hand/girl_chupai",
                  1: "prefabs/3d/game/hand/boy_chupai",
                },
                funcName: "_playChupai",
                defaultTimeScale: 1,
              },
              chupai02: {
                id: "chupai2",
                asset: {
                  0: "prefabs/3d/game/hand/girl_chupai02",
                  1: "prefabs/3d/game/hand/boy_chupai02",
                },
                funcName: "_playChupai2",
                defaultTimeScale: 1.1,
              },
              cpg: {
                id: "cpg",
                asset: { 0: "prefabs/3d/game/hand/girl_cpg", 1: "prefabs/3d/game/hand/boy_cpg" },
                funcName: "_playCPG",
                defaultTimeScale: 1,
              },
              kaiji: {
                id: "kaiji",
                asset: {
                  0: "prefabs/3d/game/hand/girl_kaiji",
                  1: "prefabs/3d/game/hand/boy_kaiji",
                },
                funcName: "_playKaiji",
                defaultTimeScale: 1,
              },
              chapai: {
                id: "chapai",
                asset: {
                  0: "prefabs/3d/game/hand/girl_chapai",
                  1: "prefabs/3d/game/hand/boy_chapai",
                },
                funcName: "_playChaPai",
                defaultTimeScale: 1,
              },
              kaipai: {
                id: "kaipai",
                asset: {
                  0: "prefabs/3d/game/hand/girl_kaipai",
                  1: "prefabs/3d/game/hand/boy_kaipai",
                },
                funcName: "_playKaipai",
                defaultTimeScale: 1,
              },
              cuopai: {
                id: "cuopai",
                asset: {
                  0: "prefabs/3d/game/hand/girl_cuopai",
                  1: "prefabs/3d/game/hand/boy_cuopai",
                },
                funcName: "_playCuopai",
                defaultTimeScale: 1.2,
              },
              huansanzhang: {
                id: "huansanzhang",
                asset: {
                  0: "prefabs/3d/game/hand/girl_huansanzhang",
                  1: "prefabs/3d/game/hand/boy_huansanzhang",
                },
                funcName: "_playHuansanzhang",
                defaultTimeScale: 1,
              },
              qiaozhuozi: {
                id: "qiaozhuozi",
                asset: {
                  0: "prefabs/3d/game/hand/girl_qiaozhuozi",
                  1: "prefabs/3d/game/hand/boy_qiaozhuozi",
                },
                funcName: "_playQiaozhuozi",
                defaultTimeScale: 1,
              },
              yaoshouzhi: {
                id: "yaoshouzhi",
                asset: {
                  0: "prefabs/3d/game/hand/girl_yaoshouzhi",
                  1: "prefabs/3d/game/hand/boy_yaoshouzhi",
                },
                funcName: "_playYaoshouzhi",
                defaultTimeScale: 1,
              },
              zhuanpai: {
                id: "zhuanpai",
                asset: {
                  0: "prefabs/3d/game/hand/girl_zhuanpai",
                  1: "prefabs/3d/game/hand/boy_zhuanpai",
                },
                funcName: "_playZhuanpai",
                defaultTimeScale: 1,
              },
              hupai: {
                id: "hupai",
                asset: {
                  0: "prefabs/3d/game/hand/girl_hupai",
                  1: "prefabs/3d/game/hand/boy_hupai",
                },
                funcName: "_playHupai",
                defaultTimeScale: 1,
              },
            },
          }),
          (i.prototype.tCtrl = {}),
          (i.prototype.tAsset = { tileColor2dMat: "effect/common/Tile2D/tileColor2d" }),
          (i.prototype.tData = {}),
          cc._RF.pop());
      },
      {},
    ],
