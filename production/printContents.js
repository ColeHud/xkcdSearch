//modules
var http = require('http');
var express = require('express');
var request = require('request');
var redisClient = require('redis').createClient();

//print all items
redisClient.lrange('comics', 0, -1, function (error, items) {
  items.forEach(function (item) {
    var comic = JSON.parse(item);
    console.log(comic.num);
  });
});
