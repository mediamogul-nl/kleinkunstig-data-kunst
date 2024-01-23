<?php

class screenshot_generator {
	
	public $data = [];
	public $screenshot_url = '';

	public function make_screenshot() {
		// $this->data = json_decode($this->data, true);
		if(is_array($this->data) && array_key_exists('coords', $this->data)) {
			$this->crop_coords = $this->data['coords'];
			$this->img_data = $this->data['imgdata'];
			$this->create_png_image();
		}
	}

	public function create_png_image() {
		global $test_data;
		if(!property_exists($this, 'img_data')) {
			$this->img_data = $test_data;
		}

		$this->img_name = guid() . '.png';
		$this->img_path = dirname(__FILE__).'/../screenshots/'.$this->img_name;

		// Parse the iamge data
		$img = str_replace('data:image/png;base64,', '', $this->img_data);		
		$img = str_replace(' ', '+', $img);
		$img_data = base64_decode($img);
		// Create image
		$this->IMG_CREATE = imagecreatefromstring($img_data);
		// Set end image dimensions
		$crop_w = intval($this->crop_coords['crop_w']);
		$crop_h = intval($this->crop_coords['crop_h']);
		// Canvas to place it on
		$this->ICTC = imagecreatetruecolor( $crop_w , $crop_h);

		imagecopyresampled(
			$this->ICTC, 
			$this->IMG_CREATE, 
			0, 
			0, 
			intval($this->crop_coords['crop_x']), 
			intval($this->crop_coords['crop_y']), 
			$crop_w, 
			$crop_h, 
			$crop_w, 
			$crop_h
		);
		imagepng($this->ICTC, $this->img_path);
		// Set screenshot URL
		$this->screenshot_url = base_url . '?req=loadscreenshot&url='. $this->img_name;
	}

	function __construct()	{
		
	}
}
