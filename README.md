# HEOS Alarm Clock

Use your HEOS player as an alarm clock

## Install and configuration

1. `git clone git@github.com:maszaa/heos-alarm-clock.git`
2. `cd heos-alarm-clock`
3. `npm install`
4. `cp configuration/example.configuration.json configuration/configuration.json`
5. Fill `configuration/configuration.json` with your HEOS player IP address,
the HEOS command you want to fire and the HEOS payload you want to fire the command with.
Also edit crontabs (`cron`) if needed.
7. [Optional] Setup logging: `loggers` or any other (full absolute) path defined as `LOGGER_PATH` environmental variable
should include `.js` files that export objects like
```js
{
  debug?: <function | Array[function]>,
  info?: <function | Array[function]>,
  warn?: <function | Array[function]>,
  error?: <function | Array[function]>
}
```
8. `npm start`
