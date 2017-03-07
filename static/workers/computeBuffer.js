importScripts('../js/turf.min.js');

function computeBufferSubstract(buffer, diagGJ) {
    var buffer = parseFloat(buffer);
    var dGJ = JSON.parse(diagGJ);
    var featlen = dGJ.features.length;
    var opFC = { "type": "FeatureCollection", "features": [] };
    var submitFC = { "type": "FeatureCollection", "features": [] };
    for (var x = 0; x < featlen; x++) {
        var curfeat = dGJ['features'][x];
        var curfeatprops = curfeat.properties;
        var newFeat = turf.buffer(curfeat, buffer, 'kilometers');
        var diff = turf.difference(newFeat, curfeat);
        diff.properties = curfeatprops;
        opFC.features.push(diff);
    }

    self.postMessage({
        'output': JSON.stringify(opFC)
    });

}

self.onmessage = function(e) {
    computeBufferSubstract(e.data.buffer, e.data.diagGJ);
}