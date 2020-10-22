const express = require("express");
const usersController = require("../controllers/UsersController");
const router = express.Router();

router.all('/register', (req, res, next) =>{
    if (req.session.user) res.redirect(403,'/Page/home');
    next();
});

router.post("/register", (req, res) => {
    usersController.createUser(req.body, (newUserID, msg) => {
        if (Object.keys(msg).length === 0) {
            req.session.user = newUserID;
            res.redirect(301, "index");
        } else {;
            res.json(msg);
        }
    });
});

router.all('/login', (req, res, next) =>{
    if (req.session.user) res.redirect(403,'/Page/home');
    next();
});

router.post("/login", (req, res) => {
    usersController.logIn(req.body, (userID)=>{
        if (userID) {
            req.session.user = userID;
            res.redirect(301, "/Page/home");
        }
        else{
            res.json({message: "Nieprawidłowe dane logowania"})
        }
    });
});

router.get("/getUser", (req, res) => {
    const id = req.session.user;
    if(id){
        currentUser = usersController.getUser(id, (user)=>{
            res.json(user);
        });
    }else {
        res.json(null);
    }
});


router.get("/logout", (req, res)=>{
    if (req.session.user){
        req.session.user=null;
        res.redirect("/Page/home");
    }
});

router.put("/updateUser", (req, res)=>{
    const id = req.session.user;
    if (id){
        user = usersController.getUser(id, user=>{ 
            const updatedData = {};
            for (const key in req.body){
                if(user[key] != req.body[key]){
                    updatedData[key] = req.body[key];
                };
            }
            usersController.updateUser(id, updatedData, user, (msg)=>{
                if (Object.keys(msg).length === 0) {
                    res.redirect(301, "/Page/account");
                } else {;
                    res.json(msg);
                }
            });
        })
    }
})


module.exports= router;