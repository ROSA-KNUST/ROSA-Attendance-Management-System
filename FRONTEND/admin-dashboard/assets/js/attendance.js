// Simple script for active pagination buttons
const pageButtons = document.querySelectorAll('.page-btn');
pageButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    pageButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
