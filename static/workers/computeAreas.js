importScripts('../js/turf.min.js');
importScripts('../js/moment.min.js');


function computeAreas(systemdetails, systems, startyear, numYears, saved_diagram_details, board_sequence) {
    var whiteListedSysName = ['HDH', 'LDH', 'IND', 'COM', 'COMIND', 'HSNG', 'HSG', 'MXD'];
    var systemdetails = JSON.parse(systemdetails);
    var systems = JSON.parse(systems);

    var startyear = parseInt(startyear);
    const sdd = JSON.parse(saved_diagram_details);
    const sequence = JSON.parse(board_sequence);
    // if (Object.entries(sequence['gantt_data']).length === 0 && sequence['gantt_data'].constructor === Object) {
    //     var seq = sequence['gantt_data']['data'];
    // }

    var timeline = {};
    try {
        var seq_data = sequence['gantt_data']['data'];

        for (let u7 = 0; u7 < seq_data.length; u7++) {
            const cur_seq = seq_data[u7];

            if (cur_seq.parent == 0 && Number.isInteger(cur_seq.id)) {
                timeline[cur_seq.id] = { "start": moment(cur_seq.start_date, "DD-MM-YYYY").year(), "end": moment(cur_seq.end_date, "DD-MM-YYYY").year() };
            }

        }
    } catch (err) {
        // console.log(err)
    }
    // console.log(timeline);
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


            var capex_start = sd_details['capex_start'];
            var capex_end = sd_details['capex_end'];
            var capex_num_years = capex_end - capex_start;
            // try {

            //     capex_num_years = capex_end - capex_start;
            // }
            // catch{
            //     capex_num_years = 2;
            // }
            // console.log(sd_details);
            // console.log(diagID,capex_start, capex_end, startyear);
            // if (capex_start == 0 && capex_end == 1) {
            if (parseInt(diagID) in timeline) {
                var diagram_start = timeline[diagID].start;
                var diagram_end = timeline[diagID].end;

                //         capex_start = (start - startyear);
                //         capex_num_years = (end - startyear);
                //         console.log(start, end, startyear)
                //         capex_num_years = end - start;
                //         if (capex_num_years == 1) {
                //             capex_num_years = 2;
                //         }
            } else {
                var diagram_start = startyear;
                var diagram_end = startyear + 2;
            }

            //         capex_num_years = 2;
            //     }
            // }
            // else {
            //     capex_num_years = capex_end - capex_start;
            // }
            // console.log(capex_start, capex_end, number_of_years);

            // if the diagram exists get the number of years 
            // else default is 2

            curDiagDetails['totalInvestment'] = totalCost;
            curDiagDetails['investment'] = {};
            curDiagDetails['income'] = {};
            curDiagDetails['maintainence'] = {};
            curDiagDetails['yeild'] = yeild;


            yearlyCost = parseFloat(totalCost / capex_num_years);
            maxYearlyCost = (yearlyCost > maxYearlyCost) ? yearlyCost : maxYearlyCost;
            var acf = parseInt(sd_details["acf"]);

            if (acf == 0) {
                acf = (yeild * totalCost) / 100;

            }

            // console.log(acf)

            // console.log(startyear)
            // var lastIncome;
            var capex_begin_year = startyear + parseInt(capex_start);
            var capex_end_year = capex_begin_year + capex_num_years;
            // console.log(capex_begin_year)
            for (var k4 = 0; k4 < number_of_years; k4++) {
                var cur_year = startyear + k4;

                if (cur_year <= diagram_end && cur_year > diagram_start) {
                    var sYear = (startyear + k4 + parseInt(capex_start));
                    curDiagDetails['investment'][cur_year] = yearlyCost;
                }
                else {
                    curDiagDetails['investment'][cur_year] = 0;
                }
            }
            var totalIncome = 0;
            // console.log(capex_end_year)
            for (var k = 0; k < number_of_years; k++) {
                var cur_year = startyear + k;
                
                // if (k == 0) {
                //     lastIncome = acf;
                // }
                // var incomeIncrease = (acf * 0.03);
                // var newIncome = incomeIncrease + lastIncome;
                if (cur_year <= diagram_end) {
                    curDiagDetails['income'][cur_year] = 0;
                }
                else {
                    curDiagDetails['income'][cur_year] = acf;
                    totalIncome += acf;
                }
                // curDiagDetails['income']['yearly'] = acf;
                // lastIncome = newIncome;
            }
            // console.log(curDiagDetails['income'])
            // curDiagDetails['income']['total'] = totalIncome;
            
            curDiagDetails['totalIncome'] =totalIncome;
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
                var cur_year = startyear + k7;
                if (cur_year > diagram_end) {
                    // var sYear = (startyear + k7 + parseInt(capex_end));
                    curDiagDetails['maintainence'][cur_year] = all_opex_asga;
                    totalMaintainence += all_opex_asga;
                }
                else {
                    curDiagDetails['maintainence'][cur_year] = 0;
                }
            }
            curDiagDetails['area'] = totArea;
            curDiagDetails['totalMaintainence'] =totalMaintainence;
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
    computeAreas(e.data.systemdetails, e.data.systems, e.data.startyear, e.data.years, e.data.saved_diagram_details, e.data.sequence);
}