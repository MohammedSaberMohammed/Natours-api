/* eslint-disable no-undef */
const bookBtn = document.getElementById('book-tour');

async function bookTour(e) {
  try {
    // ? Get checkout session from Api
    const session = await axios(
      `/api/v1/bookings/checkout-session/${e.target.dataset.tourId}`,
    );

    // ? Create checkout form + charge credit card
    window.location.href = session.data.session.url;
  } catch (err) {
    showAlert('error', err);
  }
}

bookBtn.addEventListener('click', async (e) => {
  bookBtn.textContent = 'Processing...';

  await bookTour(e);

  bookBtn.textContent = 'Book Tour Now';
});
