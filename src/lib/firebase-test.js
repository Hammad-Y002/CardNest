import { getFirestore, collection, getDocs } from "firebase/firestore";
import app from "./firebase";

const db = getFirestore(app);

useEffect(() => {
  const testConnection = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "testCollection"));
      console.log("Firebase connected successfully! Documents:", querySnapshot.size);
    } catch (error) {
      console.error("Firebase connection failed:", error.message);
    }
  };
  testConnection();
}, []);
