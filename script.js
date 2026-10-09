(function () {
  var header = document.getElementById('siteHeader');
  var onScroll = function () {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // mobile drawer
  var body = document.body;
  var menuBtn = document.getElementById('menuBtn');
  var drawer = document.getElementById('drawer');
  function setDrawer(open) {
    body.classList.toggle('drawer-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    drawer.setAttribute('aria-hidden', !open);
  }
  menuBtn.addEventListener('click', function () { setDrawer(true); });
  document.getElementById('drawerClose').addEventListener('click', function () { setDrawer(false); });
  document.getElementById('drawerOverlay').addEventListener('click', function () { setDrawer(false); });
  drawer.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setDrawer(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });

  // lazy video loading — posters show first; a video only downloads when it nears the
  // viewport, uses the small file on phones, and pauses when scrolled away (saves data + battery)
  var lazyVideos = [].slice.call(document.querySelectorAll('video[data-src]'));
  var smallScreen = window.matchMedia('(max-width:767px)').matches;
  var conn = navigator.connection || {};
  var skipVideo = conn.saveData || window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function loadVideo(v) {
    if (v.getAttribute('src')) return;
    v.src = (smallScreen && v.dataset.srcM) ? v.dataset.srcM : v.dataset.src;
    v.load();
  }
  function playVideo(v) {
    loadVideo(v);
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }

  if (!skipVideo && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) playVideo(en.target);
        else if (en.target.getAttribute('src')) en.target.pause();
      });
    }, { rootMargin: '200px 0px', threshold: 0.01 });
    lazyVideos.forEach(function (v) { io.observe(v); });
  } else if (!skipVideo) {
    lazyVideos.forEach(playVideo);
  }

  // video sound toggles — only one video may be unmuted at a time
  var soundBtns = [].slice.call(document.querySelectorAll('.js-sound'));
  var videos = [].slice.call(document.querySelectorAll('.js-video'));

  // background music ("vibe") — on by default, ducks out whenever a video has sound
  var bgMusic = document.getElementById('bgMusic');
  var vibeBtn = document.getElementById('vibeBtn');
  var vibeOn = true;
  var awaitingGesture = false;

  function anyVideoAudible() {
    return videos.some(function (v) { return !v.muted; });
  }

  // the music should play only when the vibe is on AND no video is audible
  function syncMusic() {
    if (!bgMusic) return;
    if (vibeOn && !anyVideoAudible()) {
      var played = bgMusic.play();
      if (played && played.catch) {
        played.catch(function () {
          // browsers block audio until the visitor interacts; retry on first gesture
          if (awaitingGesture) return;
          awaitingGesture = true;
          ['pointerdown', 'keydown', 'scroll'].forEach(function (evt) {
            document.addEventListener(evt, function once() {
              ['pointerdown', 'keydown', 'scroll'].forEach(function (e2) {
                document.removeEventListener(e2, once);
              });
              awaitingGesture = false;
              syncMusic();
            }, { once: true, passive: true });
          });
        });
      }
    } else {
      bgMusic.pause();
    }
  }

  if (vibeBtn) {
    vibeBtn.addEventListener('click', function () {
      vibeOn = !vibeOn;
      vibeBtn.setAttribute('aria-pressed', String(vibeOn));
      vibeBtn.setAttribute('aria-label', vibeOn ? 'Turn the vibe off' : 'Turn the vibe on');
      vibeBtn.querySelector('.vibe-btn__label').textContent = vibeOn ? 'Vibe on' : 'Vibe off';
      syncMusic();
    });
    syncMusic();
  }

  function setMuted(btn, muted) {
    var video = btn.parentNode.querySelector('.js-video');
    if (!video) return;
    video.muted = muted;
    btn.setAttribute('aria-pressed', String(!muted));
    btn.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video');
    // a click counts as the gesture browsers require before audio may play
    if (!muted && video.paused) { playVideo(video); }
  }

  soundBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var video = btn.parentNode.querySelector('.js-video');
      if (!video) return;
      var unmuting = video.muted;
      // mute every other video first, so only one ever plays sound
      soundBtns.forEach(function (other) { if (other !== btn) setMuted(other, true); });
      setMuted(btn, !unmuting);
      // duck the background music out while a video is audible, bring it back after
      syncMusic();
    });
  });

  // testimonials marquee
  var reviews = [
    ['It was my first time getting my eyebrows mapped and shaped. They did such an excellent job. I love how my brows look. The staffs were very friendly and welcoming. Kudos to their customer service.', 'Prasanna Thapa'],
    ['Very professional and a good atmosphere! They talk through every decision and think with you. Happy with the result and definitely coming back.', 'Sanne Jacobs'],
    ['The best spot for nails and lashes with great ambiance and welcoming staff. The service was amazing. A special shoutout to Manisha (Mannu) for always doing a great job.', 'Ash T'],
    ['Great service, clean space, and perfect results. Will definitely come back❤️', 'Sachita Amgain']
  ];
  var track = document.getElementById('track');
  track.style.setProperty('--n', reviews.length);
  var html = '';
  for (var pass = 0; pass < 2; pass++) {
    reviews.forEach(function (r) {
      html += '<div class="slide"><div class="slide__content"><div class="stars" aria-label="5 stars"></div>' +
        '<blockquote>“' + r[0] + '”</blockquote><cite>' + r[1] + '</cite></div></div>';
    });
  }
  track.innerHTML = html;

  // add to cart (demo only)
  var count = 0;
  var countEl = document.getElementById('cartCount');
  document.querySelectorAll('.add-to-cart').forEach(function (btn) {
    btn.addEventListener('click', function () {
      count++;
      countEl.textContent = count;
      btn.textContent = 'Added to cart';
      btn.classList.add('added');
      setTimeout(function () { btn.textContent = 'Add to cart'; btn.classList.remove('added'); }, 1600);
    });
  });
})();
