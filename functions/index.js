//Express set-up
const express = require('express');
const app = express();

//firebase set-up
const functions = require('firebase-functions');
const FBAuth = require('./util/fbAuth');

const { getAllScreams, postOneScream } = require('./handlers/screams');
const {signUp, login } = require('./handlers/users');



//scream routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream );

//sign-up/login routes
app.post('/signup', signUp);
app.post('/login', login);



// https://baseurl.com/api/something  -> for apis
exports.api = functions.https.onRequest(app);