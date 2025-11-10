import { Download, FileText } from 'lucide-react';
import { useState } from 'react';

export default function PDFExportButton({ message }) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  // Check if message contains PDF JSON
  const isPDFExport = (message.text || message.content) && 
    (message.text || message.content).includes('"export_type": "pdf"') &&
    (message.text || message.content).includes('"metadata"');

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      setError(null);

      // Parse JSON from message
      let pdfData;
      try {
        // Extract JSON from message (it might be wrapped in markdown code blocks)
        let jsonStr = message.text || message.content;
        
        // Remove markdown code blocks if present
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        
        // Find JSON object
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Could not find PDF JSON in message');
        }
        
        jsonStr = jsonMatch[0];
        
        // Clean up common JSON issues
        // Fix trailing commas
        jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
        
        // Fix unescaped quotes in strings
        jsonStr = jsonStr.replace(/:\s*"([^"]*)"([^,}\]]*)/g, (match, content, after) => {
          // Only fix if there's an issue
          if (after.trim() && !after.match(/^[,}\]]/)) {
            content = content.replace(/"/g, '\\"');
            return `: "${content}"${after}`;
          }
          return match;
        });
        
        pdfData = JSON.parse(jsonStr);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Message content:', message.content.substring(0, 500));
        throw new Error(`Invalid PDF JSON: ${parseError.message}`);
      }

      // Send to backend for PDF generation
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pdfData),
      });

      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      // Download PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfData.metadata?.destination || 'itinerary'}-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      setError(err.message);
      console.error('PDF Export Error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isPDFExport) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="font-semibold text-blue-900 dark:text-blue-100">
              PDF Export Ready
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Click below to download your itinerary as PDF
            </p>
          </div>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'Exporting...' : 'Download PDF'}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          ❌ Error: {error}
        </p>
      )}
    </div>
  );
}
