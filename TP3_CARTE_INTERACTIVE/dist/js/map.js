// Google maps API callback
this.initMap = () => {
    this.maps_1 = new Map('map');
    new Timer();
};

class Map {
    /**
     * Création de la map sur l'élément ciblé
     * @param {HTMLElement} elementId
     */
    constructor(elementId) {
        this.markers = [];
        this.elementId = elementId;
        let domElement = document.getElementById(this.elementId);
        // Initialisation de la map 
        this.map = new google.maps.Map(domElement, {
            // Options de la map
            zoom: 16,
            center: {
                lat: 45.76,
                lng: 4.85,
            },
            mapTypeControl: false,
            disableDefaultUI: false,
            clickableIcons: false,
            fullscreenControl: false,
            streetViewControl: false,
            maxZoom: 18,
            minZoom: 13,
            styles: [{
                "featureType": "poi",
                "stylers": [{
                    "visibility": "off"
                }]
            }],
        });
        // Boutons de contôles
        let leftControlDiv = document.createElement('div');
        let geoControlDiv = document.createElement('div');
        new MapControl(leftControlDiv, "geo");
        new MapControl(geoControlDiv, "options");
        this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(leftControlDiv);
        this.map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(geoControlDiv);

        this.fetchMarkers();
    };

    // Fetch Call (Appel de l'Api)
    async fetchMarkers() {
        // Stocker l'Url de l'Api dans une variable
        const url = "https://api.jcdecaux.com/vls/v1/stations?contract=Lyon&apiKey=2875f9262fc0a640a983ed257aba380c5ce7a202";
        const fetchResult = fetch(url)
        const response = await fetchResult;
        const jsonData = await response.json();
        this.addMarkers(jsonData);
    };
    /**
     * Ajoute les marqueurs dans un tableaux puis dans un clusterer. Créé les marqueurs et la fonction de recherche 
     * @param {Object[]} markers
     */
    addMarkers(markers) {
        markers.forEach(function (marker) {
            this.markers.push(new Marker(marker, this.map, true));
        }.bind(this));
        new SearchBox(markers, this.map);
        new MarkerCluster(this.markers, this.map);
    };
};
class MapControl {
    /**
     * Création des boutons de contrôle pour la map
     * @param {HTMLElement} controlDiv
     * @param {string} funct
     */
    constructor(controlDiv, funct) {
        let controlIcon = document.createElement('div');
        if (funct === "options") {
            controlIcon.innerHTML = '<i class="fas fa-bicycle mt-2 text-white"></i>';
            controlIcon.style.backgroundColor = 'red';
            controlIcon.title = 'Cliquez ici pour afficher les options de la map';
            controlIcon.style.fontSize = '30px';
            controlIcon.addEventListener('click', function () {
                controlIcon.style.display = 'none';
                let controlText = document.createElement('div');
                let controlBikes = document.createElement('div');
                let controlStands = document.createElement('div');
                controlBikes.innerHTML = '<div class="control-text"><p>Vélo(s) disponibles <i class="fas fa-bicycle m-2"></i></p></div>';
                controlStands.innerHTML = '<div class="control-text"><p>Places(s) disponibles <i class="fas fa-parking m-2 mr-4"></i></p></div>';
                controlText.style.fontSize = '30px';
                controlText.style.backgroundColor = 'rgba(200, 200, 200, 0.2)';
                controlBikes.addEventListener('click', () => {
                    controlText.style.display = 'none';
                    controlIcon.style.display = 'block';
                    controlIcon.innerHTML = '<i class="fas fa-bicycle mt-2 text-white"></i>';
                    controlIcon.style.paddingLeft = '5.5px';
                    for (let i in maps_1.markers) {
                        maps_1.markers[i].marker.setLabel({
                            text: "" + maps_1.markers[i].marker.velos + "",
                            fontWeight: 'bold',
                            fontSize: '12px',
                            fontFamily: '"Courier New", Courier,Monospace',
                            color: 'white'
                        });
                    }
                })
                controlStands.addEventListener('click', () => {
                    controlText.style.display = 'none';
                    controlIcon.style.display = 'block';
                    controlIcon.innerHTML = '<i class="fas fa-parking m-2 text-white"></i>';
                    controlIcon.style.paddingLeft = '4px';
                    for (let i in maps_1.markers) {
                        maps_1.markers[i].marker.setLabel({
                            text: "" + maps_1.markers[i].marker.places + "",
                            fontWeight: 'bold',
                            fontSize: '12px',
                            fontFamily: '"Courier New", Courier,Monospace',
                            color: 'white'
                        });
                    }
                })
                controlText.appendChild(controlBikes);
                controlText.appendChild(controlStands);
                controlDiv.appendChild(controlText);
            });
        } else {
            controlIcon.innerHTML = '<i class="fas fa-crosshairs mt-2 ml-1 text-muted"></i>';
            controlIcon.style.backgroundColor = '#fff';
            controlIcon.title = 'Cliquez ici pour géolocaliser';
            controlIcon.style.fontSize = '30px';
            controlIcon.style.paddingTop = '1px';
            // Click event listener géolocalisation
            controlIcon.addEventListener('click', () => {
                navigator.geolocation.getCurrentPosition(position => {
                    let pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    window.maps_1.map.setCenter(pos)
                });
            });
        }
        // Defini le CSS pour l'intérieur' du contrôleur
        controlIcon.style.marginBottom = '5px';
        controlIcon.style.marginRight = '1px';
        controlIcon.style.paddingLeft = '5.6px';
        controlIcon.style.width = '50px';
        controlIcon.style.height = '50px';
        controlIcon.style.border = '0.5px solid rgb(50, 50, 50)';
        controlIcon.style.borderRadius = '50%';
        controlIcon.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlIcon.style.cursor = 'pointer';
        controlDiv.appendChild(controlIcon);


    }
}
class MarkerCluster {
    /**
     * Création d'un clusterer pour réunir tout les marqueurs de la map
     * @param {Object[]} markers
     * @param {Object} map
     */
    constructor(markers, map) {
        this.markers = markers
        this.map = map
        this.clusterMarkers = [];

        this.addCluster();
    }
    addCluster() {
        this.markers.forEach((marker) => {
            this.clusterMarkers.push(marker.marker);
        });
        window.markerClusterer = new MarkerClusterer(this.map, this.clusterMarkers, {
            imagePath: './dist/img/markerclusterer/m',
            ignoreHidden: true,
        });
    };
}



