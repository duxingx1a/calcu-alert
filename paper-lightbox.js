(function () {
  'use strict';

  if (!window.PhotoSwipe) return;

  function init() {
    document.querySelectorAll('[data-lightbox]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();

        var src = el.dataset.lightbox;
        var caption = el.dataset.caption || '';
        var img = el.querySelector('img');

        // 从页面已有的图片获取原始尺寸
        var w = (img && img.naturalWidth)  ? img.naturalWidth  : 1600;
        var h = (img && img.naturalHeight) ? img.naturalHeight : 1200;

        var pswp = new PhotoSwipe({
          dataSource: [{ src: src, width: w, height: h }],
          index: 0,
          bgOpacity: 0.88,
          showHideAnimationType: 'fade',
          allowPanToNext: false,
          loop: false,
          pinchToClose: false,
          closeOnVerticalDrag: true,
          maxZoomLevel: 6,
          wheelToZoom: true,
        });

        // 标题更新
        pswp.on('change', function () {
          var cap = document.querySelector('.pswp__caption .pswp__caption__center');
          if (cap) {
            cap.textContent = caption;
          }
        });

        // 初始化后立即设置标题
        pswp.on('firstUpdate', function () {
          var cap = document.querySelector('.pswp__caption .pswp__caption__center');
          if (cap) {
            cap.textContent = caption;
          }
        });

        pswp.init();
      });
    });
  }

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();
})();
