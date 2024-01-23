<?php

/**
 * 
 */
class load_shared_data {
	public $visual_data = [];
	public $tbl = 'tikapi__share';

	public function	load_data() {
		if(isset($_POST['key'])) {
			$key = sanitize_string( $_POST['key'] );
			$q = "SELECT data FROM $this->tbl WHERE share_key = :key";
			$data = DB_select_safe($q, [':key' => $key]);
			if(!empty($data)) {
				$this->visual_data = $data['data'];
			}
		}
	}
	
	function __construct()	{

	}
}