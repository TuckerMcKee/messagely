const express = require("express");
const router = new express.Router();
const jwt = require("jsonwebtoken");
const ExpressError = require("../expressError.js");
const User = require("../models/user.js");
const {SECRET_KEY} = require("../config.js");
/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async (req, res, next) => {
    try {
        const {username, password} = req.body;
        if (!username || !password) {
            throw new ExpressError("username and password required", 400);
        }
        if (await User.authenticate(username,password)) {
            const token = jwt.sign({username}, SECRET_KEY);
            await User.updateLoginTimestamp();
            return res.json({token})
        }
        else {
            throw new ExpressError("invalid username and/or password", 400);
        }
    } catch (e) {
        next(e);
    }
})

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async (req, res, next) => {
    try {
        const {username, password, first_name, last_name, phone} = req.body;
        if (!username || !password) {
            throw new ExpressError("username and password required", 400);
        }
        await User.register({username,password, first_name, last_name, phone});
        const token = jwt.sign({username}, SECRET_KEY);
        return res.json({token})
    } catch (e) {
        if (e.code === '23505') {
            return next(new ExpressError("username taken", 400))
        }
        next(e);
    }
})

module.exports = router;
