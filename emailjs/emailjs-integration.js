/**
 * Quantum Recruitment Services — EmailJS integration reference
 * Mirrors form logic in index.html
 */

const EMAILJS_CONFIG = {
  serviceId: 'service_6a6sni2',
  publicKey: 'ziCqBvPC-MPUfeoyY',
  toEmail: 'yashmodiofficial@gmail.com',
  templates: {
    booking: 'template_iytk4bb',
    contact: 'template_j8k4awq'
  }
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[\d\s+()\-]{10,}$/;

function isPlaceholderValue(val) {
  return !val || /^YOUR_/i.test(val) || /your_|placeholder/i.test(val);
}

function isEmailJsConfigured() {
  const c = EMAILJS_CONFIG;
  return !isPlaceholderValue(c.serviceId) && c.serviceId.startsWith('service_')
    && !isPlaceholderValue(c.publicKey) && c.publicKey.length > 10
    && !isPlaceholderValue(c.templates.contact) && c.templates.contact.startsWith('template_')
    && !isPlaceholderValue(c.templates.booking) && c.templates.booking.startsWith('template_');
}

let emailjsReady = null;
function loadEmailJS() {
  if (typeof emailjs !== 'undefined') {
    emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
    return Promise.resolve();
  }
  if (!emailjsReady) {
    emailjsReady = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
      s.async = true;
      s.onload = () => {
        emailjs.init({ publicKey: EMAILJS_CONFIG.publicKey });
        resolve();
      };
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return emailjsReady;
}

function setFieldError(fieldId, message) {
  const group = document.getElementById('fg-' + fieldId);
  const errEl = document.getElementById('err-' + fieldId);
  if (group) group.classList.add('invalid');
  if (errEl) errEl.textContent = message;
  const input = document.getElementById(fieldId);
  if (input) input.setAttribute('aria-invalid', 'true');
}

function clearFormErrors(formBodyId) {
  const body = document.getElementById(formBodyId);
  if (!body) return;
  body.querySelectorAll('.form-group.invalid').forEach(g => g.classList.remove('invalid'));
  body.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  body.querySelectorAll('[aria-invalid]').forEach(i => i.removeAttribute('aria-invalid'));
}

function openFormErrorModal() {
  const modal = document.getElementById('form-error-modal');
  const emailLink = document.getElementById('form-error-email');
  if (emailLink) {
    emailLink.textContent = EMAILJS_CONFIG.toEmail;
    emailLink.href = 'mailto:' + EMAILJS_CONFIG.toEmail;
  }
  modal?.classList.add('visible');
  modal?.setAttribute('aria-hidden', 'false');
  document.body.classList.add('nav-open');
}

async function sendViaEmailJs(templateKey, params, { btn, btnText, onSuccess }) {
  btn.disabled = true;
  const originalText = btn.textContent;
  btn.textContent = 'Sending…';

  if (!isEmailJsConfigured()) {
    openFormErrorModal();
    btn.disabled = false;
    btn.textContent = btnText || originalText;
    return;
  }

  try {
    await loadEmailJS();
    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templates[templateKey],
      { ...params, to_email: EMAILJS_CONFIG.toEmail }
    );
    btn.style.display = 'none';
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error('EmailJS error:', err);
    btn.disabled = false;
    btn.textContent = btnText || originalText;
    openFormErrorModal();
  }
}
