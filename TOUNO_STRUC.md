# Touno — cómo funciona, contado por tipo de usuario

> **Este documento está abierto a observaciones.** Describe cómo está planteado Touno hoy, antes de
> construirlo. Si algo de lo que leas no encaja con cómo funciona tu negocio, tu trabajo o tu forma
> de comprar, eso es exactamente lo que queremos saber. Al final está cómo decírnoslo.

---

## 1. Qué es Touno

Touno es una aplicación de logística de última milla para Bolivia. Mueve dos cosas sobre una misma
red: **platos de comida** que salen de restaurantes y **mercadería** que sale de importadoras.

Para quien compra, es un solo lugar: un catálogo, un carrito, un pedido y un seguimiento, sin
importar si lo que pidió es un almuerzo que llega en veinte minutos o una caja que viaja de La Paz
a Santa Cruz.

Para quien vende y para quien reparte, es la herramienta de trabajo: quién tiene el pedido ahora
mismo, quién lo lleva después, y una prueba de que llegó.

---

## 2. Cómo está organizado

Antes de las secciones por usuario, cuatro ideas que hay que compartir. **Si alguna de estas cuatro
está mal planteada, todo lo demás hereda el error**, así que es la parte que más nos interesa que
revises.

### Empresa y sucursal

Todo negocio en Touno tiene **una empresa** y **al menos una sucursal**. No es opcional.

- La **empresa** es la marca y la administración: el catálogo, los precios, las finanzas, y las
  reglas que rigen a todas sus sucursales.
- La **sucursal** es un lugar físico con dirección: de ahí sale la comida o la mercadería, y ahí
  trabaja la gente que despacha.

Un restaurante con tres locales es una empresa con tres sucursales. Una importadora con depósito en
La Paz y en Santa Cruz es una empresa con dos sucursales.

Hoy Touno maneja dos tipos de negocio, restaurantes e importadoras. Está previsto que haya más.

### Rider

Un **rider** es quien transporta. Puede ir en moto, en auto o en camión, y **es dueño de su
vehículo y de su tiempo**.

Un rider no pertenece a Touno ni pertenece a una empresa. **Elige** para quién trabaja, y esa
elección puede ser por una sola sucursal o por un grupo de sucursales: alguien puede repartir para
dos locales de un restaurante en su zona y para ninguno más.

**Un rider es un solo tipo de usuario, aunque haya dos clases de viaje.** Quien va en moto o en
auto reparte dentro de una ciudad; quien va en camión une dos ciudades llevando varios pedidos a la
vez. Es la misma cuenta y la misma aplicación: lo que cambia es el trabajo que le llega, y lo
decide su vehículo. En la sección 4 está contado por completo.

### El reclutamiento es de dos partes

Cuando una empresa contrata a un rider, eso se llama **reclutamiento**, y un rider **nunca** queda
asignado a una sucursal sin que las dos partes hayan dicho que sí.

Puede empezar de cualquiera de los dos lados: la empresa invita al rider, o el rider se postula a
las sucursales que le interesan. En ambos casos, **la otra parte tiene que aceptar**. Si no acepta,
no hay asignación y la sucursal no le puede mandar trabajo.

**Todo reclutamiento trae puntos de carrera.** Es la cantidad de entregas que cubre, y la elige
quien recluta —con un mínimo que fija Touno para todos—. **Se descuenta un punto cada vez que un
escaneo cierra una entrega**: el del código del comprador cuando el rider llega a su puerta, y el
del código de la carga cuando un rider de camión descarga en la sucursal de destino. Cuando se
gasta el último punto el reclutamiento queda **cumplido**: esas sucursales dejan de mandarle
trabajo, y el rider queda libre.

**Hay dos clases de reclutamiento.**

- **Normal.** El rider puede tener varios a la vez, de empresas distintas, y trabajar para todas.
- **Hora pico.** Es exclusivo y por eso tiene reglas duras: un rider sólo lo puede aceptar cuando
  **no le queda ningún punto pendiente** en ningún otro reclutamiento, sólo puede tener **uno en
  toda su cuenta**, y **ninguna empresa puede reclutarlo así dos veces**, ni siquiera después de
  que lo haya cumplido.

Una **sucursal** puede reclutar en hora pico, pero **sólo para sí misma**. Si hay que cubrir dos o
más sucursales con el mismo rider, eso lo hace el gerente de empresa.

### El código del pedido

Cuando compras, Touno genera **un código** y te lo entrega en ese momento. Es tuyo, es el mismo
durante toda la vida del pedido, y es la prueba de que lo recibiste.

Lo guardas tú, en tu teléfono, como un QR. Al final del recorrido **alguien te lo escanea**: el
rider si te lo llevan a tu puerta, o el gerente de sucursal si lo recoges en el mostrador. Ese
escaneo es lo que marca el pedido como entregado. No hay otro.

Un pedido, un código. No hay códigos distintos por tramo.

