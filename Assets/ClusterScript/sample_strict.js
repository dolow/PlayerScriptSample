/**
 * サンプル動作の設定
 */
const config = {
  // サンプル機能のボタン割当て
  sampleButtunAssign: {
    camera: 0,
    customEmote: 1,
    message: 2
  },
  cameraSample: {
    // カメラの方向をアバターが向き続けるかどうか
    forwardLock: true,
    // カメラとアバターの距離
    // この値以外は calcurateAvatarScreenPositionYByAvatarHeight で保証していない
    thirdPersonDistance: 0.7,
    // サポートするアバターの身長
    // この値以外は calcurateAvatarScreenPositionYByAvatarHeight で保証していない
    supportedAvatarHeightMin: 0.7,
    supportedAvatarHeightMax: 1.7,
    // スクリーン内のアバターの横軸の位置
    avatarScreenPositionX: 0.3
  },
  customEmoteSample: {
    // エモートをリピート再生するかどうか
    repeat: true,
    // リピート再生中に再度ボタンを押下してから止まるまでの時間 (sec)
    repeatEaseInterval: 0.15,
  },
  messageSample: {
    // メッセージ送信先のアイテムに加える垂直方向のベロシティの値
    yVelocity: 100,
  },
};


/**
 * 固定値
 */
const iconName = Object.freeze({
  cameraDefault: "camera_default",
  cameraR: "camera_r",
  cameraL: "camera_l",
  jumpPlay: "jump",
  jumpStop: "jump_stop",
  messageOn: "message_on",
  messageOff: "message_off",
});

const messageItemId = "message_sample";
const messageId = "add_velocity";

const animation = _.humanoidAnimation("jump");
const animationLength = animation.getLength();

// カメラモード
const CameraMode = Object.freeze({
  Default:   0, // デフォルトのカメラ
  Right:     1, // 右利き
  Left:      2, // 左利き
  Delimiter: 3,
});

// リピート再生の状態
const RepeatState = Object.freeze({
  Stopped:   0, // 停止中
  Playing:   1, // 再生中
  Finishing: 2  // 停止処理中
});


/**
 * サンプルごとのステートの準備
 */
// カメラ制御サンプル
const cameraState = {
  mode: CameraMode.Default,
};

// カスタムエモートサンプル
const customEmoteState = {
  // エモート再生の経過時間
  duration: -1,
  // リピート再生の状態
  repeatState: RepeatState.Stopped,
  // リピート再生中に再度ボタンを押下して止めている時の経過時間
  repeatEaseDuration: -1,
};


/**
 * setPlayerScript 直後の処理
 * サンプル動作用のボタンを表示します
 */
_.onStart(() => {
  _.showButton(config.sampleButtunAssign.camera, _.iconAsset(iconName.cameraDefault));
  _.showButton(config.sampleButtunAssign.customEmote, _.iconAsset(iconName.jumpPlay));
  _.showButton(config.sampleButtunAssign.message, _.iconAsset(iconName.messageOff));
});


/**
 * カメラの制御サンプル
 * 
 * ボタンを押下すると、三人称視点の画角が通常のカメラの画角よりもアバターに近くなり、肩越しに映すようになります。
 * もう一度ボタンを押下するとデフォルトに戻ります。
 */
_.onButton(config.sampleButtunAssign.camera, (isDown) => {
  // ボタンを離したときは何もしない
  if (!isDown) {
    return;
  }

  const camera = _.cameraHandle;

  // 一人称視点では何もしない
  if (camera.isFirstPersonView()) {
    return;
  }

  // カメラモードは Default -> Right -> Left -> Default と順番に切り替える
  cameraState.mode++;
  if (cameraState.mode >= CameraMode.Delimiter) {
    cameraState.mode = CameraMode.Default;
  }

  let lock, distance, position, icon;

  // ボタンを押す毎にカメラのモードを切り替える
  switch (cameraState.mode) {
    // デフォルトカメラに戻す
    case CameraMode.Default: {
      lock = null;
      distance = null;
      position = null;
      icon = iconName.cameraDefault;
      break;
    }
    case CameraMode.Right: {
      const x = config.cameraSample.avatarScreenPositionX;
      const y = calcurateAvatarScreenPositionYByAvatarHeight();
      lock = config.cameraSample.forwardLock;
      distance = config.cameraSample.thirdPersonDistance;
      position = new Vector2(x, y);
      icon = iconName.cameraR;
      break;
    }
    case CameraMode.Left: {
      const x = 1.0 - config.cameraSample.avatarScreenPositionX;
      const y = calcurateAvatarScreenPositionYByAvatarHeight();
      lock = config.cameraSample.forwardLock;
      distance = config.cameraSample.thirdPersonDistance;
      position = new Vector2(x, y);
      icon = iconName.cameraL;
      break;
    }
    default: {
      throw new Error("unreachable");
    }
  }

  camera.setThirdPersonAvatarForwardLock(lock);
  camera.setThirdPersonDistance(distance, false);
  camera.setThirdPersonAvatarScreenPosition(position, false);
  _.showButton(config.sampleButtunAssign.camera, _.iconAsset(icon));
});


