const express = require("express");
const router = new express.Router();
const Message = require("../models/message.js");
const ExpressError = require("../expressError");
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth.js");
/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id",ensureLoggedIn, async (req, res, next) => {
    try {
        const results = await Message.get(id);
        const fUser = results.rows[0].from_user.username;
        const tUser = results.rows[0].to_user.username;
        const user = req.user.username;
        if (user !== fUser && user !== tUser) {
            throw new ExpressError("Permission denied",400);
        }
        else {
            return res.json({message:results.rows[0]})
        }
    } catch (e) {
        next(e)
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/",ensureLoggedIn, async (req, res, next) => {
    try {
        const fUser = req.user.username;
        const tUser = req.body.to_username;
        const body = req.body.body;
        const results = await Message.create({fUser,tUser,body});
        return res.json({message:results.rows[0]})
    } catch (e) {
        next(e)
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read",ensureLoggedIn, async (req, res, next) => {
    try {
        const results = await Message.get(req.params.id);
        const user = req.user.username;
        if (user ==! results.rows[0].to_user.username) {
            throw new ExpressError("Permission denied",400);
        }
        const markRead = await Message.markRead(req.params.id);
        return res.json({message:markRead.rows[0]})
    } catch (e) {
        next(e)
    }
})
