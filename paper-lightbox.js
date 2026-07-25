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
    var naturalW = 0;
    var naturalH = 0;

    function isZoomed() { return zoom > 1; }

    function applyZoom() {
      if (isZoomed()) {
        image.classList.add('is-zoomed');
        image.style.width  = Math.round(naturalW * zoom) + 'px';
        image.style.height = 'auto';
      } else {
        image.classList.remove('is-zoomed');
        image.style.width  = '';
        image.style.height = '';
      }
      image.style.cursor = isZoomed() ? 'grab' : 'zoom-in';
    }

    function resetZoom() {
      zoom = 1;
      applyZoom();
      lightbox.scrollLeft = 0;
      lightbox.scrollTop  = 0;
    }

    function zoomAt(clientX, clientY, delta) {
      if (!naturalW || !naturalH) return;

      var oldZoom = zoom;
      zoom = Math.min(6, Math.max(1, zoom + delta));
      if (zoom < 1.001) zoom = 1;

      if (oldZoom === zoom) return;

      // cursor position in document
      var docX = clientX + lightbox.scrollLeft;
      var docY = clientY + lightbox.scrollTop;

      applyZoom();

      if (zoom > 1) {
        // keep the document point under cursor
        var scale = zoom / oldZoom;
        if (oldZoom > 1) {
          lightbox.scrollLeft = docX * scale - clientX;
          lightbox.scrollTop  = docY * scale - clientY;
        } else {
          // entering zoom from 1-fit → fit image center to cursor
          lightbox.scrollLeft = docX * scale - clientX;
          lightbox.scrollTop  = docY * scale - clientY;
        }
      }
    }

    /* ---------- open / close ---------- */
    function openLightbox(trigger) {
      lastTrigger = trigger;
      image.src = trigger.dataset.lightbox;
      image.alt = trigger.dataset.caption || '';
      caption.textContent = trigger.dataset.caption || '';

      function onReady() {
        naturalW = image.naturalWidth;
        naturalH = image.naturalHeight;
        resetZoom();
      }
      image.onload = onReady;
      if (image.complete && image.naturalWidth) onReady();

      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      closeButton.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      image.src = '';
      resetZoom();
      document.body.style.overflow = '';
      if (lastTrigger) lastTrigger.focus();
    }

    /* ---------- trigger binding ---------- */
    document.querySelectorAll('[data-lightbox]').forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        openLightbox(trigger);
      });
    });

    /* ---------- close via backdrop / button / Esc ---------- */
    lightbox.addEventListener('click', function (event) {
      if (event.target.hasAttribute('data-lightbox-close')) closeLightbox();
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });

    /* ---------- wheel zoom ---------- */
    lightbox.addEventListener('wheel', function (event) {
      if (lightbox.hidden) return;
      if (event.ctrlKey || event.metaKey) return; // allow browser pinch-zoom
      event.preventDefault();
      var delta = event.deltaY < 0 ? 0.3 : -0.3;
      zoomAt(event.clientX, event.clientY, delta);
    }, { passive: false });

    /* ---------- double-click toggle ---------- */
    image.addEventListener('dblclick', function (event) {
      event.preventDefault();
      if (isZoomed()) {
        resetZoom();
      } else {
        var vw = window.innerWidth;
        var vh = window.innerHeight;
        var fitZoom = Math.min(vw / naturalW, vh / naturalH, 1);
        zoom = Math.max(1.5, fitZoom * 2.5);
        if (zoom < 1.01) zoom = 2;
        applyZoom();
        if (zoom > 1) {
          lightbox.scrollLeft = (Math.round(naturalW * zoom) - vw) / 2;
          lightbox.scrollTop  = (Math.round(naturalH * zoom) - vh) / 2;
        }
      }
    });

    /* ---------- drag-to-pan ---------- */
    var dragging = false;
    var startX = 0, startY = 0, startScrollX = 0, startScrollY = 0;

    image.addEventListener('pointerdown', function (event) {
      if (!isZoomed()) return;
      event.preventDefault();
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      startScrollX = lightbox.scrollLeft;
      startScrollY = lightbox.scrollTop;
      image.setPointerCapture(event.pointerId);
      image.style.cursor = 'grabbing';
    });

    image.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      event.preventDefault();
      lightbox.scrollLeft = startScrollX + (startX - event.clientX);
      lightbox.scrollTop  = startScrollY  + (startY - event.clientY);
    });

    var endDrag = function (event) {
      if (!dragging) return;
      dragging = false;
      image.releasePointerCapture(event.pointerId);
      image.style.cursor = isZoomed() ? 'grab' : 'zoom-in';
    };
    image.addEventListener('pointerup', endDrag);
    image.addEventListener('pointercancel', endDrag);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }
})();
