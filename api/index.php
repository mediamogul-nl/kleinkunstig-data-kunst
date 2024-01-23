<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Request-Headers: Content-Type");
header("Access-Control-Allow-Headers: origin, x-requested-with, content-type");
 
// error_reporting(E_ALL);
// ini_set('display_errors', 1); 
session_start();

ini_set('memory_limit', '512M'); 
ini_set('max_execution_time', 240);
set_time_limit(0);

$dir = dirname(__FILE__);
if(!defined('cur_dir')) { define('cur_dir', $dir); }

include_once cur_dir.'/_inc/req-includes.inc.php';
include_once cur_dir.'/_inc/parse.functions.php';
set_base_url();

$api_call = get_url_req_parts();

$accepted_base_reqs = [
	'dayvids', 
	'hashtag', 
	'category', 
	'creator', 
	'hashtag100', 
	'creator100', 
	'creatorgridindexed',
	'creatormulti',
	'categories1000',
	'categories',
	'getscreenshot',
	'loadscreenshot',
	'getqrcode',
	'getshareddata'
];

if(!empty($api_call)) {

	$output = $api_call;

	if(!empty($api_call[0]) && in_array($api_call[0], $accepted_base_reqs)) {
		$req_base = $api_call[0];
		switch($req_base) {
			case 'getscreenshot':
				include_once cur_dir.'/_classes/screenshot-generator.class.php';
				$ssgen = new screenshot_generator();
				$ssgen->data = $_POST;
				$ssgen->make_screenshot();
				$output = $ssgen->screenshot_url;
			  break;
			case 'loadscreenshot':
				include_once cur_dir.'/_classes/screenshot-loader.class.php';
				$ssldr = new screenshot_loader();
				$ssldr->load_screenshot();
			  break;
			case 'getqrcode':
				include_once cur_dir.'/_classes/create-qr-code.class.php';
				$ssldr = new create_qr_code();
				$ssldr->get_qr_code();
				$output = $ssldr->qr_img_path;
			  break;
			case 'getshareddata':
				include_once cur_dir.'/_classes/load-shared-data.class.php';
				$lsd = new load_shared_data();
				$lsd->load_data();
				$output = $lsd->visual_data;
			  break;
			default:
				include_once cur_dir.'/_classes/load-tiktok-data.class.php';
				$reader = new load_tiktok_data();
				$reader->req_parts = $api_call;
				$reader->mode = $req_base;
				$reader->get_data();
				$output = $reader->output;
			  break;
		}


	}
	if(isset($_GET['browser'])) {

		if(isset($_GET['graph'])) {
			echo $reader->get_heading();
			include_once cur_dir.'/_inc/graph-display.functions.php';
			echo display_graph($output);
			// die;
		}

		pprint_r($output);
		die;
	}
	// print_r($output);
	// die;
	die(json_encode($output)); // , JSON_PRETTY_PRINT
}