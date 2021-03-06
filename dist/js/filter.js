var filterFcns = {};

/* Filter Function entry object type:
{
  function fcn;
  {} filters;
  int elemIndex
  int elemCount
}
*/

// TODO Fix Filter-Elem id's to be classes -- currently only unique within column

function printClasses (classes) {
  var classesContent = "";
  if (_.values(filterFcns).length > 0) {
    for (var i = 0; i < classes.length; i ++) {
      if (classes[i].present) {
        classesContent += "<span><a target='_blank' href='http://explorecourses.stanford.edu/search?view=catalog&filter-coursestatus-Active=on&page=0&catalog=&academicYear=&q="
        + classes[i].subject + classes[i].code + "&collapse='>" +
        "<strong>" + classes[i].subject + " " + classes[i].code + ":</strong> " + classes[i].title  + "</span></a></br>" +
        "<span>" + classes[i].description + "</span></br>" + "<span class='muted'>";
        if (classes[i].minUnits === classes[i].maxUnits)
          classesContent += classes[i].minUnits;
        else
          classesContent += classes[i].minUnits + "-" + classes[i].maxUnits;
        classesContent += " Units | " + classes[i].termsOffered.join(', ');
        if (classes[i]['gers'].join().length > 0) // This is a hack b/c gers never has length 0 for some reason which I'm currently too lazy to investigate
          classesContent += " | " + classes[i]['gers'].join (', ');
        classesContent += "</span></br>";
        classesContent += "<hr class='featurette-divider'>";
      }
    }
  }
  $("#filteredClasses").empty().html(classesContent);
  hideLoader();
};

function printCurrentQuery () {
  var currentQuery = 'Currently querying for ';
  var queries = [];
  for (fcn in filterFcns) {
    var filters = _.values(filterFcns[fcn].filters);
    if (filters.length > 0)
      queries.push(filterFcns[fcn].type + _.values(filterFcns[fcn].filters).join(' or '));
  }

  if (queries.length > 0)
    currentQuery += 'classes ' + queries.join(' and ') + '.';
  else
    currentQuery += 'nothing. <span class="muted">Click <a href="#" onClick="sampleQuery()">here</a> for a sample query.</span>';

  $("#currentQuery").html(currentQuery);
};

/* Create a new copy of the classes list and apply every filter to it. */
function filterClasses () {
  showLoader();
  for (var i = 0; i < classes.length; i++)
    classes[i].present = true;
  for (x in filterFcns) {
    filterFcns[x].fcn(classes, filterFcns[x].filters);
  }
  printClasses(classes);
  printCurrentQuery();
}

function showLoader() {
  $('#filteredClasses').hide();
  $('#loader').show();
}

function hideLoader() {
  $('#loader').hide();
  $('#filteredClasses').show();
}

function buildKeywordFilter (id) {
  filterFcns[id] = {
    fcn: function (classes, filters) {
      var regex = new RegExp(arrayFromObject(filters).join("|"), "i");
      for (var i = 0; i < classes.length; i ++) {
        var matched = false;
        if (regex.test(_.values(classes[i]).join('')) || regex.test(_.values(classes[i]).join(' ')))
          matched = true;
        if (!matched) {
          classes[i].present = false;
        }
      }
    },
    filters: {},
    type: 'using the keyword ',
    elemIndex: 0
  };
}


function buildSubjectFilter(id) {
  filterFcns[id] = {
    fcn: function (classes, filters) {
      var regex = new RegExp("^(" + arrayFromObject(filters).join("|") + ")$");
      for (var i = 0; i < classes.length; i ++) {
        if (!regex.test(classes[i].subject)) {
          classes[i].present = false;
        }
      }
    },
    filters: {},
    type: 'where the subject is ',
    elemIndex: 0
  };
}

function buildGERFilter(id) {
  filterFcns[id] = {
    fcn: function (classes, filters) {
      var regex = new RegExp("(GER:)?(" + arrayFromObject(filters).map(function(elem)
        {
          return elem.replace(":", "");
        }).join("|") + ")");
      for (var i = 0; i < classes.length; i ++) {
        var matched = false;
        for (var x = 0; x < classes[i]['gers'].length; x++) {
          if (regex.test(classes[i]['gers'][x])) {
            matched = true;
            break;
          }
        }
        if (!matched) {
          classes[i].present = false;
        }
      }
    },
    filters: {},
    type: 'which satisfy the ger ',
    elemIndex: 0
  };
}

function buildUnitsFilter (id) {
  filterFcns[id] = {
    fcn: function(classes, filters) {
      for (var i = 0; i < classes.length; ++i) {
        var matched = false;
        for (var x in filters) {
          if ((filters[x] == '>5' && classes[i].maxUnits > 5) || (classes[i].maxUnits >= filters[x] && classes[i].minUnits <= filters[x]))
            matched = true;
            break;
        }
        if (!matched)
          classes[i].present = false;
      }
    },
    filters: {},
    type: 'which have a unit count of ',
    elemIndex: 0
  };
};

function buildTermFilter (id) {
  filterFcns[id] = {
    fcn: function(classes, filters) {
      for (var i = 0; i < classes.length; ++i) {
        var matched = false;
        for (var x in filters) {
          if (classes[i].termsOffered.indexOf(filters[x]) > -1) {
            matched = true;
            break;
          }
        }
        if (!matched)
          classes[i].present = false;
      }
    },
    filters: {},
    type: 'where the term is ',
    elemIndex: 0
  };
};


