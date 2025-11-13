docker run -dit \
  --name container_c \
  --memory="1g" \
  --cpus="1" \
  --storage-opt size=10G \
  ubuntu:latest