// Nile Market to Nile Mar at 362px
window.addEventListener('DOMContentLoaded', function() {
  function updateMarketText() {
    var marketSpans = document.querySelectorAll('.Market-class');
    if (window.innerWidth <= 334) {
      marketSpans.forEach(function(span) {
        if (span.textContent.trim() !== 'M') {
          span.textContent = 'M';
        }
      });
    } else if (window.innerWidth <= 362) {
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
