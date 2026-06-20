import Stats from "https://cdn.jsdelivr.net/npm/stats.js@0.17.0/+esm";
import { sencimodo, ebleProtokolo, metiSencimodo, tempigitaRegistraro } from './sencimodo.js';
import { limigilo, voklimigilo } from './utilaĵoj.js';
import { klakregistrilo } from './klako.js';
import { Vector3, Vector2 } from 'https://cdn.jsdelivr.net/npm/@math.gl/core@4.1.0/+esm'
import { ludMotoro, lmScenejo } from './ludMotoro.js';
import { AnimaciaKontinento } from './kontinentoj.js';
import { TekstoRenderilo } from './tekstoRenderilo.js';
import { kreiCirklon } from './rondo.js';
import { geojsonAlMerkatora, merkatoraAlScenejoPunkto } from './utilaĵoj.js';
import { laPlejProksimaTavoloZ } from './konstantoj.js';

const vera = true, malvera = false;
// vera = true, malvera = false

// @g
function dikaPoligonaKonturoModelo(gl, punktoj, koloro=[0,0,1,1], liniaLarĝo=0.02) {
  const pozicioj = [];
  const indeksaj = [];
  let idx = 0;

  for (let i=0; i<punktoj.length; i++) {
    const p1 = punktoj[i];
    const p2 = punktoj[(i+1)%punktoj.length];

    // Vektoro de segmento
    const dx = p2[0] - p1[0];
    const dy = p2[1] - p1[1];
    const longo = Math.sqrt(dx*dx + dy*dy);

    // Normala perpendikulara al segmento
    const nx = -dy/longo * liniaLarĝo;
    const ny =  dx/longo * liniaLarĝo;

    // Kvar verticoj de ortangulo ĉirkaŭ segmento
    pozicioj.push(p1[0]-nx, p1[1]-ny, 0);
    pozicioj.push(p1[0]+nx, p1[1]+ny, 0);
    pozicioj.push(p2[0]-nx, p2[1]-ny, 0);
    pozicioj.push(p2[0]+nx, p2[1]+ny, 0);

    // Indeksoj por du trianguloj
    indeksaj.push(idx, idx+1, idx+2);
    indeksaj.push(idx+1, idx+3, idx+2);
    idx += 4;
  }

  const geometry = new luma.Geometry({
    attributes: {
      positions: {size: 3, value: new Float32Array(pozicioj)}
    },
    indices: new Uint16Array(indeksaj)
  });

  const vs = `#version 300 es
  in vec3 positions;
  uniform float aspekto;
  void main(void) {
    vec3 pos = positions;
    pos.x /= aspekto;   // компенсуємо ширину
    gl_Position = vec4(pos, 1.0);
  }`;

  const fs = `#version 300 es
  precision highp float;
  out vec4 fragColor;
  uniform bool uVisible;
  void main(void) {
    if (!uVisible) {
      discard; // не малювати піксель
    } else {
      fragColor = vec4(${koloro.join(',')});
    }
  }`;

  return new luma.Model(gl, {vs, fs, geometry, drawMode: gl.TRIANGLES});
}

const retligo = {
  soketo: null,
  inic: function(wsUrl, onmesaĝo) {
    // WebSocket konekto
    this.soketo = new WebSocket(wsUrl); // anstataŭigu per via gastiganto

    this.soketo.onopen = () => {
      ebleProtokolo("Konektite al websoketo " + wsUrl);
    };

    this.soketo.onmessage = onmesaĝo;
  }
}

