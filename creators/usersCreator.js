const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const emailValidator = require("email-validator");
const uniqueValidator = require("mongoose-unique-validator");

const validatePhoneNumber = (phoneNumber) => {
    if (isNaN(phoneNumber) || phoneNumber.length !== 9) {
        return false;
    } else return true;
};

userTemplate = {
    type: {
        type: String,
        required: true,
    },
    login: {
        type: String,
        trim: true,
        required: [true, "Login jest wymagany"],
        unique: [true, "Login jest już zajęty"],
        uniqueCaseInsensitive: true,
        minlength: [6, "login jest za krótki"],
        maxlength: [16, "login jest za długi"],
    },
    email: {
        type: String,
        trim: true,
        required: [true, "Email jest wymagany"],
        unique: [true, "Podany adres e-mail jest już używany"],
        validate: [
            {
                validator: (email) => emailValidator.validate(email),
                message: "Nieprawiłowy e-mial",
            },
        ],
        minlength: [6, "Nieprawidłowy e-mail"],
        maxlength: [256, "Nieprawidłowy e-mail"],
    },
    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: false,
        validate: [
            {
                validator: (number) => validatePhoneNumber(number),
                message: "Błędny numer telefonu",
            },
        ],
    },
    adress: {
        type: String,
        required: [true, "adress jest wymagany"],
    },
    signUpDate: {
        type: Date,
        default: Date.now,
    },
    notices: {
        type: Array,
        default: [],
    },
};

personUserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Imię jest wymagane"],
        maxlength: [24, "Imię jest za długię"],
    },
    lastName: {
        type: String,
        required: [true, "Nazwisko jest wymagane"],
        maxlength: [50, "Nazwisko jest za długię"],
    },
    ...userTemplate,
});

corpOrgUserSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Nazwa jest wymagana"],
        maxlength: [32, "Nazwa jest za długa"],
    },
    ...userTemplate,
});

personUserSchema.plugin(uniqueValidator, {
    message: "Podany {PATH} jest zajęty",
});
personUserSchema.pre('findOneAndUpdate', function (next) {
    this.options.runValidators = true
    next()
})
corpOrgUserSchema.plugin(uniqueValidator, {
    message: "Podany {PATH} jest zajęty",
});
corpOrgUserSchema.pre('findOneAndUpdate', function (next) {
    this.options.runValidators = true
    next()
})

const PersonUserModel = mongoose.model("person", personUserSchema, "users");
const CorpOrgUserModel = mongoose.model(
    "corporation/organistation",
    corpOrgUserSchema,
    "users"
);

const user = {
    name: "Synthony",
    type: "corp/org",
    login: "233ddf",
    email: "g2asd@op.gg",
    password: "12444443333332222",
    repeatedPassword: "12444443333332222",
    phoneNumber: "124563890",
    adress: "Śrem",
};

const makeDocument = (futureUser, hashedPassword, callback)=>{
    let {password, phoneNumber, type, ...restOfFutureUser} = futureUser;
    switch (type) {
        case "person":
            newUser = new PersonUserModel({
                ...restOfFutureUser,
                type,
                password: hashedPassword? hashedPassword : password,
                phoneNumber: phoneNumber.replace(/ /g, ""),
            });
            break;
        case "corp/org":
            newUser = new CorpOrgUserModel({
                ...restOfFutureUser,
                type,
                password: hashedPassword? hashedPassword : password,
                phoneNumber: phoneNumber.replace(/ /g, ""),
            });
            break;
    }
    callback(newUser);
    
}
const checkPassword = (password, repeatedPassword) => {
    const messages = {};
    if (password) {
        if (password.length < 6)
            messages.password = "Hasło jest za krótkie";
        if (password.length > 18)
            messages.password = "Hasło jest za długie";
        if (password !== repeatedPassword)
            messages.passwords = "Hasła się nie zgadzają";
    } else messages.password = "Hasło jest wymagane";
    return messages;
}
const validateData = (newUser, messages, callback) => {
    newUser.validate((err) => {
        if (err) {
            for (let key in err.errors) {
                messages[key] = err.errors[key].properties.message;
            }
        }
        callback(messages);
    });

} 
module.exports = {
    createUser:(futureUser, callback) => {

        const {password, repeatedPassword} = futureUser;
        messages = checkPassword(password, repeatedPassword);
        if (Object.keys(messages).length === 0) {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) return console.log(err);
                makeDocument(futureUser, hash, newUserDocument =>{
                    validateData(newUserDocument, messages,(messages)=>{
                        if (Object.keys(messages).length === 0){
                            newUserDocument.save();
                            callback(messages, newUserDocument);
                        } else callback(messages, null);
                    });
                });
            });
        } else callback(messages, null);
        
    },
    models: [PersonUserModel, CorpOrgUserModel],
}

