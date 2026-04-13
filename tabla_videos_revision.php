<?php
include "conexion.php";

$consulta= "SELECT * FROM videos_revision";
$resultado = $conexion->query($consulta);
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<style>
/* ─── RESET & VARIABLES ─────────────────────────────────── */

*,
*::before,
*::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --teal: #0d9488;
    --teal-l: #14b8a6;
    --teal-bg: #f0fdfa;
    --teal-mid: #ccfbf1;
    --navy: #0f2744;
    --navy-l: #1e3a5f;
    --gold: #f59e0b;
    --gold-bg: #fffbeb;
    --red: #ef4444;
    --red-bg: #fef2f2;
    --green: #22c55e;
    --green-bg: #f0fdf4;
    --slate: #64748b;
    --slate-l: #94a3b8;
    --slate-bg: #f8fafc;
    --border: #e2e8f0;
    --white: #ffffff;
    --shadow: 0 1px 3px rgba(0, 0, 0, .06), 0 4px 16px rgba(0, 0, 0, .06);
    --shadow-lg: 0 8px 40px rgba(0, 0, 0, .12);
}

body {
    font-family: 'Outfit', sans-serif;
    background: #f0f4f8;
    min-height: 100vh;
    color: #1e293b;
    display: flex;
}

/* ─── SIDEBAR ───────────────────────────────────────────── */

.sidebar {
    width: 250px;
    min-height: 100vh;
    background: var(--navy);
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
}

.sidebar-brand {
    padding: 28px 22px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, .08);
}

.brand-mark {
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 17px;
    color: var(--teal-l);
    display: flex;
    align-items: center;
    gap: 9px;
}

.brand-mark span {
    font-size: 22px;
}

.brand-role {
    margin-top: 6px;
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, .35);
    letter-spacing: .06em;
    text-transform: uppercase;
}

.sidebar-nav {
    padding: 18px 0;
    flex: 1;
}

.nav-label {
    padding: 10px 22px 6px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, .25);
}

.nav-item {
    padding: 10px 22px;
    display: flex;
    align-items: center;
    gap: 11px;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, .5);
    cursor: pointer;
    transition: all .18s;
    border-left: 3px solid transparent;
    position: relative;
}

.nav-item:hover {
    background: rgba(255, 255, 255, .06);
    color: rgba(255, 255, 255, .85);
}

.nav-item.active {
    background: rgba(13, 148, 136, .18);
    color: var(--teal-l);
    border-left-color: var(--teal-l);
}

.nav-item .nav-icon {
    font-size: 17px;
    width: 20px;
    text-align: center;
}

.nav-badge {
    margin-left: auto;
    background: var(--gold);
    color: #1e293b;
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 20px;
}

.sidebar-user {
    padding: 16px 22px;
    border-top: 1px solid rgba(255, 255, 255, .08);
    display: flex;
    align-items: center;
    gap: 10px;
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--teal), #0f766e);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 13px;
    color: white;
    flex-shrink: 0;
}

.user-name {
    font-size: 13px;
    font-weight: 600;
    color: rgba(255, 255, 255, .8);
}

.user-email {
    font-size: 11px;
    color: rgba(255, 255, 255, .35);
}

.btn-logout-sm {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    opacity: .4;
    transition: opacity .2s;
}

.btn-logout-sm:hover {
    opacity: .8;
}

/* ─── MAIN ──────────────────────────────────────────────── */

.main {
    flex: 1;
    padding: 32px 36px;
    overflow-y: auto;
}

/* ─── TOPBAR ────────────────────────────────────────────── */

.topbar {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 28px;
    animation: fadeUp .4s ease both;
}

.topbar-title {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 800;
    color: var(--navy);
}

.topbar-sub {
    color: var(--slate);
    font-size: 14px;
    margin-top: 3px;
}

/* ─── STATS STRIP ───────────────────────────────────────── */

.stats-strip {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
    margin-bottom: 26px;
    animation: fadeUp .4s .08s ease both;
}

.stat-pill {
    background: var(--white);
    border-radius: 14px;
    padding: 18px 20px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    gap: 14px;
}

.stat-pill-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
}

