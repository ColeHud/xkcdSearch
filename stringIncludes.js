var string = "Hello world, my name is cole hudson. This is super cool.";

//string 'contains' helper function
String.prototype.contains = function(argument){
  var parent = this.toLowerCase();
  var argumentString = argument.toLowerCase();
  return (parent.indexOf(argumentString) > -1);
};

console.log(string.contains("World"));
