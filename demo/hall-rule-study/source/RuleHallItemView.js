    RuleHallItemView: [
      function (e, t) {
        "use strict";
        cc._RF.push(t, "01969aCGdBNIYJ66DtNEyuR", "RuleHallItemView");
        var i = e("CommonUtils");
        (cc.Class({
          extends: Cls_BaseView,
          properties: {
            lab_comTitle: cc.Label,
            lab_comSpell: cc.Label,
            lab_choTitle: cc.Label,
            lab_choSpell: cc.Label,
            n_choose: cc.Node,
            n_Com: cc.Node,
            itemID: 0,
          },
          Awake: function () {},
          updateItem: function (e, t, a) {
            ((this.itemID = e),
              (this.ruleId = t.id),
              (this.lab_choTitle.string = t.name),
              (this.lab_comTitle.string = t.name));
            var o = i.getSpellName(t.id);
            ((this.lab_comSpell.string = o),
              (this.lab_choSpell.string = o),
              e == a ? this.ON() : this.OFF());
          },
          ON: function () {
            ((this.node.getComponent(cc.Sprite).enabled = !0),
              (this.n_choose.active = !0),
              (this.n_Com.active = !1));
          },
          OFF: function () {
            ((this.node.getComponent(cc.Sprite).enabled = !1),
              (this.n_choose.active = !1),
              (this.n_Com.active = !0));
          },
          dealName: function () {},
          start: function () {},
          onClickChoice: function () {
            var e = new cc.Event.EventCustom("HALLRULE_CLICK_CHOICE", !0);
            (e.setUserData({ itemID: this.itemID }), this.node.dispatchEvent(e));
            var t = new cc.Event.EventCustom("HALLRULE_UPDATA_RULE", !0);
            (t.setUserData({ id: this.ruleId }), this.node.dispatchEvent(t));
          },
        }),
          cc._RF.pop());
      },
      { CommonUtils: "CommonUtils" },
    ],
