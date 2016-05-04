var TRACE_MODE = JSON.parse(localStorage.getItem('trace_mode'));
(function () {
	var toggle_btn = document.getElementById('trace-mode'),
		listener_id = 0,
		init_data = [];
	function updateBattery() {
		function floor(num) {
			return parseInt(num / 10) * 10;
		}
		function minToTime(min) {
			var hours = parseInt(min / 60),
				minutes = parseInt(min % 60);
			if (hours < 10) { hours = '0' + hours; }
			if (minutes < 10) { minutes = '0' + minutes; }
		    return hours + ':' + minutes;
		}
		tizen.systeminfo.getPropertyValue('BATTERY', function (battery) {
			var battery_icon = document.getElementById('battery'),
				level_10 = parseInt(battery.level * 10) * 10,
				fulltime_min = 2 * 24 * 60,
				remaining_min, waiting_min, watch_min, music_min, game_min;
			console.log('battery level changed. -> ' + (battery.level * 100));
			battery_icon.style.backgroundImage = "url('img/battery/battery_" + level_10 + ".png')";
			battery_icon.innerHTML = parseInt(battery.level * 100) + '%';
			console.log('');
			(function updateRemaining() {
				remaining_min = fulltime_min * battery.level;
				waiting_min = remaining_min;
				watch_min = remaining_min * 0.8;
				music_min = remaining_min * 0.3;
				game_min = remaining_min * 0.05;
				document.getElementById('waiting-time').innerHTML = minToTime(waiting_min);
				document.getElementById('watch-time').innerHTML = minToTime(watch_min);
				document.getElementById('music-time').innerHTML = minToTime(music_min);
				document.getElementById('game-time').innerHTML = minToTime(game_min);
			})();
			console.log('tiempo estimado de bateria actualizado');
		});
	}
	updateBattery();
	function updateChart(data) {
		var graph;
		graph = Flotr.draw(document.getElementById('chart'), [data], {
			fontSize: 5,
			xaxis: {
				noTicks: 0,
				showLabels: false
			},
			yaxis: {
				max: 100,
				min: 0,
				showLabels: false
			},
			grid: {
				minorVerticalLines: true
			},
			lines: {
				fill: true
			}
		});
	}
	init_data = JSON.parse(localStorage.getItem('trace_data'));
	if (init_data) {
		document.getElementById('chart').innerHTML = '';
		updateChart(init_data);
	}
	function traceBattery(battery) {
		var now = parseInt(Date.now() / 1000),
			level = parseInt(battery.level * 100),
			data;
		console.log(battery.isCharging ? 'charging' : 'not charging');
		if (level >= 100) {
			localStorage.setItem('trace_data', JSON.stringify([[now - 1, level]]));
		}
		data = JSON.parse(localStorage.getItem('trace_data'));
		if (!data) {
			data = [[now - 1, level]];
			updateChart(data);
		}
		data.push([now, level]);
		console.log(JSON.stringify(data));
		localStorage.setItem('trace_data', JSON.stringify(data));
		console.log('now = ' + now + ', battery level = ' + level);
		updateBattery();
		updateChart(data);
	}
	function updateListener() {
		if (TRACE_MODE === true) {
			listener_id = tizen.systeminfo.addPropertyValueChangeListener('BATTERY', traceBattery);
			console.log('listener added (id = ' + listener_id + ').');
		} else {
			tizen.systeminfo.removePropertyValueChangeListener(listener_id);
			console.log('listener removed (id = ' + listener_id + ').');
			listener_id = 0;
		}
	}
	if (TRACE_MODE === null) {
		TRACE_MODE = false;
		console.log('init TRACE_MODE = false');
	} else if (TRACE_MODE === true) {
		console.log('init TRACE_MODE = true');
		updateListener();
		toggle_btn.checked = true;
	}
	toggle_btn.addEventListener('change', function (e) {
		var container = document.getElementById('chart');
		if (this.checked === true) {
			TRACE_MODE = true;
			console.log('TRACE_MODE = true');
			localStorage.setItem('trace_mode', true);
			console.log('localStorage.trace_mode = true');
			document.getElementById('chart').innerHTML = '';
			tau.changePage('#main');
			setTimeout(function () {
				tizen.systeminfo.getPropertyValue('BATTERY', function (battery) {
					traceBattery(battery);
				});
			}, 1000);
		} else {
			TRACE_MODE = false;
			console.log('TRACE_MODE = false');
			localStorage.clear();
			console.log('localStorage cleared.');
			while (container.hasChildNodes()) {
				container.removeChild(container.lastChild);
			}
			container.innerHTML = 'Seguimiento está desactivado. Puede activar esta función en el menú de ajustes.';
			tau.changePage('#main');
		}
		updateListener();
	}, false);
}());