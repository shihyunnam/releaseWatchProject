import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Game from './Game';
import NavBar from './NavBar';
import SubmitGame from './SubmitGame';
import News from './News';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BrowserRouter>
    {/* <NavBar /> */}
        <Routes>
            <Route path="*" element={<App />} />
            <Route path="/game/" element={<Game/>}>
                <Route path=":id" element={<Game/>} />
            </Route>
            <Route path="/submit/game" element={<SubmitGame/>}>
            </Route>
            <Route path="/news/" element={<News/>}>
                <Route path=":id" element={<News/>} />
            </Route>
        </Routes>
    </BrowserRouter>
);
