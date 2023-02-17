const i2c = require('i2c-bus');

const INA219_ADDRESS = 0x40
const INA219_ADDRESS_A0 = 0x41
const INA219_ADDRESS_A1 = 0x44
const INA219_ADDRESS_A0_A1 = 0x45
const INA219_READ = 0x01
const INA219_REG_CONFIG = 0x00
const INA219_CONFIG_RESET = 0x8000
const INA219_CONFIG_BVOLTAGERANGE_MASK = 0x2000
const INA219_CONFIG_BVOLTAGERANGE_16V = 0x0000
const INA219_CONFIG_BVOLTAGERANGE_32V = 0x2000
const INA219_CONFIG_GAIN_MASK = 0x1800
const INA219_CONFIG_GAIN_1_40MV = 0x0000
const INA219_CONFIG_GAIN_2_80MV = 0x0800
const INA219_CONFIG_GAIN_4_160MV = 0x1000
const INA219_CONFIG_GAIN_8_320MV = 0x1800
const INA219_CONFIG_BADCRES_MASK = 0x0780
const INA219_CONFIG_BADCRES_9BIT = 0x0080
const INA219_CONFIG_BADCRES_10BIT = 0x0100
const INA219_CONFIG_BADCRES_11BIT = 0x0200
const INA219_CONFIG_BADCRES_12BIT = 0x0400
const INA219_CONFIG_SADCRES_MASK = 0x0078
const INA219_CONFIG_SADCRES_9BIT_1S_84US = 0x0000
const INA219_CONFIG_SADCRES_10BIT_1S_148US = 0x0008
const INA219_CONFIG_SADCRES_11BIT_1S_276US = 0x0010
const INA219_CONFIG_SADCRES_12BIT_1S_532US = 0x0018
const INA219_CONFIG_SADCRES_12BIT_2S_1060US = 0x0048
const INA219_CONFIG_SADCRES_12BIT_4S_2130US = 0x0050
const INA219_CONFIG_SADCRES_12BIT_8S_4260US = 0x0058
const INA219_CONFIG_SADCRES_12BIT_16S_8510US = 0x0060
const INA219_CONFIG_SADCRES_12BIT_32S_17MS = 0x0068
const INA219_CONFIG_SADCRES_12BIT_64S_34MS = 0x0070
const INA219_CONFIG_SADCRES_12BIT_128S_69MS = 0x0078
const INA219_CONFIG_MODE_MASK = 0x0007
const INA219_CONFIG_MODE_POWERDOWN = 0x0000
const INA219_CONFIG_MODE_SVOLT_TRIGGERED = 0x0001
const INA219_CONFIG_MODE_BVOLT_TRIGGERED = 0x0002;
const INA219_CONFIG_MODE_SANDBVOLT_TRIGGERED = 0x0003
const INA219_CONFIG_MODE_ADCOFF = 0x0004
const INA219_CONFIG_MODE_SVOLT_CONTINUOUS = 0x0005
const INA219_CONFIG_MODE_BVOLT_CONTINUOUS = 0x0006
const INA219_CONFIG_MODE_SANDBVOLT_CONTINUOUS = 0x0007
const INA219_REG_SHUNTVOLTAGE = 0x01
const INA219_REG_BUSVOLTAGE = 0x02
const INA219_REG_POWER = 0x03
const INA219_REG_CURRENT = 0x04
const INA219_REG_CALIBRATION = 0x05


class ina219 {
    constructor (addr = INA219_ADDRESS_A0_A1, bus = 1) {
        this.address = addr;
        this.bus = bus;
        this.currentDivider = 0;
        this.powerDivider = 0;
        this.calValue = 0;
        this.wire = i2c.openSync(this.bus);
    }

    writeRegister (reg, val) {
        let bytes = Buffer.alloc(2);
        bytes[0] = (val >> 8) & 0xFF;
        bytes[1] = val & 0xFF;
        this.wire.writeI2cBlockSync(this.address, reg, 2, bytes)
    }

    readRegister (reg) {
        let buff = Buffer.alloc(2);
        this.wire.readI2cBlockSync(this.address, reg, 2, buff);
        let value = buff.readInt16BE();
        return value;
    }

    calibrate32V1A () {
        this.calValue = 10240;
        this.currentDivider = 25;
        this.powerDivider = 1;
        this.writeRegister(INA219_REG_CALIBRATION, this.calValue);
        const config = INA219_CONFIG_BVOLTAGERANGE_32V |
            INA219_CONFIG_GAIN_8_320MV |
            INA219_CONFIG_BADCRES_12BIT |
            INA219_CONFIG_SADCRES_12BIT_1S_532US |
            INA219_CONFIG_MODE_SANDBVOLT_CONTINUOUS;
        this.writeRegister(INA219_REG_CONFIG, config);
    }

    calibrate32V2A () {
        this.calValue = 4096;
        this.currentDivider = 10;
        this.powerDivider = 2;
        this.writeRegister(INA219_REG_CALIBRATION, this.calValue);
        const config = INA219_CONFIG_BVOLTAGERANGE_32V |
            INA219_CONFIG_GAIN_8_320MV |
            INA219_CONFIG_BADCRES_12BIT |
            INA219_CONFIG_SADCRES_12BIT_1S_532US |
            INA219_CONFIG_MODE_SANDBVOLT_CONTINUOUS;
        this.writeRegister(INA219_REG_CONFIG, config);
    }

    getBusVoltageRaw () {
        let value = this.readRegister(INA219_REG_BUSVOLTAGE);
        return ((value >> 3) * 4);
    }

    getShuntVoltageRaw () {
        return this.readRegister(INA219_REG_SHUNTVOLTAGE);
    }

    getCurrent_mA () {
        this.writeRegister(INA219_REG_CALIBRATION, this.calValue);
        return this.readRegister(INA219_REG_CURRENT);
    }

    getBusVoltageV () {
        return this.getBusVoltageRaw() * 0.001;
    }

    getShuntVoltage_mV () {
        return this.getShuntVoltageV() * 0.01;
    }
}

module.exports = ina219;