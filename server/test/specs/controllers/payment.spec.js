'use strict';

var mocha = require('mocha');
var supertest = require('supertest');
var app = require('../../../index');
var should = require('should');
var sinon = require('sinon');
var utils = require('../../utils');
var http = require('http');
var ObjectId = require('mongoose').Types.ObjectId;

var paymentController = require('../../../controllers/payment');
var User = require('../../../models/user');
var Payment = require('../../../models/payment');

var agent = supertest.agent(app);

describe('Payment controller', function() {

  it('should have an addPayment method', function() {
    paymentController.addPayment.should.exist;
    (typeof paymentController.addPayment).should.equal('function');
  });

  it('should have a getPaymentsByUser method', function() {
    paymentController.getPaymentsByUser.should.exist;
    (typeof paymentController.getPaymentsByUser).should.equal('function');
  });

  it('should have a getPaymentsToUser method', function() {
    paymentController.getPaymentsToUser.should.exist;
    (typeof paymentController.getPaymentsToUser).should.equal('function');
  });

  it('should have a getPayment method', function() {
    paymentController.getPayment.should.exist;
    (typeof paymentController.getPayment).should.equal('function');
  });

  it('should have an updatePayment method', function() {
    paymentController.updatePayment.should.exist;
    (typeof paymentController.updatePayment).should.equal('function');
  });

  it('should have a removePayment method', function() {
    paymentController.removePayment.should.exist;
    (typeof paymentController.removePayment).should.equal('function');
  });

  describe('when creating a payment', function() {

    beforeEach(function(done) {
      agent
        .get('/api/auth/logout')
        .end(done);
    });

    it('should return a 401 response with an object containing success, message and error properties if user not authenticated', function(done) {
      agent
        .post('/api/payments')
        .send({ creditor: new ObjectId, date: Date.now(), reference: 'Test payment', amount: 42.56 })
        .expect(401)
        .expect(function(res) {
          res.body.success.should.be.false;
          res.body.message.should.equal('Unauthorized request.');
          res.body.errors.should.be.ok;
        })
        .end(done);
    });

    it('should return a 403 response with an object containing success and message properties if payment is invalid', function(done) {
      var date = Date.now();
      
      var user = new User({ email: ['user@test.com'], password: '123456' });
      user.save(function(err, user) {
        if (err) done(err);

        agent
          .post('/api/auth/login')
          .send({ email: 'user@test.com', password: '123456' })
          .end(function(err, res){
            agent
              .post('/api/payments')
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
      var creditorId = new ObjectId();

      var user = new User({ email: ['user@test.com'], password: '123456' });
      user.save(function(err, user) {
        if (err) done(err);
        
        agent
          .post('/api/auth/login')
          .send({ email: 'user@test.com', password: '123456' })
          .end(function(err, res){
            agent
              .post('/api/payments')
              .send({ creditor: creditorId, reference: 'Test payment', amount: 42.56 })
              .expect(201)
              .expect(function(res) {
                res.body.success.should.be.true;
                res.body.message.should.equal('Payment created successfully.');
                res.body.data.should.be.ok;

                String(res.body.data.debtor).should.equal(String(user._id));
                String(res.body.data.creditor).should.equal(String(creditorId));
                res.body.data.reference.should.equal('Test payment');
                res.body.data.amount.should.equal(42.56);
              })
              .end(done);
          });
      });
    });
  });

  describe('when updating a payment', function() {
    
    beforeEach(function(done) {
      agent
        .get('/api/auth/logout')
        .end(done);
    });

    it('should return a 401 response with an object containing success, message and error properties if user not authenticated', function(done) {
      var payment = new Payment({
        debtor: new ObjectId,
        creditor: new ObjectId,
        date: Date.now(),
        reference: 'Test payment',
        amount: 1
      });

      payment.save(function (err, payment) {
        agent
          .put('/api/payments/' + payment._id)
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

    it('should send a 200 response with an object containing success, message and data properties', function(done) {
      var date = Date.now();
      var creditorId = new ObjectId();

      var payment = new Payment({
        debtor: new ObjectId,
        creditor: new ObjectId,
        date: date,
        reference: 'Test payment',
        amount: 1
      });
      var user = new User({ email: ['user@test.com'], password: '123456' });

      payment.save(function(err, payment) {
        if (err) done(err);

        user.save(function(err, user) {
          if (err) done(err);
          
          agent
            .post('/api/auth/login')
            .send({ email: 'user@test.com', password: '123456' })
            .end(function(err, res){
              agent
                .put('/api/payments/' + payment._id)
                .send({ amount: 42.56 })
                .expect(200)
                .expect(function(res) {
                  res.body.success.should.be.true;
                  res.body.message.should.equal('Payment updated successfully.');
                  res.body.data.should.be.ok;
                  
                  (new Date(res.body.data.updated_date).getTime()).should.not.equal(date);
                  res.body.data.amount.should.equal(42.56);
                })
                .end(done);
            });
        });
      });
    });
  });

  describe('when removing a payment', function() {
    
    beforeEach(function(done) {
      agent
        .get('/api/auth/logout')
        .end(done);
    });

    it('should return a 401 response with an object containing success, message and error properties if user not authenticated', function(done) {
      var payment = new Payment({
        debtor: new ObjectId,
        creditor: new ObjectId,
        date: Date.now(),
        reference: 'Test payment',
        amount: 1
      });

      payment.save(function (err, payment) {
        agent
          .delete('/api/payments/' + payment._id)
          .send()
          .expect(401)
          .expect(function(res) {
            res.body.success.should.be.false;
            res.body.message.should.equal('Unauthorized request.');
            res.body.errors.should.be.ok;
          })
          .end(done);
      });
    });

    it('should send a 200 response with an object containing success and message properties', function(done) {
      var date = Date.now();
      var creditorId = new ObjectId();

      var payment = new Payment({
        debtor: new ObjectId,
        creditor: new ObjectId,
        date: date,
        reference: 'Test payment',
        amount: 1
      });
      var user = new User({ email: ['user@test.com'], password: '123456' });

      payment.save(function(err, payment) {
        if (err) done(err);

        user.save(function(err, user) {
          if (err) done(err);
          
          agent
            .post('/api/auth/login')
            .send({ email: 'user@test.com', password: '123456' })
            .end(function(err, res){
              agent
                .delete('/api/payments/' + payment._id)
                .send()
                .expect(200)
                .expect(function(res) {
                  res.body.success.should.be.true;
                  res.body.message.should.equal('Payment removed successfully.');
                })
                .end(done);
            });
        });
      });
    });
  });

  describe('when retrieving a payment', function() {
    
    beforeEach(function(done) {
      agent
        .get('/api/auth/logout')
        .end(done);
    });

    it('should return a 401 response with an object containing success, message and error properties if user not authenticated', function(done) {
      var payment = new Payment({
        debtor: new ObjectId,
        creditor: new ObjectId,
        date: Date.now(),
        reference: 'Test payment',
        amount: 1
      });

      payment.save(function (err, payment) {
        agent
          .get('/api/payments/' + payment._id)
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

    it('should send a 404 response with an object containing success and message properties if payment not found', function(done) {
      var user = new User({ email: ['user@test.com'], password: '123456' });

      user.save(function(err, user) {
        if (err) done(err);
        
        agent
          .post('/api/auth/login')
          .send({ email: 'user@test.com', password: '123456' })
          .end(function(err, res){
            agent
              .get('/api/payments/54216e49cc65bfc42b1f0e6f')
              .send()
              .expect(404)
              .expect(function(res) {
                res.body.success.should.be.false;
                res.body.message.should.equal('Payment not found.');
              })
              .end(done);
          });
      });
    });

    it('should send a 201 response with an object containing success, message and data properties', function(done) {
      var date = Date.now();
      var creditorId = new ObjectId();

      var payment = new Payment({
        debtor: new ObjectId,
        creditor: new ObjectId,
        date: date,
        reference: 'Test payment',
        amount: 1
      });
      var user = new User({ email: ['user@test.com'], password: '123456' });

      payment.save(function(err, payment) {
        if (err) done(err);

        user.save(function(err, user) {
          if (err) done(err);
          
          agent
            .post('/api/auth/login')
            .send({ email: 'user@test.com', password: '123456' })
            .end(function(err, res){
              agent
                .get('/api/payments/' + payment._id)
                .send()
                .expect(200)
                .expect(function(res) {
                  res.body.success.should.be.true;
                  res.body.message.should.equal('Payment found.');
                  res.body.data.should.be.ok;
                })
                .end(done);
            });
        });
      });
    });
  });

  describe('when retrieving payments paid to a user', function() {

    var user1 = null;
    var user2 = null;
    var payment1 = null;
    var payment2 = null;
    var payment3 = null;
    var payment4 = null;
    
    beforeEach(function(done) {
      user1 = new User({
        email: ['user1@test.com'],
        password: '123456'
      });
      user2 = new User({
        email: ['user2@test.com'],
        password: '123456'
      });
      payment1 = new Payment({
        debtor: user1._id,
        creditor: user2._id,
        date: Date.now() + 1,
        reference: 'Test paid by 1 to 2',
        amount: 1
      });
      payment2 = new Payment({
        debtor: user2._id,
        creditor: user1._id,
        date: Date.now() + 2,
        reference: 'Test paid by 2 to 1',
        amount: 1
      });
      payment3 = new Payment({
        debtor: user1._id,
        creditor: user2._id,
        date: Date.now() + 3,
        reference: 'Test paid by 1 to 2',
        amount: 2
      });
      payment4 = new Payment({
        debtor: user2._id,
        creditor: user1._id,
        date: Date.now() + 4,
        reference: 'Test paid by 2 to 1',
        amount: 2
      });

      // TODO: refactor callback hell...
      user1.save(function(err, user1) {
        if (err) done(err);
        user2.save(function(err, user2) {
          if (err) done(err);
          payment1.save(function(err, payment1) {
            if (err) done(err);
            payment2.save(function(err, payment2) {
              if (err) done(err);
              payment3.save(function(err, payment3) {
                if (err) done(err);
                payment4.save(function(err, payment4) {
                  if (err) done(err);
                  agent
                    .get('/api/auth/logout')
                    .end(done);
                })
              })
            })
          })
        })
      });
    });

    it('should return a 401 response with an object containing success, message and error properties if user not authenticated', function(done) {
      agent
        .get('/api/payments/received')
        .send()
        .expect(401)
        .expect(function(res) {
          res.body.success.should.be.false;
          res.body.message.should.equal('Unauthorized request.');
          res.body.errors.should.be.ok;
        })
        .end(done);
    });

    it('should send a 404 response with an object containing success and message properties if payment not found', function(done) {
      var user = new User({ email: ['user@test.com'], password: '123456' });

      user.save(function(err, user) {
        if (err) done(err);
        agent
          .post('/api/auth/login')
          .send({ email: 'user@test.com', password: '123456' })
          .end(function(err, res){
            agent
              .get('/api/payments/received')
              .send()
              .expect(404)
              .expect(function(res) {
                res.body.success.should.be.false;
                res.body.message.should.equal('No payments found to be paid to user.');
              })
              .end(done);
          });
      });
    });

    it('should send a 200 response with an object containing success, message and data properties', function(done) {
      agent
        .post('/api/auth/login')
        .send({ email: 'user1@test.com', password: '123456' })
        .end(function(err, res){
          agent
            .get('/api/payments/received')
            .send()
            .expect(200)
            .expect(function(res) {
              res.body.success.should.be.true;
              res.body.message.should.equal('Payments paid to user ' + user1._id + '.');
              res.body.data.length.should.equal(2);
              res.body.data[0].reference.should.equal('Test paid by 2 to 1');
              res.body.data[0].amount.should.equal(1);
              res.body.data[1].reference.should.equal('Test paid by 2 to 1');
              res.body.data[1].amount.should.equal(2);
            })
            .end(done);
        });
    });
  });

  describe('when retrieving payments owed by a user', function() {

    var user1 = null;
    var user2 = null;
    var payment1 = null;
    var payment2 = null;
    var payment3 = null;
    var payment4 = null;
    
    beforeEach(function(done) {
      user1 = new User({
        email: ['user1@test.com'],
        password: '123456'
      });
      user2 = new User({
        email: ['user2@test.com'],
        password: '123456'
      });
      payment1 = new Payment({
        debtor: user1._id,
        creditor: user2._id,
        date: Date.now() + 1,
        reference: 'Test paid by 1 to 2',
        amount: 1
      });
      payment2 = new Payment({
        debtor: user2._id,
        creditor: user1._id,
        date: Date.now() + 2,
        reference: 'Test paid by 2 to 1',
        amount: 1
      });
      payment3 = new Payment({
        debtor: user1._id,
        creditor: user2._id,
        date: Date.now() + 3,
        reference: 'Test paid by 1 to 2',
        amount: 2
      });
      payment4 = new Payment({
        debtor: user2._id,
        creditor: user1._id,
        date: Date.now() + 4,
        reference: 'Test paid by 2 to 1',
        amount: 2
      });

      // TODO: refactor callback hell...
      user1.save(function(err, user1) {
        if (err) done(err);
        user2.save(function(err, user2) {
          if (err) done(err);
          payment1.save(function(err, payment1) {
            if (err) done(err);
            payment2.save(function(err, payment2) {
              if (err) done(err);
              payment3.save(function(err, payment3) {
                if (err) done(err);
                payment4.save(function(err, payment4) {
                  if (err) done(err);
                  agent
                    .get('/api/auth/logout')
                    .end(done);
                })
              })
            })
          })
        })
      });
    });

    it('should return a 401 response with an object containing success, message and error properties if user not authenticated', function(done) {
      agent
        .get('/api/payments/paid')
        .send()
        .expect(401)
        .expect(function(res) {
          res.body.success.should.be.false;
          res.body.message.should.equal('Unauthorized request.');
          res.body.errors.should.be.ok;
        })
        .end(done);
    });

    it('should send a 404 response with an object containing success and message properties if payment not found', function(done) {
      var user = new User({ email: ['user@test.com'], password: '123456' });

      user.save(function(err, user) {
        if (err) done(err);
        
        agent
          .post('/api/auth/login')
          .send({ email: 'user@test.com', password: '123456' })
          .end(function(err, res){
            agent
              .get('/api/payments/paid')
              .send()
              .expect(404)
              .expect(function(res) {
                res.body.success.should.be.false;
                res.body.message.should.equal('No payments found to be paid by user.');
              })
              .end(done);
          });
      });
    });

    it('should send a 200 response with an object containing success, message and data properties', function(done) {
      agent
        .post('/api/auth/login')
        .send({ email: 'user1@test.com', password: '123456' })
        .end(function(err, res){
          agent
            .get('/api/payments/paid')
            .send()
            .expect(200)
            .expect(function(res) {
              res.body.success.should.be.true;
              res.body.message.should.equal('Payments paid by user ' + user1._id + '.');
              res.body.data.length.should.equal(2);
              res.body.data[0].reference.should.equal('Test paid by 1 to 2');
              res.body.data[0].amount.should.equal(1);
              res.body.data[1].reference.should.equal('Test paid by 1 to 2');
              res.body.data[1].amount.should.equal(2);
            })
            .end(done);
        });
    });
  });
});