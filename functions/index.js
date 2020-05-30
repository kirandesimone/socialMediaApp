//Express set-up
const express = require('express');
const app = express();

//firebase set-up
const functions = require('firebase-functions');
const FBAuth = require('./util/fbAuth');

const { getAllScreams, postOneScream, getScream, commentOnScream, likeScream, unlikeScream, deleteScream } = require('./handlers/screams');
const {signUp, login, uploadImage, addUserDetails, getAuthenticatedUser } = require('./handlers/users');



//scream routes
app.get('/screams', getAllScreams);
app.post('/scream', FBAuth, postOneScream );
app.get('/scream/:screamId', getScream);
app.post('/scream/:screamId/comment', FBAuth, commentOnScream);
app.get('/scream/:screamId/like', FBAuth, likeScream);
app.get('/scream/:screamId/unlike', FBAuth, unlikeScream);
app.delete('/scream/:screamId', FBAuth, deleteScream);

//sign-up/login routes
app.post('/signup', signUp);
app.post('/login', login);

//users routes
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);


// https://baseurl.com/api/something  -> for apis
exports.api = functions.https.onRequest(app);