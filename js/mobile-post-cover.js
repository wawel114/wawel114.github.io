/* ==================================================================
 * 文章头图：有自定义封面时打上 has-post-cover 标记（PC/手机双端一致）
 *
 * 背景：Butterfly 本来就是 top_img = page.top_img || page.cover || 默认图。
 * custom.css 在手机端会把非文章封面的头图区覆盖为统一竖图横幅；
 * 这里给「真正使用了封面/自定义头图」的文章页打 .has-post-cover，
 * 让 CSS 保留文章自己的封面背景，而不是覆盖成默认横幅。
 *
 * 说明：为避免进入文章时封面区域出现高度跳动（尤其移动端），
 * 不再在图片加载后动态改写头图高度，头图高度统一由 CSS 控制（双端稳定）。
 *
 * 判断依据：主题默认头图是 /img/banner.jpg（_config.butterfly.yml 的
 * default_top_img）。内联背景里含这个路径 = 未设置封面；否则视为有封面。
 * ================================================================== */
(function () {
  'use strict';

  var DEFAULT_TOP_IMG = '/img/banner.jpg';

  function markPostCover() {
    var header = document.getElementById('page-header');
    if (!header) return;

    // 只处理文章页；首页/归档/分类等仍走原来的横幅逻辑
    if (header.className.indexOf('post-bg') === -1) {
      header.classList.remove('has-post-cover');
      return;
    }

    // 主题把头图以 inline style 写在 #page-header 上
    var bg = header.style.backgroundImage || '';
    var hasOwnCover = bg.indexOf(DEFAULT_TOP_IMG) === -1;

    if (!hasOwnCover) {
      header.classList.remove('has-post-cover');
      return;
    }

    header.classList.add('has-post-cover');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markPostCover);
  } else {
    markPostCover();
  }
})();
