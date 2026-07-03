import type { Metadata } from 'next'

import { Bullets, ContactBlock, ContentSection, H2, H3, Note, P, StaticPage, Steps } from '@/components/content/static-page'

export const metadata: Metadata = {
  title: 'Politica de Cookies',
  description: 'Politica de cookies y tecnologias de seguimiento de Senalmaq SAS.',
}

export default function CookiesPage() {
  return (
    <StaticPage title="Politica de Cookies" description="Ultima actualizacion: Julio 2026">
      <P>
        En <strong>Senalmaq SAS</strong> utilizamos cookies y tecnologias similares para mejorar su
        experiencia en nuestro sitio web. Esta politica explica que son, como las utilizamos y como
        puede controlarlas.
      </P>

      <ContentSection>
        <H2>1. Que son las cookies</H2>
        <P>Las cookies son pequenos archivos de texto que se almacenan en su navegador cuando visita un sitio web. Permiten que los sitios reconozcan su dispositivo, recuerden preferencias y mejoren la experiencia del usuario.</P>
        <Bullets>
          <li><strong>Nombre:</strong> identificador unico.</li>
          <li><strong>Valor:</strong> datos almacenados.</li>
          <li><strong>Dominio:</strong> sitio web que la creo.</li>
          <li><strong>Fecha de expiracion:</strong> cuando se elimina.</li>
        </Bullets>
      </ContentSection>

      <ContentSection>
        <H2>2. Tipos de cookies que utilizamos</H2>
        <H3>2.1 Cookies esenciales</H3>
        <P>Necesarias para que el sitio funcione correctamente: autenticacion y seguridad, preferencias de idioma, informacion de la sesion y proteccion contra fraude.</P>
        <P><strong>No pueden ser deshabilitadas</strong> sin afectar el funcionamiento del sitio.</P>
        <H3>2.2 Cookies de analisis</H3>
        <P>Utilizadas para entender como los usuarios interactuan con nuestro sitio, incluyendo Google Analytics, paginas visitadas, tiempo en sitio y origen del trafico.</P>
        <H3>2.3 Cookies de preferencia</H3>
        <P>Recuerdan opciones como zona horaria, ubicacion, tamano de fuente, tema de color, contenido favorito e historial de busqueda.</P>
        <H3>2.4 Cookies de marketing</H3>
        <P>Utilizadas si ejecutamos campanas publicitarias, como Meta Pixel o Google Ads, para seguimiento de conversiones, retargeting y anuncios relevantes.</P>
      </ContentSection>

      <ContentSection>
        <H2>3. Cookies de terceros</H2>
        <P>Algunos servicios terceros establecen sus propias cookies en nuestro sitio:</P>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
            <thead className="bg-gray-100 text-gray-900">
              <tr>
                <th className="px-4 py-3 font-semibold">Servicio</th>
                <th className="px-4 py-3 font-semibold">Tipo</th>
                <th className="px-4 py-3 font-semibold">Proposito</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-gray-700">
              <tr>
                <td className="px-4 py-3">Google Analytics</td>
                <td className="px-4 py-3">Analisis</td>
                <td className="px-4 py-3">Medir trafico y comportamiento.</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Google Ads</td>
                <td className="px-4 py-3">Marketing</td>
                <td className="px-4 py-3">Publicidad personalizada.</td>
              </tr>
              <tr>
                <td className="px-4 py-3">Meta Pixel</td>
                <td className="px-4 py-3">Marketing</td>
                <td className="px-4 py-3">Seguimiento de conversiones.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <P>Estos terceros tienen sus propias politicas de privacidad. Le recomendamos revisarlas.</P>
      </ContentSection>

      <ContentSection>
        <H2>4. Como usamos las cookies</H2>
        <Bullets>
          <li>Mantener su sesion activa en el sitio.</li>
          <li>Recordar articulos en su carrito de compras.</li>
          <li>Entender que productos le interesan.</li>
          <li>Medir la efectividad de nuestro sitio.</li>
          <li>Mejorar la velocidad y seguridad.</li>
          <li>Mostrar anuncios relevantes si visita otros sitios.</li>
          <li>Cumplir con requisitos legales.</li>
        </Bullets>
      </ContentSection>

      <ContentSection>
        <H2>5. Control de cookies</H2>
        <H3>5.1 Aceptacion de cookies</H3>
        <P>Al visitar nuestro sitio, puede aceptar todas las cookies, aceptar solo esenciales o personalizar sus preferencias.</P>
        <H3>5.2 Configurar su navegador</H3>
        <P>Puede controlar cookies desde las opciones de su navegador:</P>
        <Bullets>
          <li><strong>Chrome:</strong> Opciones, Privacidad y Seguridad, Cookies.</li>
          <li><strong>Firefox:</strong> Opciones, Privacidad, Cookies.</li>
          <li><strong>Safari:</strong> Preferencias, Privacidad.</li>
          <li><strong>Edge:</strong> Configuracion, Privacidad, Cookies y permisos de sitios.</li>
        </Bullets>
        <H3>5.3 Deshabilitar cookies completamente</H3>
        <P>Puede bloquear todas las cookies, pero esto puede afectar la funcionalidad del carrito, el recuerdo de preferencias y la experiencia general del sitio.</P>
        <H3>5.4 Herramientas de exclusion</H3>
        <Bullets>
          <li><strong>Google Analytics:</strong> instale la extension Google Analytics Opt-out Browser.</li>
          <li><strong>Meta/Facebook:</strong> visite sus opciones de privacidad.</li>
        </Bullets>
      </ContentSection>

      <ContentSection>
        <H2>6. Cookies persistentes vs. sesion</H2>
        <H3>Cookies de sesion</H3>
        <P>Se eliminan al cerrar el navegador y almacenan informacion temporal, como el carrito de compras.</P>
        <H3>Cookies persistentes</H3>
        <P>Se mantienen durante un periodo definido y se usan para recordar preferencias a largo plazo, como el idioma preferido.</P>
      </ContentSection>

      <ContentSection>
        <H2>7. Privacidad y seguridad</H2>
        <Bullets>
          <li>No vendemos datos de cookies a terceros.</li>
          <li>Los datos se usan solo para mejorar nuestros servicios.</li>
          <li>Utilizamos encriptacion HTTPS para proteger informacion.</li>
          <li>Cumplimos con regulaciones de privacidad aplicables.</li>
        </Bullets>
      </ContentSection>

      <ContentSection>
        <H2>8. Cambios en esta politica</H2>
        <P>Podemos actualizar esta politica cuando implementemos nuevas cookies, cambien las regulaciones de privacidad o actualicemos nuestras practicas. Le notificaremos de cambios significativos publicando la version actualizada aqui.</P>
      </ContentSection>

      <ContentSection>
        <H2>9. Contacto</H2>
        <P>Si tiene preguntas sobre nuestro uso de cookies o privacidad:</P>
        <ContactBlock />
      </ContentSection>

      <Note>
        <P><strong>Nota:</strong> Al continuar navegando nuestro sitio, acepta el uso de cookies segun esta politica.</P>
      </Note>
    </StaticPage>
  )
}