.icon-teal {
    background: var(--teal-bg);
}

.icon-gold {
    background: var(--gold-bg);
}

.icon-green {
    background: var(--green-bg);
}

.icon-red {
    background: var(--red-bg);
}

.stat-pill-val {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 800;
    line-height: 1;
    color: var(--navy);
}

.stat-pill-lbl {
    font-size: 12px;
    color: var(--slate);
    margin-top: 2px;
    font-weight: 500;
}

/* ─── SECTION PANELS ────────────────────────────────────── */

.section {
    display: none;
    animation: fadeUp .3s ease both;
}

.section.active {
    display: block;
}

/* ─── CARDS ─────────────────────────────────────────────── */

.card {
    background: var(--white);
    border-radius: 16px;
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    overflow: hidden;
    margin-bottom: 22px;
}

.card-head {
    padding: 18px 24px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.card-head h3 {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--navy);
}

.card-head p {
    font-size: 12px;
    color: var(--slate);
    margin-top: 2px;
}

.card-body {
    padding: 24px;
}

/* ─── UPLOAD ZONE ───────────────────────────────────────── */

.upload-zone {
    border: 2px dashed var(--teal-l);
    border-radius: 14px;
    padding: 48px 24px;
    text-align: center;
    background: var(--teal-bg);
    cursor: pointer;
    transition: all .25s;
    position: relative;
}

.upload-zone:hover,
.upload-zone.drag-over {
    background: var(--teal-mid);
    border-color: var(--teal);
    transform: scale(1.01);
}

.upload-zone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
}

.upload-icon {
    font-size: 48px;
    margin-bottom: 12px;
}

.upload-title {
    font-family: 'Syne', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: var(--teal);
    margin-bottom: 6px;
}

.upload-sub {
    font-size: 13px;
    color: var(--slate);
}

.upload-formats {
    margin-top: 14px;
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
}

.fmt-badge {
    background: white;
    border: 1px solid var(--teal-l);
    color: var(--teal);
    font-size: 11px;
    font-weight: 600;
    padding: 3px 10px;
    border-radius: 20px;
}

/* ─── FILE PREVIEW ──────────────────────────────────────── */

.file-preview {
    display: none;
    margin-top: 18px;
    background: var(--slate-bg);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 14px 18px;
    align-items: center;
    gap: 14px;
}

.file-preview.show {
    display: flex;
}

.file-thumb {
    font-size: 32px;
}

.file-info {
    flex: 1;
}

.file-name {
    font-weight: 600;
    font-size: 14px;
}

.file-size {
    font-size: 12px;
    color: var(--slate);
}

.btn-remove-file {
    background: var(--red-bg);
    color: var(--red);
    border: none;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
}

/* ─── PROGRESS BAR ──────────────────────────────────────── */

.upload-progress {
    display: none;
    margin-top: 16px;
}

.upload-progress.show {
    display: block;
}

.progress-label {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    font-weight: 600;
    color: var(--teal);
    margin-bottom: 6px;
}

.progress-track {
    height: 8px;
    background: var(--teal-bg);
    border-radius: 10px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--teal), var(--teal-l));
    border-radius: 10px;
    transition: width .3s ease;
}

/* ─── FORM ──────────────────────────────────────────────── */

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

.form-group {
    margin-bottom: 0;
}

.form-group.full {
    grid-column: 1 / -1;
}

.form-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    color: var(--slate);
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: .04em;
}

.form-input,
.form-select,
.form-textarea {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    color: #1e293b;
    outline: none;
    transition: border-color .2s, box-shadow .2s;
    background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
    border-color: var(--teal-l);
    box-shadow: 0 0 0 3px rgba(13, 148, 136, .1);
}

.form-textarea {
    resize: vertical;
    min-height: 90px;
}

/* ─── BUTTONS ───────────────────────────────────────────── */

.btn {
    padding: 9px 18px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    transition: all .18s;
}

.btn-primary {
    background: var(--teal);
    color: white;
    padding: 12px 24px;
}

.btn-primary:hover {
    background: #0f766e;
    transform: translateY(-1px);
    box-shadow: 0 4px 14px rgba(13, 148, 136, .35);
}

