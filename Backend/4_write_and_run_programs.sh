#!/bin/bash
echo "=== STEP 4: Writing and Running Programs in Containers ==="

echo "--- Student 1 (C Program) ---"
docker exec -it student1 bash -c 'echo "#include <stdio.h>\nint main(){printf(\"Hello from Student 1 (C Program)\\n\");}" > student1.c'
docker exec -it student1 bash -c "gcc student1.c -o student1 && ./student1"

echo
echo "--- Student 2 (C++ Program) ---"
docker exec -it student2 bash -c 'echo "#include <iostream>\nusing namespace std;\nint main(){cout << \"Hello from Student 2 (C++ Program)\" << endl;}" > student2.cpp'
docker exec -it student2 bash -c "g++ student2.cpp -o student2 && ./student2"

echo
echo "✅ Programs compiled and executed successfully!"