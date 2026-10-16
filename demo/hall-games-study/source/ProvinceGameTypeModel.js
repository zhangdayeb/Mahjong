    ProvinceGameTypeModel: [
      function (e, t) {
        "use strict";
        function i(e, t) {
          var i;
          if ("undefined" == typeof Symbol || null == e[Symbol.iterator]) {
            if (Array.isArray(e) || (i = a(e)) || (t && e && "number" == typeof e.length)) {
              i && (e = i);
              var o = 0;
              return function () {
                return o >= e.length ? { done: !0 } : { done: !1, value: e[o++] };
              };
            }
            throw new TypeError(
              "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
            );
          }
          return (i = e[Symbol.iterator]()).next.bind(i);
        }
        function a(e, t) {
          if (e) {
            if ("string" == typeof e) return o(e, t);
            var i = Object.prototype.toString.call(e).slice(8, -1);
            return (
              "Object" === i && e.constructor && (i = e.constructor.name),
              "Map" === i || "Set" === i
                ? Array.from(e)
                : "Arguments" === i || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(i)
                  ? o(e, t)
                  : void 0
            );
          }
        }
        function o(e, t) {
          (null == t || t > e.length) && (t = e.length);
          for (var i = 0, a = new Array(t); i < t; i++) a[i] = e[i];
          return a;
        }
        (cc._RF.push(t, "fb902lTzPlGdosY7dNlNd5t", "ProvinceGameTypeModel"),
          cc.Class({
            extends: Cls_BaseModel,
            properties: {},
            Awake: function () {
              var e = this,
                t = [
                  g_tConst.GameTypeCfgs.JBCXLCHHSZ,
                  g_tConst.GameTypeCfgs.JBCXZDD,
                  g_tConst.GameTypeCfgs.JBCDZMJ,
                  g_tConst.GameTypeCfgs.JBCERMJ,
                  g_tConst.GameTypeCfgs.JBCZZMJ,
                  g_tConst.GameTypeCfgs.JBCCSMJ,
                  g_tConst.GameTypeCfgs.JBCHBKWX,
                  g_tConst.GameTypeCfgs.JBCBFTDH,
                ];
              this.alternateGameTypes = t.map(function (t) {
                return e._adaptGameType(t);
              });
            },
            start: function () {},
            isSection: function () {
              return g_oData.get(g_tData.SectionMatchMod).isSectionMatchState;
            },
            _adaptGameType: function (e) {
              return { iTag: 0, sName: e.Name, iID: e.TYPEID };
            },
            supplementGameTypes: function (e) {
              for (var t, a = new Set(), o = i(e); !(t = o()).done; ) {
                var n = t.value;
                a.add(n.iID);
              }
              for (var s = 0; e.length < 8; s++) {
                if (s > 8) {
                  Log.warn(
                    "BIRD >>>",
                    "ProvinceGameTypeModel.js",
                    "\u672a\u80fd\u6210\u529f\u8865\u5168\u7701\u4efd\u73a9\u6cd5",
                  );
                  break;
                }
                var r = this.alternateGameTypes[s];
                a.has(r.iID) || e.push(r);
              }
            },
          }),
          cc._RF.pop());
      },
      {},
    ],
