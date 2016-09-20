var CustomMap = (function () {

    var MyModule = function (elm, settings) {
        this.elm = elm;
        this.options = {
            numberOfZoomLevels: 4,
            horizontalNumberOfParts: 2,
            verticalNumberOfParts: 2,
            controlStepSize: 50,// px
            zoomStepSize: 0.1,// factor of size of map
            initialZoomFactor: 1,// factor of size of map
            initialRelativePosition: {x: 0.5, y: 0.5},
            cssAnimationTime: 0.4,//seconds
            classes: {
                view: 'view',
                map: 'map',
                controls: 'controls',
                controlButton: 'control-button',
                upButton: 'up-button', 
                rightButton: 'right-button', 
                downButton: 'down-button', 
                leftButton: 'left-button',
                zoomInButton: 'zoom-in-button',
                resetZoomButton: 'reset-zoom-button',
                zoomOutButton: 'zoom-out-button',
                initiated: 'initiated',
                marker: 'marker'
            },
            innerHtml: {
                upButton: '^', 
                rightButton: '>', 
                downButton: 'v', 
                leftButton: '<',
                zoomInButton: '+',
                resetZoomButton: 'o',
                zoomOutButton: '-'
            }
        };
        // overwrite options with user defined settings
        for (setting in settings) {
            if (settings.hasOwnProperty(setting)) {
                this.options[setting] = settings[setting];
            }
        }
        this.init();
    }

    MyModule.prototype = {
        init: function () {
            this.partElms = [];
            this.markers = [];
            this.createElements();
            this.zoom(this.options.initialZoomFactor, {x: 0.5, y: 0.5});
            this.bindings();
        },
        bindings: function () {
            window.addEventListener('resize', this.windowResize.bind(this));
        },
        windowResize: function () {
            this.positionMapRelative(this.position);
        },
        createElements: function () {
            this.mapElm = document.createElement('div');
            this.mapElm.classList.add(this.options.classes.map);
            this.viewElm = document.createElement('div');
            this.viewElm.classList.add(this.options.classes.view);
            this.viewElm.appendChild(this.mapElm);
            this.elm.appendChild(this.viewElm);
            this.createMapParts(this.mapElm, 0);
            this.mapElm.initialWidth = this.mapElm.scrollWidth;
            this.mapElm.initialHeight = this.mapElm.scrollHeight;
            this.mapElm.style.width = this.mapElm.initialWidth + "px";
            this.mapElm.style.height = this.mapElm.initialHeight + "px";
            this.mapElm.style.padding = 0;
            this.controlsElm = document.createElement('div');
            this.controlsElm.classList.add(this.options.classes.controls);
            this.elm.appendChild(this.controlsElm);
            this.helpers.forEach(["up", "right", "down", "left", "zoomIn", "resetZoom", "zoomOut"], this.createControlElm.bind(this));
        },
        createControlElm: function (name) {
            this[name + "ButtonElm"] = document.createElement('div');
            this.upButtonElm = document.createElement('div');
            this[name + "ButtonElm"].classList.add(this.options.classes[name + "Button"]);
            this[name + "ButtonElm"].classList.add(this.options.classes.controlButton);
            this[name + "ButtonElm"].innerHTML = this.options.innerHtml[name + "Button"];
            this.controlsElm.appendChild(this[name + "ButtonElm"]);
            this[name + "ButtonElm"].addEventListener('click', this[name + "ButtonElmClick"].bind(this));
        },
        upButtonElmClick: function () {
            var newY = this.position.y - (this.options.controlStepSize / this.mapElm.scrollHeight);
            this.positionMapRelative({x: this.position.x, y: newY});
        },
        rightButtonElmClick: function () {
            var newX = this.position.x + (this.options.controlStepSize / this.mapElm.scrollWidth);
            this.positionMapRelative({x: newX, y: this.position.y});
        },
        downButtonElmClick: function () {
            var newY = this.position.y + (this.options.controlStepSize / this.mapElm.scrollHeight);
            this.positionMapRelative({x: this.position.x, y: newY});
        },
        leftButtonElmClick: function () {
            var newX = this.position.x - (this.options.controlStepSize / this.mapElm.scrollWidth);
            this.positionMapRelative({x: newX, y: this.position.y});
        },
        zoomInButtonElmClick: function () {
            var newZoomFactor = this.zoomFactor + this.options.zoomStepSize;
            this.zoom(newZoomFactor, this.position);
        },
        resetZoomButtonElmClick: function () {
            this.zoom(this.options.initialZoomFactor, this.options.initialRelativePosition);
        },
        zoomOutButtonElmClick: function () {
            var newZoomFactor = this.zoomFactor - this.options.zoomStepSize;
            this.zoom(newZoomFactor, this.position);
        },
        createMapParts: function (elm, zoomLevel) {
            if (zoomLevel === 0){
                var partElm = this.createPartElm(zoomLevel, 0);
                elm.appendChild(partElm);
                this.createMapParts(partElm, zoomLevel + 1);
            } else if (zoomLevel < this.options.numberOfZoomLevels) {
                for (var i = 0; i < this.options.horizontalNumberOfParts * this.options.verticalNumberOfParts; i += 1) {
                    var partElm = this.createPartElm(zoomLevel, i, elm);
                    partElm.style.width = (100 / this.options.horizontalNumberOfParts) + "%";
                    partElm.style.height = (100 / this.options.verticalNumberOfParts) + "%";
                    elm.appendChild(partElm);
                    this.createMapParts(partElm, zoomLevel + 1);
                }
            }
        },
        createPartElm: function (zoomLevel, i, parentElm) {
            var partElm = document.createElement('div');
            partElm.zoomLevel = zoomLevel;
            if (parentElm) {
                partElm.parentElm = parentElm;
                partElm.partIndex = i + parentElm.partIndex * this.options.horizontalNumberOfParts * this.options.verticalNumberOfParts;
            } else{
                partElm.partIndex = i;
            }
            partElm.classList.add('part');
            partElm.classList.add('zoom-level-' + zoomLevel);
            partElm.classList.add('part-' + partElm.partIndex);
            this.partElms.push(partElm);
            return partElm;
        },
        setBoundaries: function (boundaries) {
            this.boundaries = boundaries;
        },
        addMarker: function (imageSource, width, height, offsetLeft, offsetTop) {
            var marker = {
                elm: document.createElement('div')
            }
            marker.elm.style.backgroundImage = 'url(' + imageSource + ')';
            marker.elm.classList.add(this.options.classes.marker);
            if (width) marker.elm.style.width = width + 'px';
            if (height) marker.elm.style.height = height + 'px';
            if (offsetLeft) marker.elm.style.marginLeft = offsetLeft + 'px';
            if (offsetTop) marker.elm.style.marginTop = offsetTop + 'px';
            this.mapElm.appendChild(marker.elm);
            this.markers.push(marker);
            return marker;
        },
        setMarker: function (marker, coordinates) {
            var position = this.relativePosition(coordinates);
            marker.elm.style.left = (position.x * 100) + '%';
            marker.elm.style.top = (position.y * 100) + '%';
        },
        removeMarker: function (marker) {
            this.mapElm.removeChild(marker.elm);
            this.markers.splice(this.markers.indexOf(marker), 1);
        },
        relativePosition: function (coordinates) {
            return {
                x: (coordinates.lat - this.boundaries.topRight.lat) / (this.boundaries.bottomLeft.lat - this.boundaries.topRight.lat),
                y: (coordinates.long - this.boundaries.topRight.long) / (this.boundaries.bottomLeft.long - this.boundaries.topRight.long)
            }
        },
        positionMapRelative: function (position, mapSizeAfterZoom) {
            // mapSizeAfterZoom is needed when css animation prevents scrollWidth en scrollHeight to be calculated
            this.position = position;
            var centerOfView = {};
            if (mapSizeAfterZoom) {
                centerOfView = {
                    x: (this.viewElm.scrollWidth / 2) / mapSizeAfterZoom.width,
                    y: (this.viewElm.scrollHeight / 2) / mapSizeAfterZoom.height
                }
            } else {
                centerOfView = {
                    x: (this.viewElm.scrollWidth / 2) / this.mapElm.scrollWidth,
                    y: (this.viewElm.scrollHeight / 2) / this.mapElm.scrollHeight
                }
            }
            setTimeout(this.setBackgroundImages.bind(this), this.options.cssAnimationTime * 1000);
            this.mapElm.style.transform = "translate3d(" + -(position.x - centerOfView.x) * 100 + "%, " + -(position.y - centerOfView.y) * 100 + "%, 0)";
        },
        setBackgroundImages: function () {
            this.helpers.forEach(this.partElms, function (partElm, idx) {
                if (partElm.zoomLevel <= this.zoomLevel && this.inView(partElm)){
                    partElm.style.opacity = 1;
                    if (partElm.zoomLevel === this.zoomLevel && !partElm.backgroundSet) {
                        partElm.style.backgroundImage = "url(images/zoom-level-" + partElm.zoomLevel + "/part-" + partElm.partIndex + ".jpg)";
                        partElm.backgroundSet = true;
                    }
                } else {
                    partElm.style.opacity = 0;
                }
            }.bind(this));
        },
        positionMapAbsolute: function (coordinates) {
            this.positionMapRelative(this.relativePosition(coordinates));
        },
        zoom: function (zoomFactor, zoomOrigin) {
            if (zoomFactor < 1)
                zoomFactor = 1;
            if (zoomFactor > this.options.numberOfZoomLevels)
                zoomFactor = this.options.numberOfZoomLevels;
            this.zoomFactor = zoomFactor;
            this.zoomLevel = Math.ceil(zoomFactor) - 1;

            var mapSize = {
                width: this.mapElm.initialWidth * zoomFactor,
                height: this.mapElm.initialHeight * zoomFactor
            };
            this.mapElm.style.width = mapSize.width + "px";
            this.mapElm.style.height = mapSize.height + "px";
            this.mapElm.style.transform = "scale(1)";
            this.positionMapRelative(zoomOrigin, mapSize);
        },
        inView: function (elm) {
            return (
                (elm.offsetTop + elm.offsetHeight > this.viewElm.offsetTop || elm.offsetTop < this.viewElm.offsetTop + this.viewElm.offsetHeight) &&
                (elm.offsetLeft + elm.offsetWidth > this.viewElm.offsetLeft || elm.offsetLeft < this.viewElm.offsetLeft + this.viewElm.offsetWidth)
            );
        },
        helpers: {
            forEach: function (arr, func) {
                for (var i = 0; i < arr.length; i += 1) {
                    func(arr[i], i);
                }
            }
        }
    };

    return MyModule;

}());

/*

on pinch zoomFactor en zoomOrigin moeten worden bepaald en dan moet this.zoom worden aangeroepen
on move position moet worden bepaald en dan moet this.positionMapRelative worden aangeroepen

============

zoom mag niet minder dan wanneer map niet groot genoeg is om view te vullen
position mag niet verder dan wanneer map niet groot genoeg is om view te vullen

bij verminderen zoom bij raken van rand van map aan de rand van de view, moet positie van map zo veranderen dat map view vullend blijft, totdat dit niet meer kan
hierbij override deze functionaliteit dus de zoomOrigin

============

voor een mooie animatie moet scale worden gebruikt en als die klaar is, moet width, height en translate3d worden gezet zonder animatie  

*/