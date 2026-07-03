import type { Metadata } from 'next'

import { Bullets, ContentSection, H2, Note, P, StaticPage } from '@/components/content/static-page'

export const metadata: Metadata = {
  title: 'Politica de Garantia y Devoluciones',
  description: 'Condiciones de garantia y devoluciones de Senalmaq SAS.',
}

export default function WarrantyPage() {
  return (
    <StaticPage
      title="Politica de Garantia y Devoluciones"
      description="Condiciones para atencion de garantias, revisiones tecnicas y devoluciones."
    >
      <ContentSection>
        <P>
          No realizamos devolucion de dinero. En caso de presentarse alguna novedad con el
          producto adquirido, Senalmaq brindara la garantia correspondiente y ofrecera una
          solucion adecuada, de acuerdo con la evaluacion tecnica del equipo.
        </P>
      </ContentSection>

      <ContentSection>
        <H2>Condiciones de la garantia</H2>
        <Bullets>
          <li>
            Si el cliente trae la maquina a nuestras instalaciones, la atencion por garantia no
            tiene ningun costo.
          </li>
          <li>
            Si el cliente solicita la atencion por garantia a domicilio dentro del sector de Suba,
            este servicio tendra un costo adicional de <strong>$20.000</strong>.
          </li>
          <li>
            Para garantias fuera del sector de Suba, la maquina debera ser llevada a nuestras
            instalaciones para su revision y atencion.
          </li>
          <li>
            Una vez solicitada la garantia, Senalmaq cuenta con un plazo de hasta{' '}
            <strong>8 dias habiles</strong> para atender y dar cumplimiento al servicio de garantia.
          </li>
        </Bullets>
      </ContentSection>

      <ContentSection>
        <H2>Exclusiones</H2>
        <P>
          La garantia no cubre danos ocasionados por mal uso, golpes, manipulacion indebida,
          intervenciones realizadas por personal no autorizado o el incumplimiento de las
          recomendaciones de operacion y mantenimiento.
        </P>
      </ContentSection>

      <Note>
        <P>
          Senalmaq trabaja para brindar soluciones a sus clientes, garantizando el correcto
          funcionamiento de sus equipos y productos.
        </P>
      </Note>
    </StaticPage>
  )
}
