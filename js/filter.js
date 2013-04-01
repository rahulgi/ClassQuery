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


function buildKeywordFilter (id) {
  filterFcns[id] = {
    fcn: function (classes, filters) {
      var regex = new RegExp(arrayFromObject(filters).join("|"));
      for (var i = 0; i < classes.length; i ++) {
        var matched = false;
        for (x in classes[i]) {
          if (regex.test(classes[i][x])) {
            matched = true;
            break;
          }
        }
        if (!matched) {
          classes.splice(i, 1);
          i--;
        }
      }
    },
    filters: {},
    elemIndex: 0
  };
}


var buildSubjectFilter = function (id) {
  filterFcns[id] = {
    fcn: function (classes, filters) {
      var regex = new RegExp(arrayFromObject(filters).join("|"));
      for (var i = 0; i < classes.length; i ++) {
        if (!regex.test(classes[i].subject)) {
          classes.splice(i, 1);
          i--;
        }
      }
    },
    filters: {},
    elemIndex: 0
  };
}


var buildSubjectSelector = function (index) {
  var toReturn =  
    '<div class="filter-elem" id="' + index + '">\
      <span>Subject:</span></br>\
      <select onChange="onElemValueChanged(this)" class="selectSubject">\
        <option value=""></option>\
      </select>\
      </div></br>\
    <div class="filter-elem" onClick="buildOrSubjectSelector(this)">\
    Add OR Filter</div>';
  return toReturn;
}


var buildKeywordInput = function (index) {
  var toReturn = 
    '<div class="filter-elem" id="' + index + '">\
      <span>Keyword:</span></br>\
      <input onFocusOut="onElemValueChanged(this);"></input></br>\
      <button style="float:right;">Search</button>\
    </div></br>\
    <div class="filter-elem" onClick="buildOrElem (this, buildKeywordInput);">\
    Add OR Filter</div>';
  return toReturn;
}


function buildOrElem (elem, elemBuilder) {
  var parent = $(elem).parent();
  var id = parent.attr('id');
  var index = filterFcns[id].elemIndex ++;
  $("#" + id).append(elemBuilder(index));
  elem.remove();
  return {"id": id, "index": index};
}

function buildOrSubjectSelector (elem) {
  var newElem = buildOrElem(elem, buildSubjectSelector);
  populateSubjectDropdown(newElem.id, newElem.index);
}


var filterSelectorBuilders = {
  subject: function () {
    var id = buildFilterElem(buildSubjectFilter, buildSubjectSelector);
    populateSubjectDropdown(id, 0);
  },
  keyword: function () {
    buildFilterElem(buildKeywordFilter, buildKeywordInput);
  }
};

function buildFilterElem (buildFilterFcn, buildFilterElemFcn) {
  var id = (new Date()).getTime();
    buildFilterFcn(id);
    var index = filterFcns[id].elemIndex ++;
    $("#filters").append(
      '<div class="filter-column" id="' + id + '">\
        ' + buildFilterElemFcn(index) + '\
      </div>');
    recalculateWidth();
    return id;
}

function onElemValueChanged (elem) {
  var id = $(elem).parent().parent().attr('id');
  var index = $(elem).parent().attr('id');
  filterFcns[id].filters[index] = $(elem).val();
  filterClasses();
}


/*
function fcnBuilder (id, index) {
  var toReturn = function (eventObj) {
    filterFcns[id].filters[index] = $(this).val();
  };
  return toReturn;
}
*/

function populateSubjectDropdown (id, index) {
  var elem = $("#" + id).children("#" + index).children(".selectSubject");
  for (var i = 0; i < subjectCodes.length; i ++) {
    elem.append("<option value='" + subjectCodes[i] + "'>" + subjectCodes[i] + "</option>");
  }
}


/* Recalculates width of the filters block. This should never wrap, even if it forces scrolling. */
function recalculateWidth () {
  var width = 0;
  $("#filters").children().each(function() {
    width += $(this).outerWidth(true);
  });
//  if (width > 940)
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