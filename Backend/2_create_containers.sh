#!/bin/bash
echo "=== STEP 2: Creating Two Containers ==="

docker run -dit --name student1 ubuntu:22.04 bash
docker run -dit --name student2 ubuntu:22.04 bash

echo "✅ Containers 'student1' and 'student2' created!"
docker ps