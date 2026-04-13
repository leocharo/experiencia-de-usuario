<?php
include "conexion.php";

$sql = "SELECT * FROM videos";
$resultado = $conexion->query($sql);

$videos = [];

while($fila = $resultado->fetch_assoc()){
    $videos[] = $fila;
}

echo json_encode($videos);
?>