Hay **un segundo código, y no es de ningún pedido**: cada **carga** de camión tiene el suyo, y
sirve para cerrar la carga entera cuando llega a la sucursal de destino. Empieza con `RC-` en vez
de `TO-` justamente para que no se confundan. Tu código sigue siendo tuyo y sólo tuyo.

---

## 3. Compradores

### Quién eres

Pides comida a un restaurante de tu ciudad, o mercadería a una importadora que puede estar en tu
ciudad o en otra.

### Qué haces en Touno, paso a paso

1. **Exploras.** Ves restaurantes e importadoras. Puedes filtrar por ciudad y buscar por nombre.
   Cada negocio tiene su ficha, y dentro puedes ver **cada sucursal** con su dirección, su horario y
   su zona.
2. **Armas tu carrito.** Un solo carrito, aunque mezcles comida y mercadería.
3. **Eliges cómo lo quieres recibir.** Aquí hay una sola decisión, y sólo aparece cuando compras a
   una importadora que está en otra ciudad:
   - **Entrega a domicilio** — llega hasta la dirección que marques.
   - **Recojo en sucursal** — llega hasta la sucursal de esa importadora en tu ciudad, y vas a
     recogerlo tú.

   Si compras comida, o si compras a una importadora de tu misma ciudad, no hay nada que elegir:
   llega a tu dirección.

   Si va a tu dirección, también **eliges tu zona**. No es un trámite: de ahí sale lo que pagas de
   envío, que se mide entre la sucursal y tu zona.

4. **Confirmas.** Touno te entrega el código del pedido en ese mismo momento.

### Qué pagas, y por qué

Antes de confirmar ves **cuatro líneas separadas**, no un total sin explicación:

| Línea                   | Qué es                                                              | A quién va          |
| ----------------------- | ------------------------------------------------------------------- | ------------------- |
| **Productos**           | El precio que puso el negocio                                       | Al negocio, íntegro |
| **Comisión de Touno**   | El 15 % de lo que cuestan los productos                             | A Touno             |
| **Envío por distancia** | Sólo si pides a domicilio. Se mide entre la sucursal y tu zona      | Al rider            |
| **Recargo por clima**   | Sólo si pides a domicilio y el clima de tu ciudad está desfavorable | Al rider            |

Tres cosas que conviene decir sin rodeos:

- **El negocio cobra su precio completo.** La comisión se suma encima, no se le descuenta a él.
- **Si recoges en mostrador no pagas envío ni clima**, porque nadie salió a tu puerta. _(Y aquí
  queremos tu opinión: eso vale también cuando un camión cruzó el país para traerlo. ¿Te parece
  bien, o el viaje entre ciudades debería cobrarse aparte?)_
- **En el carrito el envío aparece como «desde»**, porque todavía no elegiste tu zona. La cifra
  exacta la ves en el paso siguiente.

5. **Sigues tu pedido.** En la ficha del pedido ves en qué punto está y qué falta.
6. **Hablas con quien lo tiene.** Un chat, siempre el mismo, dentro del pedido.
7. **Recibes y te escanean el código.** Ahí termina.

### Qué ves mientras tu pedido viaja

La ficha de tu pedido tiene una línea de tiempo con los pasos cumplidos y los que faltan, y encima
un estado en palabras. Los estados que vas a ver:

- **En espera de rider** — el pedido está hecho y aceptado, pero la sucursal todavía no le asignó
  un rider.
- **En espera de más pedidos** — sólo en compras a otra ciudad. Tu paquete está en la sucursal de
  origen esperando a que el camión se llene. Te decimos cuántos pedidos faltan, por ejemplo _3 de 6_.
- **En camino** — hay un rider moviéndose con tu pedido, y **ves el mapa**.
- **En ruta** — el camión va entre ciudades, y también lo ves en el mapa.
- **En sucursal de destino** / **Listo para recoger** — llegó a tu ciudad.
- **Entregado** — te escanearon el código.

**El mapa** aparece en el momento en que se asigna un rider y se apaga cuando te escanean el
código. Muestra el recorrido y la posición del rider.

**Si el rider se queda sin señal**, el mapa no se congela sin avisar: el último punto conocido queda
marcado como **"Última conexión registrada"**, con la hora. Cuando el rider recupera señal, el mapa
vuelve a moverse solo. No tienes que hacer nada.

### El chat, y por qué cambia de interlocutor

Tienes **un solo chat por pedido**. No una conversación por persona: una sola.

Con quien hablas es **con quien tiene tu pedido en las manos en ese momento**. A veces es un rider.
A veces es el gerente de una sucursal.

Cuando tu pedido cambia de manos, el chat **te lo dice dentro de la conversación**, con una línea
del sistema. Por ejemplo: _"Tu pedido llegó a la sucursal Santa Cruz Norte. Ahora hablas con Elena
Rojas, gerente de sucursal."_ Así nunca escribes al vacío ni te preguntas por qué te contesta otra
persona.

