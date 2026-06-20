import { lmObjekto } from './ludMotoro.js';
import { sencimodo } from './sencimodo.js';

const vera = true, malvera = false;

function bildigiMatricon({ gl, kanvaso, grandeco, datumoj }) {
  // --- Teksturo kun matrico ---
  const tekstoMatricon = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tekstoMatricon);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, grandeco, grandeco, 0, gl.RGBA, gl.UNSIGNED_BYTE, datumoj);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  // --- Ŝaderoj ---
const fontoDeVŜ = `
  attribute vec2 aPosition;
  attribute vec2 aTexCoord;
  uniform float aspekto;
  varying vec2 vTexCoord;
  void main() {
    // квадрат -0.5..0.5 з aspect-корекцією
    gl_Position = vec4(aPosition.x / aspekto, aPosition.y, 0.0, 1.0);
    vTexCoord = aTexCoord;
  }
`;
const fontoDeFŜ = `
  precision mediump float;
  varying vec2 vTexCoord;
  uniform sampler2D uTexture;
  void main() {
    gl_FragColor = texture2D(uTexture, vTexCoord);
  }
`;

  // --- Helpaj funkcioj ---
  function kompiliŜadero(kodo, tipo) {
    const ŝadero = gl.createShader(tipo);
    gl.shaderSource(ŝadero, kodo);
    gl.compileShader(ŝadero);
    return ŝadero;
  }
  function kreiProgramon(fontoDeVŜ, fontoDeFŜ) {
    const vŝ = kompiliŜadero(fontoDeVŜ, gl.VERTEX_SHADER);
    const fŝ = kompiliŜadero(fontoDeFŜ, gl.FRAGMENT_SHADER);
    const programo = gl.createProgram();
    gl.attachShader(programo, vŝ);
    gl.attachShader(programo, fŝ);
    gl.linkProgram(programo);
    return programo;
  }

  // --- Programo ---
  const programo = kreiProgramon(fontoDeVŜ, fontoDeFŜ);
  gl.useProgram(programo);

  // --- Geometrio de kvadrato -0.5..0.5 kun UV 0..1 ---
  const bufro = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, bufro);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -0.5,-0.5, 0,0,
     0.5,-0.5, 1,0,
    -0.5, 0.5, 0,1,
     0.5, 0.5, 1,1
  ]), gl.STATIC_DRAW);

  const lokPoz = gl.getAttribLocation(programo, "aPosition");
  const lokTex = gl.getAttribLocation(programo, "aTexCoord");
  gl.enableVertexAttribArray(lokPoz);
  gl.enableVertexAttribArray(lokTex);
  gl.vertexAttribPointer(lokPoz, 2, gl.FLOAT, false, 16, 0);
  gl.vertexAttribPointer(lokTex, 2, gl.FLOAT, false, 16, 8);

  const uAspekto = gl.getUniformLocation(programo, "aspekto");
  gl.uniform1f(uAspekto, kanvaso.width/kanvaso.height);

  const uTeksturo = gl.getUniformLocation(programo, "uTexture");
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, tekstoMatricon);
  gl.uniform1i(uTeksturo, 0);

  // --- Desegni sur ekrano ---
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

class MatricaBildigilo extends lmObjekto {
  constructor({ gl, matrico, koloro = [0, 0, 32, 255]}) {
    super({ videbla: vera });

    this.grupo = 'matrica-bildigilo';
    this.gl = gl;

    const larĝo = matrico[0].length;
    const alto = matrico.length;

    if (sencimodo) {
      this.gl2 = document.getElementById('helpilo-kanvaso').getContext('webgl2');
    }
    this.matrico = matrico;
    const grandeco = this.grandeco = matrico.length;
    this.datumoj = this.matricoAlPikseloj(this.matrico, koloro);
  }

  matricoAlPikseloj(matrico, koloro = [0, 0, 32, 255]) {
    const grandeco = matrico.length;
    const datumoj = new Uint8Array(grandeco * grandeco * 4);

    for (let i = 0; i < grandeco*grandeco; i++) {
      const x = i % grandeco;
      const y = grandeco - 1 - Math.floor(i / grandeco);
      if (this.matrico[y][x]) {
        datumoj[i*4+0] = koloro[0];   // R
        datumoj[i*4+1] = koloro[1];   // G
        datumoj[i*4+2] = koloro[2];   // B
        datumoj[i*4+3] = koloro[3];   // A
      } else {
        datumoj[i*4+0] = 0.8 * 255;   // R
        datumoj[i*4+1] = 0.8 * 255;   // G
        datumoj[i*4+2] = 0.8 * 255;   // B
        datumoj[i*4+3] = 0;           // A
      }
    }

    return datumoj;
  }

  desegni() {
    bildigiMatricon({ gl: this.gl, kanvaso: this.gl.canvas, grandeco: this.grandeco, datumoj: this.datumoj });
  }
}

export { MatricaBildigilo };

