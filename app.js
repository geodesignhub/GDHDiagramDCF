var express = require("express");
var req = require('request');
var async = require('async');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var ejs = require('ejs');
var csrf = require('csurf');
var app = express();
app.set('view engine', 'ejs');
// app.use(express.static(__dirname + '/views'));
app.use('/assets', express.static('static'));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());
app.use(csrf({ cookie: true }));

app.get('/', function(request, response) {
    var opts = {};
    if (request.query.apitoken && request.query.projectid && request.query.diagramid) {
        var baseurl = 'https://www.geodesignhub.com/api/v1/projects/';
        // var baseurl = 'http://local.test:8000/api/v1/projects/';
        var apikey = request.query.apitoken;
        var cred = "Token " + apikey;
        var projectid = request.query.projectid;
        var diagramid = request.query.diagramid;
        var diagramdetailurl = baseurl + projectid + '/diagrams/' + diagramid + '/';
        var systemsurl = baseurl + projectid + '/systems/';

        var URLS = [diagramdetailurl, systemsurl];

        async.map(URLS, function(url, done) {
            req({
                url: url,
                headers: {
                    "Authorization": cred,
                    "Content-Type": "application/json"
                }
            }, function(err, response, body) {
                if (err || response.statusCode !== 200) {
                    return done(err || new Error());
                }
                return done(null, JSON.parse(body));
            });
        }, function(err, results) {
            if (err) return response.sendStatus(500);

            var diagramdetail = results[0];
            var systemdetailurl = baseurl + projectid + '/systems/' + diagramdetail['sysid'] + '/';

            var sURls = [systemdetailurl];

            async.map(sURls, function(url, done) {
                req({
                    url: url,
                    headers: {
                        "Authorization": cred,
                        "Content-Type": "application/json"
                    }
                }, function(err, response, body) {
                    if (err || response.statusCode !== 200) {
                        return done(err || new Error());
                    }
                    return done(null, JSON.parse(body));
                });
            }, function(err, sysdetails) {
                if (err) return response.sendStatus(500);

                opts = {
                    "csrfToken": request.csrfToken(),
                    "apitoken": request.query.apitoken,
                    "projectid": request.query.projectid,
                    "status": 1,
                    "diagramdetail": JSON.stringify(results[0]),
                    "systems": JSON.stringify(results[1]),
                    "systemdetail": JSON.stringify(sysdetails[0]),
                };
                response.render('assetanalysis', opts);
            });

        });

    } else {
        opts = { 'csrfToken': request.csrfToken(), 'systemdetail': '0', 'apitoken': '0', 'projectid': '0', "diagramdetail": '0', 'systems': '0' };
        response.render('assetanalysis', opts);
    }

});



app.listen(process.env.PORT || 5001);