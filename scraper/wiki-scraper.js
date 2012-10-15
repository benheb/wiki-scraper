//adds all new docs to db
var express = require('express')
  , jsdom = require('jsdom')
  , _ = require('underscore')
  , mongo = require('mongoskin')
  , request = require('request');

//db = mongo.db('127.0.0.1/wiki?auto_reconnect');
db = mongo.db('127.0.0.1/wiki-dev?auto_reconnect');
collection = db.collection('pages');
collection.remove();

var url_count = 0;
 
function updateDB(url, latest, name) {
  console.log('update with: latest', latest);
  var doc = {'url': url, 'latest': latest, 'prev': latest, 'name': name}
  db.collection('pages').findOne({'url':url}, function(){
    console.log('doc', doc);
    db.collection('pages').save(doc);
    //if (url_count == urls.length) process.exit()
  });
  //collection.insert(doc);
}

var urls = ["http://en.wikipedia.org/w/index.php?title=Viki_(company)&action=history", "http://en.wikipedia.org/w/index.php?title=Denver&action=history", "http://en.wikipedia.org/w/index.php?title=Revision&action=history", "http://en.wikipedia.org/w/index.php?title=Weather&action=history", "http://en.wikipedia.org/w/index.php?title=Common_Sense_Media&action=history", "http://en.wikipedia.org/w/index.php?title=Facebook&action=history", "http://en.wikipedia.org/w/index.php?title=Google&action=history"]

_.each(urls, function(url,i) {
  url_count++;
  request({uri: 'http://en.wikipedia.org/w/index.php?title=Revision&action=history'}, function(err, response, body){
    var self = this;

    //Just a basic error check
    if(err && response.statusCode !== 200){console.log('Request error.');}
    
    jsdom.env({
        html: url,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.   696.71 Safari/534.24'},
        scripts: ['http://code.jquery.com/jquery-1.5.min.js'],
        done: function(errors, window) {
            //console.log('Last updated: ', window.$('#pagehistory li a').eq(1).text());
            //console.log('--------------');
            var latest = window.$('#pagehistory li a').eq(1).text();
            var name = window.$('#firstHeading span').eq(0).text();
            //console.log('latest: ', latest, url)
            updateDB(url, latest, name);
        }
    });
  });
});

