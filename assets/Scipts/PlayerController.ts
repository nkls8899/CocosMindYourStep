
import { _decorator, Component, Node, Vec3, systemEvent, SystemEvent, SystemEventType, EventMouse,Animation, SkeletalAnimation} from 'cc';

const {ccclass, property} = _decorator;

/**
 * Predefined variables
 * Name = NewComponent
 * DateTime = Tue Feb 01 2022 19:45:44 GMT+0800 (中国标准时间)
 * Author = nkls8899
 * FileBasename = NewComponent.ts
 * FileBasenameNoExtension = NewComponent
 * URL = db://assets/Scipts/NewComponent.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */


@ccclass("PlayerController")

export class PlayerController extends Component {
  /*  @property({type:Animation})
    public BodyAnim:Animation | null = null;*/

    @property({type:SkeletalAnimation})
    public CocosAnim:SkeletalAnimation|null = null;
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;

    // for fake tween
    // 是否接收到跳跃指令
    private _startJump: boolean = false;
    // 跳跃步长
    private _jumpStep: number = 0;
    // 当前跳跃时间
    private _curJumpTime: number = 0;
    // 每次跳跃时常
    private _jumpTime: number = 0.5;
    // 当前跳跃速度
    private _curJumpSpeed: number = 0;
    // 当前角色位置
    private _curPos: Vec3 = new Vec3();
    // 每次跳跃过程中，当前帧移动位置差
    private _deltaPos: Vec3 = new Vec3(0, 0, 0);
    // 角色目标位置
    private _targetPos: Vec3 = new Vec3();
    //当前跳跃所在方块
    private _curMoveIndex = 0;


    start () {
        // Your initialization goes here.
        systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
    }
    //动态地开启和关闭角色对鼠标消息的监听
    setInputActive(active: boolean) {
        if (active) {
            systemEvent.on(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
        } else {
            systemEvent.off(SystemEvent.EventType.MOUSE_UP, this.onMouseUp, this);
        }
    }

    onMouseUp(event: EventMouse) {
        if (event.getButton() === 0) {
            this.jumpByStep(1);
        }
        else if (event.getButton() === 1) {
            this.jumpByStep(-1);
        }

        else if (event.getButton() === 2) {
            this.jumpByStep(2);

        }

    }

    jumpByStep(step: number) {
        if (this._startJump) {
            return;
        }
        if(this.CocosAnim){
            this.CocosAnim.getState('cocos_anim_jump').speed=3.5;//加速播放
            this.CocosAnim.play('cocos_anim_jump');
        }
        this._startJump = true;
        this._jumpStep = step;
        this._curJumpTime = 0;
        this._curJumpSpeed = this._jumpStep / this._jumpTime;
        this.node.getPosition(this._curPos);
        Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep, 0, 0));
        this._curMoveIndex += step;
        console.log(this._curMoveIndex)

    }

    update (deltaTime: number) {
        if (this._startJump) {
            this._curJumpTime += deltaTime;
            if (this._curJumpTime > this._jumpTime) {
                // end
                this.node.setPosition(this._targetPos);
                this._startJump = false;
                this.node.emit('JumpEnd', this._curMoveIndex);
                if (this.CocosAnim) {
                    this.CocosAnim.play('cocos_anim_idle');
                }
            } else {
                // tween
                this.node.getPosition(this._curPos);
                this._deltaPos.x = this._curJumpSpeed * deltaTime;
                Vec3.add(this._curPos, this._curPos, this._deltaPos);
                this.node.setPosition(this._curPos);
            }
        }
    }



    reset() {
        this._curMoveIndex = 0;
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
