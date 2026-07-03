import type { Metadata } from 'next'

import { Bullets, ContactBlock, ContentSection, H2, H3, Note, P, StaticPage } from '@/components/content/static-page'

export const metadata: Metadata = {
  title: 'Sobre Nosotros',
  description: 'Conozca la historia, mision y valores de Senalmaq SAS en Bogota.',
}

export default function AboutPage() {
  return (
    <StaticPage title="Sobre Nosotros">
      <ContentSection>
        <H2>Nuestra historia</H2>
        <P><strong>Senalmaq SAS</strong> nace de una pasion que comenzo hace mas de 50 anos.</P>
        <P>Justo Pastor Calderon empezo en el mundo de las maquinas de coser a los 16 anos, cuando ingreso a una ensambladora. Al principio hacia tareas basicas como contar tornillos, pero una importacion desde Brasil le abrio la puerta a trabajar en bodega. Desde alli recorrio distintas areas de la empresa y aprendio a fondo el funcionamiento de las maquinas, acumulando una experiencia que, para 2015, ya sumaba 41 anos.</P>
        <P>Con el impulso de la mujer que luego seria su esposa, decidio independizarse y fundo en Suba el taller <strong>SenalMaq, Servicio Nacional de Maquinas de Coser</strong>, en <strong>1991</strong>. Empezaron vendiendo una maquina guardada y, poco a poco, anadieron repuestos, hilos, cremalleras y otros insumos de costura, convirtiendose en un negocio integral de venta y reparacion para todas las marcas y modelos.</P>
        <P>Su familia tambien crecio dentro del oficio: cuatro de sus cinco hijos trabajan con el, ademas de su esposa. A los 57 anos, Calderon afirmaba que su amor por estas maquinas es para siempre; con ellas saco adelante a su hogar y queria que el negocio fuera herencia para hijos y nietos. La ironia: aunque ha dedicado medio siglo a repararlas, nunca ha tenido una maquina de coser en su casa.</P>
      </ContentSection>

      <ContentSection>
        <H2>Quienes somos</H2>
        <P>Somos un negocio familiar con <strong>mas de 30 anos de experiencia</strong> en el servicio de maquinas de coser. Lo que comenzo como un pequeno taller en Suba se ha convertido en un referente en Bogota para costureros, emprendedores y pequenas confecciones.</P>
        <P>Nuestro equipo esta formado por:</P>
        <Bullets>
          <li><strong>Expertos en maquinas de coser:</strong> con conocimiento profundo de todas las marcas y modelos.</li>
          <li><strong>Personal dedicado a atencion al cliente:</strong> listo para responder sus preguntas.</li>
          <li><strong>Profesionales en reparacion y mantenimiento:</strong> con anos de experiencia en el oficio.</li>
        </Bullets>
      </ContentSection>

      <ContentSection>
        <H2>Que ofrecemos</H2>
        <H3>Maquinas de coser</H3>
        <P>Vendemos maquinas de coser de las marcas mas confiables del mercado, desde modelos basicos para principiantes hasta industriales de alta capacidad.</P>
        <H3>Repuestos y accesorios</H3>
        <Bullets>
          <li>Agujas de todas las referencias.</li>
          <li>Bobinas y carretes.</li>
          <li>Piezas de reemplazo, como ganchos, loopers y tensores.</li>
          <li>Accesorios, como prensatelas, presores y guias.</li>
        </Bullets>
        <H3>Hilos y suministros</H3>
        <P>Ofrecemos hilos de todas las caracteristicas y colores, cremalleras, botones y todo lo que necesita para sus proyectos de costura.</P>
        <H3>Asesoria tecnica</H3>
        <Bullets>
          <li>Recomendarle la maquina perfecta para su proyecto.</li>
          <li>Asesorarle sobre el uso correcto.</li>
          <li>Resolver problemas tecnicos.</li>
          <li>Orientarlo en mantenimiento preventivo.</li>
        </Bullets>
      </ContentSection>

      <ContentSection>
        <H2>Nuestra mision</H2>
        <P>Ser el aliado confiable de costureros, emprendedores y pequenos confeccionistas en Bogota, proporcionando maquinas de calidad, repuestos confiables y asesoria tecnica experta.</P>
      </ContentSection>

      <ContentSection>
        <H2>Nuestros valores</H2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <H3>Confianza</H3>
            <P>Construida a traves de 30 anos de relaciones honradas con nuestros clientes.</P>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <H3>Calidad</H3>
            <P>Vendemos productos de marcas confiables y con garantia respaldada.</P>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <H3>Experiencia</H3>
            <P>Conocimiento profundo de cada maquina, cada problema y cada solucion.</P>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <H3>Compromiso familiar</H3>
            <P>Nuestro negocio es familiar; nos importa que usted tambien tenga exito con sus maquinas.</P>
          </div>
        </div>
      </ContentSection>

      <ContentSection>
        <H2>Por que elegirnos</H2>
        <Bullets>
          <li><strong>Mas de 30 anos de experiencia:</strong> llevamos tres decadas sirviendo a Bogota con dedicacion.</li>
          <li><strong>Equipo experto y apasionado:</strong> conocemos cada maquina y cada marca a fondo.</li>
          <li><strong>Amplio inventario:</strong> maquinas, repuestos y suministros de todas las referencias.</li>
          <li><strong>Precios competitivos:</strong> ofrecemos una gran relacion calidad-precio.</li>
          <li><strong>Garantia confiable:</strong> todos nuestros productos tienen garantia de fabricante.</li>
          <li><strong>Atencion personalizada:</strong> no somos una tienda grande; conocemos a nuestros clientes.</li>
        </Bullets>
      </ContentSection>

      <ContentSection>
        <H2>Ubicacion</H2>
        <ContactBlock />
        <P>Nos encontramos en el sector de Suba, con facil acceso desde toda Bogota.</P>
      </ContentSection>

      <ContentSection>
        <H2>Nuestro compromiso</H2>
        <P>Cada maquina que vendemos viene con la conviccion de que le servira bien. Cada cliente que nos visita se va con la seguridad de haber encontrado un aliado para su oficio.</P>
        <P>Porque para nosotros, las maquinas de coser no son solo productos: son herramientas que generan empleo, que crean historias de exito y que hacen posible los suenos de quienes cosen.</P>
      </ContentSection>

      <Note>
        <P>Quiere conocernos? Visite nuestro taller o contactenos por WhatsApp. Estamos aqui para servirle.</P>
      </Note>
    </StaticPage>
  )
}
