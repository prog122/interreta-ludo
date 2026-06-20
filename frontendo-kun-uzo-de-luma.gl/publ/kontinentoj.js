const { Model, Geometry } = luma;
import { Vector2 } from 'https://cdn.jsdelivr.net/npm/@math.gl/core@4.1.0/+esm'
import { lmObjekto } from './ludMotoro.js';
import { laPlejProksimaTavoloZ } from './konstantoj.js';
import { MatricaBildigilo } from './matricaBildigilo.js';
import { sencimodo } from './sencimodo.js';

const vera = true, malvera = false;

// @g
function vectorigiBuleanKrado(krado) {
  const alto = krado.length;
  const larĝo = krado[0].length;
  const limajPunktoj = [];

  // Kontrolo ĉu najbaro estas malplena
  function estasLimo(x, y) {
    if (!krado[y][x]) return false; // la punkto mem estas malplena
    const direktoj = [
      [0, -1], [0, 1], [-1, 0], [1, 0] // najbaroj: supre, malsupre, maldekstre, dekstre
    ];
    for (const [dx, dy] of direktoj) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= larĝo || ny >= alto) return true; // rando
      if (!krado[ny][nx]) return true; // najbaro malplena
    }
    return false;
  }

  // Trapasas la tutan matricon
  for (let y = 0; y < alto; y++) {
    for (let x = 0; x < larĝo; x++) {
      if (estasLimo(x, y)) {
        limajPunktoj.push({x, y});
      }
    }
  }

  return limajPunktoj;
}

class Kontinento extends lmObjekto {
  constructor({ ludoLogiko, matrico, videbla }) {
    super({ videbla });

    this.matrico = matrico;
    this.bildigiloKunteksto = ludoLogiko.bildigiloKunteksto;
    this.grupo = 'kontinentoj';

    let th = this;

    let grid2 = [];
    for (let i=0;i<256;i++) {
      grid2.push([]);
      for (let j=0;j<256;j++) {
        grid2[i].push(0);
      }
    }

    vectorigiBuleanKrado(matrico).map(point => {
      grid2[point.y][point.x] = 1;
      if (point.x != 255 && point.y != 255) {
        grid2[point.y][point.x + 1] = 1;
        grid2[point.y + 1][point.x] = 1;
      }

      if (sencimodo) {
        desegniPikselon(point.x, point.y, 'red');
      }
    });

    this.booleanGrid = matrico;
    this.booleanGrid2 = grid2;
  }

  setUniforms(valoro) {
    if (this.matricaBildigilo) {
      this.matricaBildigilo.setUniforms(valoro);
    }
  }

  aktivigi() {
    if (this.booleanGrid && this.booleanGrid2) {
      this.matricaBildigilo = new MatricaBildigilo({ gl: this.bildigiloKunteksto, matrico: this.booleanGrid });
      this.matricaBildigilo2 = new MatricaBildigilo({ gl: this.bildigiloKunteksto, matrico: this.booleanGrid2, koloro: [255, 0, 0, 255] });
    }
  }
  desegni() {
    if (this.videbla) {
      if (this.matricaBildigilo) {
        this.matricaBildigilo.draw();
      }
      if (this.matricaBildigilo2) {
        this.matricaBildigilo2.draw();
      }
    }
  }
}

function desegniPikselon(x, y, koloro) {
  let kunteksto = document.getElementById('helpilo-kanvaso').getContext('2d');
  kunteksto.fillStyle = koloro;          // agordi koloron
  kunteksto.fillRect(x, y, 1, 1);        // desegni kvadraton 1×1
}

class AnimaciaKontinento extends lmObjekto {
  constructor({ ludoLogiko, videbla, resolve }) {
    super({ videbla });
    this.grupo = 'animacia-kontinento';

    let th = this;

    this.withOSMPixelMap((buleaPikselaro) => {
      const cont5 = new Kontinento({ludoLogiko, matrico: buleaPikselaro});
      cont5.grupo = 'landoj';
      cont5.nomo = 'lando';
      cont5.videbla = malvera;

      cont5.videbla = vera;
      th.visibleContinent = cont5;
      cont5.aktivigi();
      resolve();
    });
  }

  async withOSMPixelMap(funkcio) {
    const kanvaso = document.createElement('canvas');
    kanvaso.width = 256;
    kanvaso.height = 256;


    const respondo = await fetch('/dosieroj/tera-256x256.json');
    const pikselaro = await respondo.json();

    funkcio(pikselaro);
  }

  setUniforms(valoro) {
    if (this.visibleContinent) {
      this.visibleContinent.setUniforms(valoro);
    }
  }

  desegni() {
    if (this.visibleContinent) {
      this.visibleContinent.draw();
    }
  }
}

export { Kontinento, AnimaciaKontinento };
