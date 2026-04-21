<?php
$mysqli = new mysqli("localhost", "root", "", "kiu_explorer");

if ($mysqli->connect_errno) {
    echo "Failed to connect to MySQL: " . $mysqli->connect_error;
    exit();
}

$result = $mysqli->query("SELECT id, name, email, role FROM users");

if ($result) {
    echo "Found " . $result->num_rows . " users:\n";
    while ($row = $result->fetch_assoc()) {
        echo "- " . $row['name'] . " (" . $row['email'] . ") [" . $row['role'] . "]\n";
    }
    $result->free_result();
} else {
    echo "Error: " . $mysqli->error;
}

$mysqli->close();
?>
