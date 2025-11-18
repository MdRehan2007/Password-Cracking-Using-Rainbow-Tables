This project is a complete Rainbow Table Simulation Tool designed to demonstrate how passwords are hashed, stored, leaked, and cracked using precomputed hash–reduce chains.
It includes:


Real cryptographic hashing (SHA-256 / SHA-1)


Rainbow table generation


Hash lookup & cracking


Database leak simulation


AES-256 encryption/decryption


Clean and modern frontend UI


Optional backend APIs (Node.js + Express)


This tool is strictly for educational and academic use and helps students understand why strong hashing and salting are required in real systems.

🧩 Features
🔐 1. Plain Text → Hash Converter


Supports SHA-256 and SHA-1


Uses browser Web Crypto API


Instant hashing without server dependency



🌈 2. Rainbow Table Generator
Builds hash → reduce → password chains using:


Custom chain length


Custom number of chains


Password length


Character set (lowercase / uppercase / numeric / alphanumeric)


Shows all steps:
P0 → H0 → P1 → H1 → ... → Final Hash

Also highlights collisions found inside the current table.

🔍 3. Hash Lookup / Cracker
Reverse-searches the rainbow table to recover the password for a given hash.
Outputs:


Found / not found


Chain ID


Recovered password


Operations performed


Time taken



☠️ 4. Database Leak Simulation
Displays fake leaked accounts and hashed passwords.
Users can send leaked hashes directly to the Cracker to simulate real-world hacking attempts.

🗄 5. Stored Rainbow Table Viewer
Stores all generated chains in LocalStorage and allows:


Expanding each chain


Viewing all steps (passwords + hashes)


Viewing timestamps



🔐 6. AES-256 Encryption / Decryption (Backend)


Encrypt any text using AES-CBC


Decrypt it back using the same password


Demonstrates symmetric key encryption




Hash Converter


Rainbow Table Builder


Hash Cracker


Leak Demo


Everything works offline except backend AES APIs.

🖥 How to Run Backend (Optional)
npm install
node server.js

Backend runs at:
http://localhost:3000


📤 API Endpoints
1. Hashing
POST /api/hash

2. AES Encryption
POST /api/encrypt

3. AES Decryption
POST /api/decrypt

4. Generate Rainbow Table
POST /api/rainbow/generate

5. Lookup Hash
POST /api/rainbow/lookup


📸 Sample Outputs
✔ SHA-256 Hash
Input   : hii@123
Output  : a7fa8c4bc3c7016f121bd7d0b03dd855d17eaccca840e9d4ac90b7c12d651080


✔ Rainbow Table Chain
P0: vtxr
H0: 3f1ae7c19ecad1ab92fd84efc0a42accd57f10fb5f7b50ac282e2efc2208d19
P1: dwey
H1: 8cf17428390ddf40c09b3ee60e38f8a6ff61967cba7fafec0f3faf3b9507e613
...


✔ Cracker Output
✔ Hash found in chain #0
Recovered Password: dwey
Operations: 152
Time: 2.13 ms


✔ AES Encryption
Input     : hello world
Password  : 12345
Encrypted : W2Jhc2U2NF9JVl06o2Ffqs03Gg==:sJPK34adfFjL2Wn5I7XmnA==


📘 Educational Purpose
This project helps understand:


Why passwords should never be stored in plain text


How hashing algorithms work


Why salting is mandatory


How attackers use precomputed tables


How weak hashing causes mass breaches


It is perfect for:


B.Tech Projects


Mini-projects


Cybersecurity learning


Data Structures (Hashing)


Viva demonstrations



🛡 Disclaimer
This project is for academic demonstration only.
Not intended for any kind of unauthorized password cracking.

👨‍💻 Author
Mohammad Rehan
SRM University – AP
2025

✨ A viva explanation PDF style
✨ README with emojis + badges
Just tell me:
👉 “Give short README"
👉 “Give abstract”
👉 “Give viva notes”
