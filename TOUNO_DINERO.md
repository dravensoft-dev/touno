# Touno y el dinero: qué se cobra, qué se descuenta y quién lo paga

> Este documento es el hermano de `TOUNO_STRUC.md` y está en español por la misma razón: describe el negocio para quienes lo van a usar en Bolivia. Aquel cuenta cómo funciona Touno; éste cuenta de dónde sale el dinero y a dónde va. Si algo de aquí te parece mal, dilo: la última sección explica cómo.

---

## 1. Lo único que cobra Touno

**Una comisión del 15 % sobre el precio de los productos, y nada más.**

Se le cobra al comprador **encima** del precio del negocio, no se le descuenta al negocio. El negocio cobra su precio completo, siempre. Esto tiene una consecuencia que conviene entender antes de seguir, porque de ella depende todo lo demás:

- **El envío por distancia y el recargo por clima no son de Touno.** Van completos al rider.
- **Touno no se queda con una parte del envío.** No hay un reparto escondido entre lo que paga el comprador por el envío y lo que cobra el rider.
- **La comisión es la misma para todas las empresas**, sea cual sea su tamaño y sea cual sea su plan. Se fija en una sola pantalla y rige para toda la red.

---

## 2. Las promociones

### Las paga el negocio, enteras

Ésta es la regla y no tiene excepciones. **Touno no financia ningún descuento.** Está en una etapa temprana y no tiene fondos para hacerlo, y decirlo claro es mejor que fingir un reparto que no existe.

De ahí salen dos cosas que verás en pantalla:

- **La comisión se calcula sobre el precio sin descontar.** Si vendes algo en Bs 100 y das Bs 10 de descuento, el comprador paga Bs 90 de productos, pero la comisión sigue siendo Bs 15. Touno cobra lo mismo con promoción y sin ella.
- **El descuento sale de tu neto**, y aparece con esa palabra en tu pantalla de Finanzas: una columna **Promociones** en cada liquidación y una línea **Promociones que financiaste**, restando. La misma cifra la tienes arriba de Promociones, en una tarjeta que dice **Lo que llevas financiado**.

_(Y aquí queremos tu opinión: la alternativa sería que Touno pusiera una parte, y que la comisión bajara con el descuento. Hoy no se puede, pero queremos saber si te parece que debería ser así cuando se pueda.)_

### Los tres tipos que puedes escribir

| Tipo                        | Qué descuenta                             | Ejemplo                         |
| --------------------------- | ----------------------------------------- | ------------------------------- |
| **Monto fijo**              | Bolivianos del precio de los productos    | Bs 10 de descuento en combos    |
| **Porcentaje de productos** | Una parte del precio, con tope si quieres | 20 % de la carta, hasta Bs 25   |
| **Porcentaje del envío**    | Una parte del envío por distancia         | Mitad del envío, o envío gratis |

Cada una lleva un código que el comprador teclea al confirmar, un tope de usos y una fecha de vencimiento. Cuando se agota o se vence, deja de descontar sola, sin que tengas que apagarla.

**Dónde se ve.** Los tres los eliges al escribir una promoción, en Promociones, Crear, en el desplegable «Qué descuenta», y una columna con ese mismo nombre los repite en Promociones, Para compradores. El comprador los lee en el selector que está arriba de la ficha de cada negocio, y el que aplicó le aparece al confirmar como una línea **Descuento**, aparte de las otras. Las promociones que la maqueta trae puestas, con su código y su estado, están en la sección 13 de `TOUNO_STRUC.md`.

**Una promoción de envío no aplica a un recojo en mostrador**, porque ahí no hay envío que descontar, y la pantalla se lo dice al comprador con ese motivo y no con otro.

### Por qué un comprador puede ver rechazado su código

Ocho motivos, y cada uno se nombra por separado, porque «no se pudo aplicar» no le sirve a nadie:

- **Ese código no existe.**
- **Está apagada** por el negocio.
- **Ya venció.**
- **Llegó a su tope de usos.**
- **Es de otro negocio**, y en tu carrito no hay nada suyo.
- **Descuenta el envío y tú recoges en mostrador**, así que no hay envío que descontar.
- **No descuenta nada al comprador**, porque es un trato entre el negocio y sus riders.
- **Pide una reputación más alta que la tuya**, que es el caso de la sección siguiente.

**Dónde se ve.** El comprador teclea su código al confirmar el pedido, bajo «¿Tienes un código de promoción?». Si no se aplica, la pantalla le responde con un aviso titulado «Ese código no se aplicó» y le dice cuál de los ocho motivos fue, con esas palabras y no con un «no se pudo». Los ocho son alcanzables con las promociones que la maqueta trae puestas, y la sección 13 de `TOUNO_STRUC.md` dice cuál dispara cada uno.

