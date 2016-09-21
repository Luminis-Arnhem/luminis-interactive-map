(function () {
    var customMapElm = document.querySelector('.custom-map');

    customMapElm.customMap = new CustomMap(customMapElm, {
        innerHtml: {
            upButton: '<svg class="icon" viewBox="-4 -4 108 108"><use xlink:href="#up"></use></svg>',
            rightButton: '<svg class="icon" viewBox="-4 -4 108 108"><use xlink:href="#right"></use></svg>',
            downButton: '<svg class="icon" viewBox="-4 -4 108 108"><use xlink:href="#down"></use></svg>',
            leftButton: '<svg class="icon" viewBox="-4 -4 108 108"><use xlink:href="#left"></use></svg>',
            zoomInButton: '<img class="icon" src="images/zoomin.png">',
            resetZoomButton: '<img class="icon" src="images/showall.png">',
            zoomOutButton: '<img class="icon" src="images/zoomout.png">',
            centreButton: '<img class="icon" src="images/centre.png">',
            zoomLevelElm: '<img src="images/zoom-level-0/part-0.svg" class="svg-map">'
        },
        createPartElms: false,
        useBackgroundImages: false
    });

    var boundaries = {
        bottomRight: {
            lat: 51.969524,
            long: 5.933673
        },
        topLeft: {
            lat: 51.965771,
            long: 5.956124
        }
    };
    customMapElm.customMap.setBoundaries(boundaries);


    customMapElm.marker1 = customMapElm.customMap.addMarker("images/marker.png", 50, 50, -25, -25);

//Intialize Out of View
    customMapElm.customMap.setMarker(customMapElm.marker1, {
        lat: boundaries.bottomRight.lat + 10,
        long: boundaries.bottomRight.long + 10
    });

    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
    function showPosition(position) {
        console.log(position.coords);
        customMapElm.customMap.setMarker(customMapElm.marker1, {
            lat: position.coords.latitude,
            long: position.coords.longitude
        });
        // customMapElm.customMap.positionMapAbsolute({
        //     lat: 51.7172969,
        //     long: 5.8874715
        // });

    }

    function errorHandler(err) {
        if(err.code == 1) {
            alert("Error: Access is denied!");
        }

        else if( err.code == 2) {
            alert("Error: Position is unavailable!");
        }
    }
}());
