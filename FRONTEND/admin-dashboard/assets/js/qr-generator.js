// Copy attendance link to clipboard
document.querySelector('.copy-btn').addEventListener('click', () => {
  const input = document.querySelector('.link-box input');
  input.select();
  navigator.clipboard.writeText(input.value);
  alert('Link copied to clipboard!');
});

