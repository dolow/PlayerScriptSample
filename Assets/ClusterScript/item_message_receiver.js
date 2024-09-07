const messageId = "add_velocity";

$.onStart(() => {
  $.state.addForceVelocity = 0;
});

$.onReceive((type, velocity, sender) => {
  // 関係のないメッセージは捨てる
  if (type !== messageId) {
    return;
  }

  $.state.addForceVelocity = velocity
}, {player: true});

$.onPhysicsUpdate((dt) => {
  if ($.state.addForceVelocity > 0) {
    $.addForce(new Vector3(0, $.state.addForceVelocity, 0));
    $.state.addForceVelocity = 0;
  }
});