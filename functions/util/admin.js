const admin = require('firebase-admin');
const serviceAccount = require('../socialape.json');

//this is for firebase functions/firestore
admin.initializeApp({
    credential: null,
    databaseURL: null,
    storageBucket: null
});
const db = admin.firestore();

module.exports = { admin, db };