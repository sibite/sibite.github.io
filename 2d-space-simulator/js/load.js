let scripts = [
		"utilities.js",
		"vector.js",
		"publisher.js",
		"bezier.js",
		"animation.js",

		"celestial.js",
		"trajectory.js",
		"spacecrafts.js",
		"universe.js",

		"renderer.js",
		"event_handler.js",
		"view.js",

		"model.js",
		"main.js"
	];

function load() {
	let scriptsToLoad = scripts;
	let totalScripts = scripts.length;
	function loadScript() {
		if (scriptsToLoad.length > 0) {
			let scriptSrc = scriptsToLoad.shift(),
				scriptEl = document.createElement("script");
			scriptEl.type = "text/javascript";
			scriptEl.onload = loadScript;
			scriptEl.src = "js/"+scriptSrc;
			document.head.appendChild(scriptEl);
		}
		if (el) {
			el.innerHTML = parseInt((totalScripts - scriptsToLoad.length) / totalScripts * 100);
		}
	}
	document.body.innerHTML = `
	<div style="width:100vw; height:100vh; text-align: center; background-color: black;">
		<span style="line-height: 100vh; font-size: 26px; font-family: sans-serif; font-weight: bold; color: white">
			Ładowanie... <span id="progress">0</span>%
		</span>
	</div>`
	let el = document.getElementById("progress");
	loadScript();

}

window.addEventListener("load", load);
