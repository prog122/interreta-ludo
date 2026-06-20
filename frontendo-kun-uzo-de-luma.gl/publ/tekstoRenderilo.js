import { lmObjekto } from './ludMotoro.js';

// Funkcio por desegni tekston
// @g
function desegniTekston(gl, programo, teksto, x, y, tiparo="32px Arial", koloro="white", { uSampler, aPosition, aTexCoord }) {
  const tekstaKanvaso = document.createElement("canvas");
  const kunteksto = tekstaKanvaso.getContext("2d");
  kunteksto.textBaseline = "middle" // @g @a
  kunteksto.font = tiparo;
  const mezuroj = kunteksto.measureText(teksto);
  tekstaKanvaso.width = mezuroj.width;
  tekstaKanvaso.height = parseInt(tiparo, 10) * 1.5;

  kunteksto.font = tiparo;
  kunteksto.fillStyle = koloro;
  kunteksto.textBaseline = "top";
  //kunteksto.fillText(teksto, 0, 0);
  kunteksto.fillText(teksto, 0, tekstaKanvaso.height / 4); // @g @a

  const teksturo = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, teksturo);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tekstaKanvaso);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  const aspekto = gl.canvas.width / gl.canvas.height;
  const w = (tekstaKanvaso.width / gl.canvas.width) * 2 * aspekto;
  const h = (tekstaKanvaso.height / gl.canvas.height) * 2;

  x = x / aspekto;

  const pozicioj = new Float32Array([
    x, y,
    x + w, y,
    x + w, y - h,
    x, y - h
  ]);

  const tekstajKoord = new Float32Array([
    0, 0,
    1, 0,
    1, 1,
    0, 1
  ]);

  const indeksaj = new Uint16Array([0,1,2, 0,2,3]);

  const bufPozicio = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufPozicio);
  gl.bufferData(gl.ARRAY_BUFFER, pozicioj, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aPosition);

  const bufTeksto = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufTeksto);
  gl.bufferData(gl.ARRAY_BUFFER, tekstajKoord, gl.STATIC_DRAW);
  gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(aTexCoord);

  const bufIndekso = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bufIndekso);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indeksaj, gl.STATIC_DRAW);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, teksturo);
  gl.uniform1i(uSampler, 0);

  gl.drawElements(gl.TRIANGLES, indeksaj.length, gl.UNSIGNED_SHORT, 0);
}


class TekstoRenderilo extends lmObjekto {
  constructor({ ludoLogiko, matrico, punktoj, videbla }) {
    super({});
    this.gl = ludoLogiko.bildigiloKunteksto;
    let gl = this.gl;

    // (Shaderoj restas senŝanĝaj)
    const fontoDeVŜ = `
      attribute vec2 aPosition;
      attribute vec2 aTexCoord;
      varying vec2 vTexCoord;
      void main(void) {
        gl_Position = vec4(aPosition, 0.0, 1.0);
        vTexCoord = aTexCoord;
      }
    `;
    const fontoDeFŜ = `
      precision mediump float;
      varying vec2 vTexCoord;
      uniform sampler2D uSampler;
      void main(void) {
        gl_FragColor = texture2D(uSampler, vTexCoord);
      }
    `;

    function kompiliŜadero(kodo, tipo) {
      const ŝadero = gl.createShader(tipo);
      gl.shaderSource(ŝadero, kodo);
      gl.compileShader(ŝadero);
      return ŝadero;
    }
    const vs = kompiliŜadero(fontoDeVŜ, gl.VERTEX_SHADER);
    const fs = kompiliŜadero(fontoDeFŜ, gl.FRAGMENT_SHADER);

    const programo = gl.createProgram();
    gl.attachShader(programo, vs);
    gl.attachShader(programo, fs);
    gl.linkProgram(programo);
    gl.useProgram(programo);

    const aPosition = gl.getAttribLocation(programo, "aPosition");
    const aTexCoord = gl.getAttribLocation(programo, "aTexCoord");
    const uSampler = gl.getUniformLocation(programo, "uSampler");
    this.programo = programo;
    this.uSampler = uSampler;
    this.aPosition = aPosition;
    this.aTexCoord = aTexCoord;
    this.tekstoj = [];
  }

  renderiTekston(teksto, x, y) {
    let th = this, gl = this.gl;
    this.tekstoj.push(function() {
      // (Shaderoj restas senŝanĝaj)
const fontoDeVŜ = `
  attribute vec2 aPosition;
  attribute vec2 aTexCoord;
  varying vec2 vTexCoord;
  uniform float aspect;
  void main(void) {
    vec2 pos = aPosition;
    //pos.x -= 0.1;
    //pos.x /= aspect;
    gl_Position = vec4(pos, -0.002, 1.0);
    vTexCoord = aTexCoord;
  }
`;
const fontoDeFŜ = `
  precision mediump float;
  varying vec2 vTexCoord;
  uniform sampler2D uSampler;
  void main(void) {
    gl_FragColor = texture2D(uSampler, vTexCoord);
  }
`;

      function kompiliŜadero(kodo, tipo) {
        const ŝadero = gl.createShader(tipo);
        gl.shaderSource(ŝadero, kodo);
        gl.compileShader(ŝadero);
        return ŝadero;
      }
      const vs = kompiliŜadero(fontoDeVŜ, gl.VERTEX_SHADER);
      const fs = kompiliŜadero(fontoDeFŜ, gl.FRAGMENT_SHADER);

      const programo = gl.createProgram();
      gl.attachShader(programo, vs);
      gl.attachShader(programo, fs);
      gl.linkProgram(programo);
      gl.useProgram(programo);

      const aPosition = gl.getAttribLocation(programo, "aPosition");
      const aTexCoord = gl.getAttribLocation(programo, "aTexCoord");
      const uSampler = gl.getUniformLocation(programo, "uSampler");
      desegniTekston(th.gl, th.programo, teksto, x, y, "20px Arial", "blue", { uSampler: uSampler, aPosition: aPosition, aTexCoord: aTexCoord })
    });
  }

  desegni() {
    this.tekstoj.map(teksto => {
      teksto();
    });
  }
}

export { TekstoRenderilo };