.btn-primary:disabled {
    background: var(--slate-l);
    transform: none;
    box-shadow: none;
    cursor: not-allowed;
}

.btn-outline {
    background: transparent;
    color: var(--teal);
    border: 1.5px solid var(--teal-l);
}

.btn-outline:hover {
    background: var(--teal-bg);
}

.btn-ghost {
    background: var(--slate-bg);
    color: var(--slate);
}

.btn-ghost:hover {
    background: var(--border);
}

.btn-danger {
    background: var(--red-bg);
    color: var(--red);
}

.btn-danger:hover {
    background: #fecaca;
}

.btn-edit {
    background: #eff6ff;
    color: #2563eb;
}

.btn-edit:hover {
    background: #dbeafe;
}

/* ─── STATUS BADGES ─────────────────────────────────────── */

.badge {
    padding: 4px 11px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 5px;
}

.badge-pending {
    background: #fef9c3;
    color: #854d0e;
}

.badge-review {
    background: #e0f2fe;
    color: #0369a1;
}

.badge-approved {
    background: var(--green-bg);
    color: #15803d;
}

.badge-rejected {
    background: var(--red-bg);
    color: #b91c1c;
}

.badge-draft {
    background: var(--slate-bg);
    color: var(--slate);
}

/* ─── TABLE ─────────────────────────────────────────────── */

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table th {
    padding: 11px 18px;
    text-align: left;
    background: var(--slate-bg);
    font-size: 11px;
    font-weight: 700;
    color: var(--slate);
    text-transform: uppercase;
    letter-spacing: .05em;
}

.data-table td {
    padding: 14px 18px;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
    vertical-align: middle;
}

.data-table tr:last-child td {
    border-bottom: none;
}

.data-table tr:hover td {
    background: var(--slate-bg);
}

/* ─── VIDEO THUMB ───────────────────────────────────────── */

.vid-thumb {
    width: 52px;
    height: 36px;
    border-radius: 6px;
    background: var(--navy-l);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
}

.vid-cell {
    display: flex;
    align-items: center;
    gap: 12px;
}

.vid-title {
    font-weight: 600;
    font-size: 13px;
}

.vid-meta {
    font-size: 11px;
    color: var(--slate);
    margin-top: 2px;
}

/* ─── PROGRESS RINGS (reporte) ──────────────────────────── */

.progress-ring {
    display: flex;
    align-items: center;
    gap: 8px;
}

.ring-track {
    height: 7px;
    background: var(--border);
    border-radius: 10px;
    flex: 1;
    overflow: hidden;
}

.ring-fill {
    height: 100%;
    border-radius: 10px;
    background: linear-gradient(90deg, var(--teal), var(--teal-l));
}

.ring-pct {
    font-size: 12px;
    font-weight: 700;
    color: var(--teal);
    width: 38px;
    text-align: right;
}

/* ─── STEP WIZARD ───────────────────────────────────────── */

.step-wizard {
    display: flex;
    align-items: center;
    gap: 0;
    margin-bottom: 30px;
}

.step {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    position: relative;
}

.step:not(:last-child)::after {
    content: '';
    flex: 1;
    height: 2px;
    background: var(--border);
    margin: 0 8px;
}

.step:not(:last-child).done::after {
    background: var(--teal-l);
}

.step-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--border);
    color: var(--slate);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
    transition: all .3s;
}

.step.active .step-num {
    background: var(--teal);
    color: white;
}

.step.done .step-num {
    background: var(--green);
    color: white;
}

.step-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--slate);
    white-space: nowrap;
}

.step.active .step-label {
    color: var(--teal);
}

.step.done .step-label {
    color: var(--green);
}

/* ─── MODAL ─────────────────────────────────────────────── */

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 39, 68, .55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 999;
    visibility: hidden;
    opacity: 0;
    transition: all .25s;
    backdrop-filter: blur(5px);
}

.modal-overlay.active {
    visibility: visible;
    opacity: 1;
}

.modal-box {
    background: white;
    border-radius: 20px;
    padding: 30px 32px;
    width: 520px;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
    transform: scale(.95);
    transition: transform .25s;
}

.modal-overlay.active .modal-box {
    transform: scale(1);
}

