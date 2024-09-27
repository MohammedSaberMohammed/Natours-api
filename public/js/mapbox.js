/* eslint-disable no-undef */

const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoibS1zYWJlcjk1IiwiYSI6ImNtMWswMGUxZzBibmwycXM4aXo1dDZvemMifQ.xdcBi1t91aAuT7x1B1HvXA';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/m-saber95/cm1k1c1sv00f301pe0naqgkow',
  scrollZoom: false,
  // center: [-118.113491, 34.111745],
  // zoom: 10,
  // interactive: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // ? Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  //  ? Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // ? Add popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // ? Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

// ? Fit map to bounds
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
