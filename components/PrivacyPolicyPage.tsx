import React from 'react';

const BackIcon = () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
);

const PrivacyPolicyPage = ({ onBack }: { onBack: () => void }) => {
    return (
        <div className="min-h-screen w-full flex flex-col bg-gray-900 text-gray-300">
            <header className="flex items-center p-4 bg-gray-800/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-10">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700">
                    <BackIcon />
                </button>
                <h1 className="text-xl font-bold ml-4 text-white">Política de Privacidad</h1>
            </header>
            <main className="flex-grow p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto space-y-6">
                    <p className="text-sm text-gray-400">Tu privacidad es fundamental para nosotros. Esta política explica qué información recopilamos, cómo la usamos y las opciones que tienes sobre tus datos.</p>

                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">1. Información que Recopilamos</h2>
                        <h3 className="text-lg font-semibold text-white mt-4 mb-1">Información que nos proporcionas:</h3>
                        <ul className="list-disc list-inside space-y-1 pl-4">
                            <li><strong>Información de la cuenta:</strong> Al registrarte, recopilamos tu nombre, nombre de usuario, fecha de nacimiento, orientación sexual e intereses.</li>
                            <li><strong>Contenido:</strong> Recopilamos el contenido que creas, como publicaciones (texto, fotos, videos) y mensajes que envías y recibes.</li>
                            <li><strong>Comunicaciones:</strong> Si te pones en contacto con nosotros, guardaremos esa comunicación.</li>
                        </ul>
                        <h3 className="text-lg font-semibold text-white mt-4 mb-1">Información que recopilamos automáticamente:</h3>
                        <ul className="list-disc list-inside space-y-1 pl-4">
                            <li><strong>Información de uso:</strong> Recopilamos información sobre cómo interactúas con la app, como las publicaciones que ves, las personas con las que interactúas y la hora, frecuencia y duración de tus actividades.</li>
                        </ul>
                    </section>
                    
                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">2. Cómo Usamos tu Información</h2>
                        <p>Usamos tu información para:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2 pl-4">
                            <li>Proporcionar, personalizar y mejorar nuestros servicios.</li>
                            <li>Conectarte con otros usuarios y mostrarte contenido relevante.</li>
                            <li>Fomentar la seguridad y protección de nuestra comunidad.</li>
                            <li>Comunicarnos contigo sobre actualizaciones, políticas o soporte.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">3. Cómo se Comparte tu Información</h2>
                        <p>No vendemos tus datos. Compartimos información de las siguientes maneras:</p>
                        <ul className="list-disc list-inside space-y-1 mt-2 pl-4">
                            <li><strong>Con otros usuarios:</strong> Tu perfil (nombre de usuario, foto, intereses) y tus publicaciones son visibles para otros usuarios.</li>
                            <li><strong>Proveedores de servicios:</strong> Trabajamos con terceros (como Firebase para la base de datos y autenticación) que procesan datos en nuestro nombre.</li>
                            <li><strong>Por razones legales:</strong> Podemos compartir información si es requerido por ley o para proteger la seguridad de todos.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">4. Tus Derechos y Opciones</h2>
                        <p>Tienes control sobre tu información. Puedes acceder y actualizar la información de tu perfil en cualquier momento. También puedes eliminar tu cuenta, lo que eliminará permanentemente tu perfil y contenido asociado.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">5. Seguridad de los Datos</h2>
                        <p>Tomamos medidas razonables para proteger tu información contra pérdida, robo, uso indebido y acceso no autorizado. Utilizamos servicios de backend seguros como Firebase para gestionar los datos.</p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">6. Cambios a esta Política</h2>
                        <p>Podemos actualizar esta política de privacidad. Te notificaremos de cualquier cambio significativo. Te recomendamos revisarla periódicamente.</p>
                    </section>

                    <p className="text-sm text-gray-500 mt-8"><strong>Fecha de última actualización:</strong> 24 de julio de 2024</p>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPolicyPage;
