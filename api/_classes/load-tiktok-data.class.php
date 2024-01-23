<?php

class load_tiktok_data {

	public $output = [];
	public $mode = '';
	public $title = '';

	public $cache_data = true;

	public function get_data() {
		switch ($this->mode) {
			case 'dayvids':
				$this->get_dayvids();
			  break;
			case 'hashtag':
			case 'hashtag100':
				$this->get_hashtag_timeline_V3('object', true);
			  break;
			case 'category':
				$this->category_vids();
			  break;
			case 'categories1000':
			case 'categories':
				$this->category_trend1000();
			  break;
			case 'creator':
			case 'creator100':
			case 'creatorgridindexed':
			case 'creatormulti':
				// return $this->test_grid_data();
				$this->creator_vids();
			  break;
		}
	}

	public function test_grid_data() {
		include_once cur_dir.'/_inc/_data/test-grid.data.php';
		$this->output = $gridindex;
	}

	public function get_dayvids() {
		$day = (isset($this->req_parts[1])) ? sanitize_string($this->req_parts[1]) : '';
		if(!empty($day)) {
			$this->cache_key = $this->mode.'.'.$day;
			if(!$this->get_cached_output()) {
				$this->title = $day;
				$date = strtotime($day);
				if(is_int($date)) {
					$this->req_day = $day;
					$q = "
					SELECT video_id 
					FROM tikapi__vids  
					WHERE 1
						AND scrape_time LIKE '".$this->req_day."%'
					ORDER BY scrape_time ASC 
					";
					$stmt = DB_rows_stmt($q);
					if(!empty($stmt)) {
						while($row_data = $stmt->fetch(PDO::FETCH_ASSOC)) {
							$this->output[] = $row_data;
						}
					}
					$this->cache_output( $this->mode.'.'.$day );
				}
			}
		}
	}
	/*  __               __    __             
	   / /_  ____ ______/ /_  / /_____ _____ _
	  / __ \/ __ `/ ___/ __ \/ __/ __ `/ __ `/
	 / / / / /_/ (__  ) / / / /_/ /_/ / /_/ / 
	/_/ /_/\__,_/____/_/ /_/\__/\__,_/\__, /  
	                                 /___*/	

	public function get_hashtag_timeline( $return = 'object', $check_cache = true ) {
		// return $this->test_grid_data();

		$tag_get = (isset($this->req_parts[1])) ? sanitize_string($this->req_parts[1]) : '';
		if(!empty($tag_get)) {
			$this->cache_key = $this->mode.'.'.$tag_get;
			if(!$check_cache || !$this->get_cached_output()) {
				$this->title = '<small>hashtag:</small> '. $tag_get;
				$num_per_index = [];
				$num_per_day = [];
				$tag_get = sanitize_string($tag_get);
				$q = "SELECT 
						gridindex
					FROM tikapi__vids
					WHERE 1
						AND tags LIKE '%\"".$tag_get."\"%'
					ORDER BY scrape_time ASC
				";
				$stmt = DB_rows_stmt($q);
				if(!empty($stmt)) {
					while($row_data = $stmt->fetch(PDO::FETCH_ASSOC)) {
						$gridindex = $row_data['gridindex'];
						// echo $day.'<br />';
						if($this->mode == 'hashtag') {
							if(!array_key_exists($gridindex, $num_per_index)) {
								$num_per_index[$gridindex] = 0;
							}
							$num_per_index[$gridindex]++;
						} else if($this->mode == 'hashtag100') {
							$index_day = intval( substr($gridindex, 0, 2) );
							if(!array_key_exists($index_day, $num_per_day)) {
								$num_per_day[$index_day] = 0;
							}
							$num_per_day[$index_day]++;
						}
					}
					$this->output = ($this->mode == 'hashtag') ? $num_per_index : $num_per_day ;

					if('array' == $return) {
						$this->output = [];
						// Array needed ? do this
						foreach($num_per_index as $key => $num) {
							$this->output[]	= ['index' => $key, 'num' => $num];
						}
					}

				}
				$this->cache_output( $this->mode.'.'.$tag_get );
			}
		}
	}

