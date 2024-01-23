<?php
$DB_fail_msg = '';

function DB_test_output() {
	return (log_allowed() && isset($_GET['testdb']));
}
function DB_select_safe($query = '', $query_params = array()) {
	global $DB, $DB_fail_msg;
	//$query_params: 
	// named 	- array(':user_email' => $username, ':user_pass' => $pass_to_check)
	// unnamed	- array($user_name, $pass_to_check)
	try {
		$stmt = $DB->prepare($query);
		$stmt->execute($query_params);
		return $stmt->fetch(PDO::FETCH_ASSOC);
	}
	catch(PDOException $e) { $DB_fail_msg = 'DB_select_safe: '.$e->getMessage().'<br />'.$query.'<br />'.print_r($query_params, true); }
}
function DB_select($fields = array(), $table = '', $row_id = 0, $custom_query='') {
	global $DB, $DB_fail_msg;
	$return_array = false;

	if(is_array($fields)) {
		if(count($fields)>0) { $return_array = true; }
		$fields = implode(', ', $fields);
	} else if($fields=='*' || $fields==null) {
		$return_array = true;
	}
	$row_id = intval($row_id);
	// Test ?
	if(DB_test_output()) {
		echo '<br /> fields: '.print_r($fields, true);
		echo '<br /> table: '.$table;
		echo '<br /> $row_id: '.$row_id;
		echo '<br /> $custom_query: '.$custom_query;
		echo '<br /> $return_array: '.$return_array;		
		echo '<hr />';
	}
	$num = 0;
	if($custom_query=='' && is_numeric($row_id)) {
		$table = sanitize_string($table);
		$query = 'SELECT '.$fields.' FROM '.$table.' WHERE id=:id ';
		if(DB_test_output()) { echo $query.' ('.$row_id.')<br />'; }
		try {
			$q = $DB->prepare($query);
			$fields_save[':id'] = $row_id;
			$q->execute($fields_save);
			$num = $q->rowCount();
		}
		catch(PDOException $e) { $DB_fail_msg = 'DB_select: '.$e->getMessage().'<br />'.$query; }
	} else {
		try {
			$q = $DB->query($custom_query);
			$num = $q->rowCount();
		}
		catch(PDOException $e) { $DB_fail_msg = 'DB_select: '.$e->getMessage().'<br />'.$custom_query; }
	}
	if($num<1) {
		return false;
	} else {
		$f = $q->fetch(PDO::FETCH_ASSOC);
		if($return_array==true) {
			return $f;
		} else {
			return $f[$fields];
		}
	}
}
function DB_select_q($q = '', $single_field = false) {
	global $DB, $DB_fail_msg;
	$num = 0;
	try {
		$q = $DB->query($q);
		$num = $q->rowCount();
	}
	catch(PDOException $e) { $DB_fail_msg = 'DB_select_q: '. $e->getMessage().'<br />'.$q; }

	if($num<1) {
		return false;
	} else {
		$f = $q->fetch(PDO::FETCH_ASSOC);
		if($single_field!=false) { return $f[$single_field]; }
		return $f;
	}
}
function DB_rows_safe($query = '', $query_params = array()) {
	global $DB, $DB_fail_msg;
	//$query_params: 
	// named 	- array(':user_email' => $username, ':user_pass' => $pass_to_check)
	// unnamed	- array($user_name, $pass_to_check)
	$num_rows = 0;
	try {
		$stmt = $DB->prepare($query);
		$stmt->execute($query_params);
		$num_rows = $stmt->rowCount();
	}
	catch(PDOException $e) { $DB_fail_msg = 'DB_rows_safe: '. $e->getMessage().' '.$query; }

	// echo $num_rows;
	if($num_rows==0) {
		return false;
	} else {
		$result_array = array();
		while($f = $stmt->fetch(PDO::FETCH_ASSOC)) {
			$result_array[] = $f;
		}
		return $result_array;
	}
}
// Need a safe DB_rows for front end with user input !
function DB_rows($q_str='', $single_val=false, $store_by_id=false) {
	global $DB, $DB_fail_msg;

	$return_array = false;
	$result_array = array();
	$num_rows = 0;
	try {
		$stmt = $DB->query($q_str);
		$num_rows = $stmt->rowCount();
	}
	catch(PDOException $e) { $DB_fail_msg = 'DB_rows: '. $e->getMessage().'<br />'.$q_str; }

	// Return assoc array ID as key ?
	if($store_by_id!=false) {
		if(is_bool($store_by_id )) {
			$store_by_id_field = 'id';
		} else if(is_string($store_by_id)) {
			$store_by_id_field = $store_by_id;
		}
	}

	if($num_rows>0) {
		while($f = $stmt->fetch(PDO::FETCH_ASSOC)) {
			if($single_val==false) {
				if($store_by_id==false) {
					$result_array[] = $f;
				} else {
					$result_array[$f[$store_by_id_field]] = $f;					
				}
			} else if(is_string($single_val)) {
				if($store_by_id==false) {
					$result_array[] = $f[$single_val];
				} else {
					$result_array[$f[$store_by_id_field]] = $f[$single_val];					
				}
			}
		}
		return $result_array;
	} else {
		return $result_array;
	}
}
function DB_rows_stmt($q_str) {
	global $DB;
	$stmt = $DB->query($q_str);
	$num_rows = $stmt->rowCount();
	// while($row_data = $stmt->fetch(PDO::FETCH_ASSOC)) {
	if($num_rows>0) { return $stmt; }
	return false;
}

