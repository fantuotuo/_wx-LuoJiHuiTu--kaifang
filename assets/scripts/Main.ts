var wx = window["wx"];

const { ccclass, property } = cc._decorator;
import UserBar from "./UserBar";
import Toggle from "./Toggle";


interface WorldRankData {
    score: number;
    _id: string;
    _openid: string;

    avatarUrl: string;
    nickName: string;
}
interface UserGameData {
    avatarUrl: string;
    nickname: string;
    openid: string;
    KVDataList: KVData[];
}
interface KVData {
    key: string;
    value: string;
}
interface UserInfo {
    avatarUrl: string;
    nickName: string;
    openId: string;
    privince: string;
}


@ccclass
export default class NewClass extends cc.Component {
    

    private selfOpenid: string = "";
    private selfCoinNum: number = 0;
    private giftCountRemaining: number = 0;         // 当前还有几次
    private initGiftCountRemaining: number = 5;     // 初始次数
    private friendsDataList: UserGameData[] = [];
    private worldDataList: WorldRankData[] = [];
    private giftStorageKey: string = new Date().toDateString();

    _rankType: number = 0;
    get rankType() {
        return this._rankType;
    }
    set rankType(v) {
        this._rankType = v;
        // 
        this.toggleArr.forEach((toggle, i) => {
            toggle.act = v === i;
        });
        if (v === 0) {
            this.drawRankList();
        } else {
            this.drawWorldRankList();
        }
    }





    @property(cc.Prefab)
    prefabUserBar: cc.Prefab = null;

    

    @property(cc.Node)
    containerUserBar: cc.Node = null;
    @property(cc.Label)
    labelMyName: cc.Label = null;
    @property(cc.Label)
    labelMyScore: cc.Label = null;
    @property(cc.Sprite)
    spMyAvatar: cc.Sprite = null;
    @property(Toggle)
    toggleArr: Toggle[] = [];




    /**
     * 获取好友托管数据
    */
    initFriendsData() {
        wx.getFriendCloudStorage({
            keyList: ['stars', this.giftStorageKey],
            success: ({ data }: { data: UserGameData[] }) => {
                this.log("成功获取好友数据：", data);
                
                this.friendsDataList = data
                // 初始化剩余赠送次数
                const self = this.friendsDataList.find(item => item.openid === this.selfOpenid);
                if (self) {
                    this.labelMyName.string = `${self.nickname}`;
                    this.labelMyScore.string = `${this.getScore(self.KVDataList)}`;
                    var avatar = this.spMyAvatar;
                    cc.loader.load({ url: self.avatarUrl, type: 'jpg' }, function (err, tex) {
                        avatar.spriteFrame = new cc.SpriteFrame(tex);
                    });
                }

                let selfGiftData = self.KVDataList.find(item => item.key === this.giftStorageKey)
                if (selfGiftData) {
                    let selfGiftDataObj: { sendCount: number } = JSON.parse(selfGiftData.value);
                    this.giftCountRemaining = this.initGiftCountRemaining - selfGiftDataObj.sendCount
                } else {
                    this.giftCountRemaining = this.initGiftCountRemaining
                }

                this.rankType===0 && this.drawRankList()
                this.drawGiftCountRemaining()
            }
        })
    }
    /**
     * 刷新显示
    */
    drawRankList() {
        this.containerUserBar.removeAllChildren();
        this.sortArray(this.friendsDataList);

        // 显示20个
        var friendsDataList = this.friendsDataList.slice(0, 20);
        for (var i = 0; i < friendsDataList.length; i++){
            var item = cc.instantiate(this.prefabUserBar);
            item.parent = this.containerUserBar;

            var obj = friendsDataList[i],
                comp = item.getComponent(UserBar);
            comp.init(
                i + 1,
                obj.avatarUrl,
                obj.nickname,
                this.getScore(obj.KVDataList),
                obj.openid
            );
            // 更新zanBtn显示
            comp.selfOpenid = this.selfOpenid;
        }
    }
    drawWorldRankList() {
        this.containerUserBar.removeAllChildren();

        // 显示20个
        var worldDataList = this.worldDataList.slice(0, 20);
        for (var i = 0; i < worldDataList.length; i++){
            var item = cc.instantiate(this.prefabUserBar);
            item.parent = this.containerUserBar;

            var obj = worldDataList[i],
                comp = item.getComponent(UserBar);
            comp.init(
                i + 1,
                obj.avatarUrl,
                obj.nickName,
                obj.score.toString(),
                obj._openid
            );
            // if (this.selfOpenid && this.selfOpenid !== obj._openid) {
            //     comp.nodeBtnZan.active = true;
            // }
        }
    }
    drawGiftCountRemaining() {
        
    }





