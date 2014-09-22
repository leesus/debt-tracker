'use strict';

var mocha = require('mocha');
var should = require('should');
var sinon = require('sinon');
var utils = require('../../utils');

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Debt = require('../../../models/debt');
var User = require('../../../models/user');

var date = new Date(2014, 9, 10);

describe('Debt model', function() {

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
        _this.debt = new Debt({
          date: date,
          reference: 'Phone bill',
          amount: 43.66,
          debtor: _this.debtor._id,
          creditor: _this.creditor._id
        });

        _this.debt.save(function() {
          done();
        });
      });
    });
  });

  it('should have a non-null created_date property', function() {
    this.debt.created_date.should.not.equal(null);
  });

  it('should have a non-null updated_date property', function() {
    this.debt.updated_date.should.not.equal(null);
  });

  it('should have a date property', function() {
    this.debt.date.should.equal(date);
  });

  it('should have a reference property', function() {
    this.debt.reference.should.equal('Phone bill');
  });

  it('should have an amount property', function() {
    this.debt.amount.should.equal(43.66);
  });

  it('should have a debtor property', function() {
    this.debt.debtor.should.equal(this.debtor._id);
  });

  it('should have a creditor property', function() {
    this.debt.creditor.should.equal(this.creditor._id);
  });

  it('should have an archived property', function() {
    this.debt.archived.should.be.false;
  });

  describe('when saving', function() {

    it('should update the update_date property', function(done) {
      var _this = this;
      var oldDate = this.debt.updated_date;

      this.debt.amount.should.equal(43.66);
      this.debt.updated_date.should.equal(oldDate);

      this.debt.amount = 51.97;
      this.debt.save(function(){
        _this.debt.amount.should.equal(51.97);
        _this.debt.updated_date.should.not.equal(oldDate);
        done();
      });
    });
  });
});