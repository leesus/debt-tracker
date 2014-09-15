'use strict';

var server = require('./server');
var port = server.get('port');

server.listen(port, function(){
    console.log('===========================');
    console.log('Server running on port %s', port);
    console.log('===========================');
});
