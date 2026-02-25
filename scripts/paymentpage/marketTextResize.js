// Nile Market to Nile Mar at 360px for Paymentpage
window.addEventListener('DOMContentLoaded', function() {
  function updateMarketText() {
    var marketSpans = document.querySelectorAll('.Market-class');
    if (window.innerWidth <= 326) {
      marketSpans.forEach(function(span) {
        if (span.textContent.trim() !== 'M') {
          span.textContent = 'M';
        }
      });
    } else if (window.innerWidth <= 360) {
      marketSpans.forEach(function(span) {
        if (span.textContent.trim() !== 'Mar') {
          span.textContent = 'Mar';
        }
      });
    } else {
      marketSpans.forEach(function(span) {
        if (span.textContent.trim() !== 'Market') {
          span.textContent = 'Market';
        }
      });
    }
  }
  updateMarketText();
  window.addEventListener('resize', updateMarketText);
});
