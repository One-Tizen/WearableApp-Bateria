(function () {
	window.addEventListener('tizenhwkey', function(ev) {
		if (ev.keyName == 'back') {
			var page = document.getElementsByClassName('ui-page-active')[0],
				pageid = page ? page.id : "";
			if (pageid === 'main') {
				if (TRACE_MODE === false) {
					tizen.application.getCurrentApplication().exit();
				}
				else {
					tizen.application.getCurrentApplication().hide();
				}
			} else {
				window.history.back();
			}
		}
	});
}());
