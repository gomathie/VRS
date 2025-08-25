// Wait for the DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle functionality
    const body = document.querySelector('body');
    
    // Create mobile menu toggle button for small screens
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    body.appendChild(menuToggle);
    
    const sidebar = document.querySelector('.sidebar');
    
    // Toggle sidebar when menu button is clicked
    menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('active');
        
        // Change icon based on sidebar state
        if (sidebar.classList.contains('active')) {
            menuToggle.innerHTML = '<i class="fas fa-times"></i>';
        } else {
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(event) {
        const isClickInsideSidebar = sidebar.contains(event.target);
        const isClickOnMenuToggle = menuToggle.contains(event.target);
        
        // If sidebar is open and click is outside sidebar and not on menu toggle
        if (sidebar.classList.contains('active') && !isClickInsideSidebar && !isClickOnMenuToggle) {
            sidebar.classList.remove('active');
            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
    
    // Car list item click handler
    const carItems = document.querySelectorAll('.car-item');
    
    carItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            carItems.forEach(i => i.classList.remove('active-car'));
            
            // Add active class to clicked item
            this.classList.add('active-car');
            
            // Here you would typically load the car details for the selected item
            // For a real application, this would involve fetching data from a server
            console.log('Car selected:', this.querySelector('h3').textContent);
        });
    });
    
    // Responsive behavior for window resize
    function handleResize() {
        if (window.innerWidth > 480) {
            sidebar.classList.remove('active');
            menuToggle.style.display = 'none';
        } else {
            menuToggle.style.display = 'flex';
        }
    }
    
    // Initial call
    handleResize();
    
    // Listen for window resize events
    window.addEventListener('resize', handleResize);
});