### El premio por reputación

La sección 12 de `TOUNO_STRUC.md` promete que la cifra de cumplimiento del comprador es la base de las promociones, y que **miran su constancia y no su gasto**. Aquí se cumple.

Una promoción puede pedir un mínimo de reputación. Quien lo cumple, la usa; quien no, ve el motivo escrito, y el motivo dice que se sube cumpliendo y no gastando. La cifra se lee **en el momento en que el comprador teclea el código**, no queda escrita en ninguna parte, así que sube y baja con su conducta y nada hay que migrar.

**Sigue siendo cierto que la cifra de un comprador no la ve nadie más que él.** El negocio ve cuántas veces se usó su promoción, nunca quién la usó ni con qué cifra.

**Dónde se ve.** Rosa Villca, la compradora de la maqueta, tiene 96 % de cumplimiento, y ese número está puesto a propósito para partir en dos las promociones que piden reputación: a una le alcanza y la otra le responde que pide más de la que tiene. Lo que pide cada una aparece en su ficha, en el panel de la empresa, como **Pide de reputación**.

---

## 3. La contraparte del rider

**Ninguna promoción toca lo que cobra un rider.** Su fija, su distancia y su recargo por clima se calculan exactamente igual con promoción y sin ella. No es una promesa: es cómo está construido el cálculo, y hay una prueba que falla si alguna vez deja de ser cierto.

Dicho eso, hay un caso real que hay que resolver bien. Cuando un negocio lanza una promoción fuerte le entra mucho más volumen, y quiere mover ese volumen sin que le cueste lo mismo por carrera. La tentación evidente sería pagarle menos al rider. **Eso no se puede**, porque Touno fija una fija mínima por clase de trabajo y nada baja de ahí.

Lo que sí se puede es que **el negocio renuncie a parte de su propia subida voluntaria** y compense por otro lado. Una promoción puede llevar entonces una pata de rider, con tres cifras:

| Cifra                       | Qué es                                                                 |
| --------------------------- | ---------------------------------------------------------------------- |
| **La fija de la promoción** | Lo que se paga por carrera mientras dure. Nunca baja del piso de Touno |
| **El bono**                 | Lo que se suma al llegar a un número de carreras                       |
| **El mínimo garantizado**   | Lo que se lleva aunque el volumen nunca llegue                         |

**Lo que hace aceptable la oferta no es ninguna de las tres cifras por separado, es que el rider las vea juntas y antes de aceptar.** La pantalla le muestra la cuenta completa: lo que haría con su tarifa de siempre, lo que hace con la promoción si llega al bono, y lo que se lleva si no llega. Sin esa comparación, «acepta menos por carrera» es una trampa; con ella, es una oferta que puede evaluar.

Un ejemplo con las cifras que hay puestas hoy. Un rider al que la empresa le paga Bs 16 por carrera acepta una promoción de Bs 13, con bono de Bs 200 a las 20 carreras y garantía de Bs 280:

- **Si hace 5 carreras**: con su tarifa haría Bs 80, con la promoción Bs 65, y se lleva Bs 280 porque la garantía lo levanta.
- **Si hace 20 carreras**: con su tarifa haría Bs 320, y con la promoción Bs 460.
- **Si hace 30 carreras**: con su tarifa haría Bs 480, y con la promoción Bs 590.

En los tres casos gana más que sin la promoción, y en el peor de todos es la garantía la que lo protege. Ése es el trato, y está escrito para que se pueda comprobar.

**Dónde se ve.** Una promoción con pata de rider se abre en Promociones, Para riders, y su ficha es la única pantalla que pone las tres cifras al lado de lo que ese rider ya cobra: tres tarjetas con **La fija de la promoción** (que lleva debajo su tarifa de siempre contigo), el **Bono** y el **Mínimo garantizado**, y una tabla de cuatro columnas, **Si hace**, **Con su tarifa de siempre**, **Con la promoción** y **Se lleva**. **Las tres cuentas de arriba son exactamente sus tres filas**, porque la tabla marca la cuarta parte del bono, el bono y treinta carreras. La lista del gerente de sucursal enseña las mismas tres cifras, pero sólo para leerlas.

**Y la pata puede ir sola.** Una promoción no está obligada a descontarle al comprador: el negocio puede escribir uno de estos tratos sin tocar el precio de nada, para mover volumen en una franja floja sin regalar margen. El comprador paga lo de siempre y no se entera, salvo que teclee ese código, y entonces la pantalla le dice exactamente eso. Al escribir una promoción eliges primero para quién es, y sólo entonces te pide las cifras de esa mitad.

