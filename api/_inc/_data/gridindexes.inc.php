<?php
$indexes = [];

$per_row = 10;
$num_rows = $per_row;


/*
$row_i = 0;
for($i = 0; $i < 10000; $i++) {
	echo $i."\t";
	if($i > 0 && ($i + 1)%$per_row == 0) { 
		echo "\n"; 
		$row_i++;
	}
}
die;
*/

for ($i=0; $i < 100; $i++) { 
	$grid_i = ($i < 10) ? '0'.$i : $i;
	for ($i2=0; $i2 < 100; $i2++) { 
		$grid_i2 = ($i2 < 10) ? '0'.$i2 : $i2;
		$key = $grid_i.'.'.$grid_i2;;
		$indexes[$key] = intval($grid_i) ;
		// echo $key  . ',<br />';
	}
}
print_r($indexes);

?>