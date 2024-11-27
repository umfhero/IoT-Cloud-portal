let bluetoothDevice;
let characteristic;

document.getElementById('connect').addEventListener('click', async () => {
    try {
        console.log('Requesting Bluetooth device...');
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            filters: [
                { name: 'HMSoft' }, // Only show HMSoft devices
                { services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] } // HM-10 UUID
            ]
        });

        console.log('Connecting to GATT server...');
        const server = await bluetoothDevice.gatt.connect();
        console.log('Connected to GATT server');

        const service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
        console.log('Primary service found');

        characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
        console.log('Characteristic found');

        await characteristic.startNotifications();
        console.log('Notifications started');

        characteristic.addEventListener('characteristicvaluechanged', handleData);
    } catch (error) {
        console.error('Connection error:', error);
    }
});

function handleData(event) {
    try {
        const value = new TextDecoder().decode(event.target.value);
        console.log('Raw data received:', value);

        // Get the soil moisture element
        const soilMoistureElement = document.getElementById('soil-moisture');

        if (soilMoistureElement) {
            // Directly update the numeric value
            soilMoistureElement.textContent = `Soil moisture value: ${value.trim()}`;
        } else {
            console.warn('Soil moisture element not found in DOM.');
        }
    } catch (error) {
        console.error('Error processing data:', error);
    }
}
