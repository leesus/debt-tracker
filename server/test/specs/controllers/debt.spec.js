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
      agent
        .get('/api/auth/logout')
        .end(done);
    });

    it('should return a 401 response with an object containing success, message and error properties if user not authenticated', function(done) {
      agent
        .post('/api/debts')
        .send({ debtor: new ObjectId, date: Date.now(), reference: 'Test bill', amount: 42.56 })
        .expect(401)
        .expect(function(res) {
          res.body.success.should.be.false;
          res.body.message.should.equal('Unauthorized request.');
          res.body.errors.should.be.ok;
        })
        .end(done);
    });

    it('should return a 403 response with an object containing success and message properties if debt is invalid', function(done) {
      var date = Date.now();
      var debtorId = new ObjectId();

      var user = new User({ email: ['user@test.com'], password: '123456' });
      user.save(function(err, user) {
        if (err) done(err);

        agent
          .post('/api/auth/login')
          .send({ email: 'user@test.com', password: '123456' })
          .end(function(err, res){
            agent
              .post('/api/debts')
              .send()
              .expect(403)
              .expect(function(res) {
                res.body.success.should.be.false;
                res.body.message.should.equal('Validation failed');
                res.body.errors.should.be.ok;
              })
              .end(done);
          });
      });
    });

    it('should send a 201 response with an object containing success, message and data properties', function(done) {
      var date = Date.now();
      var debtorId = new ObjectId();

      var user = new User({ email: ['user@test.com'], password: '123456' });
      user.save(function(err, user) {
        if (err) done(err);
        
        agent
          .post('/api/auth/login')
          .send({ email: 'user@test.com', password: '123456' })
          .end(function(err, res){
            agent
              .post('/api/debts')
              .send({ debtor: debtorId, date: date, reference: 'Test bill', amount: 42.56 })
              .expect(201)
              .expect(function(res) {
                res.body.success.should.be.true;
                res.body.message.should.equal('Debt created successfully.');
                res.body.data.should.be.ok;

                String(res.body.data.creditor).should.equal(String(user._id));
                String(res.body.data.debtor).should.equal(String(debtorId));
                (new Date(res.body.data.date).getTime()).should.equal(date);
                res.body.data.reference.should.equal('Test bill');
                res.body.data.amount.should.equal(42.56);
              })
              .end(done);
          });
      });
    });
  });

  describe('when updating a debt', function() {
    
    beforeEach(function(done) {
      agent
        .get('/api/auth/logout')
        .end(done);
    });

    it('should return a 401 response with an object containing success, message and error properties if user not authenticated', function(done) {
      var debt = new Debt({
        debtor: new ObjectId,
        creditor: new ObjectId,
        date: Date.now(),
        reference: 'Test debt',
        amount: 1
      });

      debt.save(function (err, debt) {
        agent
          .put('/api/debts/' + debt._id)
          .send({ amount: 42.56 })
          .expect(401)
          .expect(function(res) {
            res.body.success.should.be.false;
            res.body.message.should.equal('Unauthorized request.');
            res.body.errors.should.be.ok;
          })
          .end(done);
      });
    });
  });
});