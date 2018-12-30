function computeFinanceMaps(grid, sysGrid, diagGrid, investmentdata, selectedsystems, all_diagrams) {

    var grid = JSON.parse(grid);
    var sysGrid = JSON.parse(sysGrid);
    var diagGrid = JSON.parse(diagGrid);
    var investmentdata = JSON.parse(investmentdata);

    const allDiagrams = JSON.parse(all_diagrams);

    if (selectedsystems !== 'all') {
        var selectedsystems = JSON.parse(selectedsystems);
    }

    var incomeGrid = {
        "type": "FeatureCollection",
        "features": []
    };
    var investmentGrid = {
        "type": "FeatureCollection",
        "features": []
    };
    var maintainenceGrid = {
        "type": "FeatureCollection",
        "features": []
    };
    var dcfGrid = {
        "type": "FeatureCollection",
        "features": []
    };

    // console.log(JSON.stringify(grid));
    // console.log(JSON.stringify(sysGrid));
    // console.log(JSON.stringify(diagGrid));
    // console.log(JSON.stringify(investmentdata));

    var gridlen = grid.features.length;

    var addedIDs = [];
    var finalInvestmentGrid = {};
    var finalMaintainenceGrid = {};
    var finalIncomeGrid = {};
    var finaldcfGrid = {};


    var fullproc = Object.keys(sysGrid).length;
    var counter = 0;
    for (var sysid in sysGrid) { // iterate over the systems. 
        if ((selectedsystems == 'all') || (selectedsystems.includes(sysid))) { // this system is in the filtered list. 
            if (sysGrid.hasOwnProperty(parseInt(sysid))) {
                var filteredinvestmentData = investmentdata.filter(function (el) {
                    return el.sysid == parseInt(sysid);
                }); // filtered investment data has only the diagrams for this system. 
                const filtered_investmentdata_length = filteredinvestmentData.length;

                for (var i1 = 0; i1 < filtered_investmentdata_length; i1++) { // loop over the investment data. 
                    var curData = filteredinvestmentData[i1]; // current investment data
                    var diagID = curData.id; // diagram id of the current investment

                    var name_added = 0;
                    var filteredIDs = diagGrid[diagID]; // the grid IDs that this diagram intersects. 
                    var filteredGridlen = filteredIDs.length; // number of grid cells that this diagram intersects
                    // for (var i2 = 0; i2 < filteredGridlen; i2++) {
                    // var curDiagGrid = filteredIDs[i2]; // the unique ID of the idagram. 
                    var prop_added = 0;
                    for (var i3 = 0; i3 < gridlen; i3++) {
                        var curGrid = grid.features[i3];
                        var curGridID = curGrid.properties.id;

                        if (filteredIDs.includes(curGridID)) { // while looping over the master grid, check if this ID needs to be included. 

                            var investGrid;
                            var totalInvest = curData.totalInvestment;
                            var yearlyInvestment = curData.investment;

                            var incGrid;
                            var totalIncome = curData.totalIncome;
                            var yearlyIncome = curData.income;

                            var maintGrid;
                            var totalMaintainence = curData.totalMaintainence;
                            var yearlyMaintainence = curData.maintainence;


                            if (addedIDs.includes(curGridID)) { // someone has already added the data, retrive it and work with it. 
                                investGrid = finalInvestmentGrid[curGridID];

                                var diags = investGrid.properties.diagrams;
                                if ((diags.indexOf(diagID) === -1)) {
                                    diags.push(diagID)
                                }
                                investGrid.properties.diagrams = diags;

                                var newtotalInvest = (curData.totalInvestment / filteredGridlen);
                                var origInvest = investGrid.properties.totalInvestment;

                                investGrid.properties.totalInvestment = (origInvest + newtotalInvest);

                                incGrid = finalIncomeGrid[curGridID];
                                var newtotalIncome = (curData.income['total'] / filteredGridlen);
                                var origIncome = incGrid.properties.totalIncome;

                                incGrid.properties.totalIncome = (origIncome + newtotalIncome);

                                maintGrid = finalMaintainenceGrid[curGridID];
                                var newtotalMaintainence = (curData.maintainence['total'] / filteredGridlen);
                                var origMaintainence = maintGrid.properties.totalMaintainence;
                                maintGrid.properties.totalMaintainence = (origMaintainence + newtotalMaintainence);


                                var origYearlyInvestment = investGrid.properties.investment;
                                var curYearlyInvestment = curData.investment;

                                var newYearlyInvestment = Object.assign({}, origYearlyInvestment, curYearlyInvestment);
                                Object.keys(newYearlyInvestment).forEach(v => newYearlyInvestment[v] = 0)

                                Object.keys(newYearlyInvestment).map(function (curkey) {
                                    if (curkey in origYearlyInvestment) {
                                        newYearlyInvestment[curkey] = newYearlyInvestment[curkey] + (origYearlyInvestment[curkey]);
                                    }
                                    if (curkey in curYearlyInvestment) {
                                        newYearlyInvestment[curkey] = newYearlyInvestment[curkey] + (curYearlyInvestment[curkey] / filteredGridlen);
                                    }
                                });
                                investGrid.properties.investment = newYearlyInvestment;

                                var origYearlyIncome = investGrid.properties.income;
                                var curYearlyIncome = curData.income;
                                var newYearlyIncome = Object.assign({}, origYearlyIncome, curYearlyIncome);
                                Object.keys(newYearlyIncome).forEach(v => newYearlyIncome[v] = 0)

                                Object.keys(newYearlyIncome).map(function (curkey) {
                                    if (curkey in origYearlyIncome) {
                                        newYearlyIncome[curkey] = newYearlyIncome[curkey] + (origYearlyIncome[curkey]);

                                    }
                                    if (curkey in curYearlyIncome) {
                                        newYearlyIncome[curkey] = newYearlyIncome[curkey] + (curYearlyIncome[curkey] / filteredGridlen);
                                    }
                                });

                                incGrid.properties.income = newYearlyIncome;


                                var origYearlyMaintainence = investGrid.properties.maintainence;
                                var curYearlyMaintainence = curData.maintainence;

                                Object.keys(newYearlyMaintainence).forEach(v => newYearlyMaintainence[v] = 0)

                                Object.keys(newYearlyMaintainence).map(function (curkey) {
                                    if (curkey in origYearlyMaintainence) {
                                        newYearlyMaintainence[curkey] = newYearlyMaintainence[curkey] + (origYearlyMaintainence[curkey]);

                                    }
                                    if (curkey in curYearlyMaintainence) {
                                        newYearlyMaintainence[curkey] = newYearlyMaintainence[curkey] + (curYearlyMaintainence[curkey] / filteredGridlen);
                                    }
                                });




                                maintGrid.properties.maintainence = newYearlyMaintainence;

                            } else {
                                var yearlyInvestment = curData.investment;

                                var yearlyMaintainence = curData.maintainence;


                                var yearlyIncome = curData.income;
                                var diags = curGrid.properties.diagrams;
                                const x = (typeof diags == 'undefined') ? [diagID] : ((diags.indexOf(diagID) === -1) ? diags.push(diagID) : diags);
                                curGrid.properties.diagrams = x;

                                investGrid = curGrid;
                                investGrid.properties.totalInvestment = (totalInvest / filteredGridlen);
                                var newYearlyInvestment = Object.assign({}, yearlyInvestment);
                                Object.keys(newYearlyInvestment).forEach(v => newYearlyInvestment[v] = 0)
                                Object.keys(newYearlyInvestment).forEach(v => newYearlyInvestment[v] = (yearlyInvestment[v] / filteredGridlen));
                                investGrid.properties.investment = newYearlyInvestment;


                                incGrid = curGrid;
                                incGrid.properties.totalIncome = (totalIncome / filteredGridlen);

                                var newYearlyIncome = Object.assign({}, yearlyIncome);
                                Object.keys(newYearlyIncome).forEach(v => newYearlyIncome[v] = 0)
                                Object.keys(newYearlyIncome).forEach(v => newYearlyIncome[v] = (yearlyIncome[v] / filteredGridlen))

                                incGrid.properties.income = newYearlyIncome;

                                maintGrid = curGrid;
                                maintGrid.properties.totalMaintainence = (totalMaintainence / filteredGridlen);

                                var newYearlyMaintainence = Object.assign({}, yearlyIncome);
                                Object.keys(newYearlyMaintainence).forEach(v => newYearlyMaintainence[v] = 0)
                                Object.keys(newYearlyMaintainence).forEach(v => newYearlyMaintainence[v] = (yearlyMaintainence[v] / filteredGridlen))

                                maintGrid.properties.maintainence = newYearlyMaintainence;
                            }

                            addedIDs.push(curGridID);
                            finalInvestmentGrid[curGridID] = investGrid; // assign back. 
                            finalIncomeGrid[curGridID] = incGrid; // assign back. 
                            finalMaintainenceGrid[curGridID] = maintGrid; // assign back. 
                        }
                    }
                    // }
                }
            }
        }

        counter += 1;
        self.postMessage({
            'percentcomplete': parseInt((100 * counter) / fullproc),
            'mode': 'status',
        });
    }

    // console.log(JSON.stringify(finalInvestmentGrid));
    for (var gridid in finalInvestmentGrid) {
        if (finalInvestmentGrid.hasOwnProperty(gridid)) {
            var curInvestmentGrid = finalInvestmentGrid[gridid];
            investmentGrid.features.push(curInvestmentGrid);
        }
    }

    for (var gridid in finalIncomeGrid) {
        if (finalIncomeGrid.hasOwnProperty(gridid)) {
            var curIncomeGrid = finalIncomeGrid[gridid];
            incomeGrid.features.push(curIncomeGrid);
        }
    }

    for (var gridid in finalMaintainenceGrid) {
        if (finalMaintainenceGrid.hasOwnProperty(gridid)) {
            var curMaintainenceGrid = finalMaintainenceGrid[gridid];
            maintainenceGrid.features.push(curMaintainenceGrid);
        }
    }

    //     self.postMessage({
    //     'percentcomplete': parseInt((100 * counter) / fullproc),
    //     'mode': 'status',
    // });

    // send investment
    self.postMessage({
        'incomeGrid': JSON.stringify(incomeGrid),
        'investmentGrid': JSON.stringify(investmentGrid),
        'maintainenceGrid': JSON.stringify(maintainenceGrid),
        'dcfgrid': JSON.stringify(dcfGrid)
    });

    // close the worker
    self.close();
}


self.onmessage = function (e) {
    grid = computeFinanceMaps(e.data.grid, e.data.sysGrid, e.data.diagGrid, e.data.investmentdata, e.data.selectedsystems, e.data.allDiagrams);

}