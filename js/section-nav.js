/* ==================================================================
 * 电脑端：横幅下方的栏目导航条
 *
 * 位置：插在 #page-header 之后、main#content-inner.layout 之前，
 *       也就是「大图正下方」。样式由 custom.css 控制，只在 ≥769px 显示；
 *       手机端仍走胶囊导航（mobile-nav-capsules.js）。
 *
 * 栏目对应的页面由 scripts/section-pages.js 在构建时生成，
 * 更新日志是固定页面 source/changelog/index.md。
 * ================================================================== */
(function () {
  'use strict';

  var items = [
    ['软件', '/software/'],
    ['随笔', '/essays/'],
    ['阴暗角落', '/dark-corner/'],
    ['工具箱', '/toolbox/'],
    ['更新日志', '/changelog/'],
    ['千禧年', '/y2k/']
  ];

  function build() {
    var header = document.getElementById('page-header');
    if (!header || document.querySelector('.section-nav')) return;

    var here = location.pathname.replace(/index\.html$/, '');
    var nav = document.createElement('nav');
    nav.className = 'section-nav';
    nav.setAttribute('aria-label', '栏目导航');

    var html = '<div class="section-nav-inner">';
    items.forEach(function (it) {
      var base = it[1];
      var active = here === base || here === base.replace(/\/$/, '') ||
        here.indexOf(base) === 0;
      html += '<a class="section-nav-item' + (active ? ' active' : '') +
        '" href="' + base + '">' + it[0] + '</a>';
    });
    html += '</div>';
    nav.innerHTML = html;

    if (header.parentNode) header.parentNode.insertBefore(nav, header.nextSibling);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
  // 站点目前没开 pjax；留着这句以后开了也不会失效
  document.addEventListener('pjax:complete', build);
})();
