// Sidebar Toggle Functionality for Mobile
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  // Toggle sidebar when menu button is clicked
  if (menuToggle) {
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      sidebar.classList.toggle('active');
      if (overlay) {
        overlay.classList.toggle('active');
      }
      // Prevent body scroll when sidebar is open
      if (sidebar.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  // Close sidebar when overlay is clicked
  if (overlay) {
    overlay.addEventListener('click', function() {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  // Close sidebar when a menu link is clicked (on mobile)
  const menuLinks = document.querySelectorAll('.menu li a');
  menuLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        if (overlay) {
          overlay.classList.remove('active');
        }
        document.body.style.overflow = '';
      }
    });
  });

  // Close sidebar on window resize if it becomes desktop size
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('active');
      if (overlay) {
        overlay.classList.remove('active');
      }
      document.body.style.overflow = '';
    }
  });

  // Close sidebar on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      sidebar.classList.remove('active');
      if (overlay) {
        overlay.classList.remove('active');
      }
      document.body.style.overflow = '';
    }
  });
});

