const HeosAlarmClock = require('./HeosAlarmClock');

async function initialize() {
  const heosAlarmClock = new HeosAlarmClock(
    {
      ipAddress: process.env.IP_ADDRESS,
      playerId: process.env.PLAYER_ID,
      mediaUrl: process.env.MEDIA_URL
    }
  );

  await heosAlarmClock.setupConnection();
  heosAlarmClock.playMedia();
}

module.exports = initialize();
