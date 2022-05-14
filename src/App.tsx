import React from 'react';
import './scss/app.scss';
import Layout from "./components/layout/Layout";
import Home from "./components/pages/Home";
import Quiz from "./components/pages/Quiz";
import {BrowserRouter, Routes, Route} from "react-router-dom";

function App() {
    return <BrowserRouter>
        <Layout>
            <Routes>
                <Route path="/" element={<Home />}/>

                <Route path="/quiz" element={<Quiz />}>

                </Route>
            </Routes>
        </Layout>
    </BrowserRouter>
}

export default App;
