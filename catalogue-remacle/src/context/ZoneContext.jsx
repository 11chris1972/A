import { createContext, useContext, useState } from 'react';

const ZoneContext = createContext(null);

export function ZoneProvider({ children }) {
  const [zone, setZone] = useState('Z3');
  const [truckType, setTruckType] = useState('plateau'); // 'plateau' | 'grue'

  return (
    <ZoneContext.Provider value={{ zone, setZone, truckType, setTruckType }}>
      {children}
    </ZoneContext.Provider>
  );
}

export function useZone() {
  return useContext(ZoneContext);
}
