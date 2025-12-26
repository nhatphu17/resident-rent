import { useState, useEffect, useRef } from 'react';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  const retryCount = useRef(0);
  const maxRetries = 2;

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      });
      return;
    }

    const getLocation = (attempt: number = 0) => {
      // Try with high accuracy first, then fallback to lower accuracy
      const options = attempt === 0 
        ? {
            enableHighAccuracy: true,
            timeout: 15000, // Increased timeout
            maximumAge: 0,
          }
        : {
            enableHighAccuracy: false, // Fallback: use less accurate but faster method
            timeout: 10000,
            maximumAge: 300000, // Accept cached location up to 5 minutes old
          };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
            loading: false,
          });
          retryCount.current = 0; // Reset retry count on success
        },
        (error) => {
          let errorMessage = 'Không thể lấy vị trí của bạn';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Bạn đã từ chối quyền truy cập vị trí. Vui lòng cho phép trong cài đặt trình duyệt.';
              setState({
                latitude: null,
                longitude: null,
                error: errorMessage,
                loading: false,
              });
              return; // Don't retry if permission denied
              
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Thông tin vị trí không khả dụng. Có thể do GPS không hoạt động hoặc không có mạng.';
              break;
              
            case error.TIMEOUT:
              errorMessage = 'Yêu cầu lấy vị trí đã hết thời gian.';
              break;
              
            default:
              // Handle kCLErrorLocationUnknown and other unknown errors
              errorMessage = 'Không thể xác định vị trí. Vui lòng thử lại hoặc nhập địa chỉ để tìm kiếm.';
          }

          // Retry with lower accuracy if we haven't exceeded max retries
          if (attempt < maxRetries && error.code !== error.PERMISSION_DENIED) {
            retryCount.current = attempt + 1;
            setTimeout(() => {
              getLocation(attempt + 1);
            }, 1000 * (attempt + 1)); // Exponential backoff
          } else {
            setState({
              latitude: null,
              longitude: null,
              error: errorMessage,
              loading: false,
            });
          }
        },
        options
      );
    };

    getLocation(0);
  }, []);

  return state;
}