	public function get_hashtag_timeline_V3( $return = 'object', $check_cache = true ) {
		
		$max_vids_data_per_day = 20;

		$tag_get = (isset($this->req_parts[1])) ? sanitize_string($this->req_parts[1]) : '';
		if(!empty($tag_get)) {
			$this->cache_key = $this->mode.'.'.$tag_get;
			if(!$check_cache || !$this->get_cached_output()) {
				$this->title = '<small>hashtag:</small> '. $tag_get;
				$num_per_index = [];
				$vid_ids_per_day = [];
				$trend_data = [
					'videos' => [],
					'day_videos' => [],
					'num_per_day' => [],
					'num_per_index' => [],
				];
				$stored_vid_ids = [];

				$tag_get = sanitize_string($tag_get);
				$q = "SELECT 
						gridindex, video_id, author,
						LEFT(description, 50) as vidD,
						diggCount
					FROM tikapi__vids
					WHERE 1
						AND tags LIKE '%\"".$tag_get."\"%'
					ORDER BY scrape_time ASC
				";
				$stmt = DB_rows_stmt($q);
				if(!empty($stmt)) {
					while($row_data = $stmt->fetch(PDO::FETCH_ASSOC)) {
						$gridindex = $row_data['gridindex'];
						$index_day = intval( substr($gridindex, 0, 2) );
						$vid_id    = $row_data['video_id'];
						
						// Add to index for day-grid-loops
						if(!array_key_exists($gridindex, $trend_data['num_per_index'])) {
							$trend_data['num_per_index'][$gridindex] = 0;
						}
						$trend_data['num_per_index'][$gridindex]++;

						// Add to day
						if(!array_key_exists($index_day, $vid_ids_per_day)) {
							$vid_ids_per_day[$index_day] = [];
							$trend_data['num_per_day'][$index_day] = 0;
						}
						$trend_data['num_per_day'][$index_day]++;

						// Dont store more than 20 per day, not gonna be shown in the Front UX anyhow
						$store_vid_data = false;
						if(count($vid_ids_per_day[$index_day]) <= $max_vids_data_per_day) {
							$vid_ids_per_day[$index_day][] = $vid_id;// ++;
							$stored_vid_ids[] = $vid_id;
							$store_vid_data = true;
						}

						// Store the actual vid data (author, stat, desc)
						if($store_vid_data && !array_key_exists($vid_id, $trend_data['videos'])) {
							$trend_data['videos'][$vid_id] = [
								'a' => $row_data['author'],
								'd' => $this->remove_emoji( json_encode($row_data['vidD']) ),
								'l' => $row_data['diggCount'],
							];
						}

					}

					// Clean up unneeded video-data, that will not be shown anyhow
					$stored_vid_ids = array_unique($stored_vid_ids);
					foreach($trend_data['videos'] as $vid_id => $d) {
						if(!in_array($vid_id, $stored_vid_ids)) {
							unset($trend_data['videos'][$vid_id]);
						}
					}

					// Set for output
					$trend_data['day_videos'] = $vid_ids_per_day;

					// Set output
					$this->output = $trend_data;//($this->mode == 'hashtag') ? $num_per_index : $trend_data ;

					if('array' == $return) {
						$this->output = [];
						// Array needed ? do this
						foreach($num_per_index as $key => $num) {
							$this->output[]	= ['index' => $key, 'num' => $num];
						}
					}

				}
				$this->cache_output( $this->mode.'.'.$tag_get );
			}
		}
	}
	function remove_emoji($text){
		$poss = [];
		/*
		$emoji_bits = explode("\u", $text);
		$text = '';
		foreach($emoji_bits as $emoji_bit) {}
		*/
		
		// if($unipos!==false) {	die('$unipos: '.$unipos);		}
		while( ($unipos = strpos($text, "\u") ) !==false) {
			$emoji  =  substr($text, $unipos, 6);
			$text   = str_replace($emoji, '', $text);
			// $poss[] = $unipos ;//. ' <br />';
			// break;
		}/*
		if(!empty($poss)) {
			print_r($poss);
			echo($text); echo $unipos; die;
		}*/
		return json_decode( $text );
	}
	/*            __                             
	  _________ _/ /____  ____ _____  _______  __
	 / ___/ __ `/ __/ _ \/ __ `/ __ \/ ___/ / / /
	/ /__/ /_/ / /_/  __/ /_/ / /_/ / /  / /_/ / 
	\___/\__,_/\__/\___/\__, /\____/_/   \__, /  
	                   /____/           /___*/	

