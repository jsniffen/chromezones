let displays = [];
let moving = false;
let timeout = null;

const margin = 30;

chrome.windows.onBoundsChanged.addListener(w => {
	if (moving) {
		moving = false;
		return;
	}

	if (timeout !== null) {
		clearTimeout(timeout);
	}

	timeout = setTimeout(() => {
		const centerX = Math.floor(w.left+w.width/2);
		const y = w.top;

		console.log(centerX, y);

		for (const zones of displays) {
			for (let i = 0; i < zones.length; i++) {
				const zone = zones[i];

				if (centerX >= zone.x0 && centerX <= zone.x1 &&
				    y >= zone.y0 && y <= zone.y1) {
					moving = true;

					const update = {
						left: zone.x0 + margin,
						width: zone.x1-zone.x0 - 2*margin,
						top: zone.top + margin,
						height: zone.height - 2*margin,
					}

					if (zones.length > 1) {
						const diff = Math.floor(margin/2);
						if (i == 0) {
							update.width += diff;
						} else if (i == zones.length-1) {
							update.left -= diff;
							update.width += diff;
						} else {
							update.left -= diff;
							update.width += 2*diff;
						}
					}

					chrome.windows.update(w.id, update);
					return;
				}
			}
		}
	}, 250);
});

chrome.system.display.getInfo({}, info => {
	for (const display of info) {

		const left = display.bounds.left;
		const width = display.bounds.width;
		const top = display.bounds.top;
		const height = display.bounds.height;

		let numZones = width >= 3000 ? 3 : 2;

		let y0 = top+Math.floor((top+height)/3);
		let y1 = top+height;

		for (let i = 0; i < 2; i++) {
			let zones = []

			const zoneWidth = Math.floor(width/numZones);

			prevX0 = left;

			for (let i = 0; i < numZones; i++) {
				zones.push({
					x0: prevX0,
					x1: prevX0+zoneWidth,
					y0: y0,
					y1: y1,
					top: top,
					height: height,
				});
				prevX0 += zoneWidth;
			}

			displays.push(zones);

			numZones--;
			y1 = y0;
			y0 = top;
		}
	}

	console.log(displays);
});
