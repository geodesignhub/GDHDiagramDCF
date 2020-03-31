
function destroyTables() {
    if ($.fn.DataTable.isDataTable('#npv')) {
        npv_table.destroy();
    }
}

function generateInitTables() {
    destroyTables();
    var allDiagrams = syndiagrams.diagrams;

    var sys = systems;
    var syslen = sys.length;
    for (var x = 0; x < syslen; x++) {
        sys[x]['diagrams'] = [];
        // sysDiags.push({cursys.name:{"id":cursys.id, "color":cursys.syscolor, "diagrams":[]}});
    }
    var diagGJ = {};
    for (var g = 0; g < allDiagrams.length; g++) {
        var curDiag = allDiagrams[g];
        diagGJ[parseInt(curDiag)] = {
            "type": "FeatureCollection",
            "features": []
        };
    }

    for (var j = 0; j < design.features.length; j++) {
        var curFeat = design.features[j];
        var curFeatProp = curFeat.properties;
        var diagID = curFeatProp.diagramid;
        diagGJ[parseInt(diagID)].features.push(curFeat);
    }

    for (var dID in diagGJ) {
        var diagFeats = diagGJ[dID];
        var ran = false;
        for (var y1 = 0; y1 < diagFeats.features.length; y1++) {
            if (ran == false) {
                var diagSysName = diagFeats.features[y1].properties.sysname;
                // var tmpDiagFeat = {};
                for (var x1 = 0; x1 < syslen; x1++) {
                    var cursys = sys[x1];
                    if (cursys.sysname == diagSysName) {
                        // tmpDiagFeat[dID]  = diagFeats;
                        sys[x1]['diagrams'].push(diagFeats);
                        break;
                    }
                    ran = true;
                }
                break;
            }
        }
    }

    $("#npv").find("tbody>tr:gt(0)").remove();
    $("#npv").find("thead>tr:gt(0)").remove();

    var headcounter = 0;
    var footercounter = 0;
    for (var h = 0; h < syslen; h++) {
        var cursys = sys[h];
        if (cursys.diagrams.length > 0) {

            var yrCounter = 0
            if (headcounter === 0) { // header row
                var npvHTML = "<tr><th class='header initCol'>Title</th><th class='fundingheader'>Funding</th><th class='fundingheader'>Financials</th><th class='fundingheader'>Assets</th><th class='systemheader'>System</th>";
                npvHTML += "</tr>";
                $('#npv  > thead').append(npvHTML);
                headcounter += 1;
            } // header is added. 
            // console.log(npvHTML)
            // add system row 
            var diaglen = cursys.diagrams.length;

            for (var p = 0; p < diaglen; p++) {
                var curdiag = cursys.diagrams[p];

                if (curdiag.features.length > 0) {
                    var curdiagprops = curdiag.features[0].properties;
                    var curdiagid = curdiag.features[0].properties.diagramid;
                    var projectorpolicy = curdiag.features[0].properties.areatype;
                    var diagrowHTMLnpv = "<tr class=" + "'" + cursys.id + "'" + "><td class='assetdetails initCol'>" + curdiagprops.description + "<br>(" + projectorpolicy + ")</td>" + "<td class=" + "assetdetails funding-" + curdiagid + "'" + ">" + curdiagprops.fundingtype + "</td>" + "<td class=" + "assetdetails financials-" + curdiagid + "'" + ">" + "Details" + "</td>" + "<td class=" + "assetdetails asset-" + curdiagid + "'" + ">" + "Details" + "</td>" + "<td class=" + "system-" + curdiagid + "'" + ">" + cursys.sysname + "</td>";
                    yrCounter = 0;
                    diagrowHTMLnpv += "</tr>";
                    $('#npv > tbody').append(diagrowHTMLnpv);
                }
            }
        }
    }
    systems = sys;
}

function initializeTables() {
    var tableGenerator = function (domid) {
        var groupColumn = 4;
        var t = $('#' + domid).DataTable({
            "columnDefs": [{
                "visible": false,
                "targets": groupColumn
            }],
            searching: false,
            fixedHeader: {
                header: false,
                footer: true
            },
            "order": [
                [groupColumn, 'asc']
            ],
            "drawCallback": function (settings) {
                var api = this.api();
                var rows = api.rows({
                    page: 'current'
                }).nodes();
                var last = null;

                api.column(groupColumn, {
                    page: 'current'
                }).data().each(function (group, i) {
                    if (last !== group) {
                        $(rows).eq(i).before(
                            '<tr class="group"><td colspan="">' + group +
                            '</td></tr>'
                        );

                        last = group;
                    }
                });
            }
        });
        return t;
    }
    npv_table = tableGenerator('npv');
}