function buildSubjectSelector (index) {
  var toReturn =
    '<div class="filter-elem" id="' + index + '">\
      <button class="close" onClick="onElemRemoved(this);">&times;</button>\
      <span>Subject:</span></br>\
      <select onChange="onElemValueChanged(this)" class="selector">\
        <option value=""></option>\
      </select>\
      </div></br>\
    <div class="filter-elem" onClick="buildOrSelector(this, buildSubjectSelector, subjectCodes)">\
    Add OR Filter</div>';
  return toReturn;
}


function buildGERSelector (index) {
  var toReturn =
    '<div class="filter-elem" id="' + index + '">\
      <button class="close" onClick="onElemRemoved(this);">&times;</button>\
      <span>GER:</span></br>\
      <select onChange="onElemValueChanged(this)" class="selector">\
        <option value=""></option>\
      </select>\
      </div></br>\
    <div class="filter-elem" onClick="buildOrSelector(this, buildGERSelector, gers)">\
    Add OR Filter</div>';
  return toReturn;
}


function buildKeywordInput (index) {
  var toReturn =
    '<div class="filter-elem" id="' + index + '">\
      <button class="close" onClick="onElemRemoved(this);">&times;</button>\
      <span>Keyword:</span></br>\
      <input onFocusOut="onElemValueChanged(this);"></input></br>\
      <button style="float:right;">Search</button>\
    </div></br>\
    <div class="filter-elem" onClick="buildOrElem(this, buildKeywordInput);">\
    Add OR Filter</div>';
  return toReturn;
}

function buildUnitsSelector(index) {
  var toReturn =
    '<div class="filter-elem" id="' + index + '">\
      <button class="close" onClick="onElemRemoved(this);">&times;</button>\
      <span>Units:</span></br>\
      <select onChange="onElemValueChanged(this)" class="selector">\
        <option value=""></option>\
      </select>\
      </div></br>\
    <div class="filter-elem" onClick="buildOrSelector(this, buildUnitsSelector, units)">\
    Add OR Filter</div>';
  return toReturn;
}

function buildTermSelector(index) {
  var toReturn =
    '<div class="filter-elem" id="' + index + '">\
      <button class="close" onClick="onElemRemoved(this);">&times;</button>\
      <span>Term:</span></br>\
      <select onChange="onElemValueChanged(this)" class="selector">\
        <option value=""></option>\
      </select>\
      </div></br>\
    <div class="filter-elem" onClick="buildOrSelector(this, buildTermSelector, terms)">\
    Add OR Filter</div>';
  return toReturn;
}

function buildOrElem (elem, elemBuilder) {
  var parent = $(elem).parent();
  var id = parent.attr('id');
  var index = filterFcns[id].elemIndex ++;
  filterFcns[id].elemCount ++;
  $("#" + id).append(elemBuilder(index));
  elem.remove();
  return {"id": id, "index": index};
}

function buildOrSelector (elem, builder, arr) {
  var newElem = buildOrElem(elem, builder);
  populateSelectorDropdown(newElem.id, newElem.index, arr);
}


var filterSelectorBuilders = {
  subject: function () {
    var id = buildFilterElem(buildSubjectFilter, buildSubjectSelector);
    populateSelectorDropdown(id, 0, subjectCodes);
    return id;
  },
  keyword: function () {
    buildFilterElem(buildKeywordFilter, buildKeywordInput);
    return id;
  },
  gers: function () {
    var id = buildFilterElem(buildGERFilter, buildGERSelector);
    populateSelectorDropdown(id, 0, gers);
    return id;
  },
  units: function() {
    var id = buildFilterElem(buildUnitsFilter, buildUnitsSelector);
    populateSelectorDropdown(id, 0, units);
    return id;
  },
  term: function() {
    var id = buildFilterElem(buildTermFilter, buildTermSelector);
    populateSelectorDropdown(id, 0, terms);
    return id;
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
    filterFcns[id].elemCount = 1;
    recalculateWidth();
    return id;
}

function onElemValueChanged (elem) {
  var id = $(elem).parent().parent().attr('id');
  var index = $(elem).parent().attr('id');
  filterFcns[id].filters[index] = $(elem).val();
  filterClasses();
}


function onElemRemoved (elem) {
  var id = $(elem).parent().parent().attr('id');
  var index = $(elem).parent().attr('id');
  delete filterFcns[id].filters[index];
  if (--filterFcns[id].elemCount == 0) {
    $(elem).parent().parent().remove();
    delete filterFcns[id];
    recalculateWidth();
  }
  else {
    $(elem).parent().next().remove();
    $(elem).parent().remove();
  }
  filterClasses();
}


function populateSelectorDropdown (id, index, arr) {
  var elem = $("#" + id).children("#" + index).children(".selector");
  for (var i = 0; i < arr.length; i ++) {
    elem.append("<option value='" + arr[i] + "'>" + arr[i] + "</option>");
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

function sampleQuery () {
  var gerElemId = filterSelectorBuilders['gers']();
  $("#" + gerElemId + " select").val('DB-Hum').change();
  var ecElemId = filterSelectorBuilders['gers']();
  $("#" + ecElemId + " select").val('EC-Gender').change();
  $("#" + ecElemId + " .filter-elem").click();
  $("#" + ecElemId + " #1 select").val('EC-AmerCul').change();
  $("#" + ecElemId + " .filter-elem").click();
  $("#" + ecElemId + " #2 select").val('EC-EthicReas').change();
  var termElemId = filterSelectorBuilders['term']();
  $("#" + termElemId + " select").val('Spring').change();
}
