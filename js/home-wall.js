/*
 * 主页两侧壁纸竖条：只在首页插入 DOM 与启动轮播
 * ------------------------------------------------------------------
 * 判定：build 阶段 scripts/home-wall.js 给首页 body 加 home-wall-page class，
 * 文章页/归档/专题页没有，脚本首行判断到就直接 return——
 * 不会插入任何节点、不加载图片，文章详情页观感完全不受影响。
 * 图片路径 /images/home-wall/01-12.webp（本地静态资源）：
 *   左侧 01-06、右侧 07-12，各 6 张互不重复。
 * 每张停留 60 秒（图少，切太快会晃眼），CSS 淡入 1.1s。
 * ------------------------------------------------------------------
 */
(function () {
  'use strict';
  if (!document.body || !document.body.classList.contains('home-wall-page')) return;

  var PER_SIDE = 6, fade = 60000; // 每侧 6 张，60 秒换一张
  var LABELS = { left: 'CANDY BALL · 和服', right: 'KYOTO · 和服' };
  var START = { left: 1, right: 7 }; // 左侧从 01 起、右侧从 07 起，两组不重叠

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function build(side) {
    var el = document.createElement('div');
    el.className = 'cb-wall ' + side;
    el.setAttribute('aria-hidden', 'true');

    var mark = document.createElement('span');
    mark.className = 'cb-mark';
    mark.textContent = LABELS[side];
    el.appendChild(mark);

    var imgs = [];
    for (var i = 0; i < PER_SIDE; i++) {
      var im = document.createElement('img');
      im.src = '/images/home-wall/' + pad(START[side] + i) + '.webp';
      im.alt = '';
      el.insertBefore(im, mark);
      imgs.push(im);
    }
    document.body.appendChild(el);

    var cur = 0;
    imgs[cur].classList.add('on');
    setInterval(function () {
      imgs[cur].classList.remove('on');
      cur = (cur + 1) % PER_SIDE;
      imgs[cur].classList.add('on');
    }, fade);
  }

  /* 手机端：头图下方插一条 64px 高的横向壁纸带，12 张横条轮播 */
  function buildStrip() {
    var strip = document.createElement('div');
    strip.className = 'cb-strip';
    strip.setAttribute('aria-hidden', 'true');
    var imgs = [];
    for (var i = 1; i <= 12; i++) {
      var im = document.createElement('img');
      im.src = '/images/home-strip/' + pad(i) + '.webp';
      im.alt = '';
      strip.appendChild(im);
      imgs.push(im);
    }
    var header = document.getElementById('page-header');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(strip, header.nextSibling);
    } else {
      document.body.insertBefore(strip, document.body.firstChild);
    }
    var cur = 0;
    imgs[cur].classList.add('on');
    setInterval(function () {
      imgs[cur].classList.remove('on');
      cur = (cur + 1) % imgs.length;
      imgs[cur].classList.add('on');
    }, 8000);
  }

  build('left');
  build('right');
  if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) buildStrip();

  /* 首屏只有全屏头图；滚到文章列表（.recent-posts）时再让两侧壁纸淡入。
     往回滚到头图区会自动淡出，保持「先大图、后壁纸」的进入节奏。 */
  function setReveal(on) {
    document.body.classList.toggle('wall-revealed', on);
  }
  var posts = document.querySelector('.recent-posts');
  if (posts && typeof IntersectionObserver !== 'undefined') {
    var io = new IntersectionObserver(function (entries) {
      setReveal(entries[0].isIntersecting);
    }, { rootMargin: '0px 0px -10% 0px' });
    io.observe(posts);
  } else {
    var header = document.getElementById('page-header');
    function onScroll() {
      var h = header ? header.offsetHeight : window.innerHeight;
      setReveal(window.scrollY > h * 0.72);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
})();
