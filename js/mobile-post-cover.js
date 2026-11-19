/* ==================================================================
 * 手机端文章头图：有封面就用封面，并按封面真实比例决定头图高度
 *
 * 背景：Butterfly 本来就是 top_img = page.top_img || page.cover || 默认图，
 * 但 custom.css 为了手机端铺满竖图，把所有带横幅的页面背景都覆盖了，
 * 结果把文章封面也盖掉了。这里给「真正用了封面/自定义头图」的文章页
 * 打一个 .has-post-cover 标记，CSS 见到这个标记就不再覆盖背景。
 *
 * 高度自适应：CSS 默认给有封面的文章一个矮头图（62vw，适合横图）。
 * 但竖屏封面放进矮横条会被裁掉上下大半，所以这里加载封面图片、读取
 * 真实宽高，竖图就把头图加高到能完整显示（最高 178vw，与手机横幅一致），
 * 横图维持矮头图。高度写成内联 style，只在本机手机端生效。
 *
 * 判断依据：主题默认头图是 /img/banner.jpg（_config.butterfly.yml 的
 * default_top_img）。内联背景里含这个路径 = 没写封面；其余 = 有封面。
 * 不改文章文件、不联网（只读已经加载的封面），站点未开 pjax。
 * ================================================================== */
(function () {
  'use strict';

  var DEFAULT_TOP_IMG = '/img/banner.jpg';
  var MAX_RATIO = 1.78; // 竖图最高到 178vw，与手机竖图横幅一致

  function extractBgUrl(styleText) {
    var m = String(styleText || '').match(/url\(['"]?([^'")]+)['"]?\)/);
    return m ? m[1] : '';
  }

  function applyHeight(header, img) {
    var ratio = img.naturalHeight / img.naturalWidth;
    var target;
    if (ratio > 1.02) {
      // 竖图：加高到能完整显示，但不超过手机横幅的 178vw
      target = Math.min(ratio, MAX_RATIO);
    } else {
      // 横图（含近正方形）：维持 CSS 里约定的矮头图 62vw
      target = 0.62;
    }
    header.style.height = (target * 100) + 'vw';
  }

  function markPostCover() {
    var header = document.getElementById('page-header');
    if (!header) return;

    // 只处理文章页；首页/归档/分类等仍走原来的手机竖图横幅
    if (header.className.indexOf('post-bg') === -1) {
      header.classList.remove('has-post-cover');
      header.style.removeProperty('height');
      return;
    }

    // 主题把头图以内联 style 写在 #page-header 上
    var bg = header.style.backgroundImage || '';
    var hasOwnCover = bg.indexOf(DEFAULT_TOP_IMG) === -1;

    if (!hasOwnCover) {
      header.classList.remove('has-post-cover');
      header.style.removeProperty('height');
      return;
    }

    header.classList.add('has-post-cover');

    // 先用封面图自身的加载事件拿真实宽高（图片本来就会被浏览器加载）
    var url = extractBgUrl(bg);
    if (!url) return;
    var probe = new Image();
    probe.onload = function () {
      if (probe.naturalWidth && probe.naturalHeight) applyHeight(header, probe);
    };
    probe.src = url;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markPostCover);
  } else {
    markPostCover();
  }
})();
