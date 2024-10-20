/* eslint-disable no-undef */
const name = document.querySelector('#name');
const email = document.querySelector('#email');
const photo = document.querySelector('#photo');
const password = document.querySelector('#password');
const passwordConfirm = document.querySelector('#password-confirm');
const passwordCurrent = document.querySelector('#password-current');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-settings');
const savePasswordBtn = document.querySelector('.btn--save-password');

function resetPasswordFields() {
  password.value = '';
  passwordConfirm.value = '';
  passwordCurrent.value = '';
}

async function updateData() {
  try {
    const form = new FormData();
    form.append('name', name.value);
    form.append('email', email.value);
    form.append('photo', photo.files[0]);

    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/users/updateMe',

      data: form,
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Data updated successfully!');
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

async function updatePassword() {
  try {
    const res = await axios({
      method: 'PATCH',
      url: '/api/v1/auth/update-password',
      data: {
        password: password.value,
        passwordConfirm: passwordConfirm.value,
        passwordCurrent: passwordCurrent.value,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Password updated successfully!');
      resetPasswordFields();
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
}

userDataForm.onsubmit = async (e) => {
  e.preventDefault();

  updateData();
};

userPasswordForm.onsubmit = async (e) => {
  e.preventDefault();

  savePasswordBtn.textContent = 'Updating...';

  await updatePassword();

  savePasswordBtn.textContent = 'Save password';
};
