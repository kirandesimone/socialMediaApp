const isEmpty = (string) => {
    if(string.trim() === '') {
        return true;
    } else {
        return false;
    }
};

//check for valid email
const isEmail = (string) => {
    const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(string.match(emailRegEx)) {
        return true;
    } else {
        return false;
    }
};

exports.validateSignUpData = (data) => {
    //Validation for sign-up
    let errors = {};

    if(isEmpty(data.email)) {
        errors.email = 'Must not be empty';
    }else if(!isEmail(data.email)) {
        error.email = 'Must be a valid address'
    };

    if(isEmpty(data.password)) {
        errors.password = 'Must be filled';
    };

    if(data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords must match';
    };

    if(isEmpty(data.handle)) {
        errors.handle = 'Provide a handle';
    };

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
    //END of sign-up validation
};

exports.validateLoginData = (data) => {
    let errors = {};

    if(isEmpty(data.email)) {
        return errors.email = 'must not be empty';
    };

    if(isEmpty(data.password)) {
        return errors.password = 'must not be empty';
    };

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }

};

exports.reduceUserDetails = (data) => {
    let userDetails = {};
    
    if(!isEmpty(data.bio.trim())) {
        userDetails.bio = data.bio;
    };

    if(!isEmpty(data.website.trim())) {
        //always adding http:// to the front of the users website.
        if(data.website.trim().substring(0, 4) !== 'http') {
            userDetails.website = `http://${data.website.trim()}`;
        } else {
            userDetails.website = data.website;
        }
    };

    if(!isEmpty(data.location.trim())) {
        userDetails.location = data.location;
    };
    return userDetails;
}