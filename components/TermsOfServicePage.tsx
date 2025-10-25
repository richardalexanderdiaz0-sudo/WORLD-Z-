import React from 'react';

const BackIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);

const TermsOfServicePage = ({ onBack }: { onBack: () => void }) => {
    return (
        <div className="min-h-screen w-full flex flex-col bg-gray-900 text-gray-300">
            <header className="flex items-center p-4 bg-gray-800/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-10">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700">
                    <BackIcon />
                </button>
                <h1 className="text-xl font-bold ml-4 text-white">Términos de Servicio</h1>
            </header>
            <main className="flex-grow p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">1. Aceptación de los Términos</h2>
                        <p>Bienvenido/a/e a Z-App. Al acceder o utilizar nuestra aplicación, aceptas estar sujeto a estos Términos de Servicio y a nuestra Política de Privacidad. Si no estás de acuerdo, no utilices la app.</p>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">2. Quién Puede Usar Z-App</h2>
                        <p>Debes tener al menos 16 años para usar Z-App. Al crear una cuenta, confirmas que cumples con este requisito y que no tienes prohibido usar nuestros servicios bajo ninguna ley aplicable.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">3. Tu Cuenta</h2>
                        <p>Eres responsable de la seguridad de tu cuenta. Mantén tu contraseña segura. Eres responsable de toda la actividad que ocurra en tu cuenta. Notifícanos inmediatamente sobre cualquier uso no autorizado.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">4. Contenido del Usuario</h2>
                        <p>Tú eres el propietario del contenido que publicas en Z-App (textos, fotos, videos). Sin embargo, al publicar, nos otorgas una licencia mundial, no exclusiva, libre de regalías para usar, copiar, reproducir, procesar, adaptar, modificar, publicar, transmitir, mostrar y distribuir tu contenido en cualquier medio o método de distribución.</p>
                        <p>Esto nos permite mostrar tu contenido a otros usuarios y mejorar nuestros servicios. Siempre te daremos crédito por tu contenido.</p>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">5. Normas de la Comunidad</h2>
                        <p>Z-App es un espacio seguro. No se tolerará el siguiente comportamiento:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2 pl-4">
                            <li>Discurso de odio, acoso, bullying o amenazas.</li>
                            <li>Contenido sexualmente explícito o violento.</li>
                            <li>Spam, estafas o contenido engañoso.</li>
                            <li>Suplantación de identidad.</li>
                            <li>Promoción de actividades ilegales.</li>
                        </ul>
                        <p className="mt-2">Nos reservamos el derecho de eliminar contenido y suspender o eliminar cuentas que violen estas normas sin previo aviso.</p>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">6. Nuestros Derechos</h2>
                        <p>Todos los derechos, títulos e intereses en y para Z-App (excluyendo el contenido proporcionado por los usuarios) son y seguirán siendo propiedad exclusiva de Z-App y sus licenciantes. Nuestros logos, marcas y diseño están protegidos.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">7. Terminación</h2>
                        <p>Puedes dejar de usar nuestros servicios en cualquier momento. Nosotros también podemos suspender o terminar tu cuenta si violas nuestros términos o si es necesario para proteger la seguridad de nuestra comunidad.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">8. Limitación de Responsabilidad</h2>
                        <p>Z-App se proporciona "tal cual". No garantizamos que siempre será seguro, protegido o sin errores. En la medida máxima permitida por la ley, Z-App no será responsable de ningún daño indirecto, incidental, especial, consecuente o punitivo.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">9. Cambios a los Términos</h2>
                        <p>Podemos modificar estos términos de vez en cuando. Te notificaremos de los cambios importantes. El uso continuado de la app después de los cambios significa que aceptas los nuevos términos.</p>
                    </section>

                    <p className="text-sm text-gray-500 mt-8"><strong>Fecha de última actualización:</strong> 24 de julio de 2024</p>
                </div>
            </main>
        </div>
    );
};

export default TermsOfServicePage;
