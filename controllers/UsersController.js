const usersCreator = require("../creators/usersCreator");
const bcrypt = require("bcrypt");
const emailValidator = require("email-validator");
const mongoose = require("mongoose");

const getUsersCollection = () => (UsersCollection = mongoose.connection.db.collection("users"));
module.exports = {
    createUser: (userObject, callback) =>
        usersCreator.createUser(userObject, (msg, user) => {
            callback(user ? user._id : null, msg);
        }),
    logIn: (UserInput, callback) => {
        const UsersCollection = getUsersCollection();
        const { loginOrEmail, password } = UserInput;

        const AfterUserFound = (password, user, callback) => {
            if (user) {
                bcrypt.compare(password, user.password, (err, isCorrect) => {
                    if (isCorrect) callback(user._id);
                    else callback(null);
                });
            } else callback(null);
        };

        if (emailValidator.validate(loginOrEmail)) {
            UsersCollection.findOne({ email: loginOrEmail }, (err, user) => {
                if (err) console.log(err);
                AfterUserFound(password, user, callback);
            });
        } else {
            UsersCollection.findOne({ login: loginOrEmail }, (err, user) => {
                if (err) console.log(err);
                AfterUserFound(password, user, callback);
            });
        }
    },
    getUser: (id, callback) => {
        const UsersCollection = getUsersCollection();
        UsersCollection.findOne({ _id: mongoose.Types.ObjectId(id) }, (err, user) => {
            if (err) console.log(err);
            if (user) {
                const { _id, password, __v, ...filteredUser } = user;
                callback(filteredUser);
            }
        });
    },
    updateUser: (id, updatedUserData, currentUserData, callback) => {
        const models = usersCreator.models; // szukanie poprzez kolekcje pomija validacje pomimo {runValidators: true},
        let modelIndex;
        switch (currentUserData.type) {
            case "person":
                modelIndex = 0;
                break;
            case "corp/org":
                modelIndex = 1;
                break;
        }
        models[modelIndex].findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(id) },
            { $set: updatedUserData },
            { context: "query" },
            (err) => {
                messages = {};
                if (err) {
                    for (let key in err.errors) {
                        messages[key] = err.errors[key].properties.message;
                    }
                }
                callback(messages);
            }
        );
    },
    assignNotice: (noticeId, userId) => {
        UsersCollection.findOneAndUpdate({ _id: mongoose.Types.ObjectId(userId) }, { $push: { notices: noticeId } }, (err, user) => {
            if (err) console.log(err);
        });
    },
};
