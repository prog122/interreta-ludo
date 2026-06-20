import json
import numpy as np
from PIL import Image

def ĉefa():
    with open("publ/dosieroj/tera-256x256.json", "r", encoding="utf-8") as f:
        matrico_listo = json.load(f)

    matrico = np.array(matrico_listo, dtype=np.uint8)

    bildo = Image.fromarray(matrico)
    bildo.save("rekonstruita.png")   # зберегти у файл

    print("La dosiero estis konservita en rekonstruita.png")


if __name__ == "__main__":
    ĉefa()
