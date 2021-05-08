

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    


    @property(cc.Label)
    labelContent: cc.Label = null;




    show(str: string) {
        this.node.active = true;

        this.labelContent.string = str;
    }
    hide() {
        this.node.active = false;
    }




}
