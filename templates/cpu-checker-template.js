Template.cpuChecker.events({
	'click button': function (e) {
		var clickedBtn = $(e.currentTarget),
			doThis = clickedBtn.data('cpuCheckerAction'),
			intervalTime = $('#cpu-check-interval').val();

		if (doThis === 'start') {
			cpuCheckerClient.startCpuUsageMonitor( intervalTime );
			$('#cpu-check-interval').val( intervalTime )
		}

		if (doThis === 'stop') {
			cpuCheckerClient.stopCpuUsageMonitor();
		}

	}
});

Template.cpuCheckerControlPanel.helpers({
	cpuCheckerIntervalTime: function () {
		return Session.get('cpuCheckerIntervalTime');
	}
});

Template.currentUsageBigNumber.helpers({
	currentUsage: function() {
		if (typeof Session.get('cpuUsage') === 'number') return Session.get('cpuUsage')+'%';
		return Session.get('cpuUsage');
	}
});

Template.cpuWarnings.helpers({
	warnings: function () {
		return Session.get('cpuWarnings');
	},
	time: function() {
		var date = new Date(this.time);
		return date.getDay() + '/' + (date.getMonth()+1) + ' @ ' + date.getHours() + ':' + date.getMinutes();
	}
});