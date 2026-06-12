import * as THREE from 'three';
import { sencimodo, ebleLog } from './sencimodo.js';

const klakregistrilo = {
  muso: null,
  radioĵetilo: null,
  ebleInit: function(bildigilo, scenejo, fotilo) {
    if (!sencimodo) {
      return;
    }

    this.radioĵetilo = new THREE.Raycaster();
    this.muso = new THREE.Vector2();
    const th = this;

    function alklako(event) {
      // normaligitaj koordinatoj de muso
      th.muso.x = (event.clientX / window.innerWidth) * 2 - 1;
      th.muso.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // kreas radion el fotilo tra punkto de klako
      th.radioĵetilo.setFromCamera(th.muso, fotilo);

      // kontrolas intersekciĝon kun objektoj de scenejo
      const intersekcoj = th.radioĵetilo.intersectObjects(scenejo.children);

      if (intersekcoj.length > 0) {
	intersekcoj.forEach(intersekco => {
	  if (intersekco.object.name.match(/kahelo/)) {
            const punkto = intersekco.point; // koordinatoj de intersekca punkto
            console.log("Koordinatoj de klako:", punkto.x, punkto.y, punkto.z, intersekcoj);
	  }
	});
      }
    }

    bildigilo.domElement.addEventListener('click', alklako);
  }
}

export { klakregistrilo };

