const noticesCreator = require("../creators/noticesCreator");
const usersController = require("./usersController");
const mongoose = require("mongoose");

const filterNotice = (notice) => {
    const { _id, __v, locationChoice, ...filteredNotice } = notice._doc;
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

module.exports = {
    createNotice: (noticeDat, callback) => {
        noticesCreator.createNotice(noticeData, (msg, noticeId) => {
            if (Object.keys(msg).length === 0) {
                usersController.assignNotice(noticeId, noticeData.authorID);
            }
            callback(msg);
        });
    },
    getNotice: (id, callback) => {
        const model = noticesCreator.model;
        model.findById(id, (err, notice) => {
            if (err) return console.log(err);
            callback(filterNotice(notice));
        });
    },
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
};
