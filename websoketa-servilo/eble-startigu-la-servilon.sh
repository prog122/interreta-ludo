output=$(screen -ls | grep websoketa-servilo)

if [[ -n "$output" ]]; then
  echo "Websoketa servilo funkcias"
else
  echo "Websoketa servilo ne funkcias, startigante"
  screen -dmS websoketa-servilo ./build/websoketa-servillo
fi

