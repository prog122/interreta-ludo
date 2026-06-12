import * as THREE from 'three';
import { sencimodo, ebleLog } from './sencimodo.js';

import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';

// vera = true, malvera = false
const vera = true, malvera = false;

// Funkcio por paŭzo
function dormi(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function endormiĝiDumUnuKadro() {
  return dormi(1000/30);
}

const plejproksimaKaheloZ = -0.001;

class mapTavolo {
  // kradHelpilo = null;
  constructor(zomo, malpliigi) {
    const komencaZ = plejproksimaKaheloZ;
    const horizontalaNombro = mapLogiko.osmKahelojHorizontalaNombro(zomo);
    const vertikalaNombro = horizontalaNombro;
    const kaheloUrl = `https://tile.openstreetmap.org/${zomo}/%s/%s.png`;
    ebleLog("Ŝargante kahelojn por parametroj " + zomo + "," + horizontalaNombro + "," + vertikalaNombro);
    const coef = malpliigi ? 1/2 : 1;
    this.horizontalaNombro = horizontalaNombro;
    this.vertikalaNombro = vertikalaNombro;
    this.kaheloj = {};
    let th = this;
    let promesoj = [];

    for (let i=0;i<horizontalaNombro;i++) {
      if (!this.kaheloj[i]) {
        this.kaheloj[i] = {};
      }

      for (let j=0;j<vertikalaNombro;j++) {
        ebleLog('Ŝargante kahelon ' + i + ' ' + j);
        promesoj.push(mapLogiko.ŝargiKahelon(kaheloUrl.replace('%s', i).replace('%s', j), function(kahelo) {
          // Metas en nulaj koordinatoj
          kahelo.position.set((i - (horizontalaNombro - 1) / 2) * coef, (-j + (vertikalaNombro - 1) / 2) * coef, komencaZ);
	  kahelo.name = 'kahelo-' + zomo + '-' + i + '-' + j;

          if (!th.kaheloj[i][j]) {
            th.kaheloj[i][j] = kahelo;
          }

          // Aldonas en scenejo
          mapLogiko.scenejo.add(kahelo);
        }, coef, coef));
      }
    }

    if (sencimodo) {
      const kradHelpilo = new THREE.GridHelper(horizontalaNombro, vertikalaNombro);
	    kradHelpilo.rotation.x = Math.PI / 2;

      this.kradHelpilo = kradHelpilo;
      mapLogiko.scenejo.add(kradHelpilo);
    }

    this.atendObj = Promise.all(promesoj);
  }

  ĉiuKahelo(funkcio) {
    for (let i=0;i<this.horizontalaNombro;i++) {
      for (let j=0;j<this.vertikalaNombro;j++) {
        funkcio(i, j, this.kaheloj[i][j]);
      }
    }
  }

  ĝisdatigiDatumojn(coef) {
    let th = this;
    this.ĉiuKahelo(function(j, k, kahelo) {
      kahelo.geometry.dispose();
      kahelo.geometry = new THREE.PlaneGeometry(1 * coef, 1 * coef);
      kahelo.position.set((j - (th.horizontalaNombro - 1) / 2) * coef, (-k + (th.vertikalaNombro - 1) / 2) * coef, kahelo.position.z);
    });
  }

  detrui() {
    this.ĉiuKahelo(function(j, k, kahelo) {
      mapLogiko.scenejo.remove(kahelo);
      kahelo.geometry.dispose();
      kahelo.material.dispose();
    });

    if (sencimodo) {
      mapLogiko.scenejo.remove(this.kradHelpilo);

      this.kradHelpilo.geometry.dispose();
      this.kradHelpilo.material.dispose();
    }
  }
}

const mapLogiko = {
  osmZomo: 0,
  osmKahelojHorizontalaNombro: function(zomo) {
    return Math.pow(2, zomo);
  },
  ŝargilo: null,
  scenejo: null,
  kaheloj: {},
  tavoloj: {},
  fotilo: null,
  ludoLogiko: null,
  randoj: [],
  init: async function(ludoLogiko) {
    this.scenejo = ludoLogiko.scenejo;
    this.ludoLogiko = ludoLogiko;
    this.ŝargilo = new THREE.TextureLoader();

    // Inicializiamo la fonon
    await this.ŝargiKahelon('/dosieroj/kahelbildo.png', function(kahelo) {
      kahelo.position.z = -1;
      mapLogiko.scenejo.add(kahelo);
    }, 30, 30);

    this.maybeAddDebugKvadrato(1);
    this.maybeAddDebugKvadrato(2);

    await this.addKaheloj(this.osmZomo, false);
    this.vicentrigiLaKameron();

    await this.addKaheloj(this.osmZomo + 1, true);
    await this.liniaInterpolado(1);
    this.tavoloj[this.osmZomo].detrui();
  },
  maybeAddDebugKvadrato: function(flankGrandeco) {
    if (!sencimodo) return;

    // Kubo
    const geometrio = new THREE.BoxGeometry(flankGrandeco, flankGrandeco, 0.05);
    const eĝoj = new THREE.EdgesGeometry(geometrio);

    const linioGeometrio = new LineSegmentsGeometry().fromEdgesGeometry(eĝoj);
    const linioMaterialo = new LineMaterial({
      color: 0xff0000,
      linewidth: 5,
    });
    linioMaterialo.resolution.set(window.innerWidth, window.innerHeight);

    const dikajEĝoj = new LineSegments2(linioGeometrio, linioMaterialo);
    this.randoj.push(dikajEĝoj);
    this.scenejo.add(dikajEĝoj);
  },
  ĝisdatigiMondoObjektoj: function() {
    for (let i=0;i<this.randoj.length;i++) {
      this.randoj[i].position.y = this.ludoLogiko.mondoStato.fotiloPoz.y;
    }
  },
  addKaheloj: async function(zomo, malpliigi) {
    this.tavoloj[zomo] = new mapTavolo(zomo, malpliigi);
    await this.tavoloj[zomo].atendObj;
    ebleLog('Finis ŝargi kahelojn por zomo ' + zomo);
  },
  vicentrigiLaKameron: async function() {
    let proksimumaBazoDeKontinentoj = -0.42490444661249943;
    let supraSojlo = 1;
    let centroDeKontinentoj = (supraSojlo + proksimumaBazoDeKontinentoj) / 2;
    let coef = (proksimumaBazoDeKontinentoj - this.ludoLogiko.fotilo.position.y) / 30;
    let bulea = this.ludoLogiko.mondoStato.fotiloPoz.y > centroDeKontinentoj;
    for (let i = this.ludoLogiko.mondoStato.fotiloPoz.y;(this.ludoLogiko.mondoStato.fotiloPoz.y > centroDeKontinentoj) == bulea;i-= coef) {
      this.ludoLogiko.mondoStato.fotiloPoz.y = i;
      this.ludoLogiko.mondoStatoŜanĝita = vera;
      await endormiĝiDumUnuKadro();
    }
  },
  ŝargiKahelon: function(url, funkcio, larĝo, alto) {
    return new Promise(resolve => {
      mapLogiko.ŝargilo.load(url, function(teksturo) {
        const geometrio = new THREE.PlaneGeometry(larĝo, alto);
        const materialo = new THREE.MeshBasicMaterial({ map: teksturo });
        const kahelo = new THREE.Mesh(geometrio, materialo);

        funkcio(kahelo);
        resolve();
      });
    })
  },

  liniaInterpolado: async function (celoZomo) {
    const horizontalaNombro = mapLogiko.osmKahelojHorizontalaNombro(celoZomo);
    const vertikalaNombro = horizontalaNombro;

    for (let coef = 1/2; Math.round(coef * 100) / 100 <= 1; coef += 0.02) {
      mapLogiko.tavoloj[celoZomo].ĝisdatigiDatumojn(coef);
      await endormiĝiDumUnuKadro();
    }
  }
}

export default mapLogiko;

