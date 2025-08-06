import { Routes,Route } from "react-router-dom"
import Dispatch from "./Pages/Dispatch"
import Home from "./Pages/Home"
import Inventory from "./Pages/Inventory"
import Picking from "./Pages/Picking"
import Recep from "./Pages/Recep"
import ReverseLog from "./Pages/ReverseLog"
import Storage from "./Pages/Storage"
import OpcionsDispatch from "./O.Dispatch/OpcionsD"
import OpcionsInventory from "./O.Inventory/OpcionsI"
import Footer from "./components/Footer"
import UnityD from "./O.Dispatch/UnityD"
import QuantityD from "./O.Dispatch/QuantityD"
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
        <Route path="/Dispatch" element={<Dispatch/>}/>
        <Route path="/Dispatch/Opcions" element={<OpcionsDispatch/>}/>
        <Route path="/Dispatch/Unity" element={<UnityD/>}/>
        <Route path="/Dispatch/Quantity" element={<QuantityD/>}/>

        <Route path="/Inventory" element={<Inventory/>}/>
        <Route path="/Inventory/Opcions" element={<OpcionsInventory/>}/>
        <Route path="/Inventory/Movements" element={<Movements/>}/>
        <Route path="/Inventory/Consultations" element={<Consultations/>}/>
        <Route path="/Inventory/Counting" element={<Counting/>}/>


        <Route path="/Recep" element={<Recep/>}/>
        <Route path="/Recep/Unity" element={<UnityR/>}/>
        <Route path="/Recep/Quantity" element={<QuantityR/>}/>


        <Route path="/Picking" element={<Picking/>}/>
        <Route path="/ReverseLog" element={<ReverseLog/>}/>
        <Route path="/Storage" element={<Storage/>}/>
      </Routes>
      <Footer/>
    </div>

  )
}

export default App

