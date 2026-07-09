import './App.css'
import './styles/theme.css'
import AppRoutes from './AppRoutes'
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {

  return (
    <>
      <AppRoutes />
      <ToastContainer 
        position='top-right'
        autoClose={2500}
        theme="dark"
      />
    </>
  )
}

export default App
