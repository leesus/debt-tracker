'use strict';

var mocha = require('mocha');
var should = require('should');
var sinon = require('sinon');
var utils = require('../../utils');

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Payment = require('../../../models/payment');
var User = require('../../../models/user');

describe('Payment model', function() {

  beforeEach(function(done) {
    var _this = this;

    _this.creditor = new User({
      name: 'Lee'
    });

    _this.debtor = new User({
      name: 'John'
    });

    _this.creditor.save(function() {
      _this.debtor.save(function() {
        _this.payment = new Payment({
          reference: 'September bills',
          amount: 325.26,
          debtor: _this.debtor._id,
          creditor: _this.creditor._id
        });

        _this.payment.save(function() {
          done();
        });
      });
    });
  });

  it('should have a non-null created_date property', function() {
    this.payment.created_date.should.not.equal(null);
  });

  it('should have a non-null updated_date property', function() {
    this.payment.updated_date.should.not.equal(null);
  });

  it('should have a reference property', function() {
    this.payment.reference.should.equal('September bills');
  });

  it('should have an amount property', function() {
    this.payment.amount.should.equal(325.26);
  });

  it('should have a debtor property', function() {
    this.payment.debtor.should.equal(this.debtor._id);
  });

  it('should have a creditor property', function() {
    this.payment.creditor.should.equal(this.creditor._id);
  });

  it('should have a confirmed property', function() {
    this.payment.confirmed.should.be.false;
  });
});