const admin = require('firebase-admin');
const serviceAccount = require('../socialape.json');

//this is for firebase functions/firestore
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://socialape-9f523.firebaseio.com"
});
const db = admin.firestore();

module.exports = { admin, db };