function limigilo(funkcio, limo) {
  let enLimigo;
  return function(...argumentoj) {
    if (!enLimigo) {
      funkcio.apply(this, argumentoj);
      enLimigo = true;
      setTimeout(() => enLimigo = false, limo);
    }
  };
}

function voklimigilo(funkcio, limo = 1) {
  let vokNombro = 0;
  return function(...argumentoj) {
    if (vokNombro < limo) {
      vokNombro ++;
      funkcio();
    }
  }
}

// @g
function rondiguAlKvin(num) {
  return Number(num.toFixed(5));
}

// @g
function geojsonAlMerkatora(longGradoj, latGradoj) {
  const R = 6378137; // radiuso de la Tero en metroj

  // Rekta transformo: WGS84 -> Web Mercator
  const x = R * longGradoj * Math.PI / 180;
  const y = R * Math.log(Math.tan(Math.PI / 4 + (latGradoj * Math.PI / 180) / 2));

  // Inversa transformo: Web Mercator -> WGS84
  const lon = (x / R) * 180 / Math.PI;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(y / R));

  return {
    x, y, lon, lat, 
    _xr: rondiguAlKvin(x), // @a
    _yr: rondiguAlKvin(y) // @a
  };
}

function merkatoraAlScenejoPunkto(x, y, zoom) {
  const plejDekstraDunkto = 20037508.34;// plej maldekstra dunkto -20037508.34
  const plejSupraPunkto = 20037508.34;// ~85.0511 latitudo
  const zoom2 = zoom ? zoom : 1;

  return {
    x: x / plejDekstraDunkto / 2 * zoom,
    y: y / plejSupraPunkto / 2 * zoom,
  }
}


export { limigilo, voklimigilo, geojsonAlMerkatora, merkatoraAlScenejoPunkto };
