import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SensorData {
  id: number;
  electricity: number;
  water: number;
  timestamp: string;
  room: {
    roomNumber: string;
  };
}

export default function SensorDataPage() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSensorData();
  }, []);

  const fetchSensorData = async () => {
    try {
      const response = await api.get('/sensor-data');
      setSensorData(response.data);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group data by room for charts
  const dataByRoom = sensorData.reduce((acc, data) => {
    const roomNum = data.room.roomNumber;
    if (!acc[roomNum]) {
      acc[roomNum] = [];
    }
    acc[roomNum].push({
      time: new Date(data.timestamp).toLocaleString('vi-VN'),
      electricity: Number(data.electricity),
      water: Number(data.water),
    });
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Dữ liệu từ cảm biến IoT</h2>
      {Object.entries(dataByRoom).map(([roomNumber, data]) => (
        <Card key={roomNumber} className="mb-6">
          <CardHeader>
            <CardTitle>Phòng {roomNumber}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="electricity" stroke="#8884d8" name="Điện (kWh)" />
                <Line type="monotone" dataKey="water" stroke="#82ca9d" name="Nước (m³)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      ))}
      {sensorData.length === 0 && (
        <Card>
          <CardContent className="py-6 text-center text-gray-500">
            Chưa có dữ liệu từ cảm biến
          </CardContent>
        </Card>
      )}
    </div>
  );
}


