# TeamBuilder RPG - Documento de Diseño

Este documento describe el diseño general del juego TeamBuilder RPG.

## Propósito de esta carpeta (`german`)

Esta carpeta, anteriormente `lore`, ahora llamada `german`, contiene la "base de datos" del juego en formato Markdown. La idea es que esta carpeta sirva como una fuente de verdad legible para humanos sobre los datos del juego (clases, objetos, etc.), y que pueda ser fácilmente actualizada por un agente de IA o un humano.

La subcarpeta `databasedea` contiene los siguientes archivos, que se actualizan a partir del código fuente en `src/core`:

- `clases.md`: Describe las clases de personajes disponibles.
- `estados.md`: Define los diferentes estados que pueden afectar a un personaje.
- `habilidades.md`: Lista las habilidades activas del juego.
- `objetos.md`: Contiene información sobre los objetos.
- `pasivas.md`: Describe las habilidades pasivas.
- `funciones_y_variables.md`: Un índice de funciones y variables importantes en el código.

## Atributos base del personaje
- **vida (HP)**: si llega a 0, el personaje muere.
- **escudo (SHIELD)**: absorbe daño antes de la vida. Al agotarse, el daño pasa a vida.
- **ataque (ATK)**: daño directo que se resta a escudo o vida.
- **velocidad (SPD)**: determina orden de turnos (quién ataca primero).

Reglas de daño: daño impacta primero en escudo hasta 0; el remanente va a vida.

## Clases, habilidades activas y objetos
- **clases**: determinan sprite/imágenes y orientan estadísticas.
- **habilidades activas**: lista de habilidades activas disponibles para los personajes.
- **objetos**: equipables/consumibles que los personajes pueden usar.

La información detallada de clases, habilidades activas y objetos se encuentra en los archivos markdown correspondientes en la carpeta `databasedea`.

## Generación de personajes
- Una sola función `generateCharacter(options)` crea personajes en distintos contextos.
- Compatible con personajes sin habilidades activas/objetos/clase.
- Atributos se pueden derivar de clase o de valores base + aleatoriedad controlada.

## Primera interacción del usuario (UX)
1) Mostrar 3 opciones aleatorias de personaje, repetir este ciclo 3 veces (3 elecciones).
2) Usuario elige 1 de las 3 en cada ciclo → se agrega al equipo aliado.
3) Generar oponentes para la grilla rival automáticamente.

## Campo de batalla
- Dos grillas de 8 contenedores (aliados y rivales).
- Representación mínima: índice 0..7 por lado.
- Orden de turno según SPD; resolver daño según ATK → SHIELD/HP.

## Inventario y economía
- **Inventario**: máximo 12 personajes.
- **Tienda**: compra personajes con oro.
- **Venta**: vender personajes por oro.
- **Recompensa**: ganar peleas otorga oro y posibilidad de agregar un personaje nuevo.

## Pendientes de diseño
- Definir tablas de crecimiento por clase (cuando apliquen).
- Balanceo de valores base y rangos aleatorios.

---
Notas originales del autor:
Te explico el juego, los personajes tienen vida, escudo, ataque y velocidad como atributos. Si la vida llega a 0 el peronaje muere, el escudo es una barra de vida que bloquea el daño que te hagan cuando te quedas sin escudo te empieza a bajar la vida, el ataque es el valor directo que le baja a la barra de vida o escudo y la velocidad dicta quien ataca primero. A parte quiero que los personajes tengan clases, habilidades activas y capacidad de guardar objetos. Las clases son para definir que imagen te toca y las habilidades activas y aprox las estadisticas. Quiero crear una amplia gama de habilidades activas y objetos, luego te copiare y pegare un excel con todas las ideas. Por el momento pueden estar vacios porque el juego tiene que ser compatible con un personaje sin habilidades activas ni objetos y la clase por el momento no va afectar pero si quiero que este la base para trabajar por encima. Hay varias situaciones en las que quiero crear un personaje y creo que una mimsa funcion para generarlos seria suficiente. Quiero que la primera interaccion del usuario sea elegir un personaje entre tres generados aleatoriamente tres veces. Luego esos personajes deberian aparecer en el campo de batalla de la parte del aliado y se deberian generar en los espacios de la parte del rival otros personajes. Cuando se gana se te regala el agregar un personaje nuevo y tambien en la tienda se deberia poder comprar personajes. El campo de batalla son dos grid de 8 contenedores donde guardas a tu equipo, quiero que haya un limite en los personajes que podes tener en el inventario asi que no pueden ser mas de 12. Para eso se debe poder vender los personajes en un precio en oro, mismo oro con el que compras en la tienda y que te dan teras ganar peleas