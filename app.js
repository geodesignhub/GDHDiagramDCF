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

    const projectid = request.body.projectid;
    const diagramid = request.body.diagramid;
    const capex = request.body.capex;
    const acf = request.body.acf;
    const opex = request.body.opex;
    const asga = request.body.asga;
    const capex_start = request.body.capex_start;
    const capex_end = request.body.capex_end;
    const acf_start = request.body.acf_start;
    const asset_details = JSON.loads(request.body.asset_details);

    const key = projectid + '-' + diagramid;

    
    redisclient.set(key, JSON.stringify({
        "capex": capex,
        "acf": acf,
        "opex": opex,
        "asga": asga,
        "capex_start": capex_start,
        "capex_end": capex_end,
        "acf_start": acf_start,
        "asset_details":asset_details
    }));

    response.contentType('application/json');
    response.send({
        "status": 1
    });
});
app.get('/', function (request, response) {
    var opts = {};
    // var baseurl = 'https://www.geodesignhub.com/api/v1/projects/';
    var baseurl = 'http://local.test:8000/api/v1/projects/';
    if (request.query.apitoken && request.query.projectid && request.query.diagramid) {

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
                                    "asset_type": {}
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

    } else if (request.query.apitoken && request.query.projectid && request.query.synthesisid && request.query.cteamid) {

        var apikey = request.query.apitoken;
        var cred = "Token " + apikey;
        var projectid = request.query.projectid;
        var cteamid = request.query.cteamid;
        var synthesisid = request.query.synthesisid;
        var synprojectsurl = baseurl + projectid + '/cteams/' + cteamid + '/' + synthesisid + '/';
        var timelineurl = baseurl + projectid + '/cteams/' + cteamid + '/' + synthesisid + '/timeline/';
        var systemsurl = baseurl + projectid + '/systems/';
        var boundsurl = baseurl + projectid + '/bounds/';
        var boundaryurl = baseurl + projectid + '/boundaries/';
        var syndiagramsurl = baseurl + projectid + '/cteams/' + cteamid + '/' + synthesisid + '/diagrams/';
        var projecturl = baseurl + projectid + '/';
        var URLS = [synprojectsurl, boundsurl, timelineurl, systemsurl, projecturl, syndiagramsurl, boundaryurl];

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

            var sURls = [];
            var systems = results[3];
            for (x = 0; x < systems.length; x++) {
                var curSys = systems[x];
                var systemdetailurl = baseurl + projectid + '/systems/' + curSys['id'] + '/';
                sURls.push(systemdetailurl);
            }

            var syn_diag_list = results[5];

            var redis_keys = [];
            for (var i = syn_diag_list['diagrams'].length - 1; i >= 0; i--) {
                const cur_key = projectid + "-" + syn_diag_list['diagrams'][i]
                redis_keys.push(cur_key);
            }

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
                var timeline = results[2]['timeline'];

                var keyDetails = {};

                async.map(redis_keys, function (rkey, done) {
                        redisclient.get(rkey, function (err, redis_results) {

                            if (err || redis_results == null) {
                                return done(null, {
                                    "key": rkey,
                                    "capex": "0",
                                    "opex": "0",
                                    "asga": "0",
                                    "acf": "0",
                                    "capex_start": "0",
                                    "capex_end": "1",
                                    "acf_start": "0",
                                    "asset_type": {}
                                });
                            } else {
                                return done(null, redis_results);
                            }
                        });
                    },
                    function (error, op) {
                        //only OK once set

                        if (err) return response.sendStatus(500);


                        opts = {
                            "csrfToken": request.csrfToken(),
                            "apitoken": request.query.apitoken,
                            "projectid": request.query.projectid,
                            "status": 1,
                            "design": JSON.stringify(results[0]),
                            "bounds": JSON.stringify(results[1]),
                            "systems": JSON.stringify(results[3]),
                            "timeline": JSON.stringify(timeline),
                            "projectdetails": JSON.stringify(results[4]),
                            "syndiagrams": JSON.stringify(results[5]),
                            "boundaries": JSON.stringify(results[6].geojson),
                            "systemdetail": JSON.stringify(sysdetails),
                            "saved_diagram_details": JSON.stringify(op)
                        };
                        response.render('investmentanalysis', opts);
                    });
            });
        });
    }

});



app.listen(process.env.PORT || 5001);