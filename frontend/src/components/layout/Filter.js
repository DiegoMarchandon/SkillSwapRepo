
export default function Filter(){
    return(
        <div className="bg-white shadow p-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        
        {/* Categoría */}
        <div>
          <label className="font-semibold mr-2">Categoría:</label>
          <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Todos</option>
            <option>Electrónica</option>
            <option>Ropa</option>
            <option>Hogar</option>
          </select>
        </div>

        {/* Rango de precio */}
        <div className="flex items-center gap-3">
          <label className="font-semibold">Precio:</label>
          <input 
            type="range" 
            min="0" 
            max="1000" 
            className="w-40 accent-blue-600" 
          />
          <span className="text-sm text-gray-600">$0 - $1000</span>
        </div>

        {/* Ordenar */}
        <div>
          <label className="font-semibold mr-2">Ordenar por:</label>
          <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Relevancia</option>
            <option>Precio: menor a mayor</option>
            <option>Precio: mayor a menor</option>
          </select>
        </div>

        {/* Botón */}
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          Aplicar
        </button>
      </div>
    </div>

    )
}