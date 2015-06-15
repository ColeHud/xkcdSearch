//modules
var http = require('http');
var express = require('express');
var request = require('request');
var redisClient = require('redis').createClient();

//create an array of all transcripts and their images
var min = 1;
var currentMax = 1;

//find the largest number
//figure out what the largest number is
var largestNumber = function(){
  var newestUrl = "http://xkcd.com/info.0.json";
  request({url:newestUrl, json:true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var max = body.num;
      redisClient.set('max', max);
      redisClient.get('max', function(err, reply){
        //console.log(reply);
      });
    }
  });
};

var getMax = function(){
  largestNumber();
  redisClient.get('max', function(err, reply){
    return reply;
  });
};

//get a given comic; returns a stringy json
var getComic = function(number)
{
  var newestUrl = "http://xkcd.com/"+number+"info.0.json";
  request({url:newestUrl, json:true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var comic = {name: body.safe_title, image: body.img, transcript: body.transcript};
      var stringyComic = JSON.stringify(comic);
      return stringyComic;
    }
  });
}

//update the database with the latest comics
var updateDB = function(){
  var comicsLength = 0;
  redisClient.llen('comics', function(err, reply){
    comicsLength = reply;
  });
  var numberOfComics = getMax();
  console.log(numberOfComics);

  //if there are no comics
  if(comicsLength != false)
  {
    for(var i = comicsLength + 1; i < numberOfComics; i++)
    {
      var comic = getComic(i);
      redisClient.lpush('comics', comic);
    }
  }
  else {
    for(var i = 1; i < numberOfComics; i++)
    {
      var comic = getComic(i);
      redisClient.lpush('comics', comic);
    }
  }

};

//if there is no max, set the max
if(!redisClient.get('max'))
{
  largestNumber();
}

//print
updateDB();
//console.log(redisClient.lrange('comics', 0, -1));













//create the express app
var app = express();

//root directory
app.get('/', function (req, res) {
  res.send("The best of xkcd");
});

//custom params
app.get('/:comic', function(req, res){
  var number = req.params.comic;
  console.log(number);

  //figure out what the largest number is
  var newestUrl = "http://xkcd.com/info.0.json";
  request({url:newestUrl, json:true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var largestNumber = body.num;

      if(number > largestNumber || number < 1)
      {
        res.end("<p>That's not a good number. The largest number is <b>"+largestNumber+"</b>, the smallest is <b>1</b></p>");
        return;
      }
    }
  });

  //get the json
  var url = "http://xkcd.com/" + number + "/info.0.json";

  request({url:url, json:true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //get the transcript
      var transcript = body.transcript;
      var imageURL = body.img;
      console.log(imageURL);
      console.log(transcript);

      //"<p>"+body.transcript + \/ + +"</p>"
      res.send("<img src=\'"+imageURL+"\'/>");
    }
  });

});


//listen
var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('xkcd app listening at http://%s:%s', host, port);

});
