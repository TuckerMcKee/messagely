/** User class for message.ly */
const { BCRYPT_WORK_FACTOR } = require("../config");
const bcrypt = require("bcrypt");
const db = require("../db");
const ExpressError = require("../expressError");

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    const hashedPw = await bcrypt.hash(password,BCRYPT_WORK_FACTOR);
    const result = await db.query(
      `INSERT INTO users (
            username,
            password,
            first_name,
            last_name,
            phone,
            join_at)
          VALUES ($1, $2, $3, $4, $5, current_timestamp)
          RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPw, first_name, last_name, phone]);
      return result.rows[0]
   }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) { 
    const result = await db.query(
      'SELECT password FROM users WHERE username=$1',
      [username]);
    if (result.rows.length === 0) {
      throw new ExpressError('invalid username',404)
      }
    const hashedPw = result.rows[0].password;
    const isValid = await bcrypt.compare(password,hashedPw);
    return isValid 
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    const result = await db.query(
      'UPDATE users SET last_login_at=current_timestamp WHERE username=$1',
    [username]);
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const result = await db.query(
      'SELECT username, first_name, last_name, phone FROM users'
    );
    return result.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const result = await db.query(
      'SELECT username, first_name, last_name, phone, join_at, last_login_at FROM users WHERE username=$1',
    [username]);
    if (result.rows.length === 0) {
      throw new ExpressError('username not found',404)
    }
    return result.rows[0]
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) { 
    //this query was written with assistance from ChatGPT
    const result = await db.query(
      `SELECT 
      m.id,
      json_build_object(
          'username', u_to.username,
          'first_name', u_to.first_name,
          'last_name', u_to.last_name,
          'phone', u_to.phone
      ) AS to_user,
      m.body,
      m.sent_at,
      m.read_at
      FROM messages m
      JOIN users u_to ON m.to_username = u_to.username
      WHERE m.from_username = $1`,
      [username]);
    if (result.rows.length === 0) {
      throw new ExpressError('messages not found',404)
    }
    return result.rows
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const result = await db.query(
      `SELECT 
      m.id,
      json_build_object(
          'username', u_from.username,
          'first_name', u_from.first_name,
          'last_name', u_from.last_name,
          'phone', u_from.phone
      ) AS from_user,
      m.body,
      m.sent_at,
      m.read_at
      FROM messages m
      JOIN users u_from ON m.from_username = u_from.username
      WHERE m.to_username = $1`,
      [username]);
    if (result.rows.length === 0) {
      throw new ExpressError('messages not found',404)
    }
    return result.rows
   }
}


module.exports = User;