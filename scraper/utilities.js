/*
  The way shit is parsed by xml2js is that, if there is nothing
  in the section, it is undefined, if there is one thing it is
  an object, and if there are multiple things it becomes an array.

  To make parsing simpler, this just makes everything an array.
*/
var getArrayOfObjects = function (objects) {
  // Note: This is a fascinating line of code (below): here we access
  // the prototype of Object, which lets us use get the toString method,
  // and then call the toString method on whatever object we have passed in.
  // Thus, while doing [string].toString would have just given us the string,
  // [Object].toString() gives us the type of the object in the format '[object [objectType]]'
  var objectsType = Object.prototype.toString.call(objects);
  if (objectsType === '[object Undefined]') {
    return new Array();
  } else if (objectsType === '[object Object]') {
    return [objects];
  } else { 
    // note maybe we could make this more robust by explicitly 
    // separating arrays and unexpected results - for now dunt feel like it =P
    return objects;
  }
}

/*
  This function is similar to getArrayOfObjects, except that it handles single objects:
  If an object is empty it returns an empty string, otherwise it returns the object.
*/
var getObject = function (object) {
  if (Object.prototype.toString.call(object) === '[object Object]') {
    return "";
  } else {
    return object;
  }
}

if (typeof exports !== "undefined") {
  exports.getArrayOfObjects = getArrayOfObjects;
  exports.getObject = getObject;
}
