/* ========= Video playlist / Ads / Click-to-next ========= */
const promoVideo = document.getElementById('promoVideo');
const skipBtn = document.getElementById('skipBtn');

const videoPlaylist = [
  "media/videos/1.mp4","media/videos/2.mp4","media/videos/3.mp4","media/videos/4.mp4","media/videos/5.mp4",
  "media/videos/6.mp4","media/videos/7.mp4","media/videos/8.mp4","media/videos/9.mp4","media/videos/10.mp4"
];

const adVideos = [ "media/ads/ad1.mp4", "media/ads/ad2.mp4" ];

let currentIndex = -1;
let adPlaying = false;
let adSkipTimer = null;
let adInterval = null;

/* load a random video index different from current (if possible) */
function pickRandomIndex() {
  if (videoPlaylist.length === 0) return 0;
  let idx = Math.floor(Math.random() * videoPlaylist.length);
  if (videoPlaylist.length > 1) {
    while (idx === currentIndex) {
      idx = Math.floor(Math.random() * videoPlaylist.length);
    }
  }
  return idx;
}

function loadRandomVideo() {
  currentIndex = pickRandomIndex();
  promoVideo.src = videoPlaylist[currentIndex];
  promoVideo.load();
  promoVideo.play().catch(()=>{/* autoplay may be blocked, user can press play */});
}

/* play an ad (random ad) */
function playAd() {
  if (adPlaying) return;
  adPlaying = true;
  // choose ad
  const ad = adVideos[Math.floor(Math.random() * adVideos.length)];
  promoVideo.src = ad;
  promoVideo.load();
  promoVideo.play().catch(()=>{});
  // show skip btn after 5s
  adSkipTimer = setTimeout(() => {
    skipBtn.style.display = 'block';
    skipBtn.setAttribute('aria-hidden','false');
  }, 5000);
}

/* end ad and go back to random playlist */
function endAd() {
  if (adSkipTimer) { clearTimeout(adSkipTimer); adSkipTimer = null; }
  skipBtn.style.display = 'none';
  skipBtn.setAttribute('aria-hidden','true');
  adPlaying = false;
  loadRandomVideo();
}

/* show next when normal video ends */
promoVideo.addEventListener('ended', () => {
  if (adPlaying) {
    // if ad ended naturally
    endAd();
  } else {
    loadRandomVideo();
  }
});

/* CLICK-TO-NEXT: user clicks the video element -> load next random (only when not ad) */
promoVideo.addEventListener('click', (e) => {
  // If user clicked the native controls area (e.g., play/pause) the click still fires.
  // We implement desired behavior: clicking the video area will move to next random video when NOT an ad.
  if (!adPlaying) {
    loadRandomVideo();
  }
});

/* skip button behavior */
skipBtn.addEventListener('click', () => {
  if (adPlaying) endAd();
});

/* start the playlist */
loadRandomVideo();

/* schedule ad every 3 minutes (180000 ms) */
adInterval = setInterval(() => {
  if (!adPlaying) playAd();
}, 180000);

/* ========== Icon slider: mouse drag + touch gestures + dots pagination ========== */
const wrapper = document.getElementById('iconWrapper');
const dots = Array.from(document.querySelectorAll('.dot'));
let isDown = false, startX = 0, scrollLeft = 0;

/* mouse drag for desktop */
wrapper.addEventListener('mousedown', (e) => {
  isDown = true;
  wrapper.classList.add('dragging');
  startX = e.pageX - wrapper.offsetLeft;
  scrollLeft = wrapper.scrollLeft;
});
window.addEventListener('mouseup', () => { isDown = false; wrapper.classList.remove('dragging'); });
wrapper.addEventListener('mousemove', (e) => {
  if(!isDown) return;
  e.preventDefault();
  const x = e.pageX - wrapper.offsetLeft;
  const walk = (x - startX) * 1.8;
  wrapper.scrollLeft = scrollLeft - walk;
});

/* touch gestures for mobile */
let touchStartX = 0;
wrapper.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, {passive:true});

wrapper.addEventListener('touchend', e => {
  const touchEndX = e.changedTouches[0].clientX;
  if (touchEndX - touchStartX > 60) {
    // swipe right -> previous slide
    wrapper.scrollBy({ left: -window.innerWidth, behavior:'smooth' });
  } else if (touchStartX - touchEndX > 60) {
    // swipe left -> next slide
    wrapper.scrollBy({ left: window.innerWidth, behavior:'smooth' });
  }
});

/* update dots on scroll (throttle) */
let dotUpdateTimeout = null;
wrapper.addEventListener('scroll', () => {
  if (dotUpdateTimeout) clearTimeout(dotUpdateTimeout);
  dotUpdateTimeout = setTimeout(updateDots, 120);
});

function updateDots() {
  const slideWidth = wrapper.offsetWidth;
  const position = wrapper.scrollLeft;
  const page = Math.round(position / slideWidth);
  dots.forEach(d => d.classList.remove('active'));
  if (dots[page]) dots[page].classList.add('active');
}

/* dot clicks */
dots.forEach(btn => {
  btn.addEventListener('click', () => {
    const idx = Number(btn.dataset.index || 0);
    wrapper.scrollTo({ left: idx * wrapper.offsetWidth, behavior: 'smooth' });
    dots.forEach(d => d.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* initial dot state */
updateDots();

/* ========== Hamburger menu toggle + overlay ========== */
const navToggle = document.getElementById('nav-toggle');
const sideNav = document.getElementById('side-nav');
const overlay = document.getElementById('overlay');

function openNav() {
  sideNav.classList.add('open');
  overlay.classList.add('show');
  sideNav.setAttribute('aria-hidden','false');
  overlay.setAttribute('aria-hidden','false');
}
function closeNav() {
  sideNav.classList.remove('open');
  overlay.classList.remove('show');
  sideNav.setAttribute('aria-hidden','true');
  overlay.setAttribute('aria-hidden','true');
}

navToggle.addEventListener('click', () => {
  if (sideNav.classList.contains('open')) closeNav(); else openNav();
});
overlay.addEventListener('click', closeNav);

/* Optional: close nav on ESC */
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeNav();
});
