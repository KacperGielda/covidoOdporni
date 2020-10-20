const express = require("express");
const usersController = require("../controllers/UsersController");
const noticesController = require("../controllers/noticesController");
const router = express.Router();

router.post("/search", (req, res) => {
    let { page } = req.query;
    if (!page || page < 1) page = 1;
    currUserId = req.session.user;
    filters = req.body;
    noticesController.getNotices(page, currUserId, filters, (notices) => res.json(notices));
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
            noticesController.createNotice(noticeData, (msg) => {
                if (Object.keys(msg).length === 0) {
                    res.redirect(301, "/profile");
                } else res.json(msg);
            });
        });
    }
});

router.get("/getFromId", (req, res) => {
    const { noticeId } = req.query;
    noticesController.getNotice(noticeId, (notice) => res.json(notice));
});

module.exports = router;
