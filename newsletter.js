/* ============================================
   AI MT0 Studio - newsletter.js
   メルマガ・お知らせ登録フォーム（会員登録不要・メールアドレスのみ）
   ============================================ */

(function () {
  function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    const emailInput = document.getElementById('newsletter-email');
    const submitBtn = document.getElementById('newsletter-submit');
    const msgEl = document.getElementById('newsletter-msg');

    function showMsg(text, isError) {
      msgEl.textContent = text;
      msgEl.classList.toggle('is-error', !!isError);
      msgEl.classList.add('visible');
    }

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const email = emailInput.value.trim();
      if (!email) return;

      submitBtn.disabled = true;
      submitBtn.textContent = '登録中...';

      const { error } = await sbClient
        .from('newsletter_subscribers')
        .insert({ email, source: window.location.pathname });

      submitBtn.disabled = false;
      submitBtn.textContent = '登録する';

      if (error) {
        if (error.code === '23505') {
          showMsg('このメールアドレスはすでに登録されています。', false);
        } else {
          showMsg('登録に失敗しました。時間をおいて再度お試しください。', true);
        }
        return;
      }

      form.reset();
      showMsg('登録ありがとうございます！新着情報をお届けします。', false);
    });
  }

  document.addEventListener('DOMContentLoaded', initNewsletterForm);
})();
