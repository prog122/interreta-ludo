import { Vector3, Vector2 } from 'https://cdn.jsdelivr.net/npm/@math.gl/core@4.1.0/+esm'

class ludMotoro {
  constructor({ scenejo }) {
    this.scenejo = scenejo;
  }
}

class lmScenejo {
  constructor() {
    this.objektoj = [];
  }

  add(obj) {
    if (!obj) {
      throw 'Mi provas aldoni nedefinitan objekton';
    }

    if (!obj.grupo) {
      throw new Error('La grupo de la objekto ne estas difinita');
    }

    this.objektoj.push(obj);
  }

  remove(obj) {
    console.log("Треба реалізувати метод видалення об'єктів зі сцени");
  }
}

class lmObjekto {
  constructor({ videbla }) {
    if (typeof(videbla) != 'undefined') {
      this.videbla = videbla;
    } else {
      this.videbla = true;
    }
    this.position = new Vector3(0, 0, 0);
  }

  setUniforms() {
  }

  desegni() {
  }

  draw() {
    this.desegni();
  }

  detrui() {
  }
}

class lmRadioĴetilo {
  setFromCamera(muso, fotilo) {
    //
  }

  intersectObjects(objektoj) {
    return [];
  }
}

class lmVektoro2 extends Vector2 {
}

class lmVektoro3 extends Vector3 {
}

export { lmScenejo, ludMotoro, lmObjekto, lmRadioĴetilo, lmVektoro2, lmVektoro3 };
