'use strict';

var mocha = require('mocha');
var supertest = require('supertest');
var app = require('../../../index');
var should = require('should');
var sinon = require('sinon');
var utils = require('../../utils');

var mongoose = require('mongoose');
var passport = require('../../../config/passport');
var auth = require('../../../controllers/auth')
var User = require('../../../models/user');

describe('Auth controller', function() {

  var agent = supertest.agent(app);

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

    it('should return a 403 response with an object containing success, message and errors properties when email or password are invalid', function(done) {
      agent
        .post('/api/auth/signup')
        .send({ email: 'blah', password: '123' })
        .expect(403)
        .expect(function(res) {
          res.body.success.should.be.false;
          res.body.message.should.equal('Signup failed.');
          res.body.errors[0].msg.should.equal('Email is not valid.');
          res.body.errors[1].msg.should.equal('Password must be at least 6 characters long.');
        })
        .end(done);
    });

    it('should authenticate with passport local strategy');

    it('should return a 409 response with an object containing success and message properties if passport authentication fails');

    it('should call req.logIn and log in the user if created successfully');

    it('should set a \'user\' cookie');

    it('should send a 201 response with an object containing success, message and data properties');
  });

  describe('when logging in a user', function() {
    /*agent
      .post(...)
      .send(...)
      .expect(...)
      .end(...);*/

    it('should return a 401 response with an object containing success, message and errors properties when email or password are invalid');

    it('should authenticate with passport local strategy');

    it('should return a 401 response with an object containing success and message properties if passport authentication fails');

    it('should call req.logIn and log in the user if created successfully');

    it('should set a \'user\' cookie');

    it('should send a 201 response with an object containing success, message and data properties');
  });

  describe('when logging out a user', function() {
    /*agent
      .post(...)
      .send(...)
      .expect(...)
      .end(...);*/

    it('should call req.logout');

    it('should send a 200 response with an object containing success and message properties');
  });
});