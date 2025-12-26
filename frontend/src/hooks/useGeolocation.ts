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

  const getLocation = (attempt: number = 0) => {
    if (!navigator.geolocation) {
      setState({
        latitude: null,
        longitude: null,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      });
      return;
    }

    // Progressive fallback strategy
    let options: PositionOptions;
    
    if (attempt === 0) {
      // First attempt: High accuracy, long timeout
      options = {
        enableHighAccuracy: true,
        timeout: 20000, // 20 seconds
        maximumAge: 0,
      };
    } else if (attempt === 1) {
      // Second attempt: Low accuracy, shorter timeout, accept cached
      options = {
        enableHighAccuracy: false,
        timeout: 10000, // 10 seconds
        maximumAge: 600000, // Accept cached location up to 10 minutes old
      };
    } else {
      // Third attempt: Very permissive
      options = {
        enableHighAccuracy: false,
        timeout: 5000, // 5 seconds
        maximumAge: 3600000, // Accept cached location up to 1 hour old
      };
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Validate coordinates
        if (
          position.coords.latitude &&
          position.coords.longitude &&
          !isNaN(position.coords.latitude) &&
          !isNaN(position.coords.longitude)
        ) {
          setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            error: null,
            loading: false,
          });
          retryCount.current = 0; // Reset retry count on success
        } else {
          // Invalid coordinates, retry
          if (attempt < maxRetries) {
            setTimeout(() => {
              getLocation(attempt + 1);
            }, 1000 * (attempt + 1));
          } else {
            setState({
              latitude: null,
              longitude: null,
              error: 'Không thể lấy tọa độ hợp lệ. Vui lòng thử lại.',
              loading: false,
            });
          }
        }
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

        // Retry with different strategy if we haven't exceeded max retries
        if (attempt < maxRetries && error.code !== error.PERMISSION_DENIED) {
          retryCount.current = attempt + 1;
          setTimeout(() => {
            getLocation(attempt + 1);
          }, 2000 * (attempt + 1)); // Exponential backoff: 2s, 4s
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
      // Progressive fallback strategy
      let options: PositionOptions;
      
      if (attempt === 0) {
        // First attempt: High accuracy, long timeout
        options = {
          enableHighAccuracy: true,
          timeout: 20000, // 20 seconds
          maximumAge: 0,
        };
      } else if (attempt === 1) {
        // Second attempt: Low accuracy, shorter timeout, accept cached
        options = {
          enableHighAccuracy: false,
          timeout: 10000, // 10 seconds
          maximumAge: 600000, // Accept cached location up to 10 minutes old
        };
      } else {
        // Third attempt: Very permissive
        options = {
          enableHighAccuracy: false,
          timeout: 5000, // 5 seconds
          maximumAge: 3600000, // Accept cached location up to 1 hour old
        };
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Validate coordinates
          if (
            position.coords.latitude &&
            position.coords.longitude &&
            !isNaN(position.coords.latitude) &&
            !isNaN(position.coords.longitude)
          ) {
            setState({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              error: null,
              loading: false,
            });
            retryCount.current = 0; // Reset retry count on success
          } else {
            // Invalid coordinates, retry
            if (attempt < maxRetries) {
              setTimeout(() => {
                getLocation(attempt + 1);
              }, 1000 * (attempt + 1));
            } else {
              setState({
                latitude: null,
                longitude: null,
                error: 'Không thể lấy tọa độ hợp lệ. Vui lòng thử lại.',
                loading: false,
              });
            }
          }
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

          // Retry with different strategy if we haven't exceeded max retries
          if (attempt < maxRetries && error.code !== error.PERMISSION_DENIED) {
            retryCount.current = attempt + 1;
            setTimeout(() => {
              getLocation(attempt + 1);
            }, 2000 * (attempt + 1)); // Exponential backoff: 2s, 4s
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

  // Expose retry function
  const retry = () => {
    retryCount.current = 0;
    getLocation(0);
  };

  return { ...state, retry };
}

