const express = require("express");
const router = new express.Router();
const User = require("../models/user.js");
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth.js");
/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/",ensureLoggedIn, async (req, res, next) => {
    try {
        const results = await User.all(); 
        return res.json({results})
    } catch (e) {
        next(e)
    }
})

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username",ensureCorrectUser, async (req, res, next) => {
    try {
        const results = await User.get(req.params.username);
        return res.json({results})
    } catch (e) {
        next(e)
    }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to",ensureCorrectUser, async (req, res, next) => {
    try {
        const results = await User.messagesTo(req.params.username);
        return res.json({results})
    } catch (e) {
        next(e)
    }
})

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from",ensureCorrectUser, async (req, res, next) => {
    try {
        const results = await User.messagesFrom(req.params.username);
        return res.json({results})
    } catch (e) {
        next(e)
    }
})