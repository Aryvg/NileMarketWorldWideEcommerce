import {searchProducts} from './searchProducts.js';
import {loadProducts} from './loadProducts.js';
export function searchFunctionality() {
  // Helper to update search and history
  function doSearch(val, push = true) {
    if (val) {
      searchProducts(val);
      if (push) {
        history.pushState({ search: val }, '', `?search=${encodeURIComponent(val)}`);
      }
    } else {
      loadProducts();
      if (push) {
        history.pushState({ search: '' }, '', window.location.pathname);
      }
    }
    // Update all search inputs
    document.querySelectorAll('.input1, .input3').forEach(input => input.value = val || '');
  }

  // Event listeners for input1 search
  const searchInput = document.querySelector('.input1');
  const searchButton = document.querySelector('.search-button');
  if (searchInput && searchButton) {
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        doSearch(searchInput.value.trim());
      }
    });
    searchButton.addEventListener('click', function() {
      doSearch(searchInput.value.trim());
    });
  }

  // Event listeners for input3 search
  const searchInput3 = document.querySelector('.input3');
  const searchButton3 = document.querySelector('.search-button3');
  if (searchInput3 && searchButton3) {
    searchInput3.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        doSearch(searchInput3.value.trim());
      }
    });
    searchButton3.addEventListener('click', function() {
      doSearch(searchInput3.value.trim());
    });
  }

  // Handle browser navigation (back/forward)
  window.addEventListener('popstate', function(event) {
    let val = '';
    if (event.state && typeof event.state.search === 'string') {
      val = event.state.search;
    } else {
      // Try to get from URL
      const params = new URLSearchParams(window.location.search);
      val = params.get('search') || '';
    }
    doSearch(val, false);
  });

  // On page load, check for search param
  const params = new URLSearchParams(window.location.search);
  const initialSearch = params.get('search');
  if (initialSearch) {
    doSearch(initialSearch, false);
    // Set initial state for popstate
    history.replaceState({ search: initialSearch }, '', `?search=${encodeURIComponent(initialSearch)}`);
  } else {
    // Set initial state for popstate
    history.replaceState({ search: '' }, '', window.location.pathname);
  }
}