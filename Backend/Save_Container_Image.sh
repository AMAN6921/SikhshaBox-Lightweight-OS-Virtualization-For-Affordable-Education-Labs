docker commit container_c my_saved_image

docker rm -f container_c

docker run -dit --name new_container_c my_saved_image

docker run -it my_saved_image