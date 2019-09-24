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
                timeline[cur_seq.id] = {
                    "start": moment(cur_seq.start_date, "DD-MM-YYYY").year(),
                    "end": moment(cur_seq.end_date, "DD-MM-YYYY").year()
                };
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

    var annual_direct_jobs = {};
    var annual_indirect_jobs = {};
    var annual_residents = {};
    var annual_visitors = {}

    var sys_totals_lookups = {};
    for (var i = sysdetlen - 1; i >= 0; i--) {
        var cur_system = systems[i];
        var system_annual_income = {};
        var system_annual_investment = {};
        var system_annual_sga = {};
        for (var k9 = 0; k9 < number_of_years; k9++) {
            var c_year = startyear + k9;
            system_annual_income[c_year] = 0;
            system_annual_investment[c_year] = 0;
            system_annual_sga[c_year] = 0;
            annual_direct_jobs[c_year] = 0;
            annual_indirect_jobs[c_year] = 0;
            annual_residents[c_year] = 0;
            annual_visitors[c_year] = 0;
        }

        sys_totals_lookups[cur_system['id']] = {
            'total_investment': 0,
            'total_income': 0,
            'total_sga': 0,
            'yearly_investment': system_annual_income,
            'yearly_income': system_annual_investment,
            'yearly_sga': system_annual_investment,
            'system_name': cur_system['sysname'],
            'color': cur_system['syscolor']
        };

    }


    for (var x = 0; x < syslen; x++) {
        var cSys = systems[x];
        var allDiagrams = cSys.diagrams;
        var cur_sys = cSys['id'];
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
            var cur_diagram_asset_details = {};
            for (let l1 = 0; l1 < sdd.length; l1++) {
                const element = sdd[l1];
                if (element['key'].split('-')[1] == diagID) {
                    sd_details = element;                    
                    cur_diagram_asset_details = element['asset_details'];
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

            if (parseInt(diagID) in timeline) {
                var diagram_start = timeline[diagID].start;
                var diagram_end = timeline[diagID].end;
            } else {
                var diagram_start = startyear;
                var diagram_end = startyear + 2;
            }

            curDiagDetails['totalInvestment'] = totalCost;
            curDiagDetails['investment'] = {};
            curDiagDetails['income'] = {};
            curDiagDetails['maintainence'] = {};
            curDiagDetails['yeild'] = yeild;

            sys_totals_lookups[cur_sys]['total_investment'] += totalCost;

            yearlyCost = parseFloat(totalCost / capex_num_years);
            maxYearlyCost = (yearlyCost > maxYearlyCost) ? yearlyCost : maxYearlyCost;
            var acf = parseInt(sd_details["acf"]);
            if (acf == 0) {
                acf = (yeild * totalCost) / 100;
            }

            var capex_begin_year = startyear + parseInt(capex_start);
            var capex_end_year = capex_begin_year + capex_num_years;
            var end_year = startyear + number_of_years
            // console.log(capex_begin_year)



            for (var k4 = 0; k4 < number_of_years; k4++) {
                var cur_year = startyear + k4;

                if (cur_year <= diagram_end && cur_year > diagram_start) {
                    var sYear = (startyear + k4 + parseInt(capex_start));
                    curDiagDetails['investment'][cur_year] = yearlyCost;
                    sys_totals_lookups[cur_sys]['yearly_investment'][cur_year] += yearlyCost;
                    // }

                } else {
                    curDiagDetails['investment'][cur_year] = 0;
                    // 
                    if ((cur_diagram_asset_details) && (cur_year == diagram_end+1)) {
                        if (Object.keys(cur_diagram_asset_details).length === 0 && cur_diagram_asset_details.constructor === Object) {} else if (Object.keys(cur_diagram_asset_details).length > 0 && cur_diagram_asset_details.constructor === Object) {
                            if (cur_diagram_asset_details['class'] == 'residential') {
                                var population = cur_diagram_asset_details['metadata']['number_of_people_residential'];
                                annual_residents[cur_year] += parseInt(population);

                            } else if (cur_diagram_asset_details['class'] == 'community') {
                                var visitors = cur_diagram_asset_details['metadata']['community_visitors'];
                                annual_visitors[cur_year] += parseInt(visitors);
                            } else if (cur_diagram_asset_details['class'] == 'hospitality') {
                                var visitors = cur_diagram_asset_details['metadata']['total_yearly_visitors'];
                                annual_visitors[cur_year] += parseInt(visitors);
                                var direct_employment = cur_diagram_asset_details['metadata']['total_direct_employment_tourism'];
                                annual_direct_jobs[cur_year] += parseInt(direct_employment);
                                var indirect_employment = cur_diagram_asset_details['metadata']['total_indirect_employment_tourism'];
                                annual_indirect_jobs[cur_year] += parseInt(indirect_employment);
                            } else if (cur_diagram_asset_details['class'] == 'retail') {
                                var visitors = cur_diagram_asset_details['metadata']['total_daily_visitors_retail'];

                                var direct_employment = cur_diagram_asset_details['metadata']['total_direct_employment_retail'];
                                var indirect_employment = cur_diagram_asset_details['metadata']['total_indirect_employment_retail'];

                                annual_visitors[cur_year] += parseInt(visitors);
                                annual_direct_jobs[cur_year] += parseInt(direct_employment);
                                annual_indirect_jobs[cur_year] += parseInt(indirect_employment);

                            } else if (cur_diagram_asset_details['class'] == 'office') {
                                var visitors = cur_diagram_asset_details['metadata']['total_daily_visitors_office'];
                                var direct_employment = cur_diagram_asset_details['metadata']['total_direct_employment_office'];
                                var indirect_employment = cur_diagram_asset_details['metadata']['total_indirect_employment_office'];
                                annual_visitors[cur_year] += parseInt(visitors);
                                annual_direct_jobs[cur_year] += parseInt(direct_employment);
                                annual_indirect_jobs[cur_year] += parseInt(indirect_employment);
                            } else if (cur_diagram_asset_details['class'] == 'mixuse') {
                                var population = cur_diagram_asset_details['metadata']['number_of_people_residential_mixuse'];
                                var visitors = cur_diagram_asset_details['metadata']['total_daily_visitors_retail_mixuse'];
                                var direct_employment = cur_diagram_asset_details['metadata']['total_direct_employment_retail_mixuse'];
                                var indirect_employment = cur_diagram_asset_details['metadata']['total_indirect_employment_retail_mixuse'];
                                
                                annual_visitors[cur_year] += parseInt(visitors);
                                annual_direct_jobs[cur_year] += parseInt(direct_employment);
                                annual_indirect_jobs[cur_year] += parseInt(indirect_employment);
                            }
                        }
                    }
                }
            }
            var totalIncome = 0;
            // console.log(capex_end_year)
            for (var k = 0; k < number_of_years; k++) {
                var cur_year = startyear + k;
                if (cur_year <= diagram_end) {
                    curDiagDetails['income'][cur_year] = 0;
                } else {
                    curDiagDetails['income'][cur_year] = acf;
                    sys_totals_lookups[cur_sys]['yearly_income'][cur_year] += acf;
                    totalIncome += acf;
                }

            }
            curDiagDetails['totalIncome'] = totalIncome;
            // update aggregartes
            sys_totals_lookups[cur_sys]['total_income'] += totalCost;
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

                    sys_totals_lookups[cur_sys]['yearly_sga'][cur_year] += all_opex_asga;
                    totalMaintainence += all_opex_asga;
                } else {
                    curDiagDetails['maintainence'][cur_year] = 0;

                }
            }
            curDiagDetails['area'] = totArea;
            curDiagDetails['totalMaintainence'] = totalMaintainence;

            sys_totals_lookups[cur_sys]['total_sga'] += totalMaintainence;
            // curDiagDetails['maintainence']['total'] = totalMaintainence;
            diagCosts.push(curDiagDetails);

        }
    }
    
    var annual_population_jobs = {
        'annual_visitors': annual_visitors,
        'annual_residents': annual_residents,
        'annual_direct_jobs': annual_direct_jobs,
        'annual_indirect_jobs': annual_indirect_jobs
    };
    // console.log(diagCosts)
    // send investment
    self.postMessage({
        'output': JSON.stringify(diagCosts),
        'maxYearlyCost': maxYearlyCost,
        'system_aggregates': JSON.stringify(sys_totals_lookups),
        'annual_population_jobs': JSON.stringify(annual_population_jobs)
    });

    // close the worker
    self.close();
}

self.onmessage = function(e) {
    computeAreas(e.data.systemdetails, e.data.systems, e.data.startyear, e.data.years, e.data.saved_diagram_details, e.data.sequence);
}