class Marker {
    /**
     * Création d'un marqueur google maps avec les informations de la station
     * @param {Object} markerConf
     * @param {Object} map
     * @param {boolean} visibility
     */
    constructor(markerConf, map, visibility) {
        // Icône si n'y a plus vélos   
        this.empty = {
            url: "./dist/img/home/pin-station.svg",
            scaledSize: new google.maps.Size(50, 50),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0, 50),
            labelOrigin: new google.maps.Point(25, 20),
        };
        // Icône si il reste des vélos     
        this.available = {
            url: "./dist/img/home/pin-station-available.svg",
            scaledSize: new google.maps.Size(50, 50),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(0, 50),
            labelOrigin: new google.maps.Point(25, 20),
        };

        this.marker = new google.maps.Marker({
            address: markerConf.address,
            places: markerConf.available_bike_stands,
            velos: markerConf.available_bikes,
            title: markerConf.dname,
            name: markerConf.name,
            position: markerConf.position,
            id: markerConf.number,
            number: markerConf.number,
            icon: (markerConf.available_bikes > 0) ? this.available : this.empty,
            label: {
                text: "" + markerConf.available_bikes + "",
                fontWeight: 'bold',
                fontSize: '12px',
                fontFamily: '"Courier New", Courier,Monospace',
                color: 'white'
            },
            animation: google.maps.Animation.DROP,
            reserved: false,
            visible: visibility,
            map: map
        });
        let fitName = this.marker.name.slice(7, this.marker.name.length)
        this.contentString = '<div class="infoWindow"><p class="mb-0"><b>' +
            fitName +
            '</b><span class="text-muted"> - N°' + this.marker.number + ' </span></br><small>' + this.marker.address + '</small></br></br><span class="text-danger infoD">' + this.marker.places +
            '</span> <i class="fas fa-parking mr-3"></i> <span class="text-danger infoD ">' +
            this.marker.velos +
            '</span>  <i class="fas fa-bicycle"></i></p></div>';