### Qué ves en la ficha de tu pedido

Depende de por dónde va tu pedido, y esto es a propósito: la ficha te dice **quién responde por él**.

| Tu compra                          | En la ficha ves                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| A un restaurante                   | La sucursal que lo prepara y el nombre del rider que lo lleva                                                       |
| A una importadora de tu ciudad     | Lo mismo: la sucursal y el rider                                                                                    |
| A otra ciudad, recojo en sucursal  | La sucursal de origen, el rider que hizo el viaje, y la sucursal de tu ciudad donde lo recoges                      |
| A otra ciudad, entrega a domicilio | La sucursal de origen, el rider que hizo el viaje, la sucursal de tu ciudad, y el rider que te lo lleva a la puerta |

### Qué ganas

- **Un solo lugar** para el almuerzo y para la encomienda, con un carrito y una forma de seguirlo.
- **Saber dónde está**, en mapa, sin llamar a nadie.
- **Poder preguntar** sin buscar un número de teléfono, y sin que te pasen de una persona a otra sin
  explicación.
- **Un código que es tuyo desde el principio** y que nadie más puede usar para cerrar tu pedido.
- **Elegir**, cuando compras a otra ciudad, entre que te lo lleven o ir a buscarlo.

### Qué no puedes hacer, y quién sí

- **No eliges el rider.** Lo asigna la sucursal que despacha.
- **No puedes comprar a una importadora de otra ciudad si esa importadora no tiene sucursal en tu
  ciudad.** No aparecerá disponible para ti. Es la regla que hace posible el recojo y la entrega
  local.
- **No cambias el destino** una vez que el pedido salió. Eso lo tiene que resolver la sucursal.

---

## 4. Riders

### Quién eres

Transportas con tu propio vehículo. Puede ser una moto, un auto o un camión. Decides para quién
trabajas y cuándo estás disponible.

### La diferencia entre moto/auto y camión

Es la única diferencia entre riders, y define el trabajo que te llega:

- **Moto o auto** → **reparto urbano**. Llevas un pedido desde una sucursal hasta la puerta del
  comprador, dentro de la misma ciudad.
- **Camión** → **carga interurbana**. Llevas **varios pedidos a la vez** desde la sucursal de una
  ciudad hasta la sucursal de otra ciudad de la misma empresa.

No son dos tipos de cuenta ni dos aplicaciones: es el mismo perfil, y tu vehículo determina qué
encargos recibes.

### Qué haces en Touno, paso a paso

Los dos primeros pasos son iguales para todos. Del tercero en adelante, esto es el **reparto
urbano**; si llevas camión, tu recorrido es el de la sección siguiente.

1. **Te reclutan, o te postulas tú.** Dos caminos, y valen los dos:
   - Te llega una **invitación** de una empresa, y la aceptas o la rechazas.
   - **Te postulas** tú a una sucursal o a un grupo de sucursales, y esperas su respuesta.

   Mientras no haya un sí de las dos partes, esa sucursal no te puede mandar trabajo. Puedes tener
   varios reclutamientos normales con varias empresas al mismo tiempo.

   Cada reclutamiento viene con sus **puntos de carrera**, y los ves antes de aceptar.

2. **Te pones en turno** cuando quieras trabajar.
3. **Recibes un encargo** de una de tus sucursales, con el punto de recojo, el destino y **cuánto
   ganas, antes de aceptar**. Aceptas o rechazas.
4. **Recoges** en la sucursal.
5. **Vas.** Desde ese momento el comprador ve tu recorrido en el mapa y puede escribirte por el chat
   del pedido.
6. **Escaneas el código del comprador** al llegar. Eso cierra el pedido **y te descuenta un punto
   de carrera** del reclutamiento que cubre esa sucursal.

### Tus puntos de carrera

Los puntos son **la cuenta de lo que te falta cumplir**. Bajan de a uno, con cada escaneo que cierra
una entrega tuya, y cuando llegan a cero ese reclutamiento queda **cumplido**: esas sucursales
dejan de mandarte trabajo y tú quedas libre.

Sirven para una cosa concreta: **mientras te quede un punto pendiente, en cualquier reclutamiento,
no puedes aceptar uno de hora pico**. Un reclutamiento de hora pico es exclusivo —sólo puedes tener
uno en toda tu cuenta, y una misma empresa no puede dártelo dos veces—, así que Touno se asegura de
que no lo tomes con trabajo a medias.

En **Acuerdos** ves cuántos puntos te quedan en total, y si una invitación de hora pico está
bloqueada te decimos **por qué**, no sólo que no se puede.

### Cómo cobras

Por defecto, lo que ganas te llega **a tu cuenta**, como siempre. Si prefieres, puedes **registrar
una tarjeta** y pedir que te paguen ahí. Es opcional, y lo decides tú.

