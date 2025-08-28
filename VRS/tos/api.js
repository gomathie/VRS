// api.js
class VehicleAPI {
    constructor() {
        this.apiUrl = 'cars.json';
    }

    async fetchVehicles() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, body: ${text}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error('Response is not JSON: ' + text);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Failed to fetch vehicles:', error);
            throw error;
        }
    }
}

window.VehicleAPI = VehicleAPI;

const api = new VehicleAPI();
api.fetchVehicles().then(data => {
    console.log('Current vehicle data:', data);
    const vehicleSelect = document.getElementById('vehicle-number');
    if (!vehicleSelect) {
        console.warn('Vehicle select element not found');
        return;
    }
    (data.list || []).forEach(vehicle => {
        if (vehicle.vehiclenumber) {
            const option = document.createElement('option');
            option.value = vehicle.vehiclenumber;
            option.textContent = vehicle.vehiclenumber;
            vehicleSelect.appendChild(option);
        }
    });

    // Update vehicle counts
    document.getElementById('total-vehicles').textContent = `Total Vehicles: ${data.list.length}`;
    const availableCount = data.list.filter(v => v.status === 'available').length;
    document.getElementById('available-vehicles').textContent = `Available Vehicles: ${availableCount}`;
    const bookedCount = data.list.filter(v => v.status === 'booked').length;
    document.getElementById('booked-vehicles').textContent = `Booked Vehicles: ${bookedCount}`;
    const inUseCount = data.list.filter(v => v.status === 'in-use').length;
    document.getElementById('in-use-vehicles').textContent = `In Use Vehicles: ${inUseCount}`;
    const pendingCount = data.list.filter(v => v.status === 'pending').length;
    document.getElementById('pending-count').textContent = `Pending Vehicles: ${pendingCount}`;
}).catch(err => {
    console.error('API error:', err);
});
<div>
    <select id="vehicle-number"></select>
    <script src="api.js"></script>
    <script src="app.js"></script>
    <script src="ui.js"></script>
    <script src="navigation.js"></script>
    <span id="total-vehicles"></span>
    <span id="available-vehicles"></span>
    <span id="booked-vehicles"></span>
    <span id="in-use-vehicles"></span>
    <span id="pending-count"></span>
</div>