        this.infoWindow;

        // Listener
        this.marker.addListener('mouseover', () => {
            this.infoWindow = new google.maps.InfoWindow({
                content: this.contentString,
            });
            this.infoWindow.open(map, this.marker);
        });

        this.marker.addListener('mouseout', () => {
            this.infoWindow.close();
        });
        this.marker.addListener('click', () => {
            new SideWindow(map, markerConf, this.marker)
        });
    };
}

class SideWindow {
    /**
     * Création d'une SideWindow pour afficher les informations de la stations
     * @param {Object} map
     * @param {Object} marker
     * @param {Object} gmarker
     */
    constructor(map, marker, gmarker) {

        document.getElementById('searchWindow').style.display = "none";
        this.searchBox = document.getElementById('searchBox');
        this.searchInput = document.getElementById('searchInput');
        this.map = map;
        this.marker = marker;
        this.gmarker = gmarker;
        this.isOpen = false;

        // Zoom et centre sur le marqueur 
        this.map.panTo(this.gmarker.getPosition());
        this.map.setZoom(18);
        this.populateWindow(this.map)
    };

    /**
     * Popule la Sidewindow avec les informations de la station
     * @param {Object} map
     */
    populateWindow(map) {
        let text =
            '<div id ="sideWindow"><div class="p-3 mb-0 bg-muted upper-window"><button id="closeButton" class="pb-1" value=""><i class="close-icon fas fa-times"></i></button><h2 class="text-muted">' + this.marker.name + '</h2><hr class="m-0"></br><p class="mb-0"><b>' +
            this.marker.address +
            '</b><span class="text-muted"> - N°' + this.marker.number + ' </span></br></br> <span id="markerStands" class="text-danger infoD">' + this.marker.available_bike_stands +
            '</span> <i class="fas fa-parking"></i></br></br> <span id="markerBikes" class="text-danger infoD ">' +
            this.marker.available_bikes +
            '</span>  <i class="fas fa-bicycle"></i><span id="reserved" class="text-muted"></span></div></br><button id="infoButton" class="ml-2">Réserver</button></p><div id="sign" class="ml-3"><label class="sign-label">SIGNATURE :</label><canvas id="canvas" width= "200"; height= "75" class="border ml-1 mt-2 mb-3"></canvas><button id="canvasButton" type="submit">Réserver</button><div id="sign-text"></div></div></div>';

        let sideDiv = document.getElementById('content-window');
        this.searchInput.style.animation = "searchAppear 1s both";
        sideDiv.style.animation = "windowDisappear 1s forwards";
        this.isOpen = true
        sideDiv.style.display = "block";
        sideDiv.innerHTML = text;
        if (this.marker.reserved === true) {
            document.getElementById('reserved').innerHTML = " Un vélo vient d'être réservé";
        }
        let infoButton = document.getElementById('infoButton');
        if (this.marker.available_bikes === 0) {
            infoButton.style.visibility = "hidden";
        };

        // Listener
        document.getElementById("closeButton").addEventListener("click", () => this.closeWindow(sideDiv, map));
        document.getElementById("infoButton").addEventListener("click", () => new Canvas(this.marker, this.gmarker, map));
    };
    /**
     * Ferme la SideWindow
     * @param {HTMLElement} div
     * @param {Object} map
     */
    closeWindow(div, map) {
        div.style.animation = "windowAppear 1s forwards"
        this.isOpen = false;
        this.searchInput.style.animation = "searchDisappear 1s both";
        map.setZoom(16);
    };
}


