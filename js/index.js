(function() {
	var page = document.getElementById('main'),
		changer = document.getElementById('sections'),
		sectionChanger;
	tau.defaults.pageTransition = 'slideup';
	page.addEventListener('pageshow', function() {
		sectionChanger = new tau.SectionChanger(changer, {
			circular: true,
			orientation: 'horizontal'
		});
	});	
	page.addEventListener('pagehide', function() {
		sectionChanger.destroy();
	});
})();