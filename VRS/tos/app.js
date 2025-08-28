// app.js
class VehicleRequestSystem {
    constructor() {
        this.vehiclesData = [];
        this.map = null;
        this.markers = [];
        this.notifications = [
            { message: 'Your vehicle request has been approved!', time: '2 minutes ago' },
            { message: 'Vehicle V001 is now available', time: '1 hour ago' },
            { message: 'New request from Sarah Johnson', time: '3 hours ago' }
        ];
        this.requests = [];
        this.pendingRequests = [];
        this.init();
    }

    async init() {
        try {
            // Show loading screen
            document.getElementById('loading').style.display = 'flex';

            // Initialize components
            await this.loadVehicles();
            this.initEventListeners();

            // Hide loading screen and show app
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('app').style.display = 'flex';
                Navigation.showSection('dashboard');
            }, 1500);

        } catch (error) {
            console.error('Error initializing app:', error);
            alert('Failed to load vehicle data. Please try again later.');
        }
    }

    initEventListeners() {
        // Add your event listeners here if needed
    }

    async loadVehicles() {
        try {
            const api = new VehicleAPI();
            const data = await api.fetchVehicles();
            this.vehiclesData = (data.list || []).filter(v => v && v.vehiclenumber);
        } catch (error) {
            console.error('Error loading vehicles:', error); // <-- This will show the real error
            throw error;
        }
    }

    getVehicleStats() {
        const total = this.vehiclesData.length;
        const inUse = this.vehiclesData.filter(v => v.status && v.status.firing === 1).length;
        const available = this.vehiclesData.filter(v => v.status && v.status.firing === 0).length;
        const booked = 0;
        const maintenance = 0;
        return { total, available, booked, inUse, maintenance };
    }

    getVehicleTypes() {
        return [...new Set(this.vehiclesData.map(v => v.type).filter(Boolean))];
    }

    updateVehicleStatus(vehicleId, newStatus) {
        const vehicle = this.vehiclesData.find(v => v.id === vehicleId);
        if (vehicle) {
            vehicle.status = newStatus;
            return true;
        }
        return false;
    }

    addNotification(message) {
        this.notifications.unshift({
            message: message,
            time: 'Just now'
        });

        // Keep only the last 10 notifications
        if (this.notifications.length > 10) {
            this.notifications = this.notifications.slice(0, 10);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VehicleRequestSystem();
});