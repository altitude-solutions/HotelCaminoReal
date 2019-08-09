// ===============================================
// Electron imports
// ===============================================
const { app, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// ===============================================
// Import excel module
// ===============================================
const excel = require('excel4node');


// ===============================================
// IPC events
// ===============================================

// ===============================================
// Generate report
// ===============================================
ipcMain.on('generateReport', (e, filecontent) => {
    // ===============================================
    // Opciones para las listas de seleccion multiple
    // ===============================================
    let listaActivo = ['', 'Si', 'No'];
    let lsitaMotivo = ['', 'Primer contacto', 'Seguimiento específico', 'Seguimiento a tarifario entregado', 'Seguimiento a propuesta entragada', 'LEAD', 'Contactado por cliente'];
    let listaTipoContacto = ['', 'Llamada', 'Visita'];
    let listaContesta = ['', 'Si', 'No'];
    let listaRespuesta = ['', 'Tarifario', 'Primera propuesta', 'Nueva propuesta', 'Reserva', 'No le interesa', 'No puede hablar - Volver a contactar', 'Otros'];

    // Create excel workbook
    let wb = new excel.Workbook({
        author: 'Microsoft Office User'
    });
    // Add a sheet to the workbook
    let ws = wb.addWorksheet('Base de datos');
    let ws2 = wb.addWorksheet('Registro de acciones');

    let pathToFile = dialog.showSaveDialogSync({
        defaultPath: app.getPath('documents'),
        filters: [
            { name: 'Excel', extensions: ['xlsx', 'xls'] },
            { name: 'Todos los archivos', extensions: ['*'] }
        ]
    });

    if (!pathToFile) return;
    if (!pathToFile.split('.')[1]) pathToFile += '.xlsx';

    // ===============================================
    // Start 'Base de datos spreadsheet'
    // ===============================================
    // Column titiles
    ws.cell(1, 1).string('Fecha de Contacto');
    ws.cell(1, 2).string('Fecha de Registro');
    ws.cell(1, 3).string('Vendedor');
    ws.cell(1, 4).string('Código Cliente');
    ws.cell(1, 5).string('Nombre Cliente');
    ws.cell(1, 6).string('Cliente Activo');
    ws.cell(1, 7).string('Motivo');
    ws.cell(1, 8).string('Tipo de Contacto');
    ws.cell(1, 9).string('Contesta');
    ws.cell(1, 10).string('Respuesta');
    ws.cell(1, 11).string('Respuesta Otro');
    ws.cell(1, 12).string('Fecha de Entrada');
    ws.cell(1, 13).string('Fecha de Salida');
    ws.cell(1, 14).string('Número de Cuartos');
    ws.cell(1, 15).string('Persona Encargada');
    ws.cell(1, 16).string('Teléfono');
    ws.cell(1, 17).string('Email');
    ws.cell(1, 18).string('Información Seguimiento');
    ws.cell(1, 19).string('Fecha Próximo Contacto');
    ws.cell(1, 20).string('Comentarios');

    if (filecontent.registroContactos[0]) {
        // Datos del reporte
        for (let i = 0; i < filecontent.registroContactos.length; i++) {
            ws.cell(2 + i, 1).string(filecontent.registroContactos[i].fechaDeContacto);
            ws.cell(2 + i, 2).date(filecontent.registroContactos[i].fechaDeRegistro);
            ws.cell(2 + i, 3).string(filecontent.registroContactos[i].vendedor);
            ws.cell(2 + i, 4).number(Number(filecontent.registroContactos[i].codigoCliente));
            ws.cell(2 + i, 5).string(filecontent.registroContactos[i].nombreCliente);
            ws.cell(2 + i, 6).string(listaActivo[Number(filecontent.registroContactos[i].clienteActivo)]);
            ws.cell(2 + i, 7).string(lsitaMotivo[Number(filecontent.registroContactos[i].motivo)]);
            ws.cell(2 + i, 8).string(listaTipoContacto[Number(filecontent.registroContactos[i].tipoDeContacto)]);
            ws.cell(2 + i, 9).string(listaContesta[Number(filecontent.registroContactos[i].contesta)]);
            ws.cell(2 + i, 10).string(listaRespuesta[Number(filecontent.registroContactos[i].respuesta)]);
            if (filecontent.registroContactos[i].otraRespuesta) {
                ws.cell(2 + i, 11).string(filecontent.registroContactos[i].otraRespuesta);
            } else {
                ws.cell(2 + i, 11).string('-');
            }
            ws.cell(2 + i, 12).string(filecontent.registroContactos[i].fechaDeEntrada);
            ws.cell(2 + i, 13).string(filecontent.registroContactos[i].fechaDeSalida);
            ws.cell(2 + i, 14).number(Number(filecontent.registroContactos[i].cuartos));
            ws.cell(2 + i, 15).string(filecontent.registroContactos[i].personaACargo);
            ws.cell(2 + i, 16).string(filecontent.registroContactos[i].numeroTelefonico);
            ws.cell(2 + i, 17).string(filecontent.registroContactos[i].personaemail);
            ws.cell(2 + i, 18).string(filecontent.registroContactos[i].informaicionAdicional);
            ws.cell(2 + i, 19).string(filecontent.registroContactos[i].fechaProximoContacto);
            ws.cell(2 + i, 20).string(filecontent.registroContactos[i].comentarios);
        }

        // ===============================================
        // Start 'Registro de acciones spreadsheet'
        // ===============================================
        // Column titles
        ws2.cell(1, 1).string('Fecha de Creación');
        ws2.cell(1, 2).string('Fecha Límite')
        ws2.cell(1, 3).string('Cliente');
        ws2.cell(1, 4).string('Solicitud');
        ws2.cell(1, 5).string('Empleado asignado');
        ws2.cell(1, 6).string('Completado');

        // Data
        for (let i = 0; i < filecontent.registroAcciones.length; i++) {
            ws2.cell(2 + i, 1).date(new Date(filecontent.registroAcciones[i].fechaDeCreacion));
            ws2.cell(2 + i, 2).date(new Date(filecontent.registroAcciones[i].fechaLimite));
            ws2.cell(2 + i, 3).string(filecontent.registroAcciones[i].cliente.split(': ')[1]);
            ws2.cell(2 + i, 4).string(filecontent.registroAcciones[i].pedido);
            ws2.cell(2 + i, 5).string(filecontent.registroAcciones[i].vendedor);
            ws2.cell(2 + i, 6).string(filecontent.registroAcciones[i].entregado == '0' ? 'Pendiente' : 'Entregado');
        }


        // ===============================================
        // Save File to selected path
        // ===============================================
        wb.write(pathToFile, (err, stats) => {
            if (err) {
                dialog.showErrorBox('No se pudo generar el reporte', `${err}`);
            }
        });

        wb.write(path.join(app.getPath('documents'), 'Altitude Solutions-Demo.xlsx'), (err, stats) => {
            if (err) {
                dialog.showErrorBox('No se pudo generar el reporte', `${err}`);
            }
        });

    } else {
        dialog.showErrorBox('No hay datos', 'Imposible generar reportes.\nNo se han generado datos.');
    }
});



// ===============================================
// Load client list from and excel file
// ===============================================
// TODO: falta cargar el archivo. De momento solo muestra el path hacia el archivo
ipcMain.on('loadClientList', (e) => {
    // ===============================================
    // Select file
    // ===============================================
    dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        title: 'Importar clientes',
        defaultPath: app.getPath('documents'),
        filters: [
            { name: 'Excel', extensions: ['xlsx', 'xls'] },
            { name: 'Todos los archivos', extensions: ['*'] }
        ]
    }, (res) => {
        console.log(res[0]); // show path to file
    });
});