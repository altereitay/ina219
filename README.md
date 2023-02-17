# ina219
Repository for working with the INA219 wattmeter sensor in a simple, straight forward way. 

I've built this repo based on this https://github.com/brettmarl/node-ina219.
The main idea to rebuilt it it's to have easier with non callback hell way to communicate and interact with my DFrobot INA219 sensor.  

# Usage
To use the package you can start with this simple code: 
```javascript
const ina219 = require('ina219');

const sensor = new ina219();

sensor.calibrate32V1A();

setInterval(()=>{
    const current = sensor.getCurrent_mA();
    const voltage = sensor.getBusVoltageV();
    const power = current * voltage;
    console.log(`current: ${current} mA, voltage: ${voltage} V, power: ${power} mW`)
}, 1000)
```
This code will give the current (in mili apm) and to voltage (in volt) every second.
</br>
I have the DFrobot version of the sensor which is identical to the original Texas Instrument sensor, 
it's configured to use the 0x45 i2c bus and bus line 1, which are of curse configurable for example:
```javascript
const ina219 = require('ina219');

const sensor = new ina219(0x40, 2);
```
but the default are 0x45 and 1.
<br>
Also the sensor is set to take one sample each 532 micro seconds and the adc resolution is 12 bit,
but to change this (currently) you will need to manually change the package itself but don't worry 
because all the constants are on that file.
<br>
Other than that you can also get the shunt voltage in mV if you would like to.
<br>
Other than that there no much else, you can fork and use this library how ever you like to,
and also sending pull requests to update it. 