Para que funcione hacen falta las dos tarjetas: la tuya y la de la empresa o sucursal que te
reclutó. **Si a ella le falta, cobras por depósito y te lo decimos en pantalla**, empresa por
empresa, para que sepas con quién sí y con quién no.

Esta maqueta **no pide el número completo de tu tarjeta**: guarda la marca, los últimos cuatro
dígitos, el titular y el vencimiento, y nada más.

### Si llevas camión

**No sales con un pedido, sales con una carga**, y **nunca escaneas el código de un comprador**.
Ésas son las dos diferencias, y la segunda importa: el código del comprador lo escanea quien se lo
entrega en mano, y tú entregas a una sucursal, no a una persona.

1. La sucursal de origen va poniendo pedidos en tu carga.
2. **Esperas a que se complete.** Ves cuántos pedidos llevas y cuántos faltan. **No puedes salir
   hasta que esté llena**: es la razón de ser del viaje, llevar varios de una vez.
3. **Sales.** En ese momento, todos los compradores de esa carga dejan de ver «En espera a más
   pedidos» y empiezan a verte avanzar en su mapa. El chat de cada uno pasa a ti, y a cada uno se
   le explica por qué.
4. **Descargas en la sucursal de destino, y ahí sí escaneas: el código de la carga.** El gerente
   te lo muestra en su pantalla, tú lo escaneas, y con eso la carga queda recibida, cada comprador
   es avisado y **se te descuenta un punto de carrera**. Un escaneo por carga, no uno por pedido.
   Es tu constancia de que entregaste, que antes no tenías.
5. Ahí termina tu parte. Lo que pase después —que el comprador lo recoja en mostrador, o que otro
   rider se lo lleve a su casa— ya no es tuyo, y el chat pasa a quien corresponda.

### Qué pantallas tienes

- **Turno** — te pones disponible, ves lo del día y lo que tienes en curso.
- **Encargos** — el encargo que te ofrecen, con la ganancia por delante, y el encargo activo con su
  mapa, su chat y el escaneo.
- **Cargas** — sólo si llevas camión: tus cargas, cuánto les falta para salir y qué llevan.
- **Acuerdos** — invitaciones que te llegaron, postulaciones que enviaste, con qué sucursales estás
  trabajando hoy, cuántos puntos de carrera te quedan y cuáles ya cumpliste.
- **Ganancias** — lo que llevas ganado, por día y por periodo, y dónde quieres que te lo paguen.

### Qué ganas

- **Eliges para quién trabajas**, y a qué sucursales concretas. No te asignan a una empresa entera
  si sólo te sirven dos locales.
- **Nadie te asigna sin tu sí.** El acuerdo es de dos partes, siempre.
- **Sabes cuánto ganas antes de aceptar**, no después, y **cuántas entregas te compromete**.
- **Tu trabajo queda probado.** El escaneo del código es la constancia de que entregaste, y ahora
  también la tienes cuando llevas camión.
- **Eliges dónde cobrar.** A tu cuenta o a tu tarjeta, y si algo lo impide se te dice cuál es.
- **Si pierdes señal no quedas mal.** El sistema muestra tu última conexión con su hora, en vez de
  aparentar que dejaste de moverte.

### Qué no puedes hacer, y quién sí

- **No te asignas encargos tú mismo.** Los asigna el gerente de la sucursal.
- **No trabajas para una sucursal sin acuerdo aceptado**, aunque estés al lado.
- **No cierras un pedido sin escanear el código del comprador.** No hay forma de marcarlo entregado
  a mano. Si llevas camión no escaneas nunca el código de un comprador: el tuyo es el de la carga.
- **No aceptas un reclutamiento de hora pico con puntos pendientes**, ni un segundo de hora pico, ni
  uno de una empresa que ya te reclutó así antes.
- **No decides cuándo sale tu camión.** Sale cuando se llena, y cuántos pedidos hacen falta lo fija
  la empresa.

---

## 5. Gerente de empresa de restaurantes

### Quién eres

Respondes por la marca completa: todos los locales, no uno.

### Qué haces en Touno, paso a paso

1. **Administras tus sucursales.** Das de alta un local nuevo, cambias su dirección, su horario o su
   zona, y lo abres o lo cierras.
2. **Mantienes la carta.** Los platos, las descripciones, los precios y las categorías son de la
   empresa. Para cada artículo decides si su precio **rige igual en toda la marca** o si **cada
   sucursal tiene el suyo**; en los dos casos los escribes tú. Al ponerlo, Touno te avisa qué se le
   suma encima al comprador.
3. **Reclutas riders.** Invitas a un rider, **eliges a qué sucursales tuyas queda asociado**, la
   clase de reclutamiento —normal o de hora pico— y **cuántos puntos de carrera le das**. Ves quién
   aceptó, quién está pendiente y quién se postuló a ti. Si un rider no puede tomar hora pico ahora,
   la pantalla te dice por qué.
