    ProvinceChoose: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "40f89PsQe1MYq545kyltIiA", "ProvinceChoose");
        var i = e("AlertDlgBaseView");
        (e("PopDlgCtrl"),
          cc.Class({
            extends: i,
            properties: {
              lab_curLocal: cc.Label,
              layoutRecent: cc.Node,
              layoutHot: cc.Node,
              locationItem: cc.Prefab,
              selectList: cc.Node,
            },
            Awake: function () {
              ((this._areaList = this.getAreaList()),
                (this._list = this.selectList.getComponent("ScrollVCompEEX")),
                (this._curArea = g_oData.get(g_tData.AreaMod).getCurAreaCode()),
                (this.selectList.active = !0));
            },
            start: function () {
              (this._super(),
                this.initCurLocation(),
                this.initRecentLocal(),
                this.initHotLocal(),
                this.initDownList(),
                (this.selectList.active = !1));
            },
            initCurLocation: function () {
              var e = this,
                t = this._areaList.find(function (t) {
                  return e._curArea === t.iAreaCode;
                });
              t && (this.lab_curLocal.string = t.sName);
            },
            initRecentLocal: function () {
              var e = g_oData.get(g_tData.UserLocalModel).getData("ProvinceChoose", {}).recent,
                t = void 0 === e ? [] : e;
              t.unshift(this._curArea);
              var i = new Set(t);
              this.createChooseItem(i, !1, this.layoutRecent);
            },
            initHotLocal: function () {
              var e = g_oData.get(g_tData.SwitchModel).getLocalChooseCfg();
              e && Array.isArray(e.hotArea) && this.createChooseItem(e.hotArea, !0, this.layoutHot);
            },
            createChooseItem: function (e, t, i) {
              var a = this;
              e.forEach(function (e) {
                var o = a._areaList.find(function (t) {
                  return e === t.iAreaCode;
                });
                o &&
                  g_oPrefabLoader
                    .instantiate(a.locationItem, i)
                    .getComponent("ProvinceChooseItem")
                    .init(!t && e === a._curArea, t, o.sName, e, a.clickItem.bind(a));
              });
            },
            updateScrollView: function (e) {
              this._list.numItems = e;
            },
            updateItem: function (e, t) {
              var i = e,
                a = this._areaList[t],
                o = i.getChildByName("localName");
              (o && (o.getComponent(cc.Label).string = a.sName), (i.areaCode = a.iAreaCode));
            },
            initDownList: function () {
              this.updateScrollView(this._areaList.length);
            },
            toggleSelectList: function () {
              this.selectList.active = !this.selectList.active;
            },
            onClickListItem: function (e) {
              this.clickItem(e.target.areaCode);
            },
            clickItem: function (e) {
              (this.saveLocalRecent(e),
                g_oData.get(g_tData.AreaMod).setCurAreaCode(e),
                this.onClickBack());
            },
            saveLocalRecent: function (e) {
              var t = g_oData.get(g_tData.UserLocalModel).getData("ProvinceChoose", {}).recent,
                i = void 0 === t ? [] : t;
              (i.unshift(e),
                (i = (i = Array.from(new Set(i))).slice(0, 3)),
                g_oData.get(g_tData.UserLocalModel).setData("ProvinceChoose", { recent: i }));
            },
            onClickBack: function () {
              (this.close(), g_oEvent.dispatchEvent(g_tEvent.START_OTHER_LIST_ANIMATION));
            },
            getAreaList: function () {
              return [
                { iAreaCode: 34, sName: "\u5b89\u5fbd" },
                { iAreaCode: 82, sName: "\u6fb3\u95e8" },
                { iAreaCode: 11, sName: "\u5317\u4eac" },
                { iAreaCode: 50, sName: "\u91cd\u5e86" },
                { iAreaCode: 35, sName: "\u798f\u5efa" },
                { iAreaCode: 62, sName: "\u7518\u8083" },
                { iAreaCode: 44, sName: "\u5e7f\u4e1c" },
                { iAreaCode: 45, sName: "\u5e7f\u897f" },
                { iAreaCode: 52, sName: "\u8d35\u5dde" },
                { iAreaCode: 46, sName: "\u6d77\u5357" },
                { iAreaCode: 13, sName: "\u6cb3\u5317" },
                { iAreaCode: 41, sName: "\u6cb3\u5357" },
                { iAreaCode: 23, sName: "\u9ed1\u9f99\u6c5f" },
                { iAreaCode: 42, sName: "\u6e56\u5317" },
                { iAreaCode: 43, sName: "\u6e56\u5357" },
                { iAreaCode: 22, sName: "\u5409\u6797" },
                { iAreaCode: 32, sName: "\u6c5f\u82cf" },
                { iAreaCode: 36, sName: "\u6c5f\u897f" },
                { iAreaCode: 21, sName: "\u8fbd\u5b81" },
                { iAreaCode: 15, sName: "\u5185\u8499\u53e4" },
                { iAreaCode: 64, sName: "\u5b81\u590f" },
                { iAreaCode: 63, sName: "\u9752\u6d77" },
                { iAreaCode: 37, sName: "\u5c71\u4e1c" },
                { iAreaCode: 14, sName: "\u5c71\u897f" },
                { iAreaCode: 61, sName: "\u9655\u897f" },
                { iAreaCode: 31, sName: "\u4e0a\u6d77" },
                { iAreaCode: 51, sName: "\u56db\u5ddd" },
                { iAreaCode: 71, sName: "\u53f0\u6e7e" },
                { iAreaCode: 12, sName: "\u5929\u6d25" },
                { iAreaCode: 54, sName: "\u897f\u85cf" },
                { iAreaCode: 81, sName: "\u9999\u6e2f" },
                { iAreaCode: 65, sName: "\u65b0\u7586" },
                { iAreaCode: 53, sName: "\u4e91\u5357" },
                { iAreaCode: 33, sName: "\u6d59\u6c5f" },
              ];
            },
          }),
          cc._RF.pop());
      },
      { AlertDlgBaseView: "AlertDlgBaseView", PopDlgCtrl: "PopDlgCtrl" },
    ],
