// chartExportUtils.js
import html2canvas from 'html2canvas';

export const exportChartAsImage = async (chartElement, fileName) => {
    if (!chartElement) return;

    try {
        const canvas = await html2canvas(chartElement, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false,
        });

        const link = document.createElement('a');
        link.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (error) {
        console.error('Failed to export chart:', error);
    }
};