function DB_fields_prepared($fields = [], $add_index=null) {
	$prepared_vals = array();
	foreach($fields as $field => $val) {
		$field_name = ':'.$field;
		if($add_index!=null) { $field_name.=$add_index; }
		$prepared_vals[$field_name] = $val;
	}
	return $prepared_vals;
}

function DB_insert($table = '', $insert_vals = [], $uniq_field='id') {
	global $DB, $DB_fail_msg;
	if(!array_key_exists($uniq_field, $insert_vals)) {
		// $insert_vals['id']='null';
	}
	$insert_q_str = '
		INSERT INTO '.$table.' (
			'.implode(',', array_keys($insert_vals)).'
		) VALUES (
			:'.implode(', :', array_keys($insert_vals)).'
		)
	';
	// echo $insert_q_str;
	// echo $table;
	// print_r($insert_vals);
	$stmt = $DB->prepare($insert_q_str);
	$prepared_vals_array = DB_fields_prepared($insert_vals);
	try {
		// print_r($prepared_vals_array);
		$stmt->execute($prepared_vals_array);
		$affected_rows = $stmt->rowCount();

		return $DB->lastInsertId();
	}
	catch(PDOException $e) { $DB_fail_msg = 'DB_insert: '. $e->getMessage().'<hr />'.$insert_q_str.'<hr />vals<hr />'.print_r($prepared_vals_array, true); }
}

function DB_update_multiple($table = '', $update_vals = [], $uniq_field='id') {
	global $DB;
	/*
		$update_vals = array(
			[row_id-1]=>array(field_1 => val_1, field_2 => val_2),
			[row_id-2]=>array(field_1 => val_1, field_2 => val_2),
		);
	*/

	$first_key = array_first_key($update_vals);
	$fields = array_keys($update_vals[array_first_key($update_vals)]);
	$update_q = "UPDATE $table SET ";
	foreach($fields as $field) {
		$update_q.=$field.' = :'.$field.', ';
	}
	$update_q = str_bite($update_q, 2);
	$update_q.=' WHERE '.$uniq_field.' = :uniq';
	$stmt = $DB->prepare($update_q);
	foreach($update_vals as $uniq_val => $field_vals) {
		$this_update_vals = array();
		$this_update_vals[':uniq'] = $uniq_val;
		foreach($field_vals as $field => $val) {
			$this_update_vals[':'.$field] = $val;
		}
		$stmt->execute($this_update_vals);		
	}
}