class Canvas {
    /**
     * Création d'un canvas de signature
     * @param {Object} markerConf
     * @param {Object} gmarker
     * @param {Object} map
     */
    constructor(markerConf, gmarker, map) {
        // FONCTION DE RESERVATION 
        this.marker = markerConf;
        this.gmarker = gmarker;
        this.map = map;
        // Crée un canvas
        let canvas = document.getElementById('canvas');
        let ctx = canvas.getContext('2d');
        // Création de la fonction de dessin
        let isDrawing;
        this.hasDrawn = false;

        //Listener 
        canvas.onmousedown = e => {
            isDrawing = true;
            this.hasDrawn = true;
            ctx.moveTo(e.offsetX, e.offsetY);
        };
        canvas.onmousemove = e => {
            if (isDrawing) {
                ctx.lineTo(e.offsetX, e.offsetY);
                ctx.stroke();
                this.hasDrawn = true;
            }
        };
        canvas.onmouseup = () => {
            isDrawing = false;
        };

        // Gestion du touch pour les mobiles
        canvas.ontouchstart = e => {
            e.preventDefault();
            this.getBounding(canvas, e);
            isDrawing = true;
            ctx.moveTo(this.x, this.y);
        };
        canvas.ontouchmove = e => {
            e.preventDefault();
            this.getBounding(canvas, e)
            if (isDrawing) {
                ctx.lineTo(this.x, this.y);
                ctx.stroke();
                this.hasDrawn = true;
            }
        };
        canvas.ontouchend = e => {
            e.preventDefault();
            isDrawing = false;
        };
        this.openCanvas();
        document.getElementById("canvasButton").addEventListener("click", () => this.signCanvas());
    };
    /**
     * Récupération de la position de la souris 
     * @param {HTMLElement} canvas
     * @param {MouseEvent|TouchEvent} mouseEvent
     */
    getBounding(canvas, mouseEvent) {
        let rect = canvas.getBoundingClientRect();
        this.x = (mouseEvent.targetTouches[0].clientX - (rect.x % rect.width));
        this.y = (mouseEvent.targetTouches[0].clientY - rect.y);
    }

    // Fonction d'ouverture de canvas
    openCanvas() {
        if (this.marker.available_bikes > 0) {
            document.getElementById("infoButton").style.display = 'none';
            document.getElementById("sign").style.display = 'block';
        } else if (this.marker.available_bikes === 0) {
            document.getElementById('sign-text').classList.remove("text-success");
            document.getElementById('sign-text').classList.add("text-danger");
            document.getElementById('sign-text').innerHTML = "Il n'y a plus de vélos ...";
        };
    };

    // Fonction d'enregistrement de la réservation

    signCanvas() {
        if (this.hasDrawn === true) {
            sessionStorage.clear();
            // Crée un item sessionStorage avec l'heure à laquelle la personne a cliqué
            sessionStorage.setItem('setupTime', new Date().getTime());
            sessionStorage.setItem('setupAddress', this.marker.address);
            sessionStorage.setItem('setupName', this.marker.name);
            document.getElementById("canvasButton").style.display = "none"
            document.getElementById('sign-text').classList.remove("text-danger");
            document.getElementById('sign-text').classList.add("text-success");
            document.getElementById('sign-text').innerHTML = "Réservation réussie !";
            document.getElementById('markerBikes').innerHTML = this.marker.available_bikes - 1;
            document.getElementById('markerStands').innerHTML = this.marker.available_bike_stands + 1;
            this.marker.reserved = true;
            this.marker.available_bikes = this.marker.available_bikes - 1;
            this.marker.available_bike_stands = this.marker.available_bike_stands + 1;
            this.gmarker.velos = this.gmarker.velos - 1;
            window.markerClusterer.removeMarker(this.gmarker);
            let newMarker = new Marker(this.marker, this.map, true)
            window.markerClusterer.addMarker(newMarker.marker);
        } else {
            document.getElementById('sign-text').classList.remove("text-success");
            document.getElementById('sign-text').classList.add("text-danger");
            document.getElementById('sign-text').innerHTML = "Veuillez signer.";
        };
    };
};
class Timer {
    /**
     * Création d'un timer qui affiche le temps de réservation restant 
     */
    constructor() {
        setInterval(() => {

            let setupTime = sessionStorage.getItem('setupTime');
            let setupAddress = sessionStorage.getItem('setupAddress');
            let setupName = sessionStorage.getItem('setupName');
            let tdisplay = document.getElementById('tdisplay');
            setupTime === null ? tdisplay.style.display = "none" : tdisplay.style.display = "block";

            // Réinitialise la réservation après 20 minutes
            let myDate = new Date(setupTime * 1000);
            let deadLine = myDate;
            deadLine = (deadLine.getTime() / 1000.0) + ((20 * 60) * 1000);

            let now = new Date().getTime();

            // Trouver les différence entre la deadline et l'heure actuelle
            let distance = (deadLine - now);

            let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let seconds = Math.floor((distance % (1000 * 60)) / 1000);
            if (setupTime !== null && setupTime > 0) {
                tdisplay.innerHTML = "Il vous reste " +
                    minutes + "m " + seconds + "s avant l'expiration de votre réservation (<span class='text-muted'> ADRESSE: " + setupAddress + " | STATION: " + setupName + "</span>)";
            };
            if (sessionStorage.getItem('setupTime') && Math.floor(distance / 1000) <= 0) {
                /*  sessionStorage.clear() */
                /* clearInterval(timer); */
                tdisplay.innerHTML = "VALIDATION EXPIREE";
            };
        }, 1000); // Effectue la fonction chaques les secondes
    };
};


