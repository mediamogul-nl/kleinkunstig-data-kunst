<?php

class screenshot_loader {

	public function load_screenshot() {
		$ss_dir = dirname(__FILE__).'/../screenshots/';
		if(isset($_GET['url'])) {
			$img_name = sanitize_string( $_GET['url'] );
			$file = $ss_dir.$img_name;
			if (file_exists($file)) {
				//echo "file exists: $file";
			    header('Content-Description: File Transfer');
			    header('Content-Type: application/octet-stream');
			    header('Content-Disposition: attachment; filename='.basename($file));
			    header('Content-Transfer-Encoding: binary');
			    header('Expires: 0');
			    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
			    header('Pragma: public');
			    header('Content-Length: ' . filesize($file));
			    ob_clean();
			    flush();
			    readfile($file);
			    unlink($file);
			    exit;
			} else {
				return false;
			}
		}
	}
	function __construct()	{}
}