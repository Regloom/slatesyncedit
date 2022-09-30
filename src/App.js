// Import React!
import React from 'react';
import { Group } from './components/Group';
import { BrowserRouter, Route, Navigate, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Navigate to={`/groups/${Date.now()}`} />} />
        <Route exact path="/groups/:groupId" element={<Group />} />
        <Route element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
