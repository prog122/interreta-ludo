dosiero=publ/dosieroj/tera-256x256.json

if [ ! -f "$dosiero" ]; then
  if [ ! -f "dosieroj/osm-0.png" ];then
    echo  "Bonvolu elŝuti per la retumilo la dosieron https://tile.openstreetmap.org/0/0/0.png kaj metu ĝin en dosieroj/osm-0.png"
    exit 1
  fi

  python3 skriptoj/pikseloj-al-json.py "dosieroj/osm-0.png" "$dosiero"
fi
