    WeeklyCardBtnIcon: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "cba9b07lbRHT4U5XgBbNP4B", "WeeklyCardBtnIcon"),
          cc.Class({
            extends: Cls_BaseView,
            properties: { redPoint: cc.Node, from_tag: "main" },
            Awake: function () {
              (this._onInit(),
                this.onMessageEvent(),
                this.node.on("click", this.onClickWeeklyCard, this));
            },
            onMessageEvent: function () {
              var e = this;
              (this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.BUY_NEW_WEEKLY_CARD_FINISH,
                  function () {
                    e._onInit();
                  },
                  this,
                ),
              ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.GET_NEW_WEEKLY_CARD_CFG,
                    function () {
                      e._onInit();
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.GET_NEW_WEEKLY_CARD_DATA,
                    function () {
                      e._onInit();
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.GET_WEEKLY_CARD_DATA,
                    function () {
                      e._onInit();
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.GET_WEEKLY_CARD_CFG,
                    function () {
                      e._onInit();
                    },
                    this,
                  ),
                ),
                ("tableSel" != this.from_tag && "shop" != this.from_tag) ||
                  ((this.toggleType = "coin"),
                  this.autoDispose(
                    g_oEvent.addEventListener(
                      g_tEvent.SET_NEW_WEEKLY_CARD_TOGGLE,
                      function (t) {
                        e.toggleType = "coin" == t ? t : "zCoin" == t ? "zCoin" : null;
                      },
                      this,
                    ),
                  ),
                  this.autoDispose(
                    g_oEvent.addEventListener(
                      g_tEvent.SET_NEW_WEEKLY_CARD_SHOW,
                      function (t) {
                        e.node.opacity = t ? 255 : 0;
                      },
                      this,
                    ),
                  )));
            },
            _onInit: function () {
              cc.isValid(this.node) &&
                ((this.node.active = g_oData.get(g_tData.WeeklyCardLayerModel).CheckShowIcon()),
                g_oData.get(g_tData.SwitchModel).getWeekCard().showNewWeeklyCard
                  ? ((this.node.getChildByName("img_sprite").active = !1),
                    (this.node.getChildByName("img_sprite2").active = !0))
                  : ((this.node.getChildByName("img_sprite").active = !0),
                    (this.node.getChildByName("img_sprite2").active = !1)),
                "shop" == this.from_tag &&
                  ((this.node.getChildByName("img_sprite2").scale = 0.65),
                  (this.node.getChildByName("img_sprite").scale = 0.65),
                  (this.redPoint.scale = 0.65)),
                "tableSel" == this.from_tag &&
                  ((this.node.y = -55),
                  (this.node.getChildByName("img_sprite2").scale = 0.8),
                  (this.node.getChildByName("img_sprite").scale = 0.8),
                  (this.redPoint.scale = 0.8)),
                this.redPoint &&
                  (this.redPoint.active = g_oData
                    .get(g_tData.WeeklyCardLayerModel)
                    .CheckShowIconRedPoint()));
            },
            onClickWeeklyCard: function () {
              if ("tableSel" != this.from_tag && "shop" != this.from_tag)
                g_oLayerManager.emitEvent2Dlg(
                  g_tConst.GameLayerCfg.WeeklyCardLayer.id,
                  "ON_INIT",
                  {},
                );
              else {
                if (0 == this.node.opacity) return;
                g_oLayerManager.emitEvent2Dlg(g_tConst.GameLayerCfg.WeeklyCardLayer.id, "ON_INIT", {
                  toggleType: this.toggleType,
                });
              }
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
