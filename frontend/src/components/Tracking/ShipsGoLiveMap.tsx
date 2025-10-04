import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { MapPin, Maximize2, Minimize2, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';

interface ShipsGoLiveMapProps {
  containerNumber?: string;
  defaultQuery?: string;
  height?: string;
  className?: string;
  showControls?: boolean;
  onContainerChange?: (containerNumber: string) => void;
}

interface ShipsGoMessage {
  Action: string;
  Parameters: {
    ContainerCode: string;
  };
}

const ShipsGoLiveMap: React.FC<ShipsGoLiveMapProps> = ({
  containerNumber,
  defaultQuery = process.env.NODE_ENV === 'production' ? '' : 'TEST1234567',
  height = '550px',
  className = '',
  showControls = true,
  onContainerChange
}) => {
  const { t } = useTranslation('common');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [currentContainer, setCurrentContainer] = useState(containerNumber || defaultQuery);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inputContainer, setInputContainer] = useState('');
  const [mapFallbackUrl, setMapFallbackUrl] = useState<string | null>(null);

  // ShipsGo Messages Listener
  useEffect(() => {
    const handleShipsGoMessage = (event: MessageEvent) => {
      try {
        if (event.data && typeof event.data === 'object' && event.data.Action === 'LoadNewContainerCode') {
          const message = event.data as ShipsGoMessage;
          const newContainerCode = message.Parameters.ContainerCode;
          
          if (iframeRef.current) {
            iframeRef.current.src = `https://shipsgo.com/iframe/where-is-my-container/${newContainerCode}`;
            setCurrentContainer(newContainerCode);
            
            if (onContainerChange) {
              onContainerChange(newContainerCode);
            }
          }
        }
      } catch (err) {
        console.error('Error handling ShipsGo message:', err);
      }
    };

    // Add event listener for messages from iframe
    window.addEventListener('message', handleShipsGoMessage);

    return () => {
      window.removeEventListener('message', handleShipsGoMessage);
    };
  }, [onContainerChange]);

  // Initialize iframe with container number
  useEffect(() => {
    if (iframeRef.current) {
      const query = containerNumber || defaultQuery;
      iframeRef.current.src = `https://shipsgo.com/iframe/where-is-my-container/${query}`;
      setCurrentContainer(query);
    }
  }, [containerNumber, defaultQuery]);

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  // Handle iframe error
  const handleIframeError = async () => {
    setIsLoading(false);
    setError('فشل في تحميل الخريطة. تأكد من صحة رقم الحاوية.');
    // Try to fetch a static map fallback from backend
    try {
      if (currentContainer) {
        const res = await fetch(`/api/shipsgo-tracking/container/${currentContainer}/map`);
        if (res.ok) {
          const data = await res.json();
          if (data?.staticImageUrl) {
            setMapFallbackUrl(data.staticImageUrl);
          } else if (data?.embedUrl) {
            setMapFallbackUrl(data.embedUrl);
          }
        }
      }
    } catch (e) {
      // ignore
    }
  };

  // Update container number
  const updateContainer = (newContainer: string) => {
    if (!newContainer.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    if (iframeRef.current) {
      iframeRef.current.src = `https://shipsgo.com/iframe/where-is-my-container/${newContainer}`;
      setCurrentContainer(newContainer);
      
      if (onContainerChange) {
        onContainerChange(newContainer);
      }
    }
  };

  // Handle manual container input
  const handleContainerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputContainer.trim()) {
      updateContainer(inputContainer.trim());
      setInputContainer('');
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Refresh map
  const refreshMap = () => {
    updateContainer(currentContainer);
  };

  // Open in new tab
  const openInNewTab = () => {
    window.open(`https://shipsgo.com/iframe/where-is-my-container/${currentContainer}`, '_blank');
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 rtl:space-x-reverse">
            <MapPin className="h-6 w-6" />
            <div>
              <h3 className="text-lg font-semibold">الخريطة التفاعلية</h3>
              <p className="text-blue-100 text-sm">
                رقم الحاوية: {currentContainer}
              </p>
            </div>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={refreshMap}
                className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
                title="تحديث الخريطة"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={openInNewTab}
                className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
                title="فتح في نافذة جديدة"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
                title={isFullscreen ? "تصغير" : "ملء الشاشة"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Container Input */}
        {showControls && (
          <form onSubmit={handleContainerSubmit} className="mt-4 flex space-x-2 rtl:space-x-reverse">
            <input
              type="text"
              value={inputContainer}
              onChange={(e) => setInputContainer(e.target.value)}
              placeholder="أدخل رقم حاوية جديد..."
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
            <button
              type="submit"
              disabled={!inputContainer.trim()}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              تحديث
            </button>
          </form>
        )}
      </div>

      {/* Map Container */}
      <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل الخريطة...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10">
            <div className="text-center p-6">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-700 font-medium mb-2">خطأ في تحميل الخريطة</p>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <button
                onClick={refreshMap}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        )}

        {mapFallbackUrl ? (
          <div className="w-full">
            {/* Static fallback */}
            <img
              src={mapFallbackUrl}
              alt="ShipsGo static map"
              style={{ height: isFullscreen ? '100vh' : height, width: '100%', objectFit: 'cover' }}
            />
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            id="IframeShipsgoLiveMap"
            style={{ 
              height: isFullscreen ? '100vh' : height, 
              width: '100%',
              border: 'none'
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="ShipsGo Live Map"
            className="w-full"
            sandbox="allow-scripts allow-same-origin allow-popups"
            referrerPolicy="no-referrer"
          />
        )}

        {/* Fullscreen overlay controls */}
        {isFullscreen && (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors"
            >
              <Minimize2 className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-gray-50 px-4 py-3 border-t">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>مدعوم بواسطة ShipsGo</span>
          </div>
          <div className="text-xs">
            آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipsGoLiveMap;