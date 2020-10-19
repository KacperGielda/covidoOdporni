const noticesCreator = require("../creators/noticesCreator");
const usersController = require("./usersController");
const mongoose = require("mongoose");
const { model } = require("../creators/noticesCreator");

const filterNotice = (notice) => {
    const { _id, __v, locationChoice, ...filteredNotice } = notice._doc;
    return filteredNotice;
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
    getNotices: (page, userId, callback) => {
        const model = noticesCreator.model;
        model.find({ isSuspended: false, authorID: { $ne: userId } }, null, { skip: (page - 1) * 10, limit: 10 }, (err, notices) => {
            if (err) console.log(err);
            callback(notices);
        });
    },
};
