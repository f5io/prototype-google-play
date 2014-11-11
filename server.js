var express = require('express'),
    compress = require('compression'),
    inject = require('connect-inject'),
    spawn = require('child_process').spawn,
    app = express();

app.use(compress());
app.use((function() {

	spawn('weinre', ['--boundHost', '-all-', '--httpPort', '8080']);

	return inject({
		snippet : ['<script>',
					// '<![CDATA[',
						"document.write('<script src=\"//' + (location.hostname || 'localhost') + ':8080/target/target-script-min.js\"><\\/script>');",
						"document.write('<script src=\"//' + (location.hostname || 'localhost') + ':35729/livereload.js\"><\\/script>');",
					// ']]>',
					'</script>'].join('\n')
	});

})());
app.use(function(req, res, next) {
	res.setHeader('X-UA-Compatible', 'IE=edge,chrome=1');
	next();
});
app.use(express.static(__dirname + '/app'));

module.exports = app;