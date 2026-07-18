(function () {
  var nav = document.getElementById('nav');
  var links = document.querySelectorAll('.nav__link');
  var sections = document.querySelectorAll('.section[id]');
  var revealEls = document.querySelectorAll('[data-reveal]');
  var toTop = document.getElementById('to-top');
  var canvas = document.getElementById('grid-canvas');
  var ctx = canvas.getContext('2d');

  var W, H;
  var stars = [];
  var gridLines = [];
  var gridVX, gridVY;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildGrid();
    buildStars();
  }

  function buildStars() {
    stars = [];
    var count = Math.min(160, Math.floor((W * H) / 6500));
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.2,
        a: Math.random() * 0.5 + 0.08,
        s: Math.random() * 0.4 + 0.03,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function buildGrid() {
    gridLines = [];
    gridVX = W / 2;
    gridVY = H * 0.28;
    var spacing = 36;
    var count = Math.ceil(W / spacing) + 3;

    for (var i = -count; i <= count; i++) {
      var bottomX = gridVX + i * spacing;
      var alpha = Math.max(0, 1 - Math.abs(i) / count * 1.3);
      gridLines.push({
        x1: gridVX, y1: gridVY, x2: bottomX, y2: H,
        alpha: alpha, type: 'v'
      });
    }

    for (var j = 1; j < 40; j++) {
      var t = j / 40;
      var y = gridVY + (H - gridVY) * t * t * t;
      var alpha = Math.max(0, 1 - t * 1.1);
      gridLines.push({
        x1: 0, y1: y, x2: W, y2: y,
        alpha: alpha, type: 'h'
      });
    }
  }

  function drawGrid(time) {
    ctx.clearRect(0, 0, W, H);

    var pulse = Math.sin(time * 0.0004) * 0.1 + 0.9;

    for (var i = 0; i < gridLines.length; i++) {
      var g = gridLines[i];
      if (g.type === 'v') {
        var fade = Math.max(0, 1 - Math.abs(g.x2 - gridVX) / (W * 0.65));
        var a = Math.min(0.12, g.alpha * 0.12 * fade * pulse);
        ctx.strokeStyle = 'rgba(200, 210, 250, ' + a.toFixed(4) + ')';
      } else {
        var a = Math.min(0.1, g.alpha * 0.1 * pulse);
        ctx.strokeStyle = 'rgba(190, 200, 240, ' + a.toFixed(4) + ')';
      }
      ctx.lineWidth = g.type === 'h' ? 0.5 : 0.6;
      ctx.beginPath();
      ctx.moveTo(g.x1, g.y1);
      ctx.lineTo(g.x2, g.y2);
      ctx.stroke();
    }

    var grad = ctx.createRadialGradient(gridVX, gridVY, 0, gridVX, gridVY, H * 0.4);
    grad.addColorStop(0, 'rgba(106, 140, 255, 0.025)');
    grad.addColorStop(0.4, 'rgba(106, 125, 220, 0.008)');
    grad.addColorStop(1, 'rgba(106, 140, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    var silverGrad = ctx.createRadialGradient(W * 0.75, H * 0.15, 0, W * 0.75, H * 0.15, H * 0.35);
    silverGrad.addColorStop(0, 'rgba(200, 215, 255, 0.02)');
    silverGrad.addColorStop(1, 'rgba(200, 215, 255, 0)');
    ctx.fillStyle = silverGrad;
    ctx.fillRect(0, 0, W, H);

    for (var s = 0; s < stars.length; s++) {
      var star = stars[s];
      var twinkle = Math.sin(time * 0.0015 * (star.s * 2 + 0.5) + star.phase) * 0.35 + 0.65;
      var a = star.a * twinkle;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(215, 225, 255, ' + a.toFixed(3) + ')';
      ctx.fill();
    }
  }

  buildGrid();
  buildStars();

  function animate(time) {
    drawGrid(time);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

  window.addEventListener('resize', resize);

  function onScroll() {
    var scrollY = window.scrollY;
    var current = '';

    nav.classList.toggle('nav--solid', scrollY > 60);
    toTop.classList.toggle('to-top--visible', scrollY > window.innerHeight * 0.7);

    sections.forEach(function (section) {
      var top = section.offsetTop - 120;
      var height = section.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        current = section.getAttribute('id');
      }
    });

    links.forEach(function (link) {
      link.classList.remove('nav__link--active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('nav__link--active');
      }
    });
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(function (el) { observer.observe(el); });

  toTop.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
