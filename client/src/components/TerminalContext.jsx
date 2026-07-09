import { createContext, useContext, useState } from 'react';

const TerminalContext = createContext();

export function TerminalProvider({ children }) {
  const [logs, setLogs] = useState([
    { id: Date.now(), lines: ['READY'], status: 'ready' }
  ]);

  const addTerminalLog = (lines, status = 'working') => {
    const id = Date.now() + Math.random();
    const newLog = { id, lines, status };
    setLogs(prev => [...prev.slice(-8), newLog]);
    return id;
  };

  const markLogComplete = (logId, success = true) => {
    setLogs(prev => 
      prev.map(log => 
        log.id === logId 
          ? { ...log, status: success ? 'success' : 'error' }
          : log
      )
    );
  };

  const resetTerminal = () => {
    setLogs([{ id: Date.now(), lines: ['READY'], status: 'ready' }]);
  };

  return (
    <TerminalContext.Provider value={{
      logs,
      addTerminalLog,
      markLogComplete,
      resetTerminal,
    }}>
      {children}
    </TerminalContext.Provider>
  );
}

export const useTerminal = () => useContext(TerminalContext);
