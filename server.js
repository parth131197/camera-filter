const path = require('path');
const express = require('express');
const app = express();

// Serve static files
app.use(express.static(__dirname + '/dist/camera-filter'));

// Send all requests to index.html
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/dist/camera-filter/index.html'));
});

// default Heroku port
app.set('port', process.env.PORT || 5000);
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
}); 