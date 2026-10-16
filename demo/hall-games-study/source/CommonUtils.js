    CommonUtils: [
      function (e, t) {
        "use strict";
        var i;
        cc._RF.push(t, "f6d08sEBsRHQ4trmZfM3D8P", "CommonUtils");
        var a = {},
          o =
            (((i = {
              deepCopy: function (e) {
                var t = Array.isArray(e) ? [] : {};
                for (var i in e)
                  e.hasOwnProperty(i) &&
                    ("object" == typeof e[i] && null !== e[i]
                      ? (t[i] = this.deepCopy(e[i]))
                      : (t[i] = e[i]));
                return t;
              },
              sizeOfObject: function () {},
              getRandom: function (e) {
                return e > 1 || e < 0
                  ? ((e = 0), Log.info("\u5f02\u5e38getRandom args[0-1]"), !1)
                  : this.getRandomNum(1, 10) > 10 * e;
              },
              getBigNum: function (e) {
                return this.translateCoinStr(this.initProCoin(this.Long2Number(e)), {
                  special: !0,
                  unitRange: g_tConst.GameUnit.Normal,
                });
              },
              formatTime: function (e, t) {
                var i = Math.floor(e / 86400),
                  a = Math.floor((e % 86400) / 3600),
                  o = Math.floor((e % 3600) / 60),
                  n = e % 60,
                  s = "00:00:00";
                switch (t) {
                  case 2:
                    s =
                      (i = i >= 10 ? i : "0" + i) +
                      "\u5929" +
                      (a = a >= 10 ? a : "0" + a) +
                      "\u5c0f\u65f6";
                    break;
                  case 3:
                    s = (a = a >= 10 ? a : "0" + a) + "\u5c0f\u65f6";
                    break;
                  default:
                    ((i = i >= 10 ? i : "0" + i),
                      (s =
                        (a = a >= 10 ? a : "0" + a) +
                        ":" +
                        (o = o >= 10 ? o : "0" + o) +
                        ":" +
                        (n = n >= 10 ? n : "0" + n)));
                }
                return s;
              },
              transTime: function (e, t, i) {
                (void 0 === t && (t = ":"), void 0 === i && (i = 3));
                var a = new Date(1e3 * e),
                  o = [],
                  n = a.getFullYear();
                o.push(n);
                var s = a.getMonth() + 1;
                (s < 10 && (s = "0" + s), o.push(s));
                var r = a.getDate();
                (r < 10 && (r = "0" + r), o.push(r));
                var c = a.getHours();
                (c < 10 && (c = "0" + c), o.push(c));
                var l = a.getMinutes();
                (l < 10 && (l = "0" + l), o.push(l));
                var g = a.getSeconds();
                (g < 10 && (g = "0" + g), o.push(g));
                for (var d = "", h = 0; h < i; h++) (0 != h && (d += t), (d += o[h]));
                return d;
              },
              getTimeLeftDesc: function (e, t) {
                void 0 === t && (t = !0);
                var i = t ? "\u524d" : "\u540e";
                e = Math.max(0, e);
                var a = Math.trunc(e / 86400),
                  o = Math.trunc((e - 86400 * a) / 3600),
                  n = Math.trunc((e - 86400 * a - 3600 * o) / 60),
                  s = e - 86400 * a - 3600 * o - 60 * n;
                return a > 0
                  ? a + "\u5929" + i
                  : o > 0
                    ? o + "\u5c0f\u65f6" + i
                    : n > 0
                      ? n + "\u5206\u949f" + i
                      : 0 == s
                        ? "\u521a\u521a"
                        : s + "\u79d2" + i;
              },
              getCountDown: function (e) {
                var t = function (e) {
                    return e < 10 ? "0" + e : e;
                  },
                  i = Math.max(0, e),
                  a = Math.trunc(i / 3600),
                  o = Math.trunc((i - 3600 * a) / 60),
                  n = i - (3600 * a + 60 * o),
                  s = t(n);
                return (
                  o > 0 && (s = t(o) + ":" + t(n)),
                  a > 0 && (s = t(a) + ":" + t(o) + ":" + t(n)),
                  s
                );
              },
              getRandomNum: function (e, t) {
                return Math.floor(Math.random() * (t - e + 1) + e);
              },
              randomSoftArr: function (e) {
                return (
                  e.sort(function () {
                    return Math.random() - 0.5;
                  }),
                  e
                );
              },
              getDisBetweenUsers: function (e, t) {
                var i = MJ.GameLogic.PlayerModel.getViewSeatIdByUserID(t),
                  a = MJ.GameLogic.PlayerModel.getViewSeatIdByUserID(e);
                return Math.abs(i - a);
              },
              getDateByStamp: function (e) {
                var t = new Date();
                return (
                  e && (t = new Date(e)),
                  t.getFullYear() +
                    "\u5e74" +
                    (t.getMonth() + 1) +
                    "\u6708" +
                    t.getDate() +
                    "\u53f7"
                );
              },
              getDateByStamp2: function (e) {
                var t = new Date();
                return (
                  e && (t = new Date(e)),
                  t.getFullYear() +
                    "\u5e74" +
                    (t.getMonth() + 1) +
                    "\u6708" +
                    t.getDate() +
                    "\u65e5"
                );
              },
              getDateByStamp3: function (e) {
                var t = new Date();
                return (
                  e && (t = new Date(e)),
                  t.getMonth() + 1 + "\u6708" + t.getDate() + "\u65e5"
                );
              },
              getTime: function () {
                return Math.ceil(new Date().getTime() / 1e3);
              },
              getServerTime: function (e) {
                g_oData.get(g_tData.sdkLogin).checkLogin(
                  function () {
                    var t = g_oData.get(g_tData.sdkLogin).serverTime;
                    e && e(t);
                  }.bind(this),
                );
              },
              getDifferDay: function (e, t) {
                var i = new Date(e),
                  a = i.getFullYear(),
                  o = i.getMonth();
                o = (o += 1) < 10 ? "0" + o : o;
                var n = i.getDate();
                n = n < 10 ? "0" + n : n;
                var s = new Date(a + "-" + o + "-" + n).getTime(),
                  r = new Date(t),
                  c = r.getFullYear(),
                  l = r.getMonth();
                l = (l += 1) < 10 ? "0" + l : l;
                var g = r.getDate();
                g = g < 10 ? "0" + g : g;
                var d = new Date(c + "-" + l + "-" + g).getTime();
                return Math.ceil(Math.abs(d - s) / 24 / 3600 / 1e3) || 0;
              },
              isSameDay: function (e, t) {
                var i = e.getFullYear(),
                  a = e.getMonth(),
                  o = e.getDate(),
                  n = t.getFullYear(),
                  s = t.getMonth(),
                  r = t.getDate();
                return i === n && a === s && o === r;
              },
              isNumberSameDay: function (e, t) {
                return this.isSameDay(g_oTimer.timeToDate(e), g_oTimer.timeToDate(t));
              },
              isNumberSameWeek: function (e, t) {
                var i = new Date(1e3 * e),
                  a = i.getDay() ? i.getDay() : 7;
                i.setDate(i.getDate() + (7 - a));
                var o = new Date(1e3 * t),
                  n = o.getDay() ? o.getDay() : 7;
                o.setDate(o.getDate() + (7 - n));
                var s = i.getFullYear(),
                  r = i.getMonth(),
                  c = i.getDate(),
                  l = o.getFullYear(),
                  g = o.getMonth(),
                  d = o.getDate();
                return s === l && r === g && c === d;
              },
              isOnGameScene: function () {
                return g_oSceneMgr.canvas ? g_oSceneMgr.canvas.name === g_tConst.SceneCfgs.game : 0;
              },
              isOnLobbyScene: function () {
                return g_oSceneMgr.canvas.name === g_tConst.SceneCfgs.lobby;
              },
              isOnLoginScene: function () {
                return (
                  g_oSceneMgr.canvas.name != g_tConst.SceneCfgs.lobby &&
                  g_oSceneMgr.canvas.name != g_tConst.SceneCfgs.game
                );
              },
              isTodayFirstLogin: function () {
                if (!g_oData.get(g_tData.UserLocalModel)) return !1;
                var e = g_oData.get(g_tData.UserLocalModel).getData("nCurrLoginTime"),
                  t = g_oData.get(g_tData.UserLocalModel).getData("nTodayFirstLoginTime", e),
                  i = g_oTimer.timeToDate(e, !1),
                  a = g_oTimer.timeToDate(t, !1),
                  o = !1;
                return (
                  e === t
                    ? (o = !0)
                    : this.isSameDay(a, i)
                      ? (o = !1)
                      : ((o = !0),
                        g_oData.get(g_tData.UserLocalModel).setData("nTodayFirstLoginTime", e)),
                  g_oData.get(g_tData.UserLocalModel).getData("nTodayFirstLoginTime") ||
                    g_oData.get(g_tData.UserLocalModel).setData("nTodayFirstLoginTime", e),
                  o
                );
              },
              isAllScreen: function () {
                var e = cc.winSize.width;
                return isNull(1280) || isNull(e)
                  ? (Log.error(
                      "BIRD\ud83d\ude21>>>",
                      "CommonUtils.js",
                      "isAllScreen occur error: variable is null",
                    ),
                    !1)
                  : e - 1280 > 50;
              },
              isAreacodeValid: function (e) {
                return !isNull(g_tConst.ProvinceCfgs[e]);
              },
              getTranslateCoin: function (e) {
                (cc.assert(
                  "number" == typeof e || "string" == typeof e,
                  "error param, is not number!",
                ),
                  (e = this.toNumber(e, 0)));
                var t = function (e, t) {
                    void 0 === t && (t = 2);
                    var i = String(e),
                      a = i.split(".");
                    if (a[1]) {
                      var o = a[1] + "0".times(t);
                      i = t > 0 ? a[0] + "." + o.slice(0, t) : a[0];
                    } else i = a[0];
                    return i;
                  },
                  i = String(e);
                return (
                  e < 0
                    ? (i = "\u65e0\u9650\u5236")
                    : (e >= 0 && e < 1e4) ||
                      (e >= 1e4 && e < Math.pow(10, 8)
                        ? (i = t(e / 1e4) + "\u4e07")
                        : e >= Math.pow(10, 8) && e < Math.pow(10, 12)
                          ? (i = t(e / Math.pow(10, 8)) + "\u4ebf")
                          : e >= Math.pow(10, 12) && e < Math.pow(10, 13)
                            ? (i = t(e / Math.pow(10, 8), 0) + "\u4ebf")
                            : e >= Math.pow(10, 13) && e < Math.pow(10, 15)
                              ? (i = t(e / Math.pow(10, 12)) + "\u4e07\u4ebf")
                              : e >= Math.pow(10, 15) &&
                                (i = t(e / Math.pow(10, 12), 0) + "\u4e07\u4ebf")),
                  i
                );
              },
              translateCoinStr: function (e, t) {
                if ((void 0 === t && (t = {}), isNaN(e))) return "";
                e += "";
                var i,
                  a = "",
                  o = g_tConst.GameUnit.Normal,
                  n = 2;
                (t.unitRange && (o = t.unitRange),
                  (i = t.minValue ? t.minValue : "1".padEnd(o[0].range[0] + 1, "0")),
                  "number" == typeof t.afterNum && (n = t.afterNum));
                var s = "";
                e.length > 0 && "-" == e.charAt(0) && ((s = "-"), (e = e.substring(1, e.length)));
                var r = e;
                if (this.strNumCompare(e, i) >= 0) {
                  for (var c = null, l = 0; l < o.length; l++) {
                    var g = o[l],
                      d = g.range,
                      h = d[0] == 1 / 0 ? 1 / 0 : "1".padEnd(d[0] + 1, "0"),
                      u = d[1] == 1 / 0 ? 1 / 0 : "1".padEnd(d[1] + 1, "0");
                    if (this.strNumCompare(e, h) >= 0 && this.strNumCompare(e, u) < 0) {
                      if (t.special) {
                        var _ = d[0] == 1 / 0 ? 1 / 0 : "1".padEnd(g.zero + 1 + 2, "0"),
                          m = d[0] == 1 / 0 ? 1 / 0 : "1".padEnd(g.zero + 1 + 1, "0");
                        n =
                          this.strNumCompare(e, _) >= 0 ? 0 : this.strNumCompare(e, m) >= 0 ? 1 : 2;
                      }
                      c = g;
                    }
                  }
                  c && ((r = this.getNumDescByUnitNumTimes(e, c.zero, n)), (a = c.unitName));
                }
                return s + r + a;
              },
              getFullFormatCoinStr: function (e) {
                var t = "";
                return (
                  (e = this.toNumber(e, 0)) < 0 && (t = "-"),
                  t + this.getFormatCoinStr(Math.abs(e))
                );
              },
              getFormatCoinStr: function (e) {
                var t = "";
                if ((e = this.toNumber(e, 0)) >= 0)
                  if (0 == Math.floor(e / Math.pow(10, 12))) {
                    var i = function (e) {
                      var t = String(e),
                        i = "",
                        a = t.split(".");
                      if (2 == a.length)
                        for (
                          var o = a[0],
                            n = a[1],
                            s = o.split(""),
                            r = n.split(""),
                            c = s.length,
                            l = 0;
                          l < 4;
                          l++
                        )
                          if (s[l]) i += s[l];
                          else {
                            var g = l - c;
                            g < 2 && r[g] && (0 == g && (i += "."), (i += r[g]));
                          }
                      else i = t;
                      return i;
                    };
                    ((t = String(e)),
                      e >= 1e4 && e < 1e8
                        ? (t = i(e / 1e4) + "\u4e07")
                        : e >= 1e8 && (t = i(e / 1e8) + "\u4ebf"));
                  } else t = String(e / Math.pow(10, 8)).split(".")[0] + "\u4ebf";
                else t = "0";
                return t;
              },
              getNumDescByUnitNumTimes: function (e, t, i) {
                for (var a = e.length - t, o = "", n = 0; n < i; n++) o += e.charAt(a + n);
                var s = e.substring(0, a);
                return (o.length > 0 && (s = (s += "." + o).replace(/(\.[0]+$)|([0]+$)/, "")), s);
              },
              formatNumYi: function (e, t) {
                ((t = isNull(t) ? Math.pow(10, 10) : t),
                  cc.assert(
                    "number" == typeof e || "string" == typeof e,
                    "error param, is not number!",
                  ));
                var i = this.Long2Number(e);
                return (
                  Math.abs(e) >= t &&
                    (i =
                      (function (e) {
                        var t = String(e),
                          i = t.split(".");
                        if (i[1]) {
                          var a = i[1] + "0".times(2);
                          t = i[0] + "." + a.slice(0, 2);
                        } else t = i[0];
                        return t;
                      })(e / Math.pow(10, 8)) + "\u4ebf"),
                  i
                );
              },
              getTranslateTimeDay: function (e) {
                return e && e > 0 && e % 1440 == 0 ? e / 1440 + "\u5929" : e + "\u5206\u949f";
              },
              getXZDDSceneCfg: function () {
                var e = g_oData
                    .get(g_tData.mod_gamecfg)
                    .getGameTypeSceneCfgs(g_tConst.GameTypeCfgs.JBCXZDD.TYPEID),
                  t = g_oData
                    .get(g_tData.mod_gamecfg)
                    .getGameTypeSceneCfgs(g_tConst.GameTypeCfgs.JBCXZDDHSZ.TYPEID);
                return e.concat(t);
              },
              getXLCHSceneCfg: function () {
                var e = g_oData
                    .get(g_tData.mod_gamecfg)
                    .getGameTypeSceneCfgs(g_tConst.GameTypeCfgs.JBCXLCH.TYPEID),
                  t = g_oData
                    .get(g_tData.mod_gamecfg)
                    .getGameTypeSceneCfgs(g_tConst.GameTypeCfgs.JBCXLCHHSZ.TYPEID);
                return e.concat(t);
              },
              getFitSubStringByLen: function (e, t) {
                var i = 0;
                e || (e = "");
                for (var a = 0; a < e.length; a++)
                  if ((e.charCodeAt(a) > 255 ? (i += 2) : i++, i >= t - 1))
                    return e.substr(0, a) + "...";
                return e;
              },
              Long2Number: function (e) {
                return "number" == typeof e
                  ? e
                  : e.unsigned
                    ? 4294967296 * (e.high >>> 0) + (e.low >>> 0)
                    : 4294967296 * e.high + (e.low >>> 0);
              },
              Number2Long: function (e) {
                var t;
                return { low: (t = e) >>> 0, high: Math.floor(t / 4294967296) };
              },
              getProCoinScale: function () {
                var e = g_oData.get(g_tData.SwitchModel).getCoinProCfg() || {};
                return isNull(e) ? 1 : e.scale || 1;
              },
              getCoinScale: function () {
                var e = "1",
                  t = g_oData.get(g_tData.SwitchModel).getCoinProCfg() || {};
                return (t.isDakai && (e = t.scaleStr || "1"), e);
              },
              initProCoin: function (e) {
                var t = g_oData.get(g_tData.SwitchModel).getCoinProCfg() || {};
                if (t.isDakai) {
                  var i = "";
                  e < 0 && ((i = "-"), (e = (e += "").substring(1, e.length)));
                  var a = e + "";
                  e && e.toString().includes("e") && (a = this.convertScientificToString(e));
                  var o = t.scaleStr || "1";
                  return i + this.strNumMultiply(a, o);
                }
                return e + "";
              },
              convertScientificToString: function (e) {
                var t = e.toString().split("e"),
                  i = t[0],
                  a = t[1],
                  o = (a = parseInt(a)) - ((i = i.replace(".", "")).length - 1);
                return (
                  o > 0 ? (i += "0".repeat(o)) : (i = i.slice(0, a + 1) + "." + i.slice(a + 1)),
                  i
                );
              },
              UIccc2WxPos: function (e) {
                var t = cc.size(1280, 720),
                  i = cc.size(1280, 720),
                  a = cc.view.getFrameSize(),
                  o = a.height / a.width;
                o < t.height / t.width ? (i.width = i.height / o) : (i.height = i.width * o);
                var n = (i.width - t.width) / 2,
                  s = (i.height - t.height) / 2,
                  r = cc.v2(e.x + n, e.y + s),
                  c = ((i.height - r.y) / i.height) * a.height,
                  l = (r.x / i.width) * a.width;
                return cc.v2(l, c);
              },
              GameClubWXPosAjust: function (e, t) {
                var i = cc.size(1280, 720),
                  a = cc.size(1280, 720),
                  o = cc.view.getFrameSize();
                o.height / o.width < i.height / i.width
                  ? (a.width = cc.winSize.width)
                  : (a.height = cc.winSize.height);
                var n = ((a.height - e.y) / a.height) * o.height,
                  s = (e.x / a.width) * o.width;
                return { pos: cc.v2(s, n), size: Math.floor((t / i.width) * o.width) };
              },
              apkScreenshot: function () {
                if (cc.sys.isNative) {
                  var e = jsb.fileUtils.getWritablePath();
                  ((this._fullPath = e + "result_share.jpg"),
                    jsb.fileUtils.isFileExist(this._fullPath) &&
                      jsb.fileUtils.removeFile(this._fullPath));
                  var t = cc.winSize,
                    i = cc.game._renderContext,
                    a = new cc.Node();
                  ((a.parent = cc.director.getScene()),
                    a.setPosition(cc.winSize.width / 2, cc.winSize.height / 2));
                  var o = a.addComponent(cc.Camera),
                    n = new cc.RenderTexture();
                  (n.initWithSize(Math.floor(t.width), Math.floor(t.height), i.STENCIL_INDEX8),
                    (o.targetTexture = n));
                  var s = document.createElement("canvas");
                  (s.getContext("2d"), (s.width = n.width), (s.height = n.height), o.render());
                  var r = n.readPixels(),
                    c = (s.width, this.filpYImage(r, n.width, n.height)),
                    l = jsb.saveImageData(c, n.width, n.height, this._fullPath);
                  if (((o.targetTexture = null), l)) {
                    if (jsb.fileUtils.isFileExist(this._fullPath))
                      return (a.destroy(), this._fullPath);
                  } else cc.error("save image data failed!");
                }
              },
              filpYImage: function (e, t, i) {
                for (var a = new Uint8Array(t * i * 4), o = 4 * t, n = 0; n < i; n++)
                  for (var s = (i - 1 - n) * t * 4, r = n * t * 4, c = 0; c < o; c++)
                    a[r + c] = e[s + c];
                return a;
              },
              valueAtBit: function (e, t) {
                var i = e.toString("2");
                return Number(i[i.length - t]);
              },
              getQueryString: function (e) {
                var t = new RegExp("(^|&)" + e + "=([^&]*)(&|$)", "i"),
                  i = window.location.search.substr(1).match(t);
                return i ? decodeURIComponent(i[2]) : null;
              },
              setClipBoardData: function (e) {
                if (this.isNative());
                else if (this.isWeChatGame())
                  wx.setClipboardData({
                    data: e.data,
                    success: e.success,
                    fail: e.fail,
                    complete: e.complete,
                  });
                else {
                  var t = e.data,
                    i = document.createElement("textarea");
                  (document.body.appendChild(i),
                    (i.value = t),
                    i.select(),
                    document.execCommand("Copy"),
                    i.remove(),
                    e.success && e.success());
                }
              },
              virbrateLong: function () {
                this.isWeChatGame() && wx.vibrateLong();
              },
              isPCDevEnv: function () {
                return cc.sys.os === cc.sys.OS_WINDOWS && !1 === IS_MOBLIE_RELEASE;
              },
              isWeChatGame: function () {
                return cc.sys.platform === cc.sys.WECHAT_GAME;
              },
              isQQPlay: function () {
                return "QQGame" === g_oPlatform.getPlatName();
              },
              isAndroid: function () {
                return cc.sys.platform === cc.sys.ANDROID;
              },
              isiOS: function () {
                return !1;
              },
              isNative: function () {
                return cc.sys.isNative;
              },
              isIosSys: function () {
                return cc.sys.os == cc.sys.OS_IOS;
              },
              isQTTChannel: function () {
                return this.isPlat("Mobile", "qttH5");
              },
              isPlat: function (e, t) {
                var i = g_oPlatform.getPlatClass(),
                  a = g_oPlatform.getPlatName();
                return e == i && t == a;
              },
            }).setClipBoardData = function (e) {
              if (this.isNative());
              else if (this.isWeChatGame())
                wx.setClipboardData({
                  data: e.data,
                  success: e.success,
                  fail: e.fail,
                  complete: e.complete,
                });
              else {
                var t = e.data,
                  i = document.createElement("textarea");
                (document.body.appendChild(i),
                  (i.value = t),
                  i.select(),
                  document.execCommand("Copy"),
                  i.remove(),
                  e.success && e.success());
              }
            }),
            (i.isPoneAvailable = function (e) {
              return !!/^[1][3,4,5,7,8,9][0-9]{9}$/.test(e);
            }),
            (i.isPlayIdAvailable = function (e) {
              return !!/^\d{5}-(\d)+-(\d)+-\d{10}-(\d)+$/.test(e);
            }),
            (i.canShowGameBanner = function () {
              return (
                this.isWeChatGame() &&
                this.compareWeChatSdkVer(wx.getSystemInfoSync().SDKVersion, "2.7.5") >= 0
              );
            }),
            (i.canShowBanner = function () {
              return 1;
            }),
            (i.compareWeChatSdkVer = function (e, t) {
              ((e = e.split(".")), (t = t.split(".")));
              for (var i = e.length < t.length ? e.length : t.length, a = 0; a < i; a++) {
                if (parseInt(e[a]) > parseInt(t[a])) return 1;
                if (parseInt(e[a]) < parseInt(t[a])) return -1;
              }
              return e.length === t.length ? 0 : e.length > t.length ? 1 : -1;
            }),
            (i.trimSpace = function (e) {
              for (var t = 0; t < e.length; t++)
                (" " != e[t] && null != e[t] && void 0 !== e[t]) || (e.splice(t, 1), (t -= 1));
              return e;
            }),
            (i.comparisonObject = function (e, t, i) {
              void 0 === i && (i = []);
              var a = function (e) {
                  return Object.prototype.toString.call(e).substring(8).split(/]/)[0];
                },
                o = a(e);
              if (o !== a(t)) return !1;
              if ("Array" !== o && "Object" !== o && "Set" !== o && "Map" !== o)
                return "Number" === o && "NaN" === e.toString()
                  ? "NaN" === t.toString()
                  : "Date" === o || "RegExp" === o
                    ? e.toString() === t.toString()
                    : e === t;
              if ("Array" === o) {
                if (e.length !== t.length) return !1;
                if (0 === e.length) return !0;
                for (var n = 0; n < e.length; n++)
                  if (!this.comparisonObject(e[n], t[n])) return !1;
              } else if ("Object" === o) {
                var s,
                  r = Reflect.ownKeys(e),
                  c = Reflect.ownKeys(t);
                if (r.length !== c.length) return !1;
                for (var l = 0; l < r.length; l++) {
                  if ((s = r[l]) !== c[l]) return !1;
                  if (!i.includes(s) && !this.comparisonObject(e[s], t[s])) return !1;
                }
              } else if (
                ("Set" === o || "Map" === o) &&
                !this.comparisonObject(Array.from(e), Array.from(t))
              )
                return !1;
              return !0;
            }),
            (i.formatString = function () {
              var e = arguments[0].toString();
              if ("object" == typeof arguments[1])
                for (var t in arguments[1]) e = e.replace("{" + t + "}", arguments[1][t]);
              else
                for (t = 1; t < arguments.length; t++)
                  e = e.replace("{" + (t - 1) + "}", arguments[t]);
              return e;
            }),
            (i.wxShareCardNumberCount = function (e) {
              for (var t = 0, i = e.split(""), a = 0; a < i.length; a++) {
                var o = i[a];
                isNaN(parseInt(o, 10))
                  ? 0 === o.search(/[() :]/)
                    ? (t += 0.33)
                    : (t += 1)
                  : (t += 0.66);
              }
              return t;
            }),
            (i.signDebounce = function (e, t) {
              (void 0 === t && (t = 500), (a[e] = { limitMS: t, debounceCounter: 0 }));
            }),
            (i.isDebounce = function (e, t, i) {
              if ((void 0 === t && (t = function () {}), a[e])) {
                a[e].debounceCounter += 1;
                var o = a[e].debounceCounter;
                setTimeout(function () {
                  a[e].debounceCounter === o && (t.apply(i), (a[e].debounceCounter = 0));
                }, a[e].limitMS);
              } else
                Log.error(
                  "BIRD\ud83d\ude21>>>",
                  "CommonUtils.js",
                  "checkDebounce \u4f7f\u7528 checkDebounce \u524d\u8bf7\u786e\u4fdd\u8c03\u7528\u4e86 signDebounce",
                );
            }),
            (i.getDateStartTime = function (e) {
              return new Date(
                (e.getFullYear() + "-" + (e.getMonth() + 1) + "-" + e.getDate()).replace(/-/g, "/"),
              ).getTime();
            }),
            (i.setGrey = function (e, t) {
              for (var i = e.getComponentsInChildren(cc.Sprite), a = 0; a < i.length; a++) {
                var o = void 0;
                (t == cc.Sprite.State.GRAY
                  ? ((o = cc.Material.getBuiltinMaterial("2d-gray-sprite")),
                    (o = cc.MaterialVariant.create(o, this)))
                  : ((o = cc.Material.getBuiltinMaterial("2d-sprite", this)),
                    (o = cc.MaterialVariant.create(o, this)).define("USE_TEXTURE", !0)),
                  i[a].setMaterial(0, o));
              }
            }),
            (i.setGreyLabel = function (e, t) {
              for (var i = e.getComponentsInChildren(cc.Label), a = 0; a < i.length; a++) {
                var o = void 0;
                (t == cc.Sprite.State.GRAY
                  ? ((o = cc.Material.getBuiltinMaterial("2d-gray-sprite")),
                    (o = cc.MaterialVariant.create(o, this)))
                  : ((o = cc.Material.getBuiltinMaterial("2d-sprite", this)),
                    (o = cc.MaterialVariant.create(o, this)).define("USE_TEXTURE", !0)),
                  i[a].setMaterial(0, o));
              }
            }),
            (i.setSpriteGray = function (e, t) {
              var i;
              (t
                ? ((i = cc.Material.getBuiltinMaterial("2d-gray-sprite")),
                  (i = cc.MaterialVariant.create(i, this)))
                : ((i = cc.Material.getBuiltinMaterial("2d-sprite", this)),
                  (i = cc.MaterialVariant.create(i, this)).define("USE_TEXTURE", !0)),
                e.setMaterial(0, i));
            }),
            (i.toNumber = function (e, t) {
              return ((e = isNull(e) || isNaN(e) ? null : Number(e)), isNull(e) ? t : e);
            }),
            (i.checkInputObj = function (e, t) {
              if (e instanceof Object && t instanceof Object)
                for (var i in e) t.hasOwnProperty(i) && typeof e[i] == typeof t[i] && (e[i] = t[i]);
              return e;
            }),
            (i.getGiftItemStyleCfg = function (e) {
              var t = { iconIndex: 0, description: "None" };
              switch (e.type) {
                case g_tConst.GameConfig.ItemType.GoldCard:
                  ((t.iconIndex = 0), (t.description = e.num + "\u8c46"));
                  break;
                case g_tConst.GameConfig.ItemType.CSFare:
                  e.goodsID;
              }
              return t;
            }),
            (i.ajustGTName = function (e) {
              switch (e) {
                case "\u8840\u6d41\u6210\u6cb3\u6362\u4e09\u5f20":
                  e = "\u8840\u6d41\u6362\u4e09\u5f20";
                  break;
                case "\u8840\u6218\u5230\u5e95\u6362\u4e09\u5f20":
                  e = "\u8840\u6218\u6362\u4e09\u5f20";
                  break;
                case "\u8840\u6d41\u7ea2\u4e2d\u9ebb\u5c06":
                  e = "\u8840\u6d41\u7ea2\u4e2d";
              }
              return e;
            }),
            (i.getPlayerData = function (e, t) {
              var i = null;
              if (Array.isArray(e))
                for (var a = 0; a < e.length; ++a) {
                  var o = e[a];
                  if (o.userID === t) {
                    i = o;
                    break;
                  }
                }
              return i;
            }),
            (i.doDlgShowAnimation = function (e, t) {
              if ((void 0 === t && (t = null), e && (t || (t = e.parent), t))) {
                ((t.active = !0), e.setScale(0.1));
                var i = cc.scaleTo(0.2, 1.1),
                  a = cc.fadeIn(0.2),
                  o = cc.spawn(i, a),
                  n = cc.scaleTo(0.1, 1),
                  s = cc.sequence(o, n);
                e.runAction(s);
              }
            }),
            (i.doDlgHideAnimation = function (e, t) {
              (void 0 === t && (t = null),
                e && (t || (t = e.parent), t && (e.runAction(cc.fadeOut(0)), (t.active = !1))));
            }),
            (i.getSectionInfoBySectionID = function (e) {
              var t = { realName: "\u9752\u94dc\u2162", level: 1 },
                i = g_oData.get(g_tData.SectionMatchMod).getCfgBySectionID(e);
              if (i) {
                var a = (e - 1) % g_tConst.SectionMatch.nSectionPart;
                t.realName = i.name.replace(/\d+/, ["\u2162", "\u2161", "\u2160"][a]);
                var o = Math.floor((e - 1) / 3) + 1;
                t.level = o;
              }
              return t;
            }),
            (i.setState = function (e, t) {
              var i = cc.Material.getBuiltinMaterial("2d-gray-sprite"),
                a = cc.Material.getBuiltinMaterial("2d-sprite");
              e.setMaterial && e.setMaterial(0, t ? a : i);
            }),
            (i.getLimitedStringBySuffix = function (e, t, i) {
              void 0 === i && (i = "..");
              var a = /[\u0391-\uFFE5]/g;
              if (e.replace(a, "aa").length > 2 * t) {
                for (
                  var o = -1, n = 0, s = 0;
                  s < e.length && !((n += e.charAt(s).search(a) >= 0 ? 2 : 1) > 2 * t);
                  ++s
                )
                  o++;
                return e.substr(0, o) + i;
              }
              return e;
            }),
            (i.getCoinTotalWinLoss = function () {
              var e = 0;
              if (MJ.GameLogic)
                for (var t = MJ.GameLogic.getWinFailList(), i = 0; i < t.length; i++) {
                  var a = t[i];
                  a && (e += a.iCoin + a.iShareMoreWin);
                }
              return e;
            }),
            (i.generateBreathAnimation = function (e, t, i) {
              var a = [],
                o = cc.scaleTo(e / 4, t),
                n = cc.scaleTo(e / 4, 1),
                s = cc.scaleTo(e / 4, i);
              return (a.push(o), a.push(n), a.push(s), a.push(n), cc.repeatForever(cc.sequence(a)));
            }),
            (i.getLineNumber = function (e, t) {
              var i = e.replace(/[\u0391-\uFFE5]/g, "aa").length;
              return Math.ceil(i / (2 * t));
            }),
            (i.getHashCode = function (e, t) {
              (void 0 === t && (t = !0), t || (e = e.toLowerCase()));
              var i,
                a = 1315423911;
              for (i = e.length - 1; i >= 0; i--) a ^= (a << 5) + e.charCodeAt(i) + (a >> 2);
              return 2147483647 & a;
            }),
            (i.getDateString = function (e) {
              return "" + e.getFullYear() + (e.getMonth() + 1) + e.getDate();
            }),
            (i.replaceSpecialStrByXinHao = function (e, t) {
              return (void 0 === e && (e = ""), void 0 === t && (t = ""), e.replace(/\*/g, t));
            }),
            (i.replaceSpecialStrBySymbol = function (e, t, i) {
              return (void 0 === e && (e = ""), void 0 === i && (i = ""), e.replace(t, i));
            }),
            (i.startJumpJumpTipAction = function (e, t, i, a) {
              e.stopAllActions();
              var o = t,
                n = cc.v2(e.x, e.y),
                s = cc.v2(e.x, e.y + o),
                r = i / 2,
                c = cc.moveTo(r, s),
                l = cc.moveTo(r, n),
                g = a,
                d = cc.sequence(c, l, c, l, cc.delayTime(g));
              setTimeout(function () {
                e.runAction(cc.repeatForever(d));
              }, 1e3 * g);
            }),
            (i.strNumAdd = function (e, t) {
              if (isNaN(e) || isNaN(t))
                return (Log.error("Edwin numA and numB must be a string of number!"), "0");
              var i = "",
                a = 0,
                o = (e += "").length,
                n = (t += "").length;
              if (0 == o) return t;
              if (0 == n) return e;
              for (; o > 0 || n > 0; ) {
                var s = 0;
                (o > 0 && n > 0
                  ? (s = parseInt(e.charAt(--o)) + parseInt(t.charAt(--n)) + a)
                  : o > 0
                    ? (s = parseInt(e.charAt(--o)) + a)
                    : n > 0 && (s = parseInt(t.charAt(--n)) + a),
                  (a = 0));
                var r = s;
                (s >= 10 && ((a = 1), (r = s - 10)), (i = r + i));
              }
              return (a > 0 && (i = a + i), i);
            }),
            (i.strNumMultiply = function (e, t) {
              if (isNaN(e) || isNaN(t))
                return (Log.error("Edwin numA and numB must be a string of number!"), "0");
              if (0 == e || 0 == t) return "0";
              for (var i = 0, a = "", o = (e += "").length, n = (t += "").length; n > 0; ) {
                var s = parseInt(t.charAt(--n));
                if (s > 0) {
                  for (var r = o, c = "", l = 0; r > 0; ) {
                    var g = parseInt(e.charAt(--r)) * s + l;
                    ((l = 0), g >= 10 && (g -= 10 * (l = Math.trunc(g / 10))), (c = g + c));
                  }
                  l > 0 && (c = l + c);
                  for (var d = 0; d < i; d++) c += "0";
                  a = 0 == a.length ? c : this.strNumAdd(a, c);
                }
                i++;
              }
              return a;
            }),
            (i.strNumCompare = function (e, t) {
              if (isNaN(e) || isNaN(t))
                return (Log.error("Edwin numA and numB must be a string of number!"), null);
              if (((t += ""), "Infinity" == (e += "") || "Infinity" == t)) {
                if ("Infinity" == e && "Infinity" == t) return 0;
                if ("Infinity" == e) return 1;
                if ("Infinity" == t) return -1;
              }
              if (e.length > t.length) return 1;
              if (e.length < t.length) return -1;
              if (e.length == t.length) {
                for (var i = e.length, a = 0; a < i; a++) {
                  var o = parseInt(e.charAt(a)),
                    n = parseInt(t.charAt(a));
                  if (o != n) {
                    if (o > n) return 1;
                    if (o < n) return -1;
                  }
                }
                return 0;
              }
            }),
            (i.replaceRule = function (e, t) {
              if ((void 0 === t && (t = !0), !e)) return "";
              var i = "1",
                a = g_oData.get(g_tData.SwitchModel).getCoinProCfg() || {};
              if ((a.isDakai && (i = a.scaleStr || "1"), "1" == i)) return e;
              for (
                var o = e,
                  n = [
                    new RegExp(/[\u8c46]\s*\w*\s*\d+\s*[^\u8c46]/g),
                    new RegExp(/\d+\s*\w*\s*[\u6e38\u620f]*[\u8c46]/g),
                    new RegExp(/\d+\s*\w*\s*[\u6307\u5c16\u5e01]/g),
                    new RegExp(/(\u6307\u5c16\u5e01)\s*\w*\s*\d+\s*[^\u6307\u5c16\u5e01]/g),
                  ],
                  s = 0;
                s < n.length;
                s++
              ) {
                var r = n[s],
                  c = e.match(r);
                if (c)
                  for (var l = 0; l < c.length; l++) {
                    var g = c[l].match(new RegExp(/\d+/));
                    if (g) {
                      var d = Number(g[0]);
                      if ("number" == typeof d) {
                        var h = d;
                        t && (h = this.initProCoin(d));
                        var u = c[l].replace(new RegExp(/\d+/), this.translateCoinStr(h));
                        o = o.replace(c[l], u);
                      }
                    }
                  }
              }
              return o;
            }),
            (i.getUserTotalRoundNum = function () {
              var e = g_oData.get(g_tData.sdkUser);
              return e.gameInfo.win + e.gameInfo.equal + e.gameInfo.loss;
            }),
            (i.getLiveModeDefaultHead = function (e) {
              var t = e.userID,
                i = e.headUrl,
                a = g_oData.get(g_tData.SwitchModel).getIsLiveModeDefaultHead().isAllOpen;
              if (g_oData.get(g_tData.LiveGameModel).isLivePlayer() && a) {
                var o = g_oData.get(g_tData.LiveGameModel).otherUserHeadInLiveMode.get(t);
                (null == o &&
                  ((o = this.getRandomNum(0, 9)),
                  g_oData.get(g_tData.LiveGameModel).otherUserHeadInLiveMode.set(t, o)),
                  (i = o + ""));
              }
              return i;
            }),
            (i.translateBinStr = function (e) {
              var t = 1;
              "-" == e.charAt(0) && ((t = -1), (e = e.substring(1, e.length)));
              for (var i = 0, a = 0, o = e.length - 1; o >= 0; o--)
                ("1" == e.charAt(o) && (i += Math.pow(2, a)), a++);
              return t * i;
            }),
            (i.getCurSceneCoinType = function () {
              var e = g_tConst.GameConfig.eWinGood.Coin,
                t = g_oData.get(g_tData.mod_DataCom).getCurrSelectScene();
              if (t > 0) {
                var i = g_oData.get(g_tData.mod_gamecfg).getSceneCfgBySceneID(t);
                i && i.enterFingerCoinLower > 0 && (e = g_tConst.GameConfig.eWinGood.ZCoin);
              }
              return e;
            }),
            (i.getGameCoinName = function (e) {
              var t = "";
              return (
                g_tConst.GameConfig.eWinGoodCfg[e] &&
                  (t = g_tConst.GameConfig.eWinGoodCfg[e].coinName),
                t
              );
            }),
            (i.updateLabel = function (e) {
              cc.isValid(e) && e._forceUpdateRenderData && e._forceUpdateRenderData(!0);
            }),
            (i.getCoinName = function (e) {
              var t = "";
              return (
                e == g_tConst.GameConfig.eWinGood.Coin && (t = "\u6e38\u620f\u8c46"),
                e == g_tConst.GameConfig.eWinGood.ZCoin && (t = "\u6307\u5c16\u5e01"),
                t
              );
            }),
            (i.getSceneCoinType = function (e) {
              var t = g_tConst.GameConfig.eWinGood.Coin,
                i = g_oData.get(g_tData.mod_gamecfg).getSceneCfgBySceneID(e);
              return (
                i && i.enterFingerCoinLower > 0 && (t = g_tConst.GameConfig.eWinGood.ZCoin),
                t
              );
            }),
            (i.getCoinScaleByGameType = function (e) {
              void 0 === e && (e = null);
              var t = "1",
                i = g_oData.get(g_tData.SwitchModel).getCoinProCfg() || {};
              if (i.isDakai && ((t = i.scaleStr || "1"), e)) {
                var a = e + "";
                i.gameTypeScale && i.gameTypeScale[a] && (t = i.gameTypeScale[a]);
              }
              return t;
            }),
            (i.isDay = function (e) {
              var t = new Date(1e3 * e).getHours();
              return !(t > 0 && t < 7) && ((t >= 7 && t < 24) || void 0);
            }),
            (i.lerp = function (e, t, i) {
              return e + (t - e) * i;
            }),
            (i.ajustFrame = function (e, t) {
              if (cc.isValid(e)) {
                var i = e.node,
                  a = Math.min(1, t / i.width),
                  o = Math.min(1, t / i.height),
                  n = Math.min(a, o);
                ((e.node.width *= n), (e.node.height *= n));
              }
            }),
            (i.getTodayStr = function () {
              var e = g_oData.get(g_tData.sdkLogin).serverTime,
                t = new Date(1e3 * e);
              return t.getFullYear() + "_" + (t.getMonth() + 1) + "_" + t.getDate();
            }),
            (i.isLogin2Hall = function () {
              var e = g_oSceneLoader.getLastScene(),
                t = g_oSceneLoader.getCurScene();
              return e == g_tConst.SceneCfgs.login && t == g_tConst.SceneCfgs.lobby;
            }),
            (i.getTimeAndSteps = function (e, t, i, a, o) {
              void 0 === o && (o = {});
              var n = o.midTime || 0.05,
                s = o.slowTime || 1,
                r = o.slowStepScale || 0,
                c = i,
                l = 0,
                g = [],
                d = n,
                h = s,
                u = c * a;
              l += u += (o.constStepScale || 0) * c;
              for (var _ = 0; _ < u; _++) g.push(d);
              var m = t - e;
              if ((m < c / 2 && (m += c), (m += r * c) > 0))
                for (var f = (h - d) / m, p = 0; p < m; p++) g.push(d + p * f);
              return { awardIndex: t, intervals: g, totalSteps: (l += m) };
            }),
            (i.getSpellName = function (e) {
              for (
                var t = (g_tConst.PluginCfgs[e].spellName || "").split(" "), i = "", a = 0;
                a < t.length;
                ++a
              )
                i += t[a];
              return i;
            }),
            (i.formatFan = function (e) {
              var t = "" + e;
              if (!isNaN(e)) {
                var i = -1;
                ((e = Number(e)) >= 1e8 ? (i = 1) : e >= 1e5 ? (i = 0) : e >= 1e4 && (i = 1),
                  i >= 0 &&
                    (t = this.translateCoinStr(t, {
                      afterNum: i,
                      unitRange: g_tConst.GameUnit.FanUnit,
                    })));
              }
              return t;
            }),
            (i.normcdf = function (e, t, i) {
              return 0.5 * (1 + this.erf((e - t) / Math.sqrt(1.5 * i * i)));
            }),
            (i.erf = function (e) {
              var t,
                i,
                a,
                o,
                n = [
                  -1.3026537197817094, 0.6419697923564902, 0.019476473204185836,
                  -0.00956151478680863, -0.000946595344482036, 0.000366839497852761,
                  42523324806907e-18, -20278578112534e-18, -1624290004647e-18, 130365583558e-17,
                  1.5626441722e-8, -8.5238095915e-8, 6.529054439e-9, 5.059343495e-9,
                  -9.91364156e-10, -2.27365122e-10, 96467911e-18, 2394038e-18, -6886027e-18,
                  894487e-18, 313092e-18, -112708e-18, 381e-18, 7106e-18, -1523e-18, -94e-18,
                  121e-18, -28e-18,
                ],
                s = n.length - 1,
                r = !1,
                c = 0,
                l = 0;
              for (e < 0 && ((e = -e), (r = !0)), i = 4 * (t = 2 / (2 + e)) - 2; s > 0; s--)
                ((a = c), (c = i * c - l + n[s]), (l = a));
              return ((o = t * Math.exp(-e * e + 0.5 * (n[0] + i * c) - l)), r ? o - 1 : 1 - o);
            }),
            (i.formatNumWithThousand = function (e, t, i) {
              if ((void 0 === t && (t = ","), void 0 === i && (i = ""), e > 0)) {
                for (var a = "", o = 0, n = (e + "").split(""), s = n.length - 1; s >= 0; s--)
                  ((o += 1),
                    (a = (n[s] != t && i.length > 0 ? i : n[s]) + a),
                    o % 3 == 0 && 0 != s && (a = t + a));
                return a;
              }
              return "0";
            }),
            (i.getTodayStartTime = function (e) {
              var t = new Date(1e3 * e).setHours(0, 0, 0, 0);
              return Math.trunc(t / 1e3);
            }),
            (i.isGame2Hall = function () {
              var e = g_oSceneLoader.getLastScene(),
                t = g_oSceneLoader.getCurScene();
              return e == g_tConst.SceneCfgs.game && t == g_tConst.SceneCfgs.lobby;
            }),
            (i.mergeGoodsInfo = function (e) {
              var t = [],
                i = {};
              for (var a in (e.forEach(function (e) {
                if (e.type == g_tConst.GameConfig.ItemType.CSFare)
                  if (i[e.type])
                    if (i[e.type][e.subEffectID])
                      i[e.type][e.subEffectID].num =
                        o.Long2Number(e.num) + o.Long2Number(i[e.type][e.subEffectID].num);
                    else {
                      var t = deepClone(e);
                      ((t.num = o.Long2Number(t.num)), (i[e.type][e.subEffectID] = t));
                    }
                  else {
                    var a = deepClone(e);
                    ((a.num = o.Long2Number(a.num)),
                      (i[e.type] = {}),
                      (i[e.type][e.subEffectID] = a));
                  }
                else if (i[e.type])
                  i[e.type].num = o.Long2Number(e.num) + o.Long2Number(i[e.type].num);
                else {
                  var n = deepClone(e);
                  ((n.num = o.Long2Number(n.num)), (i[e.type] = n));
                }
              }),
              i))
                if (i.hasOwnProperty(a))
                  if (a == g_tConst.GameConfig.ItemType.CSFare)
                    for (var n in i[a]) i[a].hasOwnProperty(n) && t.push(i[a][n]);
                  else t.push(i[a]);
              return t;
            }),
            i);
        ((t.exports = o), cc._RF.pop());
      },
      {},
    ],
