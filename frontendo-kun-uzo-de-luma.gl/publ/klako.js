import { sencimodo, ebleProtokolo } from './sencimodo.js';
import { lmRadioĴetilo, lmVektoro2 } from './ludMotoro.js'
import { geojsonAlMerkatora } from './utilaĵoj.js';

const klakregistrilo = {
  muso: null,
  radioĵetilo: null,
  ebleInic: function(scenejo, fotilo) {
    if (!sencimodo) {
      return;
    }

    this.radioĵetilo = new lmRadioĴetilo();
    this.muso = new lmVektoro2();
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
	  if (intersekco.object.name && intersekco.object.name.match(/kahelo/)) {
            const punkto = intersekco.point; // koordinatoj de intersekca punkto
	    let x = Math.abs(punkto.x);
	    let y = Math.abs(punkto.y);
	    const mDatumoj = geojsonAlMerkatora(Math.abs(punkto.x), Math.abs(punkto.y));
	    const mDatumoj2 = geojsonAlMerkatora(0, 0);
            console.log("Koordinatoj de klako:", punkto.x, punkto.y, punkto.z, { x: x, y: y }, mDatumoj, mDatumoj2);
	  }
	});
      }
    }

    document.body.addEventListener('click', alklako);
  }
}

export { klakregistrilo };

