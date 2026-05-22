import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCzFEnWx3SyOwuIGeDkqo6iHN0kFND_qPA",
  authDomain: "visitas-hospital-web.firebaseapp.com",
  projectId: "visitas-hospital-web",
  storageBucket: "visitas-hospital-web.firebasestorage.app",
  messagingSenderId: "935263770851",
  appId: "1:935263770851:web:34666ddf3feb3f18b38dd6",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);