nokia.mh5.assetsPath = "http://api.maps.nokia.com/mobile/1.0.2/lib/";
/*  Please register on http://api.developer.nokia.com/ 
*   and obtain your own developer's API key 
*/
nokia.mh5.appId = "Lj2xAELG_oEPDshmhFoV";
nokia.mh5.appCode = "SJeNeucfvCooCUyCs7IoRw";

var map = new nokia.mh5.components.Map({
    center: {
        longitude: 13.38,
        latitude: 52.51
    },
    zoom: 1,
    schema: "normal.day",
    tracking: false,
    listeners: {
        poiclick: function (evt) {
            evt.preventDefault();
            var poi = evt.data[0];
            this.showInfoBubble(poi, {
                content: ["title", "description"],
                title: poi.data.name,
                description: poi.data.description,
                left: poi.info_.image, 
                leftDelimiter: true
            });
            
        },
        maplongpress: function (evt) {
            evt.preventDefault();
            //create new new tag to write
            if (nfcPoi !== undefined) {
                this.removePoi(nfcPoi);
            }

            newNFCtag.latitude = Math.round(parseFloat(evt.data.latitude) * 1000000) / 1000000;
            newNFCtag.longitude = Math.round(parseFloat(evt.data.longitude) * 1000000) / 1000000;
            newNFCtag.name = "NEW tag";
            nfcPoi = this.createPoi("../images/tagNew.png", { longitude: newNFCtag.longitude, latitude: newNFCtag.latitude, name: newNFCtag.name, description: newNFCtag.latitude + " / " + newNFCtag.longitude });
            // alternative icon for debug
            //../images/tagNew.png
            // http://download.vcdn.nokia.com/p/d/places2/icons/categories/06.icon

            this.showInfoBubble(nfcPoi, {
                content: ["title", "description"],
                title: nfcPoi.data.name,
                description: nfcPoi.data.description,
                left: nfcPoi.info_.image,
                leftDelimiter: true
            });
            //document.getElementById("btnCreateNewTag").setAttribute("style", "display:block");
        }
    }
});

// in case that the user hase manually stored some tiles before, map jumps directly there.
map.showStoredTiles(function () { console.log("Jap tiles loaded") }, function () { console.log("Ops error") });

document.getElementById("mapContainer").appendChild(map.root);

function removeNewTagPoi() {
    map.removePoi(nfcPoi);
    makeMapFullScreen();
}

function startDownloadingTiles() {
    navigator.notification.confirm(
        'It can take some time and cause traffic to download the tiles. Make sure you connected to a fast network.',
        storeTilesLocal,
        'Downloading map tiles',
        'Start, Cancel'
    );
}

function storeTilesLocal(buttonIndex) {
    console.log("buttonIndex=" + buttonIndex);
    // buttonIndex = 1 "Start" means to start downloading map tiles for offline usage
    // buttonIndex = 2 "Cancel"
    if (buttonIndex == 1) {
        $.mobile.loading('show', {
            text: 'Downloading tiles.',
            textVisible: true
        });

        var progressObject = map.storeTiles({
            box: map.box,
            callback: function (event) {
                switch (event.type) {
                    case "error":
                        // handle error
                        //console.log(event.message);
                        //console.log("TILE LOAD ERROR");
                        errorOfflineTilesLoading(event.message);
                        break;
                    case "progress":
                        // handle status change based on 
                        // event.data.current and event.data.total
                        //console.log("TILES IN PROGESS");
                        break;
                    case "load":
                        // success
                        //console.log("TILES ARE STORED");
                        endOfflineTilesLoading();
                        break;
                }
            }
        });
    }
}

function endOfflineTilesLoading() {
    $.mobile.loading('hide');
    alert('Map tiles successfully stored.', 'Ok', 'Done');
}

function errorOfflineTilesLoading(error) {
    $.mobile.loading('hide');
    alert('An error has occurred. Try again later.' + error);
}