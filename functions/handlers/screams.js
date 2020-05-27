const { db } = require('../util/admin');

exports.getAllScreams = (req, res) => {
    db.collection('screams').orderBy('createdAt', 'desc').get()
    .then(data => {
        let screams = [];
        data.docs.forEach(scream => {
            screams.push({
                screamId: scream.id,
                body: scream.data().body,
                userHandle: scream.data().userHandle,
                createdAt: scream.data().createdAt
            });
        })
        return res.json(screams);
    })
    .catch(err => {console.error(err)})
};

exports.postOneScream = (req, res) => {
    if(req.body.body.trim() === ' ') {
        return res.status(400).json({body: "Body must not be empty"});
    };

    const newScream = {
        body: req.body.body,
        userHandle: req.user.handle,
        createdAt: new Date().toISOString()
    };

    db.collection('screams').add(newScream)
    .then(doc => {
        res.json({message: `document ${doc.id} was created`});
    })
    .catch(err => {
        res.status(500).json({error: 'something went wrong'});
        console.error(err);
    })
};