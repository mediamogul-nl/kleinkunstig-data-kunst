<?php
// Local
$DB_NAME = 'tikapi';
$DB_USER = 'root';
$DB_PASS = 'xxx';
$DB_HOST = 'localhost';


$DB = create_PDO_connect($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS);

header('Content-Type: text/html; charset=utf-8');

///////////////////////////////////////////////////////////////
//////////// PDO CONNECTION ? ///////////////////////////////////////
///////////////////////////////////////////////////////////////
function create_PDO_connect($DB_HOST, $DB_NAME, $DB_USER, $DB_PASS) {
	try {
	    $PDO_DB_connect = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS);
	    $PDO_DB_connect->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
	    return $PDO_DB_connect;
	}
	catch(PDOException $e) { echo $e->getMessage(); }
}

?>
