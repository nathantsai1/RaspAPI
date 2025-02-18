require('dotenv').config();
const { neon } = require('@neondatabase/serverless');

const bcrypt = require('bcrypt');

// start db connection
const sql = neon(process.env.DATABASE_URL);
let is_user;

// check if the db is connected
async function check() {
  console.log(await sql`SELECT * FROM public.users`);
  return false;
}

// add a user to the db
async function add_user(user, password, question) {
  try {
    // returns true/false if user exists
    // console.log(`SELECT * FROM public.users WHERE user = "${user.toString()}"`)
    // return false;
    const result = await sql`SELECT * FROM public."users" WHERE "user" = ${user.toString()}`;

    if (result.length == 0) {
      // salt and hash pw
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);
      await sql`INSERT INTO public.users ("user", "question", "password") VALUES (${user.toString()}, ${question.toString()}, ${hashedPassword.toString()})`;
      return true;
    }
    return false;
  } catch (error) {
      console.log(error);
      return 1;
  }
}

// find the goals of a user
async function find_goals(user, password) {
  try {
    // returns 1 if user doesn't exist, 2 if password is wrong,  3/4 error
    is_user = await login(user, password);
    if (is_user === 1 || is_user === 2) {
      return is_user;
    } else if (is_user === -1) {
      return 3;
    }
    const result = await sql`SELECT * FROM public.goals where "user" = ${is_user.toString()}`;
    return result;
  } catch (error) {
      console.log(error);
      return 4;
  }
}

async function set_goal(user, password, goal) {
  try {
    // returns 1 if user doesn't exist, 2 if password is wrong,  3/4 error
    is_user = await login(user, password);
    if (is_user === 1 || is_user === 2) {
      return is_user;
    } else if (is_user === -1) {
      return 3;
    }
    const result = await sql`SELECT * FROM public.goals where "user" = ${is_user.toString()}`;
    if (result.length != 0) {
      await sql`UPDATE public.goals SET goal = ${parseInt(goal)} WHERE "user" = ${is_user.toString()}`;
    } else {
      await sql`INSERT INTO public.goals ("user", "goal") VALUES (${is_user.toString()}, ${parseInt(goal)})`;
    }
  } catch (error) {
    console.log(error);
    return -1;
  }
}

// upload a workout to the db
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
    await sql`INSERT INTO public.distances ("user", "date", "distance") VALUES (${is_user.toString()}, ${Date.now().toString()}, ${Number(distance)})`;
    return true;
  } catch (NeonDBError) {
    console.log(NeonDBError);
    return 4;
  }
}

// delete a user from the db
async function delete_info(user, password) {
  try {
    // returns 1 if user doesn't exist, 2 if password is wrong,  3/4 error
    is_user = await login(user, password);
    if (is_user === 1 || is_user === 2) {
      return is_user;
    } else if (is_user === -1) {
      return 3;
    }
    
    await sql`
      DELETE FROM public.users WHERE "user" = ${user.toString()}`;
    return true;

  } catch(err) {
    console.log(err);
    return 4;
  }
}

// get the workouts of today
async function get_today(user, password) {
  try {
    // returns 1 if user doesn't exist, 2 if password is wrong,  3/4 error
    is_user = await login(user, password);
    if (is_user === 1 || is_user === 2) {
      return is_user;
    } else if (is_user === -1) {
      return 3;
    }
    const result = await sql`SELECT * FROM public.distances WHERE "user" = ${is_user}`;
    return result;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

// change the pw of a user
async function change_password(user, password, new_password, question) {
  try {
    // returns 1 if user doesn't exist, 2 if password is wrong,  3/4 error
    is_user = await login(user, password);
    if (is_user === 1 || is_user === 2) {
      return is_user;
    } else if (is_user === -1) {
      return 3;
    }
    // salt and hash pw
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(new_password, salt);
    await sql`UPDATE public.users SET password = ${hashedPassword.toString()} WHERE "user" = ${user.toString()} AND "question" = ${question.toString()}`;
    return true;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

// change the username of a user
async function change_username(user, new_username, password, question) {
  try {
    // returns 1 if user doesn't exist, 2 if password is wrong,  3/4 error
    is_user = await login(user, password);
    if (is_user === 1 || is_user === 2) {
      return is_user;
    } else if (is_user === -1) {
      return 3;
    }
    await sql`UPDATE public.users SET "user" = ${new_username.toString()} WHERE "user" = ${user.toString()} AND "question" = ${question.toString()}`;
    return true;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function get_all(user, password) {
  try {
    // returns 1 if user doesn't exist, 2 if password is wrong,  3/4 error
    is_user = await login(user, password); 
    if (is_user === 1 || is_user === 2) {
      return is_user;
    } else if (is_user === -1) {
      return 3;
    }
    const result = await sql`SELECT * FROM public.distances WHERE "user" = ${is_user.toString()}`;
    return result;
  } catch (error) {
    console.log(error);
    return -1;
  }
}

async function login(user, password) {
  try {
    const result = await sql`SELECT * FROM public.users WHERE "user" = ${user.toString()} `;
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

module.exports = { set_goal, check, add_user, find_goals, upload_workout, delete_info, get_today, change_password, change_username, get_all }