var http = require('http')
  , xml2js = require('xml2js')
  , utils = require('./utilities')
  , fs = require('fs')
  , $ = require('jquery');
  // , data = require('./public/javascripts/data')
  //, Course = require('./models/Course');

// var subjectCodes = ['EARTHSCI'];//d1ata.subject_codes;

// var subjectCodes = [
//   'EARTHSCI', 'EARTHSYS', 'EEES', 'ENERGY', 'ENVRES', 'EESS', 'GES', 'GEOPHYS', 'ENVRINST', 'EDUC', 'AA',
//   'BIOE', 'CHEMENG', 'CEE', 'CME', 'CS', 'EE', 'ENGR', 'MS%26E', 'MATSCI', 'ME', 'SCCM', 'AFRICAAM', 'AMELANG',
//   'AFRICAST', 'AMSTUD', 'ANTHRO', 'APPPHYS', 'ARCHLGY', 'ARTHIST', 'ARTSTUDI', 'ASNAMST', 'ASNLANG', 'ASTRNMY',
//   'ATHLETIC', 'BIO', 'BIOPHYS', 'CATLANG', 'CHEM', 'CHICANST', 'CHINGEN', 'CHINLANG', 'CHINLIT', 'CLASSART',
//   'CLASSGEN', 'CLASSGRK', 'CLASSHIS', 'CLASSLAT', 'COMM', 'COMPLIT', 'CSRE', 'DANCE', 'DLCL', 'DRAMA', 'EASTASN',
//   'ECON', 'ENGLISH', 'EFSLANG', 'ETHICSOC', 'FEMST', 'FILMPROD', 'FILMSTUD', 'FRENGEN', 'FRENLANG', 'FRENLIT',
//   'GERGEN', 'GERLANG', 'GERLIT', 'HISTORY', 'HPS', 'HUMBIO', 'HUMSCI', 'ILAC', 'IBERLANG', 'IIS', 'HUMNTIES',
//   'IPS', 'INTNLREL', 'ITALGEN', 'ITALLANG', 'ITALLIT', 'JAPANGEN', 'JAPANLNG', 'JAPANLIT', 'JEWISHST', 'KORGEN',
//   'KORLANG', 'LATINAM', 'LINGUIST', 'MCS', 'MATH', 'MEDVLST', 'MTL', 'MUSIC', 'NATIVEAM', 'PHIL', 'PHYSICS',
//   'POLISCI', 'PORTLANG', 'PSYCH', 'PUBLPOL', 'RELIGST', 'REES', 'STS', 'SLAVGEN', 'SLAVLANG', 'SLAVLIT', 'SOC',
//   'SPANLANG', 'ILAC', 'SPECLANG', 'STATS', 'SYMSYS', 'TIBETLNG', 'URBANST', 'ACCT', 'MGTECON', 'FINANCE',
//   'GSBGEN', 'HRMGT', 'MKTG', 'OIT', 'OB', 'POLECON', 'STRAMGT', 'LAW', 'LAWGEN', 'ANES', 'BIOC', 'BIOMEDIN',
//   'CBIO', 'CTS', 'CSB', 'COMPMED', 'DERM', 'DBIO', 'FAMMED', 'GENE', 'HRP', 'IMMUNOL', 'MED', 'INDE', 'MI',
//   'MCP', 'NBIO', 'NENS', 'NEPR', 'NSUR', 'OBGYN', 'OPHT', 'ORTHO', 'OTOHNS', 'PATH', 'PEDS', 'PSYC', 'RADO',
//   'RAD', 'STEMREM', 'SBIO', 'SURG', 'UROL', 'CTL', 'IHUM', 'PWR', 'MLA'
// ];

// DEBUG
var subjectCodes = ['MATH'];

var lectureCode = 'LEC';

var allCourses = [];

var index = 0
  , coursesCounter = 0
  , sectionsCounter = 0
  , schedulesCounter = 0;

