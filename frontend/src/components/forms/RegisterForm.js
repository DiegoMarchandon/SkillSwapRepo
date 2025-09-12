const RegisterForm = ({handleSubmit, name, setName, email, setEmail, password, setPassword, passwordConfirm, setPasswordConfirm, error}) => {
    return (
        <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Registro de usuarios</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario:
            </label>
            <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-red-500">{error?.response?.errors?.name?.[0]}</p>
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico:
            </label>
            <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-red-500">{error?.response?.errors?.email?.[0]}</p>
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña:
            </label>
            <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-red-500">{error?.response?.errors?.password?.[0]}</p>
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña:
            </label>
            <input
                type="password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                className="w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-red-500">{error?.response?.errors?.password?.[0]}</p>
            </div>
            <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
            Registrar
            </button>
            {error?.response?.data?.message && (
            <p className="text-red-600 text-sm mt-2 text-center">{error.response.data.message}</p>
            )}
        </form>
        </div>
      );
}
export default RegisterForm;