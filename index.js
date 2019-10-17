const express = require("express");
const app = express();
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const bcrypt = require("bcryptjs");

const { insertData, getData } = require("./database");
var hbs = require("hbs");

hbs.registerHelper("ifCond", function(v1, v2, options) {
    if (v1 >= v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});

app.set("view engine", "hbs");

app.use("/public", express.static(__dirname + "/public"));

app.use(express.urlencoded({ extended: true }));

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        async (email, password, done) => {
            console.log(`${email} - ${password}`);
            data = [];
            try {
                const user = await getData(email);
                console.log(user[0].password);
                const result = await bcrypt.compare(password, user[0].password);
                console.log(result);
                if (result) {
                    data.push(user[0]);
                    done(null, user);
                } else {
                    done(null, false);
                }
            } catch (e) {
                console.error(e);
                done(null, false);
            }
        }
    )
);

app.use(
    session({
        secret: "nobody can guess",
        saveUninitialized: true,
        resave: false,
        cookie: { secure: false }
    })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    return done(null, user);
});

passport.deserializeUser((user, done) => {
    return done(null, user);
});

let data = [];

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/form", (req, res) => {
    res.render("form");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/form1", (req, res) => {
    res.render("form1");
});

app.get("/portfolio", (req, res) => {
    res.render("portfolio", { data });
});

app.post("/form", (req, res) => {
    data = [];
    data.push({
        retired: req.body.exampleRadios,
        age: req.body.age1,
        salary: (req.body.salary * req.body.percentage) / 100,
        salary1: (req.body.salary * req.body.percentage) / 100 - 150000,
        salary2: (req.body.salary * req.body.percentage) / 100 - 200000,
        salary3: ((req.body.salary * req.body.percentage) / 100 - 255000) / 10,
        salary4:
            2 * (((req.body.salary * req.body.percentage) / 100 - 255000) / 10),
        salary5:
            3 * (((req.body.salary * req.body.percentage) / 100 - 255000) / 10),
        salary6:
            4 * (((req.body.salary * req.body.percentage) / 100 - 255000) / 10),
        salary7:
            5 * (((req.body.salary * req.body.percentage) / 100 - 255000) / 10),
        salary8:
            7 * (((req.body.salary * req.body.percentage) / 100 - 255000) / 10),
        salary9: ((req.body.salary * req.body.percentage) / 100 - 255000) / 20,
        percentage: req.body.percentage,
        check1: req.body.check1,
        check2: req.body.check2,
        check3: req.body.check3,
        check4: req.body.check4,
        check5: req.body.check5,
        check6: req.body.check6,
        check7: req.body.check7,
        loggedIn: false
    });
    res.redirect("/portfolio");
});

app.get("/api/data", (req, res) => {
    res.json({ data: data });
});

app.post("/signup", async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    data[0].first_name = first_name;
    data[0].last_name = last_name;
    data[0].email = email;
    data[0].password = password;
    data[0].loggedIn = true;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    data[0].password = hashPassword;
    insertData(data[0]).then(result => {
        console.log(result);
        res.redirect("/portfolio");
    });
});

app.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/portfolio",
        failureRedirect: "/signup"
    })
);
const PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
    console.log("Listening on PORT");
});
