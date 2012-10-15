var jsdom = require("jsdom"),
  Backbone = require('backbone'),
  _ = require('underscore'),
  mongo = require('mongoskin'),
  //scraper = require('./tester.js');
  scraper = require('./scraper_docs.js');

scrapes = 0;

//db = mongo.db('66.228.48.190:27017/ski_resorts?auto_reconnect');
//db = mongo.db('127.0.0.1/ski_resorts?auto_reconnect');


function Report() { // @extends Backbone.Model
  return Backbone.Model.apply(this, arguments);
}

Report.prototype = Backbone.Model.prototype;

Report.prototype.updateDB = function updateDB(state, name, index) {
  var self = this;
  scrapes++;
  //console.log(name, 'new:', this.get('new'), 'base:', this.get('base'))
  //console.log(scrapes, 'of', scraper.docs.length)

  /*var snow = {
    timestamp: new Date(),
    'new':parseInt(this.get('new')),
    'base': parseInt(this.get('base')),
    'status':this.get('status'),
    'conditions':this.get('conditions')
  }
db.collection(state).findOne({'Name':name}, function(i,doc){
    doc['report_time'] = snow.timestamp;
    doc['current_new'] = snow['new'];
    doc['current_base'] = snow.base;
    doc['current_status'] = snow.status;
    doc['current_conditions'] = snow.conditions;
    doc['snow'].push(snow);
    db.collection(state).save(doc);
    if (scrapes == scraper.docs.length) process.exit()
  });*/

};

_.each(scraper.docs, function(doc,i){
  jsdom.env(doc.url, ['http://code.jquery.com/jquery-1.5.min.js'], function(errors, window){
      result = doc.scraper.apply(this, [errors,window])
      report = new Report(result)
      console.log('report', report);
      report.updateDB(doc.state, doc.name, i);
  });
});
