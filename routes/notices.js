const path = require("path");
const express = require("express");
const usersController = require(path.join(__dirname, "..", "controllers", "usersController"));
const noticesController = require(path.join(__dirname, "..", "controllers", "noticesController"));
const router = express.Router();

const belongsToUser = (userId, noticeId, callback) => {
    let belongs = false;
    if (!userId || !noticeId) callback(false);
    usersController.getUser(userId, (user) => {
        user.notices.forEach((element) => {
            if (element == noticeId) belongs = true;
        });
        callback(belongs);
    });
};

router.post("/search", (req, res) => {
    let { page } = req.query;
    const filters = req.body;
    const currUserId = req.session.user;
    noticesController.getPages(filters, (maxPages) => {
        if (!page || page < 1) page = 1;
        if (page > maxPages) page = maxPages;
        noticesController.getNotices(page, currUserId, filters, (notices) => res.json({ notices, maxPages, page: parseInt(page) }));
    });
});

router.post("/add", (req, res) => {
    if (req.session.user) {
        noticeData = req.body;
        usersController.getUser(req.session.user, (user) => {
            noticeData.remote = false;
            noticeData.authorID = req.session.user;
            switch (noticeData.locationChoice) {
                case "remote":
                    noticeData.remote = true;
                    noticeData.adress = null;
                    break;
                case "userAdress":
                    noticeData.adress = user.adress;
                    break;
            }
            if (!noticeData.helps) {
                noticeData.helps = ["other"];
            }
            noticesController.createNotice(noticeData, (msg) => {
                if (Object.keys(msg).length === 0) {
                    res.redirect(301, "/profile");
                } else res.json(msg);
            });
        });
    }
});

router.get("/getById", (req, res) => {
    const { noticeId } = req.query;
    noticesController.getNotice(noticeId, (notice) => (notice ? res.json(notice) : res.json(null)));
});

router.put("/suspendById", (req, res) => {
    const { noticeId } = req.query;
    belongsToUser(req.session.user, noticeId, (belongs) => {
        if (req.session.user && belongs) {
            noticesController.susspend(noticeId, (msg) => {
                res.json(msg);
            });
        } else res.redirect(403, "/index");
    });
});

router.put("/update", (req, res) => {
    const { id } = req.query;
    belongsToUser(req.session.user, id, (belongs) => {
        if (req.session.user && belongs) {
            noticesController.updateNotice(id, req.body, (msg) => {
                if (Object.keys(msg).length > 0) res.json(msg);
                else res.redirect(301, "/profile");
            });
        } else res.redirect(403, "/index");
    });
});

router.delete("/delete", (req, res) => {
    const { noticeId } = req.query;
    belongsToUser(req.session.user, noticeId, (belongs) => {
        if (req.session.user && belongs) {
            noticesController.delete(noticeId, (success) => {
                if (success) {
                    usersController.removeNotice(noticeId, req.session.user);
                }
                res.json({ success });
            });
        } else res.redirect(403, "/index");
    });
});
module.exports = router;
