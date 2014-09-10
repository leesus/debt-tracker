'use strict';

if (process.env.NODE_ENV !== 'test' ) {
  var env = process.env.NODE_ENV;
  process.env.NODE_ENV = 'test';
}

// http://www.scotchmedia.com/tutorials/express/authentication/1/06
var config = require('../config/secrets')[process.env.NODE_ENV];
var mongoose = require('mongoose');


beforeEach(function (done) {
 function clearDB() {
   for (var i in mongoose.connection.collections) {
     mongoose.connection.collections[i].remove(function() {});
   }
   return done();
 }

 if (mongoose.connection.readyState === 0) {
   mongoose.connect(config.db, function (err) {
     if (err) throw err;

     return clearDB();
   });
 } else {
   return clearDB();
 }
});

afterEach(function (done) {
 mongoose.disconnect();

 // Reset environment
 if (env) process.env.NODE_ENV = env;
 return done();
});