import React from 'react';

interface ParsedElement {
  type: 'text' | 'button';
  content: string;
  meta?: {
    name: string;
    lat: number;
    lng: number;
  };
}

/**
 * Parses raw text from Gemini Flash and extracts active actionable map markers
 * without adding heavy map payload libraries to the bundle size.
 */
export const parseChatActions = (
  rawText: string, 
  onMapTrigger: (name: string, lat: number, lng: number) => void
) => {
  // Regex to detect [ACTION: MAP | Location Name | Lat, Lng]
  const actionRegex = /\[ACTION:\s*MAP\s*\|\s*([^|]+)\s*\|\s*([^,]+)\s*,\s*([^\]]+)\]/g;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = actionRegex.exec(rawText)) !== null) {
    // Add the plain text preceding the match
    if (match.index > lastIndex) {
      parts.push(rawText.substring(lastIndex, match.index));
    }

    const locationName = match[1].trim();
    const lat = parseFloat(match[2].trim());
    const lng = parseFloat(match[3].trim());

    // Generate a real live working button component
    parts.push(
      <button
        key={`map-trigger-${match.index}`}
        onClick={() => onMapTrigger(locationName, lat, lng)}
        className="inline-flex items-center gap-1.5 mx-1 my-0.5 bg-indigo-600/90 hover:bg-indigo-600 active:scale-95 text-white px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide shadow-sm backdrop-blur-sm border border-indigo-500/20 transition-all cursor-pointer"
      >
        🗺️ Live Map Tracker: {locationName}
      </button>
    );

    lastIndex = actionRegex.lastIndex;
  }

  if (lastIndex < rawText.length) {
    parts.push(rawText.substring(lastIndex));
  }

  return parts.length > 0 ? parts : rawText;
};

// Inside your rendering loop for chatbot messages:
const ChatMessageBubble = ({ message, openActivityMapModal }: { message: { text: string }; openActivityMapModal: (data: { name: string; coordinates: string }) => void }) => {
  return (
    <div className="p-3 my-2 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-md text-slate-200 text-sm whitespace-pre-line leading-relaxed">
      {parseChatActions(message.text, (name, lat, lng) => {
        // Triggers your pre-built vector map overlay modal
        openActivityMapModal({ name, coordinates: `${lat},${lng}` });
      })}
    </div>
  );
};