importScripts('../js/turf.min.js');
importScripts('../js/moment.min.js');


function computeAreas(systemdetails, systems, timeline, startyear, numYears, saved_diagram_details) {
    var whiteListedSysName = ['HDH', 'LDH', 'IND', 'COM', 'COMIND', 'HSNG', 'HSG', 'MXD'];
    var systemdetails = JSON.parse(systemdetails);
    var systems = JSON.parse(systems);
    var timeline = JSON.parse(timeline);
    var startyear = parseInt(startyear);
    const sdd = JSON.parse(saved_diagram_details);
    var maxYearlyCost = 0;
    diagCosts = [];
    var number_of_years = numYears;

    var syslen = systems.length;
    var sysdetlen = systemdetails.length;

    for (var x = 0; x < syslen; x++) {
        var cSys = systems[x];
        var allDiagrams = cSys.diagrams;

        var allDiaglen = allDiagrams.length;

        var yeild;

        for (var y = 0; y < allDiaglen; y++) {
            var sysCost = 0;
            var cDiag = allDiagrams[y];

            var cDFeatlen = cDiag.features.length;
            if (cDFeatlen > 0) {
                var diagID = cDiag.features[0].properties.diagramid;
                var sysName = cDiag.features[0].properties.sysname;
                var diagName = cDiag.features[0].properties.description;
                var sysTag = cDiag.features[0].properties.systag;
                var cost_override = cDiag.features[0].properties.cost_override;
                var cost_override_type = cDiag.features[0].properties.cost_override_type;
            }
            var projectorpolicy = cDiag.features[0].properties.areatype;
            var totArea;
            var totAreaM;
            var totalCost = 0;
            var units = 0;

            if (projectorpolicy == 'policy') {
                totArea = 0;
            } else {
                try {
                    // bufArea = turf.buffer(cDiag, 0.0);
                    totAreaM = turf.area(cDiag);
                    totArea = totAreaM * 0.0001; // in hectares                    
                } catch (err) { //throw JSON.stringify(err)
                    // console.log(err);
                    totArea = 0;
                } // catch ends
            }

            if (whiteListedSysName.indexOf(sysName) >= 0) { // system is whitelisted
                if ((sysName === 'HDH') || (sysName === 'HSNG') || (sysName === 'HSG')) {
                    yeild = 10;
                } else if (sysName === 'MXD') {
                    yeild = 16;
                } else if (sysName === 'LDH') {

                    yeild = 12;
                } else if ((sysName === 'COM') || (sysName === 'COMIND') || (sysName === 'IND')) {
                    yeild = 18;
                }
            } else if ((sysTag === 'Large buildings, Industry, commerce')) { // system not whitelisted
                yeild = 16;
            } else if ((sysTag === 'Small buildings, low density housing')) { // system not whitelisted 

                yeild = 16;
            } else {

                yeild = 12;
            }


            var curDiagDetails = {
                'id': diagID,
                'title': diagName
            };
            var sd_details = {};
            for (let l1 = 0; l1 < sdd.length; l1++) {
                const element = sdd[l1];
                if (element['key'].split('-')[1] == diagID) {
                    sd_details = element;
                    break;
                }
            }


            for (var h = 0; h < sysdetlen; h++) {
                var cSys = systemdetails[h];
                var sName = cSys['sysname'];
                if (sName === sysName) {
                    sysCost = cSys['syscost'];
                    curDiagDetails['sysid'] = cSys['id'];
                    curDiagDetails['sysname'] = sName;
                }
            }

            // console.log(cost_override_type, cost_override,totalCost);
            const sd_capex = parseInt(sd_details['capex']);
            if (sd_capex == 0) {
                if (cost_override !== 0) {
                    if (cost_override_type == 'total') {
                        totalCost = cost_override;
                    } else {
                        totalCost = totArea * cost_override;
                    }
                } else {
                    totalCost = totArea * sysCost;
                }

            } else {
                totalCost = sd_capex;
            }

            // check if diagram existsin in timeline.
            var numYears = 0;
            if (parseInt(diagID) in timeline) {
                var start = moment(timeline[diagID].start).year();
                var end = moment(timeline[diagID].end).year();
                numYears = end - start;
                if (numYears == 1) {
                    numYears = 2;
                }
            } else {
                numYears = 2;
            }

            var capex_start = sd_details['capex_start'];
            var capex_end = sd_details['capex_end'];

            var numYears = capex_end - capex_start;
            // console.log(sd_details);

            // if the diagram exists get the number of years 
            // else default is 2

            curDiagDetails['totalInvestment'] = totalCost;
            curDiagDetails['investment'] = {};
            curDiagDetails['income'] = {};
            curDiagDetails['maintainence'] = {};
            curDiagDetails['yeild'] = yeild;


            yearlyCost = parseFloat(totalCost / numYears);
            maxYearlyCost = (yearlyCost > maxYearlyCost) ? yearlyCost : maxYearlyCost;
            var acf = parseInt(sd_details["acf"]);

            if (acf == 0) {
                acf = (yeild * totalCost) / 100;

            }
            // console.log(acf)

            // var lastIncome;
            for (var k4 = 0; k4 < numYears; k4++) {
                var sYear = (startyear + k4 + parseInt(capex_start));
                curDiagDetails['investment'][sYear] = yearlyCost;
            }
            var totalIncome = 0;
            for (var k = 0; k < number_of_years; k++) {
                // if (k == 0) {
                //     lastIncome = acf;
                // }
                // var incomeIncrease = (acf * 0.03);
                // var newIncome = incomeIncrease + lastIncome;
                var sYear = (startyear + k);
                curDiagDetails['income'][sYear] = acf;
                // curDiagDetails['income']['yearly'] = acf;
                totalIncome += acf;
                // lastIncome = newIncome;
            }
            // curDiagDetails['income']['total'] = totalIncome;
            var totalMaintainence = 0;
            // var threepercentMaintainece = -1 * yearlyCost * 0.03;
            var all_opex_asga = 0;

            const opex = parseInt(sd_details['opex']);
            const asga = parseInt(sd_details['asga']);

            if (opex === 0 && asga === 0) {
                all_opex_asga = yearlyCost * 0.03;
            } else {
                all_opex_asga = opex + asga;
            }


            // var lastIncome;
            for (var k7 = 0; k7 < number_of_years; k7++) {
                if (k7 < number_of_years - 1) {
                    var sYear = (startyear + k7);
                    curDiagDetails['maintainence'][sYear] = all_opex_asga;
                    totalMaintainence += all_opex_asga;
                }
            }
            curDiagDetails['area'] = totArea;
            // curDiagDetails['maintainence']['total'] = totalMaintainence;
            diagCosts.push(curDiagDetails);
        }
    }
    // console.log(diagCosts)
    // send investment
    self.postMessage({
        'output': JSON.stringify(diagCosts),
        'maxYearlyCost': maxYearlyCost,
    });

    // close the worker
    self.close();
}

self.onmessage = function (e) {
    computeAreas(e.data.systemdetails, e.data.systems, e.data.timeline, e.data.startyear, e.data.years, e.data.saved_diagram_details);
}