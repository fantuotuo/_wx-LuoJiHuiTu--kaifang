// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    

    _act: boolean = false;
    get act() {
        return this._act;
    }
    set act(v) {
        this._act = v;
        // 
        this.sp.spriteFrame = v ? this.spGreen : this.spWhite;
        this.label.node.color = v ? cc.color(255, 255, 255) : cc.color(17, 17, 17);
    }



    @property(cc.Sprite)
    sp: cc.Sprite = null;
    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Node)
    nodeCanvas: cc.Node = null;
    @property(cc.Integer)
    index: number = 0;


    @property(cc.SpriteFrame)
    spWhite: cc.SpriteFrame = null;
    @property(cc.SpriteFrame)
    spGreen: cc.SpriteFrame = null;



    onTouch() {
        this.nodeCanvas.getComponent("Main").rankType = this.index;
    }


    onEnable() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouch, this);
    }
    onDisable() {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouch, this);
    }





}