/**
 * カスタムエモートのサンプル
 * 
 * ボタンを押下するとアバターのエモートを再生します。
 * 再生中にもう一度ボタンを押すと最初からの再生になります。
 */
_.onButton(config.sampleButtunAssign.customEmote, (isDown) => {
  if (!isDown) {
    return;
  }

  if (config.customEmoteSample.repeat) {
    switch (customEmoteState.repeatState) {
      case RepeatState.Stopped: {
        customEmoteState.duration = 0;
        customEmoteState.repeatState = RepeatState.Playing;
        customEmoteState.repeatEaseDuration = 0;
        _.showButton(config.sampleButtunAssign.customEmote, _.iconAsset(iconName.jumpStop));
        break;
      }
      case RepeatState.Playing: {
        customEmoteState.repeatState = RepeatState.Finishing;
        customEmoteState.repeatEaseDuration = 0;
        break;
      }
      case RepeatState.Finishing: {
        // 停止処理中は操作を排他する
        break;
      }
    }
  } else {
    customEmoteState.duration = 0;
    _.showButton(config.sampleButtunAssign.customEmote, _.iconAsset(iconName.jumpStop));
  }
});


/**
 * アイテムにメッセージを送るサンプル
 * 
 * ボタンを押下するとアイテムにメッセージを送ります
 * メッセージを受け取ったアイテムは任意の処理を実行できます
 */
_.onButton(config.sampleButtunAssign.message, (isDown) => {
  if (!isDown) {
    _.showButton(config.sampleButtunAssign.message, _.iconAsset(iconName.messageOff));
    return;
  }

  _.showButton(config.sampleButtunAssign.message, _.iconAsset(iconName.messageOn));

  const reference = _.worldItemReference(messageItemId);
  _.sendTo(reference, messageId, config.messageSample.yVelocity);
});


/**
 * 毎フレームの処理 
 * このサンプルでの onFrame はカスタムエモート再生制御のみ取り扱っている
 */
_.onFrame(dt => {
  AnimationSample: {
    if (customEmoteState.duration < 0) {
      break AnimationSample;
    }

    const pose = animation.getSample(customEmoteState.duration);

    customEmoteState.duration += dt;

    if (config.customEmoteSample.repeat) {
      switch (customEmoteState.repeatState) {
        case RepeatState.Stopped: {
          throw new Error("unreachable");
        }
        case RepeatState.Playing: {
          if (customEmoteState.repeatEaseDuration >= 0) {
            const weight = customEmoteState.repeatEaseDuration / config.customEmoteSample.repeatEaseInterval;
            customEmoteState.repeatEaseDuration += dt;
            if (customEmoteState.repeatEaseDuration >= config.customEmoteSample.repeatEaseInterval) {
              customEmoteState.repeatEaseDuration = -1;
            }
            _.setHumanoidPoseOnFrame(pose, weight);
          } else {
            _.setHumanoidPoseOnFrame(pose, 1);
          }

          if (customEmoteState.duration > animationLength) {
            customEmoteState.duration = 0;
          }
          break;
        }
        case RepeatState.Finishing: {
          const weight = 1.0 - (customEmoteState.repeatEaseDuration / config.customEmoteSample.repeatEaseInterval);
          customEmoteState.repeatEaseDuration += dt;
          if (customEmoteState.repeatEaseDuration >= config.customEmoteSample.repeatEaseInterval) {
            customEmoteState.repeatEaseDuration = -1;
            customEmoteState.repeatState = RepeatState.Stopped;
            customEmoteState.duration = -1;
            _.showButton(config.sampleButtunAssign.customEmote, _.iconAsset(iconName.jumpPlay));
          }

          _.setHumanoidPoseOnFrame(pose, weight);
          break;
        }
        default: {
          throw new Error("unreachable");
        }
      }
    } else {
      // エモート開始直後と終了直前に不自然にならないようにブレンドする
      const weight = ease(customEmoteState.duration / animationLength);
      _.setHumanoidPoseOnFrame(pose, weight);
      if (customEmoteState.duration > animationLength) {
        customEmoteState.duration = -1;
        _.showButton(config.sampleButtunAssign.customEmote, _.iconAsset(iconName.jumpPlay));
      }
    }
  }
});

// setThirdPersonAvatarScreenPosition 用のいい感じの Y 軸位置を計算する関数
function calcurateAvatarScreenPositionYByAvatarHeight() {
  const headPos = _.getHumanoidBonePosition(HumanoidBone.Head);
  const pos = _.getPosition();
  const height = headPos.sub(pos).y;

  if (height <= config.cameraSample.supportedAvatarHeightMin) {
    return 1.0;
  }

  if (height >= config.cameraSample.supportedAvatarHeightMax) {
    return 0.0;
  }

  const range = config.cameraSample.supportedAvatarHeightMax - config.cameraSample.supportedAvatarHeightMin;
  return 1.0 - ((height - config.cameraSample.supportedAvatarHeightMin) / range);
}

// アニメーションの最初と最後でイージングする
function ease(rate) {
  let easeRate = Math.max(rate, 0);
  easeRate = Math.min(rate, 1);
  
  return (easeRate < 0.1)
    ? easeRate / 0.1
    : (0.9 < easeRate)
      ? (1 - easeRate) / 0.1
      : 1;
}
