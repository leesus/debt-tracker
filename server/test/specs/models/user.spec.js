if (process.env.NODE_ENV !== 'test' ) {
  console.log('Setting NODE_ENV=test.');
  process.env.NODE_ENV = 'test';
}

var mocha = require('mocha');
var supertest = require('supertest');
var should = require('should');
var sinon = require('sinon');

var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var config = require('../../../config/secrets')[process.env.NODE_ENV];
var Debt = require('../../../models/debt');
var Payment = require('../../../models/payment');
var User = require('../../../models/user');

var isArray = Array.isArray || function(o) {
  return toString.call(o) === '[object Array]';
};

describe('User model', function() {

  before(function(done) {
    if (mongoose.connection.db) {
      return done();
    }

    mongoose.connect(config.db, done);    
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function(){
      mongoose.connection.close(done);
    });
  });

  beforeEach(function(done) {
    var _this = this;

    mongoose.connection.db.dropDatabase(function(err){
      if (err) return done(err);

      _this.owed = new Debt;
      _this.owes = new Debt;
      _this.repaid = new Payment;
      _this.paid = new Payment;
      
      _this.user = new User({
        firstName: 'Lee',
        lastName: 'Ellam',
        displayName: 'Lee Ellam',
        email: ['test@test.com'],
        password: 'test',
        facebook: {
          id: '12345',
          token: 'abc123'
        },
        owes: [_this.owes],
        paid: [_this.paid],
        owed: [_this.owed],
        repaid: [_this.repaid]
      });

      _this.user.save(function(){
        done();
      });
    });
  });

  it('should have a firstName property', function() {
    this.user.firstName.should.equal('Lee');
  });

  it('should have a lastName property', function() {
    this.user.lastName.should.equal('Ellam');
  });

  it('should have a displayName property', function() {
    this.user.displayName.should.equal('Lee Ellam');
  });

  it('should have an activated property', function() {
    this.user.activated.should.be.false;
  });

  it('should have an email array property', function() {
    isArray(this.user.email).should.be.true;
    this.user.email[0].should.equal('test@test.com');
  });

  it('should have a password property', function() {
    this.user.password.should.be.ok;
  });

  it('should have a facebook.id property', function() {
    this.user.facebook.id.should.equal('12345');
  });

  it('should have a facebook.token property', function() {
    this.user.facebook.token.should.equal('abc123');
  });

  it('should have a non-null created property', function() {
    this.user.created.should.not.equal(null);
  });

  it('should have an owes array property', function() {
    isArray(this.user.owes).should.be.true;
    this.user.owes[0].should.equal(this.owes._id);
  });

  it('should have a paid array property', function() {
    isArray(this.user.paid).should.be.true;
    this.user.paid[0].should.equal(this.paid._id);
  });

  it('should have an owed array property', function() {
    isArray(this.user.owed).should.be.true;
    this.user.owed[0].should.equal(this.owed._id);
  });

  it('should have a repaid array property', function() {
    isArray(this.user.repaid).should.be.true;
    this.user.repaid[0].should.equal(this.repaid._id);
  });

  it('should have a comparePassword method', function(done) {
    this.user.comparePassword('test', function(err, isMatch) {
      isMatch.should.equal(true);
      done();
    });
  });

  describe('when saving', function() {

    beforeEach(function() {
      sinon.spy(bcrypt, 'hash');
    });

    afterEach(function() {
      bcrypt.hash.restore();
    });

    it('shouldn\'t hash the password if not changed', function(done) {
      var _this = this;
      _this.user.comparePassword('test', function(err, isMatch) {
        isMatch.should.equal(true);
        
        _this.user.save(function() {
          bcrypt.hash.called.should.be.false;
          done();
        });
      });
    });

    it('should hash the password if changed', function(done) {
      this.user.password = 'dogpoo';
      this.user.save(function() {
        bcrypt.hash.called.should.be.true;
        done();
      });
    });
  });
});