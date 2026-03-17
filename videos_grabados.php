<?php

$carpeta = __DIR__ . "/videos_grabados/";
$fecha = date("Y-m-d");

if(isset($_FILES["video"])){

    $tema = $_POST["tema"];
    $temalimpio = str_replace(" ", "_", $tema);
    $nombre =$temalimpio . "_" . $fecha . "_" . basename($_FILES["video"]["name"]);
    $ruta = $carpeta . $nombre;

    if(move_uploaded_file($_FILES["video"]["tmp_name"], $ruta)){
        echo "Video guardado correctamente";
    }else{
        echo "Error al guardar el video";
    }

}else{
    echo "No se recibió ningún archivo";
}

?>