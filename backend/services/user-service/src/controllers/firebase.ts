// src/config/firebaseAdmin.ts
import admin from "firebase-admin";
import * as path from "path";
import serviceAccount from "./serviceAccountKey.json";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});
}

export default admin;