function DB_insert_multiple($table = '', $insert_vals=array()) {
	global $DB;
	/*
		$insert_vals = array(
			[0]=>array(field_1 => val_1, field_2 => val_2),
			[1]=>array(field_1 => val_1, field_2 => val_2),
		);
	*/
	// Check if has 0 key
	if(array_key_exists(0, $insert_vals)) {
		$fields = array_keys($insert_vals[0]);
		$insert_q_str = '
			INSERT INTO '.$table.' (
				'.implode(', ', $fields).'
			) VALUES ';
		$num_rows_to_insert = count($insert_vals);
		$prepared_fields_str = DB_fields_prepared($fields);
		foreach($insert_vals as $u => $vals_to_insert) {
			$u++;
			$insert_q_str.='(:'.implode($u . ', :' , $prepared_fields_str) .$u. ')';
			if($u<$num_rows_to_insert) { $insert_q_str.=', '; }
		}
		// echo $insert_q_str;
		$stmt = $DB->prepare($insert_q_str);
		// insert vals safe maken
		$vals_to_insert = array();
		foreach($insert_vals as $i => $insert_val) {
			$i++;
			$this_row_prepared_vals = DB_fields_prepared($insert_val, $i);
			$vals_to_insert = array_merge($vals_to_insert, $this_row_prepared_vals);
		}
		// echo 'table: '.$table.' vals: ' .print_r($vals_to_insert, true).' <br />$insert_q_str: '.$insert_q_str.'<hr />';
		$stmt->execute($vals_to_insert);
	}
}
function DB_update_q_str($db_vals = [], $table = '', $extra_where_q='', $uniq_field='id') {
	$update_q_str = 'UPDATE '.$table.' SET ';
	$update_q_str_end = ' WHERE id='.$db_vals[$uniq_field].' '.$extra_where_q;
	unset($db_vals[$uniq_field]);
	$fi=0;
	foreach($db_vals as $field => $val) {
		$fi++;
		$update_q_str.=' '.$field.' = "'.$val.'" ';
		if($fi<count($db_vals)) { $update_q_str.=', '; }
	}
	$update_q_str.=$update_q_str_end;
	return $update_q_str;
}
function DB_update($table, $update_vals, $extra_where_q='', $update_id=0, $uniq_field='id') {
	global $DB, $DB_fail_msg;
	$update_q_str = 'UPDATE '.$table.' SET ';
	$this_update_vals = $update_vals;
	if($update_id==0 && array_key_exists($uniq_field, $update_vals)) {
		$update_id = $update_vals[$uniq_field];
		unset($this_update_vals[$uniq_field]);
	}
	$update_q_str_end = ' WHERE '.$uniq_field.'=:'.$uniq_field.' '.$extra_where_q;
	// prepared array incl. uniq field
	$prepared_vals_array = array();
	$prepared_vals_array[':'.$uniq_field] = $update_id;
	$fi = 0;
	foreach($update_vals as $field => $val) {
		$fi++;
		$update_q_str.=' '.$field.' = :'.$field.' ';
		if($fi<count($update_vals)) { $update_q_str.=', '; }
		$prepared_vals_array[':'.$field] = $val;
	}

	$full_update_q_str = $update_q_str.$update_q_str_end;
	try {
		// echo $full_update_q_str;
		$stmt = $DB->prepare($full_update_q_str);
		$stmt->execute($prepared_vals_array);
		// print_r($prepared_vals_array);
		// die;
		return $stmt->rowCount();
	}
	catch(PDOException $e) { $DB_fail_msg = 'DB_update: '. $e->getMessage().'<br />'.$full_update_q_str.'<br />'.print_r($prepared_vals_array, true); }
}
function DB_query($query) {
	global $DB, $DB_fail_msg;
	try {
		$q = $DB->query($query);
	}
	catch(PDOException $e) { $DB_fail_msg = 'DB_query: '. $e->getMessage().'<br />'.$query; }
	return $q;
}
function DB_delete_by_query($query) {
	DB_query($query);
}
function DB_query_safe($query = '', $query_params = array()) {
	global $DB, $DB_fail_msg;
	try {
		$stmt = $DB->prepare($query);
		$stmt->execute($query_params);
	}
	catch(PDOException $e) { $DB_fail_msg = 'DB_query_safe: '.$e->getMessage().'<br />'.$query.'<br />'.print_r($query_params, true); }
}

