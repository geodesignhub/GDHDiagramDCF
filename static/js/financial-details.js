function abbrNum(number, decPlaces) {
    if (number < 1000) {
        number = Math.round(number);
    } else {
        decPlaces = Math.pow(10, decPlaces);
        var abbrev = ["k", "m", "b", "t"];
        for (var i = abbrev.length - 1; i >= 0; i--) {
            var size = Math.pow(10, (i + 1) * 3);
            if (size <= number) {
                number = Math.round(number * decPlaces / size) / decPlaces;
                if ((number == 1000) && (i < abbrev.length - 1)) {
                    number = 1;
                    i++;
                }
                number += abbrev[i];
                break;
            }
        }
    }
    return number;
}


function miniMapstyleComp(feature) {
    // console.log(feature.properties)
    var curFeature = feature.geometry.type;
    if (curFeature === 'LineString') {
        // console.log(feature)
        return {
            weight: 2,
            opacity: .9,
            color: feature.properties.color,
            dashArray: '',

        };
    } else {
        // var fillColor = getColor(feature.properties.areatype);

        if (feature.properties.areatype == 'project') {
            var fillColor = feature.properties.color;
        } else { // it is policy
            var fillPattern = setSVGStyle(feature.properties.color);
            var fillColor = fillPattern;
        }

        return {
            // fillColor: feature.properties.color,
            // fillColor:'#333333',
            weight: 1,
            stroke: true,
            opacity: 0.9,
            fillColor: fillColor,
            color: feature.properties.color,
            dashArray: '',
            // opacity: 0.2,
            fillOpacity: 0.8,
        };
    }

}

function setSVGStyle(reqColor) {
    var pattern = svgDrawing.pattern(6, 6, function (add) {
        // add.rect(5, 5).fill(reqColor)
        add.line(0, 0, 6, 6).stroke({
            width: 1,
            color: reqColor
        })
        add.line(6, 0, 0, 6).stroke({
            width: 1,
            color: reqColor
        })
    });
    return pattern.fill();
}

function getColor(type) {

    return type === 'policy' ? '#707070 ' :
        type === 'project' ? '#a69695 ' :
            type === 'red2' ? '#bd0026' :
                type === 'red' ? '#f03b20' :
                    type === 'yellow' ? '#FFFF00' :
                        type === 'green' ? '#74c476' :
                            type === 'green2' ? '#31a354' :
                                type === 'green3' ? '#006d2c' :
                                    type === 'purple' ? '#CFACF7' :
                                        type === 'purple2' ? '#8D6CBF' :
                                            type === 'purple3' ? '#601286' :
                                                type === 'orange' ? '#FFA927' :
                                                    type === 'orange2' ? '#F8872E' :
                                                        type === 'orange3' ? '#FC6B0A' :
                                                            type === 'constraints' ? '#343434' :
                                                                type === 'boundaries' ? '#a6cee3' :
                                                                    type === 'boundaries2' ? '#b2df8a' :
                                                                        '#808080';
}


