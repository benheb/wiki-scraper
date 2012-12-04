/**
 * Module dependencies.
 */

var express = require('express')
  , jsdom = require('jsdom')
  , request = require('request')
  , routes = require('./routes')
  , _ = require('underscore')
  , mongo = require('mongoskin')
  , http = require('http')
  , path = require('path');
  
var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

//db = mongo.db('127.0.0.1/wiki_dev_urls?auto_reconnect');
//collection = db.collection('dev_urls');

db = ('127.0.0.1/wiki_scraper')
collection = ['urls'];
var db = require('mongojs').connect(db, collection);

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res) {
  res.render('index.jade', {title: "Wiki Revision Scraper"});
});

app.get('/wiki-urls', function(req, res) {
  var id = req.params.id;
  var docs = db.urls;
  docs.find().toArray(function (err, urls) {
    res.json(urls);
  });
});

app.post('/db', function(req,res){
  var url = req.body.url;
  console.log('url to add: ', url)
  request({uri: 'http://en.wikipedia.org/w/index.php?title=Revision&action=history'}, function(err, response, body){
    var self = this;

    //err
    if(err && response.statusCode !== 200){console.log('Request error.');}
    
    jsdom.env({
        html: url,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.   696.71 Safari/534.24'},
        scripts: ['http://code.jquery.com/jquery-1.5.min.js'],
        done: function(errors, window) {
            var latest = window.$('#pagehistory li a').eq(1).text();
            addUrl(url, latest);
        }
    });
  });
  
  function addUrl(url, latest) {
    var doc = {'url': url, 'latest': latest, 'prev': latest}
    db.urls.findOne(doc, function(){
      db.urls.insert(doc);
      res.send('Success');
    });
  };
  
});

app.post('/db/remove', function(req,res){
  var doc = req.body;
  db.urls.findOne(doc, function(){
    db.urls.remove(doc);
    res.send('Success');
  });
});

app.post('/checkdbs', function(req, res) {
  var url_count = 0;
  
  var urls = req.body.urls;
  var results = [];
  
  function updateDoc(url, newDate) {
    var prev;
    var name;
    db.urls.findOne({url:url}, function(err, document) {
      prev = document.latest;
      name = document.name;
      db.urls.update({url: url}, {$set: {prev: prev}}, function(err, updated) {
        if (err || !updated) console.log('something went terribly wrong', err);
      });
  
      db.urls.update({url: url}, {$set: {latest: newDate}}, function(err, updated) {
        if (err || !updated) console.log('something went terribly wrong', err);
      });
      
      //compare dates
      if (newDate != prev) {
        results.push({status: 'updated', url: url});
      } else {
        results.push({status: 'okay', url: url});
      }
      
      var resStr = JSON.stringify(results);
      url_count++;
      console.log('url_count == urls.length', url_count, urls.length)
      if (url_count == urls.length) res.send(resStr);
    });
   
  }
  
  _.each(urls, function(url,i) {
    request({uri: 'http://en.wikipedia.org/w/index.php?title=Revision&action=history'}, function(err, response, body){
      var self = this;
  
      if(err && response.statusCode !== 200){console.log('Request error.');}
      jsdom.env({
          html: url,
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.   696. 71 Safari/534.24'},
          scripts: ['http://code.jquery.com/jquery-1.5.min.js'],
          done: function(errors, window) {
            var latest = window.$('#pagehistory li a').eq(1).text();
            updateDoc(url, latest);
          }
      });
    });
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
