function init() {
    document.addEventListener('deviceready', ready, false);
}

// TODO need better html make it clear this is record info


function template(record) {
    var id = "",
        tnf = tnfToString(record.tnf),
        recordType = nfc.bytesToString(record.type),
        payload,
        html,
        coords;

        
    if (record.id && (record.id.length > 0)) {
        id = "Record Id: <b>" + nfc.bytesToString(record.id) + "<\/b><br/>";
    }

    if (recordType === "T") {
        var langCodeLength = record.payload[0],
        text = record.payload.slice((1 + langCodeLength), record.payload.length);
        payload = nfc.bytesToString(text);

    } else if (recordType === "U") {
        console.log(record);
        var identifierCode = record.payload.shift(),
            uri =  nfc.bytesToString(record.payload);

        if (identifierCode !== 0) {
            // TODO decode based on URI Record Type Definition
            console.log("WARNING: uri needs to be decoded");
        }
        payload = "<a href='" + uri + "'>" + uri + "<\/a>";

        if (uri.match('geo:')) {
            var splitPayload = uri.split('geo:');
            coords = splitPayload[1].split(',');
            scannedNFCdata.latitude = coords[0];
            scannedNFCdata.longitude = coords[1];
        }
    } else if(recordType === "Sp") {
        payload = nfc.bytesToString(record.payload);
        
        if (payload.match('geo:')) {
            //payload= Ugeo:52.518708,13.388547QTenFriedrichstraﬂe
            var splitPayload = payload.split('geo:');
            if (splitPayload[1].match('en'))
                splitPayload[1] = splitPayload[1].split('en');
            else if (splitPayload[1].match('de'))
                splitPayload[1] = splitPayload[1].split('de');

            payload = splitPayload[1];
            // text in smart poster
            scannedNFCdata.text = payload[1];
            // coordinates split
            payload = payload[0];
            coords = payload.split('Q');
            coords = coords[0].split(',');
            scannedNFCdata.latitude = coords[0];
            scannedNFCdata.longitude = coords[1];
        }

        payload = nfc.bytesToString(record.payload);
    } else {
        // attempt display as a string
        payload = nfc.bytesToString(record.payload);
    }

    html = id + "TNF: <b>" + tnf + "<\/b><br/>";

    if (record.tnf !== ndef.TNF_EMPTY) {
        html += "Record Type: <b>" + recordType + "<\/b>" +
                 "<br/>" + payload + "<br/>";
    }

    return html;
}


function showProperty(parent, name, value) {
    var dt, dd;
    dt = document.createElement("dt");
    dt.innerHTML = name;
    dd = document.createElement("dd");
    dd.innerHTML = value;
    parent.appendChild(dt);
    parent.appendChild(dd);
}

function clearScreen() {
    $("#btnShowGeoTagOnMap").css('display', 'none');
    document.getElementById("tagContents").innerHTML = "";
}

function showInstructions() {
    document.getElementById("tagContents").innerHTML =
    "<div id='instructions'>" +
    " <p>Scan a tag to begin.<\/p>" +
    " <p><\/p>" +    
    "<\/div>";
}

function onNfc(nfcEvent) {
    console.log(JSON.stringify(nfcEvent.tag));
    clearScreen();

    var tag = nfcEvent.tag,
        display = document.getElementById("tagContents"),
        meta = document.createElement('dl');

    display.appendChild(document.createTextNode("Scanned a non-NDEF NFC tag"));
    display.appendChild(meta);

    if (tag.id) {
        showProperty(meta, "Id", nfc.bytesToHexString(tag.id));
    }

    navigator.notification.vibrate(100);
}

