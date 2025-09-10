const LoginForm = ({email,setEmail,password,setPassword,error,handleSubmit}) => {
    
    return (
        <div className="container mx-auto p-4 max-w-md">
        <h1 className="text-3xl font-bold text-blue-400 mb-4">Iniciar Sesión</h1>
        <form className="bg-white rounded px-8 pt-6 pb-8 mb-4" onSubmit={handleSubmit}>
            @csrf
            <div className="mb-4">
                <label 
                    className="block text-gray-700 text-sm font-bold mb-2" 
                    htmlFor="email">
                        Correo Electrónico
                </label>
                <input 
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    id="email" 
                    type="email" 
                    value={email}  
                    onChange={(e) => setEmail(e.target.value)}
                    name="email" 
                    placeholder="Ingrese su correo electrónico"/>
            </div>
            <div className="mb-4">
                <label 
                    className="block text-gray-700 text-sm font-bold mb-2" 
                    htmlFor="password">
                        Contraseña
                </label>
                <input 
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    name="password" 
                    placeholder="Ingrese su contraseña"/>
            </div>
            <div className="flex items-center justify-between">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">Iniciar Sesión</button>
            <a className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="/register">¿No tienes cuenta? Regístrate</a>
            </div>
        </form>
        {error?.length > 0 && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <ul>
                {error.map((error, index) => (
                    <li key={index}>{error}</li>
                ))}
                </ul>
            </div>
        )}
        </div>
    );
}
export default LoginForm;