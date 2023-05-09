/* The purpose of the app is to display different charts. */

var charts = {
	calculations(parameters) {
	/* calculating values used in the definition of the sizes of the elements of the chart*/
		
		//sizes and name of the target div
		var tdom = document.querySelector(`#${parameters.target}`);
		var twidth = tdom.clientWidth / window.innerWidth * 100;
		var theight = tdom.clientHeight / window.innerHeight * 100;
		
		//translating the keys and values
		var keys = Object.keys(parameters.data);
		var values = Object.values(parameters.data);
		
		//calculating the horizontal span of the chart
		var minkey = Math.min(...keys);
		var maxkey = Math.max(...keys);
		var key_scalemin;
		var key_scalemax;
		var key_module;
		
		if(!isNaN(minkey) && !isNaN(maxkey)) {
			var key_module = 10 ** ((maxkey - minkey).toString().length - 1);
			var key_scalemax = (maxkey / key_module + 1) * key_module;
		}
		
		//vertical extreme values
		var minvalue = Math.min(...values);
		var maxvalue = Math.max(...values);
		
		//calculating the vertical module
		var value_module;
			if(Math.sign(minvalue) === Math.sign(maxvalue)) {
				value_module = 10 ** (Math.floor((maxvalue - minvalue)).toString().length - 1);
			} else {
				value_module = 10 ** (Math.floor(Math.min(Math.abs(maxvalue), Math.abs(minvalue))).toString().length - 1);
			}
		
		//calculating the vertical span of the chart
		var value_scalemin;
		if(minvalue === 0) {
			value_scalemin = value_module;
		} else if(minvalue%value_module === 0) {
			value_scalemin = minvalue;
		} else {
			value_scalemin = Math.floor(minvalue / value_module + 1) * value_module;
		}
		
		var value_scalemax;
		if(maxvalue > 0) {
			value_scalemax = (Math.ceil(maxvalue / value_module) + 1) * value_module;
		} else {
			value_scalemax = value_module;
		}
		
		//calculating the values for the ruler bars
		var rulers = [];
		var rulers_number = (value_scalemax - value_scalemin) / value_module;
		
		for(i = 0; i < rulers_number; i++) {
			rulers.push(value_scalemax - (i + 1) * value_module);
		}
		
		//calculating the width of each column
		var barwidth = (twidth * 0.925 - 4) / (keys.length + 3);
		
		return({
			//target DOM element data
			t_dom: tdom,
			t_width: twidth,
			t_height: theight,
			
			//keys and values (horizontal and vertical scale labels, respectively)
			keys: keys,
			values: values,
			
			//useful size units, names and numbers
			title: parameters.title,
			id: parameters.id,
			k_min: minkey,
			k_max: maxkey,
			k_scalemin: key_scalemin,
			k_scalemax: key_scalemax,
			k_module: key_module,
			v_min: minvalue,
			v_max: maxvalue,
			v_scalemin: value_scalemin,
			v_scalemax: value_scalemax,
			v_module: value_module,
			rulers: rulers,
			barwidth: barwidth
			
		});
	},
	
	framework(fwparams) {
	/* Preparing the horizontal and vertical axes with the ruler bars for the background */
		
		var background_html = '';
		var vertical_html = '';
		var horizontal_html = '';
		
		//creating the ruler bars and the vertical and horizontal axis marks
		fwparams.rulers.forEach(function(el, ind) {
			background_html += `
				<div class="chart-ruler chart-ruler_${el}" id="${fwparams.id}-ruler_${el}" style="margin-bottom:calc(${(fwparams.t_height * 0.8 - 6) / (fwparams.rulers.length + 0.2)}vh - 3px);width:calc(${fwparams.t_width * 0.925}vw - 4vh);"></div>
			`;
			
			vertical_html += `<div class="chart-vertical_number" id="${fwparams.id}-number_${el}" style="height:${(fwparams.t_height * 0.8 - 6) / (fwparams.rulers.length + 0.2)}vh">${ind < fwparams.rulers.length - 1 ? fwparams.rulers[ind + 1] : ''}</div>`;
		});
		
		fwparams.keys.forEach(function(el) {
			horizontal_html += `
				<div class="chart-key" id="chart-key_${el}" style="width:${fwparams.barwidth}vw;">${el}</div>
			`;
		});
		
		//assembling the html markup
		var html = `
			<div id="${fwparams.id}-container" class="chart-container" style="width:${fwparams.t_width}vw;height:${fwparams.t_height}vh">
				<div class="title" style="height:${fwparams.t_height * 0.05}vh">${fwparams.title}</div>
				<div id="${fwparams.id}-chart" class="chart" style="height:${fwparams.t_height * 0.95 -4}vh;width:calc(${fwparams.t_width}vw - 4vh)">
					<div class="chart-background" id="${fwparams.id}-background" style="height:${fwparams.t_height * 0.8 - 6}vh;margin-left:calc(${fwparams.t_width * 0.075}vw - 2vh);width:calc(${fwparams.t_width * 0.925}vw - 4vh)">
						${background_html}
					</div>
					<div class="chart-vertical_axis" style="height:${fwparams.t_height * 0.8 - 6}vh;width:calc(${fwparams.t_width * 0.075}vw - 4vh);margin-bottom:${fwparams.t_height * 0.15}vh">
						${vertical_html}
					</div>
					<div class="chart-horizontal_axis" style="height:${fwparams.t_height * 0.15}vh;margin-left:calc(${fwparams.t_width * 0.075}vw - 2vh);width:calc(${fwparams.t_width * 0.925}vw - 4vh)">
						${horizontal_html}
					</div>
				</div>
			</div>
		`;
		
		//drawing the background and coordinate system
		fwparams.t_dom.insertAdjacentHTML('beforeend', html);
		
		//adding hover effect to the rulers
		document.addEventListener('mouseover', function(event) {
			if(event.target.classList.contains('chart-vertical_number')) {
				var chartid = event.target.id.split('-')[0];
				var num = event.target.id.split('_')[1] - fwparams.v_module;
				var ruler = document.querySelector(`#${chartid}-ruler_${num}`);
				
				if(ruler !== null) {
					ruler.style.backgroundColor = 'var(--highlight)';
					ruler.style.borderColor = 'var(--highlight)';
				}
				
				document.addEventListener('mouseout', function(event) {
					if(event.target.classList.contains('chart-vertical_number')) {
						if(ruler !== null) {
							ruler.style.backgroundColor = num === 0 ? 'black' : 'var(--ruler)';
							ruler.style.borderColor = 'var(--ruler)';
						}
					}
				});
			}
		});
	},
	
	bar(parameters) {
	/* Necessary contents of the parameters object:
	 *	target: id of the target DOM element
	 *	id
	 *	title
	 *  data: object in which the keys are the labels on the horizontal axis and the values are their respective vertical axis values.
	 */
	
		//making calculations
		var ch = charts.calculations(parameters);
		
		//creating the coordinate system
		charts.framework(ch);

		//creating the chart space and adding the bars
		var html = `
			<div id="${parameters.id}-chartspace" class="chart-chartspace">
		`;
		
		ch.keys.forEach(function(el, ind) {
			var unit = (ch.t_height * 0.8 - 6) / (ch.rulers.length + 0.2) / ch.v_module;
			
			//calculating bar sizes and defining bar color
			var height =  unit * Math.abs(ch.values[ind]);
			var color = `var(--color_${ind%3 + 1})`;
			
			//positioning the bar charts
			var margin = ch.values[ind] > 0 ? unit * (ch.v_scalemax - 0.8 * ch.v_module - ch.values[ind]) : unit * (ch.v_scalemax - 0.8 * ch.v_module);
			
			
			html += `
				<div class="chart-bar" id="chart-bar_${el}" style="width:${ch.barwidth}vw;height:${height}vh;margin-top:${margin}vh;background-color:${color}" title="${ch.keys[ind]}: ${ch.values[ind]}"></div>
			`;
		});
		
		html += '</div>';
		
		document.querySelector(`#${parameters.id}-background`).insertAdjacentHTML('beforeend', html);
		
	},
	
	pie(parameters) {
	/* */
		
	},
	
	graph(parameters) {
	/* */
		
	}
};