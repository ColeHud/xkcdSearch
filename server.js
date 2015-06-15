//modules
var http = require('http');
var express = require('express');
var request = require('request');

//create an array of all transcripts and their images
var comics = [];
var min = 1;

//find the largest number
//figure out what the largest number is
var newestUrl = "http://xkcd.com/info.0.json";
request({url:newestUrl, json:true}, function (error, response, body) {
  if (!error && response.statusCode == 200) {
    var max = body.num;

    //loop over every xkcd comic ever
    for(var i = min; i < max; i++)
    {
      var url = "http://xkcd.com/" + i + "/info.0.json";

      request({url:url, json:true}, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          //get the transcript
          var transcript = body.transcript;
          var imageURL = body.img;
          var title = body.safe_title;
          //console.log(imageURL);
          //console.log(transcript);
          //console.log("----------"+i+"------------");

          //add to the array
          var comicObject = {title: title, transcript: transcript, image: imageURL};
          console.log(comicObject);
          comics.push(comicObject);
        }
      });

    }

  }
});

//helper functions
//easier request returns a string
var requestStuff = function(stuff){
  request({url:stuff, json:true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      //console.log(body);
      //console.log(Object.prototype.toString.call(body));

      //get the object
      var thingThatNeedsToBeReturned = body;
      var transcript = thingThatNeedsToBeReturned["transcript"];
      return transcript;
    }
  });
};

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
