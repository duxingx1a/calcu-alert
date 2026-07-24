(function () {
  'use strict';

  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    var image = document.getElementById('lightboxImage');
    var caption = document.getElementById('lightboxCaption');
    if (!lightbox || !image || !caption) return;

  var closeButton = lightbox.querySelector('.lightbox__close');
  var lastTrigger = null;
  var zoom = 1;
  var offsetX = 0;
  var offsetY = 0;
  var dragging = false;
  var startX = 0;
  var startY = 0;
  var moved = false;

  function renderImageTransform() {
    image.style.transform = 'translate(' + offsetX + 'px, ' + offsetY + 'px) scale(' + zoom + ')';
    image.style.cursor = zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'zoom-in';
  }

  function resetZoom() {
    zoom = 1;
    offsetX = 0;
    offsetY = 0;
    renderImageTransform();
  }

  function openLightbox(trigger) {
    lastTrigger = trigger;
    image.src = trigger.dataset.lightbox;
    image.alt = trigger.dataset.caption || '研究图像预览';
    caption.textContent = trigger.dataset.caption || '';
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    resetZoom();
    closeButton.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    image.src = '';
    resetZoom();
    document.body.classList.remove('lightbox-open');
    if (lastTrigger) lastTrigger.focus();
  }

  document.querySelectorAll('[data-lightbox]').forEach(function (trigger) {
    trigger.addEventListener('click', function (event) {
      if (trigger.tagName === 'BUTTON') {
        event.preventDefault();
      }
      openLightbox(trigger);
    });
  });

  lightbox.addEventListener('click', function (event) {
    if (event.target.hasAttribute('data-lightbox-close')) closeLightbox();
  });

  image.addEventListener('wheel', function (event) {
    if (lightbox.hidden) return;
    event.preventDefault();
    zoom = Math.min(5, Math.max(1, zoom + (event.deltaY < 0 ? 0.2 : -0.2)));
    if (zoom === 1) {
      offsetX = 0;
      offsetY = 0;
    }
    renderImageTransform();
  }, { passive: false });

  image.addEventListener('dblclick', function (event) {
    event.preventDefault();
    if (zoom === 1) zoom = 2;
    else resetZoom();
    renderImageTransform();
  });

  image.addEventListener('pointerdown', function (event) {
    if (zoom === 1) return;
    event.preventDefault();
    dragging = true;
    moved = false;
    startX = event.clientX - offsetX;
    startY = event.clientY - offsetY;
    image.setPointerCapture(event.pointerId);
    renderImageTransform();
  });

  image.addEventListener('pointermove', function (event) {
    if (!dragging) return;
    event.preventDefault();
    moved = true;
    offsetX = event.clientX - startX;
    offsetY = event.clientY - startY;
    renderImageTransform();
  });

  image.addEventListener('pointerup', function (event) {
    if (!dragging) return;
    dragging = false;
    image.releasePointerCapture(event.pointerId);
    renderImageTransform();
  });

  image.addEventListener('pointercancel', function (event) {
    if (!dragging) return;
    dragging = false;
    image.releasePointerCapture(event.pointerId);
    renderImageTransform();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }
})();
