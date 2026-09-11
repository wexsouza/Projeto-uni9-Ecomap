document.addEventListener('DOMContentLoaded', function () {
  var stage = document.getElementById('landingStage');
  var links = Array.prototype.slice.call(document.querySelectorAll('.landing-header .main-nav a[href^="#"]'));
  var screens = Array.prototype.slice.call(document.querySelectorAll('.landing-screen'));
  if (!stage || !screens.length) return;

  function goTo(index) {
    var target = screens[Math.max(0, Math.min(index, screens.length - 1))];
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  }

  links.forEach(function (link) {
    link.addEventListener('click', function (event) {
      var target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    });
  });

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      links.forEach(function (link) { link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id); });
      history.replaceState(null, '', '#' + entry.target.id);
    });
  }, { root: stage, threshold: 0.6 });
  screens.forEach(function (screen) { observer.observe(screen); });

  var wheelLocked = false;
  stage.addEventListener('wheel', function (event) {
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY) || Math.abs(event.deltaY) < 18 || wheelLocked) return;
    event.preventDefault();
    wheelLocked = true;
    var current = screens.reduce(function (best, screen, index) { return Math.abs(screen.getBoundingClientRect().left) < Math.abs(screens[best].getBoundingClientRect().left) ? index : best; }, 0);
    goTo(current + (event.deltaY > 0 ? 1 : -1));
    window.setTimeout(function () { wheelLocked = false; }, 650);
  }, { passive: false });

  document.addEventListener('keydown', function (event) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    var current = screens.reduce(function (best, screen, index) { return Math.abs(screen.getBoundingClientRect().left) < Math.abs(screens[best].getBoundingClientRect().left) ? index : best; }, 0);
    goTo(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
});
