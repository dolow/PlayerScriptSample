/**
 * setPlayerScript 直後の処理
 * サンプル動作用のボタンを表示します。
 */
_.showButton(0, _.iconAsset("camera_default"));
_.showButton(1, _.iconAsset("jump"));
_.showButton(2, _.iconAsset("message_off"));


/**
 * カメラの制御サンプル
 * 
 * ボタンを押下すると、三人称視点の画角が通常のカメラの画角よりもアバターに近くなり、肩越しに映すようになります。
 * もう一度ボタンを押下するとデフォルトに戻ります。
 */
let cameraEnabled = false;
_.onButton(0, (isDown) => {
  // ボタンを離したときは何もしない
  if (!isDown) {
    return;
  }

  // 今のカメラモードではないモードに変更する
  cameraEnabled = !cameraEnabled;

  // ボタンを押す毎にカメラのモードを切り替える
  if (cameraEnabled) {
    let y = calcurateAvatarScreenPositionYByAvatarHeight();

    _.cameraHandle.setThirdPersonDistance(0.7, false);
    _.cameraHandle.setThirdPersonAvatarScreenPosition(new Vector2(0.3, y), false);
  } else {
    _.cameraHandle.setThirdPersonDistance(null, false);
    _.cameraHandle.setThirdPersonAvatarScreenPosition(null, false);
  }
});


/**
 * カスタムエモートのサンプル
 * 
 * ボタンを押下するとアバターのエモートを再生します。
 * 再生中にもう一度ボタンを押すと最初からの再生になります。
 */
let emoteDuration = -1;
let animation = _.humanoidAnimation("jump");
let animationLength = animation.getLength();
_.onButton(1, (isDown) => {
  if (!isDown) {
    return;
  }
  emoteDuration = 0;
});


/**
 * アイテムにメッセージを送るサンプル
 * 
 * ボタンを押下するとアイテムにメッセージを送ります。
 * メッセージを受け取ったアイテムは任意の処理を実行できます。
 */
_.onButton(2, (isDown) => {
  if (!isDown) {
    return;
  }

  let reference = _.worldItemReference("message_sample");
  _.sendTo(reference, "add_velocity", 100);
});


/**
 * 毎フレームの処理 
 * このサンプルでの onFrame はカスタムエモート再生制御のみ取り扱っています。
 */
_.onFrame(dt => {
  if (emoteDuration < 0) {
    return;
  }

  let pose = animation.getSample(emoteDuration);
  _.setHumanoidPoseOnFrame(pose, 1.0);

  emoteDuration += dt;
  if (emoteDuration > animationLength) {
    emoteDuration = -1;
  }
});

// setThirdPersonAvatarScreenPosition 用のいい感じの Y 軸位置を計算する関数
function calcurateAvatarScreenPositionYByAvatarHeight() {
  let headPos = _.getHumanoidBonePosition(HumanoidBone.Head);
  let pos = _.getPosition();
  let height = headPos.sub(pos).y;

  if (height <= 0.7) {
    return 1.0;
  }

  if (height >= 1.7) {
    return 0.0;
  }

  return 1.0 - ((height - 0.7) / 1.0);
}