const { add_user, find_goals, upload_workout, delete_info } = require('./DBwork.js');

let status;
// helps wth fitness tracker

// 1 - how much did person run?
async function upload_workout(user, password, distance) {
  try {
    // returns 1 if user doesn't exist, 2 if password is wrong,  3/4 error
    status = upload_workout();
    if (status === 1) {
      return 1;
    } else if (status === 2) {
      return 2;
    } else if (status === -1) {
      return 3;
    }

  } catch (e) {
    console.log('error', e);
    return false;
  }
}