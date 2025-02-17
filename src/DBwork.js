require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const bcrypt = require('bcrypt');

// start db connection
const sql = neon(process.env.DATABASE_URL);
let is_user;

async function add_user(user, password, question) {
  try {
    // returns true/false if user exists
    const result = await sql`SELECT * FROM public.users 
      WHERE user = ${user.toString()}`;

    if (result.length == 0) {
      // salt and hash pw
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      await sql`INSERT INTO public.users (user, question, password) VALUES (${user.toString()}, ${hashedPassword.toString()}, ${question.toString()})`;
      return true;
    }

    return false;
  } catch (error) {
      console.log(error);
      return 1;
  }
}

async function find_goals(user, password) {
  try {
    // returns 1 if user doesn't exist, 2 if password is wrong,  3/4 error
    is_user = await login(user, password);
    if (is_user === 1) {
      return 1;
    } else if (is_user === 2) {
      return 2;
    } else if (is_user === -1) {
      return 3;
    }
    const result = await sql`SELECT * FROM public.goals where user = ${is_user.toString()}`;
    return result;
  } catch (error) {
      console.log(error);
      return 4;
  }
}

async function upload_workout(user, password, distance) {
  try {
    // returns 1 if user doesn't exist, 2 if password is wrong,  3/4 error
    is_user = await login(user, password);
    // is the user real?
    if (is_user === 1) {
      return 1;
    } else if (is_user === 2) {
      return 2;
    } else if (is_user === -1) {
      return 3;
    }

    await sql`INSERT INTO public.distances (user, date, distance) VALUES (${is_user.toString()}, ${Date.now().toString()}, ${distance})`;
    return result;
  } catch (NeonDBError) {

    console.log('Error:', NeonDBError);
    return 4;
  }
}

async function delete_info(user, password) {
  try {
    // returns 1 if user doesn't exist, 2 if password is wrong,  3/4 error
    is_user = await login(user, password);
    if (is_user === 1) {
      return 1;
    } else if (is_user === 2) {
      return 2;
    } else if (is_user === -1) {
      return 3;
    }
    const result = await sql`
      DELETE FROM public.users WHERE user = ${user.toString()} && password = ${hashedPassword.toString()}`;
    return true;

  } catch(err) {
    console.log(err);
    return 4;
  }
}

async function login(user, password) {
  try {
    const result = await sql`SELECT * FROM public.users WHERE user = ${user.toString()} `;
    if (result.length === 0) {
      // no user named 'user'
      return 1;
    }
    const validPassword = await bcrypt.compare(password, result[0].password);
    if (!validPassword) {
      // incorrect password
      return 2;
    }
    // is true user
    return result[0].id;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

module.exports = { add_user, find_goals, upload_workout, delete_info }