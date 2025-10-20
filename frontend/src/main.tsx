import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App.tsx'
import "./index.css";
// Import CSS chung cho toàn bộ trang web
import './index.css'

// Tìm đến thẻ div có id là 'root' trong public/index.html
const rootElement = document.getElementById('root')!;

// Tạo một "gốc" React và ra lệnh cho nó hiển thị component App
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
