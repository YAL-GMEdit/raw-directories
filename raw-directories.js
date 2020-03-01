(function() {
	let TreeView = $gmedit["ui.treeview.TreeView"];
	let RawLoader = $gmedit["raw.RawLoader"];
	let Preferences = $gmedit["ui.Preferences"];
	let ProjectProperties = $gmedit["ui.project.ProjectProperties"];
	function onOpen(e) {
		let pj = e.project;
		switch (pj.version.config.loadingMode) {
			case "gms1": case "gms2": break;
			default: return;
		}
		if (pj.path == null) return;
		let arr = pj.properties.rawDirectories || ["."];
		for (let path of arr) (function addRawDirectory(path) {
			if (path != "." && !pj.existsSync(path)) {
				console.error("Can't add `"+path+"` - it does not exist");
				return;
			}
			let name = path != "." ? path : "Raw view";
			let dir = TreeView.makeAssetDir(name, path, "file");
			let isReady = false;
			dir.treeHeader.addEventListener("click", function ensureRawDirectory(_) {
				if (isReady || !dir.classList.contains("open")) return;
				RawLoader.loadDirRec(pj, dir.treeItems, path);
				isReady = true;
			});
			TreeView.element.appendChild(dir);
		})(path);
	}
	GMEdit.register("raw-directories", {
		init: function() {
			GMEdit.on("projectOpen", onOpen);
			GMEdit.on("projectPropertiesBuilt", function addPropertiesUI(e) {
				let pj = e.project;
				let out = e.target;
				let gr = Preferences.addGroup(out, "Raw directories");
				let arr = pj.properties.rawDirectories || ["."];
				let el = Preferences.addInput(gr,
					"Directory list (separated with `|`)",
					arr.join("."),
				function updateDirList(s) {
					pj.properties.rawDirectories = s ? s.split("|") : [];
					ProjectProperties.save(pj, pj.properties);
					pj.reload();
				});
			});
		}
	});
})();
