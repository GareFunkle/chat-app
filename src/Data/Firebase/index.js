import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getMessaging, requestPermission, getToken } from "firebase/messaging";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBnuYsjgn0bRMW_OmmByHZRLRjDtaquvNc",
  authDomain: "chat-app-55a62.firebaseapp.com",
  databaseURL: "https://chat-app-55a62-default-rtdb.firebaseio.com",
  projectId: "chat-app-55a62",
  storageBucket: "chat-app-55a62.appspot.com",
  messagingSenderId: "502527641962",
  appId: "1:502527641962:web:dae17343ba47a7aca03d13",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
// const messaging = getMessaging(app);
const provider = new GoogleAuthProvider();
const storage = getStorage(app);

// requestPermission(messaging)
//   .then(() => {
//     console.log("Notification permission granted.");

//     // Après l'autorisation de l'utilisateur, tu peux récupérer le jeton
//     getToken(messaging, {
//       vapidKey: "KPnWed0IHxvYDILoIlWoFDiTax3vm0aNK-tE5TAfWr4",
//     })
//       .then((currentToken) => {
//         if (currentToken) {
//           // Envoie le jeton à ton serveur et le met à jour si nécessaire
//           console.log(currentToken);
//         } else {
//           console.error(
//             "No registration token available. Request permission to generate one."
//           );
//         }
//       })
//       .catch((err) => {
//         console.error("An error occurred while retrieving token. ", err);
//       });
//   })
//   .catch((err) => {
//     console.error("Unable to get permission to notify.", err);
//   });

export { db, auth, provider, storage };
