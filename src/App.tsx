import React from 'react';
import './scss/app.scss';
import Layout from "./components/layout/Layout";
import Home from "./components/pages/Home";
import Class from "./components/pages/Class";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import AuthProvider from "./components/AuthProvider";
import {Quiz} from "./components/pages/Quiz";
import ScreenProvider from "./components/layout/ScreenContext";

function App() {
    return <BrowserRouter>
        <AuthProvider>
            <ScreenProvider>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />}/>

                        <Route path="/class" element={<Class />} />

                        <Route path="/class/:classId" element={<Quiz />} />
                    </Routes>
                </Layout>
            </ScreenProvider>
        </AuthProvider>
    </BrowserRouter>
}

export default App;
