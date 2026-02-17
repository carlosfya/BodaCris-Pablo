const { google } = require('googleapis');

// Cargar variables de entorno en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: '.env.local' });
}

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método no permitido. Usa POST.' 
    });
  }

  try {
    console.log('Datos recibidos:', req.body); // Para depurar
    // Obtener datos del body (nuevos campos del formulario)
    const { 
      nombre, 
      asistenciaBoda, 
      acompañante,
      nombreAcompanante,
      bus, 
      busHorario,
      alergias, 
      asistenciaPreboda,
      sandalias,
      sandaliaTalla
    } = req.body;

    // Validar campos requeridos
    if (!nombre || !asistenciaBoda) {
      return res.status(400).json({ 
        success: false, 
        error: 'Faltan campos requeridos: nombre y asistencia a la boda' 
      });
    }

    if (bus === 'Sí' && !busHorario) {
      return res.status(400).json({
        success: false,
        error: 'Falta el horario de vuelta del bus'
      });
    }

    // Verificar que las variables de entorno existen
    if (!process.env.GOOGLE_PRIVATE_KEY) {
      throw new Error('GOOGLE_PRIVATE_KEY no está configurada');
    }
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL no está configurada');
    }
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID no está configurado');
    }

    // Configurar autenticación con Google
    // IMPORTANTE: .replace(/\\n/g, '\n') para manejar saltos de línea en Vercel
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Crear cliente de Google Sheets
    const sheets = google.sheets({ version: 'v4', auth });

    // Preparar la fecha actual
    const fecha = new Date().toLocaleString('es-ES', {
      timeZone: 'Europe/Madrid',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Primero, obtener el nombre de la primera hoja
    const sheetsInfo = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
    });
    
    const sheetName = sheetsInfo.data.sheets[0].properties.title;
    const sheetId = sheetsInfo.data.sheets[0].properties.sheetId;
    console.log('Nombre de la hoja:', sheetName, 'ID:', sheetId);

    // Obtener la última fila con datos
    const dataResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: `'${sheetName}'!A:A`,
    });

    const lastRow = (dataResponse.data.values?.length || 1);
    console.log('Última fila:', lastRow);

    // Preparar headers
    const headers = ['Fecha', 'Nombre', 'Boda', 'Acompañante', 'Nombre acompañante', 'bus', 'Horario bus', 'Alergias', 'Asistencia Preboda', 'Sandalias', 'Talla Sandalia'];

    // Preparar fila de datos con 10 columnas
    const dataRow = [
      fecha, 
      nombre, 
      asistenciaBoda, 
      acompañante || 'No especificado',
      nombreAcompanante || 'No especificado',
      bus || 'No especificado',
      busHorario || 'No especificado',
      alergias || 'Ninguna',
      asistenciaPreboda || '',
      sandalias || 'No especificado',
      sandaliaTalla || ''
    ];

    // Convertir arrays a formato de celdas para UpdateCellsRequest
    const headerCells = headers.map(val => ({
      userEnteredValue: { stringValue: String(val) }
    }));

    const dataCells = dataRow.map(val => ({
      userEnteredValue: { stringValue: String(val) }
    }));

    // Usar spreadsheets.batchUpdate con UpdateCellsRequest para escribir sin limitaciones de tableRange
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      requestBody: {
        requests: [
          {
            // Actualizar headers en fila 1
            updateCells: {
              rows: [
                {
                  values: headerCells
                }
              ],
              fields: 'userEnteredValue',
              start: {
                sheetId: sheetId,
                rowIndex: 0,
                columnIndex: 0
              }
            }
          },
          {
            // Actualizar datos en la fila correspondiente
            updateCells: {
              rows: [
                {
                  values: dataCells
                }
              ],
              fields: 'userEnteredValue',
              start: {
                sheetId: sheetId,
                rowIndex: lastRow,
                columnIndex: 0
              }
            }
          }
        ]
      }
    });

    // Respuesta exitosa
    console.log('Respuesta de Sheets:', response.data); // Para depurar
    return res.status(200).json({
      success: true,
      message: `¡Gracias ${nombre}! Tu respuesta ha sido registrada.`,
      updatedRange: response.data.updates?.updatedRange,
    });

  } catch (error) {
    console.error('Error al escribir en Google Sheets:', error);
    
    return res.status(500).json({
      success: false,
      error: 'Error al guardar en Google Sheets',
      details: error.message,
    });
  }
};
