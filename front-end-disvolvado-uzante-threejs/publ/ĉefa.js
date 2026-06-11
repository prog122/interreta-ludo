import * as THREE from 'three';
import Stats from "https://cdn.jsdelivr.net/npm/stats.js@0.17.0/+esm";
import mapLogiko from './mapLogiko.js';
import { sencimodo, ebleLog, metiSencimodo } from './sencimodo.js';
import { klakregistrilo } from './klako.js';

// vera = true, malvera = false
const vera = true, malvera = false;

const retligo = {
  soketo: null,
  init: function(wsUrl, onmesaĝo) {
    // WebSocket konekto
    this.soketo = new WebSocket(wsUrl); // anstataŭigu per via gastiganto

    this.soketo.onopen = () => {
      ebleLog("Konektite al websoketo " + wsUrl);
    };

    this.soketo.onmessage = onmesaĝo;
  }
}

const statistikoj = {
  statistikoj: null,
  ebleInit: function() {
    if (sencimodo) {
      this.statistikoj = new Stats();
      document.body.appendChild(this.statistikoj.dom);
    }
  },
  ebleKunvolviPerStatistikoj: function (funkcio) {
    if (sencimodo && this.statistikoj) {
      this.statistikoj.begin();
    }

    funkcio();

    if (sencimodo && this.statistikoj) {
      this.statistikoj.end();
    }
  }
}

const ludoLogiko = {
  scenejo: null,
  mondoStato: null,
  mondoObjektoj: null,
  mondoStatoŜanĝita: malvera,
  bildigilo: null,
  fotilo: null,
  agordo: null,

  init: function() {
    this.initEkrano();
    const th = this;

    this.uziAgordon(function() {
      metiSencimodo(ludoLogiko.agordo.sencimodo);

      ludoLogiko.initMondoStato();
      ludoLogiko.initMondoObjektoj();

      statistikoj.ebleInit();
      klakregistrilo.ebleInit(th.bildigilo, th.scenejo, th.fotilo);

      retligo.init(ludoLogiko.agordo.wsUrl, (evento) => {
        try {
          let koordinatoj = evento.data.split(",");
          ludoLogiko.mondoStato.cirkloPoz.set(+koordinatoj[0] / 30, 0, 0);
          ludoLogiko.mondoStatoŜanĝita = vera;
        } catch (e) {
          console.error("Nevalida datumaro:", evento.data, e);
        }
      });
    });
  },

  initEkrano: function() {
    // Scenejo
    this.scenejo = new THREE.Scene();

    // Fotilo
    this.fotilo = new THREE.PerspectiveCamera(
      50, window.innerWidth / window.innerHeight, 0.1, 1000
    );
    this.fotilo.position.z = 2;

    // Bildigilo
    this.bildigilo = new THREE.WebGLRenderer({ antialias: true });
    this.bildigilo.setSize(window.innerWidth, window.innerHeight);

    document.getElementById('threejs-kanvasa-ujo').appendChild(this.bildigilo.domElement);

    // Lumo
    const ĉirkaŭaLumo = new THREE.AmbientLight(0xffffff, 0.5);
    this.scenejo.add(ĉirkaŭaLumo);

    const punktaLumo = new THREE.PointLight(0xffffff, 1);
    punktaLumo.position.set(5, 5, 5);
    this.scenejo.add(punktaLumo);

    let fotilo = this.fotilo, bildigilo = this.bildigilo;
    // Adaptiĝo al fenestro
    window.addEventListener('resize', () => {
      fotilo.aspect = window.innerWidth / window.innerHeight;
      fotilo.updateProjectionMatrix();
      bildigilo.setSize(window.innerWidth, window.innerHeight);
    });
  },

  initMondoObjektoj: function() {
    // Sfero
    const geometrio = new THREE.SphereGeometry(1 / 30, 32, 32);
    const materialo = new THREE.MeshStandardMaterial({
      color: 0x0077ff,
      roughness: 0.4,
      metalness: 0.6
    });
    const sfero = new THREE.Mesh(geometrio, materialo);
    this.mondoObjektoj = {
      sfero: sfero
    };
    this.scenejo.add(sfero);

    mapLogiko.init(this, this);
  },

  initMondoStato: function() {
    ebleLog('Inicializiamo la mondan staton');

    this.mondoStato = {
      cirkloPoz: new THREE.Vector3(),
      fotiloPoz: new THREE.Vector3(this.fotilo.position.x, this.fotilo.position.y, this.fotilo.position.z)
    };
    this.mondoStatoŜanĝita = malvera;
  },

  ebleĜisdatigiMondoObjektoj: function() {
    if (this.mondoStatoŜanĝita) {
      this.mondoObjektoj.sfero.position.lerp(this.mondoStato.cirkloPoz, 0.3);
      this.mondoStatoŜanĝita = malvera;
      this.fotilo.position.copy(this.mondoStato.fotiloPoz);

      if (sencimodo) {
        mapLogiko.ĝisdatigiMondoObjektoj();
      }
    }
  },

  uziAgordon: async function (funkcio) {
    try {
      // Legi JSON el /agordo.json
      const respondo = await fetch('/agordo.json');
      if (!respondo.ok) {
        throw new Error("Ne eblas legi agordon: " + respondo.statusText);
      }

      const datumoj = await respondo.json();
      this.agordo = datumoj;
    } catch (eraro) {
      console.error("Eraro dum legado de agordo:", eraro);
    }

    funkcio()
  }
};

ludoLogiko.init();

function animacii() {
  requestAnimationFrame(animacii);

  statistikoj.ebleKunvolviPerStatistikoj(function() {
    ludoLogiko.ebleĜisdatigiMondoObjektoj();
    ludoLogiko.bildigilo.render(ludoLogiko.scenejo, ludoLogiko.fotilo);
  });
}

animacii();
