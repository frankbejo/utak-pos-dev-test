import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

function firebaseConfig() {
  const firebaseConfig = {
    apiKey: process.env['NEXT_PUBLIC_FIREBASE_API'],
    authDomain: 'utak-pos-development-test.firebaseapp.com',
    databaseURL: process.env['NEXT_PUBLIC_DATABASE_URL'],
    projectId: 'utak-pos-development-test',
    storageBucket: 'utak-pos-development-test.appspot.com',
    messagingSenderId: '899439507031',
    appId: process.env['NEXT_PUBLIC_APP_ID'],
    measurementId: 'G-8X13X2CZDH',
  };
  const app = initializeApp(firebaseConfig);
  return getDatabase(app);
}

export default firebaseConfig;
