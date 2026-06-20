const {Model, Geometry} = luma;
import { lmObjekto, lmVektoro3 } from './ludMotoro.js';

class Rondo extends lmObjekto {
  constructor({ obj, position }) {
    super({ videbla: true });
    this.obj = obj;
  }

  setUniforms(valoro) {
    this.obj.setUniforms(valoro);
  }

  draw() {
    this.obj.draw();
  }
}

// @g @m
function kreiCirklon(gl, centerX, centerY, coordZ, radius, aspect = 1.0, segments = 64, color = [0.3, 0.7, 0.9, 1.0], aspect2 = 1.0) {
	//aspect = 1/1.33;aspect2 = 1;
  const pozicioj = [];
  const indices = [];

  // центр
  pozicioj.push(centerX, centerY, coordZ);

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * 2 * Math.PI;
    const x = centerX + Math.cos(angle) * radius * aspect; // масштаб по X
    const y = centerY + Math.sin(angle) * radius;          // Y без змін
    pozicioj.push(x, y, coordZ);

    if (i > 0) {
      indices.push(0, i, i + 1);
    }
  }

  const geometry = new Geometry({
    attributes: {
      positions: new Float32Array(pozicioj)
    },
    indices: new Uint16Array(indices)
  });

  const model = new Model(gl, {
    vs: `\
      attribute vec3 positions;
      uniform float aspect;
      uniform vec3 uPosition;
      void main(void) {
        vec3 pos = positions;
        pos.x /= aspect;   // компенсуємо ширину
        gl_Position = vec4(pos + uPosition, 1.0);
      }
    `,
    fs: `\
      uniform vec4 uColor;
      void main(void) {
        gl_FragColor = uColor;
      }
    `,
    geometry,
    uniforms: {
      uColor: color, // передаємо колір як uniform
      aspect: aspect2,
      uPosition: [0, 0, 0]
    }
  });

  return new Rondo({ obj: model, position: new lmVektoro3(centerX, centerY, 0) });
}

export { kreiCirklon };
