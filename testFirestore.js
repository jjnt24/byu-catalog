import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyAhwm0DHNmt7tAcd_rk89iVUEQfvtVHods",
  authDomain: "byusoul-member.firebaseapp.com",
  projectId: "byusoul-member",
  storageBucket: "byusoul-member.firebasestorage.app",
  messagingSenderId: "168618143221",
  appId: "1:168618143221:web:9075656f78acd891a084bc",
  measurementId: "G-9F29Z8TETV"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testQuery() {
  const localPhone = '082183880788'; // number to test
  const q = query(collection(db, 'MemberData'), where('localPhone', '==', localPhone));
  const snap = await getDocs(q);
  console.log('Number of documents found:', snap.docs.length);
  snap.docs.forEach(docSnap => {
    console.log('Document ID (UID):', docSnap.id);
    console.log('Document data:', docSnap.data());
  });
}

testQuery().catch(console.error);