4. **Miras las finanzas** de toda la marca junta, y comparas entre sucursales.
5. **Fijas los ajustes** que rigen para todos: el **envío base de cada sucursal** y el **recargo por
   clima** de la marca. Los dos tienen un mínimo universal que pone Touno, y **sólo puedes subirlos
   desde ahí, nunca bajarlos**. También registras **la tarjeta de la empresa**, que es lo que
   permite pagar a la tarjeta de un rider que eligió cobrar así.

### Qué pantallas tienes

Resumen de la empresa · Sucursales · Carta · Riders · Finanzas · Ajustes.

### Qué ganas

- **Una sola carta** para toda la marca. Cambias un precio una vez, no local por local.
- **Comparas sucursales** con los mismos números y en la misma pantalla.
- **Contratas una vez y repartes el alcance.** Un rider aceptado puede cubrir dos locales o los
  ocho, y eso lo decides tú.
- **Un precio por marca o uno por local, y lo eliges artículo por artículo.** No tienes que elegir
  una sola política para todo el catálogo.
- **Eres el único que puede reclutar en hora pico para varias sucursales.** Una sucursal sólo puede
  hacerlo para sí misma.
- **Ves lo que no funciona** sin que te lo cuenten: qué local rechaza pedidos, cuál se queda sin
  riders.

### Qué no puedes hacer, y quién sí

- **No operas el día a día.** No aceptas pedidos, no asignas riders a un pedido concreto, no
  respondes el chat. Eso es del gerente de sucursal.
- **No decides qué plato está disponible ahora mismo.** Un local puede quedarse sin pollo un martes,
  y eso lo marca el local.

---

## 6. Gerente de sucursal de restaurantes

### Quién eres

Respondes por un local. Es la persona que está cuando entra el pedido.

### Qué haces en Touno, paso a paso

1. **Abres el local** cuando empiezas a atender.
2. **Recibes el pedido** y lo aceptas o lo rechazas. Si lo rechazas, el comprador se entera al
   instante y con el motivo.
3. **Lo preparas**, moviéndolo por los estados de la cocina.
4. **Asignas un rider.** Eliges entre los riders con acuerdo aceptado en **tu** sucursal y que estén
   en turno. Hasta que lo asignas, el comprador ve _En espera de rider_.
5. **El rider recoge y sale.** A partir de ahí el mapa y el chat son entre el comprador y el rider,
   y tú los sigues desde el pedido.
6. **Marcas qué hay y qué no.** Si te quedaste sin un plato, lo desactivas en tu sucursal y deja de
   ofrecerse en tu local, sin tocar la carta de la empresa.

### Qué pantallas tienes

Pedidos (el tablero del día) · Ficha del pedido · Escanear · Disponibilidad de la carta ·
Tus riders, con el reclutamiento de hora pico · Historial · Métricas de tu local · Ajustes de tu
local, con la tarjeta de la sucursal.

### Qué ganas

- **Una sola pantalla para el turno**, con los pedidos moviéndose por estado.
- **Asignas el rider sabiendo quién está disponible ahora** y quién trabaja contigo de verdad.
- **Cortas de raíz el "¿ya salió?"**: el comprador lo ve solo.
- **Desactivas un plato en segundos** sin pedir permiso ni llamar a nadie.

### Qué no puedes hacer, y quién sí

- **No cambias precios ni creas platos.** La carta es de la empresa, incluso cuando tu local tiene
  un precio distinto del de las otras sucursales: ese número también lo escribe la empresa, y tú lo
  ves para confirmarlo.
- **Sí puedes reclutar, pero sólo en hora pico y sólo para tu local.** Es la respuesta a la duda que
  este documento planteaba antes. Para todo lo demás sigues trabajando con quien ya tiene
  reclutamiento aceptado, y las invitaciones normales las manda la empresa.
- **No decides sobre las tarifas.** El envío base y el recargo por clima los fija la empresa, sobre
  el mínimo de Touno.
- **No abres ni cierras otras sucursales.**

---

## 7. Gerente de empresa de importadoras

### Quién eres

Respondes por la importadora completa: el catálogo y **la red de sucursales**, que en este negocio
es lo que define hasta dónde puedes vender.

### Qué haces en Touno, paso a paso

1. **Administras tus sucursales por ciudad.** Aquí hay una regla dura que conviene entender bien:

   > **Para vender a una ciudad, necesitas una sucursal en esa ciudad.**

   Si tu depósito está en La Paz y quieres vender en Santa Cruz, necesitas una sucursal en Santa
   Cruz. Es lo que permite que la mercadería tenga a dónde llegar, que el comprador pueda ir a
   recogerla, y que haya alguien que le entregue en mano. Sin sucursal en destino, esa ciudad no ve
   tus productos.

2. **Mantienes el catálogo.** Artículos, precios y categorías. Igual que en un restaurante, para
   cada artículo eliges si el precio **rige en toda la marca** o si **cada sucursal tiene el suyo**,
   que es lo normal cuando traer algo a Santa Cruz no cuesta lo mismo que traerlo a La Paz.