	public $cats = [
		1 => 'Comedy',
		2 => 'Entertainment',
		3 => 'Daily Life',
		4 => 'Sports',
		5 => 'Vehicle',
		6 => 'Gaming',
		7 => 'Music',
		8 => 'Fitness/Health',
		9 => 'Science/Education',
		10 => 'Beauty/Style',
		11 => 'Food',
		12 => 'Motivation/Advice',
		13 => 'Family',
		14 => 'Dance',
		15 => 'Outdoors',
		16 => 'Art',
		17 => 'Home/Garden',
		18 => 'Satisfying',
		19 => 'Travel',
		20 => 'Life Hacks',
		21 => 'Anime',
		22 => 'DIY',
		25 => 'Shopping',
		26 => 'Animals',
		27 => 'Religion',
		23 => 'TikTok',
		24 => 'Ignore'
	];

	public function category_vids() {
		$cat_id = (isset($this->req_parts[1])) ? intval($this->req_parts[1]) : 0;
		if(array_key_exists($cat_id, $this->cats)) {
			$this->cache_key = $this->mode.'.'.$cat_id;
			if(!$this->get_cached_output()) {
				$rel_tags = [];
				$cat_hashtags = "SELECT tag FROM tikapi__hashtags WHERE cat_id = $cat_id ORDER BY used DESC";
				$cats_stmt = DB_rows_stmt($cat_hashtags);
				while($cat_res = $cats_stmt->fetch(PDO::FETCH_ASSOC)) {
					$rel_tags[] = $cat_res['tag'];
				}
				// Get vids
				$q2 = "SELECT video_id as id, gridindex as i FROM tikapi__vids WHERE 1 AND ( ";
				foreach($rel_tags as $rel_tag) {
					$reltag = json_encode($rel_tag);
					$q2.=" tags LIKE '%$reltag%' OR ";
				}
				$q2 = substr($q2, 0, strlen($q2)  -3);
				$q2.=")";
				$vids_stmt = DB_rows_stmt($q2);
				while($cat_res = $vids_stmt->fetch(PDO::FETCH_ASSOC)) {
					$this->output[] = $cat_res;
				}
				$this->cache_output();
			}
		}
	}

	public function category_trend1000() {
		$cats_per_day = file_get_contents(cur_dir.'/_inc/_data/cats-per-day.json');
		$this->output = json_decode($cats_per_day, true);
		return $this->output;
	}

	/*                      __                 
	  _____________  ____ _/ /_____  __________
	 / ___/ ___/ _ \/ __ `/ __/ __ \/ ___/ ___/
	/ /__/ /  /  __/ /_/ / /_/ /_/ / /  (__  ) 
	\___/_/   \___/\__,_/\__/\____/_/  /___*/

	public function creator_vids() {
		$this->creator_name = (isset($this->req_parts[1])) ? sanitize_string($this->req_parts[1]) : '';
		$this->point_index = (isset($this->req_parts[2])) ? sanitize_string($this->req_parts[2]) : '';
		if(!empty($this->point_index) && !empty($this->creator_name)) {
			$this->cache_key = $this->mode.'.'.$this->creator_name.'.'.$this->point_index;
			$this->get_creator_point_info();
		} else if(!empty($this->creator_name)) {
			$this->cache_key = $this->mode.'.'.$this->creator_name;
			$this->get_creator_grid();
		}
	}

	public function get_creator_point_info() {
		$q = "SELECT * FROM tikapi__authors WHERE author = :creator";
		$data = DB_select_safe($q, [':creator' => $this->creator_name]);
		if(!empty($data)) {
			$this->get_full_gridindex();
			$indexes    = json_decode($data['gridindexes'], true);
			// find index before that	
			$find_exact = array_search($this->point_index, $indexes);
			if($find_exact!==false) {
				$this->data_index = $find_exact;
			} else {
				$pointInt = $this->gridpoint_to_int($this->point_index);
				foreach($indexes as $i => $index) {
					$indexInt = $this->gridpoint_to_int($index);
					if($indexInt > $pointInt) {
						break;
					}
				}
				$this->data_index = ($i > 0) ? $i - 1 : 0;
			}
			$followers = json_decode( $data['trend_followers'], true);
			$hearts    = json_decode( $data['trend_hearts'], true);
			$num_vids  = json_decode( $data['trend_num_vids'], true);

			$this->output = [
				'point' => $this->point_index,
				'creator' => $this->creator_name,
				'stats' => [
					'followers' => $followers[$this->data_index],
					'hearts' => $hearts[$this->data_index],
					'num_vids' => $num_vids[$this->data_index],
				]
			];
			// echo $this->point_index . '('.$pointInt.')  $this->data_index: '.$this->data_index . '<br />';		
			// pprint_r($this->output);
		}
	}

