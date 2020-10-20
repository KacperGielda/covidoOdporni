const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const validateType = (type) => {
    if (type === "giveHelp" || type === "needHelp") return true;
    else return false;
};

const validatePrice = (price) => {
    if (price === "coverCost" || price === "free" || price === "negotiated") return true;
    else return false;
};

const validateLocationChoice = (choice) => {
    if (choice === "remote" || choice === "userAdress" || choice === "newAdress") return true;
    else return false;
};

const noticeSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        validate: [
            {
                validator: (type) => validateType(type),
                message: "Nieprawiłowy typ",
            },
        ],
    },
    title: {
        type: String,
        required: [true, "Tytuł jest wymagany"],
        minlength: [6, "Tytuł jest za krótki"],
        maxlength: [32, "Tytuł jest za długi"],
    },
    content: {
        type: String,
        required: [true, "Ogłoszenie nie ma treści"],
        minlength: [23, "Opis jest za krótki"],
        maxlength: [501, "Opis jest za długi"],
    },
    helps: {
        type: Array,
        required: [true, "Wybór typów pomocy jest wymagany"],
    },
    price: {
        type: String,
        required: true,
        validate: [
            {
                validator: (price) => validatePrice(price),
                message: "Nieprawiłowy typ",
            },
        ],
    },
    locationChoice: {
        type: String,
        required: true,
        validate: [
            {
                validator: (choice) => validateLocationChoice(choice),
                message: "Nieprawiłowy wybór lokalizacji",
            },
        ],
    },
    remote: {
        type: Boolean,
        required: true,
    },
    authorID: {
        type: mongoose.ObjectId,
        required: true,
    },
    adress: {
        type: String,
    },
    creationDate: {
        type: Date,
        default: Date.now,
    },
    isSuspended: {
        type: Boolean,
        default: false,
    },
});

noticeSchema.pre("updateOne", function (next) {
    this.options.runValidators = true;
    next();
});

noticeSchema.plugin(uniqueValidator, {
    message: "Podany {PATH} jest zajęty",
});
const noticeModel = mongoose.model("notice", noticeSchema);

const validateData = (newNotice, callback) => {
    const messages = {};
    newNotice.validate((err) => {
        if (err) {
            for (let key in err.errors) {
                messages[key] = err.errors[key].properties.message;
            }
        }
        callback(messages);
    });
};

module.exports = {
    createNotice: (noticeData, callback) => {
        newNoticeDocument = new noticeModel(noticeData);
        validateData(newNoticeDocument, (messages) => {
            if (Object.keys(messages).length === 0) {
                newNoticeDocument.save();
                callback(messages, newNoticeDocument._id);
            } else callback(messages, null);
        });
    },
    model: noticeModel,
};
