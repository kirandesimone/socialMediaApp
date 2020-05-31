const { db } = require('../util/admin');



//get ALL posts
exports.getAllScreams = (req, res) => {
    db.collection('screams').orderBy('createdAt', 'desc').get()
    .then(data => {
        let screams = [];
        data.docs.forEach(scream => {
            screams.push({
                screamId: scream.id,
                body: scream.data().body,
                userHandle: scream.data().userHandle,
                createdAt: scream.data().createdAt,
                commentCount: scream.data().commentCount,
                likeCount: scream.data().likeCount,
                userImage: scream.data().userImage
            });
        })
        return res.json(screams);
    })
    .catch(err => {console.error(err)})
};

//post ONE scream
exports.postOneScream = (req, res) => {
    if(req.body.body.trim() === '') {
        return res.status(400).json({body: "Body must not be empty"});
    };

    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
        imageUrl: req.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    };

    db.collection('screams').add(newScream)
    .then(doc => {
        const resScream = newScream;
        resScream.screamId = doc.id;
        res.json(resScream);
    })
    .catch(err => {
        res.status(500).json({error: 'something went wrong'});
        console.error(err);
    })
};

//get ONE post
exports.getScream = (req, res) => {
    let screamData = {};
    
    db.doc(`/screams/${req.params.screamId}`).get()
    .then((doc) => {
        if(!doc.exists) {
            return res.status(404).json({error: 'Scream not found'});
        }
        screamData = doc.data();
        screamData.screamId = doc.id;
        return db.collection('comments').orderBy('createdAt', 'desc').where('screamId', '==', req.params.screamId).get();
    })
    .then((data) => {
        screamData.comments = [];
        data.forEach(doc => {
            screamData.comments.push(doc.data());
        });
        return res.json(screamData);
    })
    .catch(err => {
        console.error(err);
        return res.status(400).json({error: err.code});
    })
};

//leave a comment on a post
exports. commentOnScream = (req, res) => {
    if(req.body.body.trim() === '') {
        return res.status(400).json({comment: "Must not be empty"});
    }

    const newComment = {
        body: req.body.body,
        createdAt: new Date().toISOString(),
        screamId: req.params.screamId,
        userHandle: req.user.handle,
        userImage: req.user.imageUrl
    };

    db.doc(`/screams/${req.params.screamId}`).get()
    .then((doc) => {
        if(!doc.exists) {
            return res.status(400).json({error: "Scream not found"});
        };
        return doc.ref.update({commentCount: doc.data(). commentCount + 1});
    })
    .then(() => {
        return db.collection('comments').add(newComment);
    })
    .then(() => {
        return res.json(newComment);
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: 'Something went wrong'});
    })
};


//Like a post
exports.likeScream = (req, res) => {
    const likeDoc = db.collection('likes').where('userHandle', '==', req.user.handle)
    .where('screamId', '==', req.params.screamId).limit(1);

    const screamDoc = db.doc(`/screams/${req.params.screamId}`);

    let screamData = {};

    screamDoc.get()
    .then((doc) => {
        if(doc.exists) {
            screamData = doc.data();
            screamData.screamId = doc.id;
            return likeDoc.get();

        } else {
            return res.status(400).json({error: 'Scream not found'});
        }
    })
    .then((data) => {
        if(data.empty) {
            return db.collection('likes').add({
                screamId: req.params.screamId,
                userHandle: req.user.handle
            })
            .then(() => {
                screamData.likeCount++;
                return screamDoc.update({likeCount: screamData.likeCount});
            })
            .then(() => {
                return res.json(screamData);
            })

        } else {
            return res.status(400).json({error: 'Scream already Liked'});
        }
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
};


//unlike a post
exports.unlikeScream = (req, res) => {
    const likeDoc = db.collection('likes').where('userHandle', '==', req.user.handle)
    .where('screamId', '==', req.params.screamId).limit(1);

    const screamDoc = db.doc(`/screams/${req.params.screamId}`);

    let screamData = {};

    screamDoc.get()
    .then((doc) => {
        if(doc.exists) {
            screamData = doc.data();
            screamData.screamId = doc.id;
            return likeDoc.get();

        } else {
            return res.status(400).json({error: 'Scream not found'});
        }
    })
    .then((data) => {
        if(data.empty) {
            return res.status(400).json({error: 'Scream not Liked'});
        } else {
            return db.doc(`/likes/${data.docs[0].id}`).delete()
            .then(() => {
                screamData.likeCount--;
                return screamDoc.update({ likeCount: screamData.likeCount});
            })
            .then(() => {
                res.json(screamData);
            })
        } 
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
};

//deleting a post
exports.deleteScream = (req, res) => {
    const document = db.doc(`/screams/${req.params.screamId}`);

    document.get()
    .then((doc) => {
        if(!doc.exists) {
            return res.status(400).json({error: 'Scream not found'});
        }

        if(doc.data().userHandle !== req.user.handle) {
            return res.status(403).json({error: 'unauthorized'});
        } else {
            return document.delete();
        }
    })
    .then(() => {
        res.json({message: 'Scream was deleted'});
    })
    .catch((err) => {
        console.error(err);
        return res.status(500).json({error: err.code});
    });
};