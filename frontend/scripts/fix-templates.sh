#!/bin/bash

if [ -z "$1" ]; then
	echo "El primer argumento debe ser la ruta donde arreglar las plantillas"
	exit 1
fi
if ! [ -e "$1" ]; then
	echo "La ruta '$1' no es accesible"
	exit 1
fi

find "$1" -type f -name '*.[jt]s' -print0 | while read -rd '' fname; do
	grep -Eq '^ +' "$fname" | continue

	echo "Procesando '$fname'"
	unexpand --first-only -t 2 "$fname" | tr \' \" > "$fname.tmp"
	mv "$fname.tmp" "$fname"
done
