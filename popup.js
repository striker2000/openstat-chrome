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

document.addEventListener('DOMContentLoaded', function () {
	chrome.tabs.getSelected(undefined, function (tab) {
		var cntId = chrome.extension.getBackgroundPage().cnts[tab.id];
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function () {
			if (xhr.readyState == 4) {
				console.log(xhr);
				if (xhr.status == 200) {
					var res = JSON.parse(xhr.responseText);
					var stat = res.report.item[res.report.item.length - 1];
					document.getElementById('stat').innerHTML =
						'<strong>Статистика за ' + stat.v.substr(0, 10) + ':</strong><br />' +
						parseInt(stat.c[0]).toLocaleString() + ' ' + numstr(stat.c[0], 'посетитель', 'посетителя', 'посетителей') + '<br />' +
						parseInt(stat.c[1]).toLocaleString() + ' ' + numstr(stat.c[1], 'визит', 'визита', 'визитов') + '<br />' +
						parseInt(stat.c[2]).toLocaleString() + ' ' + numstr(stat.c[2], 'просмотр', 'просмотра', 'просмотров');
					document.getElementById('rating').innerHTML =
						'<a href="http://rating.openstat.ru/site/' + cntId + '/" target="_blank">Перейти на страницу рейтинга</a>';
					xhr.onreadystatechange = function () {
						document.getElementById('online').innerHTML =
							'<strong>Сейчас на сайте:</strong><br />' + parseInt(xhr.responseText).toLocaleString() + ' ' +
							numstr(xhr.responseText, 'посетитель', 'посетителя', 'посетителей');
					};
					xhr.open('GET', 'http://rating.openstat.ru/rest/onlines/' + cntId, true);
					xhr.send();
				}
				else {
					document.getElementById('rating').innerHTML = 'Статистика сайта недоступна.';
					document.getElementById('online').style.display = 'none';
					document.getElementById('stat').style.display = 'none';
				}
			}
		};
		xhr.open('GET', 'http://rating.openstat.ru/rest/site/' + cntId + '?det=day', true);
		xhr.send();
	});
});
