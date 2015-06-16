//modules
var http = require('http');
var express = require('express');
var request = require('request');
var redisClient = require('redis').createClient();

//push a comic to redis, given a number. This returns a stringy json version
var pushComic = function(number)
{
  var url = "http://xkcd.com/"+number+"/info.0.json";
  request({url:url, json:true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var comic = {num: body.num, name: body.safe_title, image: body.img, transcript: body.transcript};
      var stringyComic = JSON.stringify(comic);
      console.log(comic.num+ ": ✓");

      //push to redis
      redisClient.lpush('comics3', number, stringyComic);
    }
  });
};

//initialize the database
var initialize = function(){
  //find the number of the newest comic
  var newestUrl = "http://xkcd.com/info.0.json";

  request({url:newestUrl, json:true}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var max = body.num;
      console.log("Max: "+max);

      //loop over every number up to the max, and add that number's comic to the database
      for(var i = 1; i < max; i++)
      {
        pushComic(i);
      }
    }
  });
};

initialize();
