(function () {
  'use strict';

  function initLightbox() {
    var lightbox = document.getElementById('lightbox');
    var image = document.getElementById('lightboxImage');
    var caption = document.getElementById('lightboxCaption');
    if (!lightbox || !image || !caption) return;

    var closeBtn = lightbox.querySelector('.lightbox__close');
    var zoom = 1, nw = 0, nh = 0;

    function zoomed() { return zoom > 1.01; }

    function refresh() {
      if (zoomed()) {
        image.classList.add('is-zoomed');
        image.style.width  = Math.round(nw * zoom) + 'px';
        image.style.height = 'auto';
      } else {
        image.classList.remove('is-zoomed');
        image.style.width  = '';
        image.style.height = '';
      }
      image.style.cursor = zoomed() ? 'grab' : 'zoom-in';
    }

    function reset() { zoom = 1; refresh(); lightbox.scrollTo(0, 0); }

    function zoomAt(cx, cy, delta) {
      if (!nw || !nh) return;
      var old = zoom;
      zoom = Math.min(6, Math.max(1, zoom + delta));
      if (Math.abs(zoom - 1) < 0.005) zoom = 1;
      if (old === zoom) return;
      var docX = cx + lightbox.scrollLeft;
      var docY = cy + lightbox.scrollTop;
      refresh();
      if (zoom > 1) {
        var s = zoom / old;
        lightbox.scrollLeft = docX * s - cx;
        lightbox.scrollTop  = docY * s - cy;
      }
    }

    function openLightbox(trigger) {
      var src = trigger.dataset.lightbox;
      image.src = src;
      image.alt = trigger.dataset.caption || '';
      caption.textContent = trigger.dataset.caption || '';

      // 强制从缓存/网络重新触发尺寸读取
      image.onload = null;
      image.onload = function () {
        nw = image.naturalWidth;
        nh = image.naturalHeight;
        reset();
      };
      // 如果图片已在缓存中，onload 可能不会再次触发
      if (image.complete && image.naturalWidth) {
        nw = image.naturalWidth;
        nh = image.naturalHeight;
        reset();
      }

      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.hidden = true;
      image.src = '';
      zoom = 1;
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-lightbox]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        openLightbox(el);
      });
    });

    lightbox.addEventListener('click', function (e) {
      if (e.target.hasAttribute('data-lightbox-close')) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
    });

    lightbox.addEventListener('wheel', function (e) {
      if (lightbox.hidden || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 0.3 : -0.3);
    }, { passive: false });

    image.addEventListener('dblclick', function (e) {
      e.preventDefault();
      if (zoomed()) {
        reset();
      } else {
        zoom = Math.max(2, Math.min(window.innerWidth / nw, window.innerHeight / nh) * 2.5);
        refresh();
        if (zoom > 1) {
          lightbox.scrollLeft = (Math.round(nw * zoom) - window.innerWidth)  / 2;
          lightbox.scrollTop  = (Math.round(nh * zoom) - window.innerHeight) / 2;
        }
      }
    });

    /* drag */
    var drag = false, sx, sy, sl, st;
    image.addEventListener('pointerdown', function (e) {
      if (!zoomed()) return;
      e.preventDefault();
      drag = true; sx = e.clientX; sy = e.clientY;
      sl = lightbox.scrollLeft; st = lightbox.scrollTop;
      image.setPointerCapture(e.pointerId);
      image.style.cursor = 'grabbing';
    });
    image.addEventListener('pointermove', function (e) {
      if (!drag) return;
      e.preventDefault();
      lightbox.scrollLeft = sl + (sx - e.clientX);
      lightbox.scrollTop  = st + (sy - e.clientY);
    });
    var end = function (e) {
      if (!drag) return;
      drag = false;
      image.releasePointerCapture(e.pointerId);
      image.style.cursor = zoomed() ? 'grab' : 'zoom-in';
    };
    image.addEventListener('pointerup', end);
    image.addEventListener('pointercancel', end);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }
})();
