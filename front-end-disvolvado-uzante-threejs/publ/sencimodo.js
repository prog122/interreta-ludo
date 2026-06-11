// vera = true, malvera = false
const vera = true, malvera = false;

let sencimodo = malvera; // debug → sencimodo

function ebleLog(mesaĝo) {
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

export { sencimodo, ebleLog, metiSencimodo };