3. **Reclutas riders, de los dos tipos.** Los de moto y auto reparten en ciudad. **Los de camión
   son los que unen tus sucursales entre ciudades**, y sin ellos tu mercadería no sale de su ciudad
   de origen.
4. **Defines cuándo sale un camión**: cuántos pedidos tiene que juntar una carga antes de partir.
   Ése es el número que el comprador ve como _3 de 6_.
5. **Miras las finanzas** de la empresa y el movimiento entre ciudades.

### Qué pantallas tienes

Resumen de la empresa · Sucursales · Catálogo · Riders · Finanzas · Ajustes.

### Qué ganas

- **Vendes fuera de tu ciudad** con una operación propia, sin depender de terceros.
- **Un catálogo, muchas ciudades.**
- **Controlas el punto de equilibrio del camión**: mandas lleno, no vacío, y el comprador sabe por
  qué espera.
- **Ves tu red de un vistazo**: qué ciudades cubres y cuáles no.

### Qué no puedes hacer, y quién sí

- **No despachas ni recibes.** Eso lo hace cada sucursal.
- **No vendes a una ciudad donde no tienes sucursal.**
- **No asignas un rider a un pedido concreto.** Lo hace la sucursal que despacha.

---

## 8. Gerente de sucursal de importadoras

### Quién eres

Respondes por un depósito o local. **Tu trabajo cambia según de qué lado del viaje estés**, y es la
única sección donde una misma persona hace dos papeles distintos.

### Papel 1 — eres la sucursal de origen

El pedido salió de tu depósito.

1. **Recibes el pedido** y lo aceptas.
2. **Lo preparas.**
3. Si el comprador está **en tu ciudad**: asignas un rider de moto o auto y se lo lleva a la puerta.
   Igual que un restaurante.
4. Si el comprador está **en otra ciudad**: pones el pedido en la **carga** del camión que va hacia
   esa ciudad. Desde ese momento el comprador ve _En espera de más pedidos_, con cuánto falta.
5. Cuando la carga se completa, **sale** con su rider de camión.

### Papel 2 — eres la sucursal de destino

Llegó un camión a tu ciudad con pedidos de compradores de aquí.

1. **Recibes la carga.** Le **muestras al rider el código de recepción** de esa carga —uno por
   carga, no por pedido— y él lo escanea. Con ese escaneo la carga queda recibida y los compradores
   son avisados, todo de una vez.
2. En ese momento **el comprador es notificado** de que su pedido está en tu sucursal, y **el chat
   pasa a ti**: si te escribe, te escribe a ti, y la conversación se lo explica.
3. Ahora depende de lo que el comprador eligió al comprar:
   - **Eligió recojo en sucursal** → viene a tu mostrador y **le escaneas su código**. Entregado.
   - **Eligió entrega a domicilio** → **asignas un rider tuyo** de moto o auto, y él se lo lleva y
     le escanea el código en la puerta. El chat vuelve a pasar al rider, y el comprador lo ve.

### Qué pantallas tienes

Pedidos · Ficha del pedido · **Entradas** (las cargas que llegan a tu sucursal, con su código de
recepción) · Escanear · Disponibilidad del catálogo · Tus riders, con el reclutamiento de hora
pico · Historial · Métricas · Ajustes, con la tarjeta de la sucursal.

### Qué ganas

- **Sabes qué viene antes de que llegue**, y qué de eso se va a quedar esperando en mostrador.
- **Recibes una carga entera con un escaneo**, y el rider que la trajo se lleva su constancia.
- **El comprador ya está avisado** cuando su pedido llega a tu sucursal. No tienes que llamar.
- **El escaneo cierra el pedido y deja constancia.** Se acabó el cuaderno.
- **Un solo lugar** para las dos mitades del trabajo, salir y recibir.

### Qué no puedes hacer, y quién sí

- **No entregas sin escanear el código del comprador.** El de la carga es otro y sirve para otra
  cosa: cerrar la carga, no un pedido.
- **No cambias precios ni el catálogo.** Es de la empresa, incluso el precio propio de tu sucursal.
- **Sí puedes reclutar en hora pico, pero sólo para tu sucursal.**
- **No decides cuántos pedidos junta un camión antes de salir.** Ese número lo fija la empresa.

---

## 9. Operador de Touno

### Quién eres

No trabajas para un negocio: trabajas para la plataforma. Eres el único que puede tocar los valores
que rigen para **todas** las empresas a la vez.

### Qué haces en Touno, paso a paso

1. **Fijas las tarifas universales.** La comisión de Touno, el **envío base mínimo** que ninguna
   empresa puede bajar, las tarifas por distancia y el **recargo por clima**. También el **mínimo de
   puntos de carrera** que puede dar un reclutamiento.
2. **Marcas el clima de cada ciudad.** Mientras una ciudad esté marcada como desfavorable, cada
   pedido a domicilio que llegue ahí paga el recargo, y ese dinero va completo al rider. Un pedido
   con recojo en mostrador no lo paga.
