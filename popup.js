function numstr(num, str1, str2, str5) {
	if (num % 10 == 0 || num % 10 >= 5 || (num % 100 >= 11 && num % 100 <= 19)) {
		return str5;
	}
	else if (num % 10 >= 2) {
		return str2;
	}
	else {
		return str1;
	}
}

function drawGraph(items, element) {
	var width = 285, height = 100;
	var xStep = (width - 31) / (items.length - 1);
	var ctx = graph.getContext('2d');
	var minY, maxY;
	var i, l;

	ctx.beginPath();
	ctx.strokeStyle = '#EEEEEE';
	for (i = 0, l = items.length; i < l; i++) {
		var val = parseInt(items[i].c[0]);
		if (minY === undefined || minY > val) minY = val;
		if (maxY === undefined || maxY < val) maxY = val;
		ctx.moveTo(i * xStep + 30.5, 5.5);
		ctx.lineTo(i * xStep + 30.5, height - 10.5);
	}
	ctx.stroke();

	var p = Math.floor(Math.log(maxY) / Math.LN10);
	var k, letter;
	if (p >= 9) {
		k = 1000000000;
		letter = 'G';
	}
	else if (p >= 6) {
		k = 1000000;
		letter = 'M';
	}
	else if (p >= 3) {
		k = 1000;
		letter = 'K';
	}
	else {
		k = 1;
		letter = '';
	}

	var step = 1;
	var newMinY, newMaxY;
	while (true) {
		newMinY = Math.floor(minY / step) * step;
		newMaxY = Math.ceil(maxY / step) * step;
		if (newMinY >= step) newMinY -= step;
		var c = (newMaxY - newMinY) / step;
		if (c >= 3 && c <= 5) break;
		if (String(step)[0] == 2) {
			step *= 2.5;
		}
		else {
			step *= 2;
		}
	}
	minY = newMinY;
	maxY = newMaxY;

	ctx.beginPath();
	ctx.strokeStyle = '#CCCCCC';
	for (i = minY; i <= maxY; i += step) {
		var y = height - 10.5 - Math.round((i - minY) / (maxY - minY) * (height - 16));
		ctx.moveTo(30.5, y);
		ctx.lineTo(width - 0.5, y);
		if (i > minY) {
			var str = i / k + letter;
			ctx.fillText(str, 2, y + 4);
		}
	}
	var d = (new Date(items[0].v)).getDay();
	var start = d == 1 ? 0 : (d == 0 ? 1 : 8 - d);
	for (i = start, l = items.length; i < l; i += 7) {
		ctx.moveTo(i * xStep + 30.5, 5.5);
		ctx.lineTo(i * xStep + 30.5, height - 10.5);
		var v = items[i].v;
		var d = v.substr(8, 2) + '.' + v.substr(5, 2)
		ctx.fillText(d, i * xStep + 18, height);
	}
	ctx.stroke();

	ctx.beginPath();
	ctx.strokeStyle = '#0000CC';
	var y = height - 10.5 - (items[0].c[0] - minY) / (maxY - minY) * (height - 16);
	ctx.moveTo(30, y);
	for (i = 1, l = items.length; i < l; i++) {
		y = height - 10.5 - (items[i].c[0] - minY) / (maxY - minY) * (height - 16);
		ctx.lineTo(i * xStep + 30.5, y);
	}
	ctx.stroke();
}

document.addEventListener('DOMContentLoaded', function () {
	chrome.tabs.getSelected(undefined, function (tab) {
		var cntId = chrome.extension.getBackgroundPage().cnts[tab.id];
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				document.getElementById('loader').style.display = 'none';
				if (xhr.status == 200) {
					var res = JSON.parse(xhr.responseText);
					var stat = res.report.item[res.report.item.length - 1];
					var statDate = new Date(stat.v);

					document.getElementById('stat').innerHTML =
						'<strong>Статистика за ' + statDate.getDate() + '.' + (1 + statDate.getMonth()) + '.' + (1900 + statDate.getYear()) + ':</strong><br />' +
						parseInt(stat.c[0]).toLocaleString() + ' ' + numstr(stat.c[0], 'посетитель', 'посетителя', 'посетителей') + '<br />' +
						parseInt(stat.c[1]).toLocaleString() + ' ' + numstr(stat.c[1], 'визит', 'визита', 'визитов') + '<br />' +
						parseInt(stat.c[2]).toLocaleString() + ' ' + numstr(stat.c[2], 'просмотр', 'просмотра', 'просмотров');
					document.getElementById('stat').style.display = 'block';

					document.getElementById('rating').innerHTML =
						'<a href="http://rating.openstat.ru/site/' + cntId + '/" target="_blank">Перейти на страницу рейтинга</a>';

					drawGraph(res.report.item, document.getElementById('graph'));
					document.getElementById('graph').style.display = 'block';

					xhr.onreadystatechange = function () {
						if (xhr.readyState == 4 && xhr.status == 200) {
							document.getElementById('online').innerHTML =
								'<strong>Сейчас на сайте:</strong><br />' + parseInt(xhr.responseText).toLocaleString() + ' ' +
								numstr(xhr.responseText, 'посетитель', 'посетителя', 'посетителей');
							document.getElementById('online').style.display = 'block';
						}
					};
					xhr.open('GET', 'http://rating.openstat.ru/rest/onlines/' + cntId, true);
					xhr.send();
				}
				else {
					document.getElementById('rating').innerHTML = 'Статистика&nbsp;сайта&nbsp;недоступна.';
				}
			}
		};
		xhr.open('GET', 'http://rating.openstat.ru/rest/site/' + cntId + '?det=day', true);
		xhr.send();
	});
});
