    GameHuBehavior: [
      function (e, t, i) {
        "use strict";
        cc._RF.push(t, "60a15Qu0zVO0KcO3yujv2aN", "GameHuBehavior");
        var a,
          o =
            (this && this.__extends) ||
            ((a = function (e, t) {
              return (a =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                  function (e, t) {
                    e.__proto__ = t;
                  }) ||
                function (e, t) {
                  for (var i in t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
                })(e, t);
            }),
            function (e, t) {
              function i() {
                this.constructor = e;
              }
              (a(e, t),
                (e.prototype =
                  null === t ? Object.create(t) : ((i.prototype = t.prototype), new i())));
            }),
          n =
            (this && this.__decorate) ||
            function (e, t, i, a) {
              var o,
                n = arguments.length,
                s = n < 3 ? t : null === a ? (a = Object.getOwnPropertyDescriptor(t, i)) : a;
              if ("object" == typeof Reflect && "function" == typeof Reflect.decorate)
                s = Reflect.decorate(e, t, i, a);
              else
                for (var r = e.length - 1; r >= 0; r--)
                  (o = e[r]) && (s = (n < 3 ? o(s) : n > 3 ? o(t, i, s) : o(t, i)) || s);
              return (n > 3 && s && Object.defineProperty(t, i, s), s);
            };
        (Object.defineProperty(i, "__esModule", { value: !0 }), (i.GameHuBehavior = void 0));
        var s = cc._decorator,
          r = s.ccclass,
          c = s.property,
          l = (function (e) {
            function t() {
              var t = (null !== e && e.apply(this, arguments)) || this;
              return ((t.huCheck = null), (t.passCheck = null), t);
            }
            return (
              o(t, e),
              (t.prototype.Awake = function () {
                (this.updateUI(), this.onMessageEvent());
              }),
              (t.prototype.onMessageEvent = function () {
                (this.autoDispose(
                  g_oEvent.addEventListener(
                    g_tEvent.IS_SHOW_HUDETAIL,
                    function () {
                      this.updateUI();
                    },
                    this,
                  ),
                ),
                  this.autoDispose(
                    g_oEvent.addEventListener(
                      g_tEvent.ON_GAME_HU_BEHAVIOR_CHG,
                      function () {
                        this.updateUI();
                      },
                      this,
                    ),
                  ));
              }),
              (t.prototype.updateUI = function () {
                var e = MJ.GameLogic.TableModel.getGameType(),
                  t = g_oData.get(g_tData.GameBehaviorMod).getHuBehavior(e),
                  i = g_oData.get(g_tData.GameBehaviorMod).EHuBehavior;
                ((this.huCheck.active = t === i.EHB_Hu),
                  (this.passCheck.active = t === i.EHB_Pass));
              }),
              (t.prototype.onClick = function () {
                g_oData.get(g_tData.GameBehaviorMod).toggleHuBehavior();
              }),
              (t.prototype.onClickClose = function () {
                this.close();
              }),
              n([c(cc.Node)], t.prototype, "huCheck", void 0),
              n([c(cc.Node)], t.prototype, "passCheck", void 0),
              n([r], t)
            );
          })(Cls_BaseView);
        ((i.GameHuBehavior = l), cc._RF.pop());
      },
      {},
    ],