function computeNPV() {

    var initInvestment = parseInt(initCost);
    var acf = parseInt(acfCost);
    var aopex = parseInt(aopexCost);
    var asga = parseInt(asgaCost);
    var acfg = (parseFloat($("#acfg-slider").val()) / 100);
    var wacc = (parseFloat($("#wacc-slider").val()) / 100);
    var numYears = 30;
    var income = [];
    var lastyearsincome;
    var yearsPlot = [];


    const init_investement_syear = isNumeric($("#initcost-syear").val()) ? parseInt($("#initcost-syear").val()) :
        0;
    const init_investement_eyear = isNumeric($("#initcost-eyear").val()) ? parseInt($("#initcost-eyear").val()) :
        1;
    const acf_syear = isNumeric($("#acf-syear").val()) ? parseInt($("#acf-syear").val()) : 0;

    const investment_duration = init_investement_eyear - init_investement_syear;
    const yearly_investement = initInvestment / investment_duration;

    // ebitda = (ebitda < 0) ? 0 : ebitda;
    for (var x = 0; x < numYears; x++) {
        yearsPlot.push(x);
        var c_acf = 0;
        if (x <= acf_syear) {
            c_acf = 0;
        } else {
            c_acf = acf;
        }

        if (x >= init_investement_syear && x < init_investement_eyear) {
            var ebitda = c_acf - yearly_investement - aopex - asga;
        } else {
            var ebitda = c_acf - aopex - asga;
        }

        if (x == 0) {
            income.push(parseFloat(ebitda.toFixed(2)));
        } else {
            lastyearsincome = income[x - 1];
            var thisyearsincome = ebitda + (lastyearsincome * acfg);
            income.push(parseFloat(thisyearsincome.toFixed(2)));
        }

    }
    var dcf = [];
    for (var y = 0; y < numYears; y++) {
        var curdcf = ((income[y]) / Math.pow((1 + wacc), y));
        dcf.push(parseFloat(curdcf.toFixed(2)));
    }

    var totaldcf = dcf.reduce(function (a, b) {
        return a + b;
    }, 0);
    var absdcf = Math.abs(totaldcf);
    if (totaldcf < 0) {
        $("#totaldcf").html('-' + abbrNum(parseFloat(absdcf.toFixed(2)), 2));
    } else {
        $("#totaldcf").html(abbrNum(parseFloat(absdcf.toFixed(2)), 2));
    }
    var npv = initInvestment - totaldcf;
    var absnpv = Math.abs(npv);

    if (npv < 0) {
        $("#npvVal").html('-' + abbrNum(parseFloat(absnpv.toFixed(2)), 2));
    } else {
        $("#npvVal").html(abbrNum(parseFloat(absnpv.toFixed(2)), 2));
    }
    if (npv > 0) {
        $("#npvmeaning").html(
            "<p class='bg-danger'>Given the parameters, this investement is currently overvalued. </p>");

    } else {
        $("#npvmeaning").html(
            "<p class='bg-success'>Given the parameters, this investement is currently undervalued.</p>");
    }

    $("#loadingGIF").hide();
    // plot

    var plotData = {
        labels: yearsPlot,
        datasets: [{
            label: "Actual Cash Flow",
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: income,
            spanGaps: false,
        }, {
            label: "Discounted Cash Flow",
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(255,99,132,0.2)",
            borderColor: "rgba(255,99,132,1)",
            pointBackgroundColor: "rgba(255,99,132,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(255,99,132,1)",
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: dcf,
            spanGaps: false,
        }]
    };

    var myChart = new Chart(ctx, {
        type: 'line',
        data: plotData,
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }],
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Years'
                    }
                }]
            }
        }
    });

}

function render_diagram_details(diagramdetail) {
    var totalcost;
    var system_id = diagramdetail['sysid'];
    let sysdetail = systemdetail.find(o => o.id === system_id);
    $("#diagName").html(diagramdetail['description']);

    if (diagramdetail['length'] == 0) {
        $("#diagAreaLength").html("Area: " + parseFloat((diagramdetail['area'] / 10000)).toFixed(2) + " ha.");
        if (diagramdetail['cost_override'] !== 0) {
            if (diagramdetail['cost_override_type'] == 'total') {
                totalcost = parseFloat(diagramdetail['cost_override']).toFixed(2);
            } else {
                totalcost = parseFloat((diagramdetail['area'] / 10000)).toFixed(2) * diagramdetail['cost_override'];
            }
        } else {
            totalcost = parseFloat((diagramdetail['area'] / 10000)).toFixed(2) * sysdetail['syscost'];

        }

    } else if (diagramdetail['area'] == 0) {
        $("#diagAreaLength").html("Length: " + diagramdetail['length'] + " km.");
        totalcost = parseFloat(diagramdetail['length']) * sysdetail['syscost'];
    }

    $("#sysCost").html("Total cost: " + abbrNum(totalcost, 2) + " EUR");
    inputLayer.clearLayers();
    var diagramLayer = L.geoJSON(diagramdetail['geojson'], {
        style: miniMapstyleComp
    }).addTo(inputLayer);
    inputmap.fitBounds(inputLayer.getBounds());

    function isNumeric(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    }

    diagram_cost_details.initCost = parseInt(totalcost);
    diagram_cost_details.acfCost = 100000;
    diagram_cost_details.aopexCost = 0;
    diagram_cost_details.asgaCost = 0;

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
                var npvHTML = "<tr><th class='header initCol'>Title</th><th class='finheader'>Financial Data</th><th class='aaheader'>Asset Data</th><th class='systemheader'>System</th>";
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
                    var diagrowHTMLnpv = "<tr class=" + "'" + cursys.id + "'" + "><td class='assetdetails initCol'>" +
                        curdiagprops.description + "<br>(" + projectorpolicy + ")</td>" + "<td class=" +
                        "'fin-" + curdiagid + "'" + ">" + '<button type="button" class="btn btn-link" onclick="get_financials(' + "'" + curdiagid + "'" + ')"><span class="glyphicon glyphicon-wrench" aria-hidden="true"></i> Modify</button> ' + "</td>" + "<td class=" +
                        "'aa-" + curdiagid + "'" + ">" + '<button type="button" class="btn btn-link" onclick="get_asset_details(' + "'" + curdiagid + "'" + ')"><span class="glyphicon glyphicon-wrench" aria-hidden="true"></i> Modify</button> ' + "</td>" + "<td class=" + "system-" +
                        curdiagid + "'" +
                        ">" + cursys.sysname + "</td>";
                    yrCounter = 0;
                    diagrowHTMLnpv += "</tr>";
                    $('#npv > tbody').append(diagrowHTMLnpv);
                }
            }
        }
    }
    systems = sys;
}

