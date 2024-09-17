const router = require('express').Router();
const User = require('../users/users-model');
const bcrypt = require('bcryptjs')
const {checkUsernameFree, checkUsernameExists, checkPasswordLength} = require('./auth-middleware')
// Require `checkUsernameFree`, `checkUsernameExists` and `checkPasswordLength`
// middleware functions from `auth-middleware.js`. You will need them here!

router.post('/register',checkUsernameFree,checkUsernameExists,checkPasswordLength,(req,res,next)=>{
const {username, password}= req.body;

const passwordHash = bcrypt.hashSync(password, 8)

User
.add({username, password: passwordHash})
.then((user)=> res.status(200).json(user))
.catch(err=>{
  console.log(err)
  //this is passing the test but not for the right reason. My checkUsernameFree middleware is not working right
  next(err)
});
})



/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "user_id": 2,
    "username": "sue"
  }

  response on username taken:
  status 422
  {
    "message": "Username taken"
  }

  response on password three chars or less:
  status 422
  {
    "message": "Password must be longer than 3 chars"
  }
 */
  router.post('/login',checkUsernameExists, (req, res, next) => {
    const { username, password } = req.body;
  
    User
      .findBy({ username })
      .first()
      .then(user => {
 
        if (user && bcrypt.compareSync(password, user.password)) {
     

          req.session.user = user;
  
          res.json({ message: `welcome ${user.username}`});
        } else {
     
          res.status(401).json({ message: 'Invalid Credentials' });
        }
      })
      .catch(next);
  });
  

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status 200
  {
    "message": "Welcome sue!"
  }

  response on invalid credentials:
  status 401
  {
    "message": "Invalid credentials"
  }
 */

router.get('/logout', (req,res)=>{
  if (req.session&& req.session.user) {
      req.session.destroy(err=>{
        if(err){
          res.json({
            message: err
          })
        } else{
          res.status(200).json({
            message: "logged out"
          })
        } 
      })
    }else {
          res.status(200).json({
            message: "no session"
          })
        }
      });
    

/**
  3 [GET] /api/auth/logout

  response for logged-in users:
  status 200
  {
    "message": "logged out"
  }

  response for not-logged-in users:
  status 200
  {
    "message": "no session"
  }
 */



  router.use((err, req, res, next) => {
    res.status(err.status || 500).json({
      message: err.message,
      stack: err.stack,
      customMessage: 'Something went wrong inside the auth router'
    });
  });
 
// Don't forget to add the router to the `exports` object so it can be required in other modules
module.exports = router