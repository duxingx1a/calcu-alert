(function () {
  'use strict';

  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    var image = document.getElementById('lightboxImage');
    var caption = document.getElementById('lightboxCaption');
    if (!lightbox || !image || !caption) return;

    var panel = lightbox.querySelector('.lightbox__panel');
    var closeButton = lightbox.querySelector('.lightbox__close');
    var lastTrigger = null;
    var zoom = 1;
    var naturalW = 0;
    var naturalH = 0;

    /* ---------- state helpers ---------- */
    function isZoomed() { return zoom > 1; }

    function applyZoom() {
      if (isZoomed()) {
        image.classList.add('is-zoomed');
        image.style.width = Math.round(naturalW * zoom) + 'px';
        image.style.height = 'auto';
      } else {
        image.classList.remove('is-zoomed');
        image.style.width = '';
        image.style.height = '';
      }
      image.style.cursor = isZoomed() ? 'grab' : 'zoom-in';
    }

    function resetZoom() {
      zoom = 1;
      applyZoom();
    }

    function zoomAt(clientX, clientY, delta) {
      if (!naturalW || !naturalH) return;
      var rect = panel.getBoundingClientRect();

      // image position relative to panel content origin
      var imgRect = image.getBoundingClientRect();
      var imgLeft = imgRect.left - rect.left + panel.scrollLeft;
      var imgTop  = imgRect.top  - rect.top  + panel.scrollTop;

      var relX = clientX - imgLeft;   // cursor x inside image
      var relY = clientY - imgTop;    // cursor y inside image

      var oldZoom = zoom;
      zoom = Math.min(5, Math.max(1, zoom + delta));
      if (zoom < 1.001) zoom = 1;

      applyZoom();

      // keep the point under cursor stationary
      var scale = zoom / oldZoom;
      if (oldZoom > 1 && zoom > 1) {
        panel.scrollLeft = imgLeft + relX * scale - (clientX - rect.left);
        panel.scrollTop  = imgTop  + relY * scale - (clientY - rect.top);
      } else if (zoom > 1) {
        // entering zoom from 1
        var imgW = Math.round(naturalW * zoom);
        var imgH = Math.round(naturalH * zoom);
        panel.scrollLeft = (imgW / rect.width)  * relX - (clientX - rect.left);
        panel.scrollTop  = (imgH / rect.height) * relY - (clientY - rect.top);
      }
    }

    /* ---------- open / close ---------- */
    function openLightbox(trigger) {
      lastTrigger = trigger;
      image.src = trigger.dataset.lightbox;
      image.alt = trigger.dataset.caption || '';
      caption.textContent = trigger.dataset.caption || '';

      // wait for image to load so we have natural dimensions
      image.onload = function () {
        naturalW = image.naturalWidth;
        naturalH = image.naturalHeight;
        resetZoom();
        panel.scrollLeft = 0;
        panel.scrollTop = 0;
      };
      // in case image is cached and onload already fired
      if (image.complete && image.naturalWidth) {
        naturalW = image.naturalWidth;
        naturalH = image.naturalHeight;
        resetZoom();
        panel.scrollLeft = 0;
        panel.scrollTop = 0;
      }

      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');
      closeButton.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      image.src = '';
      resetZoom();
      panel.scrollLeft = 0;
      panel.scrollTop = 0;
      document.body.classList.remove('lightbox-open');
      if (lastTrigger) lastTrigger.focus();
    }

    /* ---------- trigger binding ---------- */
    document.querySelectorAll('[data-lightbox]').forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        openLightbox(trigger);
      });
    });

    /* ---------- close via backdrop / Esc ---------- */
    lightbox.addEventListener('click', function (event) {
      if (event.target.hasAttribute('data-lightbox-close')) closeLightbox();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });

    /* ---------- wheel zoom ---------- */
    panel.addEventListener('wheel', function (event) {
      if (lightbox.hidden) return;
      event.preventDefault();
      var delta = event.deltaY < 0 ? 0.25 : -0.25;
      zoomAt(event.clientX, event.clientY, delta);
    }, { passive: false });

    /* ---------- double-click toggle ---------- */
    image.addEventListener('dblclick', function (event) {
      event.preventDefault();
      if (isZoomed()) {
        resetZoom();
      } else {
        zoom = 2;
        applyZoom();
        // scroll to center the clicked point
        if (zoom > 1) {
          var rect = panel.getBoundingClientRect();
          var imgW = Math.round(naturalW * zoom);
          var imgH = Math.round(naturalH * zoom);
          panel.scrollLeft = (imgW / rect.width)  * (event.clientX - rect.left) - rect.width  / 2;
          panel.scrollTop  = (imgH / rect.height) * (event.clientY - rect.top)  - rect.height / 2;
        }
      }
    });

    /* ---------- drag-to-pan (only when zoomed) ---------- */
    var dragging = false;
    var startX = 0, startY = 0, startScrollX = 0, startScrollY = 0;

    image.addEventListener('pointerdown', function (event) {
      if (!isZoomed()) return;
      event.preventDefault();
      dragging = true;
      startX = event.clientX;
      startY = event.clientY;
      startScrollX = panel.scrollLeft;
      startScrollY = panel.scrollTop;
      image.setPointerCapture(event.pointerId);
      image.style.cursor = 'grabbing';
    });

    image.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      event.preventDefault();
      panel.scrollLeft = startScrollX + (startX - event.clientX);
      panel.scrollTop  = startScrollY  + (startY - event.clientY);
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
