const User = require('../users/users-model')
/*
  If the user does not have a session saved in the server

  status 401
  {
    "message": "You shall not pass!"
  }
*/
function restricted(req,res,next) {
  if (!req.session || !req.session.user) {
    res.status(401).json({ message: 'You shall not pass!' })
  } else {
    next();
  }
}

/*
  If the username in req.body already exists in the database

  status 422
  {
    "message": "Username taken"
  }
*/
function checkUsernameFree(req,res,next) {
const {username} = req.body
  
if(User.findBy({username})
  .first()){
res.status(422).json({message: "Username taken"})
  }else {
next()
  }
}


/*
  If the username in req.body does NOT exist in the database

  status 401
  {
    "message": "Invalid credentials"
  }
*/
function checkUsernameExists(req,res,next) {
  const {username} = req.body
  
  if(!User.findBy({username})
    .first()){
  res.status(401).json({message: "Invalid Credentials"})
    }else {
  next()
    }
}

/*
  If password is missing from req.body, or if it's 3 chars or shorter

  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
*/
function checkPasswordLength(req,res,next) {
  const password = req.body.password
if (!password || password.length <= 3){
  res.status(422).json({message: "Password must be longer than 3 chars"})
} else {
  next();
}
}

// Don't forget to add these to the `exports` object so they can be required in other modules
module.exports = {
  restricted,
  checkUsernameFree,
  checkUsernameExists,
  checkPasswordLength
}