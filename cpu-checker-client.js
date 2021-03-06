CPUCheckerClient = function () {

	var that = this;

	that.autoChecker = false;
	that.currCpuUsage = false;
	that.checkIntervalTime = 1000;
	that.barGraphStuff = {
		maxHeight: 200
	};

	// Warnings
	that.warningInterval = false;
	that.warningIntervalTime = that.checkIntervalTime;

	that.getWarnings = function() {
		Meteor.call('CPUCheckerReturnWarnings', function (error, result) {
			Session.set('cpuWarnings', result);
		});
	};

	that.autoSyncWarnings = function() {
		that.warningInterval = Meteor.setInterval(function () {
			that.getWarnings();
		}, that.warningIntervalTime);
	};

	that.setCpuUsageSession = function() {
		Meteor.call('CPUCheckerGetCurrentUsage', function (error, result) {
			if (typeof result.cpu !== 'undefined') {
				that.currCpuUsage = result.cpu;
				Session.set('cpuUsage', parseInt(result.cpu, 10) );
			}
		});
	};

	that.syncTimerWithServer = function() {
		Meteor.call('CPUCheckerGetCurrentIntervalTime', function (error, result) {
			if (result !== that.checkIntervalTime) {
				// Set new interval time
				that.startCpuUsageMonitor( result );
			}
		});
	};

	that.appendCpuDataToChart = function() {
		if ($('.usage-graph').find('.usage-graph-bar').length > 39) $('.usage-graph').find('.usage-graph-bar').first().remove();
		$('.usage-graph').append('<div class="usage-graph-bar" style="opacity: 0.'+(Session.get('cpuUsage') + 20)+'; margin-top: '+(that.barGraphStuff.maxHeight - (1+Session.get('cpuUsage')*(that.barGraphStuff.maxHeight/100)) )+'px; height: '+(1+Session.get('cpuUsage')*(that.barGraphStuff.maxHeight/100))+'px;"><span class="usage-graph-bar-hidden-val">'+Session.get('cpuUsage')+'%</span></div>');
		return true;
	};

	that.setIntervalTime = function( intervalTime ) {
		that.checkIntervalTime = intervalTime;
		Session.set('cpuCheckerIntervalTime', that.checkIntervalTime);
		return true;
	};

	// Set that.autoChecker to interval, return !== false
	that.startCpuUsageMonitor = function( intervalTime ) {

		// Reset the current timer...
		that.stopLocalCpuUsageMonitorStuff();

		that.setIntervalTime( intervalTime );

		Meteor.call('CPUCheckerStartCheck', intervalTime, function (error, result) {
			that.autoChecker = Meteor.setInterval(function () {
				that.syncTimerWithServer();
				that.setCpuUsageSession();
				that.appendCpuDataToChart();
			}, that.checkIntervalTime);	
		});

		that.autoSyncWarnings();

		return true;
	};

	that.stopLocalCpuUsageMonitorStuff = function() {
		Meteor.clearInterval(that.autoChecker);
		that.autoChecker = false;
		that.currCpuUsage = false;
		that.warningInterval = false;
	};

	// Stop the check return that.autoChecker === false
	that.stopCpuUsageMonitor = function() {
		Meteor.call('CPUCheckerStopCheck');
		that.stopLocalCpuUsageMonitorStuff();
		return !that.autoChecker;
	};

	Meteor.startup(function () {
		Session.set('cpuUsage', 'connecting...');
		that.syncTimerWithServer();
	});

	return this;
};