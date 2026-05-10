function openHandbook() {
  document.getElementById('handbookModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeHandbook() {
  document.getElementById('handbookModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeHandbook();
});

document.addEventListener('DOMContentLoaded', function() {
  var overlay = document.getElementById('handbookModal');
  if (overlay) {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) closeHandbook();
    });
  }
});
