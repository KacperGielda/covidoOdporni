const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const path = require("path");

const config = require("./config");

const app = express();

mongoose.set("useCreateIndex", true);
db = mongoose
    .connect(config.database, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("Database connected"))
    .catch((err) => console.log(err));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    cookieSession({
        name: config.sessionName,
        secret: config.sessionSecret,
        maxAge: config.sessionMaxAge,
    })
);

app.use("/", require(path.join(__dirname, "routes", "index")));
app.use("/", require(path.join(__dirname, "routes", "users")));
app.use("/notices", require(path.join(__dirname, "routes", "notices")));

app.use(
    express.static(path.join(__dirname, "public"), {
        extensions: ["html"],
    })
);

// app.use("/login", require(path.join(__dirname, "routes", "login")));
// app.use("/register", require(path.join(__dirname, "routes", "register")));
// app.use("/getUser", require(path.join(__dirname, "routes", "getUser")));

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