	public function gridpoint_to_int($point) {
		return intval( str_replace('.', '', $point) );
	}

	public function get_creator_grid() {

		$growth_fields = ['trend_followers', 'trend_hearts', 'trend_num_vids'];
		$growth_field  = implode(', ', $growth_fields);

		if(!$this->get_cached_output()) {
			$q = "SELECT gridindexes, $growth_field FROM tikapi__authors WHERE author = :creator";
			$data = DB_select_safe($q, [':creator' => $this->creator_name]);
			if(!empty($data)) {
				$this->get_full_gridindex();
				$indexes    = json_decode($data['gridindexes'], true);
				/*
				// Default single trend only
				if(!isset($growth_fields)) {
					$index_data = json_decode($data[$growth_field], true);
					$min = $index_data[0];
					$prev = $min;
				}
				*/
				$output = [];

				$index_data_followers = json_decode($data['trend_followers'], true);
				$index_data_hearts    = json_decode($data['trend_hearts'], true);
				$index_data_num_vids  = json_decode($data['trend_num_vids'], true);

				$output = [
					'followers' => $this->creator100days($indexes, $index_data_followers),
					'hearts'    => $this->creator100days($indexes, $index_data_hearts),
					'num_vids'  => $this->creator100days($indexes, $index_data_num_vids),
				];

				if('creatorgridindexed' == $this->mode) {
					$output['gridindex'] = $this->creatorGridIndex($indexes, $index_data_followers);				
				}

				$this->output = $output;
				$this->cache_output();
			}
		}
	}

	public function creator100days($indexes, $index_data) {
		$num_per_day = [];
		foreach($indexes as $i => $gridindex) {
			$grid_val = $index_data[$i];

			$index_day = intval( substr($gridindex, 0, 2) );
			if(!array_key_exists($index_day, $num_per_day)) {
				$num_per_day[$index_day] = [];
			}
			$num_per_day[$index_day][] = $grid_val;
		}
		$creator100 = range(0, 99);
		$output = [];
		$prev_v = 0;
		foreach($creator100 as $day_i) {
			$day_val = $prev_v;
			if(array_key_exists($day_i, $num_per_day)) {
				$day_vals = $num_per_day[$day_i];
				arsort( $day_vals );
				$day_val = $day_vals[0];
			}
			$output[$day_i] = $day_val;
			$prev_v = $day_val;
		}
		return $output;
	}

	public function creatorGridIndex($indexes, $index_data) {
		$output = [];
		foreach($this->grid_index as $grid_key) {
			// echo $grid_key . '<br />';
			$found_i = array_search($grid_key, $indexes);
			if($found_i!==false) {
				$val = $index_data[$found_i];
				$prev = $val;
			} else {
				$val = $prev;
			}
			$output[$grid_key] = $val;
		}
		return $output;
	}

	public function get_full_gridindex() {
		include_once cur_dir.'/_inc/_data/gridindex.array.php';
		$this->grid_index = $gridindex;
	}

	public function get_heading() {
		if(!empty($this->title)) {
			return '<h1>'.$this->title.'</h1>';
		}
	}

	public function cache_output() {
		if(!$this->cache_data) { return false; }

		global $DB_fail_msg;
		$insert_vals = [
			'request' => $this->cache_key,
			'output' => json_encode($this->output)
		];
		DB_insert('tikapi__cache', $insert_vals);
		if(!empty($DB_fail_msg)) { die($DB_fail_msg); }
	}

	public function get_cached_output() {
		if(!$this->cache_data) { return false; }
		// return false;

		$q = "SELECT output FROM tikapi__cache WHERE request = :request ";
		$data = DB_select_safe($q, [ ':request' => $this->cache_key] );
		if(!empty($data)) {
			$this->output = json_decode($data['output'], true);
			return true;
		}
		return false;
	}

	function __construct()	{

	}
}