function destroyTables() {
    if ($.fn.DataTable.isDataTable('#npv')) {
        npv_table.destroy();
    }
}

function initCostSliders(defaultvalues) {
    const totalcost = (defaultvalues['capex'] == "0") ? parseInt(diagram_cost_details.initCost) : parseInt(defaultvalues['capex']);

    const acf = (defaultvalues['acf'] == 0) ? parseInt(totalcost * 0.1) : defaultvalues['acf'];
    const opex = (defaultvalues['opex'] == 0) ? parseInt(totalcost * 0.05) : defaultvalues['opex'];
    const asga = (defaultvalues['asga'] == 0) ? parseInt(totalcost * 0.01) : defaultvalues['asga'];

    const capex_start = (defaultvalues.hasOwnProperty("capex_start")) ? defaultvalues["capex_start"] : 0;

    const capex_end = (defaultvalues.hasOwnProperty("capex_end")) ? defaultvalues["capex_end"] : 1;

    const acf_start = (defaultvalues.hasOwnProperty("acf_start")) ? defaultvalues["acf_start"] : 0;

    $("#initcost-slider").val(totalcost);
    $("#acf-slider").val(acf);
    $("#aopex-slider").val(opex);
    $("#asga-slider").val(asga);
    $("#initcost-syear").val(capex_start);
    $("#initcost-eyear").val(capex_end);
    $("#acf-syear").val(acf_start);

    var costcleave = new Cleave('#initcost-slider', {
        numeral: true,
        numeralThousandsGroupStyle: 'thousand',
        onValueChanged: function (e) {
            initCost = e.target.rawValue;
        }
    });

    var acfcleave = new Cleave('#acf-slider', {
        numeral: true,
        numeralThousandsGroupStyle: 'thousand',
        onValueChanged: function (e) {
            acfCost = e.target.rawValue;
        }
    });

    var aopexcleave = new Cleave('#aopex-slider', {
        numeral: true,
        numeralThousandsGroupStyle: 'thousand',
        onValueChanged: function (e) {
            aopexCost = e.target.rawValue;
        }
    });

    var asagacleave = new Cleave('#asga-slider', {
        numeral: true,
        numeralThousandsGroupStyle: 'thousand',
        onValueChanged: function (e) {
            asgaCost = e.target.rawValue;
        }
    });


}

function initpercentSliders(defaultvalues) {

    const acfg = (defaultvalues.hasOwnProperty("acfg")) ? defaultvalues["acfg"] * 100 : 0;
    const wacc = (defaultvalues.hasOwnProperty("wacc")) ? defaultvalues["wacc"] * 100 : 0;

    $("#acfg-slider").ionRangeSlider({
        min: 0,
        max: 20,
        from: acfg,
        step: 0.05,
        postfix: "%",
        grid: true,
        prettify_enabled: true
    });
    $("#wacc-slider").ionRangeSlider({
        min: 0,
        max: 20,
        step: 0.05,
        from: wacc,
        postfix: "%",
        grid: true,
        prettify_enabled: true
    });
}
// initpercentSliders();
// computeNPV();

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function get_financials(diagram_id) {
    var url = '/get_financials/';
    const data = {
        'projectid': projectid, 'diagramid': diagram_id, 'apitoken': apitoken,
        "_csrf": csrf
    };
    diagramid = diagram_id;
    var promise = $.ajax({
        url: url,
        type: 'POST',
        data: data
    });

    promise.done(function (diagram_data) {
        // console.log(diagram_data)
        
        $("#financial-details").removeClass('hidden');
        $("#asset-details").addClass('hidden');
        render_diagram_details(diagram_data.opts.diagramdetail);
        initCostSliders(diagram_data.opts.defaultvalues);
        initpercentSliders(diagram_data.opts.defaultvalues);
        humane.log("Data successufully received", {
            addnCls: 'humane-flatty-success'
        });
        computeNPV();
    });

    promise.fail(function (data) {

        $("#financial-details").addClass('hidden');
        $("#asset-details").addClass('hidden');
        humane.log("Error in receiving data, the administrators have been notified", {
            addnCls: 'humane-flatty-error'
        });
    });


}
