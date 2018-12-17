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
var redisclient = require('redis').createClient(process.env.REDIS_URL || {
    host: '127.0.0.1',
    port: 6379
});
app.use(cookieParser());
app.use(csrf({
    cookie: true
}));

app.post('/setdefaults', function (request, response) {
    var projectid = request.body.projectid;
    var diagramid = request.body.diagramid;
    var capex = request.body.capex;
    var acf = request.body.acf;
    var opex = request.body.opex;
    var asga = request.body.asga;
    var capex_start = request.body.capex_start;
    var capex_end = request.body.capex_end;
    var acf_start = request.body.acf_start;

    const key = projectid + '-' + diagramid;
    // console.log(key, { "capex": capex, "acf": acf, "opex": opex,"asga":asga })
    redisclient.set(key, JSON.stringify({
        "capex": capex,
        "acf": acf,
        "opex": opex,
        "asga": asga,
        "capex_start": capex_start,
        "capex_end": capex_end,
        "acf_start": acf_start,
    }));

    response.contentType('application/json');
    response.send({
        "status": 1
    });
});
app.get('/', function (request, response) {
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

        async.map(URLS, function (url, done) {
            req({
                url: url,
                headers: {
                    "Authorization": cred,
                    "Content-Type": "application/json"
                }
            }, function (err, response, body) {
                if (err || response.statusCode !== 200) {
                    return done(err || new Error());
                }
                return done(null, JSON.parse(body));
            });
        }, function (err, results) {
            if (err) return response.sendStatus(500);

            var diagramdetail = results[0];
            var systemdetailurl = baseurl + projectid + '/systems/' + diagramdetail['sysid'] + '/';

            var sURls = [systemdetailurl];

            async.map(sURls, function (url, done) {
                req({
                    url: url,
                    headers: {
                        "Authorization": cred,
                        "Content-Type": "application/json"
                    }
                }, function (err, response, body) {
                    if (err || response.statusCode !== 200) {
                        return done(err || new Error());
                    }
                    return done(null, JSON.parse(body));
                });
            }, function (err, sysdetails) {
                if (err) return response.sendStatus(500);


                var rediskey = projectid + "-" + diagramid;
                async.map([rediskey], function (rkey, done) {

                        redisclient.get(rkey, function (err, results) {
                            if (err || results == null) {
                                return done(null, JSON.stringify({
                                    "capex": "0",
                                    "opex": "0",
                                    "asga": "0",
                                    "acf": "0",
                                    "capex_start": "0",
                                    "capex_end": "1",
                                    "acf_start": "0",
                                }));
                            } else {
                                return done(null, results);
                            }
                        });
                    },
                    function (error, op) {
                        //only OK once set
                        if (err) return response.sendStatus(500);
                        op = JSON.parse(op);
                        
                        opts = {
                            "csrfToken": request.csrfToken(),
                            "apitoken": request.query.apitoken,
                            "projectid": request.query.projectid,
                            "status": 1,
                            "defaultvalues": JSON.stringify(op),
                            "diagramid": diagramid,
                            "diagramdetail": JSON.stringify(results[0]),
                            "systems": JSON.stringify(results[1]),
                            "systemdetail": JSON.stringify(sysdetails[0]),
                        };
                        response.render('assetanalysis', opts);
                    });

            });

        });

    } else {
        opts = {
            'csrfToken': request.csrfToken(),
            'systemdetail': '0',
            'apitoken': '0',
            'projectid': '0',
            "diagramdetail": '0',
            'systems': '0'
        };
        response.render('assetanalysis', opts);
    }

});



app.listen(process.env.PORT || 5001);