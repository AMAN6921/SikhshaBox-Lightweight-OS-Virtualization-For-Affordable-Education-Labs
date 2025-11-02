docker run -dit --name container1 -v student1_data:/home/student1 ubuntu:latest

docker run -dit --name container1 -v /Users/host/student1:/home/student1 ubuntu:latest

docker run -dit --name new_container1 -v student1_data:/home/student1 ubuntu:latest