var cnts = {};
var reCid = /cid=(\d+)/;
var reSpylog = /\/\/u(\d+)\.(\d+)\.spylog\.com\//;

chrome.webRequest.onCompleted.addListener(
	function(details) {
		var res = reCid.exec(details.url);
		if (res) {
			cnts[details.tabId] = res[1];
			chrome.pageAction.show(details.tabId);
		}
		else {
			res = reSpylog.exec(details.url);
			if (res) {
				cnts[details.tabId] = res[1] + res[2];
				chrome.pageAction.show(details.tabId);
			}
		}
	},
	{
		urls: [
			'*://openstat.net/cnt?*',
			'*://*.spylog.com/cnt?*'
		]
	},
	[]
);
