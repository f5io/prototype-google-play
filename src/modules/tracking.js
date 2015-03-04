var $ = require('./utilities');
var Config = require('./config');
var Creative, CreativeUnit, ctx;

var EXIT_TRACK = 'cta-exit-lang:{language}-start:{entry}-url:{href}';

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
        this.trackEvent($.format(EXIT_TRACK, $.extend({ href: href }, Config.global)));
        if (!Config.global.isCeltra) {
            console.log('Go To URL :: ' + href);
            return;
        }
        CreativeUnit.goToURLAction(ctx, { url: href, reportLabel: href }, function() {});
    }
};

module.exports = Tracking;