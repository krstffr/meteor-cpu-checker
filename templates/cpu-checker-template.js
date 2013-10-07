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

		if (doThis === 'getErrors') {
			cpuCheckerClient.getErrors();
		}

	}
});

Template.currentUsageBigNumber.helpers({
	currentUsage: function() {
		return Session.get('cpuUsage')+'%';
	}
});

Template.cpuErrors.helpers({
	errors: function () {
		return Session.get('cpuErrors');
	},
	time: function() {
		var date = new Date(this.time);
		return date.getDay() + '/' + (date.getMonth()+1) + ' @ ' + date.getHours() + ':' + date.getMinutes();
	}
});