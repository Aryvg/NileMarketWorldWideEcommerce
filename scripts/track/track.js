import { loadTrack } from './loadTrack.js';
loadTrack();

// Search from track.html and redirect to homepage with search term (backend logic on homepage)
function handleTrackSearch(searchTerm) {
  if (searchTerm && searchTerm.trim()) {
    localStorage.setItem('homepageSearchTerm', searchTerm.trim());
    localStorage.setItem('homepageSearchFromTrack', '1');
    window.location.href = 'Homepage.html';
  }
}

const trackSearchInput1 = document.querySelector('.input1');
const trackSearchButton1 = document.querySelector('.search-button');
if (trackSearchInput1 && trackSearchButton1) {
  trackSearchButton1.addEventListener('click', function() {
    handleTrackSearch(trackSearchInput1.value);
  });
  trackSearchInput1.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleTrackSearch(trackSearchInput1.value);
  });
}

const trackSearchInput3 = document.querySelector('.input3');
const trackSearchButton3 = document.querySelector('.search-button3');
if (trackSearchInput3 && trackSearchButton3) {
  trackSearchButton3.addEventListener('click', function() {
    handleTrackSearch(trackSearchInput3.value);
  });
  trackSearchInput3.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') handleTrackSearch(trackSearchInput3.value);
  });
}
document.querySelector('.js-menu').addEventListener('click', ()=>{
  document.getElementById('123').style.width="100%";
  //document.querySelector('.js-main').style.marginTop='120px';
  document.body.style.paddingTop='200px'
});
document.querySelector('.js-times').addEventListener('click', ()=>{
 document.getElementById('123').style.width="0";
 //document.querySelector('.js-main').style.marginTop='0px';
 document.body.style.paddingTop='150px'
});

const MoreButton=document.querySelector('.js-sign-up-button');
document.querySelector('.js-sign-up-button').addEventListener('click', ()=>{
    if (MoreButton.innerText==='More'){
      document.querySelector('.sl-div').style.visibility='visible';
      MoreButton.innerText='Cancel'
    }else{
      document.querySelector('.sl-div').style.visibility='hidden';
      MoreButton.innerText='More';
    }
});

// handle responsive company-name on track page
(function() {
  function updateMarketText() {
    var marketSpans = document.querySelectorAll('.Market-class');
    if (window.innerWidth <= 334) {
      marketSpans.forEach(function(span) {
        if (span.textContent.trim() !== 'M') {
          span.textContent = 'M';
        }
      });
    } else if (window.innerWidth <= 352) {
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
  document.addEventListener('DOMContentLoaded', function() {
    updateMarketText();
    window.addEventListener('resize', updateMarketText);
  });
})();