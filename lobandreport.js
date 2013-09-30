
var iframe;
var loading_overlay;
var loading_timer;
var time_taken;
var page_size;

$(function()
{
	var iframeJQ = $('<iframe class="loading_iframe" ' +
		'src="JavaScript:\\"\\""></iframe>');
	var loading_wrapper = $('.loading_wrapper');
	iframeJQ.appendTo(loading_wrapper);
	$('.grid-main-col form').each(function(index, element)
	{
		element.onsubmit = function()
		{
			try
			{
				process(element, loading_wrapper);
			}
			catch (e)
			{
				alert(e);
			}
			finally
			{
				return false;
			}
		};
	});
});

function process(form, loading_wrapper)
{
	var loading_overlay = loading_wrapper.find('.loading_overlay');
	var loading_timer   = loading_wrapper.find('.loading_timer');
	var time_taken      = $(form).find('.time_taken.field');
	var page_size       = $(form).find('.page_size.field');

	var url = form.url.value;
	var bps = 250000;

	var iframe = loading_wrapper.find('iframe')[0];
	iframe.src = 'http://www.loband.org/loband/page?_ab_key=2&_ab_bps=' +
		bps + '&_ab_nofilter&_ab_url=' + url;
	loading_overlay[0].style.display = "block";

	time_taken.html("&hellip;");
	loading_timer.html("0 seconds so far");

	var start_time = new Date().getTime();
	var timer = setInterval(function(){
		var current_time = new Date().getTime();
		loading_timer.html(Math.round((current_time - start_time) / 1000) + 
			" seconds so far");
		time_taken.html(Math.round((current_time - start_time) / 1000));
	}, 1000);

	iframe.onload = function()
	{
		loading_overlay[0].style.display = "none";
		clearInterval(timer);
		var current_time = new Date().getTime();
		var time_taken_text = Math.round((current_time - start_time)
			/ 100) / 10;
		time_taken.html(time_taken_text);
		// alert(url + " finished loading");

		// Log results
		$.ajax({
			url: "http://www.aptivate.org/uploads/filer/2013/09/27/bandwidthlog.js",
			data: {
				url: url,
				time: time_taken_text
			},
			dataType: 'jsonp'
		});
	};

	if (url.substring(0, 4) != "http")
	{
		url = "http://" + url;
	}

	page_size.html("&hellip;");
	$.ajax({
		url: "https://www.googleapis.com/pagespeedonline/v1/runPagespeed",
		data: {
			url: url,
		},
		dataType: 'jsonp',
		success: function(data)
		{
			handlePagespeedResult(data, page_size);
		},
		error: function(jqXHR, textStatus, errorThrown)
		{
			alert("PageSpeed request failed: " + 
				textStatus + ": " + errorThrown);
		}
	});
}

function handlePagespeedResult(data, page_size_span)
{
	if (data.error)
	{
		alert("PageSpeed request failed: " + data.error.message);
		return;
	}

	var stats = data.pageStats;
	var total_size = 
		parseInt(stats.htmlResponseBytes || 0) +
		parseInt(stats.cssResponseBytes || 0) +
		parseInt(stats.imageResponseBytes || 0) +
		parseInt(stats.javascriptResponseBytes || 0) +
		parseInt(stats.otherResponseBytes || 0);
	page_size_span.html(Math.round(total_size / 1024));
}

