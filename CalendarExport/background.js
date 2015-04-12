chrome.app.runtime.onLaunched.addListener(function()
{
	crhome.app.window.create('CalendarTest.html',
	{
		'bounds':
		{
			'width' : 400,
			'height': 500
		}
	});
});