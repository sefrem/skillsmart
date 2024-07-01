

class General {

    action() {
        console.log('General class action');
    }
}

class Male extends General {

    action() {
        console.log("Male class action");
    }
}

class Female extends General {

    action() {
        console.log('Female class action');
    }
}