import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

// Agregar configuración firebase:
const firebaseConfig = {
    apiKey: "AIzaSyB3CctqAlEPQ9Wqm1-52SYOHm6ImlMKB6s",
    authDomain: "money-tracker-e7953.firebaseapp.com",
    projectId: "money-tracker-e7953",
    storageBucket: "money-tracker-e7953.appspot.com",
    messagingSenderId: "614189882754",
    appId: "1:614189882754:web:3354dce146fe5383bd839b"
};

firebase.initializeApp(firebaseConfig);
let db = firebase.firestore();
let auth = firebase.auth();

export { db, auth };
