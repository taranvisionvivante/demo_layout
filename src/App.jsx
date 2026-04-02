import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "bootstrap/dist/js/bootstrap.bundle.min";
import FloorPlan from './FloorPlan'
import GridAnalyzer from './GridAnalyzer'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
     <FloorPlan />
     {/* <GridAnalyzer /> */}
    </>
  )
}

export default App
