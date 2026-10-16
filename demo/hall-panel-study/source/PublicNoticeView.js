    PublicNoticeView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "93495SNjM1CjJKees9ygW+J", "PublicNoticeView");
        var i = e("AlertDlgBaseView"),
          a = e("PublicNoticeConst"),
          o = cc.Class({
            name: "PublicNoticeToggle",
            properties: {
              type: { default: a.publicNoticeType.System, type: a.publicNoticeType },
              toggle: cc.Toggle,
              scroll: cc.Node,
              comView: cc.Node,
              redPoint: cc.Node,
              _noticeData: [],
              _scrollData: null,
              _curSelNotice: null,
            },
            init: function (e) {
              if (Array.isArray(e)) {
                ((this._noticeData = e), this.updateRedPonit(!0));
                var t = [],
                  i = this.genScrollData();
                (e.forEach(function (e) {
                  t.push({ itemData: e, scrollData: i });
                }),
                  this.initScrollVComp(function () {
                    return t;
                  }),
                  t.length > 0 && t[i.curSelId] && this.setCurSelNotice(t[i.curSelId].itemData));
              }
            },
            getCurSelNotice: function () {
              return this._curSelNotice;
            },
            setCurSelNotice: function (e) {
              this._curSelNotice = e;
            },
            genScrollData: function (e) {
              return (
                void 0 === e && (e = 0),
                isNull(this._scrollData) && (this._scrollData = { type: this.type, curSelId: e }),
                this._scrollData
              );
            },
            initScrollVComp: function (e) {
              var t = this.scroll.getComponent("ScrollVComp");
              return (
                isNull(e) &&
                  (e = function () {
                    return [];
                  }),
                t.init(
                  function (e, t, i) {
                    e.getComponent("NoticeSelectItem").updateItem(t, i);
                  },
                  e,
                  !1,
                ),
                t
              );
            },
            onChangeToggle: function (e) {
              if (((this.scroll.active = e), (this.comView.active = e), e)) {
                var t = this.getCurSelNotice();
                (g_oData.get(g_tData.PublicNoticeMod).addAlreadyRead(t), this.updateRedPonit());
              }
            },
            showContent: function (e) {
              this.comView.emit("SHOW_NOTICE_CONTENT", this._curSelNotice, e);
            },
            updateRedPonit: function (e) {
              if ((void 0 === e && (e = !1), e || this.toggle.isChecked)) {
                var t = this._noticeData.find(function (e) {
                  return e.isShowRedPoint;
                });
                this.redPoint.active = !isNull(t);
              }
            },
          });
        (cc.Class({
          extends: i,
          properties: {
            toggleContaner: cc.ToggleContainer,
            toggles: [o],
            _curType: 1,
            _curShowNotice: null,
            _comSysContentView: cc.Node,
            _comActContentView: cc.Node,
            _publicNoticeMod: null,
          },
          Awake: function () {
            ((this._closeReleaseRes = !0),
              (this._publicNoticeMod = g_oData.get(g_tData.PublicNoticeMod)),
              g_oData.get(g_tData.SwitchModel).isCheckHandle() && this.close(),
              this.initScrollView(),
              this.onCustomEvent());
          },
          onCustomEvent: function () {
            var e = this;
            (this.node.on(
              "SHOW_PUBLIC_NOTICE",
              function (t) {
                e._curType = t || g_tConst.PublicNoticeTitleToggle.Activity;
              },
              this,
            ),
              this.node.on(
                "SELECT_NOTIFY_ITEM",
                function (t) {
                  if (t instanceof cc.Event) {
                    t.stopPropagation();
                    var i = t.detail.noticeItem;
                    (e.showContent(i), e._publicNoticeMod.addAlreadyRead(i));
                    var a = e._getToggleComp(i.type);
                    (a.setCurSelNotice(i), a.updateRedPonit());
                  }
                },
                this,
              ),
              this.node.on(
                "CLOSE_PUBLIC_NOTICE",
                function (t) {
                  t instanceof cc.Event && (t.stopPropagation(), e.onClickClose());
                },
                this,
              ));
          },
          start: function () {
            this._super();
            var e = this._getToggleComp(this._curType);
            (cc.isValid(e) && e.toggle.check(), (this.toggleContaner.allowSwitchOff = !1));
          },
          initScrollView: function () {
            var e = this;
            this.toggles.forEach(function (t) {
              var i = e._publicNoticeMod.getDataByToggleType(t.type);
              t.init(i);
            });
          },
          showContent: function (e) {
            if (e) {
              this._curShowNotice = e;
              var t = this;
              e.getContent().then(function (i) {
                t._curShowNotice.id === e.id && t._getToggleComp(t._curType).showContent(i);
              });
            }
          },
          onClickClose: function () {
            this.close();
          },
          onChangeToggle: function (e, t) {
            var i = this;
            ((this._curType = parseInt(t)),
              this.toggles.forEach(function (e) {
                var t = e.type === i._curType;
                (e.onChangeToggle(t), t && i.showContent(e.getCurSelNotice()));
              }));
          },
          _getToggleComp: function (e) {
            return this.toggles.find(function (t) {
              if (t.type === e) return !0;
            });
          },
        }),
          cc._RF.pop());
      },
      { AlertDlgBaseView: "AlertDlgBaseView", PublicNoticeConst: "PublicNoticeConst" },
    ],
