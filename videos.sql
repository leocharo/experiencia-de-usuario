-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-03-2026 a las 06:42:29
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `videos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `videos`
--

CREATE TABLE `videos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `tema` varchar(100) NOT NULL,
  `nivel` int(11) DEFAULT NULL,
  `palabra` varchar(100) DEFAULT NULL,
  `ruta_video` varchar(255) NOT NULL,
  `fecha_subida` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `videos`
--

INSERT INTO `videos` (`id`, `titulo`, `tema`, `nivel`, `palabra`, `ruta_video`, `fecha_subida`) VALUES
(5, 'Señal_números', 'Números y cantidades', 2, '5', 'video/Números y cantidades_2026-03-14_Números_2026-03-14_video.webm', '2026-03-14 00:00:00'),
(6, 'Señal_Números', 'Números y cantidades', 2, '100', 'video/_Números_2026-03-14_video.webm', '2026-03-15 00:00:00'),
(7, 'Señal-Panda', 'Animales', 2, 'Panda', 'videos_listos/2026-03-17_Animales_2026-03-16_video.webm', '2026-03-17 00:00:00');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `videos_revision`
--

CREATE TABLE `videos_revision` (
  `id` int(11) NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `tema` varchar(150) NOT NULL,
  `nivel` int(11) NOT NULL,
  `palabra` varchar(100) DEFAULT NULL,
  `ruta_video` varchar(255) NOT NULL,
  `fecha_subida` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `videos_revision`
--

INSERT INTO `videos_revision` (`id`, `titulo`, `tema`, `nivel`, `palabra`, `ruta_video`, `fecha_subida`) VALUES
(1, 'Señal_Número', 'Números y cantidades', 2, '10', 'video/_Números_2026-03-14_video.webm', '2026-03-15 00:00:00'),
(2, 'Señal_Rojo', 'Colores', 2, 'Verde', 'video/_Colores_2026-03-13_video.webm', '2026-03-15 00:00:00'),
(3, 'Señal_Color', 'Colores', 2, 'Naranja', 'video_revision_Colores_2026-03-13_video.webm', '2026-03-15 00:00:00'),
(4, 'Señal_Animal', 'Animales', 2, 'Lobo', 'video_revision/_Animales_2026-03-16_video.webm', '2026-03-16 00:00:00');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `videos_revision`
--
ALTER TABLE `videos_revision`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `videos`
--
ALTER TABLE `videos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `videos_revision`
--
ALTER TABLE `videos_revision`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