.modal-title {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 800;
    color: var(--navy);
    margin-bottom: 4px;
}

.modal-sub {
    font-size: 13px;
    color: var(--slate);
    margin-bottom: 22px;
}

/* ─── TOAST ─────────────────────────────────────────────── */

#toast-wrap {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.toast {
    padding: 13px 18px;
    border-radius: 12px;
    font-size: 13px;
    font-weight: 600;
    color: white;
    display: flex;
    align-items: center;
    gap: 9px;
    box-shadow: var(--shadow-lg);
    animation: slideUp .3s ease;
    font-family: 'Outfit', sans-serif;
}

.toast-success {
    background: #059669;
}

.toast-error {
    background: var(--red);
}

.toast-info {
    background: var(--teal);
}

/* ─── RECORD BTN ────────────────────────────────────────── */

.record-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 36px 20px;
    border: 2px dashed var(--border);
    border-radius: 14px;
    background: var(--slate-bg);
    text-align: center;
}

.btn-record {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--red);
    color: white;
    border: none;
    font-size: 28px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .2s;
    box-shadow: 0 0 0 0 rgba(239, 68, 68, .4);
}

.btn-record:hover {
    transform: scale(1.08);
}

.btn-record.recording {
    animation: pulse 1.2s infinite;
    background: #dc2626;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, .4);
    }

    70% {
        box-shadow: 0 0 0 18px rgba(239, 68, 68, 0);
    }

    100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
}

/* ─── EMPTY STATE ───────────────────────────────────────── */

.empty {
    text-align: center;
    padding: 52px 20px;
}

.empty-icon {
    font-size: 44px;
    margin-bottom: 12px;
}

.empty-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    color: var(--navy);
}

.empty-sub {
    font-size: 13px;
    color: var(--slate);
    margin-top: 4px;
}

/* ─── ANIMATIONS ────────────────────────────────────────── */

@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(14px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(16px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* ─── SCROLLBAR ─────────────────────────────────────────── */

::-webkit-scrollbar {
    width: 6px;
}

::-webkit-scrollbar-track {
    background: transparent;
}

::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 10px;
}

/* ─── THEME TAG ─────────────────────────────────────────── */

.theme-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--teal-bg);
    color: var(--teal);
    border: 1px solid var(--teal-mid);
    font-size: 12px;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 20px;
}

/* ─── CHECKLIST ROW ─────────────────────────────────────── */

.check-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 0;
    border-bottom: 1px solid var(--border);
    font-size: 13px;
}

.check-row:last-child {
    border-bottom: none;
}

.check-row input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: var(--teal);
    cursor: pointer;
    flex-shrink: 0;
}
</style>

<body>
    <div class="main">
        <!-- ══════════════════════════════════════
        Videos Creados
  ══════════════════════════════════════ -->
        <!-- Table -->
        <div class="card">
            <div class="card-head">
                <div>
                    <h3>🎥 Videos Archivados</h3>
                    <p>Lista de videos para Revisión</p>
                </div>
            </div>
            <br>
            <div class="card-body">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>ID Video</th>
                            <th>Título Video</th>
                            <th>Tema</th>
                            <th>Nivel (1-4)</th>
                            <th>Palabra</th>
                            <th>Ruta del Video</th>
                            <th>Fecha de Entrega</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                while ($fila = $resultado->fetch_assoc()){
                ?>
                        <tr>
                            <td>
                                <?php echo $fila["id"]; ?>
                            </td>
                            <td>
                                <?php echo $fila["titulo"]; ?>
                            </td>
                            <td>
                                <?php echo $fila["tema"]; ?>
                            </td>
                            <td>
                                Nivel <?php echo $fila["nivel"]; ?>
                            </td>
                            <td>
                                <?php echo $fila["palabra"]; ?>
                            </td>
                            <td>
                                <a href="<?php echo $fila["ruta_video"]; ?>" target="_blank">
                                    <?php echo basename($fila['ruta_video']); ?>
                                </a>
                            </td>
                            <td>
                                <?php echo $fila["fecha_subida"]; ?>
                            </td>
                        </tr>
                        <?php
                    }
                    ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>

</html>