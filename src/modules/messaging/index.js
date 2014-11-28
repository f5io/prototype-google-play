var parentWindow,
    parentOrigin;

window.addEventListener('message', function(e) {
    console.log(e);
    if (!/\.celtra/.test(e.origin)) return;
    if (!parentWindow || !parentOrigin) {
        parentWindow = e.source;
        parentOrigin = e.origin;
    }
    switch (e.data) {
        case 'init':
            parentWindow.postMessage('received_init', parentOrigin);
            break;
    }
});

var Messaging = {
    post: function(data) {
        if (parentWindow && parentOrigin) {
            parentWindow.postMessage(data, parentOrigin);
        }
    }
};

module.exports = Messaging;