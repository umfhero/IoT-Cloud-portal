let bluetoothDevice;
let characteristic;

document.getElementById('connect').addEventListener('click', async () => {
    try {
        console.log('Requesting Bluetooth device...');
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            filters: [
                { name: 'HMSoft' },
                { services: ['0000ffe0-0000-1000-8000-00805f9b34fb'] }
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

let buffer = ''; // To accumulate incomplete data packets

function handleData(event) {
    const value = new TextDecoder().decode(event.target.value);
    buffer += value; // Add incoming data to the buffer
    console.log('Raw data received:', buffer);

    // Split the buffer into complete lines of data
    const lines = buffer.split('\n');
    buffer = lines.pop(); // Keep any incomplete line in the buffer

    lines.forEach(line => {
        line = line.trim();
        if (line) {
            console.log('Processed line:', line);
            processLine(line);
        }
    });
}

function processLine(line) {
    const sensors = {
        'Gas Sensor': 'gas-sensor',
        'Soil Moisture': 'soil-moisture',
        'Steam Sensor': 'steam-sensor',
        'Photocell Sensor': 'photocell-sensor',
        'Motion Sensor': 'motion-sensor',
    };

    const ranges = {
        'Gas Sensor': { green: [0, 300], orange: [301, 600], red: [601, Infinity] },
        'Steam Sensor': { green: [0, 300], orange: [301, 600], red: [601, Infinity] },
    };

    console.log('Processing line:', line); // Debugging line output

    // Match the sensor name and its value
    for (const [key, id] of Object.entries(sensors)) {
        if (line.startsWith(key)) {
            let dataValue = parseInt(line.split(':')[1]?.trim(), 10);
            const sensorElement = document.getElementById(id);
            const sensorBox = sensorElement?.closest('.sensor-box');

            // Update text content and background colors
            if (key === 'Gas Sensor' || key === 'Steam Sensor') {
                if (dataValue >= ranges[key].green[0] && dataValue <= ranges[key].green[1]) {
                    sensorBox.style.backgroundColor = '#d4edda'; // Green
                } else if (dataValue >= ranges[key].orange[0] && dataValue <= ranges[key].orange[1]) {
                    sensorBox.style.backgroundColor = '#fff3cd'; // Orange
                } else if (dataValue >= ranges[key].red[0]) {
                    sensorBox.style.backgroundColor = '#f8d7da'; // Red
                }
                // Update text content
                sensorElement.textContent = `${key}: ${dataValue}`;
            }

            if (key === 'Soil Moisture') {
                if (dataValue === 0) {
                    sensorElement.textContent = `${key}: Water the soil (Dry!)`;
                    sensorBox.style.backgroundColor = '#f8d7da'; // Red
                } else {
                    sensorElement.textContent = `${key} Value: ${dataValue}`;
                    sensorBox.style.backgroundColor = ''; // No color
                }
            }

            if (key === 'Photocell Sensor') {
                if (dataValue < 200) {
                    // Night condition
                    sensorElement.textContent = `${key}: Night`;
                    sensorBox.style.backgroundColor = ''; // Remove background color
                    sensorBox.style.backgroundImage = "url('pics/Night.jpg')"; // Set night image
                    sensorBox.style.backgroundSize = "cover"; // Ensure image covers the box
                    sensorBox.style.backgroundPosition = "center"; // Center the image
                } else if (dataValue > 500) {
                    // Day condition
                    sensorElement.textContent = `${key}: Day`;
                    sensorBox.style.backgroundColor = ''; // Remove background color
                    sensorBox.style.backgroundImage = "url('pics/day.jpg')"; // Set day image
                    sensorBox.style.backgroundSize = "cover"; // Ensure image covers the box
                    sensorBox.style.backgroundPosition = "center"; // Center the image
                } else {
                    sensorElement.textContent = `${key} Value: ${dataValue}`;
                    sensorBox.style.backgroundColor = ''; // No specific color
                    sensorBox.style.backgroundImage = ''; // Remove background image
                }
            }



            if (key === 'Motion Sensor') {
                if (line.includes('No Motion')) {
                    dataValue = 'No Motion';
                    sensorBox.style.backgroundColor = '#d4edda'; // Green
                } else if (line.includes('Motion Detected')) {
                    dataValue = 'Motion Detected';
                    sensorBox.style.backgroundColor = '#f8d7da'; // Red
                }
                sensorElement.textContent = `${key}: ${dataValue}`;
            }

            return; // Exit after processing the line
        }
    }

    console.warn('Unprocessed line:', line); // Log any unprocessed lines
}
