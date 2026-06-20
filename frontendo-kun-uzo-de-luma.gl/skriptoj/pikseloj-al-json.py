import sys
import json
from PIL import Image
import numpy as np

def ĉefa():
    if len(sys.argv) < 3:
        print("Uzo: python skripto.py <vojo-al-bildo> <vojo-al-json-dosiero")
        return

    dosiernomo = sys.argv[1]
    jsonDosiernomo = sys.argv[2]
    bildo = Image.open(dosiernomo)
    matrico = np.array(bildo)  # pikselmatrico (RGB aŭ RGBA)

    # Konverti al Python-listo por JSON
    matrico_listo = matrico.tolist()

    # Konservi en JSON-dosiero
    print(matrico_listo)
    try:
        with open(jsonDosiernomo, "w", encoding="utf-8") as f:
            json.dump(matrico_listo, f)
    except Exception as eraro:
        print("Eraro dum konservado:", eraro)

    print("Grandeco:", matrico.shape)  # (alto, larĝo, kanaloj)
    print("La pikselmatrico estis konservita en json dosiero")

if __name__ == "__main__":
    ĉefa()
