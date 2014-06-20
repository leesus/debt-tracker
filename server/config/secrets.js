module.exports = {
  db: process.env.MONGODB || 'mongodb://localhost:27017/test',

  sessionSecret: process.env.SESSION_SECRET || '[[ session secret ]]',

  facebook: {
    clientID: process.env.FACEBOOK_ID || '[[ facebook id ]]',
    clientSecret: process.env.FACEBOOK_SECRET || '[[ facebook secret ]]',
    callbackURL: '/auth/facebook/callback',
    passReqToCallback: true
  }
};