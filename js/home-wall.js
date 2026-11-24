/*
 * 主页两侧壁纸竖条：只在首页插入 DOM 与启动轮播
 * ------------------------------------------------------------------
 * 判定：build 阶段 scripts/home-wall.js 给首页 body 加 home-wall-page class，
 * 文章页/归档/专题页没有，脚本首行判断到就直接 return——
 * 不会插入任何节点、不加载图片，文章详情页观感完全不受影响。
 * 图片路径 /images/home-wall/01-12.webp（本地静态资源）。
 * ------------------------------------------------------------------
 */
(function () {
  'use strict';
  if (!document.body || !document.body.classList.contains('home-wall-page')) return;

  var N = 12, fade = 3200;
  var LABELS = { left: 'CANDY BALL', right: 'GLOOMY BEAR' };

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function build(side, startIndex) {
    var el = document.createElement('div');
    el.className = 'cb-wall ' + side;
    el.setAttribute('aria-hidden', 'true');

    var mark = document.createElement('span');
    mark.className = 'cb-mark';
    mark.textContent = LABELS[side];
    el.appendChild(mark);

    var imgs = [];
    for (var i = 1; i <= N; i++) {
      var im = document.createElement('img');
      im.src = '/images/home-wall/' + pad(i) + '.webp';
      im.alt = '';
      el.insertBefore(im, mark);
      imgs.push(im);
    }
    document.body.appendChild(el);

    var cur = startIndex % N;
    imgs[cur].classList.add('on');
    setInterval(function () {
      imgs[cur].classList.remove('on');
      cur = (cur + 1) % N;
      imgs[cur].classList.add('on');
    }, fade);
  }

  build('left', 0);
  build('right', 6);
})();
