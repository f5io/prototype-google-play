var Config = require('./config');
var Creative, CreativeUnit, ctx;

var Tracking = {
    init: function(ct, creative, unit) {
        Creative = creative;
        CreativeUnit = unit;
        ctx = ct;
    },
    trackEvent: function(event, isInteraction) {
        if (!Config.global.isCeltra) {
            console.log('Tracking :: ' + event);
            return;
        }
        if (isInteraction) ctx.trackUserInteraction();
        Creative.trackCustomEventAction(ctx, { name: event }, function() {});
    },
    goToURL: function(href) {
        if (!Config.global.isCeltra) {
            console.log('Go To URL :: ' + href);
            return;
        }
        CreativeUnit.goToURLAction(ctx, { url: href, reportLabel: href }, function() {});
    }
};

module.exports = Tracking;