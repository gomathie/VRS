// navigation.js
class Navigation {
    static showSection(sectionId) {
        // Clear current content
        UI.clearContent();

        // Get template
        const template = document.getElementById(`${sectionId}-template`);
        if (!template) {
            console.error(`Template for ${sectionId} not found`);
            return;
        }

        // Clone template content
        const content = document.importNode(template.content, true);
        document.getElementById('content').appendChild(content);

        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'requests': 'My Requests',
            'vehicles': 'Vehicles',
            'request-form': 'Request Vehicle',
            'admin': 'Admin Panel'
        };
        document.getElementById('page-title').textContent = titles[sectionId] || 'Dashboard';

        // Initialize section-specific functionality
        this.initSection(sectionId);

        if (sectionId === 'dashboard') {
            // Only call after template is rendered
            UI.updateDashboardStats();
        }
    }

    static initSection(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                UI.updateDashboardStats();
                UI.initStatusChart();
                UI.initMap();
                UI.populateRecentRequests();
                break;

            case 'requests':
                UI.populateMyRequests();
                break;

            case 'vehicles':
                UI.populateVehiclesGrid();
                break;

            case 'request-form':
                UI.populateVehicleTypes();
                this.initRequestForm();
                break;

            case 'admin':
                UI.populatePendingRequests();
                UI.populateVehicleManagement();
                break;
        }
    }

    static initRequestForm() {
        const form = document.getElementById('vehicleRequestForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmitRequest();
            });
        }

        document.getElementById('cancel-request')?.addEventListener('click', () => {
            this.showSection('dashboard');
        });
    }

    static handleSubmitRequest() {
        const form = document.getElementById('vehicleRequestForm');
        if (form) {
            const vehicleType = document.getElementById('vehicle-type').value;
            const pickupTime = document.getElementById('pickup-time').value;
            const returnTime = document.getElementById('return-time').value;
            const pickupLocation = document.getElementById('pickup-location').value;
            const purpose = document.getElementById('purpose').value;

            if (!vehicleType || !pickupTime || !returnTime || !pickupLocation || !purpose) {
                alert('Please fill in all fields');
                return;
            }

            // Validate pickup time is in the future
            const now = new Date();
            const pickup = new Date(pickupTime);
            if (pickup <= now) {
                alert('Pickup time must be in the future');
                return;
            }

            // Validate return time is after pickup time
            const returnTimeDate = new Date(returnTime);
            if (returnTimeDate <= pickup) {
                alert('Return time must be after pickup time');
                return;
            }

            // Add request to app data
            const newRequest = {
                id: window.app.requests.length + 1,
                user: 'John Doe',
                vehicle: `${vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)} - V00${window.app.requests.length + 1}`,
                pickup: `${pickup.toLocaleDateString()} - ${pickup.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                return: `${returnTimeDate.toLocaleDateString()} - ${returnTimeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                purpose: purpose,
                location: pickupLocation,
                status: 'pending'
            };

            window.app.requests.unshift(newRequest);
            window.app.addNotification('Vehicle request submitted successfully! Your request is pending approval.');

            // Show success message
            alert('Vehicle request submitted successfully! Your request is pending approval.');
            this.showSection('dashboard');

            // Reset form
            form.reset();
        } else {
            console.warn('vehicleRequestForm not found in DOM');
        }
    }

    static initEventListeners() {
        // Sidebar toggle
        document.getElementById('toggle-sidebar')?.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            if (sidebar.classList.contains('w-16')) {
                sidebar.classList.remove('w-16');
                sidebar.classList.add('w-64');
            } else {
                sidebar.classList.remove('w-64');
                sidebar.classList.add('w-16');
            }
        });

        // Navigation menu items
        document.querySelectorAll('[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSection(e.target.closest('[data-section]').dataset.section);
            });
        });

        // Notifications
        document.getElementById('notifications-btn')?.addEventListener('click', () => {
            document.getElementById('notifications').classList.toggle('hidden');
            UI.showNotifications();
        });

        document.getElementById('view-all-notifications')?.addEventListener('click', () => {
            document.getElementById('notifications').classList.add('hidden');
            this.showSection('requests');
        });

        // Logout
        document.getElementById('logout-btn')?.addEventListener('click', () => {
            document.getElementById('app').style.display = 'none';
            document.getElementById('loading').style.display = 'flex';
            setTimeout(() => {
                alert('Logged out successfully');
                document.getElementById('loading').style.display = 'none';
            }, 1000);
        });

        // Delegated events for dynamic content
        document.getElementById('content').addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]');
            if (!action) return;

            switch (action.dataset.action) {
                case 'request-vehicle':
                    this.handleRequestVehicle(action);
                    break;
                case 'update-status':
                    this.handleUpdateStatus(action);
                    break;
                case 'approve-request':
                    this.handleApproveRequest(action);
                    break;
                case 'deny-request':
                    this.handleDenyRequest(action);
                    break;
            }
        });
    }

    static handleRequestVehicle(button) {
        const vehicleId = button.dataset.vehicleId;
        const vehicleName = button.dataset.vehicleName;
        const vehicle = window.app.vehiclesData.find(v => v.id === vehicleId);

        if (vehicle && vehicle.status === 'available') {
            // Pre-fill the request form
            document.getElementById('vehicle-type').value = vehicle.type.toLowerCase();

            // Show request form
            this.showSection('request-form');

            // Add success message
            setTimeout(() => {
                alert(`Vehicle ${vehicleName} has been selected. Please complete the request form.`);
            }, 500);
        }
    }

    static handleUpdateStatus(select) {
        const vehicleId = select.dataset.vehicleId;
        const newStatus = select.value;

        if (window.app.updateVehicleStatus(vehicleId, newStatus)) {
            // Update all components
            UI.updateDashboardStats();
            UI.initStatusChart();
            UI.populateVehiclesGrid();
            UI.populateVehicleManagement();
            UI.updateMapMarkers();

            window.app.addNotification(`Vehicle ${vehicleId} status updated to ${newStatus}`);
        }
    }

    static handleApproveRequest(button) {
        const requestId = button.dataset.requestId;
        const request = window.app.pendingRequests.find(r => r.id == requestId);

        if (request) {
            // Remove from pending requests
            window.app.pendingRequests = window.app.pendingRequests.filter(r => r.id != requestId);

            // Add to regular requests as approved
            window.app.requests.unshift({
                id: requestId,
                user: request.user,
                vehicle: request.vehicle,
                pickup: 'TBD',
                return: 'TBD',
                purpose: request.purpose,
                location: 'TBD',
                status: 'approved'
            });

            window.app.addNotification(`Request from ${request.user} has been approved!`);

            // Refresh the admin panel
            this.showSection('admin');
            alert(`Request from ${request.user} has been approved!`);
        }
    }

    static handleDenyRequest(button) {
        const requestId = button.dataset.requestId;
        const request = window.app.pendingRequests.find(r => r.id == requestId);

        if (request) {
            // Remove from pending requests
            window.app.pendingRequests = window.app.pendingRequests.filter(r => r.id != requestId);

            // Add to regular requests as denied
            window.app.requests.unshift({
                id: requestId,
                user: request.user,
                vehicle: request.vehicle,
                pickup: 'N/A',
                return: 'N/A',
                purpose: request.purpose,
                location: 'N/A',
                status: 'denied'
            });

            window.app.addNotification(`Request from ${request.user} has been denied`);

            // Refresh the admin panel
            this.showSection('admin');
            alert(`Request from ${request.user} has been denied`);
        }
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Navigation.initEventListeners();

    // Set default section
    Navigation.showSection('dashboard');
});

// Make Navigation available globally
window.Navigation = Navigation;