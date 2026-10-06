/* Photo stack slideshow - auto-rotates, tap to switch */
(function () {
  /* Guard: the same code also exists inline in index.html,
     so only initialise once even if both load. */
  if (window.__photoStackInit) return;
  window.__photoStackInit = true;

  var stack = document.getElementById('photoStack');
  if (!stack) return;

  var photos = stack.querySelectorAll('.stack-photo');
  var dots = document.querySelectorAll('.stack-dots .dot');
  var current = 0;
  var timer = null;

  function show(i) {
    current = (i + photos.length) % photos.length;
    for (var k = 0; k < photos.length; k++) {
      photos[k].classList.toggle('is-front', k === current);
      photos[k].classList.toggle('is-back', k !== current);
    }
    for (var d = 0; d < dots.length; d++) {
      dots[d].classList.toggle('active', d === current);
    }
  }

  function auto() {
    if (timer) clearInterval(timer);
    timer = setInterval(function () { show(current + 1); }, 3500);
  }

  /* Tap the stack to switch photos (restarts the timer) */
  stack.addEventListener('click', function () {
    show(current + 1);
    auto();
  });

  /* Dots are tappable too */
  for (var j = 0; j < dots.length; j++) {
    (function (idx) {
      dots[idx].addEventListener('click', function (e) {
        e.stopPropagation();
        show(idx);
        auto();
      });
    })(j);
  }

  show(0);

  /* Respect reduced-motion preference: no auto-rotation, tap still works */
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) auto();
})();

/* Playful NO button - shrinks and teleports away on every click */
(function () {
  if (window.__noButtonInit) return;
  window.__noButtonInit = true;

  var noBtn = document.getElementById('noBtn');
  var yesBtn = document.querySelector('.btn-yes');
  if (!noBtn) return;

  /* Keep it on top so it stays tappable while jumping around */
  noBtn.style.position = 'relative';
  noBtn.style.zIndex = '5';

  var texts = ['No 😅', 'Are you sure? 🥺', 'Really sure? 😢', 'Think again! 💭',
    'Last chance! 😭', "Can't catch me! 😜", 'Too tiny! 🤏', 'Still No! 😤'];
  var clicks = 0;
  var scale = 1;
  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function jump() {
    if (reduceMotion) return;
    var rangeX = window.innerWidth < 640 ? 70 : 150;
    var rangeY = window.innerWidth < 640 ? 50 : 70;
    var x = Math.round((Math.random() * 2 - 1) * rangeX);
    var y = Math.round((Math.random() * 2 - 1) * rangeY);
    noBtn.style.transform = 'translate(' + x + 'px, ' + y + 'px) scale(' + scale + ')';
  }

  /* Desktop: hovering also shrinks it a little + teleports away */
  noBtn.addEventListener('mouseenter', function () {
    scale = Math.max(0.25, scale - 0.06);
    jump();
  });

  /* Every click: smaller + teleport somewhere new */
  noBtn.addEventListener('click', function (e) {
    e.preventDefault();
    clicks++;
    scale = Math.max(0.25, 1 - clicks * 0.12);
    if (clicks < texts.length) noBtn.textContent = texts[clicks];
    jump();
    /* Bonus: YES grows a little every time NO is clicked */
    if (yesBtn && !reduceMotion) {
      yesBtn.style.fontSize = Math.min(1.8, 1.2 + clicks * 0.07) + 'rem';
    }
  });
})();

/* Final touches: tap heart bursts + slideshow keyboard support */
(function () {
  if (window.__touchesInit) return;
  window.__touchesInit = true;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hearts = ['❤️', '💖', '💕', '💗', '💘'];

  /* Little heart burst wherever you tap (not on the NO button - it's busy!) */
  if (!reduceMotion) {
    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('#noBtn')) return;
      for (var i = 0; i < 6; i++) {
        var s = document.createElement('span');
        s.className = 'click-heart';
        s.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        s.style.left = e.clientX + 'px';
        s.style.top = e.clientY + 'px';
        s.style.setProperty('--bx', Math.round((Math.random() * 2 - 1) * 90) + 'px');
        s.style.setProperty('--by', Math.round(-40 - Math.random() * 90) + 'px');
        document.body.appendChild(s);
        (function (el) {
          setTimeout(function () { el.remove(); }, 950);
        })(s);
      }
    });
  }

  /* Slideshow: arrow keys switch photos + no image ghost-dragging */
  var stack = document.getElementById('photoStack');
  if (stack) {
    var imgs = stack.querySelectorAll('img');
    for (var k = 0; k < imgs.length; k++) imgs[k].draggable = false;
    stack.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        stack.click();
      }
    });
  }
})();
