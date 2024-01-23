<?php

function pprint_r($data, $echo = true) {
	$content = '<pre>'.print_r($data, true).'</pre>';
	if($echo) { echo $content; } else { return $content; }
}

function content_iconv($data = '', $to = 'utf-8') {
    $encode_array = array('UTF-8','ASCII','GBK','GB2312','BIG5','JIS','eucjp-win','sjis-win','EUC-JP');
    $encoded = mb_detect_encoding($data, $encode_array);
   	// echo $encoded;
    $to = strtoupper($to);
    if($encoded != $to) {
        $data = mb_convert_encoding($data, 'utf-8', $encoded);
    }
    return $data;
}

function sanitize_string($input) {
	$sanitized = filter_var($input, FILTER_SANITIZE_FULL_SPECIAL_CHARS, FILTER_FLAG_STRIP_HIGH);
	return $sanitized;
}
function set_base_url() {
	if(
		isset($_SERVER) 
		&& 
		array_key_exists('SERVER_NAME', $_SERVER) 
		&&
		strpos($_SERVER["SERVER_NAME"], 'local.')!==false
	) {
		define('base_url', 'http://local.kk-datavisuals-api:8888/');
	} else {
		define('base_url', 'https://100daysofdata.kleinkunstig.nl/api/');
	}
}
function array_strip_empty($var) {
	return !empty($var);
}

function get_url_req_parts() {
	$req_parts = [];
	$url = get_cur_page_url();

	$url_parts = parse_url($url);
	if(isset($_GET['req']))	 {
		$req_2_parse = $_GET['req'];
	} else if(array_key_exists('path', $url_parts) && !empty($url_parts['path'])) {
		$req_2_parse = 	$url_parts['path'];
	}
	if(!empty($req_2_parse)) {
		$path_parts = explode('/',  $req_2_parse);
		$path_parts = array_filter($path_parts, 'array_strip_empty');
		// Reset keys
	    $req_parts = array_values(array_filter($path_parts));		
	}
	return $req_parts;
}

function get_cur_page_url($strip_get_vars=false) {
	$page_url = 'http';
		if (array_key_exists('HTTPS', $_SERVER) && ($_SERVER['HTTPS'] == 'on')) { $page_url .= 's'; }
	$page_url .= '://';
 	/*
 	if ($_SERVER['SERVER_PORT'] != '80') {
 		$page_url .= $_SERVER['SERVER_NAME'].':'.$_SERVER['SERVER_PORT'].$_SERVER['REQUEST_URI'];
	} else {
		$page_url .= $_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];
	}
	*/
	$page_url .= $_SERVER['SERVER_NAME'].$_SERVER['REQUEST_URI'];

	if($strip_get_vars) {
		$page_bits = explode('?', $page_url);
		$page_url = $page_bits[0];
	}
	return $page_url;
}
function guid(){
	if (function_exists('com_create_guid')){
		return com_create_guid();
	} else {
		mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
		$charid = strtoupper(md5(uniqid(rand(), true)));
		$hyphen = chr(45);// "-"
		$uuid = 
				// chr(123)// "{"
				substr($charid, 0, 8).$hyphen
				.substr($charid, 8, 4).$hyphen
				.substr($charid,12, 4).$hyphen
				.substr($charid,16, 4).$hyphen
				.substr($charid,20,12);
				// .chr(125);// "}"
		return $uuid;
	}
}