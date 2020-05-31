//Express set-up
const express = require('express');
const app = express();
const {db} = require('./util/admin');

//firebase set-up
const functions = require('firebase-functions');
const FBAuth = require('./util/fbAuth');

const { 
    getAllScreams, 
    postOneScream, 
    getScream, 
    commentOnScream, 
    likeScream, 
    unlikeScream, 
    deleteScream 
} = require('./handlers/screams');

const {
    signUp, 
    login, 
    uploadImage, 
    addUserDetails, 
    getAuthenticatedUser, 
    getUserDetails, 
    markNotificationsRead 
} = require('./handlers/users');



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
app.get('/user/:handle', getUserDetails);
app.post('/notifications',FBAuth, markNotificationsRead);


// https://baseurl.com/api/something  -> for apis
exports.api = functions.https.onRequest(app);




//these are firestore triggers for when a user gets a notification.
exports.createNotificationsOnLike = functions.firestore.document('/likes/{id}')
.onCreate((snapshot) => {
    return db.doc(`/screams/${snapshot.data().screamId}`).get()
    .then(doc => {
        if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt: new Date().toISOString(),
                recipient: doc.data().userHandle,
                sender: snapshot.data().userHandle,
                type: 'like',
                read: false,
                screamId: doc.id
            });
        }
    })
    .catch(err => {
        console.error(err);
    })
});

exports.deleteNotificationOnUnlike = functions.firestore.document('/likes/{id}')
.onDelete((snapshot) => {
    return db.doc(`/notifications/${snapshot.id}`)
    .delete()
    .catch((err) => {
        console.error(err);
    })
});

exports.createNotificationsOnComment = functions.firestore.document('/comments/{id}')
.onCreate((snapshot) => {
    return db.doc(`/screams/${snapshot.data().screamId}`).get()
    .then(doc => {
        if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle) {
            return db.doc(`/notifications/${snapshot.id}`).set({
                createdAt: new Date().toISOString(),
                recipient: doc.data().userHandle,
                sender: snapshot.data().userHandle,
                type: 'comment',
                read: false,
                screamId: doc.id
            });
        }
    })
    .catch(err => {
        console.error(err);
    });
});

exports.onUserImageChange = functions.firestore.document('/users/{userId}')
.onUpdate((change) => {
    console.log(change.before.data());
    console.log(change.after.data());
    if(change.before.data().imageUrl !== change.after.data().imageUrl) {
        console.log('image has changed');
        let batch = db.batch();
        return db.collection('screams').where('userHandle', '==', change.before.data().handle).get()
        .then((data) => {
        data.forEach(doc => {
            const scream = db.doc(`/screams/${doc.id}`);
            batch.update(scream, { userImage: change.after.data().imageUrl});
        });
        return batch.commit();
        });
    } else {
        return true;
    }
});


exports.onScreamDelete = functions.firestore.document('/screams/{screamId}')
.onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db.collection('comments').where('screamId', '==', screamId).get()
    .then(data => {
        data.forEach(doc => {
            batch.delete(db.doc(`/comments/${doc.id}`));
        })
        return db.collection('likes').where('screamId', '==', screamId).get();
    })
    .then(data => {
        data.forEach(doc => {
            batch.delete(db.doc(`/likes/${doc.id}`));
        })
        return db.collection('notifications').where('screamId', '==', screamId).get();
    })
    .then(data => {
        data.forEach(doc => {
            batch.delete(db.doc(`/notifications/${doc.id}`));
        })
        return batch.commit();
    })
    .catch(err => console.error(err));
})