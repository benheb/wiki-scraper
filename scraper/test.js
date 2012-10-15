var express = require('express')
  , jsdom = require('jsdom')
  , _ = require('underscore')
  , request = require('request');
  
var urls = ["http://en.wikipedia.org/w/index.php?title=Denver&action=history", "http://en.wikipedia.org/w/index.php?title=Revision&action=history", "http://en.wikipedia.org/w/index.php?title=Weather&action=history"]

_.each(urls, function(url,i) {
  request({uri: 'http://en.wikipedia.org/w/index.php?title=Revision&action=history'}, function(err, response, body){
    var self = this;
    self.items = new Array();//I feel like I want to save my results in an array

    //Just a basic error check
    if(err && response.statusCode !== 200){console.log('Request error.');}
    
    jsdom.env({
        html: url,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.   696.71 Safari/534.24'},
        scripts: ['http://code.jquery.com/jquery-1.5.min.js'],
        done: function(errors, window) {
            console.log(window.$('#firstHeading span').eq(0).text());
            console.log('Last updated: ', window.$('#pagehistory li a').eq(1).text());
            console.log('--------------');
        }
    });
  });
});