function onNdef(nfcEvent) {
    
    console.log("nfcEvent = " + nfcEvent);
    console.log("nfcEvent.tag = " + nfcEvent.tag);
    console.log("JSON.stringify(nfcEvent.tag) = " + JSON.stringify(nfcEvent.tag));
    console.log("JSON.stringify(nfcEvent.tag.ndefMessage) = " + JSON.stringify(nfcEvent.tag.ndefMessage));
    console.log("JSON.stringify(nfcEvent.tag.ndefMessage[0]) = " + JSON.stringify(nfcEvent.tag.ndefMessage[0]));
    console.log("nfc.bytesToString(nfcEvent.tag.ndefMessage[0].payload) = " + nfc.bytesToString(nfcEvent.tag.ndefMessage[0].payload));
    console.log("JSON.stringify(nfcEvent.tag.ndefMessage[0].payload[0]) = " + JSON.stringify(nfcEvent.tag.ndefMessage[0].payload[0]));
    console.log("nfc.bytesToString(nfcEvent.tag.ndefMessage[0].payload[0]) = " + nfc.bytesToString(nfcEvent.tag.ndefMessage[0].payload[0]));
    
    clearScreen();

    var tag = nfcEvent.tag;
    var records = tag.ndefMessage || [],
    display = document.getElementById("tagContents");
    display.appendChild(
        document.createTextNode(
            "Scanned an NDEF tag with " + records.length + " record" + ((records.length === 1) ? "": "s")
        )
    );

    // Display Tag Info
    var meta = document.createElement('dl');
    display.appendChild(meta);

    if (device.platform.match(/Android/i)) {
        if (tag.id) {
            showProperty(meta, "Id", nfc.bytesToHexString(tag.id));
        }
        showProperty(meta, "Tag Type", tag.type);
        showProperty(meta, "Max Size", tag.maxSize + " bytes");
        showProperty(meta, "Is Writable", tag.isWritable);
        showProperty(meta, "Can Make Read Only", tag.canMakeReadOnly);
    
    } else if (device.platform.match(/Win.+/i)) {
        // don't know how to get tag meta info /yet/ for Windows Phone

    } else if (navigator.userAgent.indexOf("BB10") > -1) {
        // don't know how to get tag meta info /yet/ for BB10

    } else { // assuming blackberry 7
        if (tag.serialNumber) {
            showProperty(meta, "Serial Number", nfc.bytesToHexString(tag.serialNumber));
        }
        showProperty(meta, "Tag Type", tag.tagType);
        showProperty(meta, "Free Space", tag.freeSpaceSize + " bytes");
        showProperty(meta, "Is Writable", !tag.isLocked);
        showProperty(meta, "Can Make Read Only", tag.isLockable);
    }


    if (writerMode) {
        writeTag(nfcEvent);
        onConfirm();
    } else {
        // Display Record Info
        for (var i = 0; i < records.length; i++) {
            var record = records[i],
            p = document.createElement('p');
            p.innerHTML = template(record);
            display.appendChild(p);
        }
        navigator.notification.vibrate(100);

        if (scannedNFCdata.longitude > 0) {
            readNfcPoi = map.createPoi("../images/tag.png", { longitude: scannedNFCdata.longitude, latitude: scannedNFCdata.latitude, name: decodeURIComponent(scannedNFCdata.text), description: scannedNFCdata.latitude + " / " + scannedNFCdata.longitude });
            map.moveTo(readNfcPoi);
            $("#btnShowGeoTagOnMap").css('display', 'block');
            document.getElementById("readerInstructionTitle").innerHTML = "Success. Tag found.";
            scannedNFCdata.longitude = 0;
        }
    }
}