3. **Miras la red.** Qué empresa subió qué tarifa por encima del piso, cuántos reclutamientos de
   hora pico hay en curso, y qué riders pueden cobrar a tarjeta de verdad.

### Qué pantallas tienes

Tarifas · Clima · Red.

### Qué ganas

- **Un piso para toda la red.** Subes el mínimo y todas las empresas suben con él, sin tener que
  tocar ninguna una por una.
- **Ves quién cobra de más**, y cuánto, sin pedirle el dato a nadie.
- **El clima deja de ser una excusa**: o está marcado y se cobra, o no lo está y no se cobra.

### Qué no puedes hacer, y quién sí

- **No bajas el precio de nadie.** Los precios son de cada empresa.
- **No operas ningún pedido.** No aceptas, no asignas, no escaneas y no entras a ningún chat.
- **No reclutas riders.** Los riders eligen para quién trabajan, y Touno no es una de las opciones.

---

## 10. Los cuatro recorridos de un pedido

Los mismos hechos de arriba, ahora en orden y diciendo **quién ve qué** en cada paso.

### Recorrido A — Comida, misma ciudad

| Paso               | Comprador                     | Sucursal              | Rider                                 |
| ------------------ | ----------------------------- | --------------------- | ------------------------------------- |
| Compra             | Recibe su código              | Le entra el pedido    | —                                     |
| La sucursal acepta | Ve _Aceptado_                 | Lo pasa a cocina      | —                                     |
| Preparando         | Ve _Preparando_               | Cocina                | —                                     |
| Sin rider aún      | Ve **En espera de rider**     | Busca a quién asignar | —                                     |
| Asignan al rider   | **Empieza el mapa** y el chat | Sigue el pedido       | Recibe el encargo con su ganancia     |
| El rider recoge    | Ve el recorrido en vivo       | —                     | Va en camino                          |
| Llega              | Muestra su código             | —                     | **Escanea**                           |
| Fin                | Ve _Entregado_                | Entra al historial    | Suma a sus ganancias y gasta un punto |

### Recorrido B — Importadora, misma ciudad

Idéntico al recorrido A. Cambia lo que va en la caja, no el camino.

### Recorrido C — Importadora, otra ciudad, **recojo en sucursal**

| Paso               | Comprador                                     | Sucursal de origen        | Rider de camión                                   | Sucursal de destino                                       |
| ------------------ | --------------------------------------------- | ------------------------- | ------------------------------------------------- | --------------------------------------------------------- |
| Compra             | Elige _recojo en sucursal_ y recibe su código | Le entra el pedido        | —                                                 | —                                                         |
| Aceptan y preparan | Ve el avance                                  | Prepara                   | —                                                 | —                                                         |
| Entra a la carga   | Ve **En espera de más pedidos · 3 de 6**      | Suma el pedido a la carga | Ve crecer su carga                                | —                                                         |
| La carga sale      | **Empieza el mapa**                           | —                         | En ruta                                           | Ve que viene                                              |
| Llega a destino    | Es **notificado**: está en su sucursal        | —                         | **Escanea el código de la carga** y suma un punto | **Se lo muestra**, recibe la carga, y el chat pasa a ella |
| Va al mostrador    | Muestra su código                             | —                         | —                                                 | **Escanea**                                               |
| Fin                | Ve _Entregado_                                | —                         | —                                                 | Entra al historial                                        |

### Recorrido D — Importadora, otra ciudad, **entrega a domicilio**

Igual que el C hasta que llega a destino. Desde ahí:

| Paso                | Comprador                                                      | Sucursal de destino                       | Rider local                           |
| ------------------- | -------------------------------------------------------------- | ----------------------------------------- | ------------------------------------- |
| Llega a destino     | Es notificado; **el chat pasa a la sucursal**                  | Muestra el código de la carga y la recibe | —                                     |
| Asignan rider local | Ve **En espera de rider**, luego **el chat vuelve a un rider** | Elige entre sus riders                    | Recibe el encargo                     |
| Va en camino        | **Mapa otra vez**                                              | Sigue el pedido                           | Va                                    |
| Llega               | Muestra su código                                              | —                                         | **Escanea**                           |
| Fin                 | Ve _Entregado_                                                 | Entra al historial                        | Suma a sus ganancias y gasta un punto |

Este es el recorrido donde el chat cambia de interlocutor **dos veces**: rider de camión →
sucursal de destino → rider local. Cada cambio se explica dentro de la conversación.

---

## 11. Qué pasa cuando algo sale mal

Esta sección existe porque es donde más observaciones esperamos. Son los casos que rompen la
promesa de "lo ves todo el tiempo".

**El rider pierde señal en medio del viaje.**
El mapa no se congela en silencio ni borra al rider. El último punto conocido queda marcado como
**"Última conexión registrada"**, con la hora. Cuando el rider recupera señal, el punto vuelve a
moverse solo, sin que nadie toque nada. Preferimos decir "no sé dónde está desde las 14:22" antes
que fingir que sigue avanzando.

