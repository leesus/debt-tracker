'use strict';

var mocha = require('mocha');
var should = require('should');
var sinon = require('sinon');
var utils = require('../../utils');

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var Debt = require('../../../models/debt');
var User = require('../../../models/user');

var isArray = Array.isArray || function(o) {
  return toString.call(o) === '[object Array]';
};

var date = new Date(2014, 9, 10);

describe('Debt model', function() {

  beforeEach(function(done) {
    var _this = this;

    _this.debt = new Debt({
      date: date
    });

    _this.debt.save(function(){
      done();
    });
  });

  it('should have a non-null created property', function() {
    this.debt.created.should.not.equal(null);
  });

  it('should have a date property', function() {
    this.debt.date.should.equal(date);
  });
});