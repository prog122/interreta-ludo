output=$(screen -ls | grep fizika-servilo)

if [[ -n "$output" ]]; then
  echo "Fizika servilo funkcias"
else
  echo "Fizika servilo ne funkcias, startigante"
  screen -dmS fizika-servilo ./fizika-servilo
fi

