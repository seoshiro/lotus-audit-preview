// Old language URLs retain translated HTML without JavaScript. Enhanced visits
// continue to the canonical URL with an explicit language, independent of storage.
const destination = document.body.dataset.redirect;
if (destination) {
  const url = new URL(destination, location.href);
  url.hash = location.hash;
  location.replace(url.href);
}
