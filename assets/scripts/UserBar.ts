import { Data } from "./Data";


const { ccclass, property } = cc._decorator;
const wx = window["wx"];

interface ZanObjCValue {
    
}

@ccclass
export default class NewClass extends cc.Component {
    

    openid: string = "";
    _selfOpenid: string = "";
    get selfOpenid() {
        return this._selfOpenid;
    }
    set selfOpenid(v) {
        this._selfOpenid = v;
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
        this.labelName.string = `${name?name:"未知姓名"}`;
        this.labelScore.string = `${score}星`;
        
        var avatar = this.avatar;
        cc.loader.load({ url: avatarUrl, type: 'jpg' }, function (err, tex) {
            avatar.spriteFrame = new cc.SpriteFrame(tex);
        });

        this.nodeBtnZan.active = false;
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
                wx.showModal({
                    title: "点赞失败！",
                    content: "一天只能给同一个人点赞一次哦！",
                    showCancel: false,
                });
            }
        });
    }
    checkCanZan() {
        var openidSame = !this.selfOpenid || this.selfOpenid === this.openid;
        this.nodeBtnZan.active = !openidSame;
        return;

        var ZanObj = Data.ZanObj,
            key = new Date().toDateString(),
            ZanObjToday = ZanObj[key] as string[];
        var ZanPre = ZanObjToday && ZanObjToday.indexOf(this.openid) >= 0;

        this.nodeBtnZan.active = !openidSame && !ZanPre;
    }
}