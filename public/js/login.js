/* eslint-disable no-undef */
const form = document.querySelector('.form');
const email = document.querySelector('#email');
const password = document.querySelector('#password');

async function login() {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/auth/login',
      data: {
        email: email.value,
        password: password.value,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

form.onsubmit = async (event) => {
  event.preventDefault();

  login();
};
