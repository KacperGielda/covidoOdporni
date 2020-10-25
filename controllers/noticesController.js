const noticesCreator = require("../creators/noticesCreator.js");
const usersController = require("./usersController.js");
const mongoose = require("mongoose");

const filterNotice = (notice) => {
    if (!notice) return;
    const { __v, ...filteredNotice } = notice._doc;
    return filteredNotice;
};
const makeFilters = (filters) => {
    validFilters = {};
    for (key in filters) {
        if (filters[key] === "" || filters[key] === "all") continue;
        if (key === "search") {
            validFilters.title = { $regex: new RegExp(filters[key].trim(), "i") };
        } else if (key === "localization") {
            validFilters.adress = { $regex: new RegExp(filters[key].trim(), "i") };
        } else {
            validFilters[key] = filters[key];
        }
    }
    console.log(validFilters);
    return validFilters;
};
const getNotice = (id, callback) => {
    const model = noticesCreator.model;
    model.findById(id, (err, notice) => {
        if (err) return console.log(err);
        callback(filterNotice(notice));
    });
};

const updateNotice = (id, updatedData, callback) => {
    const model = noticesCreator.model;
    model.updateOne({ _id: id }, { $set: updatedData }, { context: "query" }, (err) => {
        messages = {};
        if (err) {
            console.log(err);
            for (let key in err.errors) {
                messages[key] = err.errors[key].properties.message;
            }
        }
        callback(messages);
    });
};

module.exports = {
    createNotice: (noticeDat, callback) => {
        noticesCreator.createNotice(noticeData, (msg, noticeId) => {
            if (Object.keys(msg).length === 0) {
                usersController.assignNotice(noticeId, noticeData.authorID);
            }
            callback(msg);
        });
    },
    getNotice,
    getNotices: (page, userId, userFilters, callback) => {
        const model = noticesCreator.model;
        const noticesFound = {};

        filters = makeFilters(userFilters);

        model.find({ authorID: userId }, null, { limit: 10 }, (err, userNotices) => {
            noticesFound.user = userNotices;
            model.find(
                { isSuspended: false, authorID: { $ne: userId }, ...filters },
                null,
                { skip: (page - 1) * 10, limit: 10 },
                (err, notices) => {
                    if (err) console.log(err);
                    noticesFound.notUser = notices;
                    callback(noticesFound);
                }
            );
        });
    },
    getPages: (filters, callback) => {
        const model = noticesCreator.model;
        console.log(filters);
        model.countDocuments({}, (err, counter) => {
            callback(Math.ceil(counter / 10));
        });
    },
    susspend: (id, callback) => {
        let susspend;
        getNotice(id, (notice) => {
            if (notice) {
                if (notice.isSuspended) susspend = false;
                else susspend = true;
                updateNotice(id, { isSuspended: susspend }, (msg) => {
                    if (Object.keys(msg).length === 0) {
                        callback({ success: true });
                    } else callback({ success: false });
                });
            } else callback({ success: false });
        });
    },
    updateNotice,
    delete: (id, callback) => {
        const model = noticesCreator.model;
        model.findByIdAndDelete(id, (err, res) => {
            if (res) {
                callback(true);
            } else callback(false);
        });
    },
};