**El camión no se llena.**
El pedido se queda en la sucursal de origen y el comprador ve **En espera de más pedidos**, con
cuántos faltan. No decimos "en tránsito" cuando no se movió. _(Aquí queremos tu opinión: ¿debería
haber un tiempo máximo de espera después del cual el camión sale igual?)_

**La sucursal rechaza el pedido.**
El comprador se entera al instante, con el motivo, y el pedido queda cerrado como rechazado.

**Ningún rider acepta el encargo.**
El pedido se queda en **En espera de rider** y la sucursal lo ve marcado como pendiente de asignar.
No se pierde ni se cancela solo.

**El comprador no aparece a recoger su pedido.**
El pedido se queda en la sucursal como _Listo para recoger_. _(Todavía no está definido cuánto
tiempo se guarda ni qué pasa después. Es una decisión que nos gustaría tomar con tu ayuda.)_

---

## 12. Qué no hace Touno todavía

Dicho sin rodeos, porque una lista honesta de límites sirve más que una lista de promesas.

- **Ya se puede administrar buena parte de lo que antes venía puesto.** Se pueden escribir los
  precios —de marca o por sucursal—, subir el envío base de cada local y el recargo por clima,
  reclutar con su clase y sus puntos, registrar una tarjeta y cambiar los valores universales de
  Touno. Lo que **todavía** no se puede crear ni editar es: **los artículos del catálogo** en sí,
  **la dirección y el horario de una sucursal**, y **cuántos pedidos tiene que juntar una carga
  antes de salir**. Esos datos se ven en pantalla, se explica de quién son, y por ahora vienen
  puestos.
- **El dinero se calcula, pero no se cobra.** Verás el desglose completo de lo que paga el comprador
  y a quién va cada parte, y podrás registrar tarjetas. Lo que no hay es una pasarela de pago: nada
  se cobra ni se transfiere de verdad. **La tarjeta no pide el número completo**, sólo la marca, los
  últimos cuatro dígitos, el titular y el vencimiento.
- **El envío se mide sobre el plano esquemático del mapa, no en kilómetros.** Las distancias son
  coherentes entre sí y sirven para ver cómo se comporta la tarifa, pero no son una medida real.
- **No hay cuentas ni contraseñas.** Lo que existe hoy es una maqueta navegable: se entra eligiendo
  un perfil, para poder recorrer y opinar. Verás **ocho perfiles de ejemplo para siete tipos de
  usuario**, porque hay dos riders: uno en moto y uno en camión. No son dos tipos de usuario
  distintos — es el mismo perfil con distinto vehículo, y están los dos para que puedas ver las dos
  clases de viaje sin cambiar de aplicación.
- **No hay devoluciones ni cancelaciones** una vez que el pedido salió.
- **No hay pedidos programados** para una hora futura.
- **No hay calificación del rider por parte del comprador.**
- **El mapa es esquemático**, no cartografía real con nombres de calles.
- **Sólo hay dos tipos de negocio**, restaurantes e importadoras. Está previsto sumar más.
- **No hay reparto entre ciudades sin sucursal en destino.** Es una decisión de diseño, no una
  limitación temporal: es lo que hace posible el recojo y la entrega local.
- **El viaje entre ciudades no se cobra aparte cuando el comprador recoge en mostrador.** Bajo la
  regla acordada, el envío por distancia y el recargo por clima sólo se cobran a domicilio. Está
  hecho así a propósito y es de las cosas que más queremos que nos digas si está bien.

---

## 13. Cómo dejar una observación

Lo más útil que puedes decirnos no es "me gusta" o "no me gusta", sino **dónde esto no se parece a
tu realidad**. Por ejemplo:

- "En mi negocio el local **sí** contrata a sus propios repartidores, la empresa no se mete."
- "Un rider mío trabaja para tres empresas el mismo día y eso aquí no se ve."
- "Nadie va a esperar a que se llene un camión; yo mando lo que haya cada mañana a las 8."
- "Mis clientes no tienen teléfono con cámara para el QR."
- "Falta un tipo de usuario: el que sólo atiende el mostrador y no administra nada."
- "El 15 % me parece mucho / poco, y así es como lo cobra la competencia."
- "Los puntos de carrera no encajan: mis repartidores entran y salen, no se comprometen por veinte
  entregas."
- "En hora pico yo necesito al rider en dos locales, no en uno."
- "Cobrar por clima me va a espantar clientes justo el día que más pedidos entran."

Si algo de lo que leíste te hizo pensar _"eso no funciona así"_, escríbelo tal cual. Esa frase vale
más que un formulario completo.

---

_Este documento está en español a propósito: describe el negocio para quienes lo van a usar en
Bolivia, no para quienes lo programan. La documentación técnica del proyecto está en inglés._
