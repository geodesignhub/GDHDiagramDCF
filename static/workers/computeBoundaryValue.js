importScripts('../js/turf.min.js');
importScripts('../js/rtree.min.js');

function computeBoundaryValue(design, boundary, investmentdata, selectedsystems, systemdetails) {
    // get the grid in a rTree

    var whiteListedSysName = ['HDH', 'LDH', 'IND', 'COM', 'COMIND', 'HSNG', 'HSG', 'MXD', 'OFC'];
    var boundary = JSON.parse(boundary);
    var systemdetails = JSON.parse(systemdetails);
    var design = JSON.parse(design);
    var investmentdata = JSON.parse(investmentdata);
    var selectedsystems = JSON.parse(selectedsystems);
    // loop over boundaries
    var selectedsystems = selectedsystems.map(function(x) {
        return parseInt(x, 10);
    });
    var counter = 0;

    function makeid() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 6; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    var gridTree = RTree();
    gridTree.geoJSON(design);
    var newboundaries = { "type": "FeatureCollection", "features": [] };
    var bfeatlen = boundary.features.length;

    var fullproc = bfeatlen;
    for (var j2 = 0; j2 < bfeatlen; j2++) {
        var cbndfeat = boundary.features[j2];
        var bndid = makeid();
        cbndfeat.properties.id = bndid;
        newboundaries.features.push(cbndfeat);
    }
    var bndIDDiags = {};
    for (var j = 0; j < bfeatlen; j++) {
        var curbnd = newboundaries.features[j];
        var curBndbounds = turf.bbox(curbnd);
        var cData = gridTree.bbox([curBndbounds[0], curBndbounds[1]], [curBndbounds[2], curBndbounds[3]]); // array of features
        // get all the diagrams within this boundary
        var curbndid = curbnd.properties.id;
        bndIDDiags[curbndid] = {};
        var diags = [];
        for (var g1 = 0; g1 < cData.length; g1++) {
            var curIFeatGrid = cData[g1];
            var curIFeatDiagramID = curIFeatGrid.properties.diagramid;
            diags.push(curIFeatDiagramID);
        }
        bndIDDiags[curbndid]['diagrams'] = diags;
    }
    // console.log(JSON.stringify(bndIDDiags));
    // console.log(JSON.stringify(selectedsystems));
    var opboundaries = { "type": "FeatureCollection", "features": [] };
    var sysdetaillen = systemdetails.length;
    for (var j3 = 0; j3 < bfeatlen; j3++) {
        var cbndfeat = newboundaries.features[j3];
        var bndID = cbndfeat.properties.id;
        var diagramIDs = bndIDDiags[bndID]['diagrams'];
        var totalIncome = 0;
        var totalInvestment = 0;
        var totalTax = 0;
        // get the items in the grid that intersect the boundary. 
        for (var i1 = 0; i1 < investmentdata.length; i1++) { // loop over the investment data. 
            var curData = investmentdata[i1]; // current investment data
            var diagID = curData.id; // diagram id of the current investment
            var sysID = curData.sysid;
            var curSys;
            for (var u1 = 0; u1 < sysdetaillen; u1++) {
                var sys = systemdetails[u1];
                if (sysID === sys.id) {
                    curSys = sys;
                    break;
                }
            }
            var sysName = curSys.sysname;
            if (diagramIDs.includes(diagID) && (selectedsystems.includes(sysID))) {
                var tmpvaluation = (curData['totalInvestment'] * 0.25) + curData['totalInvestment'];
                if (whiteListedSysName.indexOf(sysName) >= 0) { // system is whitelisted
                    if ((sysName === 'HDH') || (sysName === 'HSNG') || (sysName === 'HSG')) {
                        taxrate = .18; // housing yeild if 4
                    } else if (sysName === 'MXD') {
                        taxrate = .20;
                    } else if (sysName === 'LDH') {
                        taxrate = .18;
                    } else if ((sysName === 'COM') || (sysName === 'COMIND') || (sysName === 'OFC') || (sysName === 'IND')) {
                        taxrate = .25;
                    }
                    totalTax += tmpvaluation * taxrate * 15;
                    // console.log(totalTax);
                } else {

                    totalTax += 0;
                    // console.log(totalTax);
                    // not white listed
                }

                totalIncome += parseInt(curData['income']['total']);
                totalInvestment += curData['totalInvestment'];
            }
        }
        bndIDDiags[bndID]['totalIncome'] = totalIncome;
        bndIDDiags[bndID]['totalInvestment'] = totalInvestment;
        var totalValuation = (totalInvestment * 0.25) + totalInvestment;

        bndIDDiags[bndID]['totalValuation'] = totalValuation;
        bndIDDiags[bndID]['bname'] = cbndfeat.properties.bname;
        bndIDDiags[bndID]['totalTax'] = totalTax;


        cbndfeat.properties.totalTax = totalTax;
        cbndfeat.properties.totalIncome = totalIncome;
        cbndfeat.properties.totalValuation = totalValuation;
        cbndfeat.properties.totalInvestment = totalInvestment;
        opboundaries.features.push(cbndfeat);
        counter += 1;
        self.postMessage({
            'percentcomplete': parseInt((100 * counter) / fullproc),
            'mode': 'status',
        });
    }

    self.postMessage({
        'boundaryValue': JSON.stringify(bndIDDiags),
        'newboundaries': JSON.stringify(opboundaries)
    });

    // close the worker
    // self.close();
}
self.onmessage = function(e) {
    computeBoundaryValue(e.data.design, e.data.boundaries, e.data.investmentdata, e.data.selectedsystems, e.data.systemdetails);
}