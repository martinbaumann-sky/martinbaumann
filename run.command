#!/bin/bash
cd "$(dirname "$0")"

PORT=8000
PID=$(lsof -ti:$PORT)
if [ ! -z "$PID" ]; then
    echo "Liberando el puerto $PORT (proceso anterior)..."
    kill -9 $PID
fi

echo "Iniciando servidor local..."
sleep 1 && open http://localhost:$PORT &
python3 -m http.server $PORT
