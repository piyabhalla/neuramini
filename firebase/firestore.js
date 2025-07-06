import { getFirestore } from "firebase/firestore";
import { app } from "../firebase/firebase";


const db = getFirestore(app);

export { db };
