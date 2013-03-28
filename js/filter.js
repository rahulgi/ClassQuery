var filterFcns = {};

/* Filter Function entry object type:
{
  function fcn;
  {} filters;
  int elemIndex
}
*/

function printClasses (classes) {
  var classesContent = "";
  for (var i = 0; i < classes.length; i ++) {
    classesContent += "<span><strong>" + classes[i].code + ":</strong> " + classes[i].title  + "</span></br><span>" + classes[i].description + "</span><hr class='featurette-divider'>";
  }
  $("#filteredClasses").html(classesContent);
}

/* Create a new copy of the classes list and apply every filter to it. */
function filterClasses () {
  var classesCpy = classes.slice(0);
  for (x in filterFcns) {
    filterFcns[x].fcn(classesCpy, filterFcns[x].filters);
  }
  printClasses(classesCpy);
}



function buildSubjectFilter (id) {
  filterFcns[id] = {
    fcn: function (classes, filters) {
      var regex = new RegExp(arrayFromObject(filters).join("|"));
      for (var i = 0; i < classes.length; i ++) {
        if (!regex.test(classes[i].subject))
          classes.splice(i, 1);
      }
    },
    filters: {},
    elemIndex: 0
  };
}

function buildSubjectSelector (index) {
  var toReturn =  
    '<div class="filter-elem" id="' + index + '">\
      <span>Subject:</span></br>\
      <select class="selectSubject">\
        <option value=""></option>\
      </select>\
      </div></br>\
    <div class="filter-elem">\
    </div>';
  return toReturn;
}

var filterSelectorBuilders = {
  subject: function () {
    var id = (new Date()).getTime();
    buildSubjectFilter(id);
    var index = filterFcns[id].elemIndex ++;
    $("#filters").append(
      '<div class="filter-column" id="' + id + '">\
        ' + buildSubjectSelector(index) + '\
      </div>');
    recalculateWidth();
    populateSubjectDropdown(id, 0);
    $("#" + id).children("#" + index).children(".selectSubject").on("change", function (eventObj) {
      filterFcns[id].filters[index] = $(this).val();
      filterClasses();
    });
  }
};

function fcnBuilder (id, index) {
  alert (index);
  var toReturn = function (eventObj) {
    alert (index);
    filterFcns[id].filters[index] = $(this).val();
  };
  return toReturn;
}

function populateSubjectDropdown (id, index) {
  var elem = $("#" + id).children("#" + index).children(".selectSubject");
  for (var i = 0; i < subjectCodes.length; i ++) {
    elem.append("<option value='" + subjectCodes[i] + "'>" + subjectCodes[i] + "</option>");
  }
}

function recalculateWidth () {
  var width = 0;
  $("#filters").children().each(function() {
    width += $(this).outerWidth(true);
  });
  if (width > 940)
    $("#container").width(width);
}

/* Helper function that creates an array with the values in the object. */
function arrayFromObject (obj) {
  var i = 0;
  var toReturn = [];
  for (x in obj) 
    toReturn[i++] = obj[x];
  return toReturn;
}