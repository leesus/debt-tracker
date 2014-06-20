var app = require('./server');
var port = app.get('port');

app.listen(port, function(){
    console.log('==========================');
    console.log('App listening on port %s', port);
    console.log('==========================');
});
