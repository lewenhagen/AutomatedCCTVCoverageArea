/**
 * @author Kenneth Lewenhagen
 * @module index.js
 */
let result = new L.GeoJSON.AJAX("./output/result.geojson")

const map = L.map('map', {
  center: L.latLng(55.583331, 13.0333332),
  zoom: 14,
})

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: `&copy;
  <a href="https://www.openstreetmap.org/copyright">
  OpenStreetMap</a> contributors`,
  maxZoom: 20,
  maxNativeZoom: 19
}).addTo(map)


result.addTo(map)
