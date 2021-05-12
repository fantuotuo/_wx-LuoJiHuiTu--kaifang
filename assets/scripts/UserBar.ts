import { Data } from "./Data";
import Modal from "./Modal";


const { ccclass, property } = cc._decorator;
const wx = window["wx"];

interface ZanObjCValue {
    
}

@ccclass
export default class NewClass extends cc.Component {
    

    openid: string = "";
    _canGift: boolean = false;
    get canGift() {
        return this._canGift;
    }
    set canGift(v) {
        this._canGift = v;
        // 
        this.checkCanZan();
    }


    @property(cc.Label)
    labelRank: cc.Label = null;
    @property(cc.Sprite)
    avatar: cc.Sprite = null;
    @property(cc.Label)
    labelName: cc.Label = null;
    @property(cc.Label)
    labelScore: cc.Label = null;
    @property(cc.Node)
    nodeBtnZan: cc.Node = null;


    /**
     * @param rank 排名
     * @param acatarUrl 头像地址
     * @param name 姓名
     * @param score 分数
     * @param openid openid
    */
    init(rank: number, avatarUrl: string, name: string, score: string, openid: string) {
        this.openid = openid;
        this.labelRank.string = `${rank}`;
        this.labelName.string = `${name ? name : "未知昵称"}`;
        this.labelScore.string = `${score}星`;
        
        var avatar = this.avatar;
        cc.loader.load({ url: avatarUrl, type: 'jpg' }, function (err, tex) {
            avatar.spriteFrame = new cc.SpriteFrame(tex);
        });

        this.canGift = false;
    }



    onTouchBtnZan() {
        if (!wx) return;

        this.nodeBtnZan.active = false;
        wx.modifyFriendInteractiveStorage({
            key: "1",
            opNum: 1,
            operation: "add",
            toUser: this.openid,
            title: "给你点赞了，赶快打开游戏看看吧",
            success: (res) => {
                console.log("点赞成功！", res);
                return;

                // 更新
                var ZanObj = Data.ZanObj;
                var key = new Date().toDateString(),
                    ZanObjToday = ZanObj[key] as string[];
                if (!ZanObjToday) ZanObjToday = [];
                ZanObjToday.push(this.openid);
                ZanObj[key] = ZanObjToday;
                Data.ZanObj = ZanObj;
                this.checkCanZan();
            },
            fail: (res) => {
                this.showModal("一天只能给同一个人点赞一次哦！");
            }
        });
    }
    checkCanZan() {
        this.nodeBtnZan.active = this.canGift;
    }
    showModal(str: string) {
        var node = cc.find("Canvas/modal");
        if (!node) return;
        var comp = node.getComponent(Modal);
        if (!comp) return;
        comp.show(str);
    }
}