    GameDeskCtrl: [
      function (e, t) {
        "use strict";
        (cc._RF.push(t, "8b46fq+yTdGO5+nGGqGl0Cf", "GameDeskCtrl"),
          e("GameDeskDefine"),
          cc.Class({
            extends: Cls_BaseCtrl,
            properties: { _curDeskUrl: null, _deskNode: null },
            Awake: function () {
              (this.onMessageEvent(), this.loadDesk());
            },
            onMessageEvent: function () {
              (this.autoDispose(
                g_oEvent.addEventListener(
                  g_tEvent.NOTIFY_ENTER_GAME,
                  function () {
                    this.loadDesk();
                  },
                  this,
                ),
              ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.START_GAME_UPDATA_TABLE_INFO,
                    function () {
                      this.loadDesk();
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.ON_GET_BACKPACKGOOD_SUC,
                    function () {
                      this.loadDesk();
                    },
                    this,
                  ),
                ),
                this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.USE_SANGUO_TABLE,
                    function () {
                      this.loadDesk();
                    },
                    this,
                  ),
                ));
            },
            start: function () {},
            loadDesk: function () {
              var e = this,
                t = g_tConst.ServerBagType.CardTable,
                i = g_oData.get(g_tData.mod_Bag).getCurUseId(t),
                a = g_oData.get(g_tData.mod_Bag).getCurUseLocalCfg(i, t),
                o = "";
              if (
                ((o = a
                  ? g_tAsset.GameDeskPrefabPath + a.PrefabName
                  : g_tAsset.GameDeskPrefabPath + "ClassicDesk"),
                (MJ && MJ.GameLogic.TableModel.getGameType()) ==
                  g_tConst.GameTypeCfgs.LS6HZ.TYPEID &&
                  (o = g_tAsset.GameDeskPrefabPath + "LeagueMatchDesk"),
                MJ &&
                  MJ.GameLogic &&
                  g_oData
                    .get(g_tData.DianFengSaiMod)
                    .canSupportScene(g_oData.get(g_tData.mod_DataCom).getCurrSelectScene()) &&
                  (o = g_tAsset.GameDeskPrefabPath + "TableBox_DianFeng"),
                MJ.GameLogic.TableModel.isSGMJ())
              ) {
                var n = cc.sys.localStorage.getItem("USER_SET_INFO"),
                  s = {};
                ("" != n && null != n && null != n && (s = JSON.parse(n)),
                  (null != s.isSanGuoTable && null != s.isSanGuoTable) ||
                    (s.isSanGuoTable = g_tConst.Set_SGLocalDefine),
                  (MJ.GameViewHandler.SGMJTableParent.active = s.isSanGuoTable),
                  s.isSanGuoTable
                    ? (MJ &&
                        MJ.GameViewHandler &&
                        MJ.GameViewHandler.nodeDeskBaseInfo.emit("SET_TABLE_COLOR_SANGUO"),
                      this.loadSanGuoTable())
                    : MJ &&
                      MJ.GameViewHandler &&
                      MJ.GameViewHandler.nodeDeskBaseInfo.emit("RESET_TABLE_COLOR_SANGUO"));
              }
              (isNull(this._curDeskUrl) || o !== this._curDeskUrl) &&
                g_oPrefabLoader.loadRes(o, this.node, function (t) {
                  ((e._curDeskUrl = o),
                    Log.info("GameDeskCtrl Set Cur Desk To " + o),
                    cc.isValid(e._deskNode) && e._deskNode.destroy(),
                    (e._deskNode = t));
                });
            },
            loadSanGuoTable: function () {
              MJ.GameViewHandler &&
                0 == MJ.GameViewHandler.SGMJTableParent.children.length &&
                e("SanGuoTableUICtrl").createLayer(function (e) {
                  e && (e.parent = MJ.GameViewHandler.SGMJTableParent);
                }, MJ.GameViewHandler.SGMJTableParent);
            },
            onDestroy: function () {
              this._super();
            },
          }),
          cc._RF.pop());
      },
      { GameDeskDefine: "GameDeskDefine", SanGuoTableUICtrl: "SanGuoTableUICtrl" },
    ],
