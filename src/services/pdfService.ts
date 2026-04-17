import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { Itinerary } from './itineraryService';

class PDFService {
  async generateItineraryPDF(itinerary: Itinerary) {
    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .branding { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
            .logo { width: 60px; height: 60px; border-radius: 12px; }
            .mascot { width: 80px; height: 80px; border-radius: 40px; border: 3px solid #6366f1; }
            .header { border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 28px; font-weight: bold; color: #1e1b4b; margin: 0; }
            .subtitle { font-size: 14px; color: #6366f1; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 5px; }
            .day-container { margin-bottom: 40px; }
            .day-header { background-color: #f5f3ff; padding: 10px 15px; border-radius: 8px; margin-bottom: 20px; border-left: 5px solid #6366f1; }
            .day-title { font-size: 20px; font-weight: bold; color: #4338ca; }
            .activity { margin-bottom: 25px; padding-left: 20px; position: relative; }
            .activity::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background-color: #e5e7eb; }
            .time { font-weight: bold; color: #6366f1; font-size: 14px; margin-bottom: 5px; }
            .place-name { font-size: 18px; font-weight: bold; margin-bottom: 5px; }
            .description { font-size: 14px; color: #4b5563; line-height: 1.6; }
            .address { font-size: 12px; color: #9ca3af; margin-top: 5px; font-style: italic; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="branding">
            <img src="https://raw.githubusercontent.com/JoanAquinoVasquez/MuchIQ/main/src/assets/icono_muchiq_landing.png" class="logo" />
            <img src="https://raw.githubusercontent.com/JoanAquinoVasquez/MuchIQ/main/src/assets/saludo.gif" class="mascot" />
          </div>
          <div class="header">
            <div class="subtitle">Itinerario MuchIQ</div>
            <h1 class="title">${itinerary.title}</h1>
          </div>

          ${itinerary.days.map(day => `
            <div class="day-container">
              <div class="day-header">
                <div class="day-title">Día ${day.dayNumber}: ${day.title}</div>
              </div>
              ${day.activities.map(activity => `
                <div class="activity">
                  <div class="time">${activity.time}</div>
                  <div class="place-name">${activity.placeName}</div>
                  <div class="description">${activity.description}</div>
                  <div class="address">${activity.address}</div>
                </div>
              `).join('')}
            </div>
          `).join('')}

          <div class="footer">
            Generado por MuchIQ - Tu guía inteligente en Lambayeque
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      console.log('PDF generado en:', uri);

      if (Platform.OS !== 'web') {
        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      } else {
        // En web se puede abrir o descargar
        const pdfWindow = window.open(uri);
        if (!pdfWindow) {
          alert('Por favor permite los popups para descargar el PDF');
        }
      }
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  }
}

export default new PDFService();
