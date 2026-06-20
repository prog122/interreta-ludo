PORT=8080
echo "Ni startigu la front-end-servilon sur pordo $PORT."

if ! busybox httpd -f -p "$PORT" -h ./publ;then
    echo "La servilo ne sukcesis starti; la pordo verŝajne jam estas uzata"
    sleep 1000
fi
