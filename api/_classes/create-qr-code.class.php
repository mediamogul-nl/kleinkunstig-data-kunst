<?php

class create_qr_code {

	public $share_url = '';	
	public $qrs_dir = '/qrs/';	
	public $tbl = 'tikapi__share';

	public $overwrite_exising = true;

	public function set_share_base_url() {
		if(strpos(base_url, 'kleinkunstig.nl')!==false) {
			$this->share_base_url = str_replace('/api/', '/phone', base_url);
		} else {
			$this->share_base_url = 'http://localhost:5173/phone';
		}
	}

	public function get_qr_code() {
		$this->set_share_base_url();
		if(isset($_POST['guid'])) {
			$this->key = sanitize_string( $_POST['guid'] );
		}
		if(isset($_POST['visualsData'])) {
			
			$data_2_store = [];
			foreach($_POST['visualsData'] as $visual) {
				// Remove grid
				if(array_key_exists('grid', $visual)) {
					unset($visual['grid']);
				}
				$data_2_store[] = $visual;
			}
			if(!empty($data_2_store)) {
				$update_id = 0;
				if(!$this->overwrite_exising) {
					$this->set_storage_key();
				} else {
					$q = "SELECT id FROM $this->tbl WHERE share_key = :key";
					$data = DB_select_safe($q, [':key' => $this->key]);
					if(!empty($data)) {
						$update_id = $data['id'];
					}
				}
				$insert_vals = [
					'share_key' => $this->key,
					'data'      => json_encode($data_2_store)
				];
				// Overwrite existing?
				if($update_id > 0) {
					$insert_vals['id'] = $update_id;
					DB_update($this->tbl, $insert_vals);
				} else {
					DB_insert($this->tbl, $insert_vals);
				}
				$this->share_url = $this->share_base_url . '?#shared:'. $this->key;
				$this->generate_qr_code();
			}
		}
	}


	public function generate_qr_code() {
		include_once cur_dir.'/libs/phpqrcode/qrlib.php';
		$path = 'qrs/';
		$file = cur_dir.$this->qrs_dir.'/share-qr-'.$this->key.'.png';
		$this->qr_img_path = base_url.$this->qrs_dir.'/share-qr-'.$this->key.'.png';

		if(file_exists($file)) { unlink($file); }

		if(!file_exists($file)) {		  
			// $path variable store the location where to store image and $file creates directory name
			// of the QR code file by using 'uniqid'
			// uniqid creates unique id based on microtime

			// $ecc stores error correction capability('L')
			$ecc = 'Q';
			$pixel_Size = 10;
			$frame_Size = 10;
			  
			// Generates QR Code and Stores it in directory given
			QRcode::png($this->share_url, $file, $ecc, $pixel_Size, $frame_size);
			  
			// Displaying the stored QR code from directory
			// echo "<center><img src='".$file."'></center>";
		}

	}

	public function set_storage_key() {
		if(!isset($_SESSION['storage-key'])) {
			$_SESSION['storage-key'] = guid();
		}
		$this->key = $_SESSION['storage-key'];
	}

	function __construct()	{

	}
}