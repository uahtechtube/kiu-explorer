<?php
$mysqli = new mysqli("localhost", "root", "", "kiu_explorer");
$output = "";

if ($mysqli->connect_errno) {
    $output .= "Failed to connect to MySQL: " . $mysqli->connect_error;
} else {
    $result = $mysqli->query("DESCRIBE events");
    if ($result) {
        $output .= "Columns in 'events' table:\n";
        while ($row = $result->fetch_assoc()) {
            $output .= "- " . $row['Field'] . " (" . $row['Type'] . ")\n";
        }
        $result->free_result();
    } else {
        $output .= "Error: " . $mysqli->error;
    }
    $mysqli->close();
}
file_put_contents('events_structure.txt', $output);
echo "Structure saved to events_structure.txt";
?>
