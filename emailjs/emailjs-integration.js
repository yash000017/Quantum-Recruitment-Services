/**
 * Quantum Recruitment Services — EmailJS integration reference
 * Mirrors form logic in index.html
 */

const EMAILJS_CONFIG = {
  serviceId: 'YOUR_SERVICE_ID',
  publicKey: 'YOUR_PUBLIC_KEY',
  toEmail: 'quantum-recruitment@gmail.com',
  templates: {
    contact: 'YOUR_CONTACT_TEMPLATE_ID',
    booking: 'YOUR_BOOKING_TEMPLATE_ID'
  }
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[\d\s+()\-]{10,}$/;

function isEmailJsConfigured() {
  const c = EMAILJS_CONFIG;
  return c.serviceId?.startsWith('service_')
    && c.publicKey?.length > 10
    && c.templates.contact?.startsWith('template_')
    && c.templates.booking?.startsWith('template_');
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
    setTimeout(() => {
      btn.style.display = 'none';
      if (onSuccess) onSuccess();
    }, 600);
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
