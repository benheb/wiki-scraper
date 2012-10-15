var express = require('express')
  , jsdom = require('jsdom')
  , _ = require('underscore')
  , mongo = require('mongoskin')
  , request = require('request');

//dbUrl = ('127.0.0.1/wiki');
dbUrl = ('127.0.0.1/wiki-dev')
collection = ['pages'];
var db = require('mongojs').connect(dbUrl, collection);

var url_count = 0;

function updateDoc(url, newDate) {
  var prev;
  var name;
  url_count++;
  db.pages.findOne({url:url}, function(err, document) {
    console.log('document', document)
    prev = document.latest;
    name = document.name;
    /*db.pages.update({url: url}, {$set: {prev: prev}}, function(err, updated) {
      if (err || !updated) console.log('something went terribly wrong', err);
      //else console.log("fuck yeah!");
    });

    db.pages.update({url: url}, {$set: {latest: newDate}}, function(err, updated) {
      if (err || !updated) console.log('something went terribly wrong', err);
      //else console.log("fuck yeah!");
    });
    console.log('name: ', name, 'previous edit date: ', prev, 'new date: ', newDate);
    if (url_count == urls.length) process.exit()*/
  });
 
}

var urls = ["http://en.wikipedia.org/w/index.php?title=Viki_(company)&action=history", "http://en.wikipedia.org/w/index.php?title=Denver&action=history", "http://en.wikipedia.org/w/index.php?title=Revision&action=history", "http://en.wikipedia.org/w/index.php?title=Weather&action=history", "http://en.wikipedia.org/w/index.php?title=Common_Sense_Media&action=history", "http://en.wikipedia.org/w/index.php?title=Facebook&action=history", "http://en.wikipedia.org/w/index.php?title=Google&action=history"]

_.each(urls, function(url,i) {
  request({uri: 'http://en.wikipedia.org/w/index.php?title=Revision&action=history'}, function(err, response, body){
    var self = this;

    //Just a basic error check
    if(err && response.statusCode !== 200){console.log('Request error.');}
    console.log('url', url)
    jsdom.env({
        html: url,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.   696. 71 Safari/534.24'},
        scripts: ['http://code.jquery.com/jquery-1.5.min.js'],
        done: function(errors, window) {
          var latest = window.$('#pagehistory li a').eq(1).text();
          //var latest = 'fuck YES! cake head'
          console.log('latest', latest)
          updateDoc(url, latest);
        }
    });
  });
});
