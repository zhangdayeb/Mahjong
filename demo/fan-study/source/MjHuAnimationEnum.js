    MjHuAnimationEnum: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "66c0cJ2TYJN0IdeGqgPDWGd", "MjHuAnimationEnum");
        var i = cc.Enum({ TotalPic: 1, SigleStr: -1, TwoPic: -1, JustPlay: -1, OneLabOnePic: -1 }),
          a = {
            Priority: cc.Enum({ High: 1, Middle: -1 }),
            PlayAniCfg: {
              ex_bigHu: {
                time: 2.33,
                timeScale: 0.32,
                fontUrl: "anims/gameAnims_ex/exAnims/ex_dahu/fanxingStr/",
                achType: i.TotalPic,
              },
              ex_dragon: {
                time: 1.83,
                timeScale: 0.4,
                fontUrl: "anims/gameAnims_ex/exAnims/ex_dahu/fanxingStr/",
                achType: i.TotalPic,
              },
              ex_gangkai: {
                time: 2.33,
                timeScale: 0.4,
                fontUrl: "anims/gameAnims_ex/exAnims/ex_gangkai/sigleStr/",
                achType: i.SigleStr,
              },
              ex_haidilaoyue: {
                time: 2,
                timeScale: 0.4,
                fontUrl: "anims/gameAnims_ex/exAnims/ex_haidilaoyue/fanxingStr/",
                achType: i.OneLabOnePic,
              },
              ex_doubleDragon: {
                time: 2,
                timeScale: 0.4,
                fontUrl: "anims/gameAnims_ex/exAnims/ex_doubleDragon/fanxingStr/",
                achType: i.TwoPic,
              },
              ex_fenghuang: {
                time: 3.17,
                timeScale: 0.4,
                fontUrl: "anims/gameAnims_ex/exAnims/ex_doubleDragon/fanxingStr/",
                achType: i.TwoPic,
              },
              ex_sanjieGao: {
                time: 1.64,
                timeScale: 0.4,
                fontUrl: "anims/gameAnims_ex/exAnims/ex_sanjieGao/fanxingStr/",
                achType: i.TwoPic,
              },
              ex_sijieGao: {
                time: 1.68,
                timeScale: 0.4,
                fontUrl: "anims/gameAnims_ex/exAnims/ex_sanjieGao/fanxingStr/",
                achType: i.TwoPic,
              },
              ex_buqiuren: { time: 1.2, fontUrl: "", timeScale: 0.4, achType: i.TotalPic },
              ex_duiduihu: { time: 1.23, fontUrl: "", timeScale: 0.4, achType: i.TotalPic },
              ex_jiulian: {
                time: 2.2,
                timeScale: 0.4,
                fontUrl: "anims/gameAnims_ex/exAnims/ex_jiulian/fanxingStr/",
                achType: i.TwoPic,
              },
              ex_lvyise: { time: 1.47, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_jingoudiao: { time: 1.2, fontUrl: "", timeScale: 0.4, achType: i.TotalPic },
              ex_gspao: { time: 1.52, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_tianhu: { time: 2, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_luohan: { time: 2.5, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_dihu: { time: 2.25, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_jinchai: { time: 2.33, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_hanjiangdudiao: { time: 2.92, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_hongquebaoxi: { time: 1.73, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_qichizhulian: { time: 1.93, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_qixinglanyue: { time: 2, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_wuhuaguo: { time: 2.5, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_guoshiwushuang: { time: 2.25, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_dasixi: { time: 1.87, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_xiaosixi: { time: 2.4, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_fenghuaxueyue: { time: 2.6, fontUrl: "", timeScale: 0.4, achType: i.Skeleton },
              ex_dasanyuan: { time: 2, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_xiaosanyuan: { time: 2, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_sssjg: {
                time: 2.13,
                fontUrl: "anims/gameAnims_ex/exAnims/ex_sanjieGao/fanxingStr/",
                timeScale: 0.4,
                achType: i.TwoPic,
              },
              ex_yd999: { time: 1.39, fontUrl: "", achType: i.JustPlay },
              ex_hyz999: { time: 1.61, fontUrl: "", achType: i.JustPlay },
              ex_protectGift: { time: 0, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
              ex_fengdingjinpai: { time: 1.8, fontUrl: "", timeScale: 0.4, achType: i.JustPlay },
            },
            playBySeatAni: ["ex_gangkai"],
            AchieveType: i,
            SigleStrMap: { "3005_1": ["3003_2"] },
            FanxingPicSuffix: { "55_2032": "_qlt" },
            showVFXOnTop: function (e, t) {
              if (e && e.isSceneVFX) {
                var i = cc.find("Canvas");
                i && (t.parent = i);
              }
            },
            getSoundName: function (e) {
              return -1 != ["ex_xuridongsheng", "ex_jinjiduli"].indexOf(e) ? "ex_xuridongsheng" : e;
            },
          };
        ((t.exports = a), cc._RF.pop());
      },
      {},
    ],
