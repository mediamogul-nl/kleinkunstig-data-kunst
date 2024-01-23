<?php
$ams_lib_url = base_url.'libs/_amcharts';
function display_graph($graph_data) {
	global $ams_lib_url;
	$html = '';

	$chart_data = ' "dataProvider": [ ';
	foreach($graph_data as $day => $num) {
		$chart_data.='
			{
                "day": "'.$day.'",
                "column-1": '.$num.'
            },';
	}
	$chart_data.=']';
	$html.='
	<!doctype html>
	<html lang="en" dir="ltr">
	<head>
	  <meta charset="utf-8">
	  <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">	
        <script src="'.$ams_lib_url.'/amcharts/amcharts.js" type="text/javascript"></script>
        <script src="'.$ams_lib_url.'/amcharts/serial.js" type="text/javascript"></script>
        <script src="'.$ams_lib_url.'/amcharts/themes/light.js" type="text/javascript"></script>
        <style>
        div.amExportButton { bottom: auto !important;}
        </style>
        </head>
        <body>
	';
    $html.= graph_period_JS($chart_data, $ams_lib_url);
    $html.=' 
    	<div id="chartdiv" style="width:100%; height:400px;"></div>
</body>
</html>
	';
	return $html;

}

function graph_period_JS($chart_data, $ams_lib_url) {

	$js = '
        <!-- scripts for exporting chart as an image -->
        <!-- Exporting to image works on all modern browsers except IE9 (IE10 works fine) -->
        <!-- Note, the exporting will work only if you view the file from web server -->
        <!--[if (!IE) | (gte IE 10)]> -->
        <script src="'.$ams_lib_url.'/amcharts/exporting/amexport.js" type="text/javascript"></script>
        <script src="'.$ams_lib_url.'/amcharts/exporting/rgbcolor.js" type="text/javascript"></script>
        <script src="'.$ams_lib_url.'/amcharts/exporting/canvg.js" type="text/javascript"></script>
        <script src="'.$ams_lib_url.'/amcharts/exporting/filesaver.js" type="text/javascript"></script>
        <!-- <![endif]-->

		<!-- amCharts javascript code -->
		<script type="text/javascript">
			AmCharts.makeChart("chartdiv",
				{
					"type": "serial",
					"pathToImages": "http://cdn.amcharts.com/lib/3/images/",
					"categoryField": "day",
					"chartCursor": {},
					"chartScrollbar": {},
					"trendLines": [],
					"theme": "light",
					"graphs": [
						{
							"bullet": "round",
							"id": "AmGraph-1",
							"title": "",
							"valueField": "column-1"
						}
					],
					"guides": [],
					"valueAxes": [
						{
							"id": "ValueAxis-1",
							"title": "Aantal downloads"
						}
					],
					"allLabels": [],
					"balloon": {},
					"legend": {
						"useGraphSettings": true
					},
	                amExport: {
	                    bottom: 21,
	                    right: 21,
	                    buttonColor: \'#EFEFEF\',
	                    buttonRollOverColor:\'#DDDDDD\',
	                    exportPNG:true,
	                    exportJPG:true,
	                    exportSVG:true
	                },				
					'.$chart_data.'
				}
			);
		</script>';
	return $js;
}

?>