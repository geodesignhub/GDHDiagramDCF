
function destroyTables() {
    if ($.fn.DataTable.isDataTable('#all_diagrams')) {
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

    $("#all_diagrams").find("tbody>tr:gt(0)").remove();
    $("#all_diagrams").find("thead>tr:gt(0)").remove();

    var headcounter = 0;
    var footercounter = 0;
    for (var h = 0; h < syslen; h++) {
        var cursys = sys[h];
        if (cursys.diagrams.length > 0) {

            var yrCounter = 0
            if (headcounter === 0) { // header row
                var npvHTML = "<tr><th class='header initCol'>Title</th><th class='fundingheader'>Capex</th><th class='fundingheader'>Opex</th><th class='fundingheader'>Income</th><th class='fundingheader'>Maintainence</th><th class='systemheader'>System</th>";
                npvHTML += "</tr>";
                $('#all_diagrams  > thead').append(npvHTML);
                headcounter += 1;
            } // header is added. 
            // console.log(npvHTML)
            // add system row 
            var diaglen = cursys.diagrams.length;


            let cursys_id = cursys['id'];
            let current_system_details = {};
            for (let g4 = 0; g4 < systemdetail.length; g4++) {
                const cur_system = systemdetail[g4];
                if (cur_system['id'] == cursys_id) {
                    current_system_details = cur_system;
                    break;
                }
            }
            // check if there are any saved values for this diagrams

            const capex = 10000;
            let acf = capex * 0.1;
            let opex = capex * 0.05;
            let asga = capex * 0.01;



            for (var p = 0; p < diaglen; p++) {
                var curdiag = cursys.diagrams[p];
                if (curdiag.features.length > 0) {
                    var curdiagprops = curdiag.features[0].properties;
                    var curdiagid = curdiag.features[0].properties.diagramid;
                    var projectorpolicy = curdiag.features[0].properties.areatype;
                    var cost_override = curdiag.features[0].properties.cost_override;
                    var cost_override_type = curdiag.features[0].properties.cost_override_type;



                    console.log(curdiagprops)

                    for (let k7 = 0; k7 < saved_diagram_details.length; k7++) {
                        const cur_saved_diagram = saved_diagram_details[k7];
                        if (cur_saved_diagram['key'].split('-')[1] == curdiagid) {
                            if (cur_saved_diagram.hasOwnProperty['fin_set']) {
                                if (cur_saved_diagram['fin_set'] == 0) { } else {
                                    // finanicals set. 
                                    capex = cur_saved_diagram['capex'];
                                    acf = cur_saved_diagram['acf'];
                                    opex = cur_saved_diagram['opex'];
                                    asga = cur_saved_diagram['asga'];
                                    break;
                                }
                            }
                        }
                    }

                    var diagrowHTMLnpv = "<tr class=" + "'" + cursys.id + "'" + "><td class='assetdetails initCol'>" + curdiagprops.description + "<br>(" + projectorpolicy + ")</td>" + "<td class=" + "assetdetails capex-" + curdiagid + "'" + ">" + '<a class="editable" href="#" data-type="text" data-title="Enter new capex e.g. 5">'+capex + "</a></td>" + "<td class=" + "assetdetails opex-" + curdiagid + "'" + ">" + '<a class="editable" href="#" data-type="text" data-title="Enter new opex e.g. 5">'+opex + "</a></td>" + "<td class=" + "assetdetails income-" + curdiagid + "'" + ">" + '<a class="editable" href="#" data-type="text" data-title="Enter new income e.g. 5">'+ acf + "</td>" + "<td class=" + "assetdetails maintainence-" + curdiagid + "'" + ">" + '<a class="editable" href="#" data-type="text" data-title="Enter new maintainence e.g. 5">'+ asga + "</a></td>" + "<td class=" + "system-" + curdiagid + "'" + ">" + cursys.sysname + "</td>";
                    yrCounter = 0;
                    diagrowHTMLnpv += "</tr>";
                    $('#all_diagrams > tbody').append(diagrowHTMLnpv);
                }
            }
        }
    }
    systems = sys;
}

function initializeTables() {
    var tableGenerator = function (domid) {
        var groupColumn = 5;
        var t = $('#' + domid).DataTable({
            "columnDefs": [{
                "visible": false,
                "targets": groupColumn
            }],
            pageLength: 50,
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
    all_diagrams_table = tableGenerator('all_diagrams');
    $('.editable').editable();
}