// SearchBox
class SearchBox {
    /**
     * Création d'une fonction de recherche des stations
     * @param {Object[]} markers
     * @param {Object} map
     */
    constructor(markers, map) {
        this.markers = markers;
        this.map = map;
        this.info;
        this.markersFiltered = [];
        this.input = document.getElementById('pac-input');
        this.searchWindow = document.getElementById('searchWindow');

        if (this.input) {
            this.input.addEventListener("keyup", () => this.searchBox())
        };
    };

    /**
     * vérifie si la chaîne rentrée convertie en majuscule correspond à une entrée dans les stations converties en majuscules
     * @param {string} filter
     */
    isMatching(filter) {
        this.markersFiltered.splice(0, this.markersFiltered.length);
        this.markers.forEach((marker) => {
            if ((marker.address.toUpperCase().search(filter) > -1 || marker.name.toUpperCase().search(filter) > -1) && filter !== "" && filter.length > 2) {
                this.markersFiltered.push(marker);
            };
        });
    };

    searchBox() {
        document.getElementById('searchWindow').style.display = "block";
        this.filter = this.input.value.toUpperCase();
        this.isMatching(this.filter);
        this.searchWindow.style.visibility = "visible";
        this.searchWindow.style.opacity = "1"
        this.searchWindow.style.transition = "visibility 0s, opacity 0.2s linear;"
        this.arrays = [];
        if (this.markersFiltered !== [] && this.markersFiltered.length !== 0 && this.filter !== "") {
            this.info = '';
            for (let i in this.markersFiltered) {
                this.arrays.push(new Marker(this.markersFiltered[i], this.map, false));
            };
            this.arrays.forEach((array) => {
                this.info += '<div class="search-content"><img src="./dist/img/home/pin-station-available.svg" class="mr-2" alt=""><p class="mb-0"><b>' +
                    array.marker.address +
                    '</b><span class="text-muted"> - N°' + array.marker.number + ' </span></br> <span class="text-danger infoD">' + array.marker.places +
                    '</span> <i class="fas fa-parking"></i> <span class="text-danger infoD ">' +
                    array.marker.velos +
                    '</span> <i class="fas fa-bicycle"></i></div><hr></div>';
                this.searchWindow.innerHTML = this.info;
                this.searchContents = document.querySelectorAll('.search-content');
                this.searchContents.forEach((searchContent, i) => {
                    searchContent.addEventListener('click', () => {
                        new SideWindow(this.map, this.markersFiltered[i], this.arrays[i].marker);
                    });
                });
            });
        } else if (this.filter.length < 3) {
            this.searchWindow.style.visibility = "hidden";
            this.searchWindow.style.opacity = "0";
        } else {
            this.searchWindow.innerHTML = '<div><h3 class="text-muted">Pas de résultats...</h3></div>';
        };
    };

};