Package.describe({
	summary: "Check your CPU usage."
});

Npm.depends({'usage': "0.3.8"});

Package.on_use(function (api) {

	if (api.export) { // ensure backwards compatibility with Meteor pre-0.6.5
		api.export('CPUCheckerServer');
		api.export('CPUCheckerClient');
	}

	// Client: Template stuff
	api.use('templating', 'client');
	api.add_files(["templates/cpu-checker-template.html", "templates/cpu-checker-big-number.html", "templates/cpu-checker-template-errors.html", "templates/cpu-checker-template.js", "templates/cpu-checker-template.css"], "client");

	// Client: The main object to interfere with
	api.add_files("cpu-checker-client.js", "client");

	// Server: The main object to interfere with
	api.use('underscore', 'server');
	api.add_files("cpu-checker-server.js", "server");

});