/* eslint-disable no-undef */
const logoutBtn = document.querySelector('.nav__el.nav__el--logout');

async function logout() {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/auth/logout',
    });

    if (res.data.status === 'success') {
      location.reload(true);
    }
  } catch (err) {
    showAlert('error', 'Error logging out! Try again.');
  }
}

logoutBtn.onclick = async () => {
  logout();
};