const statistikoj = {
  statistikoj: null,
  ebleInic: function() {
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

const funkciojDeSencimigo = {
  aldoniDekstranLimanPunkton: function(ludoLogiko, scenejo, kunteksto, zomo) {
    // Dekstra lima punkto
    let koordinatoj = geojsonAlMerkatora(180, 0);
    let koordinatoj2 = merkatoraAlScenejoPunkto(koordinatoj.x, koordinatoj.y, zomo);
    ludoLogiko.tekstoRenderilo.renderiTekston((Math.round(koordinatoj2.x * 100) / 100).toString(), koordinatoj2.x, koordinatoj2.y);

    scenejo.add(this.kreiPunkton(kunteksto, koordinatoj2.x, koordinatoj2.y));
  },

  aldoniMaldekstranLimanPunkton: function(ludoLogiko, scenejo, kunteksto, zomo) {
    // Maldekstra lima punkto
    let koordinatoj = geojsonAlMerkatora(-180, 0);
    let koordinatoj2 = merkatoraAlScenejoPunkto(koordinatoj.x, koordinatoj.y, zomo);
    ludoLogiko.tekstoRenderilo.renderiTekston((Math.round(koordinatoj2.x * 100) / 100).toString(), koordinatoj2.x, koordinatoj2.y);

    scenejo.add(this.kreiPunkton(kunteksto, koordinatoj2.x, koordinatoj2.y));
  },

  aldoniSupraLimanPunkton: function(ludoLogiko, scenejo, kunteksto, zomo) {
    // Supra lima punkto
    let koordinatoj = geojsonAlMerkatora(0, 85.0511);
    let koordinatoj2 = merkatoraAlScenejoPunkto(koordinatoj.x, koordinatoj.y, zomo);
    ludoLogiko.tekstoRenderilo.renderiTekston((Math.round(koordinatoj2.y * 100) / 100).toString(), koordinatoj2.x, koordinatoj2.y);

    scenejo.add(this.kreiPunkton(kunteksto, koordinatoj2.x, koordinatoj2.y));
  },

  aldoniSubanLimanPunkton: function(ludoLogiko, scenejo, kunteksto, zomo) {
    // Suba lima punkto
    let koordinatoj = geojsonAlMerkatora(0, -85.0511);
    let koordinatoj2 = merkatoraAlScenejoPunkto(koordinatoj.x, koordinatoj.y, zomo);
    ludoLogiko.tekstoRenderilo.renderiTekston((Math.round(koordinatoj2.y * 100) / 100).toString(), koordinatoj2.x, koordinatoj2.y + 0.1);

    scenejo.add(this.kreiPunkton(kunteksto, koordinatoj2.x, koordinatoj2.y));
  },


  kreiPunkton: function (gl, x, y, r, color = [0, 0, 0, 1]) {
    let radius = r ? r : 0.01;

    const circle = kreiCirklon(gl, x, y, laPlejProksimaTavoloZ, radius, 1, 64, color, gl.canvas.width / gl.canvas.height);
    circle.grupo = 'points';

    return circle;
  }
}

const ludoLogiko = {
  scenejo: null,
  mondoStato: null,
  mondoObjektoj: null,
  mondoStatoŜanĝita: malvera,
  fotilo: null,
  agordo: null,
  bildigiloKunteksto: null,

  inic: function(obj) {
    ebleProtokolo('Datumoj de WebGL ' + gl.getParameter(gl.VERSION) + ' ' + gl.getParameter(gl.SHADING_LANGUAGE_VERSION) + ' ' + gl.getParameter(gl.VENDOR));
    this.inicEkrano(obj);

    ludoLogiko.inicMondoStato();
    ludoLogiko.inicMondoObjektoj();

    statistikoj.ebleInic();
    klakregistrilo.ebleInic(this.scenejo, this.fotilo);

    retligo.inic(ludoLogiko.agordo.wsUrl, (evento) => {
      try {
        let koordinatoj = evento.data.split(",");
        ludoLogiko.mondoStato.cirkloPoz.set(+koordinatoj[0] / 30, 0, 0);
        ludoLogiko.mondoStatoŜanĝita = vera;
      } catch (e) {
        console.error("Nevalida datumaro:", evento.data, e);
      }
    });
  },

  inicEkrano: function(obj) {
    this.scenejo = new lmScenejo();
    this.bildigiloKunteksto = obj.kunteksto;

    if (obj.aŭtomataKanvasaGrandeco) {
      this.bildigiloKunteksto.canvas.style.width = '100%';
    }

    /*
    this.aligrandigiBildigilo();
    window.addEventListener('resize', () => {
      ludoLogiko.aligrandigiBildigilo();
    });
    */
  },

  inicMondoObjektoj: function() {
    const sfero = kreiCirklon(
      this.bildigiloKunteksto, 0, 0, -0.001, 0.05, 1, 64, [1, 1, 1, 1],
      this.bildigiloKunteksto.canvas.width / this.bildigiloKunteksto.canvas.height
    );
    sfero.grupo = 'ludanto';
    sfero.name = 'ludanto';
    this.scenejo.add(sfero);

    this.mondoObjektoj = {
      sfero: sfero,
    };
    this.tekstoRenderilo = new TekstoRenderilo({ludoLogiko: this});
    this.tekstoRenderilo.grupo = 'teksto-renderilo';

    this.ebleAldoniAencimigajnPunktojn({ ludoLogiko: this });
  },

  inicMondoStato: function() {
    ebleProtokolo('Inicializiamo la mondan staton');

    this.mondoStato = {
      cirkloPoz: new Vector3(),
      //fotiloPoz: new Vector3(this.fotilo.position.x, this.fotilo.position.y, this.fotilo.position.z)
    };
    this.mondoStatoŜanĝita = malvera;
  },

  ebleĜisdatigiMondoObjektoj: function() {
    if (this.mondoStatoŜanĝita) {
      this.mondoObjektoj.sfero.position.lerp(this.mondoStato.cirkloPoz, 0.3);
      this.mondoObjektoj.sfero.obj.setUniforms({
        uPosition: [this.mondoStato.cirkloPoz.x, this.mondoStato.cirkloPoz.y, this.mondoStato.cirkloPoz.z],
      });
      this.mondoStatoŜanĝita = malvera;
      //this.fotilo.position.copy(this.mondoStato.fotiloPoz);
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
      metiSencimodo(ludoLogiko.agordo.sencimodo);
    } catch (eraro) {
      console.error("Eraro dum legado de agordo:", eraro);
    }

    funkcio()
  },

  aligrandigiBildigilo: function() {
    let xGrando, yGrando;

    if (isMobile.any) {
      xGrando = document.documentElement.clientWidth - 4;
      yGrando = document.documentElement.clientHeight - 4;
    } else {
      xGrando = window.innerWidth - 7;
      yGrando = window.innerHeight - 7;
    }

    this.fotilo.aspect = xGrando / yGrando;
    this.fotilo.updateProjectionMatrix();

    //this.bildigilo.setSize(xGrando, yGrando);
  },
  ebleAldoniAencimigajnPunktojn: function({ludoLogiko}) {
    if (!sencimodo) {
      return;
    }

    ludoLogiko.scenejo.add(funkciojDeSencimigo.kreiPunkton(this.bildigiloKunteksto, 0, 0));

    funkciojDeSencimigo.aldoniDekstranLimanPunkton(ludoLogiko, ludoLogiko.scenejo, ludoLogiko.bildigiloKunteksto, 1);
    funkciojDeSencimigo.aldoniMaldekstranLimanPunkton(ludoLogiko, ludoLogiko.scenejo, ludoLogiko.bildigiloKunteksto, 1);
    funkciojDeSencimigo.aldoniSupraLimanPunkton(ludoLogiko, ludoLogiko.scenejo, ludoLogiko.bildigiloKunteksto, 1);
    funkciojDeSencimigo.aldoniSubanLimanPunkton(ludoLogiko, ludoLogiko.scenejo, ludoLogiko.bildigiloKunteksto, 1);

    funkciojDeSencimigo.aldoniDekstranLimanPunkton(ludoLogiko, ludoLogiko.scenejo, ludoLogiko.bildigiloKunteksto, 2);
    funkciojDeSencimigo.aldoniMaldekstranLimanPunkton(ludoLogiko, ludoLogiko.scenejo, ludoLogiko.bildigiloKunteksto, 2);
    funkciojDeSencimigo.aldoniSupraLimanPunkton(ludoLogiko, ludoLogiko.scenejo, ludoLogiko.bildigiloKunteksto, 2);
    funkciojDeSencimigo.aldoniSubanLimanPunkton(ludoLogiko, ludoLogiko.scenejo, ludoLogiko.bildigiloKunteksto, 2);

    funkciojDeSencimigo.aldoniDekstranLimanPunkton(ludoLogiko, ludoLogiko.scenejo, ludoLogiko.bildigiloKunteksto, 3);
    funkciojDeSencimigo.aldoniMaldekstranLimanPunkton(ludoLogiko, ludoLogiko.scenejo, ludoLogiko.bildigiloKunteksto, 3);
    funkciojDeSencimigo.aldoniSupraLimanPunkton(ludoLogiko, ludoLogiko.scenejo, ludoLogiko.bildigiloKunteksto, 3);
    funkciojDeSencimigo.aldoniSubanLimanPunkton(ludoLogiko, ludoLogiko.scenejo, ludoLogiko.bildigiloKunteksto, 3);
  }
};

const gl = createGLContext();

let timedLogCall = voklimigilo(() => {
  tempigitaRegistraro('Ni komencas desegni kadron');
}, 3);

let throttledFunc = limigilo(() => {
  timedLogCall();
}, 1000);

let inicialigi = async ({gl}) => {
  return new Promise((resolve, reject) => {
    if (sencimodo) {
      const kanvaso = document.createElement('canvas');
      kanvaso.id = 'helpilo-kanvaso';
      kanvaso.style = "position:absolute;right:0;top:0px;border:2px dashed black";
      kanvaso.width = 256;
      kanvaso.height = 256;
      document.body.append(kanvaso);
    }

    gl.canvas.style.height = '100%';
    gl.canvas.style.position = 'absolute';
    const aŭtomataKanvasaGrandeco = true;

    ludoLogiko.inic({ kunteksto: gl, aŭtomataKanvasaGrandeco });

    let models = [];

    if (sencimodo) {
      let points = [
        [-0.5,-0.5],
        [ 0.5,-0.5],
        [ 0.5, 0.5],
        [-0.5, 0.5]
      ];
      const model = dikaPoligonaKonturoModelo(gl, points, [0,0,1,1], 0.004); 
      models.push(model);
    }

    let provizora = new Promise((resolve2, reject2) => {
      //models.push(new AnimaciaKontinento({ ludoLogiko }));
      //ludoLogiko.scenejo.add(new AnimaciaKontinento({ ludoLogiko, resolve: resolve2 }));
      models.push(new AnimaciaKontinento({ ludoLogiko, resolve: resolve2 }));
    });

    provizora.then(() => {
      resolve({models: models});
    });
  });
};

ludoLogiko.uziAgordon(async function() {
  tempigitaRegistraro('Antaŭ inicialigo');
  let inicRezulto = await inicialigi({ gl });
  tempigitaRegistraro('Fino de inicialigo');

  const lumaLoopObj = {
    gl: gl,
    onInitialize: () => {
      tempigitaRegistraro('Inicialigo de Luma');
      return inicRezulto;
    },
    onRender: ({gl, models}) => {
      gl.enable(gl.DEPTH_TEST); // для коректного відображення віддалених в різній мірі об'єктів
      gl.depthFunc(gl.LEQUAL);

      // Увімкнути змішування
      gl.enable(gl.BLEND); // для того щоб можна було робити прозорість
      // Класична формула прозорості
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      statistikoj.ebleKunvolviPerStatistikoj(function() {
  //gl.viewport(0,0,canvas.width,canvas.height);
        gl.clearColor(0.8,0.8,0.8,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        throttledFunc();
        ludoLogiko.ebleĜisdatigiMondoObjektoj();

        ludoLogiko.tekstoRenderilo.setUniforms({aspect: gl.canvas.width / gl.canvas.height, aspekto: gl.canvas.width / gl.canvas.height, uVisible: true, proporcio: gl.canvas.width / gl.canvas.height});
        //ludoLogiko.tekstoRenderilo.draw();
        ludoLogiko.scenejo.objektoj.forEach(objekto => {
          if (false && objekto.grupo == 'points')  {
            return;
          }
          objekto.setUniforms({aspect: gl.canvas.width / gl.canvas.height, aspekto: gl.canvas.width / gl.canvas.height, uVisible: true, proporcio: gl.canvas.width / gl.canvas.height});
          objekto.draw();
        });

        models.forEach(model => {
          model.setUniforms({aspect: gl.canvas.width / gl.canvas.height, aspekto: gl.canvas.width / gl.canvas.height, uVisible: true, proporcio: gl.canvas.width / gl.canvas.height});
          model.draw();
        });
      });
    }
  };

  const loop = new luma.AnimationLoop(lumaLoopObj);

  if (sencimodo) {
    window.lumaLoop = loop;
    window.stopRender = () => {
      window.lumaLoop.stop();
    };
  }

  loop.start();
});
