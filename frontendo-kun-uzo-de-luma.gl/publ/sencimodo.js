// vera = true, malvera = false
const vera = true, malvera = false;

let sencimodo = malvera; // debug → sencimodo

function ebleProtokolo(mesaĝo) {
  if (sencimodo) {
    console.log(
      "%c" + mesaĝo,
      "color: #333333; background: #C0C0C0; padding: 0px 4px; border-radius: 4px;"
    );
  }
}

function metiSencimodo(valoro) {
  sencimodo = valoro;
}

let konzolaProtokolo = console.log;

function tempigitaRegistraro() {
  if (sencimodo) {
    let tempo = Math.round(Date.now() / 100) / 10;
    //konzolaProtokolo(+time.toString().slice(7, time.length), JSON.stringify(arguments));
    konzolaProtokolo.apply(null, [+tempo.toString().slice(7, tempo.length)].concat(...arguments));
  }
}

let konzolaProtokoloRezervo = console.log;

function malŝaltiRektanKonzolanEliron() {
  console.log = function() {};
}

export { sencimodo, ebleProtokolo, metiSencimodo, tempigitaRegistraro, malŝaltiRektanKonzolanEliron };
