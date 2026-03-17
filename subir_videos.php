<?php
include 'conexion.php';
$carpeta=__DIR__ . "/videos_listos/" ;
$fecha=date("Y-m-d");
$titulo=$_POST["titulo"];
$tema=$_POST["tema"];
$nivel=$_POST["nivel"];
$palabra=$_POST["palabra"];
$nombre=$fecha . "_" . basename($_FILES["video"]["name"]);
$ruta=$carpeta . $nombre;
if(move_uploaded_file($_FILES["video"]["tmp_name"], $ruta)){
    $ruta_bd = "videos_listos/" . $nombre;
        // Preparar la consulta SQL
    $sql = "INSERT INTO videos (titulo, tema, nivel, palabra, ruta_video, fecha_subida) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ssisss",$titulo, $tema, $nivel, $palabra, $ruta_bd, $fecha);
    
    if($stmt->execute()) { //mensaje de registro exitoso o erroneo
        header("location: Dashboard_Creador.html");
        exit;
    }else{
        echo "Error BD: " . $stmt->error;
    }
        echo "Video guardado correctamente";

}else{

    echo "Error al guardar el video";

}
$stmt->close();
$conexion->close();
?>