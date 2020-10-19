const noticesCreator = require("../creators/noticesCreator");
const usersController = require("./usersController");
const mongoose = require("mongoose");
const { model } = require("../creators/noticesCreator");

const filterNotice = (notice) => {
    const { _id, __v, locationChoice, ...filteredNotice } = notice._doc;
    return filteredNotice;
};
const makeFilters = (filters) => {
    validFilters = {};
    if (!filters.helps) filters.helps = ["other"];
    for (key in filters) {
        if (filters[key] === "" || filters[key] === "all") continue;
        if (key === "search" || key === "localization") {
            validFilters[key] = new RegExp(filters[key]);
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
