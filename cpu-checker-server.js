CPUCheckerServer = function() {

	var that = this;

	// Vars, NPM
	that.usage = Npm.require('usage');
	that.usageOptions = { keepHistory: true };
	that.pid = process.pid;

	// Vars
	that.checkIntervalTime = 1000;
	that.autoChecker = false;
	that.currCpuUsage = false;

	// Vars, warnings
	that.lastWarningTime = 0;
	that.warnings = [];
	that.minWarningTime = 5000;

	// Thresholds
	that.thresholds = [
		{
			cpuThreshold: 25,
			actionMethod: 'saveWarning',
			actionVar: 25,
			severity: 'low'
		},
		{
			cpuThreshold: 50,
			actionMethod: 'saveWarning',
			actionVar: 50,
			severity: 'medium'
		},
		{
			cpuThreshold: 70,
			actionMethod: 'saveWarning',
			actionVar: 70,
			severity: 'high'
		}
	];

	that.checkCpuThresholds = function(cpuUsage) {
		_.each(that.thresholds.reverse(), function(thresholdObject){
		
			if (thresholdObject.cpuThreshold < cpuUsage) {
				console.log('higher than '+thresholdObject.cpuThreshold);
				that[thresholdObject.actionMethod]( thresholdObject, cpuUsage );
			}
		
		});
	};

	that.saveWarning = function(thresholdObj, cpuUsage) {

		var timeNow = new Date().valueOf();

		// Check if last warning reported was too soon, if so cancel
		if (that.lastWarningTime > timeNow-that.minWarningTime) return false;

		// CPU usage must be over 0
		if (cpuUsage < 1) return false;

		var warning = {
			time: new Date().valueOf(),
			threshold: thresholdObj.threshold,
			cpuUsage: cpuUsage,
			severity: thresholdObj.severity
		};
		// Add the warning to the warnings array
		that.warnings.push(warning);
		
		// Update the last warning time to now!
		that.lastWarningTime = timeNow;

		return true;
	};

	Meteor.methods({
		CPUCheckerReturnWarnings: function() {
			return that.warnings;
		},
		// Return startCpuUsageMonitor()
		CPUCheckerStartCheck: function(intervalTime) {
			console.log('client connected, passed '+intervalTime+'ms intervalTime');
			that.setIntervalTime( intervalTime, that.startCpuUsageMonitor );
			// return
		},
		CPUCheckerGetCurrentIntervalTime: function() {
			return that.checkIntervalTime;
		},
		// Remove interval and stop check
		CPUCheckerStopCheck: function() {
			console.log('shutting down cpu check... These are the current reported warnings: ');
			console.log(that.warnings);
			return that.stopCpuUsageMonitor();
		},
		// Return getLoadAverage()
		CPUCheckerGetCurrentUsage: function () {
			// If currCpuUsage then the interval is not set or unset
			if (that.currCpuUsage === false) return 'Checker is cancelled';
			// Return the CPU usage
			console.log('sending this cpu usage to client: '+that.currCpuUsage.cpu);
			return that.getLoadAverage();
		}
	});

	that.setIntervalTime = function(intervalTime, callback) {
		intervalTime = (intervalTime > 100) ? intervalTime : 100;
		that.checkIntervalTime = intervalTime;
		callback();
	};

	// Set autoChecker to setInterval and return 
	that.startCpuUsageMonitor = function() {
		if (that.autoChecker !== false) that.stopCpuUsageMonitor();
		console.log('cpu interval not starting now @ '+that.checkIntervalTime+'ms...');
		that.autoChecker = Meteor.setInterval(function () {
			that.usage.lookup(that.pid, that.usageOptions, function(err, result) {
				console.log('check thresholds based on cpu');
				result.cpu = Math.ceil(result.cpu);
				that.checkCpuThresholds(result.cpu);
				// Set that.currCpuUsage to current usage object
				console.log('setting new usage object, .cpu is: '+result.cpu);
				that.currCpuUsage = result;
			});
		}, that.checkIntervalTime);
		return that.autoChecker !== false;
	};

	// Stop the check return that.autoChecker === false
	that.stopCpuUsageMonitor = function() {
		console.log('resetting interval on server...');
		Meteor.clearInterval(that.autoChecker);
		that.autoChecker = false;
		that.currCpuUsage = false;
		return !that.autoChecker;
	};

	// Just return the current cpuUsage
	that.getLoadAverage = function() {
		if (that.currCpuUsage) return that.currCpuUsage;
	};

	return that;

};

