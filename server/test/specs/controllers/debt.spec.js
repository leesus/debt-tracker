'use strict';

var mocha = require('mocha');
var supertest = require('supertest');
var app = require('../../../index');
var should = require('should');
var sinon = require('sinon');
var utils = require('../../utils');
var http = require('http');
var ObjectId = require('mongoose').Types.ObjectId;

var debtController = require('../../../controllers/debt');
var User = require('../../../models/user');
var Debt = require('../../../models/debt');

var agent = supertest.agent(app);

describe('Debt controller', function() {

  it('should have an addDebt method', function() {
    debtController.addDebt.should.exist;
    (typeof debtController.addDebt).should.equal('function');
  });

  it('should have a getDebtsOwedByUser method', function() {
    debtController.getDebtsOwedByUser.should.exist;
    (typeof debtController.getDebtsOwedByUser).should.equal('function');
  });

  it('should have a getDebtsOwedToUser method', function() {
    debtController.getDebtsOwedToUser.should.exist;
    (typeof debtController.getDebtsOwedToUser).should.equal('function');
  });

  it('should have a getDebt method', function() {
    debtController.getDebt.should.exist;
    (typeof debtController.getDebt).should.equal('function');
  });

  it('should have an updateDebt method', function() {
    debtController.updateDebt.should.exist;
    (typeof debtController.updateDebt).should.equal('function');
  });

  it('should have a removeDebt method', function() {
    debtController.removeDebt.should.exist;
    (typeof debtController.removeDebt).should.equal('function');
  });

  describe('when creating a debt', function() {

    beforeEach(function(done) {
      this.user = new User({ email: ['user@test.com'], password: '123456' });
      this.user.save(function(err) {
        if (err) done(err);
        agent
          .post('/api/auth/login')
          .send({ email: 'user@test.com', password: '123456' })
          .end(function(err){
            process.nextTick(done);
          });
      });

    });

    xit('should return a 403 response with an object containing success, message and errors properties when email or password are invalid', function(done) {
      agent
        .post('/api/debtController/signup')
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

    xit('should return a 409 response with an object containing success and message properties if passport authentication fails', function(done) {
      var user = new User({ email: ['alreadysignedup@test.com'], password: '123456' });
      user.save(function() {
        agent.post('/api/auth/signup')
          .send({ email: 'alreadysignedup@test.com', password: 'blahblah' })
          .expect(409)
          .expect(function(res) {
            res.body.success.should.be.false;
            res.body.message.should.equal('That email address is taken.');
          })
          .end(done);
      });
    });

    it('should send a 201 response with an object containing success, message and data properties', function(done) {
      var _this = this;
      var date = Date.now();
      var debtorId = new ObjectId();

      agent
        .post('/api/debts')
        .send({ debtor: debtorId, date: date, reference: 'Test bill', amount: 42.56 })
        .expect(201)
        .expect(function(res) {
          res.body.success.should.be.true;
          res.body.message.should.equal('Debt created successfully.');
          res.body.data.should.be.ok;
          
          String(res.body.data.creditor).should.equal(String(_this.user._id));
          String(res.body.data.debtor).should.equal(String(debtorId));
          (new Date(res.body.data.date).getTime()).should.equal(date);
          res.body.data.reference.should.equal('Test bill');
          res.body.data.amount.should.equal(42.56);
        })
        .end(done);
    });
  });

  xdescribe('when logging in a user', function() {
    beforeEach(function(done) {
      var user = new User({ email: ['alreadysignedup@test.com'], password: '123456' });
      user.save(done);
    });

    it('should return a 401 response with an object containing success, message and errors properties when email or password are invalid', function(done) {
      agent
        .post('/api/auth/login')
        .send({ email: 'blah' })
        .expect(401)
        .expect(function(res) {
          res.body.success.should.be.false;
          res.body.message.should.equal('Login failed.');
          res.body.errors[0].msg.should.equal('Email is not valid.');
          res.body.errors[1].msg.should.equal('Password cannot be blank.');
        })
        .end(done);
    });

    it('should authenticate with passport local strategy', function(done) {
      var passportSpy = sinon.spy(passport, 'authenticate');

      agent.post('/api/auth/login')
        .send({ email: 'alreadysignedup@test.com', password: '123456' })
        .end(function(){
          passportSpy.called.should.be.true;
          passportSpy.restore();
          done();
        });
    });

    it('should return a 401 response with an object containing success and message properties if passport authentication fails', function(done) {
      agent.post('/api/auth/login')
        .send({ email: 'notalreadysignedup@test.com', password: 'blahblah' })
        .expect(401)
        .expect(function(res) {
          res.body.success.should.be.false;
          res.body.message.should.equal('No user found.');
        })
        .end(done);
    });

    it('should call req.logIn and log in the user if created successfully', function(done) {
      var reqSpy = sinon.spy(http.IncomingMessage.prototype, 'logIn');

      agent
        .post('/api/auth/login')
        .send({ email: 'alreadysignedup@test.com', password: '123456' })
        .expect(function() {
          reqSpy.called.should.be.true;
          reqSpy.restore();
        })
        .end(done);
    });

    it('should set a \'user\' cookie', function(done) {
      agent
        .post('/api/auth/login')
        .send({ email: 'alreadysignedup@test.com', password: '123456' })
        .expect(function(res) {
          res.headers['set-cookie'].should.be.ok;
          res.headers['set-cookie'][0].indexOf('user').should.not.equal(-1);
        })
        .end(done);
    });

    it('should send a 200 response with an object containing success, message and data properties', function(done) {
      agent
        .post('/api/auth/login')
        .send({ email: 'alreadysignedup@test.com', password: '123456' })
        .expect(200)
        .expect(function(res) {
          res.body.success.should.be.true;
          res.body.message.should.equal('Login successful.');
          res.body.data.should.be.ok;
          res.body.data.email[0].should.equal('alreadysignedup@test.com');
          res.body.data.password.should.not.equal(undefined);
        })
        .end(done);
    });
  });

  xdescribe('when logging out a user', function() {

    beforeEach(function(done) {
      agent
        .post('/api/auth/signup')
        .send({ email: 'alreadysignedup@test.com', password: 'password' })
        .end(done);
    });

    it('should call req.logout', function(done) {
      var reqSpy = sinon.spy(http.IncomingMessage.prototype, 'logout');

      agent
        .get('/api/auth/logout')
        .expect(function() {
          reqSpy.called.should.be.true;
          reqSpy.restore();
        })
        .end(done);
    });

    it('should send a 200 response with an object containing success and message properties', function(done) {
      agent
        .get('/api/auth/logout')
        .expect(200)
        .expect(function(res) {
          res.body.success.should.be.true;
          res.body.message.should.equal('Logout successful.')
        })
        .end(done);
    });
  });
});