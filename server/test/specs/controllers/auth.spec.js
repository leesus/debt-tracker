if (process.env.NODE_ENV !== 'test' ) {
  console.log('Setting NODE_ENV=test.');
  process.env.NODE_ENV = 'test';
}

var mocha = require('mocha');
var supertest = require('supertest');
var app = require('../../../index');
var should = require('should');
var sinon = require('sinon');

var passport = require('../../../config/passport');
var config = require('../../../config/secrets')[process.env.NODE_ENV];
var auth = require('../../../')
var User = require('../../../models/user');

describe('Auth controller', function() {

  before(function(done) {
    if (mongoose.connection.db) {
      return done();
    }

    mongoose.connect(config.db, done);    
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function(){
      mongoose.connection.close(done);
      process.env.NODE_ENV = 'development';
    });
  });

  beforeEach(function(done) {
    var _this = this;

    mongoose.connection.db.dropDatabase(function(err){
      if (err) return done(err);
      done();
    });
  });

  it('should have a login method', function() {
    auth.login.should.exist;
    (typeof auth.login).should.equal('function');
  });

  it('should have a signup method', function() {
    auth.signup.should.exist;
    (typeof auth.signup).should.equal('function');
  });

  it('should have a logout method', function() {
    auth.logout.should.exist;
    (typeof auth.logout).should.equal('function');
  });

  describe('when signing up a user', function() {
    //var agent = supertest.agent(app);
    //agent
    //  .post(...)
    //  .send(...)
    //  .expect(...)
    //  .end(...);
  });
});