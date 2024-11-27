let bluetoothDevice;
let characteristic;

document.getElementById('connect').addEventListener('click', async () => {
    try {
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            filters: [
                { name: 'HMSoft' },
                { services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }
            ]
        });

        const server = await bluetoothDevice.gatt.connect();
        const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        await characteristic.startNotifications();
        characteristic.addEventListener('characteristicvaluechanged', handleData);
    } catch (error) {
        console.error('Connection error:', error);
    }
});

function handleData(event) {
    const value = new TextDecoder().decode(event.target.value);
    console.log('Raw data received:', value);

    if (value.startsWith('Gas:')) {
        document.getElementById('gas-sensor').textContent = value.split(':')[1];
    } else if (value.startsWith('Light:')) {
        document.getElementById('light-sensor').textContent = value.split(':')[1];
    } else if (value.startsWith('Rain:')) {
        document.getElementById('rain-sensor').textContent = value.split(':')[1];
    } else if (value.startsWith('Soil:')) {
        document.getElementById('soil-moisture').textContent = value.split(':')[1];
    } else if (value.startsWith('Infrared:')) {
        document.getElementById('infrared-sensor').textContent = value.split(':')[1];
    }
}

// Commands for LEDs
document.getElementById('white-led-on').addEventListener('click', () => sendCommand('WHITE_LED_ON'));
document.getElementById('white-led-off').addEventListener('click', () => sendCommand('WHITE_LED_OFF'));
document.getElementById('yellow-led-on').addEventListener('click', () => sendCommand('YELLOW_LED_ON'));
document.getElementById('yellow-led-off').addEventListener('click', () => sendCommand('YELLOW_LED_OFF'));

// Commands for Fan
document.getElementById('fan-on').addEventListener('click', () => sendCommand('FAN_ON'));
document.getElementById('fan-off').addEventListener('click', () => sendCommand('FAN_OFF'));

// Commands for Servo
document.getElementById('servo-left').addEventListener('click', () => sendCommand('SERVO_LEFT'));
document.getElementById('servo-right').addEventListener('click', () => sendCommand('SERVO_RIGHT'));

function sendCommand(command) {
    if (characteristic) {
        characteristic.writeValue(new TextEncoder().encode(command + '\n'));
        console.log('Command sent:', command);
    } else {
        console.error('Bluetooth not connected.');
    }
}
