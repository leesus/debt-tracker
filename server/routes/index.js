var router = require('express').Router();

// Controllers
var controllers = {
  account: require('../controllers/account')
};

// Routes
router
  .post('/account/login', controllers.account.login)
  .post('/account/signup', controllers.account.signup)
  .get('/account/logout', controllers.account.logout);



// Export routes
module.exports = router;