/* ==================================================================
 * 手机端文章头图：有封面就用封面，没封面才用竖图横幅
 *
 * 背景：Butterfly 本来就是 top_img = page.top_img || page.cover || 默认图，
 * 但 custom.css 为了手机端铺满竖图，把所有带横幅的页面背景都覆盖了，
 * 结果把文章封面也盖掉了。这里给「真正用了封面/自定义头图」的文章页
 * 打一个 .has-post-cover 标记，CSS 见到这个标记就不再覆盖背景。
 *
 * 判断依据：主题默认头图是 /img/banner.jpg（_config.butterfly.yml 的
 * default_top_img）。内联背景里含这个路径 = 没写封面；其余 = 有封面。
 * 只加 class，不改文章文件、不联网；站点未开 pjax，DOMContentLoaded 足够。
 * ================================================================== */
(function () {
  'use strict';

  var DEFAULT_TOP_IMG = '/img/banner.jpg';

  function markPostCover() {
    var header = document.getElementById('page-header');
    if (!header) return;

    // 只处理文章页；首页/归档/分类等仍走原来的手机竖图横幅
    if (header.className.indexOf('post-bg') === -1) {
      header.classList.remove('has-post-cover');
      return;
    }

    // 主题把头图以内联 style 写在 #page-header 上
    var bg = header.style.backgroundImage || '';
    var hasOwnCover = bg.indexOf(DEFAULT_TOP_IMG) === -1;

    if (hasOwnCover) {
      header.classList.add('has-post-cover');
    } else {
      header.classList.remove('has-post-cover');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', markPostCover);
  } else {
    markPostCover();
  }
})();
