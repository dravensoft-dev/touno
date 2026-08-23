import { ManualEntry } from './manual.model';

export const MANUAL: readonly ManualEntry[] = [
  {
    role: 'comprador',
    title: 'Manual del comprador',
    lede: 'Pides comida a un restaurante de tu ciudad, o mercadería a una importadora que puede estar en otra.',
    description:
      'Cómo comprar en Touno: el carrito, las cuatro líneas que pagas, el código que es tuyo, el mapa, el chat y tu reputación.',
    icon: 'ph-bold ph-shopping-cart-simple',
    chapters: [
      {
        section: 'tutorial',
        title: 'Cómo se compra en Touno',
        summary:
          'Un solo lugar para el almuerzo y para la encomienda, con un carrito y una forma de seguirlo.',
        steps: [
          {
            title: 'Exploras',
            body: 'Ves restaurantes e importadoras, filtras por ciudad y buscas por nombre. Cada negocio tiene su ficha, y dentro ves cada sucursal con su dirección, su horario y su zona.',
          },
          {
            title: 'Armas tu carrito',
            body: 'Un solo carrito, aunque mezcles comida y mercadería.',
          },
          {
            title: 'Eliges cómo lo quieres recibir',
            body: 'Sólo hay algo que elegir cuando compras a una importadora de otra ciudad: entrega a domicilio o recojo en su sucursal de tu ciudad. Si es comida, o si la importadora está en tu ciudad, llega a tu dirección y no hay nada que decidir.',
          },
          {
            title: 'Eliges tu zona',
            body: 'Si va a tu dirección, eliges tu zona. No es un trámite: de ahí sale lo que pagas de envío, que se mide entre la sucursal y tu zona.',
          },
          {
            title: 'Confirmas y recibes tu código',
            body: 'Touno te entrega el código del pedido en ese mismo momento. Es tuyo, es el mismo durante toda la vida del pedido, y es la prueba de que lo recibiste.',
          },
          {
            title: 'Sigues tu pedido',
            body: 'En la ficha ves la línea de tiempo y un estado en palabras. El mapa aparece cuando se asigna un rider y se apaga cuando te escanean el código. Si el rider pierde señal, el mapa no se congela sin avisar: te decimos la hora de su última conexión.',
          },
          {
            title: 'Hablas con quien lo tiene',
            body: 'Un solo chat por pedido, y con quien lo tiene en las manos en ese momento. Cuando cambia de manos, el chat te lo dice dentro de la conversación.',
          },
          {
            title: 'Te escanean el código',
            body: 'El rider en tu puerta, o el gerente en el mostrador. Ese escaneo es lo que marca el pedido como entregado. No hay otro.',
          },
        ],
        gains: [
          'Un solo lugar para el almuerzo y para la encomienda.',
          'Cuatro líneas separadas en lo que pagas: los productos, la comisión de Touno, el envío por distancia y el recargo por clima. El negocio cobra su precio completo.',
          'Si recoges en mostrador no pagas envío ni clima, porque nadie salió a tu puerta.',
          'Un código que es tuyo desde el principio y que nadie más puede usar para cerrar tu pedido.',
        ],
        limits: [
          'No eliges el rider: lo asigna la sucursal que despacha.',
          'No puedes comprar a una importadora de otra ciudad si no tiene sucursal en la tuya.',
          'No cambias el destino una vez que el pedido salió.',
        ],
        counted: [],
      },
      {
        section: 'reputacion',
        title: 'Tu reputación como comprador',
        summary:
          'Es un porcentaje de cumplimiento, no una calificación por estrellas. Sale de hechos, no de opiniones, y la ves sólo tú.',
        steps: [
          {
            title: 'Qué es',
            body: 'Un porcentaje: de todo lo que te tocaba a ti, cuánto cumpliste. Siempre viene con de qué está hecho, por ejemplo «96 % · 54 de 56 compromisos cumplidos». Nunca es una nota del uno al cinco, y nadie te la pone a mano.',
          },
          {
            title: 'Quién la ve',
            body: 'Sólo tú, en esta pantalla y en Mis pedidos. Ni la sucursal que despacha ni el rider que te lleva el pedido la consultan. Es un beneficio tuyo, no una vigilancia.',
          },
          {
            title: 'Qué ganas con una buena',
            body: 'Por ahora, saber que Touno tiene contado que cumples. Es la base sobre la que se van a construir las promociones, y esas van a mirar tu constancia y no tu gasto.',
          },
          {
            title: 'Qué pierdes con una mala',
            body: 'Hoy, nada frente a un negocio ni frente a un rider: nadie la ve. Lo que pierdes es el acceso a lo que se construya encima.',
          },
        ],
        gains: [
          'Nadie te puntúa a mano, ni un negocio molesto ni un rider que tuvo un mal día.',
          'Cada hecho que cuenta está en tu propio historial de pedidos y lo puedes revisar.',
        ],
        limits: [
          'No puedes subirla pidiendo más: sube cumpliendo.',
          'No hay forma de discutir un hecho ya registrado.',
        ],
        subject: 'comprador',
        counted: [
          'recibido-a-la-primera',
          'recojo-a-tiempo',
          'recojo-abandonado',
          'direccion-incorrecta',
        ],
      },
    ],
  },
  {
    role: 'rider',
    title: 'Manual del rider',
    lede: 'Transportas con tu propio vehículo. Decides para quién trabajas y cuándo estás disponible.',
    description:
      'Cómo trabaja un rider en Touno: el reclutamiento de dos partes, las carreras, el escaneo que cierra la entrega y la reputación que te abre la hora pico.',
    icon: 'ph-bold ph-motorcycle',
    chapters: [
      {
        section: 'tutorial',
        title: 'Cómo se trabaja en Touno',
        summary:
          'Tu vehículo decide el trabajo: moto o auto reparten en ciudad, camión une dos ciudades. Es la misma cuenta y la misma aplicación.',
        steps: [
          {
            title: 'Te reclutan, o te postulas tú',
            body: 'Te llega una invitación de una empresa y la aceptas o la rechazas, o te postulas tú a una sucursal o a un grupo de ellas. Mientras no haya un sí de las dos partes, esa sucursal no te puede mandar trabajo.',
          },
          {
            title: 'Ves las carreras antes de aceptar',
            body: 'Cada reclutamiento viene con sus carreras: la cantidad de entregas que cubre. Las ves antes de decir que sí, y se descuenta una cada vez que un escaneo cierra una entrega tuya.',
          },
          {
            title: 'Te pones en turno',
            body: 'Cuando quieras trabajar. Sólo una sucursal con la que tengas acuerdo aceptado te puede asignar un encargo.',
          },
          {
            title: 'Recibes un encargo',
            body: 'Con el punto de recojo, el destino y cuánto ganas, antes de aceptar. Aceptas o rechazas.',
          },
          {
            title: 'Recoges y vas',
            body: 'Desde que sales, el comprador ve tu recorrido en el mapa y puede escribirte por el chat del pedido. Si pierdes señal, el mapa muestra tu última conexión con su hora en vez de fingir que dejaste de moverte.',
          },
          {
            title: 'Escaneas el código del comprador',
            body: 'Al llegar. Eso cierra el pedido y te descuenta una carrera del reclutamiento que cubre esa sucursal. Cuando gastas la última, el reclutamiento queda cumplido y quedas libre.',
          },
          {
            title: 'Si llevas camión',
            body: 'No sales con un pedido, sales con una carga, y nunca escaneas el código de un comprador. Esperas a que la carga se llene, sales, y en la sucursal de destino el gerente te muestra el código de recepción y tú lo escaneas. Un escaneo por carga, no uno por pedido, y ahí se te descuenta una carrera.',
          },
        ],
        gains: [
          'Eliges para quién trabajas, y a qué sucursales concretas.',
          'Nadie te asigna sin tu sí. El acuerdo es de dos partes, siempre.',
          'Sabes cuánto ganas antes de aceptar, y cuántas carreras te compromete.',
          'Eliges dónde cobrar: a tu cuenta o a tu tarjeta.',
        ],
        limits: [
          'No te asignas encargos tú mismo: los asigna el gerente de la sucursal.',
          'No cierras un pedido sin escanear el código del comprador. No hay forma de marcarlo entregado a mano.',
          'No aceptas un reclutamiento de hora pico con carreras pendientes, ni un segundo de hora pico, ni uno de una empresa que ya te reclutó así antes.',
          'No decides cuándo sale tu camión: sale cuando se llena.',
        ],
        counted: [],
      },
      {
        section: 'reputacion',
        title: 'Tu reputación como rider',
        summary:
          'Un porcentaje de compromisos cumplidos, calculado sobre hechos que ya quedan registrados: escaneos, horas y reclutamientos terminados.',
        steps: [
          {
            title: 'Qué es, y qué no es',
            body: 'Es el porcentaje de lo que prometiste y cumpliste. No es una calificación del comprador, no hay estrellas, y nadie escribe una reseña sobre ti. Si tienes 96 %, la pantalla dice además de qué está hecho.',
          },
          {
            title: 'Qué la sube',
            body: 'Cada entrega que cierras escaneando dentro de la hora prometida. Cada carga que descargas en la sucursal de destino. Cada reclutamiento que llevas hasta su última carrera y queda cumplido.',
          },
          {
            title: 'Qué la baja',
            body: 'Una entrega cerrada después de la hora prometida. Y un reclutamiento que aceptaste y dejaste con carreras pendientes: te comprometiste a un número de entregas y no las hiciste.',
          },
          {
            title: 'Lo que no se cuenta, a propósito',
            body: 'Quedarte sin señal no cuenta contra ti. Touno promete que si pierdes señal no quedas mal, y contarlo aquí rompería esa promesa. Rechazar una invitación tampoco cuenta: negarte a una oferta no es incumplir nada.',
          },
          {
            title: 'Qué ganas con una buena',
            body: 'Apareces antes en la lista cuando un gerente elige a quién asignarle un pedido, con tu cifra al lado. Y puedes tomar un reclutamiento de hora pico, que es exclusivo y mejor pagado: Touno fija un cumplimiento mínimo para eso.',
          },
          {
            title: 'Qué pierdes con una mala',
            body: 'Por debajo del piso que fija Touno no puedes aceptar hora pico, y la pantalla te dice que es por tu reputación y no por otra cosa. Sigues pudiendo trabajar con reclutamientos normales, y apareces más abajo en la lista del gerente.',
          },
          {
            title: 'Si recién empiezas',
            body: 'Sin historial no estás por debajo de nada. No tener récord no es tener mal récord, así que un rider nuevo puede tomar hora pico igual que cualquiera.',
          },
        ],
        gains: [
          'Tu trabajo queda probado por el escaneo, y ahora también contado.',
          'La hora pico se gana cumpliendo, no negociando.',
        ],
        limits: [
          'No puedes editar ni discutir un hecho registrado.',
          'La reputación no sustituye a las carreras: son dos cuentas distintas y las dos te aplican.',
        ],
        subject: 'rider',
        counted: [
          'entrega-a-tiempo',
          'entrega-tarde',
          'carga-entregada',
          'reclutamiento-cumplido',
          'reclutamiento-abandonado',
        ],
      },
    ],
  },
  {
    role: 'gerente-empresa',
    title: 'Manual del gerente de empresa',
    lede: 'Respondes por la marca completa: todos los locales, no uno.',
    description:
      'Cómo se administra una empresa en Touno: sucursales, catálogo, reclutamiento, finanzas y la reputación de cada local.',
    icon: 'ph-bold ph-buildings',
    chapters: [
      {
        section: 'tutorial',
        title: 'Cómo se administra una marca',
        summary:
          'La empresa es la marca y la administración; la sucursal es el lugar físico. Ese reparto es la razón de que haya dos paneles.',
        steps: [
          {
            title: 'Administras tus sucursales',
            body: 'Das de alta un local, cambias su dirección, su horario o su zona, y lo abres o lo cierras. Si eres importadora, hay una regla dura: para vender a una ciudad necesitas una sucursal en esa ciudad.',
          },
          {
            title: 'Mantienes la carta o el catálogo',
            body: 'Los artículos, las descripciones, los precios y las categorías son de la empresa. Para cada artículo decides si su precio rige igual en toda la marca o si cada sucursal tiene el suyo.',
          },
          {
            title: 'Reclutas riders',
            body: 'Invitas a un rider, eliges a qué sucursales tuyas queda asociado, la clase de reclutamiento —normal o de hora pico— y cuántas carreras le das. Eres el único que puede reclutar en hora pico para varias sucursales: una sucursal sólo puede hacerlo para sí misma.',
          },
          {
            title: 'Miras las finanzas',
            body: 'De toda la marca junta, y comparando entre sucursales con los mismos números.',
          },
          {
            title: 'Fijas los ajustes de la marca',
            body: 'El envío base de cada sucursal y el recargo por clima. Los dos tienen un mínimo universal que pone Touno, y sólo puedes subirlos desde ahí, nunca bajarlos. También registras la tarjeta de la empresa.',
          },
        ],
        gains: [
          'Una sola carta para toda la marca: cambias un precio una vez, no local por local.',
          'Contratas una vez y repartes el alcance entre las sucursales que quieras.',
          'Ves qué local no funciona sin que te lo cuenten.',
        ],
        limits: [
          'No operas el día a día: no aceptas pedidos, no asignas riders a un pedido concreto, no respondes el chat.',
          'No decides qué plato está disponible ahora mismo: eso lo marca el local.',
        ],
        counted: [],
      },
      {
        section: 'reputacion',
        title: 'La reputación de tus sucursales',
        summary:
          'La reputación es de cada sucursal, porque es la sucursal la que acepta, despacha y hace esperar. La de la marca es la suma de las suyas.',
        steps: [
          {
            title: 'De quién es la cifra',
            body: 'De cada sucursal, calculada sobre sus propios hechos. La cifra de la empresa se arma sumando los compromisos de todas ellas, no promediando sus porcentajes: una sucursal con cuatro pedidos no pesa lo mismo que una con cuatrocientos.',
          },
          {
            title: 'Qué la sube',
            body: 'Cada pedido despachado y entregado. Cada carga que sale hacia la sucursal de destino.',
          },
          {
            title: 'Qué la baja',
            body: 'Cada pedido rechazado. Cada pedido que pasó su hora prometida sin rider asignado. Cada carga que pasó su hora de salida sin llenarse. Una carga que todavía está juntando pedidos, dentro de su plazo, no cuenta en contra: eso es el producto funcionando.',
          },
          {
            title: 'Qué ganas con una buena',
            body: 'Tus sucursales aparecen antes en el escaparate público —en la portada, en Restaurantes y en Tiendas— y antes en la lista de invitaciones que ve un rider al elegir para quién trabajar.',
          },
          {
            title: 'Qué pierdes con una mala',
            body: 'Una sucursal por debajo del piso que fija Touno no puede proponer reclutamientos, ni ella ni tú en su nombre. Y no puedes esconderla: si nombras varias sucursales en un mismo reclutamiento, manda la peor de las que nombraste.',
          },
        ],
        gains: [
          'Comparas locales con la misma vara y sobre hechos, no sobre impresiones.',
          'La cifra que ve un comprador es la misma que ves tú.',
        ],
        limits: [
          'No puedes escribir ni corregir la reputación de una sucursal: se deriva.',
          'No puedes reclutar a través de una sucursal buena para cubrir una mala.',
        ],
        subject: 'sucursal',
        counted: [
          'pedido-despachado',
          'pedido-rechazado',
          'pedido-sin-rider',
          'carga-despachada',
          'carga-sin-salir',
        ],
      },
    ],
  },
  {
    role: 'gerente-sucursal',
    title: 'Manual del gerente de sucursal',
    lede: 'Respondes por un local. Eres la persona que está cuando entra el pedido.',
    description:
      'Cómo se opera una sucursal en Touno: aceptar, preparar, asignar rider, recibir cargas, escanear, y la reputación del local.',
    icon: 'ph-bold ph-storefront',
    chapters: [
      {
        section: 'tutorial',
        title: 'Cómo se opera un local',
        summary:
          'Si eres importadora, tu trabajo cambia según de qué lado del viaje estés: eres sucursal de origen y también de destino.',
        steps: [
          {
            title: 'Abres el local',
            body: 'Cuando empiezas a atender. Mientras esté cerrado no se le ofrece a nadie.',
          },
          {
            title: 'Recibes el pedido y lo aceptas o lo rechazas',
            body: 'Si lo rechazas, el comprador se entera al instante y con el motivo.',
          },
          { title: 'Lo preparas', body: 'Moviéndolo por los estados de la cocina o del depósito.' },
          {
            title: 'Asignas un rider',
            body: 'Eliges entre los riders con acuerdo aceptado en tu sucursal y que estén en turno. Hasta que lo asignas, el comprador ve «En espera de rider».',
          },
          {
            title: 'Si el comprador está en otra ciudad',
            body: 'Pones el pedido en la carga del camión que va hacia allá. El comprador ve «En espera de más pedidos», con cuántos faltan. La carga sale cuando se llena.',
          },
          {
            title: 'Recibes una carga',
            body: 'Le muestras al rider el código de recepción de esa carga —uno por carga, no por pedido— y él lo escanea. Con ese escaneo la carga queda recibida, los compradores son avisados, y el chat pasa a ti.',
          },
          {
            title: 'Entregas',
            body: 'Si el comprador eligió recojo, viene a tu mostrador y le escaneas su código. Si eligió domicilio, asignas un rider tuyo y él le escanea el código en la puerta.',
          },
          {
            title: 'Marcas qué hay y qué no',
            body: 'Si te quedaste sin un plato, lo desactivas en tu sucursal y deja de ofrecerse en tu local, sin tocar la carta de la empresa.',
          },
        ],
        gains: [
          'Una sola pantalla para el turno, con los pedidos moviéndose por estado.',
          'Asignas el rider sabiendo quién está disponible ahora y quién trabaja contigo de verdad.',
          'Recibes una carga entera con un escaneo, y el rider se lleva su constancia.',
        ],
        limits: [
          'No cambias precios ni creas artículos: la carta es de la empresa.',
          'Sí puedes reclutar, pero sólo en hora pico y sólo para tu local.',
          'No decides sobre las tarifas ni cuántos pedidos junta un camión antes de salir.',
        ],
        counted: [],
      },
      {
        section: 'reputacion',
        title: 'La reputación de tu sucursal',
        summary:
          'Es tuya y sale de lo que haces tú: aceptar, despachar, encontrar rider y mandar la carga a tiempo.',
        steps: [
          {
            title: 'Qué es',
            body: 'El porcentaje de compromisos que tu local cumplió, con de qué está hecho siempre al lado. No es una calificación del comprador: no hay estrellas ni reseñas en Touno.',
          },
          {
            title: 'Qué la sube',
            body: 'Cada pedido que despachas y llega a entregarse. Cada carga que sale hacia su destino.',
          },
          {
            title: 'Qué la baja',
            body: 'Cada pedido que rechazas. Cada pedido que pasa su hora prometida sin que le encuentres rider. Cada carga que pasa su hora de salida sin llenarse.',
          },
          {
            title: 'Qué ganas con una buena',
            body: 'Apareces antes en el escaparate público, y antes en la lista de un rider que está decidiendo con quién trabajar. Tu cifra es visible en tu página pública, así que también es un argumento.',
          },
          {
            title: 'Qué pierdes con una mala',
            body: 'Por debajo del piso que fija Touno no puedes reclutar en hora pico, y la pantalla te lo dice con el motivo. Sigues operando con los riders que ya tienen acuerdo contigo.',
          },
          {
            title: 'Lo que ves de los demás',
            body: 'Ves la reputación de cada rider al asignar, y la lista viene ordenada por ella. No ves la del comprador: la suya es sólo suya.',
          },
        ],
        gains: [
          'Un rechazo tiene un costo visible, así que aceptar de verdad vale.',
          'Tu cifra es la misma que ve el comprador y la que ve la empresa.',
        ],
        limits: [
          'No puedes escribirla ni corregirla: se deriva de tus hechos.',
          'No ves la reputación del comprador, ni siquiera en el mostrador.',
        ],
        subject: 'sucursal',
        counted: [
          'pedido-despachado',
          'pedido-rechazado',
          'pedido-sin-rider',
          'carga-despachada',
          'carga-sin-salir',
        ],
      },
    ],
  },
  {
    role: 'operador',
    title: 'Manual del operador de Touno',
    lede: 'No trabajas para un negocio: trabajas para la plataforma.',
    description:
      'Los valores universales de Touno: la comisión, los pisos de tarifa, el clima por ciudad, las carreras mínimas y el piso de reputación.',
    icon: 'ph-bold ph-graph',
    chapters: [
      {
        section: 'tutorial',
        title: 'Cómo se opera la red',
        summary:
          'Eres el único que puede tocar los valores que rigen para todas las empresas a la vez.',
        steps: [
          {
            title: 'Fijas las tarifas universales',
            body: 'La comisión de Touno, el envío base mínimo que ninguna empresa puede bajar, las tarifas por distancia y el recargo por clima.',
          },
          {
            title: 'Fijas las carreras mínimas',
            body: 'Lo menos que puede comprometer un reclutamiento, sea normal o de hora pico.',
          },
          {
            title: 'Marcas el clima de cada ciudad',
            body: 'Mientras una ciudad esté marcada como desfavorable, cada pedido a domicilio que llegue ahí paga el recargo, y ese dinero va completo al rider. Un pedido con recojo en mostrador no lo paga.',
          },
          {
            title: 'Miras la red',
            body: 'Qué empresa subió qué tarifa por encima del piso, cuántos reclutamientos de hora pico hay en curso, qué riders pueden cobrar a tarjeta de verdad, y quién está por debajo del piso de reputación.',
          },
        ],
        gains: [
          'Un piso para toda la red: subes el mínimo y todas las empresas suben con él.',
          'Ves quién cobra de más, y cuánto, sin pedirle el dato a nadie.',
        ],
        limits: [
          'No bajas el precio de nadie: los precios son de cada empresa.',
          'No operas ningún pedido, y no reclutas riders.',
        ],
        counted: [],
      },
      {
        section: 'reputacion',
        title: 'El piso de reputación',
        summary:
          'Tú no tienes reputación, porque no respondes por ningún pedido. Lo que tienes es la palanca que decide qué cuenta como suficiente.',
        steps: [
          {
            title: 'Qué mueves',
            body: 'Un solo número en Tarifas: la reputación mínima. Es el porcentaje de cumplimiento que hace falta para que una sucursal pueda reclutar y para que un rider pueda tomar hora pico.',
          },
          {
            title: 'Cuándo se aplica',
            body: 'Se lee cada vez que alguien pregunta, nunca se guarda sobre un registro. Por eso subirlo bloquea al instante a quien quede debajo, y bajarlo desbloquea igual de rápido. Es el mismo comportamiento que el envío base mínimo.',
          },
          {
            title: 'Sobre qué se calcula',
            body: 'Sobre hechos que la plataforma ya registra: escaneos que cerraron entregas, horas prometidas, reclutamientos terminados, pedidos rechazados y cargas despachadas. No hay opiniones, ni estrellas, ni reseñas en ninguna parte de Touno.',
          },
          {
            title: 'Qué queda fuera, y por qué',
            body: 'La pérdida de señal de un rider no cuenta contra nadie. Touno le promete que si pierde señal no queda mal, y un sistema de puntuación que la contara rompería esa promesa.',
          },
          {
            title: 'Qué no puedes hacer con esto',
            body: 'No puedes subir ni bajar la cifra de nadie en particular, ni borrar un hecho. El piso es universal: se mueve para todos o no se mueve.',
          },
        ],
        gains: [
          'Una sola palanca para el nivel de exigencia de toda la red.',
          'La lista de quién está debajo, en Red, sin pedírsela a nadie.',
        ],
        limits: [
          'No tienes reputación propia: no respondes por ningún pedido.',
          'No puedes corregir un hecho ni hacer una excepción para una empresa.',
        ],
        counted: [],
      },
    ],
  },
];
