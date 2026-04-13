<?php 
$servidor = "localhost";
$usuario = "root";
$password = "";
$base_datos = "videos";

$conexion = new mysqli($servidor,$usuario,$password,$base_datos);

if($conexion->connect_error){
die("error en la conexion: " . $conexion->connect_error);
}
?>