var queryForSubject = function (i) {
  console.log('Begin querying subject ' + subjectCodes[i]);

  var options = {
    host: 'explorecourses.stanford.edu',
    path: '/search?view=xml-20130201&catalog=&page=0&q=' + subjectCodes[i]
      + '&filter-catalognumber-' + subjectCodes[i] + '=on&filter-coursestatus-Active=on'
      + '&filter-term-Autumn=on' // Restricts to just Autumn Courses
  };

  // console.log(options.host + options.path);

  var output = "";

  http.get(options, function (res) {
    res.setEncoding('UTF8');
    res.on('data', function (chunk) {
      output += chunk;
    });
    res.on('end', function () {
      // console.log("About to begin parsing");
      (new xml2js.Parser()).parseString(output, function (err, result) {
        // console.log("Parsed");
        if (err !== null) {
          console.log("An error occured: " + err);
        } else {
          // console.log("About to parse");
          parse_result(result);
        }
      });
    });
  }).on('error', function (e) {
    console.log("Got error: " + e.message);
    console.log(e);
  });
}

var checkBeginNext = function () {
  //console.log("Checking next");
  if (coursesCounter == 0 && sectionsCounter == 0 && schedulesCounter == 0) {
    console.log('Done querying for subject ' + subjectCodes[index++]);
    if (index < subjectCodes.length) {
      queryForSubject(index);
    } else {
      console.log('All courses queried! Now exiting...');
      // console.log(allCourses);
      fs.writeFile("./coursesElem.js",
                   "var classes = " + JSON.stringify(allCourses) + ";initialize();",
                   function (err) {
        if (err)
          console.log("Err writing file: " + err);
        else
          console.log("File written successfully");
        process.exit(0);
      });
    }
  }
}

function parse_result (result) {
  // console.log("parsing");
  var courses = utils.getArrayOfObjects(result['xml']['courses'][0]['course']);
  coursesCounter = courses.length;

  checkBeginNext ();
  courses.map(function(course) {
    // console.log(" Mapping Courses: Course COunter is " + coursesCounter);
    var sections = utils.getArrayOfObjects(course['sections'][0]['section']);

    sectionsCounter += sections.length;
    coursesCounter --;

    checkBeginNext ();

    sections.map (function (section) {
      sectionsCounter --;
      /*if (section['component'] !== lectureCode) {
        checkBeginNext();
        return;
      }*/

      var schedules = utils.getArrayOfObjects(section['schedules'][0]['schedule']);

      schedulesCounter += schedules.length;

      checkBeginNext();

      schedules.map(function(schedule) {
        var location = schedule['location'][0];

        // This checks if there is no location or no days associated with a course, meaning it
        // will never be displayed and is thus wasted space.
        /*if (Object.prototype.toString.call(location) === '[object Object]' || days === "") {
          --schedulesCounter;
          checkBeginNext();
          return;
        }*/

        var newCourse = {};
        newCourse.subject = course['subject'][0];
        newCourse.code = course['code'][0];
        newCourse.title = course['title'][0];
        newCourse.description = course['description'][0];
        newCourse.units = course['unitsMax'][0]

        if (typeof course['gers'][0] === "string")
          newCourse.gers = course['gers'][0].split(', ');
        else
          newCourse.gers = [];

        newCourse.instructors = [];
        newCourse.days = [];

        var instructors = utils.getArrayOfObjects(section['instructor']);
        instructors.map(function(instructor) {
          // console.log("pushing instructors");
          newCourse.instructors.push(instructor['name'][0]);
        });

        var days = utils.getObject(schedule['days'][0]).trim();
        if (days.length > 0) {
          days.split(/\W+/).map(function(day) {
            newCourse.days.push(day);
          });
        }

        newCourse.startTime = schedule['startTime'][0];
        newCourse.endTime = schedule['endTime'][0];
        newCourse.startDate = schedule['startDate'][0];
        newCourse.endDate = schedule['endDate'][0];

        newCourse.location = location;

        // This seems to be true for a bunch of random project courses that we don't want to include
        // if (typeof newCourse.description !== 'object') {
          allCourses.push (newCourse);
        // }

        --schedulesCounter;
        // console.log("No more schedules...");
        checkBeginNext ();
      }); // schedules
    }); // sections
  }); // courses
}

queryForSubject(0);
