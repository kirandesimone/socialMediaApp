/*
this is a dbSchema 
firebase charges you the amount of time you read/write to firebase 
so trying to minimize the amount of read/write we do :)

*/


let db = {
    screams: [
        {
            userHandle: 'user',
            body: 'this is the scream',
            createdAt: 'this is a ISOString',
            likeCount: 5,
            commentCount: 2
        }
    ]
}