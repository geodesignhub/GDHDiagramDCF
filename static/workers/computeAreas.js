importScripts('../js/turf.min.js');
importScripts('../js/moment.min.js');
importScripts('../js/rtree.min.js');





function computeAreas(systemdetails, systems, timeline, startyear, gridgridsize, usersubyeilds, numYears) {

    var whiteListedSysName = ['HDH', 'LDH', 'IND', 'COM', 'COMIND', 'HSNG', 'HSG', 'MXD'];
    var systemdetails = JSON.parse(systemdetails);
    var systems = JSON.parse(systems);
    var timeline = JSON.parse(timeline);
    var startyear = parseInt(startyear);
    const usersubmittedyeilds = JSON.parse(usersubyeilds);
    var maxYearlyCost = 0;
    diagCosts = [];
    var number_of_years = numYears;

    var gridTree = RTree();
    var grid = gridgridsize[0];
    var gridsize = gridgridsize[1];
    gridTree.geoJSON(grid);

    var syslen = systems.length;
    var sysdetlen = systemdetails.length;
    // for each diagram, compute the area
    var addedIDs = [];
    var sysGrids = {};
    var diagGrids = {};
    var relevantGrid = {
        "type": "FeatureCollection",
        "features": []
    };

    for (var x = 0; x < syslen; x++) {
        var cSys = systems[x];
        var allDiagrams = cSys.diagrams;
        var sysID = cSys.id;
        var allDiaglen = allDiagrams.length;
        var curGridIntersects = [];
        var sysAddedIDs = [];
        for (var n = 0; n < allDiaglen; n++) {
            var diagAddedIDs = [];
            var curDiag = allDiagrams[n];
            var cDFeatlen = curDiag.features.length;
            var diagID = curDiag.features[0].properties.diagramid;
            var projectorpolicy = curDiag.features[0].properties.areatype;

            if (cDFeatlen > 0 && projectorpolicy == 'project') {
                // loop over each feature in the current diagram
                for (var b = 0; b < cDFeatlen; b++) {
                    var curFeat = curDiag.features[b];
                    var curDiagbounds = turf.bbox(curFeat);
                    var cData = gridTree.bbox([curDiagbounds[0], curDiagbounds[1]], [curDiagbounds[2], curDiagbounds[3]]); // array of features

                    for (var g1 = 0; g1 < cData.length; g1++) {
                        var curIFeatGrid = cData[g1];
                        var curIFeatGridID = curIFeatGrid.properties.id;
                        curGridIntersects.push(curIFeatGridID);
                        const allReadyExists = addedIDs.includes(curIFeatGridID);
                        sysAddedIDs.push(curIFeatGridID);
                        diagAddedIDs.push(curIFeatGridID);
                        if (allReadyExists) {} else {
                            addedIDs.push(curIFeatGridID);
                            relevantGrid.features.push(curIFeatGrid);
                        }
                    }
                }

            }

            diagGrids[diagID] = diagAddedIDs;
        }
        sysGrids[sysID] = sysAddedIDs;
        var yeild;
        var dwellings;

        // based on system get estimated dwellings 
        // COM

        // number of areas that this grid intersects. 
        // const relevantGridLen = relevantGrid.length;
        // console.log(JSON.stringify(curGridIntersects)); // these are the ids that are interesting for this system. 
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
                    bufArea = turf.buffer(cDiag, .01);
                    totAreaM = turf.area(bufArea);
                    totArea = totAreaM * 0.0001; // in hectares                    
                } catch (err) { //throw JSON.stringify(err)
                    // console.log(err);
                    totArea = 0;
                } // catch ends
            }

            if (whiteListedSysName.indexOf(sysName) >= 0) { // system is whitelisted
                if ((sysName === 'HDH') || (sysName === 'HSNG') || (sysName === 'HSG')) {
                    yeild = (Object.keys(usersubmittedyeilds).length !== 0 && usersubmittedyeilds.constructor === Object && 'one-star' in usersubmittedyeilds) ? usersubmittedyeilds['one-star'] : 10;
                    // yeild = 10; // housing yeild if 4
                    // var hdh = new HDHousing();
                    // units = hdh.generateUnits(totAreaM);
                } else if (sysName === 'MXD') {

                    yeild = (Object.keys(usersubmittedyeilds).length !== 0 && usersubmittedyeilds.constructor === Object && 'three-star' in usersubmittedyeilds) ? usersubmittedyeilds['three-star'] : 16;
                    // yeild = 16;
                    // var mxd = new MXDBuildings();
                    // var units = mxd.generateUnits(totAreaM);
                } else if (sysName === 'LDH') {
                    // var ldh = new LDHousing();
                    // units = ldh.generateUnits(totAreaM);

                    yeild = (Object.keys(usersubmittedyeilds).length !== 0 && usersubmittedyeilds.constructor === Object && 'two-star' in usersubmittedyeilds) ? usersubmittedyeilds['two-star'] : 12;
                    // yeild = 12;
                } else if ((sysName === 'COM') || (sysName === 'COMIND') || (sysName === 'IND')) {
                    // var com = new COMBuilding();
                    // units = com.generateUnits(totAreaM);
                    yeild = (Object.keys(usersubmittedyeilds).length !== 0 && usersubmittedyeilds.constructor === Object && 'four-star' in usersubmittedyeilds) ? usersubmittedyeilds['four-star'] : 18;
                    // yeild = 18;
                }
            } else if ((sysTag === 'Large buildings, Industry, commerce')) { // system not whitelisted
                // var lab = new LABBuildings();
                // units = lab.generateUnits(totAreaM);
                // yeild = 16;
                yeild = (Object.keys(usersubmittedyeilds).length !== 0 && usersubmittedyeilds.constructor === Object && 'three-star' in usersubmittedyeilds) ? usersubmittedyeilds['three-star'] : 16;
            } else if ((sysTag === 'Small buildings, low density housing')) { // system not whitelisted 
                // var smb = new SMBBuildings();
                // units = smb.generateUnits(totAreaM);
                // yeild = 16;

                yeild = (Object.keys(usersubmittedyeilds).length !== 0 && usersubmittedyeilds.constructor === Object && 'three-star' in usersubmittedyeilds) ? usersubmittedyeilds['three-star'] : 16;
            } else {
                // units = 0;
                // yeild = 12; // default yeild

                yeild = (Object.keys(usersubmittedyeilds).length !== 0 && usersubmittedyeilds.constructor === Object && 'two-star' in usersubmittedyeilds) ? usersubmittedyeilds['two-star'] : 12;
            }


            var curDiagDetails = {
                'id': diagID,
                'title': diagName
            };
            for (var h = 0; h < sysdetlen; h++) {
                var cSys = systemdetails[h];


                var sName = cSys['sysname'];
                if (sName === sysName) {

                    sysCost = cSys['syscost'];
                    curDiagDetails['sysid'] = cSys['id'];
                    curDiagDetails['sysname'] = sName;
                }
            }
            // console.log(cost_override_type, cost_override);
            if (cost_override !== 0) {
                if (cost_override_type == 'total') {
                    totalCost = cost_override;
                } else {
                    totalCost = totArea * cost_override;
                }
            } else {
                totalCost = totArea * sysCost;
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
            // if the diagram exists get the number of years 
            // else default is 2

            curDiagDetails['totalInvestment'] = totalCost;
            curDiagDetails['investment'] = {};
            curDiagDetails['income'] = {};
            curDiagDetails['maintainence'] = {};
            curDiagDetails['yeild'] = yeild;

            // curDiagDetails['units'] = units;
            // curDiagDetails['name'] = units;

            yearlyCost = parseFloat(totalCost / numYears);
            maxYearlyCost = (yearlyCost > maxYearlyCost) ? yearlyCost : maxYearlyCost;

            var tenpercentIncome = (yeild * totalCost) / 100;

            var lastIncome;
            for (var k4 = 0; k4 < numYears; k4++) {
                if (k4 < 19) {
                    // var incomeIncrease = (tenpercentIncome * 0.03);
                    // var newIncome = incomeIncrease + lastIncome;
                    var sYear = (startyear + k4);
                    curDiagDetails['investment'][sYear] = yearlyCost;
                    // lastIncome = newIncome;
                }
            }
            var totalIncome = 0;
            for (var k = 0; k < number_of_years; k++) {
                if (k == 0) {
                    lastIncome = tenpercentIncome;
                }
                var incomeIncrease = (tenpercentIncome * 0.03);
                var newIncome = incomeIncrease + lastIncome;
                var sYear = (startyear + k);
                curDiagDetails['income'][sYear] = newIncome;
                curDiagDetails['income']['yearly'] = tenpercentIncome;
                totalIncome += lastIncome;
                lastIncome = newIncome;

            }
            curDiagDetails['income']['total'] = totalIncome;
            var totalMaintainence = 0;
            // var threepercentMaintainece = -1 * yearlyCost * 0.03;
            var threepercentMaintainece = yearlyCost * 0.03;
            var lastIncome;
            for (var k7 = 0; k7 < number_of_years; k7++) {
                if (k7 < number_of_years-1) {
                    var sYear = (startyear + k7);
                    curDiagDetails['maintainence'][sYear] = threepercentMaintainece;
                    totalMaintainence += threepercentMaintainece;
                }
            }

            curDiagDetails['maintainence']['total'] = totalMaintainence;
            diagCosts.push(curDiagDetails);
        }
    }

    // send investment
    self.postMessage({
        'sysGrids': JSON.stringify(sysGrids),
        'diagGrids': JSON.stringify(diagGrids),
        'grid': JSON.stringify(relevantGrid),
        'output': JSON.stringify(diagCosts),
        'maxYearlyCost': maxYearlyCost,
        'gridsize': gridsize
    });

    // close the worker
    self.close();
}

function generateGrid(bounds) {

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 6; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    bounds = bounds.split(",").map(function (item) {
        return parseFloat(item, 10);
    });
    // 1 hectare grid
    // 1 hectare is 10000 sq m. 
    function round(value, decimals) {
        return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
    }
    var poly = turf.bboxPolygon(bounds);
    var area = parseInt(turf.area(poly));
    var length = Math.sqrt(area);
    // grid of 25 x 25
    var numberofgridcells = 25;
    var gridsize = (length / numberofgridcells) / 1000;
    gridsize = round(gridsize, 2);
    // console.log(gridsize);
    var g = turf.squareGrid(bounds, gridsize, 'kilometers');
    var grid = {
        "type": "FeatureCollection",
        "features": []
    };
    var gridlen = g.features.length;
    
    for (var index = 0; index < gridlen; index++) {
        var curgrid = g.features[index];
        curgrid.properties.id = makeid();
        grid.features.push(curgrid);
    }

    return [grid, gridsize];

}
self.onmessage = function (e) {
    gridgridsize = generateGrid(e.data.bounds);
    
    computeAreas(e.data.systemdetails, e.data.systems, e.data.timeline, e.data.startyear, gridgridsize, e.data.yeilds, e.data.years);
}