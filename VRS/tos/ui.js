// ui.js
class UI {
    static showNotifications() {
        const notificationsList = document.getElementById('notifications-list');
        notificationsList.innerHTML = '';

        window.app.notifications.forEach(notification => {
            const notificationElement = document.createElement('div');
            notificationElement.className = 'notification p-3 border-b border-gray-100';
            notificationElement.innerHTML = `
                <p class="text-sm text-gray-800">${notification.message}</p>
                <p class="text-xs text-gray-500 mt-1">${notification.time}</p>
            `;
            notificationsList.appendChild(notificationElement);
        });
    }

    static updateDashboardStats() {
        const stats = window.app.getVehicleStats();

        document.getElementById('total-vehicles').textContent = stats.total;
        document.getElementById('available-vehicles').textContent = stats.available;
        document.getElementById('booked-vehicles').textContent = stats.booked;
        document.getElementById('in-use-vehicles').textContent = stats.inUse;

        document.getElementById('pending-count').textContent = `(${window.app.pendingRequests.length})`;
    }

    static initStatusChart() {
        const ctx = document.getElementById('statusChart').getContext('2d');

        // Destroy existing chart if it exists and has a destroy method
        if (window.statusChart && typeof window.statusChart.destroy === 'function') {
            window.statusChart.destroy();
        }

        const stats = window.app.getVehicleStats();

        window.statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Available', 'Booked', 'In Use', 'Maintenance'],
                datasets: [{
                    data: [stats.available, stats.booked, stats.inUse, stats.maintenance],
                    backgroundColor: [
                        '#10B981',
                        '#F59E0B',
                        '#EF4444',
                        '#6B7280'
                    ],
                    borderWidth: 2,
                    borderColor: '#FFFFFF'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    static initMap() {
        // Clear previous map content
        const mapElement = document.getElementById('map');
        mapElement.innerHTML = '';

        // Initialize markers array
        window.markers = [];

        // Initialize map
        window.map = L.map('map').setView([40.7128, -74.0060], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(window.map);

        UI.updateMapMarkers();
    }

    static updateMapMarkers() {
        // Clear existing markers
        if (window.markers && window.markers.length > 0) {
            window.markers.forEach(marker => {
                window.map.removeLayer(marker);
            });
            window.markers = [];
        }

        // Add new markers
        window.app.vehiclesData.forEach(vehicle => {
            if (vehicle.lastLocation) {
                let color;
                switch (vehicle.status) {
                    case 'available': color = '#10B981'; break;
                    case 'booked': color = '#F59E0B'; break;
                    case 'in-use': color = '#EF4444'; break;
                    case 'maintenance': color = '#6B7280'; break;
                    default: color = '#6B7280';
                }

                const marker = L.marker([vehicle.lastLocation.lat, vehicle.lastLocation.lng]).addTo(window.map);
                marker.bindPopup(`<b>${vehicle.id} - ${vehicle.name}</b><br>Status: ${vehicle.status}<br>License: ${vehicle.licensePlate}<br>Location: ${vehicle.lastLocation.lat.toFixed(4)}, ${vehicle.lastLocation.lng.toFixed(4)}<br>Speed: ${vehicle.speed} mph`);

                window.markers.push(marker);
            }
        });

        // Fit map to markers
        if (window.markers.length > 0) {
            const group = new L.featureGroup(window.markers);
            window.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    static async populateVehiclesGrid() {
        const grid = document.getElementById('vehicles-grid');
        grid.innerHTML = '';

        const vehicles = window.app.vehiclesData || [];
        vehicles.forEach(vehicle => {
            if (vehicle.vehiclenumber) {
                const card = document.createElement('div');
                card.className = 'bg-white p-4 rounded-lg shadow border border-gray-200 flex flex-col space-y-2';
                card.innerHTML = `
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-car text-blue-600 text-2xl"></i>
                        <span class="font-semibold text-gray-800">${vehicle.vehiclenumber}</span>
                    </div>
                    <div class="text-sm text-gray-500">Type: ${vehicle.type || 'N/A'}</div>
                    <div class="text-sm text-gray-500">Status: <span class="font-bold">${vehicle.status?.firing === 1 ? 'In Use' : 'Available'}</span></div>
                    <div class="text-sm text-gray-500">Model: ${vehicle.model || 'N/A'}</div>
                    <div class="text-sm text-gray-500">Year: ${vehicle.year || 'N/A'}</div>
                    <div class="text-sm text-gray-500">Sensors: ${vehicle.sensors_status ? vehicle.sensors_status.length : 0}</div>
                `;
                grid.appendChild(card);
            }
        });
    }

    static populateVehicleManagement() {
        const container = document.getElementById('vehicle-management');
        container.innerHTML = '';

        const grid = document.createElement('div');
        grid.className = 'space-y-3';

        window.app.vehiclesData.forEach(vehicle => {
            const vehicleElement = document.createElement('div');
            vehicleElement.className = 'flex items-center justify-between p-3 border border-gray-200 rounded-lg';
            vehicleElement.innerHTML = `
                <div>
                    <p class="font-medium text-gray-800">${vehicle.id} - ${vehicle.name}</p>
                    <p class="text-sm text-gray-500">${vehicle.status}</p>
                </div>
                <select class="text-sm border border-gray-300 rounded px-2 py-1" data-action="update-status" data-vehicle-id="${vehicle.id}">
                    <option value="available" ${vehicle.status === 'available' ? 'selected' : ''}>Available</option>
                    <option value="booked" ${vehicle.status === 'booked' ? 'selected' : ''}>Booked</option>
                    <option value="in-use" ${vehicle.status === 'in-use' ? 'selected' : ''}>In Use</option>
                    <option value="maintenance" ${vehicle.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                </select>
            `;
            grid.appendChild(vehicleElement);
        });

        container.appendChild(grid);
    }

    static async populateVehicleTypes() {
        const select = document.getElementById('vehicle-type');
        if (!select) return;

        select.innerHTML = '<option value="">Select vehicle type...</option>';
        const vehicles = window.app.vehiclesData || [];
        vehicles.forEach(vehicle => {
            if (vehicle.type) {
                const option = document.createElement('option');
                option.value = vehicle.type;
                option.textContent = vehicle.type;
                select.appendChild(option);
            }
        });
    }

    static async populateVehicleNumbersDropdown() {
        const select = document.getElementById('vehicle-number');
        if (!select) return;

        select.innerHTML = '<option value="">Select vehicle number...</option>';
        const vehicles = window.app.vehiclesData || [];
        vehicles.forEach(vehicle => {
            if (vehicle.vehiclenumber) {
                const option = document.createElement('option');
                option.value = vehicle.vehiclenumber;
                option.textContent = vehicle.vehiclenumber;
                select.appendChild(option);
            }
        });
    }

    static populateRecentRequests() {
        const container = document.getElementById('recent-requests');
        container.innerHTML = '';

        window.app.requests.slice(0, 3).forEach(request => {
            const requestElement = document.createElement('div');
            requestElement.className = 'flex items-center justify-between p-4 border border-gray-200 rounded-lg';
            requestElement.innerHTML = `
                <div class="flex items-center space-x-4">
                    <div class="w-10 h-10 bg-${request.status === 'approved' ? 'blue' : request.status === 'pending' ? 'yellow' : 'red'}-100 rounded-full flex items-center justify-center">
                        <i class="fas fa-user text-${request.status === 'approved' ? 'blue' : request.status === 'pending' ? 'yellow' : 'red'}-600"></i>
                    </div>
                    <div>
                        <p class="font-medium text-gray-800">${request.user}</p>
                        <p class="text-sm text-gray-500">${request.vehicle}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-${request.status === 'approved' ? 'green' : request.status === 'pending' ? 'yellow' : 'red'}-100 text-${request.status === 'approved' ? 'green' : request.status === 'pending' ? 'yellow' : 'red'}-800 capitalize">${request.status}</span>
                    <p class="text-sm text-gray-500 mt-1">${request.status === 'approved' ? 'Today, 10:30 AM' : request.status === 'pending' ? 'Today, 2:15 PM' : 'Yesterday, 4:20 PM'}</p>
                </div>
            `;
            container.appendChild(requestElement);
        });
    }

    static populateMyRequests() {
        const container = document.getElementById('my-requests');
        container.innerHTML = '';

        window.app.requests.forEach(request => {
            const requestElement = document.createElement('div');
            requestElement.className = 'p-4 border border-gray-200 rounded-lg';
            requestElement.innerHTML = `
                <div class="flex items-center justify-between mb-3">
                    <h4 class="font-semibold text-gray-800">${request.vehicle}</h4>
                    <span class="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-${request.status === 'approved' ? 'green' : request.status === 'pending' ? 'yellow' : 'red'}-100 text-${request.status === 'approved' ? 'green' : request.status === 'pending' ? 'yellow' : 'red'}-800 capitalize">${request.status}</span>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                        <p><strong>Pickup:</strong> ${request.pickup}</p>
                        <p><strong>Return:</strong> ${request.return}</p>
                    </div>
                    <div>
                        <p><strong>Purpose:</strong> ${request.purpose}</p>
                        <p><strong>Location:</strong> ${request.location}</p>
                    </div>
                </div>
                <div class="mt-3 flex space-x-2">
                    <button class="text-blue-600 text-sm font-medium hover:text-blue-800" ${request.status !== 'pending' ? 'disabled' : ''}>Edit</button>
                    <button class="text-red-600 text-sm font-medium hover:text-red-800" ${request.status !== 'pending' ? 'disabled' : ''}>Cancel</button>
                </div>
            `;
            container.appendChild(requestElement);
        });
    }

    static populatePendingRequests() {
        const container = document.getElementById('pending-requests');
        container.innerHTML = '';

        window.app.pendingRequests.forEach(request => {
            const requestElement = document.createElement('div');
            requestElement.className = 'p-3 border border-gray-200 rounded-lg';
            requestElement.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <p class="font-medium text-gray-800">${request.user} - ${request.vehicle}</p>
                    <span class="text-xs text-gray-500">${request.timeAgo}</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">${request.purpose}</p>
                <div class="flex space-x-2">
                    <button class="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700" data-action="approve-request" data-request-id="${request.id}">Approve</button>
                    <button class="bg-red-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-red-700" data-action="deny-request" data-request-id="${request.id}">Deny</button>
                </div>
            `;
            container.appendChild(requestElement);
        });
    }

    static clearContent() {
        document.getElementById('content').innerHTML = '';
    }

    static showActiveVehicles() {
        const container = document.getElementById('active-vehicles');
        container.innerHTML = '';

        const vehicles = window.app.vehiclesData || [];
        vehicles.forEach(vehicle => {
            const speed = vehicle.status?.speed ?? 0;
            const ignition = vehicle.status?.firing ?? 0;
            if (speed >= 1 && ignition === 1) {
                const lat = vehicle.status.lat;
                const lon = vehicle.status.lon;
                const locationLink = lat && lon
                    ? `<a href="https://www.google.com/maps?q=${lat},${lon}" target="_blank" class="text-blue-600 underline">View Location</a>`
                    : 'N/A';

                const card = document.createElement('div');
                card.className = 'bg-white p-4 rounded-lg shadow border mb-4';
                card.innerHTML = `
                    <div><strong>Driver Name:</strong> ${vehicle.driver_name || 'N/A'}</div>
                    <div><strong>Vehicle Type:</strong> ${vehicle.type || 'N/A'}</div>
                    <div><strong>Coordinates:</strong> ${lat}, ${lon} ${locationLink}</div>
                `;
                container.appendChild(card);
            }
        });
    }
}

// Fix Leaflet default icon paths
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Make UI available globally
window.UI = UI;