---

## 4. El destacado en el escaparate

Un plan puede darte **ranuras de destacado**: aparecer señalado en Restaurantes y en Tiendas, en una franja propia por encima de la lista.

**Un destacado no adelanta a nadie por mérito.** El orden del escaparate lo sigue fijando la reputación, exactamente igual que antes, y el destacado va en una franja aparte y rotulada como tal. Si el dinero pudiera comprar el primer lugar de la lista por mérito, la sección 12 de `TOUNO_STRUC.md` dejaría de ser cierta, y preferimos vender menos que eso.

**Una sucursal por debajo del piso de reputación no puede comprar un destacado.** El piso rige para esto igual que para reclutar.

**Dónde se ve.** En Restaurantes y en Tiendas, en una franja rotulada **Destacado** por encima de la lista, que sigue ordenada por reputación.

---

## 5. Los planes

### Qué cambia entre uno y otro

| Plan       | Al mes | Promociones encendidas | Destacados | Pata de rider |
| ---------- | ------ | ---------------------- | ---------- | ------------- |
| **Básico** | Bs 0   | 1                      | ninguno    | no            |
| **Plus**   | Bs 149 | 5                      | 1          | no            |
| **Marca**  | Bs 399 | sin tope               | 3          | sí            |

**Todo lo demás es igual en los tres.** El catálogo, los precios por sucursal, el reclutamiento, las finanzas, la reputación, el mapa, el chat y el código del pedido no dependen del plan y no van a depender nunca. Un plan vende capacidad nueva, jamás recorta algo que ya estaba.

**Dónde se ve.** Tu plan y cuántas promociones te admite encendidas están arriba de Promociones, en una tarjeta **Tu plan** y en otra que cuenta las que tienes **Corriendo**. El tope no es un aviso: si intentas encender una de más, o escribir una pata de rider sin el plan que la da, la maqueta se niega y te dice por qué.

### Por qué la comisión no baja con el plan

Es la pregunta que hace todo el mundo, y la respuesta tiene números.

Si un plan de Bs 149 al mes bajara la comisión del 15 % al 13 %, a Touno le convendría solamente mientras la empresa vendiera **menos de Bs 7.450 al mes**. Por encima de esa cifra, los dos puntos de comisión que deja de cobrar valen más que la cuota que cobra.

El problema es quién compraría ese plan. Con las liquidaciones que hay hoy, **la sucursal más chica de la red vende seis veces y media esa cifra**. O sea: lo comprarían todas las empresas, y con todas Touno perdería dinero. Un plan que solamente le conviene a quien no lo va a comprar no es un plan, es un error de diseño.

Así que los planes venden capacidad y no descuento de comisión. **Es más honesto y además es lo único que se sostiene.**

_(Aquí también queremos tu opinión, y en particular sobre los precios: ¿Bs 149 y Bs 399 te parecen razonables por lo que dan? ¿Preferirías pagar por destacado suelto en vez de por plan?)_

---

## 6. Qué no hace Touno todavía, en materia de dinero

- **No se cobra nada de verdad.** Ni la comisión, ni los planes, ni los destacados. El dinero se calcula y se muestra completo, pero no hay pasarela de pago todavía.
- **No hay suscripción para el comprador.** No hay una cuota mensual que le dé envío gratis.
- **No hay promociones de dos por uno ni combos armados.** Los tres tipos de descuento de arriba son todo lo que hay, y un dos por uno hay que expresarlo como un porcentaje.
- **No hay promociones programadas.** Se encienden y se apagan a mano.
- **Una promoción vale para toda la empresa**, no se puede limitar a una sucursal ni a un artículo.
- **No hay referidos, ni puntos, ni cashback.** Y puntos no va a haber: Touno mide cumplimiento, no acumulación.
- **El destacado no se cobra por separado ni se subasta.** Viene con el plan, en ranuras contadas.

---

## 7. Cómo dejar una observación

Lo mismo que en la sección 15 de `TOUNO_STRUC.md`: dilo con el caso concreto y con la cifra. Las frases que más nos sirven son de esta forma:

- «El 15 % me parece mucho, y la competencia cobra tanto.»
- «No voy a dar un descuento si la comisión se sigue calculando sobre el precio entero.»
- «Como rider, esta cuenta no me convence, y ésta es la cifra que sí.»
- «Bs 399 por el plan Marca es caro para lo que da, y lo que me faltaría es esto.»
- «Prefiero pagar por aparecer destacado una semana que por un plan mensual.»
