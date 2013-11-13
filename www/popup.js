function onConfirm(button) {
    alert('You selected button ' + button);
}

// Show a custom confirmation dialog
//
function showConfirm() {
    navigator.notification.confirm(
            'You are the winner!', // message
            onConfirm, // callback to invoke with index of button pressed
            'Game Over', // title
            'Restart,Exit'          // buttonLabels
            );
}