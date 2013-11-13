function onFail(message) {
    console.log(message)
    alert('Failed because: ' + message);
}

function camera() {
    navigator.camera.getPicture(
            function(imageURI) {
                console.log(imageURI);
                draw_image(imageURI);
            },
            onFail,
            {
                quality: 50,
                sourceType: Camera.PictureSourceType.CAMERA,
                destinationType: navigator.camera.DestinationType.FILE_URI
            });
}

function album() {
    navigator.camera.getPicture(
            function(imageURI) {
                console.log(imageURI);
                draw_image(imageURI);
            },
            onFail,
            {
                quality: 50,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                destinationType: navigator.camera.DestinationType.FILE_URI
            });
}

function draw_image(src) {
    var smallImage = document.getElementById('smallImage');

//                smallImage.src = "data:image/jpeg;base64," + imageData;
    smallImage.src = src;
}