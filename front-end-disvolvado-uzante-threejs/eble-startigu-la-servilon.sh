if [[ -n "$output" ]]; then
  echo "Frontend-servilo funkcias"
else
  echo "Frontend-servilo ne funkcias, startigante"
  screen -dmS frontend bash skriptoj/servila-envolvaĵo.sh
fi
