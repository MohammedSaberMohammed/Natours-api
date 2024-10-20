/* eslint-disable no-undef */

function hideAlert() {
  const el = document.querySelector('.alert');

  if (el) {
    el.parentElement.removeChild(el);
  }
}

function showAlert(type, message) {
  hideAlert();

  const markup = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markup);

  window.setTimeout(hideAlert, 3000);
}

window.showAlert = showAlert;
window.hideAlert = hideAlert;