function writeTag(nfcEvent) {
    var ndefRecordType = "Sp";
    var id = [];
    // Smart Poster with URI + Text
    var geoUri = "geo:" + newNFCtag.latitude + "," + newNFCtag.longitude,
        geoText = encodeURIComponent($("#inputName").val()),
        geoTextLength = geoText.length,
        charCodeArr = function (str) {
            var arr = [];
            for (var i = 0; i < str.length; i++) {
                arr.push(str.charCodeAt(i));
            }
            return arr;
        };

    // Initial payload with special \x91\x01 characters
    var payloadArr = [145, 1];

    // Add geo URI length + 1
    payloadArr.push(geoUri.length + 1);

    // Add special U code and 0
    payloadArr = payloadArr.concat([85, 0]);

    // Add geo URI as a char code array to the payload
    payloadArr = payloadArr.concat(charCodeArr(geoUri));

    // Add special Q code and 1 
    payloadArr = payloadArr.concat([81, 1]);

    // Add geo text length + 3. 1 for special code \x02 and 2 for "en"
    payloadArr.push(geoTextLength + 3);

    // Add special "T" for Smart Tag text
    payloadArr.push('T'.charCodeAt(0));

    // Add special \x02
    payloadArr.push(2);

    // Add special identifier for "en" language
    payloadArr = payloadArr.concat(charCodeArr("en"));

    // Add geo URI as a char code array to the payload
    payloadArr = payloadArr.concat(charCodeArr(geoText));

    var record = ndef.record(ndef.TNF_WELL_KNOWN, nfc.stringToBytes(ndefRecordType), id, payloadArr),
    ndefMessage = [];

    // Add windows phone launch app record. Hard coded for a geoNFC launch!
    var enableWindowsPhoneLaunchAppRecord = $('#slider').attr('value');
    if (enableWindowsPhoneLaunchAppRecord == "on") {
        var payloadArrWindowsLaunchAppRecord = [0, 1, 12, 87, 105, 110, 100, 111, 119, 115, 80, 104, 111, 110, 101, 38, 123, 56, 54, 53, 54, 102, 56, 55, 48, 45, 98, 55, 54, 97, 45, 52, 98, 56, 56, 45, 97, 56, 102, 51, 45, 97, 99, 52, 54, 100, 99, 50, 49, 56, 101, 53, 51, 125, 0, 12, 117, 115, 101, 114, 61, 100, 101, 102, 97, 117, 108, 116]
        var typeU = [119, 105, 110, 100, 111, 119, 115, 46, 99, 111, 109, 47, 76, 97, 117, 110, 99, 104, 65, 112, 112];
        var ndefRecordNext = ndef.record(ndef.TNF_ABSOLUTE_URI, typeU, id, payloadArrWindowsLaunchAppRecord);
        ndefMessage.push(ndefRecordNext);
    }

    ndefMessage.push(record);

    // triggers the write prozess.
    nfc.write(ndefMessage, function () { showSuccessConfirm(); }, function () { showFailConfirm(); });
}

// Show a custom confirmation dialog that informs the user that the tag is successfully written
function showSuccessConfirm() {
    navigator.notification.confirm(
        'Your tag was successfully written',  // message
        onConfirm,              // callback to invoke with index of button pressed
        'Done',            // title
        'Ok'          // buttonLabels
    );
}

// Something goes wrong to write the tag
function showFailConfirm() {
    navigator.notification.confirm(
        'We had problems to write your tag. Please contact us to fix it.',  // message
        onConfirm,              // callback to invoke with index of button pressed
        'Error',            // title
        'Ok'          // buttonLabels
    );
}

function onConfirm() {
    writerMode = false;
    readNfcPoi = map.createPoi("../images/tag.png", { longitude: $("#inputTagLon").val(), latitude: $("#inputTagLat").val(), name: decodeURIComponent($("#inputName").val()), description: $("#inputTagLat").val() + " / " + $("#inputTagLon").val() });
    map.moveTo(readNfcPoi);
    removeNewTagPoi();
    $.mobile.changePage("../index.html");
}

var ready = function () {
    function failure(reason) {
        navigator.notification.alert(reason, function() {}, "There was a problem");
    }

    nfc.addNdefListener(
        onNdef,
        function() {
            console.log("Listening for NDEF tags.");
        },
        failure
    );
    
    if (device.platform == "Android") {
        function win() {
            console.log("Listening for NDEF tags");
        }
  
        function fail() {
            alert('Failed to register NFC Listener');
        }

        // Android reads non-NDEF tag. BlackBerry and Windows don't.
        nfc.addTagDiscoveredListener(onNfc,win,failure);


        // Android launches the app when tags with mime type text/pg are scanned
        // because of an intent in AndroidManifest.xml.
        // phonegap-nfc fires an ndef-mime event (as opposed to an ndef event)
        // the code reuses the same onNfc handler
        nfc.addMimeTypeListener(
            'text/pg',
            onNdef,
            function() {
                console.log("Listening for NDEF mime tags with type text/pg.");
            },
            failure
        );

    }
};

function tnfToString(tnf) {
    var value = tnf;
    
    switch (tnf) {
    case ndef.TNF_EMPTY:
        value = "Empty";
        break; 
    case ndef.TNF_WELL_KNOWN:
        value = "Well Known";
        break;     
    case ndef.TNF_MIME_MEDIA:
        value = "Mime Media";
        break;     
    case ndef.TNF_ABSOLUTE_URI:
        value = "Absolute URI";
        break;     
    case ndef.TNF_EXTERNAL_TYPE:
        value = "External";
        break;     
    case ndef.TNF_UNKNOWN:
        value = "Unknown";
        break;     
    case ndef.TNF_UNCHANGED:
        value = "Unchanged";
        break;     
    case ndef.TNF_RESERVED:
        value = "Reserved";
        break;     
    }
    return value;
}