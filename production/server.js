//modules
var http = require('http');
var express = require('express');
var request = require('request');
var redisClient = require('redis').createClient();

//create the express app
var app = express();

//root directory
app.get('/', function (req, res) {
  res.send("<!DOCTYPE html><html><head><title>xkcd search</title></head><body><h1>Search xkcd by keyword. Example: http://xkcdsearch.com/poop -> this would return comics about poop.</h1></body></html>");
});

//string 'contains' helper function
String.prototype.contains = function(argument){
  var parent = this.toLowerCase();
  var argumentString = argument.toLowerCase();
  return (parent.indexOf(argumentString) > -1);
};

//custom search param
app.get('/:search', function(req, res){
  var search = req.params.search + "";

  //get all of the elements from the database
  redisClient.lrange('comics3', 0, -1, function (error, comics) {
  comics.forEach(function (item) {
    var comic = JSON.parse(item);
    console.log(comic);

    var name = comic.name + "";
    var transcript = comic.transcript + "";

    //check if the search is related, if it is, send the comic
    if(name.contains(search) || transcript.contains(search))
    {
	res.end('<!DOCTYPE html><html><head><title>xkcd search</title></head><body><h1>'+comic.name+'</h1><img src=\''+comic.image+'\'/></body></html>');
    	return;
    }
  });
  res.end("<h1>Sorry, no results</h1>");

  console.log('finished search');
});


});

//listen
var server = app.listen(80, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('xkcd search app listening at http://%s:%s', host, port);

});