    onLoad() {
        this.log("sub load");
        if (!this.isWechat()) return;
        this.rankType = 0;

        wx.onMessage(data => {
            this.log("接收主域发来的消息数据：", data);
            switch (data.messageType) {
                case 0:
                    this.selfOpenid = data.selfOpenid;
                    this.initFriendsData();
                    break;
                case 1:
                    // 世界
                    this.worldDataList = data.rankdata as WorldRankData[];
                    wx.getUserInfo({
                        openIdList: data.rankdata.map(item => {
                            return item._openid;
                        }),
                        lang: 'zh_CN',
                        success: (res: { data: UserInfo[] }) => {
                            this.updateWorldDataItem(res.data);
                        },
                        fail: (res) => {
                            
                        }
                    });
                    break;
                default:
                    break;
            }
        });
    }




    /**
     * 更新世界数据
    */
    updateWorldDataItem(data: UserInfo[]) {
        console.log("updateWorldDataItem",data)
        for (var k = 0; k < this.worldDataList.length; k++){
            var o = this.worldDataList[k];
            var info = data.find(item => {
                console.log(item.openId, o._openid)
                item.openId === o._openid;
            });
            if (info) {
                o.nickName = info.nickName;
                o.avatarUrl = info.avatarUrl;
            }
        }
        this.rankType === 1 && this.drawWorldRankList();
    }
    isWechat() { 
        return cc.sys.platform === cc.sys.WECHAT_GAME || cc.sys.platform === cc.sys.WECHAT_GAME_SUB;
    }
    log(...params: any) {
        params[0] = `【开放域】${params[0]}`;
        console.log(...params);
    }
    /**
     * 对数组进行排序处理（倒序）
     * @param data UserGameData数组
     * @param key 需要排序的key
    */
    sortArray(data: UserGameData[]) {
        data.sort((a, b) => {
            var scoreA = this.getScore(a.KVDataList),
                scoreB = this.getScore(b.KVDataList);
            // 从大到小排列
            return parseInt(scoreB) - parseInt(scoreA);
        });
    }
    /**
     * 根据KVDATA数组获取对应的分数数据
     * @param KVDataList KVData数组
     * @param key 要获取的key值
     * @return score string类型
    */
    getScore(KVDataList: KVData[]) {
        for (var i = 0; i < KVDataList.length; i++){
            if (KVDataList[i].key === "stars") {
                return KVDataList[i].value;
            }
        }
        return "-";
    }
    /**
     * 获取我的：基本信息、托管数据【作废】
     * @param key 获取的键值
    */
    getMyRank(key: string) {
        this.log("getMyRank--begin")
        var score: string, name: string, avatarUrl: string;
        if (!this.isWechat()) return;
        
        wx.getUserCloudStorage({
            keyList: [key],
            success: (res: { KVDataList: KVData[] }) => {
                score = this.getScore(res.KVDataList);
                this.labelMyScore.string = `${score}星`;
            },
            fail: res => {
                this.log("失败：wx.getUserCloudStorage");
            }
        });
        wx.getUserInfo({
            openIdList: ["selfOpenId"],

            success: (res: { data: UserInfo[] }) => {
                this.log("成功获取用户信息", res);
                var data = res.data;
                if (data && data.length > 0) {
                    var obj = data[0];
                    name = obj.nickName;
                    avatarUrl = obj.avatarUrl;
                    // 缓存myAvantarUrl
                    // this.myAvantarUrl = avatarUrl;
                    
                    this.labelMyName.string = `${name}`;
                    var spMyAvatar = this.spMyAvatar;
                    cc.loader.load({ url: avatarUrl, type: 'jpg' }, function (err, tex) {
                        spMyAvatar.spriteFrame = new cc.SpriteFrame(tex);
                    });
                }
            },
            fail: res => {
                this.log("失败：获取用户信息", res);
            },
            complete: res => {
                
            }
        });
    }
}