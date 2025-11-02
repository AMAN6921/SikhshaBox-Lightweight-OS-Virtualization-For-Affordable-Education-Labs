#!/bin/bash
echo "=== STEP 3: Installing GCC and G++ Inside Containers ==="

echo "--- Installing in student1 ---"
docker exec -it student1 bash -c "apt-get update && apt-get install -y gcc g++"

echo "--- Installing in student2 ---"
docker exec -it student2 bash -c "apt-get update && apt-get install -y gcc g++"

echo "✅ GCC and G++ installed successfully in both containers!"