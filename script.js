/* ==========================================
   script.js — 稲荷&チキン ビオ
   ==========================================

   このファイルには以下の機能が入っています:
   1. ハンバーガーメニューの開閉
   2. ヒーロースライドショー（Slick Slider）
   3. スクロール時のフェードインアニメーション
   4. ヘッダーのスクロール検知
   ========================================== */


/* ==========================================
   1. ハンバーガーメニュー
   ========================================== */
const hamBtn  = document.querySelector('.js-ham');
const nav     = document.querySelector('.js-nav');

if (hamBtn && nav) {

  // ハンバーガーボタンをクリックしたとき
  hamBtn.addEventListener('click', function () {
    const isOpen = hamBtn.classList.toggle('is-open');
    nav.classList.toggle('is-open', isOpen);

    // 開いているとき: 背景スクロールを止める
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // ナビゲーションのリンクをクリックしたら自動的に閉じる
  nav.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      hamBtn.classList.remove('is-open');
      nav.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  });
}


/* ==========================================
   2. ヒーロースライドショー（Slick Slider）
      ※ jQuery と slick.min.js が必要
   ========================================== */
$(document).ready(function () {
  var $slider = $('.js-hero-slider');

  if ($slider.length) {
    $slider.slick({
      autoplay: true,            // 自動再生
      autoplaySpeed: 4500,       // 切り替え間隔（ミリ秒）。ここを変えると速さが変わる
      speed: 1400,               // アニメーション速度（ミリ秒）
      fade: true,                // フェードで切り替え（true=フェード / false=スライド）
      cssEase: 'ease',           // イージング
      arrows: false,             // 矢印ボタン: 非表示
      dots: false,               // ドットナビ: 非表示
      pauseOnHover: false,       // ホバーで一時停止しない
      infinite: true,            // 無限ループ
    });
  }
});


/* ==========================================
   3. スクロールフェードインアニメーション
      [data-scroll] 属性を持つ要素が
      画面に入ったとき is-visible を付与してフェードイン
   ========================================== */
var scrollTargets = document.querySelectorAll('[data-scroll]');

if (scrollTargets.length > 0) {
  var fadeObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target); // 一度表示したら監視終了
        }
      });
    },
    {
      threshold: 0.1,              // 要素の10%が見えたら発火
      rootMargin: '0px 0px -40px 0px',  // 画面下端より40px手前で発火
    }
  );

  scrollTargets.forEach(function (el) {
    fadeObserver.observe(el);
  });
}


/* ==========================================
   4. ヘッダー スクロール検知
      スクロールしたらヘッダーに is-scrolled クラスを付与
   ========================================== */
var headerEl = document.querySelector('.header');

window.addEventListener('scroll', function () {
  if (!headerEl) return;

  if (window.scrollY > 60) {
    headerEl.classList.add('is-scrolled');
  } else {
    headerEl.classList.remove('is-scrolled');
  }
}, { passive: true });
