import { Color } from 'three'

export function GetRandColor() {
	let color = new Color();
	let randColor = Math.random().toString(16).substr(-6)
    color.setHex(`0x${randColor}`);
    return color;
}

export function invertColor(hexTripletColor) {
	var color = hexTripletColor;
	// color = color.substring(1); // remove #
	color = parseInt(color, 16); // convert to integer
	color = 0xFFFFFF ^ color; // invert three bytes
	color = color.toString(16); // convert to hex
	color = ("000000" + color).slice(-6); // pad with leading zeros
	color = "#" + color; // prepend #
	return color;
}
