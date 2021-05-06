

// interface ZanObj {
//     openid: string;
//     timestamp: number;
// }


interface UserData {
    openid: string;
    kv_list: KVItem[];
}
interface KVItem {
    key: string;
    value: string;      // JSON.parse后是GiftRecord
}


interface GiftRecord {
    receiveRecords: ReceiveItem[];
    sendCount: number;
}
interface ReceiveItem {
    fromOpenid: string;
    time: number;
}

// 开放域不能存储数据
export class Data {
    
    static get ZanObj() {
        var value = cc.sys.localStorage.getItem("ZanObj");
        if (value) {
            return JSON.parse(value);
        } else {
            return {};
        }
    }
    static set ZanObj(obj) {
        cc.sys.localStorage.setItem("ZanObj", JSON.stringify(obj));
    }




    // 模拟jsserver接口获得的数据【废弃】
    static getFriendUserStorage(keyList: string[]): {
        user_item: UserData[]
    } {
        var arr: UserData[] = [],
            value = cc.sys.localStorage.getItem("FUStorage");
        // var parse = [
        //     {
        //         openid: "",
        //         kv_list: [
        //             {key:"2019-01-01",value:"GiftRecord_stringfy"}
        //         ]
        //     }
        // ]
        if (value) {
            arr = JSON.parse(value);
        }



        return {
            user_item: arr
        };
    }
    


}