function DB_delete($table = '', $delete_id = 0, $object = null, $del_db_field='id') {
	global $DB;

	$image_fields = array();

	if(
		property_exists($object, 'OTE')
		&&
		array_key_exists('thumbnail', $object->OTE->input_fields)
		&&
		property_exists($object->OTE, 'object_image_settings')
		&&
		count($object->OTE->object_image_settings)>0
		&&
		array_key_exists('image_bank_fields', $object->OTE->object_image_settings)
	) {
		$image_fields = array_keys($object->OTE->object_image_settings['image_bank_fields']);
	}

	$delete_id = intval($delete_id);

	if(count($image_fields)>0) {
		$content_object_image_data_q= $DB->query("SELECT * FROM $table WHERE id='$delete_id'");
		$num_exists=$content_object_image_data_q->rowCount();
		if($num_exists==1) {
			$content_object_image_data_f=$content_object_image_data_q->fetch(PDO::FETCH_ASSOC);
			foreach($db_image_fields as $db_image_field) {
				if(in_array($db_image_field, $content_object_image_data_f)) {
					delete_file($content_object_image_data_f[0][$db_image_field]);
				}
			}
		}
	}
	$del_query_str = "DELETE FROM $table WHERE $del_db_field=:$del_db_field";
	// echo $del_query_str;
	$del_stmt = $DB->prepare($del_query_str);
	$del_stmt->bindValue(':'.$del_db_field, $delete_id, PDO::PARAM_STR);
	$del_stmt->execute();	
}
/*
function DB_row_IDs($field='id', $table='', $object=null, $filter_q='') {
	global $DB;
	if($table=='' && is_object($object)) { $table = $object->db_table; }
	$query_str = "SELECT $field FROM $table WHERE 1 $filter_q ORDER BY id ASC";
	return DB_row_IDs_query($query_str, $field);
}
function DB_row_IDs_query($query, $field) {
	global $DB;
	// echo $query.'<hr />';
	$ids = array();
	$q = $DB->query($query);
	while($f=$q->fetch(PDO::FETCH_ASSOC)) {
		$ids[] = $f[$field];
	}
	return $ids;
}
function DB_row_assoc($table='', $key='id', $val='name', $object=null, $filter_q='', $order_q='') {
	global $DB;
	if($table=='' && is_object($object)) { $table = $this->db_table; }

	$return_array = false;
	$result_array = array();
	if($order_q=='') { $order_q = " ORDER BY $val ASC ";}
	$q_str = "SELECT $key, $val FROM $table WHERE 1 $filter_q $order_q";
	// echo $q_str;
	$stmt = $DB->query($q_str);
	$num_rows = $stmt->rowCount();

	if($num_rows>0) {
		while($f = $stmt->fetch(PDO::FETCH_ASSOC)) {
			$result_array[$f[$key]] = $f[$val];				
		}
		return $result_array;
	} else {
		return false;
	}
}
*/

function DB_select_or_options($array = [], $field='id', $table = '') {
	$q_str='';
	foreach($array as $option) {
		$q_str.=" $table.$field='$option' OR ";	
	}
	$q_str = str_bite($q_str, 3);
	return $q_str;
}

function DB_get_number_of_uniq_field($t, $f){
	global $DB;
	$query = "
		SELECT $f, COUNT( $f ) AS amount
		FROM $t
		GROUP BY $f
		ORDER BY amount DESC 
	";
	$DB->query($query);
}
function DB_available_tables() {
	global $DB;
	$tables_array = array();
	$tables_stmnt = $DB->query('SHOW TABLES');
	while($f = $tables_stmnt->fetch()) {
		$tables_array[$f[0]] = $f[0];
	}
	return $tables_array;
}
function DB_table_fields($table) {
	global $DB;
	$q = $DB->prepare('DESCRIBE '.$table);
	$q->execute();
	$table_fields = $q->fetchAll(PDO::FETCH_COLUMN);
	return $table_fields;
}
?>