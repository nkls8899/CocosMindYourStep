
import { _decorator, Component, Node, Prefab, instantiate, Vec3, Label } from 'cc';
import { PlayerController } from './PlayerController';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = HameManager
 * DateTime = Wed Feb 02 2022 08:04:42 GMT+0800 (中国标准时间)
 * Author = nkls8899
 * FileBasename = HameManager.ts
 * FileBasenameNoExtension = HameManager
 * URL = db://assets/Scipts/HameManager.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

enum BlockType{
    BT_NONE,
    BT_STONE
}

//游戏状态的枚举类型
enum GameState{
    GS_Init,
    GS_Playing,
    GS_End
}


@ccclass('GameManager')
export class GameManager extends Component {
    //赛道预制
    @property({type:Prefab})
    public cubePrfb : Prefab|null= null;
    //赛道长度
    public  roadLength = 50;
    public  _road:BlockType[] = [];

    @property({type:PlayerController})
    public  playerCtrl:PlayerController|null=null;

    //引用 StartMenu 节点
    @property({type: Node})
    public startMenu: Node | null = null;

    //引用Step统计节点
    @property({type:Label})
    public stepsLabel :Label|null = null;



    start () {
        this.curState=GameState.GS_Init;
            // [3]
        // ?. 可选链写法
        this.playerCtrl?.node.on('JumpEnd', this.onPlayerJumpEnd, this);
    }

    init(){
        if(this.startMenu){
            this.startMenu.active=true;
        }
        this.generateRoad();//生成赛道
        if ((this.playerCtrl)){
            this.playerCtrl.setInputActive(false);
            this.playerCtrl.node.setPosition(Vec3.ZERO);
        }
        this.playerCtrl.reset();
    }
    set curState (value:GameState){
        switch(value) {
            case GameState.GS_Init:
                this.init();
                break;
            case GameState.GS_Playing:
                if (this.startMenu) {
                    this.startMenu.active = false;
                }
                if(this.stepsLabel){
                    this.stepsLabel.string="0";
                }

                // 设置 active 为 true 时会直接开始监听鼠标事件，此时鼠标抬起事件还未派发
                // 会出现的现象就是，游戏开始的瞬间人物已经开始移动
                // 因此，这里需要做延迟处理
                setTimeout(() => {
                    if (this.playerCtrl) {
                        this.playerCtrl.setInputActive(true);
                    }
                }, 0.1);
                break;
            case GameState.GS_End:
                break;
        }
    }
    //对按钮点击事件做出响应
    onStartButtonClicked() {
        this.curState = GameState.GS_Playing;
    }
    private generateRoad() {
        //游戏开始时删除当前所有道路
        this.node.removeAllChildren();
        this._road=[]

        //确保开始时第一个格子是实路
        this._road.push(BlockType.BT_STONE);

        for (let i=1; i<this.roadLength;i++ ){
            //确保不会有两个坑出现
            if(this._road[i-1]===BlockType.BT_NONE){
                this._road.push(BlockType.BT_STONE);
            }
            else
            {
                //随机生成道路
                this._road.push(Math.floor(Math.random()*2))
            }
        }
        //生成赛道
        for (let j=0; j<this.roadLength;j++){
            let block: Node = this.spawnBlockByType(this._road[j]);
            // 判断是否生成了道路，因为 spawnBlockByType 有可能返回坑（值为 null）
            if (block) {
                this.node.addChild(block);
                block.setPosition(j, -1.5, 0);
            }
        }


    }

    // update (deltaTime: number) {
    //     // [4]
    // }
    private spawnBlockByType(blockType: BlockType) {

        if(!this.cubePrfb)
        return undefined;

        let block:Node|null=null;
        switch (blockType){
            case BlockType.BT_STONE:
                block = instantiate(this.cubePrfb);
                break;
        }
        return block;
    }

    //监听角色跳跃事件
    checkResult(moveIndex:number){
        console.log(("resChecked"))
        if(moveIndex<this.roadLength){
            if(this._road[moveIndex] == BlockType.BT_NONE){
                this.curState=GameState.GS_Init;
            }
        }
        //跳过了最大长度
        else{
            this.curState=GameState.GS_Init;
        }
    }
    onPlayerJumpEnd(moveIndex: number) {
        if (this.stepsLabel) {
            // 因为在最后一步可能出现步伐大的跳跃，但是此时无论跳跃是步伐大还是步伐小都不应该多增加分数
            this.stepsLabel.string = '' + (moveIndex >= this.roadLength ? this.roadLength : moveIndex);
        }
        this.checkResult(moveIndex);
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
