import { Routes,Route } from "react-router-dom"
import Home from "./Pages/Home"
import Inventory from "./Pages/Inventory"
import Recep from "./Pages/Recep"
import ReverseLog from "./Pages/ReverseLog"
import Storage from "./Pages/Storage"
import Footer from "./components/Footer"
import Movements from "./O.Inventory/Movements"
import Consultations from "./O.Inventory/Consultations"
import Counting from "./O.Inventory/Counting"
import UnityR from "./O.Recep/UnityR"
import QuantityR from "./O.Recep/QuantityR"


function App() {

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home/>}/>

        <Route path="/Inventory" element={<Inventory/>}/>
        <Route path="/Inventory/Movements" element={<Movements/>}/>
        <Route path="/Inventory/Consultations" element={<Consultations/>}/>
        <Route path="/Inventory/Counting" element={<Counting/>}/>


        <Route path="/Recep" element={<Recep/>}/>
        <Route path="/Recep/Unity" element={<UnityR/>}/>
        <Route path="/Recep/Quantity" element={<QuantityR/>}/>

        <Route path="/ReverseLog" element={<ReverseLog/>}/>

        <Route path="/Storage" element={<Storage/>}/>
      </Routes>
      <Footer/>
    </div>

  )
}

export default App

